import {test as base,expect,devices} from '@playwright/test';
import {startEncounter,answer,continueEncounter,encodeState,stateHash} from '../../encounters/engine.mjs?v=situation-locations-20261122';
import {emptyProgress,recordProgress,packProgress,progressStorageKey} from '../../encounters/progress.mjs?v=situation-locations-20261122';
import {preferencesStorageKey} from '../../accessibility/preferences.mjs';

// A narrow desktop viewport does not exercise mobile focus/viewport behavior.
// Firefox does not support Playwright's isMobile option and does not expose
// touch points here; its coverage uses a narrow viewport and mobile user agent.
const test=base.extend({
 isMobile:async({browserName},use)=>use(browserName!=='firefox'),
 hasTouch:true,
 deviceScaleFactor:2,
 userAgent:async({browserName},use)=>use(devices[browserName==='webkit'?'iPhone 13':'Pixel 5'].userAgent)
});
const cast={public:'public-2',garda:'garda-5'};
const observationKey='sitewide-render-observation',seedKey='sitewide-render-seeded';
const reports=new WeakMap();
const profiles=[
 {name:'mobile portrait',width:390,height:844,size:100,all:true},
 {name:'small phone with enlarged text',width:320,height:740,size:200},
 {name:'phone landscape',width:568,height:320,size:150}
];

function completed(id,role){
 let state=startEncounter(id,role,{cast});
 for(let step=0;step<20&&!state.complete;step++)state=continueEncounter(answer(state,0));
 if(!state.complete)throw new Error('The responsive fixture must reach its recap');
 return state;
}

function routesFor(role,all){
 const initial=startEncounter('public-arrest',role,{cast});
 const core=[
  {name:'Home',hash:'#play'},
  {name:'About',hash:'#about'},
  {name:'Browse situations',hash:`#encounters/${role}/all`},
  {name:'Answered encounter',hash:stateHash(answer(initial,0))}
 ];
 if(!all)return core;
 return [...core,
  {name:'Perspective introduction',hash:`#encounters/${role}`},
  {name:'Browse one topic',hash:`#encounters/${role}/custody`},
  {name:'Practice introduction',hash:`#practice/${role}`},
  {name:'Browse individual practice',hash:`#practice/${role}/all`},
  {name:'Individual practice',hash:'#scenario/street'},
  {name:'Individual practice recap',hash:'#scenario/street/'+encodeState(completed(role+'-street',role))},
  {name:'Encounter opening',hash:stateHash(initial)},
  {name:'Encounter recap',hash:stateHash(completed('public-street',role))},
  {name:'Progress',hash:'#progress'},
  {name:'Discussion',hash:`#discussion/${role}/garda-supervision`},
  {name:'Accessibility',hash:'#accessibility'},
  {name:'Sources',hash:role==='public'?'#rights':'#evidence'},
  {name:'Missing situation',hash:'#encounter/invalid'}
 ];
}

async function prepare(page,role,profile){
 const progress=packProgress(recordProgress(emptyProgress(),startEncounter('public-arrest',role,{cast}),{
  returnTo:`#encounters/${role}/custody`
 }));
 await page.addInitScript(({progressKey,preferenceKey,progress,size,observationKey,seedKey})=>{
  if(!sessionStorage.getItem(seedKey)){
   localStorage.setItem(progressKey,progress);
   localStorage.setItem(preferenceKey,JSON.stringify({language:'en',size:Math.min(size,150),
    contrast:'standard',spacing:size>100,motion:false}));
   sessionStorage.setItem(seedKey,'1');
  }
  if(size===200){
   const apply=()=>{
    if(!document.head)return false;
    const style=document.createElement('style');
    style.textContent='html:root{font-size:200%!important}';
    document.head.append(style);return true;
   };
   if(!apply()){
    const observer=new MutationObserver(()=>{if(apply())observer.disconnect();});
    observer.observe(document,{childList:true,subtree:true});
   }
  }
  const options=JSON.parse(sessionStorage.getItem(observationKey)||'null');
  if(!options)return;
  const record={...options,samples:[],initialShell:[],focusEvents:[],done:false,
   environment:{userAgent:navigator.userAgent,maxTouchPoints:navigator.maxTouchPoints,
    coarsePointer:matchMedia('(pointer:coarse)').matches,hover:matchMedia('(hover:hover)').matches}};
  window.__sitewideRendering=record;
  document.addEventListener('focusin',event=>record.focusEvents.push({
   tag:event.target.tagName,id:event.target.id,at:performance.now()
  }),true);
  const rect=element=>{
   if(!element)return null;
   const box=element.getBoundingClientRect();
   return {top:box.top,bottom:box.bottom,left:box.left,right:box.right,height:box.height};
  };
  let firstAt=null,loadedAt=null,fontsAt=null;
  window.addEventListener('load',()=>{
   loadedAt=performance.now();document.fonts.ready.then(()=>{fontsAt=performance.now();});
  },{once:true});
  const sample=()=>{
   const main=document.querySelector('#main'),heading=main?.querySelector('h1');
   if(main?.querySelector('.initial')){
    const header=document.querySelector('.header'),nav=header?.querySelector('nav');
    record.initialShell.push({at:performance.now(),header:rect(header),
     headerPosition:header&&getComputedStyle(header).position,
     navigationReady:header?.classList.contains('navigation-ready'),
     navHidden:nav?.hidden,navAriaHidden:nav?.getAttribute('aria-hidden'),
     opening:rect(main.firstElementChild),heading:rect(heading),scrollY,height:innerHeight,
     restoration:history.scrollRestoration,readyState:document.readyState,
     navigationType:performance.getEntriesByType('navigation')[0]?.type,
     visualViewport:window.visualViewport&&{offsetTop:visualViewport.offsetTop,pageTop:visualViewport.pageTop}});
   }
   if(heading&&!main.querySelector('.initial')){
    if(firstAt===null){firstAt=performance.now();document.fonts.ready.then(()=>{fontsAt=performance.now();});}
    const header=document.querySelector('.header'),position=header&&getComputedStyle(header).position;
    const opening=options.target?document.querySelector(options.target):main.firstElementChild;
    const styles=getComputedStyle(heading),root=document.documentElement;
    record.samples.push({at:performance.now(),scrollY,scrollX,hash:location.hash,
     header:rect(header),headerPosition:position,opening:rect(opening),heading:rect(heading),
     height:innerHeight,width:innerWidth,rootFont:getComputedStyle(root).fontSize,
     overflow:root.scrollWidth>root.clientWidth+1,
     activeTag:document.activeElement?.tagName,activeId:document.activeElement?.id,
     headingFocused:document.activeElement===heading,outlineStyle:styles.outlineStyle,
     outlineWidth:styles.outlineWidth,boxShadow:styles.boxShadow,
     visualViewport:window.visualViewport&&{height:visualViewport.height,offsetTop:visualViewport.offsetTop,pageTop:visualViewport.pageTop}
    });
    if(record.samples.length>=16&&loadedAt!==null&&fontsAt!==null&&
     performance.now()-Math.max(firstAt,loadedAt,fontsAt)>=750){
     record.navigationType=performance.getEntriesByType('navigation')[0]?.type;
     record.done=true;return;
    }
   }
   requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
 },{progressKey:progressStorageKey(role),preferenceKey:preferencesStorageKey(role),progress,
  size:profile.size,observationKey,seedKey});
}

async function textFits(page){
 return page.locator('#main').evaluate(main=>[...main.querySelectorAll('h1,h2,h3,p,summary')]
  .filter(element=>element.getClientRects().length&&element.scrollWidth>element.clientWidth+2)
  .map(element=>({tag:element.tagName,className:element.className,text:element.textContent.trim().slice(0,80)})));
}

async function reloadRoute(page,testInfo,role,profile,route){
 await expect(page.locator('#main h1')).toBeAttached();
 await expect(page.locator('#main .initial,.error')).toHaveCount(0);
 await page.evaluate(()=>document.fonts.ready);
 const keys={progress:progressStorageKey(role),preferences:preferencesStorageKey(role)};
 const storage=()=>page.evaluate(keys=>Object.fromEntries(Object.entries(keys)
  .map(([name,key])=>[name,localStorage.getItem(key)])),keys);
 const before={url:page.url(),stored:await storage()};
 // Put the old document well below its opening. This is setup only: nothing
 // scrolls or focuses the destination after the native document reload.
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,left:0,behavior:'instant'}));
 const {oldScroll,scrollRange}=await page.evaluate(()=>({oldScroll:scrollY,
  scrollRange:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));
 if(scrollRange>1)expect(oldScroll,route.name+' has a scrolled document to refresh').toBeGreaterThan(0);
 else expect(oldScroll,route.name+' fits without scrolling').toBeLessThanOrEqual(1);
 await page.evaluate(({key,options})=>sessionStorage.setItem(key,JSON.stringify(options)),{
  key:observationKey,options:{name:route.name,target:route.target||null,oldScroll}
 });
 const appPath=new URL('app.mjs',page.url()).pathname,matcher=url=>url.pathname===appPath;
 const delayed=profile.all&&route.name==='About';let delayedRequests=0;
 // The delay ends independently of screenshots and document readiness. The
 // observer still records the complete loading phase without blocking it.
 const delay=async request=>{delayedRequests++;await new Promise(resolve=>setTimeout(resolve,600));await request.continue();};
 if(delayed)await page.route(matcher,delay);
 try{
  await page.reload({waitUntil:'commit'});
  await expect.poll(()=>page.evaluate(()=>window.__sitewideRendering?.done),{timeout:30000}).toBe(true);
 }finally{if(delayed)await page.unroute(matcher,delay);}
 const record=await page.evaluate(()=>window.__sitewideRendering);
 record.delayedRequests=delayedRequests;
 record.before=before;record.after={url:page.url(),stored:await storage()};
 record.clippedText=await textFits(page);
 reports.get(page).push(record);
 const issues=[];
 if(record.navigationType!=='reload')issues.push('not a native document reload');
 if(delayed&&delayedRequests!==1)issues.push('delayed app bootstrap did not run exactly once');
 if(record.after.url!==before.url)issues.push('refresh changed the current route');
 if(JSON.stringify(record.after.stored)!==JSON.stringify(before.stored))issues.push('refresh changed progress or preferences');
 for(const [i,sample] of record.initialShell.entries()){
  const sticky=['sticky','-webkit-sticky','fixed'].includes(sample.headerPosition);
  if(sticky&&sample.heading&&sample.heading.top<Math.max(sample.header?.bottom||0,0)-1)
   issues.push('loading frame '+i+': heading is concealed by navigation');
  if(sample.readyState!=='loading'&&Math.abs(sample.scrollY)>1)
   issues.push('loading frame '+i+': the parsed page retained its old scroll offset');
 }
 for(const [i,sample] of record.samples.entries()){
  const sticky=['sticky','-webkit-sticky','fixed'].includes(sample.headerPosition);
  const obscured=sticky?Math.max(sample.header?.bottom||0,0):0;
  const prefix='frame '+i+': ';
  if(!route.target&&Math.abs(sample.scrollY)>1)issues.push(prefix+'ordinary page did not start at the document top');
  if(!sample.opening||sample.opening.top<obscured-1||sample.opening.top>=sample.height)
   issues.push(prefix+'page opening is concealed or outside the viewport');
  if(!route.target&&sample.heading.top<obscured-1)issues.push(prefix+'heading is concealed by navigation');
  if(sample.headingFocused)issues.push(prefix+'refresh stole focus for a static heading');
  if(sample.outlineStyle!=='none'&&parseFloat(sample.outlineWidth)>0)
   issues.push(prefix+'static heading has a visible outline');
  if(sample.overflow)issues.push(prefix+'horizontal page overflow');
  if(sample.width!==profile.width)issues.push(prefix+'mobile viewport does not match the device width');
  if(sample.rootFont!==({100:'16px',150:'24px',200:'32px'})[profile.size])
   issues.push(prefix+'reading size changed during refresh');
 }
 if(record.clippedText.length)issues.push('text extends outside its layout box');
 record.issues=[...new Set(issues)];
 if(route.name==='Home'||route.name==='Answered encounter')await page.screenshot({
  path:testInfo.outputPath(route.name==='Home'?'home-after-refresh.png':'answered-encounter-after-refresh.png'),timeout:5000
 });
 expect.soft(record.issues,role+' '+profile.name+' '+route.name).toEqual([]);
 await page.evaluate(key=>sessionStorage.removeItem(key),observationKey);
}

test.afterEach(async({page},testInfo)=>{
 const records=reports.get(page);
 if(records?.length)await testInfo.attach('sitewide-rendering.json',{
  body:Buffer.from(JSON.stringify(records.map(record=>{
   if(record.issues?.length)return record;
   const {samples,...summary}=record;
   return {...summary,frameCount:samples.length,first:samples[0],last:samples.at(-1),
    range:{scrollY:[Math.min(...samples.map(s=>s.scrollY)),Math.max(...samples.map(s=>s.scrollY))],
     headerHeight:[Math.min(...samples.map(s=>s.header?.height||0)),Math.max(...samples.map(s=>s.header?.height||0))]}};
  }))),contentType:'application/json'
 });
});

for(const [role,path] of [['public','./'],['garda','garda/']])for(const profile of profiles){
 test.describe(role+' '+profile.name,()=>{
  test.use({viewport:{width:profile.width,height:profile.height},reducedMotion:'no-preference'});
  test('every page opening survives mobile refresh',async({page,browserName,isMobile,hasTouch},testInfo)=>{
   test.setTimeout(profile.all?180000:90000);reports.set(page,[]);
   testInfo.annotations.push({type:'device',description:browserName==='firefox'?
    'Narrow viewport and mobile user agent; Firefox does not implement isMobile emulation':
    'Mobile viewport, touch, mobile user agent and device scale factor'});
   testInfo.annotations.push({type:'context-options',description:JSON.stringify({isMobile,hasTouch})});
   await prepare(page,role,profile);
   for(const route of routesFor(role,profile.all))await test.step(route.name,async()=>{
    await page.goto(path+'?lang=en'+route.hash);
    if(browserName==='chromium')expect(await page.evaluate(()=>navigator.maxTouchPoints)).toBeGreaterThan(0);
    await reloadRoute(page,testInfo,role,profile,route);
   });
   if(profile.all){
    const anchor=role==='public'?{name:'Requested support topic',hash:'#rights/support',target:'#rights-support'}:
     {name:'Requested evidence record',hash:'#evidence/model',target:'#source-model'};
    await page.goto(path+'?lang=en'+anchor.hash);
    await reloadRoute(page,testInfo,role,profile,anchor);
   }
  });
 });
}

for(const [role,path] of [['public','./'],['garda','garda/']]){
 test(role+' keyboard navigation keeps control focus visible without boxing the heading',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('#paired-title')).toBeVisible();
  const toggle=page.locator('[data-nav-toggle]');
  if(await toggle.isVisible()){
   // Native keyboard input establishes focus-visible modality. Locator focus
   // only chooses the initial control; Enter activates the actual UI.
   await toggle.focus();await page.keyboard.press('Enter');
  }
  const about=page.locator('#main-navigation [data-nav="about"]');
  await about.focus();await page.keyboard.press('ArrowDown');
  expect(await about.evaluate(element=>element.matches(':focus-visible'))).toBe(true);
  expect(await about.evaluate(element=>parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('#main h1')).toBeFocused();
  await expect(page.locator('#main h1')).toHaveCSS('outline-style','none');
  await expect(page.locator('#main h1')).toHaveCSS('box-shadow','none');
  await page.keyboard.press('Tab');
  const focused=page.locator(':focus');
  expect(await focused.evaluate(element=>element.matches('a,button,summary,input,select,textarea'))).toBe(true);
  expect(await focused.evaluate(element=>element.matches(':focus-visible'))).toBe(true);
  expect(await focused.evaluate(element=>parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThan(0);
 });

 test(role+' changing header size does not pull a scrolled page back to its focused heading',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('#paired-title')).toBeVisible();
  const toggle=page.locator('[data-nav-toggle]');
  if(await toggle.isVisible())await toggle.click();
  await page.locator('#main-navigation [data-nav="about"]').click();
  await expect(page.locator('#main h1')).toBeFocused();
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{
   // Isolate the application's resize handler from browser scroll anchoring.
   // Text enlargement below changes the real header height and invokes its
   // observer while the user's old heading still happens to hold focus.
   document.documentElement.style.overflowAnchor='none';
   const heading=document.querySelector('#main h1').getBoundingClientRect();
   window.scrollTo({top:scrollY+heading.top-2,left:0,behavior:'instant'});
  });
  const before=await page.evaluate(()=>({scrollY,height:document.querySelector('.header').getBoundingClientRect().height}));
  expect(before.scrollY).toBeGreaterThan(20);
  await page.evaluate(()=>{document.documentElement.style.fontSize='150%';});
  await expect.poll(()=>page.locator('.header').evaluate(header=>header.getBoundingClientRect().height))
   .toBeGreaterThan(before.height+1);
  await page.evaluate(()=>new Promise(resolve=>{
   let count=0;const frame=()=>{if(++count===8)resolve();else requestAnimationFrame(frame);};requestAnimationFrame(frame);
  }));
  await expect(page.locator('#main h1')).toBeFocused();
  const after=await page.evaluate(()=>({scrollY,height:document.querySelector('.header').getBoundingClientRect().height}));
  expect(Math.abs(after.scrollY-before.scrollY),'header resize must not scroll a static previously focused heading into view')
   .toBeLessThanOrEqual(2);
 });
}

test('standalone documents reflow in a real mobile viewport',async({page})=>{
 await page.addInitScript(()=>{
  const enlarge=()=>{
   if(!document.documentElement)return false;
   document.documentElement.style.fontSize='200%';return true;
  };
  if(!enlarge()){
   const observer=new MutationObserver(()=>{if(enlarge())observer.disconnect();});
   observer.observe(document,{childList:true,subtree:true});
  }
 });
 for(const file of ['privacy.html','docs/button-reference.html'])for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  await page.goto(file);
  await page.reload();
  // These standalone documents have no persistent navigation. Verify their
  // opening directly instead of imposing the app's SPA restoration policy.
  const geometry=await page.locator('h1').evaluate(heading=>{
   const root=document.documentElement,box=heading.getBoundingClientRect();
   return {top:box.top,width:innerWidth,rootFont:getComputedStyle(root).fontSize,overflow:root.scrollWidth-root.clientWidth,
    clipped:heading.scrollWidth>heading.clientWidth+2};
  });
  expect(geometry.width).toBe(width);
  expect(geometry.rootFont).toBe('32px');
  expect(geometry.top).toBeGreaterThanOrEqual(0);
  expect(geometry.overflow).toBeLessThanOrEqual(2);
  expect(geometry.clipped).toBe(false);
 }
});

test.describe('navigation before application startup',()=>{
 test.use({javaScriptEnabled:false,viewport:{width:390,height:844}});
 test('fallback navigation stays exposed and scrolls clear of the loading content',async({page},testInfo)=>{
  for(const path of ['./','garda/']){
   await page.goto(path);
   await expect(page.locator('.header')).not.toHaveClass(/navigation-ready/);
   await expect(page.locator('[data-nav-toggle]')).toBeHidden();
   for(const link of await page.locator('#main-navigation a').all())await expect(link).toBeVisible();
   await page.screenshot({path:testInfo.outputPath(path==='./'?'public-loading-shell.png':'garda-loading-shell.png'),timeout:5000});
   await page.locator('#main h1').scrollIntoViewIfNeeded();
   const geometry=await page.evaluate(()=>({
    position:getComputedStyle(document.querySelector('.header')).position,
    headerBottom:document.querySelector('.header').getBoundingClientRect().bottom,
    heading:document.querySelector('#main h1').getBoundingClientRect().toJSON(),
    height:innerHeight
   }));
   expect(geometry.position).toBe('relative');
   expect(geometry.heading.top).toBeGreaterThanOrEqual(Math.max(geometry.headerBottom,0));
   expect(geometry.heading.bottom).toBeLessThanOrEqual(geometry.height);
  }
 });
});
