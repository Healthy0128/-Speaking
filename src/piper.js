import * as tts from '@mintplex-labs/piper-tts-web';

const VOICE_ID='en_US-hfc_female-medium';
const cache=new Map();
let downloadReady=null;

window.piperGenerate=async (text,status=()=>{})=>{
  if(!downloadReady){
    downloadReady=tts.download(VOICE_ID,(p)=>{
      if(p?.total>0)status(`音声モデルを取得中：${Math.round(100*p.loaded/p.total)}%`);
      else status('音声モデルを取得しています…');
    }).catch(error=>{downloadReady=null;throw error;});
  }
  await downloadReady;
  if(!cache.has(text)){
    const task=tts.predict({text,voiceId:VOICE_ID}).catch(error=>{cache.delete(text);throw error;});
    cache.set(text,task);
  }
  return cache.get(text);
};