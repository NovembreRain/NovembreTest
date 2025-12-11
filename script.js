// script.js - matches original visual behavior with optimizations

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    try {
      const stormOverlay = document.querySelector('.storm-overlay');
      const lightning = document.querySelector('.lightning');
      const sections = document.querySelectorAll('main section, .section');

      // Smooth scroll for nav links
      const navLinks = document.querySelectorAll('.nav-links a');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const targetId = link.getAttribute('href');
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // IntersectionObserver to reveal sections (adds 'visible' class)
      if ('IntersectionObserver' in window && sections.length) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        sections.forEach(s => obs.observe(s));
      } else {
        sections.forEach(s => s.classList.add('visible'));
      }

      // LIGHTNING: trigger a brief CSS animation occasionally
      let lightningTimeout = null;
      function triggerLightning() {
        if (!lightning) return;
        lightning.classList.add('flash');
        setTimeout(() => lightning.classList.remove('flash'), 500);
      }
      function scheduleLightning() {
        const delay = Math.random() * 12000 + 6000; // 6-18s
        lightningTimeout = setTimeout(() => {
          triggerLightning();
          scheduleLightning();
        }, delay);
      }
      if (lightning) scheduleLightning();

      // STORM overlay: throttled mousemove using rAF
      let rafId = null;
      let lastX = 0, lastY = 0;
      function updateOverlay(x, y) {
        if (!stormOverlay) return;
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
        const px = clamp(20 + x * 10, 0, 100);
        const py = clamp(80 - y * 10, 0, 100);
        const px2 = clamp(80 - x * 10, 0, 100);
        const py2 = clamp(20 + y * 10, 0, 100);
        stormOverlay.style.background = `
          radial-gradient(ellipse at ${px}% ${py}%, rgba(75, 14, 107, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse at ${px2}% ${py2}%, rgba(123, 44, 191, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(45, 10, 62, 0.8) 0%, transparent 70%)
        `;
      }
      document.addEventListener('mousemove', (e) => {
        lastX = e.clientX / window.innerWidth;
        lastY = e.clientY / window.innerHeight;
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            updateOverlay(lastX, lastY);
            rafId = null;
          });
        }
      }, { passive: true });

      // Pause visuals when tab not focused
      window.addEventListener('blur', () => {
        if (lightningTimeout) clearTimeout(lightningTimeout);
        if (lightning) lightning.classList.remove('flash');
        if (stormOverlay) stormOverlay.style.opacity = '0.8';
      });
      window.addEventListener('focus', () => {
        if (stormOverlay) stormOverlay.style.opacity = '1';
        if (!lightningTimeout && lightning) scheduleLightning();
      });

    } catch (err) {
      console.error('Init script error:', err);
    }
  });
})();
  