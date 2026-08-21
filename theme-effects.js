(function () {
  const THEME_KEY = 'nutry_theme'
  const leafCount = 28

  function spawnLeaves() {
    const leavesLayer = document.getElementById('leavesLayer')
    if (!leavesLayer || leavesLayer.dataset.spawned === '1') return

    leavesLayer.dataset.spawned = '1'
    for (let index = 0; index < leafCount; index += 1) {
      const leaf = document.createElement('div')
      const size = 14 + Math.random() * 18
      leaf.className = 'leaf'
      leaf.style.setProperty('--leaf-x', Math.random() * 100 + 'vw')
      leaf.style.setProperty('--leaf-drift', 20 + Math.random() * 60 + 'px')
      leaf.style.setProperty('--leaf-rot', Math.random() * 40 - 20 + 'deg')
      leaf.style.setProperty('--leaf-duration', 5 + Math.random() * 6 + 's')
      leaf.style.setProperty('--leaf-size', size + 'px')
      leaf.style.fontSize = size + 'px'
      leaf.style.lineHeight = '1'
      leaf.textContent = '🍂'
      leavesLayer.appendChild(leaf)
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
      spawnLeaves()
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  function initialize() {
    applyTheme(localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark')

    const observer = new MutationObserver(() => {
      if (document.documentElement.matches('[data-theme="light"]')) spawnLeaves()
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize)
  else initialize()
})()