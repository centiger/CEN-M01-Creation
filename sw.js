const CACHE='cen-m01-creation-installable-v20260615a';
const ASSETS=[
  '/CEN-M01-Creation/',
  '/CEN-M01-Creation/index.html',
  '/CEN-M01-Creation/manifest.json',
  '/CEN-M01-Creation/manifest.webmanifest',
  '/CEN-M01-Creation/icons/icon-192.png',
  '/CEN-M01-Creation/icons/icon-512.png'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.includes('cen-m01-creation')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>caches.match(e.request)));});
