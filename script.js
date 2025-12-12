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
  
// --- Contact form handler (append to script.js) ---
(function () {
    // safe init after DOM ready (your file already has ready wrapper; this is independent and safe)
    function initContactForm() {
      try {
        const form = document.getElementById('contact-form');
        if (!form) return;
  
        const submitBtn = document.getElementById('contact-submit');
        const submitText = document.getElementById('submit-text');
        const submitSpinner = document.getElementById('submit-spinner');
        const feedback = document.getElementById('contact-feedback');
  
        async function showFeedback(message, type = 'success') {
          feedback.textContent = message;
          feedback.classList.remove('success','error');
          feedback.classList.add(type);
        }
  
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
  
          // Basic client validation
          const name = form.name.value.trim();
          const email = form.email.value.trim();
          const message = form.message ? form.message.value.trim() : '';
  
          if (!name || !email) {
            showFeedback('Please enter name and email.', 'error');
            return;
          }
  
          // disable UI
          submitBtn.disabled = true;
          submitText.textContent = 'Sending';
          submitSpinner.style.display = 'inline';
  
          try {
            const res = await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, message })
            });
  
            const json = await res.json().catch(() => ({}));
  
            if (res.ok) {
              showFeedback('Thanks — message sent. I will reply within one business day.', 'success');
              form.reset();
            } else {
              const err = json && json.error ? json.error : 'Server error. Try again later.';
              showFeedback(err, 'error');
            }
          } catch (err) {
            console.error('Network error:', err);
            showFeedback('Network error. Check your connection and try again.', 'error');
          } finally {
            // re-enable UI
            submitBtn.disabled = false;
            submitText.textContent = 'Send';
            submitSpinner.style.display = 'none';
          }
        });
      } catch (e) {
        console.error('Contact init error:', e);
      }
    }
  
    // connect with the same ready() approach used above to avoid duplication
    if (document.readyState !== 'loading') initContactForm();
    else document.addEventListener('DOMContentLoaded', initContactForm);
  })();
  