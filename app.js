// Detects the visitor's system and, when GitHub answers, upgrades the links to the newest release.
// Without JavaScript the page still works: both buttons link to the release listed in the HTML.
(function () {
  document.documentElement.classList.add('js');
  var ua = navigator.userAgent || '';
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  var mobile = /Android|iPhone|iPad|iPod/i.test(ua) || (/Mac/.test(platform) && navigator.maxTouchPoints > 1);
  var os = mobile ? null : /Win/i.test(platform + ua) ? 'win' : /Mac/i.test(platform + ua) ? 'mac' : null;

  var box = document.getElementById('downloads');
  if (os) {
    box.classList.add('detected');
    var yours = box.querySelector('[data-os="' + os + '"]');
    if (yours) yours.classList.add('is-yours');
  }
  if (mobile) document.getElementById('mobile-note').hidden = false;

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

  // The Sign in popover closes on Escape or a click elsewhere.
  var pop = document.getElementById('signin');
  document.addEventListener('click', function (e) { if (pop.open && !pop.contains(e.target)) pop.open = false; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop.open) { pop.open = false; pop.querySelector('summary').focus(); } });

  fetch('https://api.github.com/repos/Fawaz3469/sprint-app/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (rel) {
      var find = function (re) {
        var a = (rel.assets || []).filter(function (x) { return re.test(x.name); })[0];
        return a && a.browser_download_url;
      };
      var set = function (id, url) { if (url && url.indexOf('https://github.com/Fawaz3469/sprint-app/') === 0) document.getElementById(id).href = url; };
      set('dl-mac', find(/\.dmg$/));
      set('dl-win', find(/setup\.exe$/) || find(/\.exe$/));
      set('dl-msi', find(/\.msi$/));
      var v = 'v' + String(rel.tag_name || '').replace(/^v/, '');
      document.querySelectorAll('.ver').forEach(function (el) { el.textContent = v; });
    })
    .catch(function () {});
})();
