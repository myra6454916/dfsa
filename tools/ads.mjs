import {chromium} from 'playwright';
const [,,url,out,cfg,wait='2500'] = process.argv;
const b = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--in-process-gpu']});
const p = await b.newPage({viewport:{width:1280,height:720}});
const logs=[]; p.on('pageerror',e=>logs.push('pageerror: '+e.message));
p.on('console',m=>{if(m.type()==='error')logs.push('err: '+m.text());});
await p.goto(url,{waitUntil:'load'});
await p.waitForTimeout(3500);
if(cfg && cfg!=='-') { await p.evaluate(c=>{const o=JSON.parse(c);for(const k in o)window.ATTACH.set(k,o[k]);}, cfg); await p.waitForTimeout(1200); }
await p.mouse.move(640,360);
await p.mouse.down({button:'right'});
await p.waitForTimeout(+wait);
await p.screenshot({path:out});
await p.mouse.up({button:'right'});
console.log(logs.slice(0,10).join('\n'));
const st = await p.evaluate(()=>({ads:window.__ADS_DEBUG?window.__ADS_DEBUG():null}));
console.log('ADS', JSON.stringify(st));
await b.close();
