create extension if not exists pgcrypto;
create schema if not exists private;

create type public.lumora_role as enum (
  'student',
  'pending_teacher',
  'teacher'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.lumora_role not null default 'student',
  institution text not null default '' check (char_length(institution) <= 120),
  country_city text not null default '' check (char_length(country_city) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    role <> 'pending_teacher'
    or (char_length(institution) > 0 and char_length(country_city) > 0)
  )
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 70),
  subject text not null check (char_length(subject) between 1 and 80),
  code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{12}$'),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index classes_teacher_created_idx
  on public.classes (teacher_id, created_at);

create table public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_name text not null default 'Estudiante'
    check (char_length(student_name) <= 80),
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table public.class_enrollments (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  class_name text not null,
  subject text not null,
  code text not null,
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create index enrollments_student_joined_idx
  on public.class_enrollments (student_id, joined_at desc);

create table public.class_resources (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  url text not null default '' check (
    char_length(url) <= 1000
    and (url = '' or url ~ '^https://')
  ),
  created_at timestamptz not null default now()
);

create index resources_class_created_idx
  on public.class_resources (class_id, created_at);

create table public.challenge_attempts (
  id uuid primary key,
  student_id uuid not null references public.profiles (id) on delete cascade,
  activity text not null check (char_length(activity) <= 80),
  activity_key text not null check (
    activity_key in ('MATEMÁTICAS', 'PROGRAMACIÓN', 'CIENCIAS', 'LECTURA')
  ),
  completed_at timestamptz not null,
  total_questions integer not null check (total_questions between 1 and 20),
  correct_answers integer not null check (
    correct_answers between 0 and total_questions
  ),
  mistakes integer not null check (mistakes >= 0),
  reinforcement_successes integer not null check (reinforcement_successes >= 0),
  skill_results jsonb not null default '[]'::jsonb check (
    jsonb_typeof(skill_results) = 'array'
    and jsonb_array_length(skill_results) <= 20
  ),
  adapted_skill text not null default '',
  completed boolean not null check (completed),
  student_name text not null default 'Estudiante'
    check (char_length(student_name) <= 80),
  class_id uuid references public.classes (id) on delete set null,
  class_code text check (
    class_code is null or class_code ~ '^[A-HJ-NP-Z2-9]{12}$'
  )
);

create index attempts_student_completed_idx
  on public.challenge_attempts (student_id, completed_at);
create index attempts_class_id_idx
  on public.challenge_attempts (class_id)
  where class_id is not null;

create function public.create_lumora_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'requested_role', 'student');

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
      then 'pending_teacher'::public.lumora_role
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

create trigger on_auth_user_created_create_lumora_profile
  after insert on auth.users
  for each row execute function public.create_lumora_profile();

create function private.is_approved_teacher(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id and role = 'teacher'
  );
$$;

create function private.owns_class(
  target_class_id uuid,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.classes
    where id = target_class_id
      and teacher_id = user_id
      and private.is_approved_teacher(user_id)
  );
$$;

create function private.is_class_member(
  target_class_id uuid,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.class_members
    where class_id = target_class_id and student_id = user_id
  );
$$;

create function public.join_class_by_code(
  input_code text,
  input_student_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_user_id uuid := auth.uid();
  matching_class public.classes%rowtype;
  normalized_student_name text := left(trim(coalesce(input_student_name, '')), 80);
begin
  if active_user_id is null then
    raise exception 'Debes iniciar sesión para unirte a una clase.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = active_user_id and role = 'student'
  ) then
    raise exception 'Solo una cuenta de estudiante puede unirse a una clase.'
      using errcode = '42501';
  end if;

  if normalized_student_name = '' then
    raise exception 'Escribe tu nombre para unirte a una clase.'
      using errcode = '22023';
  end if;

  select *
    into matching_class
    from public.classes
    where code = upper(trim(coalesce(input_code, '')))
      and archived = false;

  if not found then
    raise exception 'No encontramos una clase con ese código.'
      using errcode = 'P0002';
  end if;

  insert into public.class_members (
    class_id, student_id, student_name
  )
  values (
    matching_class.id, active_user_id, normalized_student_name
  )
  on conflict (class_id, student_id) do update
    set student_name = excluded.student_name;

  insert into public.class_enrollments (
    class_id,
    student_id,
    class_name,
    subject,
    code,
    teacher_id
  )
  values (
    matching_class.id,
    active_user_id,
    matching_class.name,
    matching_class.subject,
    matching_class.code,
    matching_class.teacher_id
  )
  on conflict (class_id, student_id) do update
    set class_name = excluded.class_name,
        subject = excluded.subject,
        code = excluded.code,
        teacher_id = excluded.teacher_id;

  return jsonb_build_object(
    'class_id', matching_class.id,
    'class_name', matching_class.name,
    'subject', matching_class.subject,
    'code', matching_class.code,
    'teacher_id', matching_class.teacher_id
  );
end;
$$;

revoke all on function public.create_lumora_profile() from public, anon, authenticated;
revoke all on function private.is_approved_teacher(uuid) from public, anon, authenticated;
revoke all on function private.owns_class(uuid, uuid) from public, anon, authenticated;
revoke all on function private.is_class_member(uuid, uuid) from public, anon, authenticated;
revoke all on function public.join_class_by_code(text, text) from public, anon;
grant execute on function public.join_class_by_code(text, text) to authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_approved_teacher(uuid) to authenticated;
grant execute on function private.owns_class(uuid, uuid) to authenticated;
grant execute on function private.is_class_member(uuid, uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.class_resources enable row level security;
alter table public.challenge_attempts enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.classes from anon, authenticated;
revoke all on table public.class_members from anon, authenticated;
revoke all on table public.class_enrollments from anon, authenticated;
revoke all on table public.class_resources from anon, authenticated;
revoke all on table public.challenge_attempts from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select, insert on table public.classes to authenticated;
grant update (archived) on table public.classes to authenticated;
grant select, delete on table public.class_members to authenticated;
grant select, delete on table public.class_enrollments to authenticated;
grant select, insert, delete on table public.class_resources to authenticated;
grant update (title, description, url) on table public.class_resources to authenticated;
grant select, insert on table public.challenge_attempts to authenticated;

create policy "profiles_read_own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "classes_read_own_or_enrolled"
  on public.classes for select to authenticated
  using (
    teacher_id = (select auth.uid())
    or private.is_class_member(id)
  );

create policy "approved_teachers_create_classes"
  on public.classes for insert to authenticated
  with check (
    teacher_id = (select auth.uid())
    and private.is_approved_teacher((select auth.uid()))
  );

create policy "teachers_update_own_classes"
  on public.classes for update to authenticated
  using (
    teacher_id = (select auth.uid())
    and private.is_approved_teacher((select auth.uid()))
  )
  with check (
    teacher_id = (select auth.uid())
    and private.is_approved_teacher((select auth.uid()))
  );

create policy "class_members_read_own_or_teacher"
  on public.class_members for select to authenticated
  using (
    student_id = (select auth.uid())
    or private.owns_class(class_id)
  );

create policy "students_leave_own_class"
  on public.class_members for delete to authenticated
  using (student_id = (select auth.uid()));

create policy "students_read_own_enrollments"
  on public.class_enrollments for select to authenticated
  using (student_id = (select auth.uid()));

create policy "students_leave_own_enrollment"
  on public.class_enrollments for delete to authenticated
  using (student_id = (select auth.uid()));

create policy "class_resources_read_by_members"
  on public.class_resources for select to authenticated
  using (
    private.owns_class(class_id)
    or private.is_class_member(class_id)
  );

create policy "teachers_manage_own_class_resources"
  on public.class_resources for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and private.owns_class(class_id)
  );

create policy "teachers_update_own_class_resources"
  on public.class_resources for update to authenticated
  using (
    created_by = (select auth.uid())
    and private.owns_class(class_id)
  )
  with check (
    created_by = (select auth.uid())
    and private.owns_class(class_id)
  );

create policy "teachers_delete_own_class_resources"
  on public.class_resources for delete to authenticated
  using (private.owns_class(class_id));

create policy "students_read_own_or_teacher_reads_class_progress"
  on public.challenge_attempts for select to authenticated
  using (
    student_id = (select auth.uid())
    or (
      class_id is not null
      and private.owns_class(class_id)
      and private.is_class_member(class_id, student_id)
    )
  );

create policy "students_insert_own_progress"
  on public.challenge_attempts for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where id = (select auth.uid()) and role = 'student'
    )
    and (
      class_id is null
      or (
        private.is_class_member(class_id)
        and exists (
          select 1
          from public.classes
          where id = class_id
            and code = class_code
        )
      )
    )
  );
