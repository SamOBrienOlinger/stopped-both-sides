import {test,expect} from '@playwright/test';
import {startEncounter,stateHash} from '../../encounters/engine.mjs?v=situation-locations-20261122';
import {emptyProgress,recordProgress,packProgress,progressStorageKey} from '../../encounters/progress.mjs?v=situation-locations-20261122';
import {playHash,topicForSituation} from '../../encounters/play-navigation.mjs?v=situation-locations-20261122';
import {openNavigation} from './navigation.mjs';

const arrest=startEncounter('public-arrest','public',{cast:{public:'public-2',garda:'garda-5'}});
const returnTo=playHash('shared','public',topicForSituation(arrest.id));
const saved=packProgress(recordProgress(emptyProgress(),arrest,{returnTo}));
const reports=new WeakMap();
const profiles=[
 {name:'phone',width:390,height:844,size:100},
 {name:'desktop',width:1366,height:768,size:100},
 {name:'phone 200%',width:390,height:844,size:200}
];

// Observe the first painted result of real activation. No destination scroll,
// focus reset or animation settlement is allowed before these measurements.
async function captureAction(page,testInfo,label,options,action){
 await page.evaluate(({label,trigger,hash,context,focus,sameRoute=false,returned=false})=>{
  window.__headerClearanceCleanup?.();
  const main=document.querySelector('#main'),before=main.firstElementChild;
  const record={label,expectedHash:hash,sameRoute,returned,trusted:false,samples:[],done:false};
  window.__headerClearanceCapture=record;
  let frame=0,attempts=0;
  const rect=element=>{
   if(!element)return null;
   const b=element.getBoundingClientRect(),round=n=>Math.round(n*100)/100;
   return {top:round(b.top),bottom:round(b.bottom),left:round(b.left),right:round(b.right),height:round(b.height),width:round(b.width)};
  };
  const sample=()=>{
   const ready=location.hash===hash&&(sameRoute||main.firstElementChild!==before);
   if(!ready&&++attempts<120){frame=requestAnimationFrame(sample);return;}
   const header=document.querySelector('.header'),button=returned?
    main.querySelector('.scenario-library [data-action="paired-start"][data-id="public-arrest"]'):null;
   const card=button?.closest('.encounter-card'),title=card?.querySelector('h2,h3');
   const active=document.activeElement;
   record.samples.push({ready,hash:location.hash,scrollY:Math.round(scrollY),viewport:innerHeight,
    header:rect(header),main:rect(main),context:rect(returned?card:main.querySelector(context)),
    heading:rect(returned?title:main.querySelector('h1')),button:rect(button),
    focusCorrect:returned?null:!!active?.matches(focus),
    startFocused:!!button&&active===button,titleFocused:!!title&&active===title,
    active:active?.tagName.toLowerCase()+(active?.id?'#'+active.id:''),
    horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1});
   if(record.samples.length<16)frame=requestAnimationFrame(sample);
   else record.done=true;
  };
  const activate=event=>{
   if(!event.target.closest(trigger))return;
   document.removeEventListener('click',activate,true);
   record.trusted=event.isTrusted;
   frame=requestAnimationFrame(sample);
  };
  document.addEventListener('click',activate,true);
  window.__headerClearanceCleanup=()=>{document.removeEventListener('click',activate,true);cancelAnimationFrame(frame);};
 },{label,...options});
 await action();
 await expect.poll(()=>page.evaluate(()=>window.__headerClearanceCapture?.done),{timeout:7000}).toBe(true);
 const record=await page.evaluate(()=>window.__headerClearanceCapture);
 reports.get(page).push(record);
 const issues=[];
 if(!record.trusted)issues.push('activation was not trusted browser input');
 for(const [i,s] of record.samples.entries()){
  const prefix='frame '+i+': ';
  if(!s.ready)issues.push(prefix+'destination did not render');
  if(s.horizontalOverflow)issues.push(prefix+'horizontal page overflow');
  const top=Math.max(s.header?.bottom||0,0);
  if(!s.context)issues.push(prefix+'missing meaningful page context');
  else if(options.returned){
   const available=s.viewport-top-24;
   const cardFits=s.context.height<=available+1;
   const spanFits=s.heading&&s.button&&s.button.bottom-s.heading.top<=available+1;
   if(!s.heading||s.heading.top<top-1||s.heading.top>=s.viewport)issues.push(prefix+'returned title is hidden by navigation or outside the viewport');
   if(cardFits){
    if(s.context.top<top-1||s.context.bottom>s.viewport+1)issues.push(prefix+'returned card fits but is not fully exposed');
    if(!s.startFocused)issues.push(prefix+'Start did not retain focus for a fitting card');
   }else if(spanFits){
    if(s.button.bottom>s.viewport+1)issues.push(prefix+'fitting title-to-Start context is clipped');
    if(!s.startFocused)issues.push(prefix+'Start did not retain focus for a fitting title-to-action span');
   }else if(!s.titleFocused){
    issues.push(prefix+'oversized card needs visible heading focus rather than an offscreen Start');
   }
  }else{
   if(s.context.top<top-1||s.context.top>=s.viewport)issues.push(prefix+'page opening is hidden by navigation or outside the viewport');
   if(!s.focusCorrect)issues.push(prefix+'route focus did not reach the intended heading');
  }
 }
 record.issues=[...new Set(issues)];
 if(issues.length)await page.screenshot({path:testInfo.outputPath(label.replace(/[^a-z0-9]+/gi,'-')+'.png')});
 expect.soft(record.issues,label).toEqual([]);
 return record;
}

async function nav(page,testInfo,label,target,options={}){
 await openNavigation(page);
 const trigger='#main-navigation [data-nav="'+target+'"]';
 return captureAction(page,testInfo,label,{
  trigger,hash:'#'+target,context:':scope > :first-child',focus:'#main h1',...options
 },()=>page.locator(trigger).click());
}

async function deepScroll(page){
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
 // This is a setup scroll on the old page, never a repair of the destination.
 await expect.poll(()=>page.locator('#main h1').evaluate(element=>
  element.getBoundingClientRect().bottom-document.querySelector('.header').getBoundingClientRect().bottom
 )).toBeLessThan(0);
}

async function savedCardGeometry(page,testInfo,label,selector){
 const card=page.locator(selector),title=card.locator('.flow-save-copy > strong');
 await expect(card).toHaveCount(1);
 await expect(title).toHaveText('Told you are under arrest');
 await expect(card.locator('.flow-save-copy > span')).toHaveText(/Member of the public\s*·\s*Explore both perspectives\s*·\s*Decision\s*1/);
 await expect(card.locator('.saved-session-link')).toHaveText('Resume your situation');
 // This separate check concerns the card's internal layout; route-entry
 // measurements above never use this scroll or its settled heading state.
 await card.scrollIntoViewIfNeeded();
 await expect.soft(title,label+' title is revealed').toHaveCSS('opacity','1');
 await expect.soft(title,label+' title has settled').toHaveCSS('transform','none');
 const geometry=await card.evaluate(element=>{
  const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
  const card=box(element),copy=element.querySelector('.flow-save-copy'),title=copy.querySelector('strong'),meta=copy.querySelector(':scope > span'),action=element.querySelector('.saved-session-link');
  const text=[];
  for(const part of [title,meta,action]){
   const walker=document.createTreeWalker(part,NodeFilter.SHOW_TEXT);
   for(let node=walker.nextNode();node;node=walker.nextNode()){
    const start=node.textContent.search(/\S/);if(start<0)continue;
    const range=document.createRange();range.setStart(node,start);range.setEnd(node,node.textContent.trimEnd().length);
    for(const r of range.getClientRects())if(r.width&&r.height)text.push({left:r.left,right:r.right,top:r.top,bottom:r.bottom});
   }
  }
  return {card,copy:box(copy),title:box(title),meta:box(meta),action:box(action),text,
   rootFont:getComputedStyle(document.documentElement).fontSize,
   horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};
 });
 const issues=[];
 for(const [name,b] of Object.entries({title:geometry.title,metadata:geometry.meta,action:geometry.action})){
  if(b.left<geometry.card.left-1||b.right>geometry.card.right+1||b.top<geometry.card.top-1||b.bottom>geometry.card.bottom+1)issues.push(name+' escapes the card');
 }
 if(geometry.title.bottom>geometry.meta.top+1)issues.push('title overlaps metadata');
 const a=geometry.copy,b=geometry.action;
 if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)issues.push('copy overlaps Resume');
 if(geometry.text.some(r=>r.left<geometry.card.left-1||r.right>geometry.card.right+1||r.top<geometry.card.top-1||r.bottom>geometry.card.bottom+1))issues.push('rendered text escapes the card');
 if(geometry.horizontalOverflow)issues.push('horizontal page overflow');
 reports.get(page).push({label,geometry,issues});
 if(issues.length)await page.screenshot({path:testInfo.outputPath(label.replace(/[^a-z0-9]+/gi,'-')+'.png')});
 expect.soft(issues,label).toEqual([]);
}

test.afterEach(async({page},testInfo)=>{
 const records=reports.get(page)||[];
 const unfinished=await page.evaluate(()=>window.__headerClearanceCapture).catch(()=>null);
 if(unfinished&&!unfinished.done)records.push(unfinished);
 if(records.length)await testInfo.attach('header-clearance-geometry.json',{
  body:Buffer.from(JSON.stringify(records)),contentType:'application/json'
 });
 if(testInfo.status!==testInfo.expectedStatus)await page.screenshot({path:testInfo.outputPath('header-clearance-failure.png')}).catch(()=>{});
});

for(const [site,path] of [['public','./'],['garda','garda/']])for(const profile of profiles){
 test(`${site}: arrest resume and page openings clear navigation at ${profile.name}`,async({page},testInfo)=>{
  test.setTimeout(120000);reports.set(page,[]);
  await page.setViewportSize({width:profile.width,height:profile.height});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(({key,saved})=>localStorage.setItem(key,saved),{key:progressStorageKey(site),saved});
  await page.goto(path+'?lang=en#about');
  await expect(page.locator('.about-opening')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  if(profile.size===200){
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   await expect(page.locator('html')).toHaveCSS('font-size','32px');
  }
  await deepScroll(page);
  await nav(page,testInfo,'About to Explore','encounters',{context:'.paired-picker'});

  // Open real catalogue content so even a short desktop setup page can be
  // deeply scrolled. The first same-route click then puts focus on its h1.
  await page.locator('.scenario-library > summary').click();
  await page.locator('.scenario-library [data-situation-topic="custody"] > summary').click();
  await nav(page,testInfo,'Explore initial same-route return','encounters',{context:'.paired-picker',sameRoute:true});
  await deepScroll(page);
  await nav(page,testInfo,'Explore same-route after scrolling','encounters',{context:'.paired-picker',sameRoute:true});

  const reference=site==='garda'?'evidence':'rights';
  await nav(page,testInfo,'Explore to reference page',reference);
  await deepScroll(page);
  await nav(page,testInfo,'Reference page to Progress','progress',{context:'.progress-page > .eyebrow'});
  await savedCardGeometry(page,testInfo,'Progress arrest resume card','.saved-situations .flow-save');

  await nav(page,testInfo,'Progress to About','about',{context:'.about-opening'});
  await deepScroll(page);
  await nav(page,testInfo,'About to Home','play',{context:'.reference-landing'});
  await savedCardGeometry(page,testInfo,'Home arrest resume card','.home-play .flow-save');
  await deepScroll(page);
  await nav(page,testInfo,'Home same-route after scrolling','play',{context:'.reference-landing',sameRoute:true});

  const resume='.home-play .saved-session-link';
  await captureAction(page,testInfo,'Resume arrest from Home',{
   trigger:resume,hash:stateHash(arrest),context:'.flow-topline',focus:'#scene-title'
  },()=>page.locator(resume).click());
  const returned=await captureAction(page,testInfo,'Back to arrest card',{
   trigger:'[data-return-to-play]',hash:returnTo,returned:true
  },()=>page.locator('[data-return-to-play]').click());
  if(returned.samples.at(-1)?.titleFocused){
   await page.keyboard.press('Tab');
   await expect(page.locator('.scenario-library [data-action="paired-start"][data-id="public-arrest"]')).toBeFocused();
  }
 });
}
