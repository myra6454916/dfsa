import {chromium} from 'playwright';
const [,,url,out,w,h,extra,script] = process.argv;
const b = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--in-process-gpu']});
const p = await b.newPage({viewport:{width:+(w||1600),height:+(h||900)}});
const logs=[];
p.on('console',m=>logs.push(m.type()+': '+m.text()));
p.on('pageerror',e=>logs.push('pageerror: '+e.message));
await p.goto(url,{waitUntil:'load'});
await p.waitForTimeout(3000);
if (script) { const r = await p.evaluate(script); console.log('EVAL', JSON.stringify(r)); }
await p.waitForTimeout(+(extra||3000));
await p.screenshot({path:out});
console.log(logs.slice(0,40).join('\n'));
const dbg = await p.evaluate(()=>{try{return window.__ATTACH_DEBUG?window.__ATTACH_DEBUG():null}catch(e){return 'ERR '+e.message}});
console.log('DEBUG', JSON.stringify(dbg));
await b.close();
