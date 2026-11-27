import {chromium} from 'playwright';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {startEncounter,stateHash} from './encounters/engine.mjs';
import {startServer} from './serve.mjs';
const server=process.env.AUDIT_LIVE?null:await startServer(4181);
const url=server?'http://127.0.0.1:4181/stopped-both-sides/':'https://samobrienolinger.github.io/stopped-both-sides/';
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
async function matchesPublication(){
 const paths=['index.html','garda/index.html','app.mjs','landing/poster-landing.mjs','encounters/ui.mjs'];
 for(const file of paths){
  const live=await fetch(url+file,{cache:'no-cache'});
  if(!live.ok || sha(Buffer.from(await live.arrayBuffer()))!==sha(await readFile(file)))throw Error('Publication differs from tested checkout: '+file);
 }
}
await matchesPublication();
const browser=await chromium.launch({channel:'chrome'}), rows=[];
try{
 for(const [route,path,mobile,repeats] of [
  ['Home','?lang=en#play',false,3],
  ['Home','?lang=en#play',true,3],
  ['Evidence','garda/?lang=en#evidence',true,3],
  ['Match encounter','garda/?lang=en'+stateHash(startEncounter('discrimination-race','garda')),true,3]
 ]){
  for(let pass=1;pass<=repeats;pass++){
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:768},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
   try{
    const page=await context.newPage(), client=await context.newCDPSession(page);
    await client.send('Network.enable');await client.send('Network.setCacheDisabled',{cacheDisabled:true});
    if(mobile){
     await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});
     await client.send('Emulation.setCPUThrottlingRate',{rate:4});
    }
    await page.addInitScript(()=>{
     window.auditVitals={lcp:null,shifts:[],longTasks:[],ready:null};
     const tag=el=>el?[el.localName,el.id,...(el.classList||[])].filter(Boolean).join('.'):'';
     for(const type of ['largest-contentful-paint','layout-shift','longtask'])if(PerformanceObserver.supportedEntryTypes.includes(type)){
      const ob=new PerformanceObserver(list=>{for(const e of list.getEntries()){
       if(type==='largest-contentful-paint')window.auditVitals.lcp={ms:e.startTime,element:tag(e.element)};
       if(type==='layout-shift'&&!e.hadRecentInput)window.auditVitals.shifts.push({t:e.startTime,value:e.value,nodes:(e.sources||[]).map(s=>tag(s.node))});
       if(type==='longtask')window.auditVitals.longTasks.push(e.duration);
      }});ob.observe({type,buffered:true});
     }
     const mark=()=>{if(!window.auditVitals.ready && document.querySelector('#main h1') && !document.querySelector('#loading'))window.auditVitals.ready=performance.now()};
     const ob=new MutationObserver(mark);ob.observe(document,{childList:true,subtree:true});
    });
    await page.goto(url+path,{waitUntil:'networkidle',timeout:120000});
    await page.locator('#main h1').first().waitFor();await page.waitForTimeout(1500);
    const stats=await page.evaluate(()=>{
     const sum=(a,p)=>a.reduce((n,v)=>n+(v[p]||0),0);
     const all=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')].filter(e=>e.name.startsWith(location.origin));
     const v=window.auditVitals;let max=0,sumWindow=0,start=0,last=0;
     for(const e of v.shifts){if(e.t-last>=1000 || e.t-start>=5000){start=e.t;sumWindow=0;}sumWindow+=e.value;max=Math.max(max,sumWindow);last=e.t;}
     return {fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,lcp:v.lcp,ready:v.ready,cls:max,shifts:v.shifts,requests:all.length,transferBytes:sum(all,'transferSize'),encodedBodyBytes:sum(all,'encodedBodySize'),decodedBodyBytes:sum(all,'decodedBodySize'),longestTaskMs:Math.max(0,...v.longTasks)};
    });
    const row={route,mobile,pass,...stats};rows.push(row);
    console.log('PROFILE '+JSON.stringify(row));
   }finally{await context.close()}
  }
 }
 await matchesPublication();
 await mkdir('audit-results',{recursive:true});
 await writeFile('audit-results/performance.json',JSON.stringify({browser:browser.version(),rows},null,2));
}finally{await browser.close();server?.close()}
