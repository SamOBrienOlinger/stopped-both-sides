import {test as base,expect,devices} from '@playwright/test';
import {preferencesStorageKey} from '../../accessibility/preferences.mjs';

// Mobile WebKit exercises its own viewport and focus behavior. This still
// cannot operate Safari's browser-chrome pull-to-refresh gesture: the late
// offsets below deliberately model restoration after the real reload.
const test=base.extend({
 isMobile:async({browserName},use)=>use(browserName!=='firefox'),
 hasTouch:true,deviceScaleFactor:2,
 userAgent:async({browserName},use)=>use(devices[browserName==='webkit'?'iPhone 13':'Pixel 5'].userAgent)
});
const caseKey='refresh-settlement-case';
const profiles=[
 {name:'phone',width:390,height:844,size:100},
 {name:'small phone 200%',width:320,height:740,size:200}
];

async function prepare(page,role,profile){
 await page.addInitScript(({caseKey,preferenceKey,size})=>{
  if(!sessionStorage.getItem('refresh-settlement-seeded')){
   localStorage.setItem(preferenceKey,JSON.stringify({language:'en',size:Math.min(size,150),
    contrast:'standard',spacing:size>100,motion:true}));
   sessionStorage.setItem('refresh-settlement-seeded','1');
  }
  if(size===200){
   const apply=()=>{
    if(!document.head)return false;
    const style=document.createElement('style');style.textContent='html:root{font-size:200%!important}';
    document.head.append(style);return true;
   };
   if(!apply()){
    const observer=new MutationObserver(()=>{if(apply())observer.disconnect();});
    observer.observe(document,{childList:true,subtree:true});
   }
  }
  window.__refreshInputs=[];
  for(const type of ['keydown','wheel','pointerdown','touchstart'])
   document.addEventListener(type,event=>window.__refreshInputs.push({type,trusted:event.isTrusted,at:performance.now()}),
    {capture:true,passive:true});
  const options=JSON.parse(sessionStorage.getItem(caseKey)||'null');
  if(!options)return;
  const record=window.__refreshSettlement={...options,samples:[],injections:[],events:[],frame:0,running:true};
  const box=element=>element?.getBoundingClientRect().toJSON()||null;
  const ready=()=>document.querySelector('#main h1')&&!document.querySelector('#main .initial');
  const capture=()=>{
   const header=document.querySelector('.header'),main=document.querySelector('#main');
   if(!ready()||!header||!main)return;
   const viewport={top:window.visualViewport?.offsetTop||0,
    bottom:(window.visualViewport?.offsetTop||0)+(window.visualViewport?.height||innerHeight)};
   const target=options.target?document.querySelector(options.target):main.firstElementChild;
   record.samples.push({at:performance.now(),scrollY,hash:location.hash,viewport,
    header:box(header),headerPosition:getComputedStyle(header).position,target:box(target),
    heading:box(options.target?target?.querySelector('h1,h2,h3'):main.querySelector('h1')),
    rootFont:getComputedStyle(document.documentElement).fontSize,
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    framesSinceRestore:record.lastRestoreFrame===undefined?null:record.frame-record.lastRestoreFrame,
    sinceRestore:record.lastRestoreAt===undefined?null:performance.now()-record.lastRestoreAt});
  };
  record.inject=label=>{
   if(!ready())return false;
   // An anchor may already be far down the page. Displace it by the same
   // amount instead of inadvertently choosing its correct position.
   const before=scrollY,requested=options.target?before+480:480;
   scrollTo({top:requested,left:0,behavior:'instant'});
   record.lastRestoreAt=performance.now();
   record.lastRestoreFrame=record.frame;
   record.injections.push({label,at:record.lastRestoreAt,before,requested,actual:scrollY});
   return true;
  };
  const injectWhenReady=label=>{
   if(!record.running)return;
   if(!record.inject(label))requestAnimationFrame(()=>injectWhenReady(label));
  };
  addEventListener('load',()=>record.events.push({type:'load',at:performance.now()}),{once:true});
  addEventListener('pageshow',event=>{
   record.events.push({type:'pageshow',at:performance.now(),persisted:event.persisted});
   setTimeout(()=>injectWhenReady('after pageshow'),100);
  },{once:true});
  const frame=()=>{record.frame++;capture();if(record.running)requestAnimationFrame(frame);};
  requestAnimationFrame(frame);
 },{caseKey,preferenceKey:preferencesStorageKey(role),size:profile.size});
}

async function arm(page,options){
 await page.evaluate(({key,options})=>sessionStorage.setItem(key,JSON.stringify(options)),{key:caseKey,options});
}

async function inspectSettlement(page,testInfo,profile,{target=null}={}){
 await expect.poll(()=>page.evaluate(()=>window.__refreshSettlement?.injections.length||0)).toBeGreaterThan(0);
 const settled=()=>page.evaluate(target=>{
  const element=target?document.querySelector(target):document.querySelector('#main>:first-child');
  if(!element)return false;
  const top=visualViewport?.offsetTop||0,box=element.getBoundingClientRect();
  return box.top>=top-1&&box.top<(visualViewport?.height||innerHeight)+top&&
   (target!==null||Math.abs(scrollY)<=1);
 },target);
 await expect.poll(settled,{message:'startup restores the visible route opening after pageshow'}).toBe(true);
 // Real viewport resize dispatches both window and visualViewport events in
 // supporting engines. It does not fabricate a trusted scroll gesture.
 await page.setViewportSize({width:profile.width,height:profile.height-100});
 expect(await page.evaluate(()=>window.__refreshSettlement.inject('shorter visual viewport'))).toBe(true);
 await expect.poll(settled,{message:'the opening survives browser viewport contraction'}).toBe(true);
 await page.setViewportSize({width:profile.width,height:profile.height});
 expect(await page.evaluate(()=>window.__refreshSettlement.inject('restored visual viewport'))).toBe(true);
 await expect.poll(settled,{message:'the opening settles after browser viewport restoration'}).toBe(true);
 // Existing coverage ended after 750ms. Restore beyond that point, once the
 // viewport fault has settled, so two injections cannot overwrite each other.
 await expect.poll(()=>page.evaluate(()=>{
  const record=window.__refreshSettlement;
  const shown=record.events.find(event=>event.type==='pageshow');
  return !!shown&&performance.now()-shown.at>=1000;
 }),{message:'observe beyond the former 750ms refresh coverage'}).toBe(true);
 expect(await page.evaluate(()=>window.__refreshSettlement.inject('late pageshow restoration'))).toBe(true);
 await expect.poll(()=>page.evaluate(()=>{
  const record=window.__refreshSettlement;
  const frames=record.samples.filter(sample=>sample.at>=record.lastRestoreAt&&sample.framesSinceRestore>=3);
  return performance.now()-record.lastRestoreAt>=350&&frames.length>=16;
 }),{message:'observe at least 16 settled frames even when mobile rendering is throttled'}).toBe(true);
 await expect.poll(settled,{message:'the late restored offset settles at the route opening'}).toBe(true);
 const record=await page.evaluate(()=>{
  const record=window.__refreshSettlement;record.running=false;
  return {...record,navigationType:performance.getEntriesByType('navigation')[0]?.type,inject:undefined};
 });
 const issues=[];
 if(record.navigationType!=='reload')issues.push('a native document reload was not exercised');
 if(record.injections.length<4)issues.push('not all late restoration stages ran');
 for(const injection of record.injections){
  if(Math.abs(injection.actual-injection.before)<300)
   issues.push(injection.label+': the injected offset did not displace the current opening');
 }
 // A fault injection may precede dispatch of the native scroll event. Allow
 // that event and its coalesced animation-frame correction, then require
 // every subsequent rendered frame to remain at the meaningful opening.
 const checked=record.samples.filter(sample=>sample.framesSinceRestore>=3);
 if(checked.length<16)issues.push('too few settled rendered frames');
 for(const [index,sample] of checked.entries()){
  const overlay=['sticky','fixed','-webkit-sticky'].includes(sample.headerPosition);
  const top=Math.max(sample.viewport.top,overlay?sample.header.bottom:0);
  const prefix='frame '+index+': ';
  if(!sample.target||sample.target.top<top-1||sample.target.top>=sample.viewport.bottom)
   issues.push(prefix+'route opening stayed concealed after browser restoration');
  if(!target&&Math.abs(sample.scrollY)>1)issues.push(prefix+'ordinary route did not settle at the page top');
  if(sample.hash!==record.hash)issues.push(prefix+'refresh changed the current route');
  if(sample.overflow)issues.push(prefix+'horizontal overflow');
  if(sample.rootFont!==(profile.size===200?'32px':'16px'))issues.push(prefix+'reading size changed');
 }
 record.issues=[...new Set(issues)];
 await testInfo.attach('refresh-settlement-geometry.json',{body:Buffer.from(JSON.stringify(record)),contentType:'application/json'});
 await page.screenshot({path:testInfo.outputPath('settled-page-opening.png')});
 expect(record.issues).toEqual([]);
}

async function stableScroll(page){
 return page.evaluate(()=>new Promise((resolve,reject)=>{
  let previous=scrollY,count=0;const started=performance.now();
  const frame=()=>{
   count=Math.abs(scrollY-previous)<.5?count+1:0;previous=scrollY;
   if(count>=8)resolve(scrollY);
   else if(performance.now()-started>5000)reject(new Error('Reading position did not settle'));
   else requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
 }));
}

test.afterEach(async({page},testInfo)=>{
 if(testInfo.status===testInfo.expectedStatus)return;
 const unfinished=await page.evaluate(()=>{
  const record=window.__refreshSettlement;
  if(!record)return null;
  record.running=false;return {...record,inject:undefined};
 }).catch(()=>null);
 if(unfinished)await testInfo.attach('unfinished-refresh-settlement.json',{
  body:Buffer.from(JSON.stringify(unfinished)),contentType:'application/json'
 });
});

for(const [role,path] of [['public','./'],['garda','garda/']]){
 for(const profile of profiles)test(role+' '+profile.name+' refresh settles late browser restoration without a loading-header jump',async({page,baseURL},testInfo)=>{
  await page.setViewportSize({width:profile.width,height:profile.height});
  await page.emulateMedia({reducedMotion:'reduce'});
  await prepare(page,role,profile);
  const appPath=new URL('app.mjs',new URL(path,baseURL)).pathname;
  const matcher=url=>url.pathname===appPath;
  let release,requested;const blocked=new Promise(resolve=>{release=resolve;});
  const seen=new Promise(resolve=>{requested=resolve;});
  let continued=Promise.resolve();
  const delay=route=>{
   requested();
   continued=(async()=>{await blocked;await route.continue();})();
   return continued;
  };
  await page.route(matcher,delay);
  let loading;
  try{
   await page.goto(path+'?lang=en#play',{waitUntil:'commit'});
   await seen;
   await page.waitForFunction(()=>document.querySelector('#main .initial')&&
    [...document.querySelectorAll('link[rel~="stylesheet"]')].every(link=>link.sheet));
   // Some engines keep FontFaceSet.ready pending until deferred modules
   // finish. Measure the styled loading frame while this module is held;
   // neither fonts.ready nor screenshot's implicit font wait can run here.
   loading=await page.evaluate(()=>({
    header:document.querySelector('.header').getBoundingClientRect().toJSON(),
    opening:document.querySelector('#main .initial').getBoundingClientRect().toJSON(),
    navigation:document.querySelector('#main-navigation').getBoundingClientRect().toJSON(),
    width:innerWidth,height:innerHeight,scrollY
   }));
  }finally{
   // Keep the released interceptor until this isolated context is closed:
   // disabling it while module dependencies start can strand their requests.
   release();await continued;
  }
  await expect(page.locator('#main .initial,.error')).toHaveCount(0);
  await expect(page.locator('[data-nav-toggle]')).toHaveAttribute('aria-expanded','false');
  const ready=await page.locator('.header').evaluate(header=>header.getBoundingClientRect().toJSON());
  await testInfo.attach('loading-header-geometry.json',{body:Buffer.from(JSON.stringify({loading,ready})),contentType:'application/json'});
  expect.soft(loading.header.height,'the loading header already has its compact footprint').toBeLessThanOrEqual(ready.height+2);
  expect.soft(loading.opening.top,'loading content follows the compact header').toBeGreaterThanOrEqual(loading.header.bottom-1);
  // Reading before refresh is trusted browser input. No such input is sent
  // to the replacement document, whose late offsets belong to startup.
  await page.keyboard.press('Escape');
  await page.evaluate(()=>scrollTo({top:480,left:0,behavior:'instant'}));
  await arm(page,{hash:'#play'});
  await page.reload({waitUntil:'commit'});
  await inspectSettlement(page,testInfo,profile);
 });

 test(role+' requested source topic survives late refresh restoration',async({page},testInfo)=>{
  const profile=profiles[0],hash=role==='public'?'#rights/support':'#evidence/model';
  const target=role==='public'?'#rights-support':'#source-model';
  await page.setViewportSize({width:profile.width,height:profile.height});
  await page.emulateMedia({reducedMotion:'reduce'});
  await prepare(page,role,profile);
  await page.goto(path+'?lang=en'+hash);await expect(page.locator(target)).toBeAttached();
  await arm(page,{hash,target});
  await page.reload({waitUntil:'commit'});
  await inspectSettlement(page,testInfo,profile,{target});
 });

 test(role+' fresh trusted reading input releases startup positioning',async({page,browserName},testInfo)=>{
  const profile=profiles[0],observations=[];
  await page.setViewportSize({width:profile.width,height:profile.height});
  await page.emulateMedia({reducedMotion:'reduce'});
  await prepare(page,role,profile);
  await page.goto(path+'?lang=en#about');await expect(page.locator('#main .initial')).toHaveCount(0);
  // Mobile WebKit has no mouse.wheel driver. PageDown is real browser input
  // in all three engines; the other engines also cover the wheel path.
  for(const input of browserName==='webkit'?['keydown']:['keydown','wheel']){
   await page.reload();await expect(page.locator('#main .initial')).toHaveCount(0);
   await page.evaluate(()=>{document.documentElement.style.overflowAnchor='none';});
   if(input==='keydown')await page.keyboard.press('PageDown');
   else {await page.mouse.move(195,400);await page.mouse.wheel(0,480);}
   await expect.poll(()=>page.evaluate(()=>scrollY),{message:'trusted '+input+' scrolls the page'}).toBeGreaterThan(100);
   const readingPosition=await stableScroll(page);
   await page.setViewportSize({width:profile.width,height:profile.height-100});
   const samples=await page.evaluate(()=>new Promise(resolve=>{
    const samples=[];const frame=()=>{
     samples.push({at:performance.now(),scrollY});
     if(samples.length===40)resolve(samples);else requestAnimationFrame(frame);
    };requestAnimationFrame(frame);
   }));
   const inputs=await page.evaluate(()=>window.__refreshInputs);
   observations.push({input,inputs,readingPosition,samples});
   expect(inputs.some(event=>event.type===input&&event.trusted),'the release used trusted '+input).toBe(true);
   for(const sample of samples)expect(Math.abs(sample.scrollY-readingPosition),
    'viewport settlement must not undo fresh '+input+' reading').toBeLessThanOrEqual(2);
   await page.setViewportSize({width:profile.width,height:profile.height});
  }
  await testInfo.attach('trusted-reading-after-refresh.json',{body:Buffer.from(JSON.stringify(observations)),contentType:'application/json'});
 });
}
