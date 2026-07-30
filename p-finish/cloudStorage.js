import { supabase } from '../supabaseClient.js'

/**
 * cloudStorage.js
 * Capa de almacenamiento cloud usando Supabase.
 * Si el usuario no está autenticado, cae en localStorage silenciosamente.
 * Si falla la conexión, también usa localStorage como respaldo.
 */

// ========================
// UTILIDADES
// ========================

function getUserId() {
  return localStorage.getItem('nutry_current_user_id') || null
}

function getFoodLogKey() {
  const uid = getUserId() || 'anonymous'
  return 'nutry_food_log_' + uid
}

function getComplianceLogKey() {
  const uid = getUserId() || 'anonymous'
  return 'nutry_compliance_log_' + uid
}

function getMetaLogKey() {
  const uid = getUserId() || 'anonymous'
  return 'nutry_meta_log_' + uid
}

// ========================
// COMIDAS (food_logs)
// ========================

/**
 * Guarda un registro de comida. Primero intenta en la nube,
 * si falla o no hay sesión, guarda en localStorage.
 */
export async function guardarComida({ descripcion, calorias, proteinas = 0, carbohidratos = 0, grasas = 0 }) {
  const userId = getUserId()
  const fechaActual = new Date().toISOString()

  // Siempre guardar en localStorage (respaldo local)
  try {
    const key = getFoodLogKey()
    const log = JSON.parse(localStorage.getItem(key) || '[]')
    log.push({
      fecha: fechaActual,
      descripcion: descripcion || '',
      calorias,
      proteinas,
      carbohidratos,
      grasas
    })
    if (log.length > 100) log.splice(0, log.length - 100)
    localStorage.setItem(key, JSON.stringify(log))
  } catch (e) {
    console.warn('Error guardando en localStorage (comida):', e)
  }

  // Intentar guardar en Supabase
  if (!userId) return { ok: true, source: 'local' }

  try {
    const { error } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        fecha: fechaActual, // <-- CORREGIDO: Se envía la fecha a Supabase
        descripcion: descripcion || '',
        calorias,
        proteinas,
        carbohidratos,
        grasas
      })

    if (error) {
      console.warn('Error guardando comida en Supabase:', error.message)
      return { ok: true, source: 'local' }
    }

    return { ok: true, source: 'cloud' }
  } catch (e) {
    console.warn('Error de conexión al guardar comida:', e)
    return { ok: true, source: 'local' }
  }
}

/**
 * Obtiene el historial de comidas.
 * Si hay sesión activa, intenta traer de la nube y combina con local.
 */
export async function obtenerComidas() {
  const userId = getUserId()
  const localKey = getFoodLogKey()
  const localData = JSON.parse(localStorage.getItem(localKey) || '[]')

  if (!userId) return localData

  try {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false })
      .limit(100)

    if (error) {
      console.warn('Error obteniendo comidas de Supabase:', error.message)
      return localData
    }

    if (!data || data.length === 0) return localData

    // Convertir datos de Supabase al formato local
    const cloudData = data.map(item => ({
      fecha: item.fecha,
      descripcion: item.descripcion || '',
      calorias: Number(item.calorias) || 0,
      proteinas: Number(item.proteinas) || 0,
      carbohidratos: Number(item.carbohidratos) || 0,
      grasas: Number(item.grasas) || 0
    }))

    // Combinar: datos cloud + datos locales que no estén en cloud (por fecha)
    const cloudFechas = new Set(cloudData.map(d => new Date(d.fecha).getTime()))
    const localesNoEnCloud = localData.filter(d => !cloudFechas.has(new Date(d.fecha).getTime()))

    const combinado = [...cloudData, ...localesNoEnCloud]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 100)

    // Actualizar localStorage con datos combinados
    localStorage.setItem(localKey, JSON.stringify(combinado))

    return combinado
  } catch (e) {
    console.warn('Error de conexión al obtener comidas:', e)
    return localData
  }
}

// ========================
// CUMPLIMIENTO DIARIO (compliance_logs)
// ========================

/**
 * Guarda el registro de cumplimiento diario (Sí/No/Parcial).
 */
export async function guardarCumplimiento(respuesta) {
  const userId = getUserId()
  const hoy = new Date().toISOString().split('T')[0]
  const key = getComplianceLogKey()

  const entry = {
    fecha: hoy,
    respuesta,
    timestamp: new Date().toISOString()
  }

  // Guardar en localStorage siempre
  try {
    const log = JSON.parse(localStorage.getItem(key) || '[]')
    const idx = log.findIndex(e => e.fecha === hoy)
    if (idx >= 0) log[idx] = entry
    else log.push(entry)
    if (log.length > 365) log.splice(0, log.length - 365)
    localStorage.setItem(key, JSON.stringify(log))
  } catch (e) {
    console.warn('Error guardando cumplimiento en localStorage:', e)
  }

  // Intentar guardar en Supabase
  if (!userId) return { ok: true, source: 'local' }

  try {
    // Upsert: si ya existe registro para hoy, actualiza; si no, inserta
    const { error } = await supabase
      .from('compliance_logs')
      .upsert(
        {
          user_id: userId,
          fecha: hoy,
          respuesta
        },
        { onConflict: 'user_id, fecha' }
      )

    if (error) {
      console.warn('Error guardando cumplimiento en Supabase:', error.message)
      return { ok: true, source: 'local' }
    }

    return { ok: true, source: 'cloud' }
  } catch (e) {
    console.warn('Error de conexión al guardar cumplimiento:', e)
    return { ok: true, source: 'local' }
  }
}

/**
 * Obtiene todos los registros de cumplimiento.
 */
export async function obtenerCumplimientos() {
  const userId = getUserId()
  const localKey = getComplianceLogKey()
  const localData = JSON.parse(localStorage.getItem(localKey) || '[]')

  if (!userId) return localData

  try {
    const { data, error } = await supabase
      .from('compliance_logs')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false })
      .limit(365)

    if (error) {
      console.warn('Error obteniendo cumplimientos de Supabase:', error.message)
      return localData
    }

    if (!data || data.length === 0) return localData

    const cloudData = data.map(item => ({
      fecha: item.fecha,
      respuesta: item.respuesta,
      timestamp: item.timestamp || item.fecha
    }))

    // Combinar datos
    const cloudFechas = new Set(cloudData.map(d => d.fecha))
    const localesNoEnCloud = localData.filter(d => !cloudFechas.has(d.fecha))

    const combinado = [...cloudData, ...localesNoEnCloud]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 365)

    localStorage.setItem(localKey, JSON.stringify(combinado))
    return combinado
  } catch (e) {
    console.warn('Error de conexión al obtener cumplimientos:', e)
    return localData
  }
}

// ========================
// CÁLCULOS METABÓLICOS (meta_logs)
// ========================

/**
 * Guarda un cálculo metabólico en la nube.
 */
export async function guardarCalculoMetabolico({ tipo, datos }) {
  const userId = getUserId()
  const key = getMetaLogKey()

  // Guardar en localStorage
  try {
    const log = JSON.parse(localStorage.getItem(key) || '[]')
    log.push({
      fecha: new Date().toISOString(),
      tipo,
      datos
    })
    if (log.length > 50) log.splice(0, log.length - 50)
    localStorage.setItem(key, JSON.stringify(log))
  } catch (e) {
    console.warn('Error guardando cálculo metabólico en localStorage:', e)
  }

  // Intentar en la nube
  if (!userId) return { ok: true, source: 'local' }

  try {
    const { error } = await supabase
      .from('meta_logs')
      .insert({
        user_id: userId,
        tipo,
        datos
      })

    if (error) {
      console.warn('Error guardando cálculo metabólico en Supabase:', error.message)
      return { ok: true, source: 'local' }
    }

    return { ok: true, source: 'cloud' }
  } catch (e) {
    console.warn('Error de conexión al guardar cálculo metabólico:', e)
    return { ok: true, source: 'local' }
  }
}

/**
 * Obtiene los cálculos metabólicos.
 */
export async function obtenerCalculosMetabolicos() {
  const userId = getUserId()
  const localKey = getMetaLogKey()
  const localData = JSON.parse(localStorage.getItem(localKey) || '[]')

  if (!userId) return localData

  try {
    const { data, error } = await supabase
      .from('meta_logs')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false })
      .limit(50)

    if (error) {
      console.warn('Error obteniendo cálculos metabólicos de Supabase:', error.message)
      return localData
    }

    if (!data || data.length === 0) return localData

    const cloudData = data.map(item => ({
      fecha: item.fecha,
      tipo: item.tipo,
      datos: item.datos
    }))

    const cloudFechas = new Set(cloudData.map(d => new Date(d.fecha).getTime()))
    const localesNoEnCloud = localData.filter(d => !cloudFechas.has(new Date(d.fecha).getTime()))

    const combinado = [...cloudData, ...localesNoEnCloud]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 50)

    localStorage.setItem(localKey, JSON.stringify(combinado))
    return combinado
  } catch (e) {
    console.warn('Error de conexión al obtener cálculos metabólicos:', e)
    return localData
  }
}

// ========================
// SINCRONIZACIÓN MANUAL
// ========================

/**
 * Sincroniza todos los datos locales que no están en la nube.
 * Ideal para llamar después de iniciar sesión.
 */
export async function sincronizarTodo() {
  const userId = getUserId()
  if (!userId) return { ok: false, reason: 'no_session' }

  const resultados = {
    comidas: { subidos: 0, fallidos: 0 },
    cumplimientos: { subidos: 0, fallidos: 0 },
    metas: { subidos: 0, fallidos: 0 }
  }

  // Sincronizar comidas locales que no estén en la nube
  try {
    const localFoodKey = getFoodLogKey()
    const localFood = JSON.parse(localStorage.getItem(localFoodKey) || '[]')

    const { data: cloudFood } = await supabase
      .from('food_logs')
      .select('fecha')
      .eq('user_id', userId)

    const cloudFoodFechas = new Set((cloudFood || []).map(f => new Date(f.fecha).getTime()))

    for (const item of localFood) {
      if (!cloudFoodFechas.has(new Date(item.fecha).getTime())) {
        const { error } = await supabase
          .from('food_logs')
          .insert({
            user_id: userId,
            descripcion: item.descripcion || '',
            calorias: item.calorias || 0,
            proteinas: item.proteinas || 0,
            carbohidratos: item.carbohidratos || 0,
            grasas: item.grasas || 0,
            fecha: item.fecha || new Date().toISOString()
          })

        if (error) resultados.comidas.fallidos++
        else resultados.comidas.subidos++
      }
    }
  } catch (e) {
    console.warn('Error sincronizando comidas:', e)
  }

  // Sincronizar cumplimientos locales
  try {
    const localCompKey = getComplianceLogKey()
    const localComp = JSON.parse(localStorage.getItem(localCompKey) || '[]')

    const { data: cloudComp } = await supabase
      .from('compliance_logs')
      .select('fecha')
      .eq('user_id', userId)

    const cloudCompFechas = new Set((cloudComp || []).map(c => c.fecha))

    for (const item of localComp) {
      if (!cloudCompFechas.has(item.fecha)) {
        const { error } = await supabase
          .from('compliance_logs')
          .insert({
            user_id: userId,
            fecha: item.fecha,
            respuesta: item.respuesta
          })

        if (error) resultados.cumplimientos.fallidos++
        else resultados.cumplimientos.subidos++
      }
    }
  } catch (e) {
    console.warn('Error sincronizando cumplimientos:', e)
  }

  return { ok: true, resultados }
}