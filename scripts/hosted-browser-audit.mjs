#!/usr/bin/env node
// Audit-only runner: shipping Windows Chrome/Edge or native macOS Safari.
// Copy to scripts/hosted-browser-audit.mjs on the temporary audit branch.
import {spawn,execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {openSync,closeSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {parseArgs} from 'node:util';

const {values}=parseArgs({options:{browser:{type:'string'},output:{type:'string',default:'audit-results'},'base-url':{type:'string'},'perf-runs':{type:'string',default:'3'},profiles:{type:'string',default:'desktop,portrait,landscape'},'capture-native':{type:'boolean',default:false}}});
const browserName=values.browser,root=process.cwd(),output=resolve(values.output);
if(!['safari','chrome','msedge'].includes(browserName))throw Error('Use --browser safari, chrome or msedge');
const baseURL=values['base-url']||'http://127.0.0.1:4173/stopped-both-sides/';
const perfRuns=Math.max(0,Math.min(5,Number(values['perf-runs'])||0));
const requestedProfiles=new Set(values.profiles.split(','));
const profiles=[{name:'desktop',width:1366,height:900},{name:'portrait',width:768,height:1024},{name:'landscape',width:1024,height:600}].filter(profile=>requestedProfiles.has(profile.name));
if(profiles.length!==requestedProfiles.size)throw Error('Unknown profile; use desktop, portrait or landscape');
if(values['capture-native']&&(browserName!=='safari'||process.platform!=='darwin'))throw Error('--capture-native is only for native Safari on a macOS hosted runner');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await mkdir(output,{recursive:true});
const report={browser:browserName,commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),platform:process.platform,runnerOS:process.env.RUNNER_OS||null,baseURL,startedAt:new Date().toISOString(),profiles,cases:[],performance:[],notes:[
 'Desktop shipping browsers; these dimensions do not represent physical mobile devices.',
 'Native Safari resizes the outer window; actual inner viewport dimensions are recorded.',
 'Performance is informational: local-host, fresh browser contexts, no CPU/network throttling, no real-user percentile claim.'
]};
let server,webdriverProcess,driver;
function child(command,args,filename){
 const fd=openSync(join(output,filename),'a');
 const process=spawn(command,args,{cwd:root,stdio:['ignore',fd,fd]});closeSync(fd);
 process.on('error',error=>{report.processErrors??=[];report.processErrors.push(error.message);});
 return process;
}
async function until(operation,label,timeout=20000){
 const start=Date.now();let last;
 while(Date.now()-start<timeout){try{const result=await operation();if(result)return result;}catch(error){last=error;}
  await pause(100);
 }
 throw Error(label+' timed out'+(last?': '+last.message:''));
}
function check(record,name,pass,details){
 record.checks.push({name,pass:Boolean(pass),details});
 if(!pass)throw Error(name+': '+JSON.stringify(details));
}
const isVisible=selector=>{
 const element=document.querySelector(selector);if(!element)return false;
 const box=element.getBoundingClientRect(),style=getComputedStyle(element);
 return box.width>0&&box.height>0&&style.display!=='none'&&style.visibility!=='hidden';
};
async function ready(){
 await until(()=>driver.evaluate(()=>{
  const main=document.querySelector('#main'),h1=main?.querySelector('h1');
  return h1&&!main.querySelector('.initial,.error')&&(!document.fonts||document.fonts.status==='loaded');
 }),'application and fonts');
 await pause(900); // Allow the native Safari entrance to finish without changing OS preferences.
}
async function navigateFromMenu(target){
 if(await driver.evaluate(isVisible,'[data-nav-toggle]')){
  const open=await driver.evaluate(()=>document.querySelector('[data-nav-toggle]').getAttribute('aria-expanded')==='true');
  if(!open)await driver.click('[data-nav-toggle]');
 }
 const selector='.header [data-nav="'+target+'"]';
 await until(()=>driver.evaluate(isVisible,selector),'navigation '+target);
 await driver.click(selector);await ready();
}
const layout=()=>{
 const root=document.documentElement,header=document.querySelector('.header'),h1=document.querySelector('#main h1');
 const rect=element=>{const r=element.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
 const visible=element=>{
  for(let current=element;current;current=current.parentElement){
   const s=getComputedStyle(current);
   if(current.hidden||current.inert||s.display==='none'||s.visibility==='hidden')return false;
   if(current.matches('details:not([open])')){
    const summary=[...current.children].find(child=>child.tagName==='SUMMARY');
    if(!summary?.contains(element))return false;
   }
  }
  return element.getBoundingClientRect().width>0;
 };
 return{viewport:{width:innerWidth,height:innerHeight},overflow:root.scrollWidth-root.clientWidth,h1:h1?.textContent.trim(),heading:h1&&rect(h1),header:header&&rect(header),menuVisible:visible(document.querySelector('#main-navigation')),clipped:[...document.querySelectorAll('#main h1,#main h2,#main h3,#main p,#main summary,#main button')].filter(e=>visible(e)&&e.scrollWidth>e.clientWidth+2).map(e=>e.textContent.trim().slice(0,90))};
};
const goalPaint=()=>{
 const header=document.querySelector('.header'),headerStyle=header&&getComputedStyle(header);
 const readingTop=header&&/^(sticky|fixed)$/.test(headerStyle.position)?header.getBoundingClientRect().bottom:0;
 const cards=[...document.querySelectorAll('.learning-goal h3')].map(element=>{
  const rect=element.getBoundingClientRect();let opacity=1,hidden=false;
  const ancestors=[];
  for(let current=element;current;current=current.parentElement){
   const style=getComputedStyle(current);opacity*=Number(style.opacity);
   hidden ||= style.visibility!=='visible'||style.display==='none'||style.contentVisibility==='hidden';
   if(Number(style.opacity)<1||current.hasAttribute('data-motion')||current.hasAttribute('data-reveal'))
    ancestors.push({tag:current.tagName,className:current.className,opacity:style.opacity,motion:current.getAttribute('data-motion'),reveal:current.getAttribute('data-reveal')});
  }
  const top=Math.max(rect.top,readingTop),bottom=Math.min(rect.bottom,innerHeight);
  const left=Math.max(0,rect.left),right=Math.min(rect.right,innerWidth);
  const inViewport=bottom-top>2&&right-left>2;
  const hit=inViewport&&document.elementFromPoint((left+right)/2,(top+bottom)/2);
  return{text:element.textContent.trim(),opacity,hidden,inViewport,hit:Boolean(hit&&(hit===element||element.contains(hit))),ancestors};
 });
 return{painted:cards.length===4&&cards.every(c=>!c.hidden&&c.opacity>=.99&&c.inViewport&&c.hit),focused:document.hasFocus(),scrollY,viewport:{width:innerWidth,height:innerHeight},cards};
};
async function ensureLayout(record,name){
 const value=await driver.evaluate(layout);record.measurements[name]=value;
 check(record,name+' horizontal reflow',value.overflow<=2&&value.clipped.length===0,value);
 check(record,name+' main heading',Boolean(value.h1),value.h1);
}

async function safari(){
 if(process.platform!=='darwin')throw Error('Native Safari requires a macOS runner');
 webdriverProcess=child('/usr/bin/safaridriver',['--port','4444'],'safaridriver.log');
 const endpoint='http://127.0.0.1:4444';
 async function command(method,path,payload){
  const response=await fetch(endpoint+path,{method,headers:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
  const body=await response.json();
  if(!response.ok||body.value?.error)throw Error('WebDriver '+path+': '+JSON.stringify(body.value));
  return body.value;
 }
 await until(()=>command('GET','/status'),'Safari WebDriver startup');
 const session=await command('POST','/session',{capabilities:{alwaysMatch:{browserName:'safari',pageLoadStrategy:'normal'}}});
 const id=session.sessionId,prefix='/session/'+id;
 await command('POST',prefix+'/timeouts',{implicit:0,pageLoad:45000,script:30000});
 report.capabilities=session.capabilities;
 report.version=session.capabilities.browserVersion;
 report.mode='Native Safari desktop, safaridriver/W3C WebDriver';
 const adapter={
  resize:size=>command('POST',prefix+'/window/rect',{x:0,y:0,width:size.width,height:size.height}),
  windowRect:()=>command('GET',prefix+'/window/rect'),
  goto:url=>command('POST',prefix+'/url',{url}),
  reload:()=>command('POST',prefix+'/refresh',{}),
  url:()=>command('GET',prefix+'/url'),
  activate:async()=>command('POST',prefix+'/window',{handle:await command('GET',prefix+'/window')}),
  pressEscape:()=>command('POST',prefix+'/actions',{actions:[{type:'key',id:'audit-keyboard',actions:[{type:'keyDown',value:'\uE00C'},{type:'keyUp',value:'\uE00C'}]}]}),
  evaluate:(fn,arg)=>command('POST',prefix+'/execute/sync',{script:'return ('+fn.toString()+')(arguments[0]);',args:[arg??null]}),
  click:async selector=>{
   const element=await until(()=>command('POST',prefix+'/element',{using:'css selector',value:selector}),'find '+selector);
   return command('POST',prefix+'/element/'+element['element-6066-11e4-a52e-4f735466cecf']+'/click',{});
  },
  screenshot:async filename=>writeFile(filename,Buffer.from(await command('GET',prefix+'/screenshot'),'base64')),
  screenshotElement:async(selector,filename)=>{
   const element=await command('POST',prefix+'/element',{using:'css selector',value:selector});
   const png=await command('GET',prefix+'/element/'+element['element-6066-11e4-a52e-4f735466cecf']+'/screenshot');
   await writeFile(filename,Buffer.from(png,'base64'));
  },
  close:()=>command('DELETE',prefix)
 };
 return adapter;
}

async function chromiumChannel(){
 const require=createRequire(join(root,'package.json')),{chromium}=require('playwright');
 const browser=await chromium.launch({channel:browserName,headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 report.version=browser.version();report.mode='Installed shipping '+browserName+' channel, headless desktop';
 report.runtimeErrors=[];page.on('pageerror',error=>report.runtimeErrors.push(error.message));
 const adapter={resize:size=>page.setViewportSize({width:size.width,height:size.height}),goto:url=>page.goto(url,{waitUntil:'load'}),reload:()=>page.reload({waitUntil:'load'}),url:async()=>page.url(),activate:()=>page.bringToFront(),pressEscape:()=>page.keyboard.press('Escape'),evaluate:(fn,arg)=>page.evaluate(fn,arg),click:selector=>page.locator(selector).first().click(),screenshot:filename=>page.screenshot({path:filename,fullPage:false}),close:()=>browser.close()};
 adapter.performance=async()=>{
  for(const entry of ['public','garda'])for(let run=1;run<=perfRuns;run++){
   const fresh=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'no-preference'});
   const probe=await fresh.newPage();
   try{
    await probe.addInitScript(()=>{
     window.__hostedAuditPerformance={lcp:[],shifts:[],supported:PerformanceObserver.supportedEntryTypes||[]};
     try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__hostedAuditPerformance.lcp.push({startTime:e.startTime,size:e.size,tag:e.element?.tagName||null});}).observe({type:'largest-contentful-paint',buffered:true});}catch{}
     try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__hostedAuditPerformance.shifts.push({startTime:e.startTime,value:e.value});}).observe({type:'layout-shift',buffered:true});}catch{}
    });
    const url=new URL((entry==='garda'?'garda/':'./')+'?lang=en#play',baseURL).href;
    await probe.goto(url,{waitUntil:'load'});await pause(5000);
    const measured=await probe.evaluate(()=>{
     const samples=window.__hostedAuditPerformance;let cls=0,total=0,start=null,last=null;
     for(const e of samples.shifts){if(start===null||e.startTime-last>1000||e.startTime-start>5000){start=e.startTime;total=0;}total+=e.value;last=e.startTime;cls=Math.max(cls,total);}
     const nav=performance.getEntriesByType('navigation')[0];
     const resources=performance.getEntriesByType('resource').map(e=>({path:new URL(e.name).pathname,initiatorType:e.initiatorType,duration:e.duration,transferSize:e.transferSize,encodedBodySize:e.encodedBodySize,decodedBodySize:e.decodedBodySize}));
     return{observedAtMs:performance.now(),visibilityState:document.visibilityState,supported:samples.supported,lcpMs:samples.lcp.at(-1)?.startTime??null,cls,lcpEntries:samples.lcp,layoutShiftEntries:samples.shifts,navigation:nav?{responseStart:nav.responseStart,domContentLoadedEventEnd:nav.domContentLoadedEventEnd,loadEventEnd:nav.loadEventEnd,transferSize:nav.transferSize}:null,resourceCount:resources.length,resourceTransferBytes:resources.reduce((n,e)=>n+e.transferSize,0),resources};
    });
    report.performance.push({entry,run,observationWindowAfterLoadMs:5000,...measured});
   }finally{await fresh.close();}
  }
 };
 return adapter;
}

try{
 if(!values['base-url']){
  server=child(process.execPath,['tests/browser/server.mjs','--host','127.0.0.1','--port','4173'],'server.log');
  await until(async()=>{const response=await fetch(baseURL,{signal:AbortSignal.timeout(2000)});return response.ok;},'local site server');
  const [served,pinned]=await Promise.all([fetch(baseURL).then(r=>r.text()),readFile(join(root,'index.html'),'utf8')]);
  if(served!==pinned)throw Error('The local server does not serve this checkout index.html');
 }
 driver=browserName==='safari'?await safari():await chromiumChannel();
 report.userAgent=await driver.evaluate(()=>navigator.userAgent);
 for(const profile of profiles)for(const entry of ['public','garda']){
  const record={name:entry+' '+profile.name,entry,profile,checks:[],measurements:{},status:'running'};report.cases.push(record);
  try{
   await driver.resize(profile);
   const path=entry==='garda'?'garda/':'./';
   await driver.goto(new URL(path+'?lang=en#play',baseURL).href);await ready();
   await ensureLayout(record,'home');
   check(record,'home title',await driver.evaluate(()=>document.querySelector('#paired-title')?.textContent.trim()==='Stopped: Both Sides'));
   await navigateFromMenu('about');await ensureLayout(record,'about');
   const goals=await driver.evaluate(()=>({count:document.querySelectorAll('.learning-goal').length,arrows:document.querySelectorAll('.learning-goal-link').length,items:document.querySelectorAll('.learning-goals [role="listitem"]').length,description:document.querySelector('#learning-cycle-description')?.textContent,boxes:[...document.querySelectorAll('.learning-goal')].map(e=>({width:e.clientWidth,height:e.clientHeight,clipped:e.scrollWidth>e.clientWidth+2}))}));
   check(record,'four learning goals and cycle connectors',goals.count===4&&goals.arrows===4&&goals.items===4&&goals.boxes.every(b=>b.width>0&&b.height>0&&!b.clipped),goals);
   await driver.activate();await driver.pressEscape();
   await driver.evaluate(()=>document.querySelector('.learning-goals').scrollIntoView({block:'center',behavior:'instant'}));
   record.measurements.goalPaintBeforeWait=await driver.evaluate(goalPaint);
   const painted=await until(async()=>{const value=await driver.evaluate(goalPaint);record.measurements.goalPaint=value;return value.painted&&value;},'learning goals paint and hit testing');
   check(record,'learning goals paint and are hit-testable in the viewport',painted.painted,painted);
   await pause(250); // Capture after the paint observation, not at the scroll-trigger boundary.
   if(values['capture-native']){
    // Activation changes no privacy/permission preferences on this ephemeral runner.
    execFileSync('/usr/bin/open',['-a','Safari'],{timeout:10000});
    await driver.activate();await pause(300);
    record.captures={windowRect:await driver.windowRect(),paint:await driver.evaluate(goalPaint),geometry:await driver.evaluate(()=>{
     const bounds=document.querySelector('.learning-goals').getBoundingClientRect();
     return{screen:{width:screen.width,height:screen.height,availWidth:screen.availWidth,availHeight:screen.availHeight},window:{screenX,screenY,outerWidth,outerHeight,innerWidth,innerHeight,devicePixelRatio},goals:{x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height},url:location.href};
    })};
    const nativePath=join(output,entry+'-'+profile.name+'-native-screen.png');
    try{
     execFileSync('/usr/sbin/screencapture',['-x','-m',nativePath],{timeout:15000,stdio:'pipe'});
     record.captures.nativeScreen={ok:true,file:entry+'-'+profile.name+'-native-screen.png',bytes:(await readFile(nativePath)).length};
    }catch(error){record.captures.nativeScreen={ok:false,error:error.message,stderr:error.stderr?.toString()};}
    try{
     const name=entry+'-'+profile.name+'-webdriver-element.png';
     await driver.screenshotElement('.learning-goals',join(output,name));
     record.captures.webdriverElement={ok:true,file:name};
    }catch(error){record.captures.webdriverElement={ok:false,error:error.message};}
   }
   await driver.screenshot(join(output,entry+'-'+profile.name+'-goals.png'));
   await navigateFromMenu(entry==='garda'?'evidence':'rights');await ensureLayout(record,'reference');
   const expectedTopics=entry==='garda'?5:7;
   check(record,'reference topic count',await driver.evaluate(()=>document.querySelectorAll('.rights-topics > details').length)===expectedTopics,{expected:expectedTopics});
   await driver.click('.rights-topics > details:first-child > summary');
   await until(()=>driver.evaluate(()=>document.querySelector('.rights-topics > details').open),'topic expansion');
   check(record,'reference topic expands through native click',await driver.evaluate(()=>document.querySelector('.rights-topics > details > .rights-topic-body').getBoundingClientRect().height>0));
   if(entry==='garda'){
    await driver.click('.rights-topics > details:first-child .evidence-record > summary');
    check(record,'nested evidence expands',await driver.evaluate(()=>document.querySelector('.rights-topics > details:first-child .evidence-record').open));
   }
   await navigateFromMenu('play');
   await driver.click('.reference-landing a.perspective-card[href$="#encounters/'+entry+'"]');
   await until(()=>driver.evaluate(isVisible,'[data-action="paired-quick-start"]'),'quick start');
   await driver.click('[data-action="paired-quick-start"]');
   await until(()=>driver.evaluate(isVisible,'.paired-game'),'playable encounter');
   await driver.click('[data-action="paired-answer"]');
   await until(()=>driver.evaluate(isVisible,'#feedback'),'decision feedback');
   check(record,'decision produces visible feedback',true);
   const saved=new URL(await driver.url()).hash;
   await driver.reload();await ready();
   await until(()=>driver.evaluate(isVisible,'#feedback'),'saved feedback after reload');
   check(record,'reload preserves selected decision',new URL(await driver.url()).hash===saved);
   record.status='passed';
  }catch(error){record.status='failed';record.error=error.stack||error.message;
   try{await driver.screenshot(join(output,entry+'-'+profile.name+'-failure.png'));}catch{}
  }
  console.log(record.status.toUpperCase()+': '+record.name+' ('+record.checks.length+' checks)');
 }
 if(driver.performance&&perfRuns)await driver.performance();
 else if(browserName==='safari')report.performanceNote='No Safari LCP/CLS claim: this runner only instruments those metrics in Chrome/Edge.';
}catch(error){report.fatal=error.stack||error.message;console.error(report.fatal);}
finally{
 try{await driver?.close();}catch(error){report.cleanupError=error.message;}
 webdriverProcess?.kill();server?.kill();
 report.finishedAt=new Date().toISOString();
 report.summary={cases:report.cases.length,passed:report.cases.filter(c=>c.status==='passed').length,failed:report.cases.filter(c=>c.status==='failed').length,checks:report.cases.reduce((n,c)=>n+c.checks.length,0),passedChecks:report.cases.reduce((n,c)=>n+c.checks.filter(x=>x.pass).length,0),performanceSamples:report.performance.length,fatal:Boolean(report.fatal)};
 if(values['capture-native'])report.summary.nativeScreenCaptured=report.cases.filter(c=>c.captures?.nativeScreen?.ok).length;
 await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({browser:browserName,version:report.version,...report.summary}));
 if(report.fatal||report.summary.failed||report.runtimeErrors?.length||values['capture-native']&&report.summary.nativeScreenCaptured!==report.cases.length)process.exitCode=1;
}
