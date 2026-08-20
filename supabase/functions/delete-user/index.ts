import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method Not Allowed' }, 405)

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Faltan variables de entorno de Supabase' }, 500)
  }

  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (!token) return jsonResponse({ error: 'No token provided' }, 401)

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Token inválido o usuario no encontrado' }, 401)
    }

    const userId = userData.user.id
    const relatedTables = ['food_logs', 'compliance_logs', 'meta_logs']
    for (const table of relatedTables) {
      const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId)
      if (error) throw new Error(`No se pudo limpiar ${table}: ${error.message}`)
    }

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteUserError) throw deleteUserError

    return jsonResponse({ ok: true })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return jsonResponse({ error: message }, 500)
  }
}

Deno.serve(handler)