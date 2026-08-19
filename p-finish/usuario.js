import { supabase } from '../supabaseClient.js'

// Opcional: si despliegas una Edge Function/endpoint seguro que borra el
// usuario en auth (requiere SERVICE_ROLE), pon aquí su URL pública.
// Ejemplo: const DELETE_USER_EDGE_URL = 'https://.../delete-user'
const DELETE_USER_EDGE_URL = ''
// ===== Utilidades de formato =====
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
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;')
}

// ===== Helpers de DOM =====
function getInitial(email) {
  if (!email) return '?'
  return email.trim().charAt(0).toUpperCase()
}

// ===== AVATARES DISPONIBLES =====
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

// ===== Estado global del perfil =====
let currentUsername = null
let currentAvatar = null

// ===== Render =====
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
  const id = user.id

  // Metadata del perfil (guardada en la cuenta)
  currentUsername = metadata.username || null
  currentAvatar = metadata.avatar || null

  const displayName = currentUsername || email
  const avatarDisplay = currentAvatar || escapeHtml(getInitial(email))

  // Título personalizado
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

<!-- Preferencias: cambio de tema -->
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

        <!-- Zona de peligro: eliminar cuenta -->
        <div class="card-dark rounded-2xl p-8 border-red-500/40">
          <h3 class="text-xl font-bold text-red-400 mb-2 flex items-center">
            <i class="fas fa-exclamation-triangle mr-3"></i>
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
  `

// Abrir modal de personalización
  const openBtn = document.getElementById('open-settings-btn')
  if (openBtn) {
    openBtn.addEventListener('click', () => openSettingsModal())
  }

// ===== Cambio de tema (switch on/off) =====
  setupThemeSwitch()

  // ===== Botón eliminar cuenta =====
  const deleteBtn = document.getElementById('delete-account-btn')
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => openDeleteAccountModal(user))
  }
}

// ===== Modal de confirmación para eliminar cuenta =====
function openDeleteAccountModal(user) {
  const overlay = document.getElementById('delete-modal-overlay')
  if (!overlay) return
  const emailSpan = document.getElementById('delete-account-email')
  if (emailSpan) emailSpan.textContent = user.email || ''
  overlay.classList.add('open')

  // Preparar input de confirmación y estado del botón
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

    // Quitar listener previo si existía
    confirmInput.oninput = null
    confirmInput.addEventListener('input', (e) => {
      const val = (e.target.value || '').trim().toLowerCase()
      const targetEmail = (user.email || '').trim().toLowerCase()
      if (val && val === targetEmail) {
        if (confirmBtn) {
          confirmBtn.disabled = false
        }
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
  const overlay = document.getElementById('delete-modal-overlay')
  const confirmBtn = document.getElementById('delete-confirm-btn')
  const hint = document.getElementById('delete-account-hint')

  if (!confirmBtn) return

  // Estado de carga
  confirmBtn.disabled = true
  confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Eliminando...'
  try {
    // Seguridad extra: verificar que el email del usuario autenticado coincide
    const { data: sessionData } = await supabase.auth.getSession()
    const sessionEmail = sessionData?.session?.user?.email || ''
    const inputEl = document.getElementById('delete-account-confirm-input')
    const typed = (inputEl?.value || '').trim().toLowerCase()
    if (typed !== (sessionEmail || '').toLowerCase()) {
      if (hint) {
        hint.textContent = 'El correo escrito no coincide con el usuario autenticado.'
        hint.style.color = '#f87171'
      }
      if (confirmBtn) {
        confirmBtn.disabled = false
        confirmBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Sí, eliminar mi cuenta'
      }
      return
    }
    // 1) Intentar eliminar mediante la función RPC (elimina datos en tus tablas)
    const { error: rpcError } = await supabase.rpc('delete_user_account')

    if (rpcError) {
      console.warn('delete_user_account RPC falló:', rpcError.message)
      if (hint) {
        hint.textContent = 'No se pudieron borrar todos los datos en la nube.'
        hint.style.color = '#f87171'
      }
    }

    // 1.5) Opcional: intentar solicitar la eliminación del registro de auth
    // mediante una Edge Function/endpoint que use la Service Role key.
    if (DELETE_USER_EDGE_URL && DELETE_USER_EDGE_URL.trim() !== '') {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData?.session?.access_token
        if (token) {
          const res = await fetch(DELETE_USER_EDGE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          if (!res.ok) {
            console.warn('Edge function delete failed:', await res.text())
            if (hint) {
              hint.textContent = 'Datos borrados, pero no se pudo eliminar el registro de autenticación.'
              hint.style.color = '#f87171'
            }
          }
        } else {
          console.warn('No se obtuvo token de sesión para llamar la Edge Function')
        }
      } catch (err) {
        console.warn('Llamada a Edge Function falló:', err)
      }
    }

    // 2) Cerrar sesión localmente y limpiar datos
    await supabase.auth.signOut()
    localStorage.removeItem('nutry_current_user_id')
    localStorage.removeItem('nutry_theme')
    // Limpiar datos locales por usuario
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('nutry_')) keysToRemove.push(key)
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))

    // 3) Redirigir al login
    window.location.href = '../index.html'
  } catch (e) {
    console.error('Error eliminando cuenta:', e)
    if (hint) {
      hint.textContent = 'No se pudo eliminar la cuenta. Inténtalo de nuevo.'
      hint.style.color = '#f87171'
    }
    if (confirmBtn) {
      confirmBtn.disabled = false
      confirmBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Sí, eliminar mi cuenta'
    }
  }
}

// ===== Gestión del tema (persistido en localStorage: nutry_theme) =====
const THEME_KEY = 'nutry_theme'

function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') root.setAttribute('data-theme', 'light')
  else root.removeAttribute('data-theme')

  // Mostrar hojas en tema claro
  const leavesLayer = document.getElementById('leavesLayer')
  if (leavesLayer) {
    if (theme === 'light' && leavesLayer.dataset.spawned !== '1') {
      leavesLayer.dataset.spawned = '1'
      spawnLeaves()
    }
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

// ===== Modal de personalización (avatar + nombre de usuario) =====
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

  // Precargar valores actuales
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

  // Validación básica del nombre de usuario
  if (username && !/^[a-zA-Z0-9_.-]+$/.test(username)) {
    hint.textContent = 'Solo letras, números, puntos, guiones y guiones bajos.'
    hint.style.color = '#f87171'
    return
  }

  // Mostrar estado de guardado
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

    const { data, error } = await supabase.auth.updateUser({
      data: meta
    })

    if (error) {
      if (hint) {
        hint.textContent = error.message || 'No se pudo guardar.'
        hint.style.color = '#f87171'
      }
      return
    }

    // Actualizar estado
    currentUsername = username || null
    currentAvatar = selectedEmoji || null

    // Feedback
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
      // Recargar el perfil para reflejar los cambios
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

// ===== Eventos del modal =====
document.addEventListener('DOMContentLoaded', () => {
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

// Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSettingsModal()
      closeDeleteAccountModal()
    }
  })

  // ===== Modal de eliminar cuenta =====
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
})

// ===== Carga de datos =====
async function loadUser() {
  showLoading()

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      // Si no hay sesión, mostrar mensaje
      if (error.message && /no session|not logged|invalid|token/i.test(error.message)) {
        showNoSession()
      } else {
        showError(error.message)
      }
      return
    }

    if (data?.user) {
      renderProfile(data.user)
    } else {
      showNoSession()
    }
  } catch (e) {
    console.error('Error cargando usuario:', e)
    showError(e.message)
  }
}

// Cargar al iniciar
loadUser()
