import {test,expect} from '@playwright/test';
import {startEncounter,stateHash} from '../../encounters/engine.mjs?v=situation-locations-20261122';
import {openNavigation} from './navigation.mjs';
import {expectStaticHeadings} from './static-headings.mjs';

const paths=['./','garda/'];
const arrest=stateHash(startEncounter('public-arrest','garda',{cast:{public:'public-5',garda:'garda-6'}}));
const invitation=[
 'One situation.',
 'Two perspectives.',
 'Explore your human and civil rights and police powers through interactions between members of the public and Gardaí.',
 'Read a situation, choose a response, then find out why it matters.'
];
const invitationText=':scope > :is(.encounter-hero-title,.landing-deck,.small-note)';
async function captureLanding(page,path){
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path,fullPage:true});
}

const heroSelectors=['#paired-title','[data-hero-perspective="garda"]','#perspectives-title',
 '[data-hero-perspective="public"]','.landing-deck','.landing-role-actions','.small-note'];
const heroItems=':scope > :is(.encounter-hero-title,.encounter-hero-art,.landing-deck,.landing-role-actions,.small-note)';
const settledStyles=elements=>elements.map(element=>({opacity:getComputedStyle(element).opacity,
 transform:getComputedStyle(element).transform,animation:getComputedStyle(element).animationName}));
const visibleStyles=Array(7).fill({opacity:'1',transform:'none',animation:'none'});
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

async function recordEntrances(page){
 await page.addInitScript(()=>{
  window.__landingStarts=[];window.__landingActionFrames=[];
  const decoded=new WeakSet(),decode=HTMLImageElement.prototype.decode;
  if(decode)HTMLImageElement.prototype.decode=function(...args){
   return decode.apply(this,args).then(value=>{decoded.add(this);return value;});
  };
  document.addEventListener('animationstart',event=>{
   const item=event.target;
   if(event.animationName!=='landing-portfolio-line-reveal'||!item.parentElement?.matches('.landing-instructions'))return;
   const key=item.id||(item.dataset.heroPerspective?'image-'+item.dataset.heroPerspective:
    item.matches('.landing-deck')?'deck':item.matches('.landing-role-actions')?'actions':'note');
   const style=getComputedStyle(item);
   window.__landingStarts.push({key,text:item.textContent,duration:style.animationDuration,
    easing:style.animationTimingFunction,delay:style.animationDelay,
    image:item.tagName==='IMG'?{complete:item.complete,width:item.naturalWidth,decoded:!decode||decoded.has(item)}:null});
   if(key!=='actions')return;
   const sample=()=>{
    if(!item.isConnected||item.getAttribute('data-landing-reveal')!=='active')return;
    const header=document.querySelector('.header').getBoundingClientRect();
    window.__landingActionFrames.push([...item.querySelectorAll('a')].map(link=>{
     const rect=link.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2;
     const onScreen=x>=0&&x<innerWidth&&y>=header.bottom&&y<innerHeight;
     const hit=onScreen&&document.elementFromPoint(x,y);
     return {top:rect.top+scrollY,left:rect.left+scrollX,width:rect.width,height:rect.height,
      onScreen,hit:!onScreen||!!hit&&link.contains(hit)};
    }));
    requestAnimationFrame(sample);
   };
   requestAnimationFrame(sample);
  });
 });
}

async function holdFirstHero(page,{fail=false}={}){
 let release,seen;
 const gate=new Promise(resolve=>{release=resolve;}),requested=new Promise(resolve=>{seen=resolve;});
 const pending=[];
 await page.route(url=>/\/assets\/heroes\/garda-hi-vis-\d+\.jpg$/.test(url.pathname),route=>{
  seen();
  const work=(async()=>{await gate;await (fail?route.abort('failed'):route.continue());})();
  pending.push(work);return work;
 });
 // Released image routes remain registered until context teardown. Later
 // scenarios install their own matcher without interrupting in-flight work.
 return {requested,release:async()=>{release();await Promise.all(pending);}};
}

for(const path of paths){
 test(path+' landing reveals its complete invitation once with smooth text and decoded imagery',async({page},testInfo)=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1366,height:768});
  await recordEntrances(page);
  await page.goto(path+'?lang=en#play');
  const group=page.locator('.reference-landing .landing-instructions'),items=group.locator(heroItems);
  await expect(group).toBeVisible();await expect(items).toHaveCount(7);
  const lines=group.locator(invitationText);
  await expect(lines).toHaveText(invitation);
  await page.evaluate(()=>document.fonts.ready);
  const deck=group.locator('.landing-deck');
  expect(await deck.evaluate(element=>element.getBoundingClientRect().top-innerHeight),
   'the later copy begins below the viewport in the two-image hero').toBeGreaterThan(0);
  await expect(deck).toHaveAttribute('data-landing-reveal','pending');
  await expect(deck).toHaveCSS('animation-name','none');
  expect(await page.evaluate(()=>window.__landingStarts.some(item=>item.key==='deck')),
   'offscreen copy has not already spent its entrance').toBe(false);
  await expectStaticHeadings(page.locator('#main h2:not(#perspectives-title)'),
   'subheadings outside the requested hero stay static');
  for(const selector of heroSelectors){
   const item=group.locator(selector);
   await item.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
   await expect(item).toHaveAttribute('data-landing-reveal',/^(active|complete)$/);
   await expect(item).toHaveAttribute('data-landing-reveal','complete');
  }
  await expect.poll(()=>items.evaluateAll(settledStyles)).toEqual(visibleStyles);
  const starts=await page.evaluate(()=>window.__landingStarts);
  expect(starts.map(item=>item.key).sort()).toEqual(['paired-title','image-garda','perspectives-title','image-public','deck','actions','note'].sort());
  for(const item of starts){
   expect(item.duration,item.key+' uses the reference duration').toBe('1s');
   expect(item.easing,item.key+' uses the reference easing').toBe('ease-out');
   expect(['0s','0.1s','0.2s','0.3s'],item.key+' has a short 100ms-step stagger').toContain(item.delay);
   if(item.image)expect(item.image,item.key+' can paint before its entrance starts')
    .toMatchObject({complete:true,decoded:true});
   if(item.image)expect(item.image.width).toBeGreaterThan(0);
  }
  const actionFrames=await page.evaluate(()=>window.__landingActionFrames);
  expect(actionFrames.length,'observe controls during their entrance').toBeGreaterThan(1);
  expect(actionFrames.flat().some(item=>item.onScreen),'the action links are inspected in the visible viewport').toBe(true);
  for(const sample of actionFrames)for(const [index,link] of sample.entries()){
   expect(link.hit,'visible action links receive pointer hits throughout the fade').toBe(true);
   for(const axis of ['top','left','width','height'])expect(Math.abs(link[axis]-actionFrames[0][index][axis]),
    'the '+axis+' of an action target remains stationary').toBeLessThanOrEqual(1);
  }
  await lines.first().evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
  await lines.last().evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
  await frames(page);
  expect(await page.evaluate(()=>window.__landingStarts),'scrolling back does not replay settled content').toEqual(starts);
  await lines.first().focus();
  await expect(lines.first()).not.toHaveAttribute('data-landing-reveal');
  await expect(lines.first()).toHaveCSS('opacity','1');
  await expect(lines.first()).toHaveCSS('transform','none');
  await expect(lines.first()).toHaveCSS('animation-name','none');
  const label=path==='garda/'?'garda':'public';
  await captureLanding(page,testInfo.outputPath(label+'-landing-typography-desktop.png'));
  await page.setViewportSize({width:390,height:844});
  await captureLanding(page,testInfo.outputPath(label+'-landing-typography-phone.png'));
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>items.evaluateAll(settledStyles)).toEqual(visibleStyles);
  await page.setViewportSize({width:320,height:568});
  await expect.poll(()=>page.evaluate(()=>{
   const root=document.documentElement,group=document.querySelector('.landing-instructions');
   const box=group.getBoundingClientRect();
   return root.scrollWidth<=root.clientWidth+2&&box.left>=-2&&box.right<=root.clientWidth+2;
  })).toBe(true);
 });

 test(path+' landing invitation remains readable without an intersection observer',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{window.IntersectionObserver=undefined;});
  await page.goto(path+'?lang=en#play');
  const group=page.locator('.landing-instructions');
  await expect(group.locator(invitationText)).toHaveText(invitation);
  await expect(group.locator(heroItems)).toHaveCount(7);
  await expect(page.locator('[data-landing-reveal]')).toHaveCount(0);
  expect(await group.locator(heroItems).evaluateAll(settledStyles)).toEqual(visibleStyles);
 });

 test(path+' delayed hero pixels keep their space while the copy reveals independently',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1366,height:768});
  await recordEntrances(page);
  const held=await holdFirstHero(page);
  try{
   await page.goto(path+'?lang=en#play',{waitUntil:'domcontentloaded'});await held.requested;
   const group=page.locator('.landing-instructions'),image=group.locator('[data-hero-perspective="garda"]');
   const title=group.locator('#paired-title'),deck=group.locator('.landing-deck');
   await expect(title).toHaveAttribute('data-landing-reveal','complete');
   await expect(image).toHaveAttribute('data-landing-reveal','pending');
   const reserved=await image.evaluate(element=>({width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height}));
   expect(reserved.width).toBeGreaterThan(0);
   expect(Math.abs(reserved.width/reserved.height-16/9)).toBeLessThan(.02);
   await deck.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
   await expect(deck).toHaveAttribute('data-landing-reveal','complete');
   expect(await image.evaluate(element=>element.complete),'copy finishes while the requested image is still pending').toBe(false);
   expect(await page.evaluate(()=>window.__landingStarts.some(item=>item.key==='image-garda'))).toBe(false);
   await held.release();
   await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBe(true);
   await image.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
   await expect(image).toHaveAttribute('data-landing-reveal','complete');
   const loaded=await image.evaluate(element=>({width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height}));
   for(const axis of ['width','height'])expect(Math.abs(loaded[axis]-reserved[axis]),'image decoding preserves its reserved '+axis).toBeLessThanOrEqual(1);
   const starts=await page.evaluate(()=>window.__landingStarts.filter(item=>item.key==='image-garda'));
   expect(starts).toHaveLength(1);expect(starts[0].image).toMatchObject({complete:true,decoded:true});
  }finally{await held.release();}
 });

 test(path+' pending image cancellation and failure never leave the invitation hidden',async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:390,height:844});
  await recordEntrances(page);
  for(const failure of [false,true]){
   await page.emulateMedia({reducedMotion:'no-preference'});
   const held=await holdFirstHero(page,{fail:failure});
   try{
    // A second goto to the same hash URL can stay in the existing document.
    // Distinct fixture URLs give each mode a fresh image request and preserve
    // initial-navigation semantics (reload has its own scroll-restoration guard).
    const imageCase=failure?'failure':'cancel';
    await page.goto(path+'?lang=en&hero-image-case='+imageCase+'#play',{waitUntil:'domcontentloaded'});
    await held.requested;
    const group=page.locator('.landing-instructions'),items=group.locator(heroItems);
    const image=group.locator('[data-hero-perspective="garda"]');
    await expect(image).toHaveAttribute('data-landing-reveal','pending');
    if(!failure){
     // Focus a real keyboard destination while its action group is pending.
     const link=group.locator('.perspective-card-link').first();
     await expect(group.locator('.landing-role-actions')).toHaveAttribute('data-landing-reveal','pending');
     await link.focus();await expect(link).toBeFocused();
     await expect(group.locator('.landing-role-actions')).not.toHaveAttribute('data-landing-reveal');
     await expect(group.locator('.landing-role-actions')).toHaveCSS('opacity','1');
     await expect(group.locator('.landing-role-actions')).toHaveCSS('transform','none');
     await page.emulateMedia({reducedMotion:'reduce'});
     await expect.poll(()=>items.evaluateAll(settledStyles)).toEqual(visibleStyles);
     const before=await page.evaluate(()=>window.__landingStarts);
     await held.release();
     await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBe(true);
     await page.emulateMedia({reducedMotion:'no-preference'});
     await image.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));await frames(page);
     await expect.poll(()=>items.evaluateAll(settledStyles)).toEqual(visibleStyles);
     expect(await page.evaluate(()=>window.__landingStarts),'a late image completion cannot restart cancelled entrances').toEqual(before);
    }else{
     await held.release();
     await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth===0)).toBe(true);
     await expect(image).not.toHaveAttribute('data-landing-reveal');
     await expect(image).toHaveCSS('opacity','1');
     await expect(image).toHaveCSS('transform','none');
     await group.locator('.landing-deck').evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
     await expect(group.locator('.landing-deck')).toHaveAttribute('data-landing-reveal','complete');
     expect(await page.evaluate(()=>window.__landingStarts.some(item=>item.key==='image-garda')),
      'a failed image does not run an empty entrance').toBe(false);
    }
   }finally{await held.release();}
  }
 });

 test(path+' landing pairs each heading with its image and keeps route focus unframed',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  const group=page.locator('.landing-instructions');
  const images=group.locator('.encounter-hero-art');
  await expect(images).toHaveCount(2);
  await expect.poll(()=>images.evaluateAll(nodes=>nodes.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
  await page.evaluate(()=>document.fonts.ready);
  const fits=()=>group.evaluate(element=>{
   const selectors=['#paired-title','[data-hero-perspective="garda"]','#perspectives-title','[data-hero-perspective="public"]','.landing-deck','.landing-role-actions','.small-note'];
   const children=selectors.map(selector=>element.querySelector(selector));
   const root=document.documentElement,box=element.getBoundingClientRect();
   const rects=children.map(child=>child.getBoundingClientRect());
   return {
    order:children.every((child,index)=>!index||!!(children[index-1].compareDocumentPosition(child)&Node.DOCUMENT_POSITION_FOLLOWING)),
    vertical:rects.every((rect,index)=>!index||rects[index-1].bottom<=rect.top+1),
    contained:rects.every(rect=>rect.left>=box.left-1&&rect.right<=box.right+1)&&box.left>=-1&&box.right<=root.clientWidth+1,
    noOverflow:root.scrollWidth<=root.clientWidth+1&&children.every(child=>child.scrollWidth<=child.clientWidth+1),
    proportions:children.filter(child=>child.tagName==='IMG').every(image=>Math.abs(image.clientWidth/image.clientHeight-16/9)<.02)
   };
  });
  const expected={order:true,vertical:true,contained:true,noOverflow:true,proportions:true};
  const label=path==='garda/'?'garda':'public';
  for(const width of [280,320,375,390,768,1366]){
   await page.setViewportSize({width,height:844});
   await expect.poll(fits,'headings, complete images and controls fit at '+width+'px').toEqual(expected);
   if(width===375||width===1366)await captureLanding(page,testInfo.outputPath(`${label}-landing-sequence-${width}.png`));
  }

  // Reproduce the reported rectangle using a real keyboard-activated route return.
  await page.setViewportSize({width:375,height:812});
  await page.goto(path+'?lang=en#about');
  await openNavigation(page);
  await page.locator('#main-navigation [data-nav="play"]').focus();
  await page.keyboard.press('Enter');
  const title=page.locator('#paired-title');
  await expect(title).toBeFocused();
  await expect(title).toHaveCSS('outline-style','none');
  await expect(title).toHaveCSS('box-shadow','none');
  await expect.poll(()=>title.evaluate(heading=>{
   const box=heading.getBoundingClientRect(),header=document.querySelector('.header').getBoundingClientRect();
   return {belowHeader:box.top>=header.bottom-1,withinViewport:box.bottom<=innerHeight};
  }),'the actual Home return exposes the focused heading before any capture scroll').toEqual({belowHeader:true,withinViewport:true});
  await captureLanding(page,testInfo.outputPath(`${label}-landing-return-focus-375.png`));
  await page.keyboard.press('Tab');
  const firstLink=group.locator('.perspective-card-link').first();
  await expect(firstLink).toBeFocused();
  await expect(firstLink).toHaveCSS('outline-style','solid');
  expect(await firstLink.evaluate(link=>parseFloat(getComputedStyle(link).outlineWidth))).toBeGreaterThanOrEqual(2);

  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang+'#play');
   await expect(page.locator('html')).toHaveAttribute('lang',lang==='en'?'en-IE':'ar');
   await page.evaluate(async()=>{await document.fonts.ready;document.documentElement.style.setProperty('--reading-size','200%');});
   for(const width of [280,375,768]){
    await page.setViewportSize({width,height:844});
    await expect.poll(fits,lang+' headings and images fit at 200% / '+width+'px').toEqual(expected);
   }
  }
 });

 test(path+' compact Menu shows Play across the situation picker and both learning modes',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('.reference-landing')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  const toggle=page.locator('[data-nav-toggle]');
  const current=toggle.locator('[data-menu-current]');
  const play=page.locator('#main-navigation [data-nav="encounters"]');
  const sizes=()=>toggle.evaluate(button=>({
   button:button.getBoundingClientRect().height,
   header:button.closest('.header').getBoundingClientRect().height
  }));
  await expect(toggle).toBeVisible();
  await expect(toggle.locator('[data-menu-label]')).toHaveText('Menu');
  await expect(current).toBeHidden();
  const homeSizes=await sizes();
  await toggle.click();
  await play.click();
  await expect(current).toBeVisible();
  await expect(current).toHaveText('Explore');
  await expect.poll(sizes,'adding Play keeps the Menu and sticky header the same height').toEqual(homeSizes);
  await toggle.click();
  await expect(play).toHaveText('Explore');
  await expect(play).toHaveAttribute('aria-current','page');
  await page.locator('#main-navigation [data-nav="about"]').click();
  await expect(current).toHaveText('About');
  await toggle.click();
  await play.click();
  await page.locator('[data-action="paired-quick-start"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  await expect(current).toHaveText('Explore');
  await page.goto(path+'?lang=en'+arrest);
  await expect(page.locator('html')).toHaveAttribute('data-perspective','garda');
  await expect(current).toHaveText('Explore');
  await expect.poll(sizes).toEqual(homeSizes);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await expect.poll(sizes).toEqual(homeSizes);
  await page.keyboard.press('Escape');
  await page.locator('.footer a[href="#accessibility"]').click();
  await expect(current).toBeHidden();
  await page.goto(path+'?lang=en#scenario/street');
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(current).toHaveText('Explore');
  await page.goto(path+'?lang=en#play');
  await expect(current).toBeHidden();
 });

 test(path+' profile dialogs describe this encounter without the old wording',async({page})=>{
  await page.goto(path+'#encounters');
  await page.locator('[data-action="paired-quick-start"]').click();
  const modal=page.locator('#scene-character-dialog');
  for(const role of ['public','garda']){
   await page.locator('.paired-scene-lead .scene-character-label[data-scene-label-role="'+role+'"]').click();
   await expect(modal).toBeVisible();
   await expect(modal.locator('#scene-character-dialog-summary')).toContainText('in this encounter');
   await expect(modal.locator('#scene-character-dialog-summary')).not.toContainText('in the fictional encounter');
   await modal.getByRole('button',{name:'Close character details'}).click();
   await expect(modal).not.toBeVisible();
  }
 });
}
