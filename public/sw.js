/* Cache the large Vosk model and report actual network bytes to the loading page.
   Background execution may be throttled or suspended by the browser/OS. */
const CACHE_NAME='speaking-try-vosk-lgraph-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));

async function cacheModel(url,report){
  const cache=await caches.open(CACHE_NAME);
  const cached=await cache.match(url);
  if(cached){
    report({state:'cached',loaded:Number(cached.headers.get('content-length'))||null,fromCache:true});
    return;
  }
  report({state:'connecting'});
  const response=await fetch(url,{cache:'force-cache'});
  if(!response.ok)throw new Error('モデルのダウンロードに失敗：HTTP '+response.status);
  const total=Number(response.headers.get('content-length'))||null;
  report({state:'downloading',loaded:0,total});
  if(!response.body){
    await cache.put(url,response);
    report({state:'cached',loaded:total,total});
    return;
  }
  // Cache one branch while counting received bytes on the other branch.
  const cacheTask=cache.put(url,response.clone());
  const reader=response.body.getReader();
  let loaded=0,lastReport=0;
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      loaded+=value.byteLength;
      const now=Date.now();
      if(now-lastReport>350){
        report({state:'progress',loaded,total});
        lastReport=now;
      }
    }
    await cacheTask;
    report({state:'cached',loaded,total,fromCache:false});
  }catch(err){
    reader.cancel().catch(()=>{});
    // Ensure a failed partial download is never presented as a valid cached file.
    try{await cache.delete(url)}catch{}
    throw err;
  }
}
self.addEventListener('message',event=>{
  if(event.data?.type!=='CACHE_VOSK_MODEL')return;
  const port=event.ports?.[0];
  const report=payload=>{try{port?.postMessage(payload)}catch{}};
  const url=new URL('./models/vosk-model-en-us-0.22-lgraph.tar.gz',self.registration.scope).href;
  event.waitUntil(cacheModel(url,report).catch(err=>report({state:'error',error:err?.message||String(err)})));
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
