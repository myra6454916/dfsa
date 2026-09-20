import {chromium} from 'playwright';
const b = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--in-process-gpu']});
const p = await b.newPage({viewport:{width:1200,height:800}});
p.on('pageerror',e=>console.log('pageerror',e.message));
await p.goto(process.argv[2],{waitUntil:'load'});
await p.waitForTimeout(4000);
const r = await p.evaluate(()=>{
  const THREE = window.__MEASURE_THREE, host = window.__MEASURE_HOST;
  if(!host) return 'no host';
  host.updateWorldMatrix(true,true);
  const inv = new THREE.Matrix4().copy(host.matrixWorld).invert();
  const out=[];
  host.traverse(o=>{
    if(!o.isMesh) return;
    if(o.userData && o.userData.attachModule) return;
    const g=o.geometry; if(!g) return;
    g.computeBoundingBox();
    const bb=g.boundingBox.clone();
    const m=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);
    bb.applyMatrix4(m);
    const f=v=>Math.round(v*1000*10)/10;
    out.push({n:o.name||o.parent.name||'?', x:[f(bb.min.x),f(bb.max.x)], y:[f(bb.min.y),f(bb.max.y)], z:[f(bb.min.z),f(bb.max.z)]});
  });
  // global bbox of base
  return out;
});
console.log(JSON.stringify(r,null,0));
await b.close();
