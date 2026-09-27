(function () {
  function renderHeaderPhoto() {
    const target = document.getElementById('header-profile')
    if (!target) return

    try {
      const profile = JSON.parse(localStorage.getItem('macrosync_profile') || 'null')
      if (!profile || typeof profile.avatarImage !== 'string' || !profile.avatarImage.startsWith('data:image/')) return

      target.replaceChildren()
      const image = document.createElement('img')
      image.className = 'brand-profile-photo'
      image.src = profile.avatarImage
      image.alt = 'Foto de perfil'
      target.appendChild(image)
      if (profile.username) target.append(document.createTextNode(' @' + profile.username))
    } catch (error) {
      console.warn('No se pudo mostrar la foto de perfil.', error)
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderHeaderPhoto)
  else renderHeaderPhoto()
})()
