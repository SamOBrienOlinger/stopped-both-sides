const {chromium, firefox, webkit} = require(process.cwd() + '/node_modules/playwright');
const {spawn} = require('node:child_process');
const fs = require('node:fs/promises');
(async()=>{
const engine=process.argv[2]||'chromium',server=spawn(process.execPath,['tests/browser/server.mjs','--port','4333']);let browser;
try{
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject)});
browser=await ({chromium,firefox,webkit})[engine].launch({});
const base='http://127.0.0.1:4333/stopped-both-sides/';
const oldDims=[[280,653],[320,568],[360,800],[390,844],[430,932],[568,320],[639,700],[640,700],[641,700],[768,1024],[820,1180],[844,390],[1024,768],[1151,800],[1152,800],[1153,800],[1366,768],[1440,900],[1920,1080],[2560,1440],[3440,1440],[3840,2160]];
const dims=[[320,568],[390,844],[768,1024],[1366,768]];const tests=[],errors=new Set();
const {startEncounter,stateHash}=await import(process.cwd()+'/encounters/engine.mjs');
for(const role of ['public','garda'])for(const lang of ['en','ga','pt','ar','pl','ro','fr','es','zh-Hans']){
 const ctx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 const page=await ctx.newPage(); page.on('pageerror',e=>errors.add(String(e)));
 const urls=[['Home','#play'],['About','#about'],['Browse','#encounters/'+role+'/all'],['Reference',role==='public'?'#rights':'#evidence'],['Progress','#progress'],['Accessibility','#accessibility'],['Match encounter',stateHash(startEncounter('discrimination-race',role))]];
 for(const [route,hash] of urls){
  await page.goto(base+(role==='garda'?'garda/':'')+'?lang='+lang+hash,{waitUntil:'networkidle'});
  await page.locator('#main h1').first().waitFor({state:'attached'});
  await page.addStyleTag({content:':root{--reading-size:150%!important}'});
  await page.evaluate(()=>{document.querySelectorAll('main details').forEach(d=>d.open=true);});
  for (const [w,h] of dims){
   await page.setViewportSize({width:w,height:h});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const result=await page.evaluate(()=>{
    const root=document.documentElement,scope=document.querySelector('main'),head=document.querySelector('.header'),hr=head.getBoundingClientRect();
    const clipped=[...scope.querySelectorAll('h1,h2,h3,p,summary,button,a')].filter(el=>el.getClientRects().length&&el.clientWidth>10&&el.clientHeight>5&&el.scrollWidth>el.clientWidth+2).map(el=>[el.tagName,el.className,el.textContent.trim().slice(0,42),el.clientWidth,el.scrollWidth]);
    const uncontained=[...scope.querySelectorAll('h1,h2,h3,p,summary,button,a')].filter(el=>{const r=el.getBoundingClientRect();return r.width>10&&r.height>5&&(r.x< -3||r.right>root.clientWidth+3)&&!el.closest('[aria-hidden="true"],.sr-only,[hidden]');}).map(el=>[el.tagName,el.className,el.textContent.trim().slice(0,42)]);
    return {width:root.clientWidth,overflow:root.scrollWidth-root.clientWidth,head:[hr.top,hr.height],clipped:clipped.slice(0,8),nClip:clipped.length,uncontained:uncontained.slice(0,6),nOut:uncontained.length};
   });tests.push({role,lang,route,w,h,...result});
  }
 }
 await ctx.close();
}
await fs.mkdir('audit-results',{recursive:true});
if(errors.size||tests.some(t=>t.overflow>2||t.nOut>0))process.exitCode=1;
await fs.writeFile('audit-results/languages-'+engine+'.json',JSON.stringify({engine,version:browser.version(),errors:[...errors],tests}));
console.log(engine,browser.version(),tests.length,'profiles;',tests.filter(t=>t.overflow>2).length,'overflow;',tests.filter(t=>t.nClip).length,'with clipped/control scroll dimension;',tests.filter(t=>t.nOut).length,'off-screen cases;',errors.size,'errors');
}finally{await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
