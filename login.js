import { supabase } from './supabaseClient.js?v=2'

const SUCCESS_REDIRECT_URL = './p-finish/index.html'

// ===== Login (iniciar sesión) =====
const loginForm = document.getElementById('auth-form')
const loginMessage = document.getElementById('login-message')
const switchToRegisterBtn = document.getElementById('switch-to-register')
const loginSubmitBtn = document.getElementById('login-submit')
const forgotPasswordBtn = document.getElementById('forgot-password')
const resetPasswordSectionEl = document.getElementById('reset-password-section')
const resetPasswordForm = document.getElementById('reset-password-form')
const resetPasswordMessage = document.getElementById('reset-password-message')
const resetPasswordSubmitBtn = document.getElementById('reset-password-submit')
const recoveryLink = `${window.location.search}${window.location.hash}`

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
  return document.getElementById('register-password')?.value || document.getElementById('password')?.value || ''
}

// Sections wrapper
const loginSectionEl = document.getElementById('login-section')
const registerSectionEl = document.getElementById('register-section')
const registerExtraEl = document.getElementById('register-extra')

// ===== Estado =====
let isLogin = true
let isResettingPassword = /type=recovery/i.test(recoveryLink)
let isUserSubmitting = false

// ===== Cooldown (rate limit) =====
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000
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
  if (isResettingPassword) return resetPasswordMessage
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
  if (loginSectionEl) loginSectionEl.classList.toggle('hidden', !isLogin || isResettingPassword)
  if (registerSectionEl) registerSectionEl.classList.toggle('hidden', isLogin || isResettingPassword)
  if (resetPasswordSectionEl) resetPasswordSectionEl.classList.toggle('hidden', !isResettingPassword)

  if (registerExtraEl) {
    registerExtraEl.classList.toggle('hidden', isLogin || isResettingPassword)
  }

  const titleEl = document.getElementById('form-title')
  const subtitleEl = document.getElementById('form-subtitle')
  if (titleEl) titleEl.innerText = isResettingPassword ? 'Crear nueva contraseña' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')
  if (subtitleEl) subtitleEl.innerText = isResettingPassword ? 'Elige una contraseña nueva para tu cuenta' : (isLogin ? 'Ingresa tus datos para acceder' : 'Completa tus datos para crear tu cuenta')
}

// ===== Auth state redirect =====
function redirectIfSignedIn(session, eventName) {
  // Redirige automáticamente al detectar sesión iniciada (al presionar login o al volver del enlace de correo)
  if (!isResettingPassword && (eventName === 'SIGNED_IN' || eventName === 'TOKEN_REFRESHED') && session?.access_token) {
    window.location.href = SUCCESS_REDIRECT_URL
  }
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
  const fullName = (document.getElementById('register-full-name')?.value || '').trim().replace(/\s+/g, ' ')
  const phone = (document.getElementById('register-phone')?.value || '').trim()
  const age = Number(document.getElementById('register-age')?.value)

  if (fullName.split(' ').filter(Boolean).length < 2) {
    setCurrentMessage('Escribe tus nombres y al menos un apellido.', '#ff4d4d')
    return
  }

  const phoneDigits = phone.replace(/\D/g, '')
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    setCurrentMessage('Escribe un número telefónico válido (entre 7 y 15 dígitos).', '#ff4d4d')
    return
  }

  if (!Number.isInteger(age) || age < 13 || age > 120) {
    setCurrentMessage('La edad debe ser un número entre 13 y 120 años.', '#ff4d4d')
    return
  }

  if (!email || !password) {
    setCurrentMessage('Escribe un correo y una contraseña válidos.', '#ff4d4d')
    return
  }

  if (password.length < 6) {
    setCurrentMessage('La contraseña debe tener al menos 6 caracteres.', '#ff4d4d')
    return
  }

  if (window.location.protocol === 'file:') {
    setCurrentMessage(
      'Abre la app desde un servidor web (HTTP/HTTPS). El registro y la confirmación por correo no funcionan con file://.',
      '#ff4d4d'
    )
    return
  }

  clearResendButton()
  setCurrentMessage('', '#3ecf8e')
  setSubmittingState(true)

  try {
    const emailRedirectTo = `${window.location.origin}${window.location.pathname}`

    // Sintaxis Supabase v2
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          phone,
          age
        }
      }
    })

    if (error) {
      console.error('Supabase signUp error:', error)

      if (error.status === 429) {
        const msg = (error.message || '').toLowerCase()
        if (msg.includes('email rate limit')) {
          setCurrentMessage(
            'Ya se envió un correo de confirmación a ese correo. Revisa tu bandeja de entrada (y spam) antes de intentar registrarte otra vez.',
            '#ff4d4d'
          )
          return
        }

        setCurrentMessage(
          'Demasiados intentos con este correo. Supabase ha bloqueado temporalmente el registro. Espera unos minutos e intenta de nuevo.',
          '#ff4d4d'
        )
        return
      }

      const msg = (error.message || '').toLowerCase()

      if (msg.includes('user already registered') || msg.includes('already registered')) {
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

    // Registro requiring email verification
    isLogin = true
    clearResendButton()
    syncSectionsUI()

    const titleEl = document.getElementById('form-title')
    if (titleEl) titleEl.innerText = 'Iniciar sesión'

    setCurrentMessage(
      '¡Cuenta creada! Te enviamos un correo de verificación. Revisa tu bandeja de entrada (y el spam) y haz clic en el enlace para activar tu cuenta antes de iniciar sesión.',
      '#3ecf8e'
    )
    showResendButton(email)

    const pw = document.getElementById('register-password') || document.getElementById('password')
    if (pw) pw.value = ''
  } finally {
    setSubmittingState(false)
  }
}

async function handleForgotPassword() {
  const emailInput = document.getElementById('login-email')
  const email = getLoginEmail().trim()

  if (!email || !emailInput?.checkValidity()) {
    setCurrentMessage('Escribe un correo válido para enviarte el enlace de recuperación.', '#ff4d4d')
    emailInput?.focus()
    return
  }

  if (window.location.protocol === 'file:') {
    setCurrentMessage('Abre la app desde un servidor web (HTTP/HTTPS) para recuperar la contraseña.', '#ff4d4d')
    return
  }

  forgotPasswordBtn.disabled = true
  setCurrentMessage('', '#94a3b8')
  try {
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      setCurrentMessage(error.message || 'No se pudo enviar el enlace de recuperación.', '#ff4d4d')
      return
    }
    setCurrentMessage('Si el correo corresponde a una cuenta, recibirás un enlace para crear una contraseña nueva.', '#3ecf8e')
  } catch (error) {
    setCurrentMessage(error?.message || 'No se pudo enviar el enlace de recuperación.', '#ff4d4d')
  } finally {
    forgotPasswordBtn.disabled = false
  }
}

async function handlePasswordResetSubmit(e) {
  e.preventDefault()
  const password = document.getElementById('new-password').value
  const confirmation = document.getElementById('confirm-new-password').value

  if (password.length < 6) {
    setCurrentMessage('La contraseña debe tener al menos 6 caracteres.', '#ff4d4d')
    return
  }
  if (password !== confirmation) {
    setCurrentMessage('Las contraseñas no coinciden.', '#ff4d4d')
    return
  }

  resetPasswordSubmitBtn.disabled = true
  try {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setCurrentMessage(error.message || 'No se pudo actualizar la contraseña.', '#ff4d4d')
      return
    }
    setCurrentMessage('Contraseña actualizada. Te llevaremos a tu cuenta…', '#3ecf8e')
    setTimeout(() => { window.location.href = SUCCESS_REDIRECT_URL }, 1200)
  } catch (error) {
    setCurrentMessage(error?.message || 'No se pudo actualizar la contraseña.', '#ff4d4d')
  } finally {
    resetPasswordSubmitBtn.disabled = false
  }
}

loginForm?.addEventListener('submit', handleLoginSubmit)
registerForm?.addEventListener('submit', handleRegisterSubmit)
forgotPasswordBtn?.addEventListener('click', handleForgotPassword)
resetPasswordForm?.addEventListener('submit', handlePasswordResetSubmit)
document.getElementById('reset-password-back')?.addEventListener('click', () => {
  isResettingPassword = false
  isLogin = true
  setCurrentMessage('', '#3ecf8e')
  syncSectionsUI()
})

// ===== Switch buttons =====
switchToRegisterBtn?.addEventListener('click', () => {
  isResettingPassword = false
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
  isResettingPassword = false
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
  if (event === 'PASSWORD_RECOVERY') {
    isResettingPassword = true
    isLogin = true
    syncSectionsUI()
    setCurrentMessage('', '#3ecf8e')
  }
  redirectIfSignedIn(session, event)

  if (event === 'SIGNED_IN' && session?.user?.id) {
    localStorage.setItem('nutry_current_user_id', session.user.id)
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('nutry_current_user_id')
  }
})
