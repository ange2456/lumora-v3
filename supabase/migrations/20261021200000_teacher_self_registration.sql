create or replace function public.create_lumora_profile()
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

update public.profiles
set role = 'teacher',
    updated_at = now()
where role = 'pending_teacher';

drop function if exists public.activate_pending_teacher_with_invite(text);
