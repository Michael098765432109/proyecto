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

Despliegue recomendado: Edge Function en Supabase (Deno)

- He incluido `delete-user-edge-supabase.ts` como ejemplo para Supabase Functions.
- Pasos rápidos para desplegar con `supabase` CLI:

   1. Instala y autentica el CLI: https://supabase.com/docs/guides/cli

   2. Crea una nueva función:

```bash
supabase functions new delete-user
```

   3. Copia el contenido de `p-finish/delete-user-edge-supabase.ts` en `functions/delete-user/index.ts` (o `index.ts` según la plantilla).

   4. Añade el secret `SUPABASE_SERVICE_ROLE_KEY` de forma local/remota:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<tu_service_role_key>"
supabase secrets set SUPABASE_URL="https://<your-project>.supabase.co"
```

   5. Deploy:

```bash
supabase functions deploy delete-user --project-ref <tu-ref>
```

   6. Obtén la URL de la función (por ejemplo `https://<project>.functions.supabase.co/delete-user`) y configúrala en `p-finish/usuario.js` asignando `DELETE_USER_EDGE_URL` a esa URL.

Actualizar `p-finish/usuario.js`:
- Poner la URL pública del endpoint (la función desplegada) en la constante `DELETE_USER_EDGE_URL`.
- El cliente enviará el `Authorization: Bearer <access_token>` automáticamente y la función borrará el usuario.

Pruebas:

- Inicia sesión con el usuario que quieras eliminar.
- Ve a `p-finish/usuario.html`, abre "Eliminar cuenta" y escribe exactamente tu email en el campo de confirmación.
- Presiona eliminar; el cliente llamará la RPC (si existe) y luego la función Edge para borrar el `auth.user`.

Comprobación manual alternativa:
- Puedes borrar manualmente el usuario desde el Dashboard: Authentication → Users → borrar el usuario.

Seguridad:
- Nunca subas la `SERVICE_ROLE` key a repositorios públicos.
- Protege la función con límites de acceso adicionales si lo deseas (rate limiting, logging, etc.).

Si quieres, despliego y configuro la función por ti (necesitaría que me indiques si tienes acceso al `supabase` CLI y el `project-ref`, o prefieres las instrucciones paso a paso).