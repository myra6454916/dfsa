import {chromium} from 'playwright';
// usage: node tools/view.mjs <url> <out.png> <view:side|top|front|iso> [configJSON]
const [,,url,out,view='side',cfg] = process.argv;
const b = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--in-process-gpu']});
const p = await b.newPage({viewport:{width:1600,height:700}});
const logs=[]; p.on('pageerror',e=>logs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error') logs.push('err: '+m.text()); });
await p.goto(url,{waitUntil:'load'});
await p.waitForTimeout(3500);
if (cfg) {
  await p.evaluate((c)=>{ const o=JSON.parse(c); for(const k in o) window.ATTACH.set(k,o[k]); }, cfg);
  await p.waitForTimeout(1500);
}
const info = await p.evaluate((v)=>{
  const w = window.__VIEW;
  if(!w) return 'no __VIEW hook';
  return w(v);
}, view);
await p.waitForTimeout(600);
await p.screenshot({path:out});
console.log(logs.slice(0,15).join('\n'));
console.log('VIEW', JSON.stringify(info));
const dbg = await p.evaluate(()=>window.__ATTACH_DEBUG());
console.log('WARN', JSON.stringify(dbg.warnings), 'ERR', JSON.stringify(dbg.errors));
await b.close();
