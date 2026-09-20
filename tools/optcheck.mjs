import {chromium} from 'playwright';
const optics=['reddot_t2','holo_exps3','reddot_rmr','scope_1_6x','pso1','magnifier_3x','nvg_pvs14','irons_buis'];
const b = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--in-process-gpu']});
const p = await b.newPage({viewport:{width:900,height:500}});
p.on('pageerror',e=>console.log('pageerror',e.message));
await p.goto('http://localhost:8811/m416.html',{waitUntil:'load'});
await p.waitForTimeout(3500);
const keys = await p.evaluate(()=>window.ATTACH.options('optic').map(o=>o.key).filter(Boolean));
console.log('optic options:', keys.join(','));
for (const k of keys) {
  const r = await p.evaluate((key)=>{
    window.ATTACH.set('optic', key);
    const THREE=window.__MEASURE_THREE, gun=window.__MEASURE_HOST;
    const asm=window.__ASM();
    const ax=asm.nodes.sightAxis; if(!ax) return {key, err:'no axis'};
    const m=asm.activeOptic.meta;
    const o=new THREE.Vector3(ax[0]/1000, ax[1]/1000, (ax[2]+(m.eyeZ||90))/1000);
    gun.localToWorld(o);
    const d=new THREE.Vector3(0,0,-1);
    const ray=new THREE.Raycaster(o,d,0.0005,3);
    ray.firstHitOnly=false;
    const hits=ray.intersectObject(gun,true);
    // opaque blockers = not glass/reticle materials
    const blockers=hits.filter(h=>{const m2=h.object.material; return m2 && !m2.transparent;})
      .map(h=>({n:h.object.name, d:Math.round(h.distance*1000)}));
    return {key, name:m.name, relief:m.eyeZ, blockers:blockers.slice(0,4), total:hits.length};
  }, k);
  console.log(JSON.stringify(r));
  await p.waitForTimeout(300);
}
await b.close();
