import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {createGzip} from 'node:zlib';import {finished} from 'node:stream/promises';import {chromium,firefox,webkit} from '@playwright/test';
const [engine='chromium',group='core']=process.argv.slice(2);const out=`qa-results/${engine}-${group}`;fs.mkdirSync(out+'/screenshots',{recursive:true});
const core=[{id:'phone390',width:390,height:844,extended:true},{id:'desktop1366',width:1366,height:900,extended:true}];
const stress=[{id:'small320',width:320},{id:'landscape568',width:568,height:320},{id:'breakpoint660',width:660},{id:'tablet768',width:768},{id:'tablet1024',width:1024},{id:'wide1920',width:1920},{id:'text200-small',width:320,text:200},{id:'text200-desktop',width:1366,text:200},...['ga','pt','ar','pl','ro','fr','es','zh-Hans'].map(lang=>({id:'language-'+lang,width:390,lang,text:lang==='ar'?200:150})),{id:'high-contrast',width:390,contrast:true},{id:'long-names-200',width:390,text:200,longNames:true}];
const profiles=group==='core'?core:stress;
const summary={engine,group,started:new Date().toISOString(),base:'93e543adb3837c0a31dca053aaaf1e40fb435f36',candidate:'exact supplied caption-anchors-1 draft',total:0,passed:0,failed:0,maxCentreDelta:0,failures:{},examples:[],profiles:[],complete:false};
const gz=createGzip();const file=fs.createWriteStream(out+'/combinations.jsonl.gz');gz.pipe(file);
const server=spawn(process.execPath,['tests/browser/server.mjs'],{stdio:['ignore','pipe','pipe']});const serverLog=fs.createWriteStream(out+'/server.log');server.stdout.pipe(serverLog);server.stderr.pipe(serverLog);
let browser;const pagesErrors=[];const screenshots=new Set();
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:4173/stopped-both-sides/')).ok)break}catch{};await new Promise(r=>setTimeout(r,100));if(i===99)throw Error('HTTP server unavailable')}
 browser=await ({chromium,firefox,webkit}[engine]).launch();summary.browserVersion=browser.version();
 for(const entry of ['./','garda/']){
  const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>pagesErrors.push({entry,error:e.message}));
  await page.goto('http://127.0.0.1:4173/stopped-both-sides/'+entry+'?lang=en#play');await page.waitForSelector('.reference-landing');
  const meta=await page.evaluate(async()=>{window.qa=await import('/stopped-both-sides/qa/browser-sweep.mjs');return qa.metadata()});
  fs.writeFileSync(out+'/inventory.json',JSON.stringify(meta,null,2));summary.scenarios=meta.scenarios;summary.nodes=meta.nodes;summary.pairs=meta.pairs;
  for(const p of profiles){
   const tally={entry,profile:p.id,width:p.width,height:p.height||900,text:p.text||100,lang:p.lang||'en',total:0,passed:0,failed:0};
   await page.setViewportSize({width:p.width,height:p.height||900});await page.evaluate(p=>qa.configure(p),p);
   for(const node of meta.inventory){const key=node.id+'/'+node.nodeId;const vars=await page.evaluate(({node,extended})=>qa.variants(node,extended),{node,extended:!!p.extended});
    for(const v of vars){
     const results=await page.evaluate(({key,v})=>qa.batch(key,v),{key,v});
     for(const r of results){summary.total++;tally.total++;summary.maxCentreDelta=Math.max(summary.maxCentreDelta,r.metrics?.maxCentreDelta||0);const record={entry,profile:p.id,scene:key,...v,...r};
      gz.write(JSON.stringify(record)+'\n');
      if(r.failures.length){summary.failed++;tally.failed++;for(const f of r.failures)summary.failures[f]=(summary.failures[f]||0)+1;if(summary.examples.length<50)summary.examples.push(record)}else{summary.passed++;tally.passed++}
     }
     const failedIndex=results.findIndex(r=>r.failures.length);const signature=failedIndex<0?'':results[failedIndex].failures.join(',')+':'+node.direction.place+':'+node.direction.mode;
     if(failedIndex>=0&&screenshots.size<20&&!screenshots.has(signature)){screenshots.add(signature);await page.locator('[data-qa-case]').nth(failedIndex).screenshot({path:out+'/screenshots/failure-'+screenshots.size+'.png',animations:'disabled'}).catch(()=>{})}
     // One genuine rendered screenshot of every stage; all 18 characters are
     // additionally represented by the existing project's visual regression suite.
     if(engine==='chromium'&&group==='core'&&entry==='./'&&p.id==='desktop1366'&&v.kind==='decision'&&v.role==='public')await page.locator('[data-qa-case="26"] .encounter-scene').screenshot({path:out+'/screenshots/'+node.id+'--'+node.nodeId+'.png',animations:'disabled'});
    }
   }
   summary.profiles.push(tally);fs.writeFileSync(out+'/progress.json',JSON.stringify({...summary,pageErrors:pagesErrors},null,2));console.log(JSON.stringify(tally));
  }
  await context.close();
 }
 summary.complete=true;
}catch(e){summary.fatal={message:e.message,stack:e.stack};console.error(e)}finally{
 summary.finished=new Date().toISOString();summary.pageErrors=pagesErrors;fs.writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2));gz.end();await finished(file).catch(()=>{});await browser?.close();server.kill();
}
console.log('SWEEP_SUMMARY '+JSON.stringify(summary));if(!summary.complete||summary.failed||pagesErrors.length)process.exitCode=1;
