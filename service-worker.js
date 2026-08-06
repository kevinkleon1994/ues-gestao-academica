const CACHE='ues-pwa-v3.1.2-enterprise';
const OFFLINE='./offline.html';
const ASSETS=['./','./index.html','./offline.html','./manifest.webmanifest','./config.js','./ues-logo.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon-16.png','./favicon-32.png','./favicon-48.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  const isNavigation=event.request.mode==='navigate';
  const networkFirst=isNavigation || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/config.js') || url.pathname.endsWith('/manifest.webmanifest');
  if(networkFirst){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
    }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match(OFFLINE))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
  }).catch(()=>caches.match(OFFLINE))));
});
