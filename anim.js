(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  // 1. Apparition au défilement (fondu + légère montée), en cascade dans chaque groupe
  var items = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('in'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      group.querySelectorAll('[data-reveal]').forEach(function (el, i) {
        if (!el.hasAttribute('data-delay')) el.setAttribute('data-delay', String(i * 110));
      });
    });
    items.forEach(function (el) { io.observe(el); });
  }

  // 2. Compteurs : les chiffres montent jusqu'à leur valeur réelle
  var counters = document.querySelectorAll('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) counters.forEach(function (el) { el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || ''); });
  function format(n) { return n.toLocaleString('fr-FR').replace(/ | /g, ' '); }
  function run(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = prefix + format(target) + suffix; return; }
    var start = null, dur = 1400;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(run);
  }

  // 3. Barre du haut : ombre dès qu'on défile
  var nav = document.querySelector('.navbar');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 4. FAQ : une seule question ouverte à la fois
  var details = document.querySelectorAll('.faq2 details');
  details.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      details.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // Sécurité : si le navigateur ne déclenche pas l'observateur, tout s'affiche quand même
  setTimeout(function () {
    if (!document.querySelector('[data-reveal].in')) items.forEach(function (el) { el.classList.add('in'); });
    counters.forEach(function (el) {
      if (/^\D*0\D*$/.test(el.textContent)) el.textContent = (el.getAttribute('data-prefix') || '') + format(parseFloat(el.getAttribute('data-count'))) + (el.getAttribute('data-suffix') || '');
    });
  }, 3000);
})();
