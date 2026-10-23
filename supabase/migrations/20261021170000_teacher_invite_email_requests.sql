alter table private.teacher_invites
  add column if not exists invite_email text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'teacher_invites_email_normalized'
      and conrelid = 'private.teacher_invites'::regclass
  ) then
    alter table private.teacher_invites
      add constraint teacher_invites_email_normalized
      check (invite_email is null or invite_email = lower(trim(invite_email)));
  end if;
end;
$$;

create table if not exists private.teacher_invite_requests (
  email text not null,
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  invite_code text not null unique,
  requested_at timestamptz not null default now()
);

create index if not exists teacher_invite_requests_email_time_idx
  on private.teacher_invite_requests (email, requested_at desc);
create index if not exists teacher_invite_requests_ip_time_idx
  on private.teacher_invite_requests (ip_hash, requested_at desc);

alter table private.teacher_invite_requests enable row level security;
revoke all on table private.teacher_invite_requests from public, anon, authenticated;

create or replace function public.issue_teacher_invite(
  input_email text,
  input_ip_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(coalesce(input_email, '')));
  generated_code text;
begin
  if char_length(normalized_email) > 254
    or normalized_email = ''
    or position('@' in normalized_email) < 2
    or position('.' in split_part(normalized_email, '@', 2)) < 2
    or coalesce(input_ip_hash, '') !~ '^[0-9a-f]{64}$'
  then
    raise exception 'Solicitud de invitación inválida.'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(684294173);

  delete from private.teacher_invite_requests
    where requested_at < now() - interval '2 days';

  if exists (
    select 1
    from private.teacher_invite_requests
    where email = normalized_email
      and requested_at > now() - interval '1 hour'
  ) or (
    select count(*)
    from private.teacher_invite_requests
    where ip_hash = input_ip_hash
      and requested_at > now() - interval '1 hour'
  ) >= 5 or (
    select count(*)
    from private.teacher_invite_requests
    where ip_hash = input_ip_hash
      and requested_at > now() - interval '1 day'
  ) >= 20 then
    return null;
  end if;

  generated_code := replace(gen_random_uuid()::text, '-', '');

  insert into private.teacher_invite_requests (email, ip_hash, invite_code)
  values (normalized_email, input_ip_hash, generated_code);

  insert into private.teacher_invites (code, invite_email, expires_at)
  values (
    generated_code,
    normalized_email,
    now() + interval '24 hours'
  );

  return generated_code;
end;
$$;

revoke all on function public.issue_teacher_invite(text, text)
  from public, anon, authenticated;
grant execute on function public.issue_teacher_invite(text, text)
  to service_role;

create or replace function public.cancel_unsent_teacher_invite(input_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  canceled_code text;
begin
  delete from private.teacher_invites
    where code = lower(trim(coalesce(input_code, '')))
      and redeemed_by is null
      and redeemed_at is null
    returning code into canceled_code;

  if canceled_code is null then
    return false;
  end if;

  delete from private.teacher_invite_requests
    where invite_code = canceled_code;
  return true;
end;
$$;

revoke all on function public.cancel_unsent_teacher_invite(text)
  from public, anon, authenticated;
grant execute on function public.cancel_unsent_teacher_invite(text)
  to service_role;

create or replace function public.create_lumora_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  invite_code text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'requested_role', 'student');

  if requested_role = 'teacher' then
    invite_code := lower(trim(coalesce(
      new.raw_user_meta_data ->> 'teacher_invite_code',
      ''
    )));

    update private.teacher_invites
      set redeemed_by = new.id,
          redeemed_at = now()
      where code = invite_code
        and (
          invite_email is null
          or invite_email = lower(trim(new.email))
        )
        and redeemed_by is null
        and redeemed_at is null
        and expires_at > now();

    if not found then
      raise exception 'La invitación docente no es válida, venció o ya fue utilizada.'
        using errcode = '22023';
    end if;
  end if;

  insert into public.profiles (
    id,
    email,
    display_name,
    role,
    institution,
    country_city
  )
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'display_name', 'Estudiante'), 80),
    case when requested_role = 'teacher'
      then 'teacher'::public.lumora_role
      else 'student'::public.lumora_role
    end,
    case when requested_role = 'teacher'
      then left(coalesce(new.raw_user_meta_data ->> 'institution', ''), 120)
      else ''
    end,
    case when requested_role = 'teacher'
      then left(coalesce(new.raw_user_meta_data ->> 'country_city', ''), 100)
      else ''
    end
  );

  return new;
end;
$$;

create or replace function public.activate_pending_teacher_with_invite(
  input_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_user_id uuid := auth.uid();
  active_user_email text;
begin
  if active_user_id is null then
    raise exception 'Debes iniciar sesión para activar el perfil docente.'
      using errcode = '42501';
  end if;

  select lower(trim(email))
    into active_user_email
    from auth.users
    where id = active_user_id;

  update private.teacher_invites
    set redeemed_by = active_user_id,
        redeemed_at = now()
    where code = lower(trim(coalesce(input_code, '')))
      and (invite_email is null or invite_email = active_user_email)
      and redeemed_by is null
      and redeemed_at is null
      and expires_at > now();

  if not found then
    raise exception 'La invitación docente no es válida, venció o ya fue utilizada.'
      using errcode = '22023';
  end if;

  update public.profiles
    set role = 'teacher',
        updated_at = now()
    where id = active_user_id
      and role = 'pending_teacher';

  if not found then
    raise exception 'Solo un perfil docente pendiente puede usar esta invitación.'
      using errcode = '42501';
  end if;
end;
$$;
