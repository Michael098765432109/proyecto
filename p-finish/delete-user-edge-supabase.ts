// delete-user-edge-supabase.ts
// Edge Function para Supabase (Deno) que borra los datos del usuario y su cuenta auth.
// Despliegue recomendado usando Supabase Functions (CLI).

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en variables de entorno')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req: Request) {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.split(' ')[1]
    if (!token) return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 })

    // Validar token y obtener usuario
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Token inválido o usuario no encontrado' }), { status: 401 })
    }

    const uid = userData.user.id

    // Borrar filas en tablas relacionadas (ajusta según tu esquema)
    const relatedTables = ['food_logs', 'compliance_logs', 'meta_logs']
    for (const table of relatedTables) {
      const { error } = await supabaseAdmin.from(table).delete().eq('user_id', uid)
      if (error) console.warn(`No se pudieron borrar filas en ${table}:`, error.message)
    }

    // Si tienes alguna RPC adicional que quieras llamar, aquí podrías hacerlo
    // await supabaseAdmin.rpc('delete_user_account_by_id', { uid })

    // Borrar el usuario en auth (requiere service_role)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid)
    if (deleteError) {
      console.error('Error borrando auth user:', deleteError.message)
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('Error en delete-user function:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
