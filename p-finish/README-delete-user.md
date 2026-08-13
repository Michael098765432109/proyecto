Instrucciones para eliminar cuentas totalmente (Supabase)

Resumen:
- El SDK cliente `anon` no puede borrar usuarios en `auth.users`.
- Para eliminar la cuenta totalmente debes: 1) borrar datos relacionales; 2) borrar el usuario en `auth` con la `SERVICE_ROLE` key desde un endpoint seguro.

Pasos recomendados:

1) Crear la RPC en la DB (opcional)
   - Ya hay un script en `delete_user_account.sql` que borra filas usando `auth.uid()`.
   - Ejecuta ese SQL en Supabase SQL editor para crear la función.

2) Desplegar un endpoint seguro (Edge Function o serverless) que use la `SERVICE_ROLE` key.
   - Ejemplo incluido: `delete-user-edge-example.js`.
   - Variables de entorno necesarias:
     - `SUPABASE_URL` (p. ej. https://xyz.supabase.co)
     - `SUPABASE_SERVICE_ROLE_KEY` (service_role key desde Settings > API)

3) Flujo cliente (ya integrado parcialmente en `p-finish/usuario.js`):
   - El cliente llama la RPC `delete_user_account` para borrar datos en tablas (si existe).
   - El cliente envía `Authorization: Bearer <access_token>` a tu endpoint seguro para que éste valide
     el token, obtenga el `user.id` y llame a `supabaseAdmin.auth.admin.deleteUser(uid)`.
   - Finalmente el cliente cierra la sesión local y limpia `localStorage`.

Seguridad y buenas prácticas:
- Nunca incluyas la `SERVICE_ROLE` key en código cliente ni en repositorios públicos.
- Protege el endpoint con medidas adicionales si lo deseas (por ejemplo, rate limiting, verificación extra).
- Loguea errores en el servidor, no en el cliente.

Despliegue rápido en Vercel (opcional):
- Crear un nuevo proyecto, subir `delete-user-edge-example.js`, configurar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en Environment Variables.
- Desplegar; la ruta será `https://<tu-project>.vercel.app/api/delete-user`.

Actualizar `p-finish/usuario.js`:
- Poner la URL pública del endpoint en `DELETE_USER_EDGE_URL`.
- El cliente hará la llamada automáticamente si la variable está configurada.

Si quieres, despliego el ejemplo como función (ajusto rutas y export para Vercel/Netlify/Cloud Run) y actualizo `DELETE_USER_EDGE_URL` temporalmente con una URL de ejemplo.