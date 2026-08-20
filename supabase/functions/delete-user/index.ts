import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

Deno.serve(async (req) => {
  // Manejar solicitudes preflight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405)
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(
        { error: 'Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Supabase' },
        500
      )
    }

    // Extraer y validar el token JWT del usuario
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim()

    if (!token) {
      return jsonResponse({ error: 'No se proporcionó token de autorización' }, 401)
    }

    // Cliente administrador con service_role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    // Obtener información del usuario autenticado
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      return jsonResponse({ error: 'Token inválido o expirado: ' + (userError?.message || '') }, 401)
    }

    const userId = user.id

    // 1. Limpieza de tablas vinculadas al usuario
    const tables = ['food_logs', 'compliance_logs', 'meta_logs', 'profiles', 'user_settings']
    
    for (const table of tables) {
      const { error: dbError } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', userId)

      if (dbError) {
        console.warn(`Aviso al limpiar tabla ${table}: ${dbError.message}`)
      }
    }

    // 2. Eliminar cuenta en Supabase Auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteUserError) {
      return jsonResponse({ error: 'Error al eliminar usuario en Auth: ' + deleteUserError.message }, 500)
    }

    return jsonResponse({ success: true, message: 'Usuario eliminado correctamente' }, 200)

  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Error interno en el servidor' }, 500)
  }
})