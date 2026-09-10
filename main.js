/* Atelier Norte — main.js
   Preloader · Cursor · Magnéticos · Reveals · Parallax · Marquee · Contadores */

(() => {
  'use strict';

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloaderBar');
  let progress = 0;

  const fakeLoad = setInterval(() => {
    progress = Math.min(progress + Math.random() * 18, 100);
    bar.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(fakeLoad);
      setTimeout(() => {
        preloader.classList.add('is-done');
        startHeroReveal();
      }, 450);
    }
  }, 180);

  /* ---------- Cursor personalizado ---------- */
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function cursorLoop() {
    cx += (mx - cx) * 0.12;   // suavizado tipo lerp
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(cursorLoop);
  })();

  document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });

  /* ---------- Botones magnéticos ---------- */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const strength = 0.35;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transition = 'transform 0.1s ease-out';
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1.4, 0.36, 1)';
      el.style.transform = 'translate(0, 0)';
    });
  });

  /* ---------- Atracción suave (proyectos) ---------- */
  document.querySelectorAll('[data-magnetic-soft]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.06;
      const y = (e.clientY - r.top - r.height / 2) * 0.06;
      el.style.transition = 'transform 0.15s ease-out';
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = 'translate(0, 0)';
    });
  });

  /* ---------- Reveal del hero ---------- */
  function startHeroReveal() {
    animeLines('.hero__title-line > span', 0.12, 1.1);
    animeLines('.hero .reveal-line > span', 0.12, 1.1, 0.5);
  }

  function animeLines(selector, stagger, duration, delay = 0) {
    const els = document.querySelectorAll(selector);
    els.forEach((el, i) => {
      el.style.transition = `transform ${duration}s cubic-bezier(0.65,0,0.35,1) ${delay + i * stagger}s`;
      el.style.transform = 'translateY(0)';
    });
  }

  /* ---------- IntersectionObserver: reveals + contadores ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.classList.contains('reveal-line')) {
        const inner = el.querySelector('span');
        inner.style.transition = 'transform 1s cubic-bezier(0.65,0,0.35,1)';
        inner.style.transform = 'translateY(0)';
        io.unobserve(el);
      }
      if (el.classList.contains('stat__num')) {
        countUp(el);
        io.unobserve(el);
      }
      if (el.classList.contains('project')) {
        el.style.transition = 'opacity 1s ease, transform 1.2s cubic-bezier(0.22,1,0.36,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        io.unobserve(el);
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.reveal-line, .stat__num, .project').forEach(el => io.observe(el));

  /* Proyectos empiezan ocultos (solo si JS activo) */
  document.querySelectorAll('.project').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(60px)';
  });

  /* ---------- Contadores ---------- */
  function countUp(el) {
    const target = +el.dataset.count;
    const dur = 1600;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------- Texto "about" palabra a palabra ---------- */
  const aboutText = document.getElementById('aboutText');
  if (aboutText) {
    const words = aboutText.textContent.trim().split(/\s+/);
    aboutText.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
    const wordEls = aboutText.querySelectorAll('.word');
    addEventListener('scroll', () => {
      const r = aboutText.getBoundingClientRect();
      const progress = Math.min(Math.max((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0), 1);
      const visible = Math.floor(progress * wordEls.length);
      wordEls.forEach((w, i) => (w.style.opacity = i <= visible ? '1' : '0.12'));
    }, { passive: true });
  }

  /* ---------- Parallax en imágenes de proyectos y hero ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const heroBg = document.getElementById('heroBg');
  addEventListener('scroll', () => {
    const y = scrollY;
    if (heroBg) heroBg.style.transform = `translateY(${y * 0.35}px) scale(${1 + y * 0.0004})`;
    parallaxEls.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1
      el.style.transform = `translateY(${p * -30}px) scale(1.15)`;
    });
  }, { passive: true });

  /* ---------- Marquee infinito (velocidad según scroll) ---------- */
  const track = document.getElementById('marqueeTrack');
  let marqueeX = 0, lastScroll = scrollY, scrollVel = 0;

  (function marqueeLoop() {
    const current = scrollY;
    scrollVel += (Math.abs(current - lastScroll) * 0.06 - scrollVel) * 0.1;
    lastScroll = current;
    marqueeX -= 0.6 + scrollVel;
    const half = track.scrollWidth / 2;
    if (Math.abs(marqueeX) >= half) marqueeX += half;
    track.style.transform = `translateX(${marqueeX}px)`;
    requestAnimationFrame(marqueeLoop);
  })();

  /* ---------- Nav: ocultar al bajar, mostrar al subir ---------- */
  const nav = document.getElementById('nav');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.style.transform = (y > lastY && y > 150) ? 'translateY(-110%)' : 'translateY(0)';
    nav.style.transition = 'transform 0.5s cubic-bezier(0.65,0,0.35,1)';
    lastY = y;
  }, { passive: true });

})();
