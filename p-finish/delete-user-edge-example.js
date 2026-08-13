// delete-user-edge-example.js
// Ejemplo de endpoint (Node/Express o serverless) que borra la cuenta de
// un usuario en Supabase usando la SERVICE_ROLE key.
// Requisitos:
// - Poner SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en variables de entorno.
// - El cliente envía el header Authorization: Bearer <access_token>

import express from 'express'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(express.json())

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en env')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app.post('/delete-user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })

    // Validar token y obtener user
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    const uid = userData.user.id

    // Borrar filas en tablas relacionadas (ajusta nombres según tu esquema)
    const relatedTables = ['food_logs', 'compliance_logs', 'meta_logs']
    for (const table of relatedTables) {
      const { error } = await supabaseAdmin.from(table).delete().eq('user_id', uid)
      if (error) console.warn(`No se pudieron borrar filas en ${table}:`, error.message)
    }

    // Opcional: si tienes una función RPC que hace limpieza adicional, puedes llamarla
    // await supabaseAdmin.rpc('delete_user_account_by_id', { uid })

    // Finalmente, borrar el usuario en auth (requiere service_role)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid)
    if (deleteError) {
      console.error('Error borrando auth user:', deleteError.message)
      return res.status(500).json({ error: deleteError.message })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Error en delete-user endpoint:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

// Para despliegue serverless (Vercel), exporta el handler
export default app

// Para ejecutar localmente (desarrollo):
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`Delete-user example listening on ${port}`))
}
