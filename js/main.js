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

})();
