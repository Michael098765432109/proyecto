// delete-user-edge-supabase.ts
// Edge Function para Supabase (Deno) que borra los datos del usuario y su cuenta auth.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Borrar filas en tablas relacionadas
    const relatedTables = ['food_logs', 'compliance_logs', 'meta_logs']
    for (const table of relatedTables) {
      const { error } = await supabaseAdmin.from(table).delete().eq('user_id', uid)
      if (error) console.warn(`No se pudieron borrar filas en ${table}:`, error.message)
    }

    // Borrar cuenta de usuario en Supabase Auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(uid)
    if (deleteUserError) {
      return new Response(JSON.stringify({ error: deleteUserError.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Usuario y datos eliminados correctamente' }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}