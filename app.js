// Detects the visitor's system and, when GitHub answers, upgrades the links to the newest release.
// Without JavaScript the page still works: both buttons link to the release listed in the HTML.
(function () {
  document.documentElement.classList.add('js');
  var ua = navigator.userAgent || '';
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  var mobile = /Android|iPhone|iPad|iPod/i.test(ua) || (/Mac/.test(platform) && navigator.maxTouchPoints > 1);
  var os = mobile ? null : /Win/i.test(platform + ua) ? 'win' : /Mac/i.test(platform + ua) ? 'mac' : null;

  var box = document.getElementById('downloads');
  if (os && box) {
    box.classList.add('detected');
    var yours = box.querySelector('[data-os="' + os + '"]');
    if (yours) yours.classList.add('is-yours');
  }
  var note = document.getElementById('mobile-note');
  if (mobile && note) note.hidden = false;

  // Fade-up on scroll (skipped entirely for reduced motion or without IntersectionObserver).
  var items = document.querySelectorAll('.reveal');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Newest release: links and SHA-256 checksums come from release.json in this same repository.
  var OFFICIAL = 'https://github.com/Fawaz3469/sprint-app/releases/';
  fetch(new URL('release.json', document.querySelector('script[src$="app.js"]').src), { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (rel) {
      var apply = function (key, link, hash, verify, name) {
        var a = rel[key];
        if (!document.getElementById(link) || !a || typeof a.url !== 'string' || a.url.indexOf(OFFICIAL) !== 0 || !/^[0-9a-f]{64}$/.test(a.sha256)) return;
        document.getElementById(link).href = a.url;
        if (hash) { var h = document.getElementById(hash); h.textContent = a.sha256.slice(0, 8) + '\u2026' + a.sha256.slice(-8); h.title = a.sha256; }
        document.getElementById(verify).textContent = a.sha256;
        document.getElementById(name).textContent = a.name;
      };
      apply('mac', 'dl-mac', 'h-mac', 'v-mac', 'vn-mac');
      apply('win', 'dl-win', 'h-win', 'v-win', 'vn-win');
      apply('msi', 'dl-msi', null, 'v-msi', 'vn-msi');
      document.querySelectorAll('.ver').forEach(function (el) { el.textContent = 'v' + String(rel.version || '').replace(/^v/, ''); });
    })
    .catch(function () {});
})();
