// fix-overflow.js
// Detecta y corrige elementos que sobresalen del viewport en móviles.
(function() {
  function clampOverflow() {
    try {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      document.documentElement.style.width = '100vw';
      document.body.style.width = '100vw';
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflowX = 'hidden';

      const nodes = Array.from(document.querySelectorAll('body *'));
      const offenders = [];
      nodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        // ignore invisible or tiny nodes
        if (rect.width < 10) return;
        if (rect.right > vw + 0.5) {
          offenders.push({node, rect});
          // Apply corrective styles
          node.style.maxWidth = '100vw';
          node.style.boxSizing = 'border-box';
          node.style.overflowX = 'hidden';
          node.style.marginLeft = node.style.marginLeft || '';
          // Add subtle outline so user can see which element was fixed (remove later)
          node.style.outline = '2px solid rgba(255,0,0,0.06)';
          node.dataset._overflowFixed = '1';
        }
      });

      if (offenders.length) {
        console.warn('fix-overflow: elementos que sobresalían y fueron corregidos:', offenders.map(o => ({tag: o.node.tagName, class: o.node.className, rect: o.rect})).slice(0,20));
        showOverlay(offenders);
      } else {
        console.debug('fix-overflow: no se detectaron elementos sobresalientes.');
        removeOverlay();
      }
    } catch (err) {
      console.error('fix-overflow error', err);
    }
  }

  // Run after load and on orientation/resize (throttled)
  let t;
  function schedule() {
    clearTimeout(t);
    t = setTimeout(clampOverflow, 120);
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') clampOverflow();
  else document.addEventListener('DOMContentLoaded', clampOverflow);
  window.addEventListener('orientationchange', schedule);
  window.addEventListener('resize', schedule);
})();

/* Overlay UI helpers */
function showOverlay(offenders) {
  try {
    let panel = document.getElementById('__fix_overflow_panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = '__fix_overflow_panel';
      panel.style.position = 'fixed';
      panel.style.right = '8px';
      panel.style.bottom = '8px';
      panel.style.zIndex = 99999;
      panel.style.background = 'rgba(0,0,0,0.6)';
      panel.style.color = '#fff';
      panel.style.padding = '8px 10px';
      panel.style.borderRadius = '8px';
      panel.style.fontSize = '12px';
      panel.style.maxWidth = '45vw';
      panel.style.backdropFilter = 'blur(4px)';
      panel.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
      panel.style.cursor = 'pointer';
      panel.addEventListener('click', () => { panel.style.display = 'none'; });
      document.body.appendChild(panel);
    }
    panel.innerHTML = `<strong>Overflow corregido:</strong><br>${offenders.slice(0,6).map(o=>`<span style="opacity:0.9">&lt;${o.node.tagName.toLowerCase()} class="${o.node.className}"&gt;</span>`).join('<br>')}${offenders.length>6?`<div style="opacity:0.7">+${offenders.length-6} más...</div>`:''}`;
  } catch(e) { console.error(e); }
}

function removeOverlay(){ const p=document.getElementById('__fix_overflow_panel'); if(p) p.remove(); }
