-- Lumora · Ruta Saber: perfil de estudiante y progreso por cuenta.
--
-- Es autocontenida: solo necesita Supabase Auth (auth.users). Se puede pegar completa
-- en el editor SQL de Supabase o aplicar con `supabase db push`.
--
-- Qué guarda:
--   saber_perfiles  nombre, apodo, prueba, institución, ciudad y grado (todo lo escribe la persona al registrarse)
--   saber_progreso  el avance (diagnósticos, práctica, actividad) como un JSON, una fila por persona
-- Quién lo ve: cada persona solo su propia fila (RLS). No hay lectura pública ni para otros estudiantes.

create table if not exists public.saber_perfiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  apodo text not null check (char_length(apodo) between 2 and 24),
  prueba text not null default 'saber11' check (prueba in ('saber11', 'saberpro')),
  institucion text not null default '' check (char_length(institucion) <= 120),
  ciudad text not null default '' check (char_length(ciudad) <= 100),
  grado text not null default '' check (char_length(grado) <= 40),
  acepto_datos_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saber_progreso (
  user_id uuid primary key references auth.users (id) on delete cascade,
  estado jsonb not null check (
    jsonb_typeof(estado) = 'object'
    and octet_length(estado::text) <= 500000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at lo pone la base, no el navegador.
create or replace function public.saber_tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists saber_perfiles_updated_at on public.saber_perfiles;
create trigger saber_perfiles_updated_at
  before update on public.saber_perfiles
  for each row execute function public.saber_tocar_updated_at();

drop trigger if exists saber_progreso_updated_at on public.saber_progreso;
create trigger saber_progreso_updated_at
  before update on public.saber_progreso
  for each row execute function public.saber_tocar_updated_at();

-- Al crear la cuenta, el perfil se arma con los datos del formulario de registro
-- (llegan en raw_user_meta_data). Se recorta y se valida aquí: no se confía en el navegador.
create or replace function public.saber_crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_nombre text := left(trim(coalesce(meta ->> 'display_name', '')), 80);
  v_apodo text;
begin
  if v_nombre = '' then
    v_nombre := 'Estudiante';
  end if;

  v_apodo := left(trim(coalesce(meta ->> 'saber_apodo', '')), 24);
  if char_length(v_apodo) < 2 then
    v_apodo := left(split_part(v_nombre, ' ', 1), 24);
  end if;
  if char_length(v_apodo) < 2 then
    v_apodo := 'Estudiante';
  end if;

  insert into public.saber_perfiles (
    user_id, nombre, apodo, prueba, institucion, ciudad, grado, acepto_datos_en
  )
  values (
    new.id,
    v_nombre,
    v_apodo,
    case when meta ->> 'saber_prueba' in ('saber11', 'saberpro') then meta ->> 'saber_prueba' else 'saber11' end,
    left(trim(coalesce(meta ->> 'saber_institucion', '')), 120),
    left(trim(coalesce(meta ->> 'saber_ciudad', '')), 100),
    left(trim(coalesce(meta ->> 'saber_grado', '')), 40),
    case when meta ->> 'saber_acepta' = 'true' then now() else null end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_saber_perfil on auth.users;
create trigger on_auth_user_created_saber_perfil
  after insert on auth.users
  for each row execute function public.saber_crear_perfil();

-- Seguridad: nadie ve nada por defecto; cada persona solo sus filas.
alter table public.saber_perfiles enable row level security;
alter table public.saber_progreso enable row level security;

revoke all on table public.saber_perfiles from anon, authenticated;
revoke all on table public.saber_progreso from anon, authenticated;

grant select on table public.saber_perfiles to authenticated;
-- El perfil lo crea el trigger al registrarse. Si una cuenta es anterior a esta migración y no lo tiene,
-- la app puede crearlo una vez (sin poder fijar el consentimiento). Editar: solo estos campos.
grant insert (user_id, nombre, apodo, prueba, institucion, ciudad, grado) on table public.saber_perfiles to authenticated;
grant update (nombre, apodo, prueba, institucion, ciudad, grado) on table public.saber_perfiles to authenticated;
grant select, insert, update, delete on table public.saber_progreso to authenticated;

drop policy if exists saber_perfiles_ver_propio on public.saber_perfiles;
create policy saber_perfiles_ver_propio on public.saber_perfiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists saber_perfiles_crear_propio on public.saber_perfiles;
create policy saber_perfiles_crear_propio on public.saber_perfiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists saber_perfiles_editar_propio on public.saber_perfiles;
create policy saber_perfiles_editar_propio on public.saber_perfiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists saber_progreso_ver_propio on public.saber_progreso;
create policy saber_progreso_ver_propio on public.saber_progreso
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists saber_progreso_crear_propio on public.saber_progreso;
create policy saber_progreso_crear_propio on public.saber_progreso
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists saber_progreso_editar_propio on public.saber_progreso;
create policy saber_progreso_editar_propio on public.saber_progreso
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists saber_progreso_borrar_propio on public.saber_progreso;
create policy saber_progreso_borrar_propio on public.saber_progreso
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Borrado de cuenta por la propia persona: elimina su usuario y, en cascada, su perfil y su progreso.
create or replace function public.saber_borrar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.' using errcode = '42501';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.saber_borrar_mi_cuenta() from public, anon;
grant execute on function public.saber_borrar_mi_cuenta() to authenticated;
