(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  // 1. Apparitions au défilement, en cascade dans chaque groupe
  var items = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    document.querySelectorAll('[data-stagger]').forEach(function (g) {
      g.querySelectorAll('[data-reveal]').forEach(function (el, i) { el.style.transitionDelay = (i * 90) + 'ms'; });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!document.querySelector('[data-reveal].is-in')) items.forEach(function (el) { el.classList.add('is-in'); }); }, 2500);
  }

  // 2. Compteurs
  function fmt(n) { return n.toLocaleString('fr-FR').replace(/ | /g, ' '); }
  function count(el) {
    var t = parseFloat(el.getAttribute('data-count')), p = el.getAttribute('data-prefix') || '', s = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = p + fmt(t) + s; return; }
    var st = null;
    (function step(ts) { if (!st) st = ts; var k = Math.min((ts - st) / 1600, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = p + fmt(Math.round(t * e)) + s; if (k < 1) requestAnimationFrame(step); })(performance.now());
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    counters.forEach(function (el) { el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || ''); });
    var co = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } }); }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  // 3. Barre de navigation : blanche sur fond bleu, bleue sur fond blanc
  var nav = document.getElementById('nav');
  var toned = Array.prototype.slice.call(document.querySelectorAll('section[data-tone], .marquee[data-tone], footer[data-tone]'));
  function navTone() {
    var y = nav.offsetHeight / 2, tone = 'dark';
    for (var i = 0; i < toned.length; i++) { var r = toned[i].getBoundingClientRect(); if (r.top <= y && r.bottom > y) { tone = toned[i].getAttribute('data-tone'); break; } }
    nav.setAttribute('data-tone', tone);
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }

  // 4. Frise de la méthode : la ligne se remplit au défilement
  var tl = document.getElementById('timeline');
  var steps = tl ? tl.querySelectorAll(':scope > li') : [];
  function timeline() {
    if (!tl || !steps.length) return;
    var dots = tl.querySelectorAll('.tl-dot');
    var first = dots[0], last = dots[dots.length - 1];
    var tr = tl.getBoundingClientRect(), fr = first.getBoundingClientRect(), lr = last.getBoundingClientRect();
    var top = fr.top - tr.top + fr.height / 2;
    var len = (lr.top - tr.top + lr.height / 2) - top;
    tl.style.setProperty('--line-top', top + 'px');
    tl.style.setProperty('--line-h', len + 'px');
    var vh = window.innerHeight;
    var p = Math.max(0, Math.min(1, (vh * 0.6 - (tr.top + top)) / len));
    tl.style.setProperty('--prog', (p * len).toFixed(1) + 'px');
    steps.forEach(function (li) { var b = li.querySelector('.tl-dot').getBoundingClientRect(); li.classList.toggle('lit', b.top + 24 < vh * 0.6); });
  }

  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { navTone(); timeline(); ticking = false; }); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  navTone(); timeline();

  // 5. Carrousel « La liberté de… »
  var track = document.getElementById('slides');
  if (track) {
    var slides = track.querySelectorAll('.slide'), dots = document.getElementById('dots');
    slides.forEach(function (s, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Aller à la carte ' + (i + 1));
      b.addEventListener('click', function () { go(i); }); dots.appendChild(b);
    });
    function current() { var x = track.scrollLeft, best = 0, d = 1e9; slides.forEach(function (s, i) { var dd = Math.abs(s.offsetLeft - track.offsetLeft - x); if (dd < d) { d = dd; best = i; } }); return best; }
    function mark() { var c = current(); dots.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('on', i === c); }); }
    function go(i) { i = (i + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' }); }
    document.getElementById('prev').addEventListener('click', function () { go(current() - 1); stop(); auto = false; });
    document.getElementById('next').addEventListener('click', function () { go(current() + 1); stop(); auto = false; });
    track.addEventListener('scroll', function () { requestAnimationFrame(mark); }, { passive: true });
    mark();
    // défilement automatique doux, arrêté dès que le visiteur interagit
    var auto = null;
    function stop() { if (auto) { clearInterval(auto); auto = null; } }
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en.forEach(function (e) {
        if (e.isIntersecting && auto === null) auto = setInterval(function () { go(current() + 1); }, 4500);
        if (!e.isIntersecting && auto) stop();
      }); }, { threshold: 0.5 }).observe(track);
      ['pointerdown', 'wheel', 'touchstart'].forEach(function (ev) { track.addEventListener(ev, function () { stop(); auto = false; }, { passive: true }); });
    }
  }

  // 6. FAQ : une seule question ouverte
  var details = document.querySelectorAll('.faq2 details');
  details.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) details.forEach(function (o) { if (o !== d) o.open = false; }); }); });
})();
