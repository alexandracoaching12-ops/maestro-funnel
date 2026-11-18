/* MAESTRO — suivi (pixel Meta) avec consentement, comme l'exige la CNIL.
   1. Colle ton identifiant de pixel Meta ci-dessous (Gestionnaire d'événements Meta > ton pixel > ID).
   2. Le pixel ne se charge QUE si le visiteur clique sur « Accepter ». */
var MAESTRO_PIXEL_ID = ''; // ex. '123456789012345'

(function () {
  var KEY = 'maestro-consent';
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  function loadPixel() {
    if (!MAESTRO_PIXEL_ID || window.fbq) return;
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', MAESTRO_PIXEL_ID);
    window.fbq('track', 'PageView');
    var ev = document.body && document.body.getAttribute('data-track');
    if (ev) window.fbq('track', ev); // « Lead » sur la page de remerciement
  }

  // Événement appelé par les pages (ex. réservation faite)
  window.maestroTrack = function (name) { if (window.fbq) window.fbq('track', name); };

  function banner() {
    var box = document.createElement('div');
    box.className = 'consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookies');
    box.innerHTML = '<p>J\'utilise un cookie de mesure (Meta) pour savoir quelles publicités amènent des visiteurs. Rien d\'autre. <a href="confidentialite.html">En savoir plus</a></p><div class="consent-btns"><button type="button" data-v="no">Refuser</button><button type="button" data-v="yes" class="yes">Accepter</button></div>';
    box.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute('data-v');
      if (!v) return;
      store(v);
      box.remove();
      if (v === 'yes') loadPixel();
    });
    document.body.appendChild(box);
  }

  function start() {
    var c = read();
    if (c === 'yes') loadPixel();
    else if (c !== 'no' && MAESTRO_PIXEL_ID) banner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
