import {test,expect} from '@playwright/test';
import {startEncounter,answer,continueEncounter,decodeState,stateHash} from '../../encounters/engine.mjs?v=situation-locations-20261122';
import {emptyProgress,recordProgress,packProgress,progressStorageKey} from '../../encounters/progress.mjs?v=situation-locations-20261122';
import {preferencesStorageKey} from '../../accessibility/preferences.mjs';
import {openNavigation} from './navigation.mjs';

const arrest=answer(continueEncounter(answer(startEncounter('public-arrest','public',{
 cast:{public:'public-2',garda:'garda-5'}
}),1)),0);
const saved=packProgress(recordProgress(emptyProgress(),arrest,{returnTo:'#encounters/public/custody'}));
const caseKey='reload-clearance-case',seedKey='reload-clearance-seeded';
const reports=new WeakMap();
const profiles=[
 {name:'phone',width:390,height:844,size:100},
 {name:'desktop',width:1366,height:768,size:100},
 {name:'phone 200%',width:390,height:844,size:200}
];
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

async function observeReloads(page,site,profile){
 const preferences={language:'en',size:profile.size===200?150:100,contrast:'standard',spacing:profile.size===200,motion:false};
 await page.addInitScript(({progressKey,preferenceKey,preferences,saved,caseKey,seedKey,size})=>{
  // Seed this isolated browser context once. A reload must preserve the real
  // stored records; re-seeding on every document would hide a storage reset.
  if(!sessionStorage.getItem(seedKey)){
   localStorage.setItem(progressKey,saved);
   localStorage.setItem(preferenceKey,JSON.stringify(preferences));
   sessionStorage.setItem(seedKey,'1');
  }
  if(size===200){
   // The site's saved setting reaches 150%. Simulate an additional user text
   // override before content renders, rather than resizing after a reload.
   const applyUserSize=()=>{
    if(!document.head)return false;
    const style=document.createElement('style');
    style.textContent='html:root{font-size:200%!important}';
    document.head.append(style);return true;
   };
   if(!applyUserSize()){
    const observer=new MutationObserver(()=>{if(applyUserSize())observer.disconnect();});
    observer.observe(document,{childList:true,subtree:true});
   }
  }
  window.addEventListener('pageshow',event=>{
   window.__reloadClearancePageShow={persisted:event.persisted,at:performance.now()};
  });
  const options=JSON.parse(sessionStorage.getItem(caseKey)||'null');
  if(!options)return;
  const record={...options,samples:[],events:[],done:false};
  window.__reloadClearance=record;
  let firstAt=null,loadAt=null,fontsAt=null,fontEpoch=0;
  const settleFonts=()=>{
   const epoch=++fontEpoch;
   document.fonts.ready.then(()=>{if(epoch===fontEpoch)fontsAt=performance.now();});
  };
  window.addEventListener('load',()=>{loadAt=performance.now();record.events.push({type:'load',at:loadAt});settleFonts();},{once:true});
  window.addEventListener('pageshow',event=>record.events.push({type:'pageshow',persisted:event.persisted,at:performance.now()}));
  const box=element=>{
   if(!element)return null;
   const r=element.getBoundingClientRect(),round=n=>Math.round(n*100)/100;
   return {top:round(r.top),bottom:round(r.bottom),height:round(r.height)};
  };
  const sample=()=>{
   const main=document.querySelector('#main'),context=main?.querySelector(options.context);
   // Ignore the static loading placeholder. Capture the very first frame of
   // the actual route, then continue past load and final font settlement.
   if(context){
    if(firstAt===null){firstAt=performance.now();settleFonts();}
    const header=document.querySelector('.header'),position=header&&getComputedStyle(header).position;
    const heading=options.anchor?context.querySelector('h1,h2,h3'):main.querySelector('h1');
    record.samples.push({at:Math.round(performance.now()*100)/100,hash:location.hash,scrollY,scrollX,
     viewport:innerHeight,header:box(header),headerPosition:position,context:box(context),heading:box(heading),
     rootFont:getComputedStyle(document.documentElement).fontSize,readyState:document.readyState,
     visualViewport:window.visualViewport&&{height:visualViewport.height,offsetTop:visualViewport.offsetTop,pageTop:visualViewport.pageTop},
     horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1});
    if(record.samples.length>=16&&loadAt!==null&&fontsAt!==null&&
     performance.now()-Math.max(firstAt,loadAt,fontsAt)>=750){
     const navigation=performance.getEntriesByType('navigation')[0];
     record.navigationType=navigation?.type;
     record.milestones={firstAt,loadAt,fontsAt,finishedAt:performance.now()};
     record.restoration=history.scrollRestoration;
     record.done=true;return;
    }
   }
   requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
 },{progressKey:progressStorageKey(site),preferenceKey:preferencesStorageKey(site),preferences,saved,caseKey,seedKey,size:profile.size});
 return preferences;
}

async function scrollBeforeReload(page,context,position){
 await page.evaluate(()=>document.fonts.ready);
 const geometry=await page.locator(context).evaluate(element=>({
  top:element.getBoundingClientRect().top,header:document.querySelector('.header').getBoundingClientRect().bottom,
  width:innerWidth,height:innerHeight,documentHeight:document.documentElement.scrollHeight
 }));
 await page.mouse.move(geometry.width/2,Math.min(geometry.height-20,geometry.header+100));
 if(position==='top'){
  await page.mouse.wheel(0,-geometry.documentHeight*2);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
 }else if(position==='deep'){
  await page.mouse.wheel(0,geometry.documentHeight*2);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(300);
 }else{
  await page.mouse.wheel(0,Math.ceil(geometry.top-geometry.header+12));
  await expect.poll(()=>page.locator(context).evaluate(element=>
   element.getBoundingClientRect().top-document.querySelector('.header').getBoundingClientRect().bottom
  ),'native wheel setup conceals the route opening').toBeLessThan(0);
 }
 await frames(page);
 return page.locator(context).evaluate(element=>({scrollY,contextTop:element.getBoundingClientRect().top,
  headerBottom:document.querySelector('.header').getBoundingClientRect().bottom}));
}

async function reloadAndInspect(page,testInfo,site,profile,label,context,position,{anchor=false,delay=false}={}){
 const before=await scrollBeforeReload(page,context,position),hash=new URL(page.url()).hash;
 if(position==='near')expect(before.contextTop,label+' setup conceals the opening').toBeLessThan(before.headerBottom);
 const keys={progressKey:progressStorageKey(site),preferenceKey:preferencesStorageKey(site)};
 const storage=()=>page.evaluate(({progressKey,preferenceKey})=>({
  progress:localStorage.getItem(progressKey),preferences:localStorage.getItem(preferenceKey)
 }),keys);
 const storedBefore=await storage();
 await page.evaluate(({key,value})=>sessionStorage.setItem(key,JSON.stringify(value)),{
  key:caseKey,value:{label,context,hash,anchor,before}
 });
 const appPath=new URL('app.mjs',page.url()).pathname,appMatcher=url=>url.pathname===appPath;
 let delayedRequests=0;
 const delayBootstrap=async route=>{
  delayedRequests++;
  await new Promise(resolve=>setTimeout(resolve,600));
  await route.continue();
 };
 if(delay)await page.route(appMatcher,delayBootstrap);
 try{
  // Native document reload: no route redraw, post-reload scroll, focus repair,
  // or test assignment to history.scrollRestoration is allowed here.
  await page.reload({waitUntil:'commit'});
  await expect.poll(()=>page.evaluate(()=>window.__reloadClearance?.done),{timeout:30000}).toBe(true);
 }finally{if(delay)await page.unroute(appMatcher,delayBootstrap);}
 const record=await page.evaluate(()=>window.__reloadClearance);
 record.storedBefore=storedBefore;record.storedAfter=await storage();
 record.delayedRequests=delayedRequests;
 reports.get(page).push(record);
 const issues=[];
 if(record.navigationType!=='reload')issues.push('the test did not perform a native document reload');
 if(delay&&delayedRequests!==1)issues.push('the app bootstrap was not delayed exactly once');
 if(record.samples.length<16)issues.push('not enough rendered frames were observed');
 for(const [index,s] of record.samples.entries()){
  const prefix='frame '+index+': ';
  const sticky=['sticky','-webkit-sticky','fixed'].includes(s.headerPosition);
  const top=sticky?Math.max(s.header?.bottom||0,0):0;
  if(s.hash!==hash)issues.push(prefix+'refresh changed the current route');
  if(!anchor&&Math.abs(s.scrollY)>1)issues.push(prefix+'refresh restored a stale vertical scroll position');
  if(s.context.top<top-1||s.context.top>=s.viewport)issues.push(prefix+'route opening is hidden by navigation or outside the viewport');
  if(!s.heading||s.heading.top<top-1||s.heading.top>=s.viewport)issues.push(prefix+'route heading is hidden by navigation or outside the viewport');
  if(s.horizontalOverflow)issues.push(prefix+'horizontal overflow');
  if(s.rootFont!==(profile.size===200?'32px':'16px'))issues.push(prefix+'the requested text size did not survive reload');
 }
 if(JSON.stringify(record.storedAfter)!==JSON.stringify(storedBefore))issues.push('refresh changed saved progress or reading preferences');
 record.issues=[...new Set(issues)];
 if(issues.length)await page.screenshot({path:testInfo.outputPath(label.replace(/[^a-z0-9]+/gi,'-')+'.png')});
 expect.soft(record.issues,label).toEqual([]);
}

async function checkNativeHistory(page,site,browserName){
 await page.evaluate(key=>sessionStorage.removeItem(key),caseKey);
 await openNavigation(page);
 await page.locator('#main-navigation [data-nav="play"]').click();
 await expect(page.locator('#paired-title')).toBeVisible();
 await page.evaluate(()=>document.fonts.ready);
 await page.mouse.move(600,400);await page.mouse.wheel(0,500);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(300);
 // Native wheel distance can include scroll anchoring. Record the actual
 // settled reading position after the visible text entrances have finished.
 const readingPosition=await page.evaluate(()=>new Promise((resolve,reject)=>{
  const started=performance.now();let previous=scrollY,stable=0;
  const sample=()=>{
   const header=document.querySelector('.header').getBoundingClientRect().bottom;
   const moving=document.querySelector('.landing-instructions').getAnimations({subtree:true}).some(animation=>{
    if(animation.playState==='finished'||animation.playState==='idle')return false;
    const box=animation.effect?.target?.getBoundingClientRect();
    return box&&box.bottom>header&&box.top<innerHeight;
   });
   stable=!moving&&Math.abs(scrollY-previous)<.5?stable+1:0;previous=scrollY;
   if(stable>=6)resolve(scrollY);
   else if(performance.now()-started>10000)reject(new Error('Native reading position did not settle'));
   else requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
 }));
 const keys={progressKey:progressStorageKey(site),preferenceKey:preferencesStorageKey(site)};
 const storage=()=>page.evaluate(({progressKey,preferenceKey})=>({
  progress:localStorage.getItem(progressKey),preferences:localStorage.getItem(preferenceKey)
 }),keys);
 const before={url:page.url(),scrollY:readingPosition,stored:await storage()};
 const label=browserName==='webkit'?'WebKit cold-Back compatibility':'native Back after reload';
 const record={label:site+' '+label,before};reports.get(page).push(record);
 await page.goto('privacy.html');
 await expect(page).toHaveURL(/\/privacy\.html$/);
 await test.step(label,async()=>{
  try{
   await page.goBack();
   await expect(page).toHaveURL(before.url);
   await expect(page.locator('#paired-title')).toBeAttached();
   await page.evaluate(()=>document.fonts.ready);
   if(browserName==='webkit'){
    // Playwright disables BFCache: https://playwright.dev/docs/api/class-page#page-go-back
    // Unchanged baseline f80027a has cold-Back 500/499 -> 0 in WebKit.
    // Check that existing behavior and native policy, not reading-position preservation.
    await expect.poll(()=>page.evaluate(()=>Math.abs(scrollY)),
     'WebKit cold Back retains its baseline document-top position').toBeLessThanOrEqual(2);
   }else{
    await expect.poll(()=>page.evaluate(old=>Math.abs(scrollY-old),before.scrollY),
     'Back after a reload restores the reader\'s position in the previous document').toBeLessThanOrEqual(2);
   }
  }finally{
   record.after=await page.evaluate(()=>{
    const box=selector=>{const r=document.querySelector(selector)?.getBoundingClientRect();return r&&{top:r.top,bottom:r.bottom};};
    return {url:location.href,scrollY,restoration:history.scrollRestoration,
     navigationType:performance.getEntriesByType('navigation')[0]?.type,pageshow:window.__reloadClearancePageShow,
     header:box('.header'),opening:box('.reference-landing'),heading:box('#paired-title'),viewport:innerHeight};
   });
   record.after.stored=await storage();
  }
  if(browserName==='webkit'){
   expect(record.after.restoration,'cold Back returns control to native restoration').toBe('auto');
   expect(record.after.stored,'cold Back preserves saved progress and reading preferences').toEqual(before.stored);
   for(const box of [record.after.opening,record.after.heading]){
    expect(box.top,'Home starts below navigation after cold Back').toBeGreaterThanOrEqual(record.after.header.bottom-1);
    expect(box.top,'Home remains in the viewport after cold Back').toBeLessThan(record.after.viewport);
   }
  }
 });
 await page.goForward();
 await expect(page).toHaveURL(/\/privacy\.html$/);
 record.forwardUrl=page.url();
}

test.afterEach(async({page},testInfo)=>{
 const records=reports.get(page)||[];
 const unfinished=await page.evaluate(()=>window.__reloadClearance).catch(()=>null);
 if(unfinished&&!unfinished.done)records.push(unfinished);
 if(records.length)await testInfo.attach('reload-clearance-geometry.json',{
  body:Buffer.from(JSON.stringify(records)),contentType:'application/json'
 });
 if(testInfo.status!==testInfo.expectedStatus)await page.screenshot({path:testInfo.outputPath('reload-clearance-failure.png')}).catch(()=>{});
});

for(const [site,path] of [['public','./'],['garda','garda/']])for(const profile of profiles){
 test(`${site}: native refresh exposes current page at ${profile.name}`,async({page,browserName},testInfo)=>{
  test.setTimeout(120000);reports.set(page,[]);
  await page.setViewportSize({width:profile.width,height:profile.height});
  await page.emulateMedia({reducedMotion:'no-preference'});
  const preferences=await observeReloads(page,site,profile);
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('#paired-title')).toBeVisible();
  await reloadAndInspect(page,testInfo,site,profile,'Home near header','.reference-landing','near');
  await reloadAndInspect(page,testInfo,site,profile,'Home at document top','.reference-landing','top');

  await page.goto(path+'?lang=en#about');
  await expect(page.locator('.about-opening')).toBeVisible();
  await reloadAndInspect(page,testInfo,site,profile,'About deep scroll with delayed bootstrap','.about-opening','deep',{delay:true});

  await page.goto(path+'?lang=en'+stateHash(arrest));
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('[data-action="paired-answer"][aria-pressed="true"]')).toHaveAttribute('data-index','0');
  await reloadAndInspect(page,testInfo,site,profile,'Answered arrest stage','.flow-topline','deep');
  expect(decodeState(new URL(page.url()).hash.slice('#encounter/'.length))).toEqual(arrest);
  await expect(page.locator('[data-action="paired-answer"][aria-pressed="true"]')).toHaveAttribute('data-index','0');
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),preferencesStorageKey(site))).toEqual(preferences);

  if(profile.name==='desktop'){
   const hash=site==='public'?'#rights/support':'#evidence/model';
   const target=site==='public'?'#rights-support':'#source-model';
   await page.goto(path+'?lang=en'+hash);
   await expect(page.locator(target)).toBeAttached();
   await reloadAndInspect(page,testInfo,site,profile,'Requested reference anchor',target,'deep',{anchor:true});
   await checkNativeHistory(page,site,browserName);
  }
 });
}
