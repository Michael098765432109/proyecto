(function () {
  const THEME_KEY = 'nutry_theme'
  const leafCount = 24
  const rayCount = 6

  function ensureRays() {
    let raysLayer = document.querySelector('.rayos')
    if (!raysLayer) {
      raysLayer = document.createElement('div')
      raysLayer.className = 'rayos'
      raysLayer.setAttribute('aria-hidden', 'true')
      for (let index = 0; index < rayCount; index += 1) {
        raysLayer.appendChild(document.createElement('div')).className = 'rayo'
      }
    }
    if (raysLayer.parentElement !== document.body) document.body.prepend(raysLayer)
  }

  function getLeavesLayer() {
    let leavesLayer = document.getElementById('leavesLayer')
    if (!leavesLayer) {
      leavesLayer = document.createElement('div')
      leavesLayer.id = 'leavesLayer'
      leavesLayer.className = 'leaves-layer'
      leavesLayer.setAttribute('aria-hidden', 'true')
    }
    if (leavesLayer.parentElement !== document.body) document.body.prepend(leavesLayer)
    return leavesLayer
  }

  function spawnLeaves() {
    const leavesLayer = getLeavesLayer()
    if (leavesLayer.dataset.spawned === '1') return

    leavesLayer.dataset.spawned = '1'
    for (let index = 0; index < leafCount; index += 1) {
      const leaf = document.createElement('div')
      const size = 14 + Math.random() * 18
      leaf.className = 'leaf'
      leaf.style.setProperty('--leaf-x', Math.random() * 100 + 'vw')
      leaf.style.setProperty('--leaf-drift', 20 + Math.random() * 60 + 'px')
      leaf.style.setProperty('--leaf-rot', Math.random() * 40 - 20 + 'deg')
      const duration = 8 + Math.random() * 8
      leaf.style.setProperty('--leaf-duration', duration + 's')
      leaf.style.animationDelay = -Math.random() * duration + 's'
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
      ensureRays()
    }
  }

  function initialize() {
    applyTheme(localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark')

    const observer = new MutationObserver(() => {
      if (document.documentElement.matches('[data-theme="light"]')) spawnLeaves()
      else ensureRays()
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize)
  else initialize()
})()
