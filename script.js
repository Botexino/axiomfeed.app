// AxiomFeed — Main Client Script

// Global view switching
    var ptBusy = false;
    function switchView(label, fromId, toId) {
      var from = document.getElementById(fromId), to = document.getElementById(toId);
      if (ptBusy || !from.classList.contains('active')) return;
      var overlay = document.getElementById('pageTransition');
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      function swap() {
        from.classList.remove('active');
        to.classList.add('active'); window.scrollTo({ top: 0, behavior: 'instant' });
      }
      if (reduce) { swap(); return; }
      ptBusy = true;
      document.getElementById('ptLabel').textContent = label;
      overlay.classList.add('show');
      setTimeout(function () {
        swap();
        to.classList.add('entering');
        overlay.classList.remove('show');
        setTimeout(function () { to.classList.remove('entering'); ptBusy = false; }, 1200);
      }, 950);
    }

    function showSetup(e) {
      e.preventDefault();
      switchView('Loading', 'homeView', 'setupView');
    }

    function showHome(e) {
      e.preventDefault();
      switchView('Returning', 'setupView', 'homeView');
    }


// Ensure global functions are available for inline onclick handlers
window.switchView = switchView;
window.showSetup = showSetup;
window.showHome = showHome;

// Scroll reveal, counters, mouse glow
    (function () {
      "use strict";
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      // scroll reveal
      (function () {
        var els = [].slice.call(document.querySelectorAll('.reveal')); if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
        var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
        els.forEach(function (e) { io.observe(e); });
        // stagger siblings in grids so cards slide in one after another
        [].slice.call(document.querySelectorAll('.feat-grid')).forEach(function (g) { [].slice.call(g.querySelectorAll('.reveal')).forEach(function (c, i) { c.style.transitionDelay = (i * 110) + 'ms'; c.addEventListener('transitionend', function h(ev) { if (ev.propertyName === 'transform' && c.classList.contains('in')) { c.style.transitionDelay = ''; c.removeEventListener('transitionend', h); } }); }); });
        document.querySelectorAll('.hero .reveal').forEach(function (e) { e.classList.add('in'); });
      })();
      // counters
      (function () {
        function go(el) {
          var tgt = parseFloat(el.dataset.count || 0), dec = parseInt(el.dataset.dec || 0), sfx = el.dataset.suffix || ''; var s = null, dur = 1600;
          function step(ts) { if (!s) s = ts; var p = Math.min((ts - s) / dur, 1), ease = 1 - Math.pow(1 - p, 3); el.textContent = (dec ? (tgt * ease).toFixed(dec) : Math.floor(tgt * ease)) + sfx; if (p < 1) requestAnimationFrame(step); else el.textContent = (dec ? tgt.toFixed(dec) : tgt) + sfx; }
          requestAnimationFrame(step);
        }
        var ces = document.querySelectorAll('[data-count]'); if (reduce) { ces.forEach(function (e) { e.textContent = (e.dataset.dec ? parseFloat(e.dataset.count).toFixed(+e.dataset.dec) : e.dataset.count) + (e.dataset.suffix || ''); }); return; }
        var io2 = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { go(e.target); io2.unobserve(e.target); } }); }, { threshold: 0.3 }); ces.forEach(function (e) { io2.observe(e); });
      })();
      // mouse radial glow
      (function () {
        [document.getElementById('tweetCard'), document.getElementById('termCard')].forEach(function (c) { if (!c) return; c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); }); });
        document.querySelectorAll('.option-card').forEach(function (c) {
          var b = c.querySelector('.option-badge'); if (!b) return;
          function on() { c.classList.add('lit'); } function off() { c.classList.remove('lit'); }
          b.addEventListener('mouseenter', on); b.addEventListener('mouseleave', off); b.addEventListener('focus', on); b.addEventListener('blur', off);
        });
        document.querySelectorAll('.feat').forEach(function (f) { f.addEventListener('mousemove', function (e) { var r = f.getBoundingClientRect(); f.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); f.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); }); });
      })();
    })();

// Bookmarklet badge drag and click behavior
    /* badges are bookmarklets: drag them to the bookmarks bar; a plain click does nothing here */
    document.querySelectorAll('a.option-badge').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); });
      
      /* Set custom drag ghost image with the Axiom logo so it clearly shows the logo while dragging */
      a.addEventListener('dragstart', function (e) {
        var ghost = document.createElement('div');
        ghost.className = 'bm-drag-ghost';
        ghost.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="12,2 17,11 7,11" fill="#ffffff" /><polygon points="6,13 18,13 22,21 2,21" fill="#ffffff" /></svg><span>' + (a.textContent.trim()) + '</span>';
        document.body.appendChild(ghost);
        if (e.dataTransfer && e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(ghost, 22, 16);
        }
        setTimeout(function () {
          if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        }, 0);
      });
    });

// Smooth inertia scrolling and anchor gliding
    /* smooth inertia scrolling */
    (function () {
      if (window.matchMedia('(prefers-reduced-motion:reduce)').matches || window.matchMedia('(pointer:coarse)').matches) return;
      var de = document.documentElement, target = window.scrollY, current = window.scrollY, raf = null, EASE = .085;
      de.style.scrollBehavior = 'auto';
      function max() { return Math.max(0, de.scrollHeight - window.innerHeight) }
      function clamp(v) { return Math.max(0, Math.min(max(), v)) }
      function loop() {
        var d = target - current;
        if (Math.abs(d) < .5) { current = target; window.scrollTo(0, current); raf = null; return }
        current += d * EASE; window.scrollTo(0, current); raf = requestAnimationFrame(loop);
      }
      function start() { if (!raf) raf = requestAnimationFrame(loop) }
      window.addEventListener('wheel', function (e) {
        if (e.ctrlKey || e.defaultPrevented) return;
        var el = e.target;
        while (el && el !== document.body && el !== de) {
          if (el.scrollHeight > el.clientHeight && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return;
          el = el.parentElement;
        }
        e.preventDefault();
        var dy = e.deltaY;
        if (e.deltaMode === 1) dy *= 32; else if (e.deltaMode === 2) dy *= window.innerHeight;
        if (!raf) { current = window.scrollY; target = current }
        target = clamp(target + dy); start();
      }, { passive: false });
      /* stay in sync when the page scrolls some other way (scrollbar drag, keyboard, view switch) */
      window.addEventListener('scroll', function () { if (!raf) { current = target = window.scrollY } });
      window.addEventListener('resize', function () { target = clamp(target) });
      /* nav / anchor links glide too */
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        a.addEventListener('click', function (e) {
          var t = document.querySelector(id); if (!t) return;
          e.preventDefault();
          current = window.scrollY;
          target = clamp(t.getBoundingClientRect().top + window.scrollY - 68);
          start();
        });
      });
    })();