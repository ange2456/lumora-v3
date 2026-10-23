create table private.teacher_invites (
  code text primary key check (code ~ '^[0-9a-f]{32}$'),
  expires_at timestamptz not null,
  redeemed_by uuid unique references auth.users (id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  check (redeemed_by is null or redeemed_at is not null)
);

alter table private.teacher_invites enable row level security;
revoke all on table private.teacher_invites from public, anon, authenticated;

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
begin
  if active_user_id is null then
    raise exception 'Debes iniciar sesión para activar el perfil docente.'
      using errcode = '42501';
  end if;

  update private.teacher_invites
    set redeemed_by = active_user_id,
        redeemed_at = now()
    where code = lower(trim(coalesce(input_code, '')))
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

revoke all on function public.create_lumora_profile() from public, anon, authenticated;
revoke all on function public.activate_pending_teacher_with_invite(text)
  from public, anon;
grant execute on function public.activate_pending_teacher_with_invite(text)
  to authenticated;
