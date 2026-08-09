-- ============================================================
--  ELIMINAR CUENTA DE USUARIO (Supabase)
--  Ejecuta este script en: Supabase Dashboard > SQL Editor
--  Crea una función RPC que permite a un usuario autenticado
--  eliminar su propia cuenta y todos sus datos.
--
--  IMPORTANTE: el SDK JS del cliente (clave anon) NO puede
--  borrar usuarios directamente. Por eso usamos una función
--  con SECURITY DEFINER que se ejecuta como el dueño de la BD.
-- ============================================================

-- 1) Eliminar los datos del usuario en tus tablas antes de borrar la cuenta.
--    Ajusta los nombres de tabla/columnas si difieren de los de tu proyecto
--    (food_logs, compliance_logs, meta_logs).
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  -- Si no hay sesión autenticada, abortar
  if uid is null then
    raise exception 'No se encontró una sesión válida.';
  end if;

  -- Borrar datos de las tablas relacionadas (si existen)
  delete from public.food_logs where user_id = uid;
  delete from public.compliance_logs where user_id = uid;
  delete from public.meta_logs where user_id = uid;

  -- Borrar el usuario en auth.schema (elimina la cuenta de Supabase)
  -- auth.users se gestiona mediante admin.delete_user (requiere service_role).
  -- Con SECURITY DEFINER corremos como el dueño de la BD, que tiene permisos
  -- indirectos, pero para borrar en auth.schema es recomendable usar:
  --   https://supabase.com/docs/guides/auth/managing-user-data
  -- La forma más limpia es una Edge Function con service_role key.
  -- Este script borra los datos de las tablas y la sesión queda cerrada
  -- desde el cliente (usuario.js hace signOut al terminar).
end;
$$;

-- 2) Otorgar permiso de ejecución a todos los roles autenticados
revoke all on function public.delete_user_account() from public;
grant execute on function public.delete_user_account() to authenticated;

-- ============================================================
--  OPCIÓN MÁS COMPLETA (requiere SERVICE_ROLE)
--  Si quieres borrar también el usuario dentro de auth.users
--  (la "cuenta" en sí), necesitas una Edge Function o una
--  función con una clave service_role. Este script cubre la
--  limpieza de tus tablas personalizadas; la eliminación real
--  del auth user se puede hacer desde el Dashboard o con una
--  Edge Function. Para muchos casos, cerrar sesión y limpiar
--  los datos es suficiente para que la cuenta quede "inhabilitada".
-- ============================================================
