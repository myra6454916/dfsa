import {chromium} from 'playwright';
const [,,out,cfg] = process.argv;
const b = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--in-process-gpu']});
const p = await b.newPage({viewport:{width:1280,height:720}});
p.on('pageerror',e=>console.log('pageerror',e.message));
await p.goto('http://localhost:8811/m416.html',{waitUntil:'load'});
await p.waitForTimeout(3500);
if(cfg&&cfg!=='-'){await p.evaluate(c=>{const o=JSON.parse(c);for(const k in o)window.ATTACH.set(k,o[k]);},cfg);await p.waitForTimeout(1200);}
await p.mouse.move(640,360); await p.mouse.down({button:'right'});
await p.waitForTimeout(2500);
const r = await p.evaluate(()=>{
  const THREE=window.__MEASURE_THREE, cam=window.__CAM;
  const asm=window.__ASM();
  const ax=asm.nodes.sightAxis;
  const w=new THREE.Vector3(ax[0]/1000,ax[1]/1000,ax[2]/1000);
  const n=w.clone().project(cam);
  const px=[Math.round((n.x*0.5+0.5)*innerWidth), Math.round((-n.y*0.5+0.5)*innerHeight)];
  const fwd=new THREE.Vector3(); cam.getWorldDirection(fwd);
  const tgt=window.__ADSF();
  return {exact:{camY:cam.position.y, axisY:w.y, camZ:cam.position.z, ndcY:n.y}, tgt, ads:window.__ADS_DEBUG(), axisPx:px, fwd:[fwd.x,fwd.y,fwd.z].map(v=>+v.toFixed(3))};
});
await p.screenshot({path:out});
console.log(JSON.stringify(r));
await b.close();
