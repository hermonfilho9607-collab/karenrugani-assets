/* Dra. Karen Rugani — interações da landing page */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  var WA_NUMBER = '5531992303895';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) return localStorage.removeItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---------- Links de tratamento com mensagem específica ---------- */
  document.querySelectorAll('[data-trat]').forEach(function (a) {
    var msg = 'Olá, Dra. Karen! Vim pelo site e gostaria de saber mais e agendar uma avaliação para ' + a.getAttribute('data-trat') + '.';
    a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
    a.setAttribute('aria-label', 'Saiba mais e agende: ' + a.getAttribute('data-trat') + ' (abre o WhatsApp)');
  });

  /* ---------- Cabeçalho ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 960px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* ---------- Revelação ao rolar ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Carrosséis (sem rotação automática) ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var slides = Array.prototype.slice.call(track.children);
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var status = root.querySelector('.carousel-status');
    var current = 0;

    function index() {
      var left = track.scrollLeft, best = 0, min = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft - track.offsetLeft - left - parseFloat(getComputedStyle(track).paddingLeft || 0));
        if (d < min) { min = d; best = i; }
      });
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      return atEnd ? slides.length - 1 : best;
    }
    function update() {
      current = index();
      status.textContent = pad(current + 1) + ' / ' + pad(slides.length);
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
    }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var pad = parseFloat(getComputedStyle(track).paddingLeft || 0);
      current = i;
      status.textContent = pad(i + 1) + ' / ' + pad(slides.length);
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft - pad, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { go(current - 1); });
    next.addEventListener('click', function () { go(current + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });
    var t;
    track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 80); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Mapa (carrega só com consentimento) ---------- */
  var mapBox = document.getElementById('mapa');
  function loadMap() {
    if (!mapBox || mapBox.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = mapBox.getAttribute('data-src');
    f.title = 'Mapa: R. dos Aimorés, 2578, Lourdes, Belo Horizonte';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.setAttribute('allowfullscreen', '');
    mapBox.appendChild(f);
    var ph = mapBox.querySelector('.map-placeholder');
    if (ph) ph.hidden = true;
  }
  var mapBtn = document.querySelector('[data-load-map]');
  if (mapBtn) mapBtn.addEventListener('click', loadMap);

  /* ---------- Cookies (LGPD) ---------- */
  var KEY = 'kr-cookie-consent';
  var banner = document.querySelector('.cookie-banner');
  function setBannerOffset() {
    document.body.style.setProperty('--cookie-h', banner.offsetHeight + 12 + 'px');
  }
  function showBanner() {
    banner.hidden = false;
    document.body.classList.add('cookie-visible');
    setBannerOffset();
  }
  function hideBanner() {
    banner.hidden = true;
    document.body.classList.remove('cookie-visible');
  }
  var consent = store(KEY);
  if (consent === 'all') loadMap();
  if (!consent) showBanner();
  window.addEventListener('resize', function () { if (!banner.hidden) setBannerOffset(); });

  banner.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cookie]');
    if (!btn) return;
    var choice = btn.getAttribute('data-cookie');
    store(KEY, choice);
    if (choice === 'all') loadMap();
    hideBanner();
  });
  var openPrivacy = document.querySelector('[data-open-privacy]');
  if (openPrivacy) openPrivacy.addEventListener('click', function () {
    var d = document.getElementById('privacidade'); if (d) d.open = true;
  });
  var reset = document.querySelector('[data-reset-cookies]');
  if (reset) reset.addEventListener('click', function () { store(KEY, null); showBanner(); banner.querySelector('button').focus(); });

  /* ---------- Ano ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
