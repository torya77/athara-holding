(function () {
  'use strict';

  // ─── NAV SCROLL STATE ───
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ─── HAMBURGER ───
  const hamburger = document.querySelector('.hamburger');
  const overlay = document.querySelector('.nav-overlay');
  hamburger?.addEventListener('click', () => {
    overlay?.classList.toggle('open');
    const open = overlay?.classList.contains('open');
    document.body.style.overflow = open ? 'hidden' : '';
    const spans = hamburger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  overlay?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      hamburger?.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // ─── ACTIVE NAV LINK ───
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-overlay a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ─── SCROLL REVEAL & COUNTER ───
  const animateCounter = (el) => {
    const target = parseInt(el.innerText);
    if (isNaN(target)) return;
    let count = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const update = () => {
      count += increment;
      if (count < target) {
        el.innerText = Math.floor(count);
        requestAnimationFrame(update);
      } else {
        el.innerText = target;
      }
    };
    update();
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        
        // Trigger counter if it's a stat-value
        if (e.target.classList.contains('stat-value')) {
          const valueEl = e.target.childNodes[0]; // Get the text before the span
          if (valueEl && valueEl.nodeType === Node.TEXT_NODE) {
            const originalVal = valueEl.textContent.trim();
            if (!isNaN(parseInt(originalVal))) {
              animateCounter(valueEl);
            }
          }
        }
        
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .stat-value').forEach((el, i) => {
    if (el.classList.contains('reveal')) {
      el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    }
    observer.observe(el);
  });

  // ─── UTM TRACKING ───
  const UTM_KEYS = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_term', 'utm_content', 'div'];
  const UTM_STORE = 'athara_utm';

  (function captureUtm() {
    const params = new URLSearchParams(window.location.search);
    const captured = {};
    UTM_KEYS.forEach(k => { const v = params.get(k); if (v) captured[k] = v; });
    if (Object.keys(captured).length) {
      try { sessionStorage.setItem(UTM_STORE, JSON.stringify(captured)); } catch (_) {}
    }
  })();

  (function injectUtmIntoContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    let utm = {};
    UTM_KEYS.forEach(k => { const v = params.get(k); if (v) utm[k] = v; });

    if (!Object.keys(utm).length) {
      try {
        const stored = sessionStorage.getItem(UTM_STORE);
        if (stored) utm = JSON.parse(stored);
      } catch (_) {}
    }

    if (!Object.keys(utm).length) return;

    Object.entries(utm).forEach(([key, val]) => {
      if (key === 'div') return;
      if (form.querySelector(`[name="${key}"]`)) return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    });

    if (utm.div) {
      const select = form.querySelector('select[name="division"]');
      if (select) select.value = utm.div;
    }
  })();

})();
