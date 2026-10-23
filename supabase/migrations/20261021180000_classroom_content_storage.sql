alter table public.classes
  add column if not exists description text not null default ''
  check (char_length(description) <= 2000);

alter table public.class_enrollments
  add column if not exists class_description text not null default ''
  check (char_length(class_description) <= 2000);

create or replace function public.join_class_by_code(
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
    class_description,
    subject,
    code,
    teacher_id
  )
  values (
    matching_class.id,
    active_user_id,
    matching_class.name,
    matching_class.description,
    matching_class.subject,
    matching_class.code,
    matching_class.teacher_id
  )
  on conflict (class_id, student_id) do update
    set class_name = excluded.class_name,
        class_description = excluded.class_description,
        subject = excluded.subject,
        code = excluded.code,
        teacher_id = excluded.teacher_id;

  return jsonb_build_object(
    'class_id', matching_class.id,
    'class_name', matching_class.name,
    'class_description', matching_class.description,
    'subject', matching_class.subject,
    'code', matching_class.code,
    'teacher_id', matching_class.teacher_id
  );
end;
$$;

alter table public.class_resources
  add column if not exists content_type text not null default 'text'
  check (content_type in ('text', 'link', 'file'));
alter table public.class_resources
  add column if not exists file_path text;
alter table public.class_resources
  add column if not exists file_name text;
alter table public.class_resources
  add column if not exists file_type text;
alter table public.class_resources
  add column if not exists file_size bigint;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'class_resources_file_metadata_complete'
      and conrelid = 'public.class_resources'::regclass
  ) then
    alter table public.class_resources
      add constraint class_resources_file_metadata_complete
      check (
        (content_type = 'file'
          and file_path is not null
          and file_name is not null
          and file_type is not null
          and file_size between 1 and 5242880)
        or
        (content_type <> 'file'
          and file_path is null
          and file_name is null
          and file_type is null
          and file_size is null)
      );
  end if;
end;
$$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'class-resources',
  'class-resources',
  false,
  5242880,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "class members and teacher read class files"
  on storage.objects;
create policy "class members and teacher read class files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'class-resources'
    and (
      private.owns_class(((storage.foldername(name))[1])::uuid)
      or private.is_class_member(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "teachers upload own class files"
  on storage.objects;
create policy "teachers upload own class files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'class-resources'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and private.owns_class(((storage.foldername(name))[1])::uuid)
    and exists (
      select 1
      from public.classes
      where id = ((storage.foldername(name))[1])::uuid
        and teacher_id = (select auth.uid())
        and archived = false
    )
  );

drop policy if exists "teachers delete own class files"
  on storage.objects;
create policy "teachers delete own class files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'class-resources'
    and private.owns_class(((storage.foldername(name))[1])::uuid)
    and exists (
      select 1
      from public.classes
      where id = ((storage.foldername(name))[1])::uuid
        and teacher_id = (select auth.uid())
        and archived = false
    )
  );

drop policy if exists "teachers_manage_own_class_resources"
  on public.class_resources;
create policy "teachers_manage_own_class_resources"
  on public.class_resources for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and private.owns_class(class_id)
    and exists (
      select 1 from public.classes
      where id = class_id and archived = false
    )
  );

drop policy if exists "teachers_update_own_class_resources"
  on public.class_resources;
create policy "teachers_update_own_class_resources"
  on public.class_resources for update to authenticated
  using (
    created_by = (select auth.uid())
    and private.owns_class(class_id)
    and exists (
      select 1 from public.classes
      where id = class_id and archived = false
    )
  )
  with check (
    created_by = (select auth.uid())
    and private.owns_class(class_id)
    and exists (
      select 1 from public.classes
      where id = class_id and archived = false
    )
  );

drop policy if exists "teachers_delete_own_class_resources"
  on public.class_resources;
create policy "teachers_delete_own_class_resources"
  on public.class_resources for delete to authenticated
  using (
    private.owns_class(class_id)
    and exists (
      select 1 from public.classes
      where id = class_id and archived = false
    )
  );
