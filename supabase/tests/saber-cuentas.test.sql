-- Prueba de la migración 20261023000000_saber_cuentas.sql con psql (sin pgTAP).
-- Cada bloque lanza una excepción si algo no se cumple. Uso: scripts/probar-saber-sql.sh
\set ON_ERROR_STOP on
\set QUIET on
\o /dev/null

create or replace function pg_temp.espera(cond boolean, msg text) returns void language plpgsql as
$$ begin if cond is not true then raise exception 'FALLA: %', msg; end if; end $$;
create or replace function pg_temp.debe_fallar(sentencia text, msg text) returns void language plpgsql as
$$ begin
  begin execute sentencia; exception when others then return; end;
  raise exception 'FALLA (debía fallar): %', msg;
end $$;

-- Cuentas de prueba
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-0000000000a1', 'ana@example.test',
   '{"display_name":"  Ana María Pérez  ","saber_apodo":"Ana","saber_prueba":"saberpro","saber_institucion":"Universidad Demo","saber_ciudad":"Quibdó","saber_grado":"VII semestre","saber_acepta":"true"}'),
  ('00000000-0000-4000-8000-0000000000b2', 'beto@example.test', '{}'),
  ('00000000-0000-4000-8000-0000000000c3', 'raro@example.test',
   jsonb_build_object('display_name', repeat('x', 200), 'saber_apodo', 'z', 'saber_prueba', 'otra', 'saber_institucion', repeat('i', 500), 'saber_acepta', 'no'));

-- 1. El trigger arma el perfil desde el registro
select pg_temp.espera((select nombre = 'Ana María Pérez' and apodo = 'Ana' and prueba = 'saberpro' and institucion = 'Universidad Demo'
  and ciudad = 'Quibdó' and grado = 'VII semestre' and acepto_datos_en is not null
  from public.saber_perfiles where user_id = '00000000-0000-4000-8000-0000000000a1'), 'perfil completo desde el registro');
select pg_temp.espera((select nombre = 'Estudiante' and apodo = 'Estudiante' and prueba = 'saber11' and acepto_datos_en is null
  from public.saber_perfiles where user_id = '00000000-0000-4000-8000-0000000000b2'), 'valores por defecto sin datos');
select pg_temp.espera((select char_length(nombre) = 80 and apodo = 'xxxxxxxxxxxxxxxxxxxxxxxx' and prueba = 'saber11'
  and char_length(institucion) = 120 and acepto_datos_en is null
  from public.saber_perfiles where user_id = '00000000-0000-4000-8000-0000000000c3'), 'recorta, corrige prueba inválida y no marca consentimiento falso');

-- 2. Ana (autenticada): ve y edita lo suyo, no lo de otros
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000a1';

select pg_temp.espera((select count(*) = 1 from public.saber_perfiles), 'Ana ve solo su perfil');
update public.saber_perfiles set ciudad = 'Medellín', apodo = 'Ani' where user_id = '00000000-0000-4000-8000-0000000000a1';
select pg_temp.espera((select ciudad = 'Medellín' and apodo = 'Ani' from public.saber_perfiles), 'Ana edita su perfil');
select pg_temp.debe_fallar($q$update public.saber_perfiles set user_id = '00000000-0000-4000-8000-0000000000b2'$q$, 'no se puede cambiar el dueño');
select pg_temp.debe_fallar($q$update public.saber_perfiles set acepto_datos_en = null$q$, 'no se puede tocar el consentimiento');
select pg_temp.debe_fallar($q$update public.saber_perfiles set apodo = 'x'$q$, 'apodo de 1 letra no pasa');
select pg_temp.debe_fallar($q$insert into public.saber_perfiles (user_id, nombre, apodo) values ('00000000-0000-4000-8000-0000000000a1', 'n', 'nn')$q$, 'no se duplica el perfil');
select pg_temp.debe_fallar($q$insert into public.saber_perfiles (user_id, nombre, apodo) values ('00000000-0000-4000-8000-0000000000b2', 'n', 'nn')$q$, 'no se crea perfil a nombre de otra persona');
select pg_temp.debe_fallar($q$insert into public.saber_perfiles (user_id, nombre, apodo, acepto_datos_en) values ('00000000-0000-4000-8000-0000000000a1', 'n', 'nn', now())$q$, 'el consentimiento no se fija desde el cliente');
select pg_temp.debe_fallar($q$delete from public.saber_perfiles$q$, 'el perfil no se borra desde el cliente');

insert into public.saber_progreso (user_id, estado) values ('00000000-0000-4000-8000-0000000000a1', '{"intentos":[1]}');
select pg_temp.espera((select estado -> 'intentos' ->> 0 = '1' from public.saber_progreso), 'Ana guarda su progreso');
update public.saber_progreso set estado = '{"intentos":[1,2]}';
select pg_temp.espera((select jsonb_array_length(estado -> 'intentos') = 2 from public.saber_progreso), 'Ana actualiza su progreso');
select pg_temp.debe_fallar($q$insert into public.saber_progreso (user_id, estado) values ('00000000-0000-4000-8000-0000000000b2', '{}')$q$, 'no puede escribir progreso de otra persona');
select pg_temp.debe_fallar($q$insert into public.saber_progreso (user_id, estado) values ('00000000-0000-4000-8000-0000000000a1', '[]')$q$, 'el estado debe ser un objeto (y no duplicar fila)');
select pg_temp.debe_fallar($q$update public.saber_progreso set estado = jsonb_build_object('x', repeat('a', 600000))$q$, 'tamaño máximo');
select pg_temp.debe_fallar($q$update public.saber_progreso set user_id = '00000000-0000-4000-8000-0000000000b2'$q$, 'no se puede ceder el progreso');

-- 2b. Una cuenta anterior a la migración (sin perfil) puede crearse el suyo una vez
reset role;
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-4000-8000-0000000000d4', 'vieja@example.test', '{}');
delete from public.saber_perfiles where user_id = '00000000-0000-4000-8000-0000000000d4';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000d4';
insert into public.saber_perfiles (user_id, nombre, apodo, prueba) values ('00000000-0000-4000-8000-0000000000d4', 'Vieja Cuenta', 'Vieja', 'saberpro');
select pg_temp.espera((select count(*) = 1 and bool_and(acepto_datos_en is null) from public.saber_perfiles), 'cuenta sin perfil se crea el suyo, sin consentimiento');
reset role;

-- 3. Beto no ve nada de Ana, y sus cambios no la afectan
reset role;
insert into public.saber_progreso (user_id, estado) values ('00000000-0000-4000-8000-0000000000b2', '{"secreto":true}');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000b2';
select pg_temp.espera((select count(*) = 1 and bool_and(user_id = '00000000-0000-4000-8000-0000000000b2') from public.saber_progreso), 'Beto ve solo su progreso');
select pg_temp.espera((select count(*) = 1 from public.saber_perfiles), 'Beto ve solo su perfil');
update public.saber_progreso set estado = '{"x":1}' where user_id = '00000000-0000-4000-8000-0000000000a1';
delete from public.saber_progreso where user_id = '00000000-0000-4000-8000-0000000000a1';
reset role;
select pg_temp.espera((select count(*) = 1 and bool_and((estado -> 'intentos') is not null) from public.saber_progreso where user_id = '00000000-0000-4000-8000-0000000000a1'), 'Beto no pudo cambiar ni borrar lo de Ana');

-- 4. Sin sesión (anon) no hay acceso; borrar lo propio sí se puede
set role anon;
select pg_temp.debe_fallar($q$select * from public.saber_progreso$q$, 'anon no lee progreso');
select pg_temp.debe_fallar($q$select * from public.saber_perfiles$q$, 'anon no lee perfiles');
reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000a1';
delete from public.saber_progreso;
select pg_temp.espera((select count(*) = 0 from public.saber_progreso), 'Ana puede borrar su progreso');
reset role;

-- 5. Borrar la cuenta borra todo, y solo la propia
set role anon;
select pg_temp.debe_fallar($q$select public.saber_borrar_mi_cuenta()$q$, 'sin sesión no se puede borrar una cuenta');
reset role;
insert into public.saber_progreso (user_id, estado) values ('00000000-0000-4000-8000-0000000000a1', '{}');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000a1';
select public.saber_borrar_mi_cuenta();
reset role;
select pg_temp.espera((select count(*) = 0 from auth.users where id = '00000000-0000-4000-8000-0000000000a1'), 'la cuenta se borró');
select pg_temp.espera((select count(*) = 0 from public.saber_perfiles where user_id = '00000000-0000-4000-8000-0000000000a1')
  and (select count(*) = 0 from public.saber_progreso where user_id = '00000000-0000-4000-8000-0000000000a1'), 'al borrar la cuenta se borra el perfil y el progreso');
select pg_temp.espera((select count(*) = 1 from auth.users where id = '00000000-0000-4000-8000-0000000000b2'), 'las demás cuentas siguen intactas');

\o
\echo OK: migración Saber verificada
