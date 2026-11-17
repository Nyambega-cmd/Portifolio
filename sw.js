const CACHE = 'knm-v3';
const CORE = ['./', 'index.html', 'css/style.css', 'js/main.js', 'js/config.js', 'assets/images/kevin-profile.jpg', 'assets/images/bevel-gear-trimmer.svg', 'assets/images/epoe-tracker-ui.svg', 'assets/images/welding-fabrication.svg', 'assets/images/cad-blueprints.svg', 'assets/docs/Kevin_Mongare_CV.pdf', 'assets/docs/Degree_Certificate.pdf', 'assets/docs/TVET_License.pdf', 'manifest.json', 'assets/images/icon-192.png', 'assets/images/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return; // skip forms/fonts/APIs
  e.respondWith(
    fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
