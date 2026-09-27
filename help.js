(function () {
  const page = window.location.pathname.split('/').pop().toLowerCase()
  const isAppMenu = page === 'index.html' && window.location.pathname.toLowerCase().includes('/p-finish/')
  const sections = [
    {
      title: 'Calculadora de macros de comidas',
      pages: ['calculadora_de_macros_de_comidas.html'],
      description: 'Analiza los alimentos y las cantidades de una comida para estimar sus calorías y macronutrientes, como proteínas, carbohidratos y grasas.',
      steps: 'Añade los alimentos y sus porciones en el formulario y ejecuta el análisis para consultar el resultado.'
    },
    {
      title: 'Calculadora metabólica',
      pages: ['calculadora_metabolica.html.html'],
      description: 'Estima tus necesidades diarias de energía y propone objetivos de alimentación según tus datos, actividad y meta.',
      steps: 'Completa peso, altura, edad, actividad y objetivo. Revisa las pestañas de resultados, porciones, comidas y consejos; puedes guardar o cargar tus datos.'
    },
    {
      title: 'Visor de calorías',
      pages: ['visor_calorias.html'],
      description: 'Te ayuda a registrar cómo vas cumpliendo tu objetivo de calorías mediante respuestas sobre tu progreso.',
      steps: 'Sigue las preguntas y elige la respuesta que mejor describa tu día para actualizar el seguimiento.'
    },
    {
      title: 'Ejercicios recomendados',
      pages: ['apartado_ejercicios_recomendados.html'],
      description: 'Muestra una propuesta de ejercicios y sesiones organizada para la semana, de acuerdo con la información disponible de tu perfil y objetivos.',
      steps: 'Consulta el plan semanal. Si todavía no aparece, completa o vuelve a calcular tus datos en la Calculadora metabólica.'
    },
    {
      title: 'Mi cuenta',
      pages: ['usuario.html'],
      description: 'Permite personalizar la información visible de tu perfil, como el nombre y el avatar, y gestionar tu cuenta.',
      steps: 'Abre la configuración para editar tu perfil y guardar los cambios. Las acciones de cuenta se encuentran en esta página.'
    }
  ]

  function initialize() {
    if (!isAppMenu) return
    if (document.getElementById('help-trigger')) return

    const trigger = document.createElement('button')
    trigger.id = 'help-trigger'
    trigger.className = 'help-trigger'
    trigger.type = 'button'
    trigger.setAttribute('aria-haspopup', 'dialog')
    trigger.setAttribute('aria-expanded', 'false')
    trigger.setAttribute('aria-controls', 'help-overlay')
    trigger.innerHTML = '<i class="fas fa-circle-question" aria-hidden="true"></i><span> Ayuda</span>'

    const overlay = document.createElement('div')
    overlay.id = 'help-overlay'
    overlay.className = 'help-overlay'
    overlay.hidden = true
    overlay.innerHTML = `
      <section class="help-dialog" role="dialog" aria-modal="false" aria-labelledby="help-title" tabindex="-1">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <p class="text-sm font-semibold mb-1">GUÍA RÁPIDA</p>
            <h2 id="help-title" class="text-2xl font-bold">Cómo usar MacroSync</h2>
          </div>
          <button type="button" class="help-dialog-close" data-help-close aria-label="Cerrar ayuda">Cerrar</button>
        </div>
        <p class="mb-5">Elige una sección desde el menú o desde la página principal. Aquí tienes una explicación breve de cada una:</p>
        <div class="space-y-4">
          ${sections.map((section) => `
            <article class="rounded-xl border border-white/10 p-4"${section.pages.includes(page) ? ' data-current-section="true"' : ''}>
              <h3 class="text-lg">${section.title}${section.pages.includes(page) ? ' · Estás aquí' : ''}</h3>
              <p class="mt-1">${section.description}</p>
              <p class="mt-2"><strong>Cómo empezar:</strong> ${section.steps}</p>
            </article>
          `).join('')}
        </div>
        <p class="mt-5 text-sm">Las estimaciones son orientativas. Usa tus datos actuales para obtener resultados más útiles.</p>
      </section>`

    document.body.append(trigger, overlay)
    const closeButton = overlay.querySelector('[data-help-close]')

    function closeHelp() {
      overlay.hidden = true
      trigger.setAttribute('aria-expanded', 'false')
      trigger.focus()
    }

    trigger.addEventListener('click', () => {
      const shouldOpen = overlay.hidden
      overlay.hidden = !shouldOpen
      trigger.setAttribute('aria-expanded', String(shouldOpen))
      if (shouldOpen) closeButton.focus()
    })
    closeButton.addEventListener('click', closeHelp)
    document.addEventListener('click', (event) => {
      if (!overlay.hidden && !overlay.contains(event.target) && !trigger.contains(event.target)) closeHelp()
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !overlay.hidden) closeHelp()
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize)
  else initialize()
})()
