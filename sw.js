const CACHE='napifal-shell-v1.2.0';
const ROOT=new URL('./',self.location.href).href;
const ASSETS=['./','./index.html','./style.css','./app.js','./model.js','./manifest.webmanifest','./handwriting.ttf','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const path of ASSETS){const url=new URL(path,ROOT);const response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin'}));if(!response.ok||response.redirected)throw Error('Nem tölthető le az offline fájl: '+path);await cache.put(url,response);}
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('napifal-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
  // Only application assets are cached; no user data or authentication endpoints.
  const known=ASSETS.some(p=>new URL(p,ROOT).pathname===url.pathname);
  if(!known)return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE);if(event.request.mode==='navigate'){const shell=await cache.match(new URL('./index.html',ROOT));if(shell)return shell;}const hit=await cache.match(url.pathname);return hit||fetch(event.request);})());
});

