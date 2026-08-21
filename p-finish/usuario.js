// ==========================================
// 1. IMPORTS Y CONFIGURACIÓN
// ==========================================
import { supabase } from '../supabaseClient.js?v=3'

const DELETE_USER_EDGE_URL =
  'https://nkptwdzfzjoyssbfwvlh.supabase.co/functions/v1/delete-user-edge-supabase'

const SUPABASE_ANON_KEY =
  'sb_publishable_0EeFLywIf5yqmqRTT8-V7A_NQKzr9sD'

const THEME_KEY = 'nutry_theme'

// ==========================================
// 2. ESTADO GLOBAL Y CONSTANTES
// ==========================================
let currentUsername = null
let currentAvatar = null

const AVATARS = [
  { emoji: '🥑', label: 'Aguacate' },
  { emoji: '💪', label: 'Músculo' },
  { emoji: '🏋️', label: 'Gimnasio' },
  { emoji: '🍎', label: 'Manzana' },
  { emoji: '🥦', label: 'Brócoli' },
  { emoji: '🐔', label: 'Pollo' },
  { emoji: '🐟', label: 'Pescado' },
  { emoji: '🥛', label: 'Leche' },
  { emoji: '🥚', label: 'Huevo' },
  { emoji: '🔥', label: 'Fuego' },
  { emoji: '⚡', label: 'Rayo' },
  { emoji: '🌱', label: 'Planta' },
  { emoji: '🏃', label: 'Corredor' },
  { emoji: '🧘', label: 'Yoga' },
  { emoji: '🚴', label: 'Ciclista' },
  { emoji: '🏆', label: 'Trofeo' }
]

// ==========================================
// 3. UTILIDADES Y FORMATO
// ==========================================
function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return iso
  }
}

function formatDateShort(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return iso
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getInitial(email) {
  if (!email) return '?'
  return email.trim().charAt(0).toUpperCase()
}

function updateHeaderProfile() {
  const target = document.getElementById('header-profile')
  if (!target) return
  target.textContent = (currentAvatar || '') + (currentUsername ? ' @' + currentUsername : '')
}

// ==========================================
// 4. GESTIÓN DEL TEMA (CLARO / OSCURO)
// ==========================================
function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') root.setAttribute('data-theme', 'light')
  else root.removeAttribute('data-theme')

  const leavesLayer = document.getElementById('leavesLayer')
  if (leavesLayer && theme === 'light' && leavesLayer.dataset.spawned !== '1') {
    leavesLayer.dataset.spawned = '1'
    spawnLeaves()
  }
}

function spawnLeaves() {
  const leavesLayer = document.getElementById('leavesLayer')
  if (!leavesLayer) return
  const leafCount = 28
  for (let i = 0; i < leafCount; i++) {
    const leaf = document.createElement('div')
    leaf.className = 'leaf'
    const x = Math.random() * 100
    const drift = 20 + Math.random() * 60
    leaf.style.setProperty('--leaf-x', x + 'vw')
    leaf.style.setProperty('--leaf-drift', drift + 'px')
    leaf.style.setProperty('--leaf-rot', (Math.random() * 40 - 20) + 'deg')
    leaf.style.setProperty('--leaf-duration', (5 + Math.random() * 6) + 's')
    const size = 14 + Math.random() * 18
    leaf.style.setProperty('--leaf-size', size + 'px')
    leaf.textContent = '🍂'
    leaf.style.fontSize = size + 'px'
    leaf.style.lineHeight = '1'
    leavesLayer.appendChild(leaf)
  }
}

function setupThemeSwitch() {
  const switchEl = document.getElementById('theme-toggle-switch')
  const statusText = document.getElementById('theme-status-text')
  if (!switchEl) return

  const isLight = getCurrentTheme() === 'light'
  switchEl.checked = isLight
  if (statusText) statusText.textContent = isLight ? 'Claro' : 'Oscuro'

  switchEl.addEventListener('change', () => {
    const next = switchEl.checked ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
    if (statusText) statusText.textContent = next === 'light' ? 'Claro' : 'Oscuro'
  })
}

// ==========================================
// 5. RENDERS PRINCIPALES DE LA VISTA
// ==========================================
function showLoading() {
  const container = document.getElementById('profile-content')
  if (!container) return
  container.innerHTML = `
    <div class="text-center py-12">
      <div class="inline-block w-12 h-12 border-4 border-gray-600 rounded-full mb-4" style="border-top-color: var(--accent-emerald); animation: spin 0.8s linear infinite;"></div>
      <p class="text-slate-400">Cargando tu información...</p>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `
}

function showError(message) {
  const container = document.getElementById('profile-content')
  if (!container) return
  container.innerHTML = `
    <div class="bg-card rounded-2xl p-8 text-center">
      <i class="fas fa-exclamation-triangle text-5xl text-red-400 mb-4"></i>
      <h3 class="text-2xl font-bold text-slate-200 mb-2">No se pudo cargar tu información</h3>
      <p class="text-slate-400 mb-6">${escapeHtml(message || 'Ocurrió un error inesperado.')}</p>
      <a href="index.html" class="gradient-button text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center hover:shadow-lg transition-all duration-300">
        <i class="fas fa-home mr-2"></i> Volver al Lobby
      </a>
    </div>
  `
}

function showNoSession() {
  const container = document.getElementById('profile-content')
  if (!container) return
  container.innerHTML = `
    <div class="bg-card rounded-2xl p-8 text-center">
      <i class="fas fa-user-lock text-5xl text-blue-400 mb-4"></i>
      <h3 class="text-2xl font-bold text-slate-200 mb-2">No has iniciado sesión</h3>
      <p class="text-slate-400 mb-6">Inicia sesión para ver los datos de tu cuenta.</p>
      <a href="../index.html" class="gradient-button text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center hover:shadow-lg transition-all duration-300">
        <i class="fas fa-sign-in-alt mr-2"></i> Iniciar sesión
      </a>
    </div>
  `
}

function renderProfile(user) {
  const container = document.getElementById('profile-content')
  const titleEl = document.getElementById('profile-title')
  if (!container) return

  const email = user.email || 'Cuenta de usuario'
  const createdAt = user.created_at
  const lastSignIn = user.last_sign_in_at
  const metadata = user.user_metadata || {}

  currentUsername = metadata.username || null
  currentAvatar = metadata.avatar || null
  localStorage.setItem('macrosync_profile', JSON.stringify({ username: currentUsername, avatar: currentAvatar }))
  updateHeaderProfile()

  const displayName = currentUsername || email
  const avatarDisplay = currentAvatar || escapeHtml(getInitial(email))

  if (titleEl) {
    titleEl.textContent = 'Mi Información'
  }

  container.innerHTML = `
    <div class="grid md:grid-cols-3 gap-6">
      <!-- Tarjeta de perfil / avatar -->
      <div class="card-dark rounded-2xl p-8 text-center md:col-span-1 h-fit">
        <div id="avatar-circle" class="mx-auto w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4"
             style="background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));">
          ${avatarDisplay}
        </div>
        <h3 class="text-xl font-bold text-slate-200 mb-1 break-all">${escapeHtml(displayName)}</h3>
        ${currentUsername ? `<p class="text-cyan-400 text-sm mb-1">@${escapeHtml(currentUsername)}</p>` : ''}
        <p class="text-slate-400 text-sm mb-4">Cuenta verificada</p>

        <button type="button" id="open-settings-btn" class="gradient-button text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center hover:shadow-lg transition-all duration-300">
          <i class="fas fa-user-cog mr-2"></i> Personalizar perfil
        </button>
      </div>

      <!-- Datos de la cuenta -->
      <div class="md:col-span-2 space-y-6">
        <div class="card-dark rounded-2xl p-8">
          <h3 class="text-xl font-bold text-slate-200 mb-2 flex items-center">
            <i class="fas fa-id-card mr-3" style="color: var(--accent-cyan)"></i>
            Datos de la cuenta
          </h3>
          <p class="text-slate-400 text-sm mb-6">Información asociada a tu correo de inicio de sesión.</p>

          <div class="space-y-4">
            <div class="flex items-start justify-between py-3 border-b border-slate-700">
              <div class="flex items-center text-slate-300">
                <i class="fas fa-user mr-3 text-slate-400"></i>
                <span>Nombre de usuario</span>
              </div>
              <span class="font-semibold text-slate-200 text-right break-all">${currentUsername ? '@' + escapeHtml(currentUsername) : 'Sin asignar'}</span>
            </div>

            <div class="flex items-start justify-between py-3 border-b border-slate-700">
              <div class="flex items-center text-slate-300">
                <i class="fas fa-envelope mr-3 text-slate-400"></i>
                <span>Correo electrónico</span>
              </div>
              <span class="font-semibold text-slate-200 text-right break-all">${escapeHtml(email)}</span>
            </div>

            <div class="flex items-start justify-between py-3 border-b border-slate-700">
              <div class="flex items-center text-slate-300">
                <i class="fas fa-calendar-plus mr-3 text-slate-400"></i>
                <span>Miembro desde</span>
              </div>
              <span class="font-semibold text-slate-200 text-right">${escapeHtml(formatDateShort(createdAt))}</span>
            </div>

            <div class="flex items-start justify-between py-3 border-b border-slate-700">
              <div class="flex items-center text-slate-300">
                <i class="fas fa-clock mr-3 text-slate-400"></i>
                <span>Último acceso</span>
              </div>
              <span class="font-semibold text-slate-200 text-right">${escapeHtml(formatDate(lastSignIn))}</span>
            </div>

            <div class="flex items-start justify-between py-3">
              <div class="flex items-center text-slate-300">
                <i class="fas fa-verified mr-3 text-slate-400"></i>
                <span>Proveedor</span>
              </div>
              <span class="font-semibold text-slate-200 text-right capitalize">${escapeHtml(metadata.provider || 'email')}</span>
            </div>
          </div>
        </div>

        <!-- Preferencias: Cambio de tema -->
        <div class="card-dark rounded-2xl p-8">
          <h3 class="text-xl font-bold text-slate-200 mb-2 flex items-center">
            <i class="fas fa-palette mr-3" style="color: var(--accent-cyan)"></i>
            Preferencias
          </h3>
          <p class="text-slate-400 text-sm mb-6">Ajusta la apariencia de la aplicación.</p>

          <div class="flex items-center justify-between py-3 border-b border-slate-700">
            <div class="flex items-center text-slate-300">
              <i class="fas fa-moon mr-3 text-slate-400"></i>
              <div>
                <span class="font-semibold">Tema claro</span>
                <p class="text-xs text-slate-400" id="theme-status-text">Oscuro</p>
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" id="theme-toggle-switch" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- Zona de peligro: Eliminar cuenta -->
        <div class="card-dark danger-zone rounded-2xl p-8 border-red-500/40">
          <h3 class="text-xl font-bold text-red-400 mb-2 flex items-center">
            <i class="fas fa-exclamation-triangle danger-icon mr-3"></i>
            Zona de peligro
          </h3>
          <p class="text-slate-400 text-sm mb-6">
            Al eliminar tu cuenta se borrarán de forma permanente tu usuario, tus datos y todo tu historial. Esta acción no se puede deshacer.
          </p>
          <button
            type="button"
            id="delete-account-btn"
            class="w-auto px-6 py-3 rounded-lg font-semibold inline-flex items-center border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-300"
          >
            <i class="fas fa-trash-alt mr-2"></i>
            Eliminar mi cuenta
          </button>
        </div>
      </div>
    </div>
  `

  const openBtn = document.getElementById('open-settings-btn')
  if (openBtn) {
    openBtn.addEventListener('click', () => openSettingsModal())
  }

  setupThemeSwitch()

  const deleteBtn = document.getElementById('delete-account-btn')
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => openDeleteAccountModal(user))
  }
}

// ==========================================
// 6. MODAL: PERSONALIZACIÓN DE PERFIL
// ==========================================
function buildAvatarOptions(selectedEmoji) {
  return AVATARS.map(a => {
    const isSelected = selectedEmoji === a.emoji
    return `
      <button type="button" class="avatar-option ${isSelected ? 'avatar-selected' : ''}"
              data-emoji="${a.emoji}" title="${a.label}" aria-label="${a.label}">
        <span class="text-2xl leading-none">${a.emoji}</span>
      </button>
    `
  }).join('')
}

function openSettingsModal() {
  const overlay = document.getElementById('settings-modal-overlay')
  const usernameInput = document.getElementById('settings-username')
  const avatarGrid = document.getElementById('settings-avatar-grid')
  const hint = document.getElementById('settings-username-hint')
  if (!overlay) return

  usernameInput.value = currentUsername || ''
  hint.textContent = currentUsername ? 'Tu nombre de usuario actual.' : 'Crea un nombre para tu cuenta.'

  let selectedEmoji = currentAvatar || null
  avatarGrid.innerHTML = buildAvatarOptions(selectedEmoji)

  const options = avatarGrid.querySelectorAll('.avatar-option')
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('avatar-selected'))
      opt.classList.add('avatar-selected')
      selectedEmoji = opt.dataset.emoji
    })
  })

  overlay.classList.add('open')
}

function closeSettingsModal() {
  const overlay = document.getElementById('settings-modal-overlay')
  if (overlay) overlay.classList.remove('open')
}

async function saveSettings() {
  const usernameInput = document.getElementById('settings-username')
  const overlay = document.getElementById('settings-modal-overlay')
  const saveBtn = document.getElementById('settings-save-btn')
  const hint = document.getElementById('settings-username-hint')

  const username = (usernameInput.value || '').trim()
  const selectedEmoji = overlay.querySelector('.avatar-option.avatar-selected')?.dataset?.emoji || currentAvatar || null

  if (username && !/^[a-zA-Z0-9_.-]+$/.test(username)) {
    hint.textContent = 'Solo letras, números, puntos, guiones y guiones bajos.'
    hint.style.color = '#f87171'
    return
  }

  if (saveBtn) {
    saveBtn.disabled = true
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Guardando...'
  }

  try {
    const meta = { ...(await getCurrentMetadata()) }
    if (username) meta.username = username
    else delete meta.username
    if (selectedEmoji) meta.avatar = selectedEmoji
    else delete meta.avatar

    const { error } = await supabase.auth.updateUser({
      data: meta
    })

    if (error) {
      if (hint) {
        hint.textContent = error.message || 'No se pudo guardar.'
        hint.style.color = '#f87171'
      }
      return
    }

    currentUsername = username || null
    currentAvatar = selectedEmoji || null
    localStorage.setItem('macrosync_profile', JSON.stringify({ username: currentUsername, avatar: currentAvatar }))
    updateHeaderProfile()

    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Guardado'
      saveBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)'
    }
    if (hint) {
      hint.textContent = '¡Guardado en tu cuenta!'
      hint.style.color = '#34d399'
    }

    setTimeout(() => {
      closeSettingsModal()
      loadUser()
    }, 1000)
  } catch (e) {
    console.error('Error guardando perfil:', e)
    if (hint) {
      hint.textContent = e.message || 'Ocurrió un error.'
      hint.style.color = '#f87171'
    }
  } finally {
    if (saveBtn) {
      setTimeout(() => {
        saveBtn.disabled = false
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Guardar cambios'
        saveBtn.style.background = ''
      }, 1200)
    }
  }
}

async function getCurrentMetadata() {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.user_metadata || {}
  } catch {
    return {}
  }
}

// ==========================================
// 7. MODAL Y LÓGICA: ELIMINAR CUENTA
// ==========================================
function openDeleteAccountModal(user) {
  const overlay = document.getElementById('delete-modal-overlay')
  if (!overlay) return
  const emailSpan = document.getElementById('delete-account-email')
  if (emailSpan) emailSpan.textContent = user.email || ''
  overlay.classList.add('open')

  const confirmInput = document.getElementById('delete-account-confirm-input')
  const confirmBtn = document.getElementById('delete-confirm-btn')
  const hint = document.getElementById('delete-account-hint')

  if (confirmBtn) {
    confirmBtn.disabled = true
    confirmBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Sí, eliminar mi cuenta'
  }

  if (confirmInput) {
    confirmInput.value = ''
    confirmInput.focus()

    confirmInput.oninput = null
    confirmInput.addEventListener('input', (e) => {
      const val = (e.target.value || '').trim().toLowerCase()
      const targetEmail = (user.email || '').trim().toLowerCase()
      if (val && val === targetEmail) {
        if (confirmBtn) confirmBtn.disabled = false
        if (hint) {
          hint.textContent = 'Correo confirmado. Presiona el botón para eliminar permanentemente.'
          hint.style.color = '#f87171'
        }
      } else {
        if (confirmBtn) confirmBtn.disabled = true
        if (hint) {
          hint.textContent = 'Escribe exactamente tu correo para habilitar la eliminación.'
          hint.style.color = '#94a3b8'
        }
      }
    })
  }
}

function closeDeleteAccountModal() {
  const overlay = document.getElementById('delete-modal-overlay')
  if (overlay) overlay.classList.remove('open')
}

async function confirmDeleteAccount() {
  const confirmBtn = document.getElementById('delete-confirm-btn')
  const hint = document.getElementById('delete-account-hint')

  if (!confirmBtn) return

  confirmBtn.disabled = true
  confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Eliminando...'

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData?.session) {
      throw new Error('No se pudo validar la sesión activa. Por favor inicia sesión nuevamente.')
    }

    const sessionEmail = sessionData.session.user?.email || ''
    const inputEl = document.getElementById('delete-account-confirm-input')
    const typed = (inputEl?.value || '').trim().toLowerCase()

    if (typed !== sessionEmail.toLowerCase()) {
      if (hint) {
        hint.textContent = 'El correo escrito no coincide con el usuario autenticado.'
        hint.style.color = '#f87171'
      }
      confirmBtn.disabled = false
      confirmBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Sí, eliminar mi cuenta'
      return
    }

    const token = sessionData.session.access_token

    const res = await fetch(DELETE_USER_EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    })

    let body = {}
    try {
      body = await res.json()
    } catch {
      // Manejo en caso de que la respuesta no contenga un JSON válido
    }

    if (!res.ok) {
      throw new Error(body.error || `Error ${res.status}: No se pudo completar la eliminación.`)
    }

    // Limpieza total tras confirmación exitosa
    await supabase.auth.signOut()
    localStorage.clear()

    window.location.href = '../index.html'

  } catch (e) {
    console.error('Error eliminando cuenta:', e)
    if (hint) {
      hint.textContent = e.message || 'No se pudo eliminar la cuenta.'
      hint.style.color = '#f87171'
    }
    if (confirmBtn) {
      confirmBtn.disabled = false
      confirmBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Sí, eliminar mi cuenta'
    }
  }
}

// ==========================================
// 8. CARGA DE DATOS E INICIALIZACIÓN
// ==========================================
async function loadUser() {
  if (window.location.protocol === 'file:') {
    showError('Abre el proyecto con un servidor HTTP (ej. Live Server). Supabase no puede conservar la sesión desde file://.')
    return
  }

  showLoading()

  try {
    const sessionResult = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('La sesión tardó demasiado en responder.')), 8000)
      })
    ])
    const { data, error } = sessionResult

    if (error) {
      showError(error.message)
      return
    }

    const user = data?.session?.user
    if (user) {
      renderProfile(user)
    } else {
      showNoSession()
    }
  } catch (e) {
    console.error('Error cargando usuario:', e)
    showError(e.message)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Configurar Modal de Personalización
  const closeBtn = document.getElementById('settings-modal-close')
  const cancelBtn = document.getElementById('settings-cancel-btn')
  const saveBtn = document.getElementById('settings-save-btn')
  const overlay = document.getElementById('settings-modal-overlay')

  if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal)
  if (cancelBtn) cancelBtn.addEventListener('click', closeSettingsModal)
  if (saveBtn) saveBtn.addEventListener('click', saveSettings)
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSettingsModal()
    })
  }

  // Configurar Modal de Eliminar Cuenta
  const deleteCloseBtn = document.getElementById('delete-modal-close')
  const deleteCancelBtn = document.getElementById('delete-cancel-btn')
  const deleteConfirmBtn = document.getElementById('delete-confirm-btn')
  const deleteOverlay = document.getElementById('delete-modal-overlay')

  if (deleteCloseBtn) deleteCloseBtn.addEventListener('click', closeDeleteAccountModal)
  if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeDeleteAccountModal)
  if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', confirmDeleteAccount)
  if (deleteOverlay) {
    deleteOverlay.addEventListener('click', (e) => {
      if (e.target === deleteOverlay) closeDeleteAccountModal()
    })
  }

  // Cierre con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSettingsModal()
      closeDeleteAccountModal()
    }
  })

  applyTheme(getCurrentTheme())
})

// Cargar estado de la cuenta
loadUser()