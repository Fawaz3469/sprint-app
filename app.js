// Detects the visitor's system and upgrades links and checksums from release.json (same origin).
// Without JavaScript the page still works: the buttons link to the release listed in the HTML.
(function () {
  document.documentElement.classList.add('js');
  var ua = navigator.userAgent || '';
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  var mobile = /Android|iPhone|iPad|iPod/i.test(ua) || (/Mac/.test(platform) && navigator.maxTouchPoints > 1);
  var os = mobile ? null : /Win/i.test(platform + ua) ? 'win' : /Mac/i.test(platform + ua) ? 'mac' : null;

  // The visitor's own system keeps the yellow fill; the other button becomes outlined.
  document.querySelectorAll('.downloads').forEach(function (box) {
    if (!os) return;
    box.classList.add('detected');
    var yours = box.querySelector('[data-os="' + os + '"]');
    if (yours) yours.classList.add('is-yours');
  });
  var note = document.getElementById('mobile-note');
  if (mobile && note) note.hidden = false;

  // Fade-up on scroll (skipped for reduced motion or without IntersectionObserver).
  var items = document.querySelectorAll('.reveal');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Newest release: links and SHA-256 values come from release.json in this repository.
  var OFFICIAL = 'https://github.com/Fawaz3469/sprint-app/releases/';
  fetch(new URL('release.json', document.querySelector('script[src*="app.js"]').src), { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (rel) {
      ['mac', 'win', 'msi'].forEach(function (k) {
        var a = rel[k];
        if (!a || typeof a.url !== 'string' || a.url.indexOf(OFFICIAL) !== 0 || !/^[0-9a-f]{64}$/.test(a.sha256)) return;
        document.querySelectorAll('[data-dl="' + k + '"]').forEach(function (el) { el.href = a.url; });
        document.querySelectorAll('[data-full="' + k + '"]').forEach(function (el) { el.textContent = a.sha256; });
        document.querySelectorAll('[data-name="' + k + '"]').forEach(function (el) { el.textContent = a.name; });
      });
      document.querySelectorAll('.ver').forEach(function (el) { el.textContent = 'v' + String(rel.version || '').replace(/^v/, ''); });
    })
    .catch(function () {});
})();
