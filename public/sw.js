/* Cache large Vosk models separately from the application shell.
   Browser/OS may still suspend background Service Workers. */
const CACHE_NAME='speaking-try-vosk-lgraph-v1';
const MODEL_PATH='/\-Speaking/models/vosk-model-en-us-0.22-lgraph.tar.gz';
self.addEventListener('install', event=>{self.skipWaiting();});
self.addEventListener('activate', event=>{event.waitUntil(self.clients.claim());});
async function cacheModel(url, reply){
  const cache=await caches.open(CACHE_NAME);
  const hit=await cache.match(url);
  if(hit){reply('cached');return;}
  reply('downloading');
  const response=await fetch(url,{cache:'force-cache'});
  if(!response.ok)throw new Error('モデル取得エラー: HTTP '+response.status);
  await cache.put(url,response);
  reply('cached');
}
self.addEventListener('message',event=>{
  if(event.data?.type!=='CACHE_VOSK_MODEL')return;
  const port=event.ports?.[0];
  const reply=(state,error)=>{try{port?.postMessage({state,error})}catch{}};
  const url=new URL('./models/vosk-model-en-us-0.22-lgraph.tar.gz',self.registration.scope).href;
  event.waitUntil(cacheModel(url,reply).catch(err=>reply('error',err?.message||String(err))));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||
      !url.pathname.endsWith('/models/vosk-model-en-us-0.22-lgraph.tar.gz'))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(event.request);
    if(cached)return cached;
    const response=await fetch(event.request);
    if(response.ok){try{await cache.put(event.request,response.clone())}catch{}}
    return response;
  })());
});
