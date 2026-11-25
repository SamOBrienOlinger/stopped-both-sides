import {test,expect} from '@playwright/test';
import {openNavigation,expectSettingsFocusReturn} from './navigation.mjs';
import {expectControlsFit} from './control-layout.mjs';
import {expectStaticHeadings} from './static-headings.mjs';

const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const panelGeometry=element=>{
 const bounds=element.getBoundingClientRect(),summary=element.querySelector('summary').getBoundingClientRect();
 return {height:bounds.height,open:element.open,expanded:element.querySelector('summary').getAttribute('aria-expanded'),
  inert:Array.from(element.children).filter(child=>child.tagName!=='SUMMARY').every(child=>child.inert),
  summary:{x:summary.x,y:summary.y,documentY:summary.y+scrollY,width:summary.width,height:summary.height}};
};
async function recordDisclosure(panel){
 await panel.evaluate(element=>{
  window.disclosureFrames=new Promise(resolve=>{
   element.addEventListener('click',()=>{
    const samples=[];
    const sample=()=>{
     const bounds=element.getBoundingClientRect(),summary=element.querySelector('summary').getBoundingClientRect();
     samples.push({height:bounds.height,open:element.open,expanded:element.querySelector('summary').getAttribute('aria-expanded'),
      inert:Array.from(element.children).filter(child=>child.tagName!=='SUMMARY').every(child=>child.inert),
      summary:{x:summary.x,y:summary.y,documentY:summary.y+scrollY,width:summary.width,height:summary.height}});
     if(element.hasAttribute('data-disclosure-state'))requestAnimationFrame(sample);else resolve(samples);
    };
    queueMicrotask(sample);
   },{once:true});
  });
 });
}
function expectGradualDisclosure(samples,before,opening){
 const final=samples.at(-1),low=Math.min(before.height,final.height),high=Math.max(before.height,final.height);
 const intermediate=samples.filter(sample=>sample.height>low+1&&sample.height<high-1);
 // WebKit may coalesce frames under CI load. Require two distinct
 // intermediate heights, monotonic geometry and the settled endpoint.
 expect(intermediate.length,'the panel draws intermediate heights').toBeGreaterThanOrEqual(2);
 expect(new Set(intermediate.map(sample=>Math.round(sample.height))).size,'height changes across rendered frames').toBeGreaterThanOrEqual(2);
 for(let index=1;index<samples.length;index++){
  const delta=samples[index].height-samples[index-1].height;
  expect(opening?delta:-delta,'a disclosure progresses in one direction without bouncing').toBeGreaterThanOrEqual(-1);
 }
 for(const sample of samples)for(const dimension of ['x','y','documentY','width','height']){
  expect(Math.abs(sample.summary[dimension]-before.summary[dimension]),
   'the summary is steady in the viewport and the document').toBeLessThan(1);
 }
}

for(const path of ['./','garda/']){
 test(`${path} navigation fits every control and scrolls enlarged menus within the viewport`,async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:375,height:812});
  await page.goto(path+'?lang=en#play');
  await page.evaluate(()=>document.fonts.ready);
  const nav=page.locator('#main-navigation'),toggle=page.locator('[data-nav-toggle]');
  const controls=nav.locator(':scope > :is(a,button)');
  await expect(controls).toHaveCount(8);
  const before=await page.locator('#main').evaluate(element=>element.getBoundingClientRect().top+scrollY);
  await openNavigation(page);
  await expectControlsFit(page,'all eight navigation items on a regular phone');
  await expect.poll(()=>nav.evaluate(element=>{
   const box=element.getBoundingClientRect(),header=document.querySelector('.header').getBoundingClientRect();
   const targets=[...element.querySelectorAll(':scope > :is(a,button)')];
   return {withinViewport:box.top>=header.bottom&&box.bottom<=innerHeight,
    allVisible:element.scrollHeight<=element.clientHeight+1&&targets.every(target=>{
     const rect=target.getBoundingClientRect();
     return rect.top>=box.top&&rect.bottom<=box.bottom&&rect.left>=box.left&&rect.right<=box.right;
    }),generousTargets:targets.every(target=>target.getBoundingClientRect().height>=48)};
  })).toEqual({withinViewport:true,allVisible:true,generousTargets:true});
  expect(await page.locator('#main').evaluate(element=>element.getBoundingClientRect().top+scrollY),'opening the larger menu does not move the page').toBeCloseTo(before,0);
  await page.screenshot({path:testInfo.outputPath((path==='garda/'?'garda':'public')+'-navigation-375.png')});
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  for(const width of [1366,1920]){
   await page.setViewportSize({width,height:900});
   await expect(toggle).toBeHidden();
   await expect(nav).toBeVisible();
   await expectControlsFit(page,'complete desktop navigation at '+width+'px');
   await expect.poll(()=>page.locator('.header').evaluate(header=>{
    const box=header.getBoundingClientRect();
    return box.height<=128&&[...header.querySelectorAll('nav>:is(a,button)')].every(control=>{
     const rect=control.getBoundingClientRect();
     return rect.height>=48&&rect.left>=0&&rect.right<=innerWidth&&rect.top>=box.top&&rect.bottom<=box.bottom;
    });
   })).toBe(true);
  }
  for(const lang of ['en','ar']){
   await page.setViewportSize({width:280,height:568});
   await page.goto(path+'?lang='+lang+'#play');
   await expect(page.locator('html')).toHaveAttribute('lang',lang==='en'?'en-IE':'ar');
   await page.evaluate(async()=>{await document.fonts.ready;document.documentElement.style.setProperty('--reading-size','200%');});
   await openNavigation(page);
   await expect.poll(()=>nav.evaluate(element=>{
    const box=element.getBoundingClientRect(),header=document.querySelector('.header').getBoundingClientRect();
    return {withinViewport:box.top>=header.bottom-1&&box.bottom<=innerHeight+1,
     scrolls:element.scrollHeight>element.clientHeight+1,horizontal:element.scrollWidth<=element.clientWidth+1};
   })).toEqual({withinViewport:true,scrolls:true,horizontal:true});
   await expectControlsFit(page,lang+' enlarged navigation keeps every label inside its control');
   await toggle.focus();
   for(const [index,control] of (await controls.all()).entries()){
    await page.keyboard.press('Tab');
    if(index===0&&await nav.evaluate(element=>document.activeElement===element))await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
   }
   const last=controls.last();
   await expect(last).toHaveAttribute('id','language-settings-trigger');
   await expect.poll(()=>last.evaluate(control=>{
    const box=control.getBoundingClientRect(),panel=control.parentElement.getBoundingClientRect();
    return control.parentElement.scrollTop>0&&box.top>=panel.top-1&&box.bottom<=panel.bottom+1&&box.bottom<=innerHeight+1;
   }),'the final menu control can be reached and read in the scrolled panel').toBe(true);
   await page.keyboard.press('Escape');
   await expect(toggle).toBeFocused();
   await expect(page.locator('#main')).not.toHaveAttribute('inert');
  }
 });

 test(`${path} compact navigation supports keyboard, settings, route changes and resizing`,async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await page.goto(path);
  const toggle=page.locator('[data-nav-toggle]'),nav=page.locator('#main-navigation');
  await expect(toggle).toBeVisible();await expect(nav).toBeHidden();
  await page.evaluate(()=>document.fonts.ready);
  const layout=()=>page.evaluate(()=>({main:document.querySelector('#main').getBoundingClientRect().top,
   documentMain:document.querySelector('#main').getBoundingClientRect().top+scrollY,
   header:document.querySelector('.header').getBoundingClientRect().height}));
  const beforeMenu=await layout();
  await toggle.focus();await page.keyboard.press('Enter');await expect(nav).toBeVisible();
  await expect(page.locator('#main')).toHaveAttribute('inert','');
  await expect(page.locator('.footer')).toHaveAttribute('inert','');
  await expectControlsFit(page,'open mobile navigation');
  for(let frame=0;frame<8;frame++){
   await frames(page);
   const duringMenu=await layout();
   for(const dimension of Object.keys(beforeMenu))expect(Math.abs(duringMenu[dimension]-beforeMenu[dimension]),
    'opening navigation overlays the page without moving its header or content').toBeLessThan(1);
  }
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Tab');
  // Firefox makes an overflowing scroll container a native keyboard stop.
  // Permit that exact stop, then require the first link through normal Tab input.
  if(await nav.evaluate(element=>document.activeElement===element)){
   expect(await nav.evaluate(element=>{
    const style=getComputedStyle(element);
    return (/^(auto|scroll)$/.test(style.overflowY)&&element.scrollHeight>element.clientHeight)||
     (/^(auto|scroll)$/.test(style.overflowX)&&element.scrollWidth>element.clientWidth);
   }),'a native navigation stop must expose actual scroll overflow').toBe(true);
   await page.keyboard.press('Tab');
  }
  await expect(nav.locator('a').first()).toBeFocused();
  await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await expect(nav).toBeHidden();
  await expect(page.locator('#main')).not.toHaveAttribute('inert');
  await expect(page.locator('.footer')).not.toHaveAttribute('inert');
  for(const [dimension,value] of Object.entries(await layout()))expect(Math.abs(value-beforeMenu[dimension]),
   'closing navigation leaves the page in the same position').toBeLessThan(1);
  await openNavigation(page);await page.locator('#language-settings-trigger').click();
  await expect(page.locator('#reading-dialog')).toBeVisible();
  await expect(nav).toBeHidden();
  await page.keyboard.press('Escape');await expectSettingsFocusReturn(page);
  await openNavigation(page);
  await nav.locator('[data-nav="about"]').click();
  await expect(nav).toBeHidden();await expect(page.locator('#main h1')).toBeFocused();
  await expect(toggle.locator('[data-menu-current]')).toHaveText('About');
  await openNavigation(page);await nav.locator('[data-nav="about"]').click();
  await expect(nav).toBeHidden();await expect(page.locator('#main h1')).toBeFocused();
  await openNavigation(page);await expectControlsFit(page,'open mobile navigation');
  await page.setViewportSize({width:1366,height:900});
  await expect(toggle).toBeHidden();await expect(nav).toBeVisible();
  // CSS visibility precedes asynchronous media-query state. Let the desktop
  // state settle before resizing again so both breakpoint changes are observed.
  await expect(page.locator('.header')).not.toHaveClass(/navigation-open/);
  await expect(page.locator('#main')).not.toHaveAttribute('inert');
  await nav.locator('[data-nav="play"]').focus();
  await expect(nav.locator('[data-nav="play"]')).toBeFocused();
  await page.setViewportSize({width:390,height:844});
  await expect(toggle).toBeFocused();await expect(nav).toBeHidden();
 });

 test(`${path} stationary cards and disclosures keep readable content available with reduced motion`,async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{
   window.surfaceCues=[];
   new MutationObserver(records=>{
    for(const record of records){
     const element=record.target;
     const kind=element.getAttribute?.('data-motion');
     if(!['reveal','recap','disclosure'].includes(kind))continue;
     const style=getComputedStyle(element);
     const headingOnly=element.hasAttribute('data-heading-reveal')&&['reveal','recap'].includes(kind);
     const ancestors=[];
     for(let parent=element.parentElement;parent;parent=parent.parentElement){
      if(!parent.matches('[data-motion="reveal"],[data-motion="recap"],[data-motion="disclosure"]'))continue;
      const parentStyle=getComputedStyle(parent);
      // Parent and child cards may reveal separate owned titles. Neither
      // owner may fade or move the other card's content a second time.
      ancestors.push({kind:parent.getAttribute('data-motion'),headingOnly:parent.hasAttribute('data-heading-reveal'),
       opacity:Number(parentStyle.opacity),transform:parentStyle.transform,animation:parentStyle.animationName});
     }
     const headingAnimations=headingOnly?[...element.querySelectorAll('[data-heading-motion]')]
      .filter(title=>title.closest('[data-heading-card]')===element)
      .map(title=>title.getAnimations().filter(animation=>animation.animationName==='ui-card-heading-arrive'&&
       !['finished','idle'].includes(animation.playState)).length):[];
     window.surfaceCues.push({kind,heading:element.querySelector('h1,h2,p')?.textContent||'',
      transform:style.transform,opacity:Number(style.opacity),animation:style.animationName,headingOnly,headingAnimations,
      nested:ancestors.some(parent=>!parent.headingOnly||!['reveal','recap'].includes(parent.kind)||
       parent.opacity!==1||parent.transform!=='none'||parent.animation!=='none')});
    }
   }).observe(document,{subtree:true,attributes:true,attributeFilter:['data-motion']});
  });
  await page.goto(path);await page.evaluate(()=>document.fonts.ready);
  const group=page.locator('.landing-role-actions'),button=group.locator('.perspective-card-link').first();
  await button.scrollIntoViewIfNeeded();
  const geometry=()=>group.evaluate(element=>[element,element.firstElementChild].map(target=>{
   const bounds=target.getBoundingClientRect();
   return {x:bounds.x+scrollX,y:bounds.y+scrollY,width:bounds.width,height:bounds.height};
  }));
  const before=await geometry();await button.hover();
  const samples=await group.evaluate(async element=>{
   const values=[];
   for(let frame=0;frame<12;frame++){
    await new Promise(requestAnimationFrame);
    values.push([element,element.firstElementChild].map(target=>{
     const bounds=target.getBoundingClientRect();
     return {x:bounds.x+scrollX,y:bounds.y+scrollY,width:bounds.width,height:bounds.height};
    }));
   }
   return values;
  });
  for(const sample of samples)for(let index=0;index<before.length;index++){
   for(const dimension of ['x','y','width','height'])expect(Math.abs(sample[index][dimension]-before[index][dimension]),
    'hover and entrance effects keep the role links in place').toBeLessThan(.5);
  }
  await page.goto(path+'#about');
  const initialGroup=page.locator('.about-opening .about-overview');
  await expect(initialGroup).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  // A hash-only goto stays in this document. Let the route's page cue settle
  // and register later-scroll targets before deliberately reaching one.
  await frames(page);await expect(page.locator('#main')).not.toHaveAttribute('data-motion','page');await frames(page);
  const initialHeading=await initialGroup.locator('p').first().textContent();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  expect(await page.evaluate(heading=>window.surfaceCues.some(cue=>cue.kind==='reveal'&&cue.heading===heading),initialHeading),
   'the initially visible About introduction must not dim after appearing').toBe(false);
  await expect(initialGroup).not.toHaveAttribute('data-motion','reveal');
  const laterGroup=page.locator('.content-page > section.info-block').last();
  const laterHeading=await laterGroup.locator(':scope > h2').textContent();
  await laterGroup.scrollIntoViewIfNeeded();
  await expectStaticHeadings(laterGroup.locator(':scope > h2'),'later About subheading');
  expect(await page.evaluate(heading=>window.surfaceCues.some(cue=>cue.kind==='reveal'&&cue.heading===heading),laterHeading),
   'heading-bearing cards are never queued for a later fade').toBe(false);
  await page.locator('.learning-disclosure>summary').click();
  const panel=page.locator('.learning-panel').first(),summary=panel.locator('summary');
  await summary.scrollIntoViewIfNeeded();await summary.focus();
  // Focusing a nested summary settles its opening parent. Let that layout
  // and the browser's focus scroll finish before recording the child baseline.
  await expect(page.locator('.learning-disclosure')).not.toHaveAttribute('data-disclosure-state');
  await frames(page);
  const beforeDisclosure=await panel.evaluate(panelGeometry);
  await recordDisclosure(panel);
  await page.keyboard.press('Enter');
  const opening=await page.evaluate(()=>window.disclosureFrames);
  expect(opening[0]).toMatchObject({open:true,expanded:'true',inert:false});
  expectGradualDisclosure(opening,beforeDisclosure,true);
  await expect(summary).toBeFocused();
  const beforeClosing=await panel.evaluate(panelGeometry);
  await recordDisclosure(panel);await page.keyboard.press('Enter');
  const closing=await page.evaluate(()=>window.disclosureFrames);
  expect(closing[0]).toMatchObject({open:true,expanded:'false',inert:true});
  expectGradualDisclosure(closing,beforeClosing,false);
  await expect(panel).not.toHaveAttribute('open','');
  expect(Math.abs(await panel.evaluate(element=>element.getBoundingClientRect().height)-beforeDisclosure.height),
   'closing a disclosure restores its original height').toBeLessThan(1);
  await page.keyboard.press('Enter');await expect(panel).toHaveAttribute('data-motion','disclosure');
  await expect(panel.locator('.learning-example')).toHaveCount(6);
  await expect(panel.locator('[data-motion="reveal"],[data-motion="recap"]')).toHaveCount(0);
  const surfaceCues=await page.evaluate(()=>window.surfaceCues);
  expect(surfaceCues.filter(cue=>cue.transform!=='none'||cue.nested||
   (cue.headingOnly&&(cue.opacity!==1||cue.animation!=='none'))),
   'surface cues stay stationary, and heading-only owners never multiply a nested fade').toEqual([]);
  expect(surfaceCues.some(cue=>cue.headingOnly||cue.headingAnimations.length),
   'secondary headings never receive an entrance cue').toBe(false);
  await expectStaticHeadings(page.locator('#main :is(h2,h3,h4,[data-card-heading]:not(h1))'),
   'visible About subheadings while disclosures are usable');
  const text=await page.locator('#main').innerText();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-motion]')).toHaveCount(0);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  expect(await panel.evaluate(element=>element.getAnimations({subtree:true}).some(animation=>animation.playState==='running')),
   'reduced motion immediately settles the disclosure to its latest requested state').toBe(false);
  await expect(panel).not.toHaveAttribute('data-disclosure-state');
  expect(await panel.evaluate(element=>element.style.height)).toBe('');
  expect(await page.locator('#main').innerText()).toBe(text);
  await expect(panel.locator('.learning-example').first()).toBeVisible();
 });

 test(`${path} mobile disclosures reverse smoothly and settle on resize or navigation`,async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(path);
  await expect(page.locator('.reference-landing')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await frames(page);
  await expect(page.locator('.poster-hero img.hero-public, .poster-hero img.hero-garda')).toHaveCount(2);
  await expect.poll(()=>page.locator('.poster-hero img.hero-public, .poster-hero img.hero-garda').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
  await expect(page.locator('.landing-role-actions a')).toHaveCount(2);
  if(path==='./')await page.screenshot({path:testInfo.outputPath('mobile-landing-390.png')});
  await page.goto(path+'#about');await page.locator('.learning-disclosure>summary').click();
  await expect(page.locator('.learning-panel').first()).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);await frames(page);
  await expect(page.locator('#main')).not.toHaveAttribute('data-motion','page');await frames(page);
  const toggle=page.locator('[data-nav-toggle]'),nav=page.locator('#main-navigation');
  await toggle.click();await expect(nav).toBeVisible();
  await nav.evaluate(element=>Promise.all(element.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
  if(path==='./')await page.screenshot({path:testInfo.outputPath('mobile-navigation-390.png')});
  await page.keyboard.press('Escape');await expect(nav).toBeHidden();
  const panel=page.locator('.learning-panel').first(),summary=panel.locator('summary');
  await summary.scrollIntoViewIfNeeded();await summary.focus();
  const reversal=await panel.evaluate(async element=>{
   const summary=element.querySelector('summary'),height=()=>element.getBoundingClientRect().height;
   summary.click();
   const animation=element.getAnimations().find(item=>item.effect.getKeyframes().some(frame=>'height' in frame));
   if(!animation)return {animated:false};
   await animation.ready;
   while(animation.playState==='running'&&animation.effect.getComputedTiming().progress<.3)await new Promise(requestAnimationFrame);
   const beforeClose=height();summary.click();const afterClose=height();
   const closeIntent=summary.getAttribute('aria-expanded');
   await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   const beforeReopen=height();summary.click();const afterReopen=height();
   const reopenIntent=summary.getAttribute('aria-expanded');
   const current=element.getAnimations().find(item=>item.effect.getKeyframes().some(frame=>'height' in frame));
   await current?.finished;await new Promise(requestAnimationFrame);
   return {animated:true,beforeClose,afterClose,beforeReopen,afterReopen,closeIntent,reopenIntent,
    open:element.open,height:element.style.height,state:element.getAttribute('data-disclosure-state'),
    inert:Array.from(element.children).some(child=>child.inert)};
  });
  expect(reversal).toMatchObject({animated:true,closeIntent:'false',reopenIntent:'true',open:true,height:'',state:null,inert:false});
  expect(Math.abs(reversal.afterClose-reversal.beforeClose),'reversing to close preserves the current height').toBeLessThan(1);
  expect(reversal.beforeReopen,'the panel begins moving toward closed').toBeLessThan(reversal.beforeClose);
  expect(Math.abs(reversal.afterReopen-reversal.beforeReopen),'reversing to open preserves the current height').toBeLessThan(1);
  if(path==='./')await page.screenshot({path:testInfo.outputPath('mobile-disclosure-390.png')});

  await summary.evaluate(element=>element.click());
  await page.setViewportSize({width:412,height:844});
  await expect(panel).not.toHaveAttribute('open','');
  await expect(panel).not.toHaveAttribute('data-disclosure-state');
  expect(await panel.evaluate(element=>element.style.height),'resize removes a stale pixel endpoint').toBe('');

  await summary.evaluate(element=>element.click());
  const action=panel.locator('a').first();
  await action.focus();
  await expect(action).toBeFocused();await expect(panel).not.toHaveAttribute('data-disclosure-state');
  expect(await panel.evaluate(element=>element.style.height),'focusing content makes it available immediately').toBe('');

  await panel.evaluate(element=>{window.previousDisclosure=element;element.querySelector('summary').click();location.hash='play';});
  await expect(page.locator('#main h1')).toBeFocused();
  expect(await page.evaluate(()=>({connected:window.previousDisclosure.isConnected,
   height:window.previousDisclosure.style.height,state:window.previousDisclosure.getAttribute('data-disclosure-state'),
   animations:window.previousDisclosure.getAnimations().length})),
   'a route redraw releases the old panel and its animation').toEqual({connected:false,height:'',state:null,animations:0});

  await page.goto(path+'#encounters/'+(path==='./'?'public':'garda'));
  await page.evaluate(()=>document.fonts.ready);
  const rolePanel=page.locator('.setup-role details'),roleSummary=rolePanel.locator('summary');
  await roleSummary.scrollIntoViewIfNeeded();await roleSummary.focus();
  const roleBefore=await rolePanel.evaluate(panelGeometry);
  await recordDisclosure(rolePanel);await page.keyboard.press('Enter');
  expectGradualDisclosure(await page.evaluate(()=>window.disclosureFrames),roleBefore,true);
  const roleOpened=await rolePanel.evaluate(panelGeometry);
  await recordDisclosure(rolePanel);await page.keyboard.press('Enter');
  expectGradualDisclosure(await page.evaluate(()=>window.disclosureFrames),roleOpened,false);
 });
}
