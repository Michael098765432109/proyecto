import { supabase } from '../supabaseClient.js'

const logoutBtn = document.getElementById('logout-btn')

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      window.location.href = '../index.html'
    }
  })
}
