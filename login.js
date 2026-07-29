import { supabase } from './supabaseClient.js'

const SUCCESS_REDIRECT_URL = './p-finish/index.html'

// ===== Login (iniciar sesión) =====
const loginForm = document.getElementById('auth-form')
const loginMessage = document.getElementById('login-message')
const switchToRegisterBtn = document.getElementById('switch-to-register')
const loginSubmitBtn = document.getElementById('login-submit')

// Login inputs
function getLoginEmail() {
  return document.getElementById('login-email')?.value || ''
}
function getLoginPassword() {
  return document.getElementById('login-password')?.value || ''
}

// ===== Register (crear cuenta) =====
const registerForm = document.getElementById('register-form')
const registerMessage = document.getElementById('message')
const switchToLoginBtn = document.getElementById('switch-auth')
const registerSubmitBtn = document.getElementById('submit-btn')

// Register inputs
function getRegisterEmail() {
  return document.getElementById('register-email')?.value || document.getElementById('email')?.value || ''
}
function getRegisterPassword() {
  // en tu index.html el input se llama "password" (sección registro)
  return document.getElementById('register-password')?.value || document.getElementById('password')?.value || ''
}

// Sections wrapper (solo si existen)
const loginSectionEl = document.getElementById('login-section')
const registerSectionEl = document.getElementById('register-section')

// (Ya no hay confirm-password, lo dejamos por compatibilidad si existiera)
const registerExtraEl = document.getElementById('register-extra')

// ===== Estado =====
let isLogin = true
let isUserSubmitting = false

// ===== Cooldown (rate limit) =====
const RATE_LIMIT_COOLDOWN_MS = 30 * 60 * 1000
const COOLDOWN_KEY = 'nutry_rate_limit_until_ms'
const storedCooldownUntil = Number(localStorage.getItem(COOLDOWN_KEY) || '0')

let cooldownUntil = 0
if (Number.isFinite(storedCooldownUntil) && storedCooldownUntil > Date.now()) {
  const msLeft = storedCooldownUntil - Date.now()
  cooldownUntil = Date.now() + Math.min(msLeft, RATE_LIMIT_COOLDOWN_MS)
}

function isInCooldown() {
  return Date.now() < cooldownUntil
}

function applyCooldown() {
  cooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS
  localStorage.setItem(COOLDOWN_KEY, String(cooldownUntil))
  setSubmittingState(false)
}

let cooldownIntervalId = undefined

function startCooldownCountdown() {
  if (cooldownIntervalId) clearInterval(cooldownIntervalId)

  const tick = () => {
    const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
    setCurrentMessage(
      `Demasiados intentos. Vuelve a intentar en ${secondsLeft} segundos.`,
      '#ff4d4d'
    )

    if (secondsLeft <= 0) {
      clearInterval(cooldownIntervalId)
      cooldownIntervalId = undefined
      cooldownUntil = 0
      localStorage.removeItem(COOLDOWN_KEY)
    }
  }

  tick()
  cooldownIntervalId = setInterval(tick, 1000)
}

// ===== Mensajes/UI =====
function getCurrentMessageEl() {
  return isLogin ? loginMessage : registerMessage
}

function setCurrentMessage(text, color) {
  const el = getCurrentMessageEl()
  if (!el) return
  el.innerText = text
  el.style.color = color
}

function setSubmittingState(isSubmitting) {
  isUserSubmitting = isSubmitting

  const btn = isLogin ? loginSubmitBtn : registerSubmitBtn
  if (btn) btn.disabled = isSubmitting
  if (btn) {
    btn.style.opacity = isSubmitting ? '0.7' : '1'
    btn.style.cursor = isSubmitting ? 'not-allowed' : 'pointer'
  }
}

function showResendButton(email) {
  const existing = document.getElementById('resend-confirmation-btn')
  if (existing) existing.remove()

  const btn = document.createElement('button')
  btn.id = 'resend-confirmation-btn'
  btn.type = 'button'
  btn.className =
    'mt-3 w-full border border-gray-600 rounded-xl py-3 text-white font-bold bg-transparent hover:bg-white/5 transition'
  btn.textContent = 'Reenviar correo de confirmación'

  btn.addEventListener('click', async () => {
    setCurrentMessage('Enviando correo de confirmación...', '#94a3b8')
    btn.disabled = true
    btn.style.opacity = '0.7'

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        setCurrentMessage(error.message || 'No se pudo reenviar el correo.', '#ff4d4d')
        return
      }

      setCurrentMessage('Correo reenviado. Revisa tu bandeja de entrada.', '#3ecf8e')
    } finally {
      btn.disabled = false
      btn.style.opacity = '1'
    }
  })

  // Append en el formulario actual
  const wrapper = document.createElement('div')
  wrapper.className = 'mt-3 text-center'
  wrapper.appendChild(btn)

  if (isLogin) {
    loginForm?.appendChild(wrapper)
  } else {
    registerForm?.appendChild(wrapper)
  }
}

function clearResendButton() {
  const existing = document.getElementById('resend-confirmation-btn')
  if (existing) existing.remove()
}

// ===== Switch sections =====
function syncSectionsUI() {
  isLogin = !(!isLogin) // noop, solo para claridad

  if (loginSectionEl) loginSectionEl.classList.toggle('hidden', !isLogin)
  if (registerSectionEl) registerSectionEl.classList.toggle('hidden', isLogin)

  if (registerExtraEl) {
    // por compatibilidad, si existiera algún recuadro extra
    registerExtraEl.classList.toggle('hidden', isLogin)
  }
}

// ===== Auth state redirect =====
function redirectIfSignedIn(session, eventName) {
  if (eventName !== 'SIGNED_IN') return
  if (!isUserSubmitting) return
  if (session?.access_token) window.location.href = SUCCESS_REDIRECT_URL
}

syncSectionsUI()

// ===== Submit handlers =====
async function handleLoginSubmit(e) {
  e.preventDefault()
  if (isUserSubmitting) return

  if (isInCooldown()) {
    startCooldownCountdown()
    return
  }

  const email = getLoginEmail()
  const password = getLoginPassword()

  clearResendButton()
  setCurrentMessage('', '#3ecf8e')
  setSubmittingState(true)

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const msg = (error.message || '').toLowerCase()

      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setCurrentMessage('Primero confirma tu correo. Luego podrás iniciar sesión.', '#ff4d4d')
        showResendButton(email)
        return
      }

      if (error.status === 429) {
        applyCooldown()
        const secondsLeft = Math.max(1, Math.ceil(RATE_LIMIT_COOLDOWN_MS / 1000))
        setCurrentMessage(
          `Demasiados intentos. Espera ${secondsLeft} segundos y vuelve a intentar.`,
          '#ff4d4d'
        )
        return
      }

      setCurrentMessage(error.message || 'No se pudo iniciar sesión.', '#ff4d4d')
      return
    }

    setCurrentMessage('Bienvenido de nuevo', '#3ecf8e')
  } finally {
    setSubmittingState(false)
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault()
  if (isUserSubmitting) return

  if (isInCooldown()) {
    startCooldownCountdown()
    return
  }

  const email = getRegisterEmail()
  const password = getRegisterPassword()

  clearResendButton()
  setCurrentMessage('', '#3ecf8e')
  setSubmittingState(true)

  try {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error('Supabase signUp error:', error)

      if (error.status === 429) {
        applyCooldown()
        const secondsLeft = Math.max(1, Math.ceil(RATE_LIMIT_COOLDOWN_MS / 1000))
        setCurrentMessage(
          `Demasiados intentos. Espera ${secondsLeft} segundos y vuelve a intentar.\n(${error.message || 'rate limit'})`,
          '#ff4d4d'
        )
        return
      }

      const msg = (error.message || '').toLowerCase()

      if (msg.includes('user already registered') || msg.includes('already registered')) {
        // Cambiar a login
        isLogin = true
        clearResendButton()
        syncSectionsUI()
        setCurrentMessage('Ese correo ya está registrado. Inicia sesión con ese usuario.', '#ff4d4d')
        return
      }

      setCurrentMessage(
        error.message ? `No se pudo crear la cuenta: ${error.message}` : 'No se pudo crear la cuenta.',
        '#ff4d4d'
      )
      return
    }

    if (data?.session?.access_token) {
      window.location.href = SUCCESS_REDIRECT_URL
      return
    }

    // Si no hay sesión inmediata, intentar login para no pedir confirmación extra
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        const msg = (signInError.message || '').toLowerCase()
        if (msg.includes('not confirmed') || msg.includes('email not confirmed')) {
          setCurrentMessage(
            'Cuenta creada. Intenta iniciar sesión de nuevo cuando esté habilitada.',
            '#3ecf8e'
          )
          return
        }

        setCurrentMessage(signInError.message || 'Cuenta creada. Intenta iniciar sesión para continuar.', '#ff4d4d')
        return
      }

      window.location.href = SUCCESS_REDIRECT_URL
    } catch {
      setCurrentMessage('Cuenta creada. Inicia sesión para continuar.', '#3ecf8e')
    }
  } finally {
    setSubmittingState(false)
  }
}

loginForm?.addEventListener('submit', handleLoginSubmit)
registerForm?.addEventListener('submit', handleRegisterSubmit)

// ===== Switch buttons =====
switchToRegisterBtn?.addEventListener('click', () => {
  isLogin = false
  clearResendButton()
  setCurrentMessage('', '#3ecf8e')
  cooldownUntil = 0
  localStorage.removeItem(COOLDOWN_KEY)

  syncSectionsUI()

  const titleEl = document.getElementById('form-title')
  if (titleEl) titleEl.innerText = 'Crear cuenta'
})

switchToLoginBtn?.addEventListener('click', () => {
  isLogin = true
  clearResendButton()
  setCurrentMessage('', '#3ecf8e')
  cooldownUntil = 0
  localStorage.removeItem(COOLDOWN_KEY)

  syncSectionsUI()

  const titleEl = document.getElementById('form-title')
  if (titleEl) titleEl.innerText = 'Iniciar sesión'
})

// ===== Auth redirect =====
supabase.auth.onAuthStateChange((event, session) => {
  redirectIfSignedIn(session, event)
})
