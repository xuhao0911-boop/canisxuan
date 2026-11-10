import labels from './imagenet-labels.json';
export type Prediction = { className: string; probability: number };
export type RecognitionEvent = { source: 'dog-atlas-engine'; jobId: string; type: 'progress' | 'result' | 'error'; message?: string; predictions?: Prediction[] };
export function recognitionHTML(image: string, jobId: string) {
  const payload = JSON.stringify({ image, jobId }).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body><img id="photo" width="224" height="224" alt="" style="object-fit:contain"><script>
    const payload=${payload};
    const labels=${JSON.stringify(labels)};
    let finished=false;
    function emit(type,rest){const value=JSON.stringify(Object.assign({source:'dog-atlas-engine',jobId:payload.jobId,type},rest||{}));if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(value);else window.parent.postMessage(value,'*');}
    function fail(message){if(!finished){finished=true;emit('error',{message});}}
    window.onerror=function(){fail('模型暂时无法运行，请检查网络后重试');};
    const timeout=setTimeout(()=>fail('加载识别模型超时，请检查网络后重试'),75000);
    async function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.appendChild(script);});}
    (async function(){try{
      emit('progress',{message:'正在加载识别模型，首次使用需要联网…'});
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
      try{if(!await tf.setBackend('webgl'))await tf.setBackend('cpu');await tf.ready();}catch(e){await tf.setBackend('cpu');await tf.ready();}
      const model=await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json');
      if(finished)return;
      emit('progress',{message:'正在本设备内分析照片…'});
      const photo=document.getElementById('photo');await new Promise((resolve,reject)=>{photo.onload=resolve;photo.onerror=reject;photo.src=payload.image;});
      const input=tf.tidy(()=>tf.image.resizeBilinear(tf.browser.fromPixels(photo),[224,224]).toFloat().div(127.5).sub(1).expandDims(0));
      const output=model.predict(input);const scores=await output.data();
      const predictions=Array.from(scores,(probability,index)=>({className:labels[index],probability})).sort((a,b)=>b.probability-a.probability).slice(0,8);
      input.dispose();output.dispose();
      if(!finished){finished=true;clearTimeout(timeout);emit('result',{predictions});}model.dispose();
    }catch(e){console.error('DogAtlas model error:',e.message||String(e));clearTimeout(timeout);fail('暂时无法完成识别，请检查网络或更换照片后重试');}})();
  </script></body></html>`;
}
