# Plan de implementación

- [x] 1. Analizar estructura del proyecto (lectura de archivos relevantes)
- [x] 2. Crear `p-finish/usuario.js` (lógica de carga de datos del usuario)
- [x] 3. Crear `p-finish/usuario.html` (página de perfil con tema)
- [x] 4. Editar `p-finish/index.html` (agregar botón "Mi cuenta" debajo de Cerrar sesión)
- [x] 5. Probar el flujo (abrir lobby, hacer clic en "Mi cuenta")
- [x] 6. Añadir selector de avatar/logotipo para el usuario (usuario.js + usuario.html)
- [x] 7. Mover avatar + creación de nombre de usuario a un modal ordenado (botón "Personalizar perfil")
- [x] 8. Guardar nombre de usuario (nametag) y avatar en la cuenta de Supabase (user_metadata)
- [x] 9. Mover el cambio de tema a "Mi cuenta" como switch on/off (usuario.html + usuario.js)
- [x] 10. Eliminar el botón de tema de la página de login (index.html raíz)
- [x] 11. Reordenar botones del lobby: "Cerrar sesión" arriba, "Mi cuenta" debajo (p-finish/index.html)
- [x] 12. Verificación por correo obligatoria al crear cuenta (login.js): sin auto-login, mensaje de verificación + botón reenviar correo
- [x] 13. (Configuración de Supabase) Activar "Confirm email" en Authentication para que el correo de verificación funcione
- [x] 14. Añadir sección "Zona de peligro" con botón "Eliminar mi cuenta" en usuario.html/usuario.js (modal de confirmación + limpieza local + cierre de sesión)
- [x] 15. Crear `delete_user_account.sql` (función RPC para eliminar datos del usuario en Supabase)
