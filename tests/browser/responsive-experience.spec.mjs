import {test,expect} from '@playwright/test';
import {openNavigation,expectSettingsFocusReturn} from './navigation.mjs';
import {expectControlsFit} from './control-layout.mjs';

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
  await page.keyboard.press('Tab');await expect(nav.locator('a').first()).toBeFocused();
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
     window.surfaceCues.push({kind,heading:element.querySelector('h2')?.textContent||'',
      transform:getComputedStyle(element).transform,
      nested:!!element.parentElement?.closest('[data-motion="reveal"],[data-motion="recap"],[data-motion="disclosure"]')});
    }
   }).observe(document,{subtree:true,attributes:true,attributeFilter:['data-motion']});
  });
  await page.goto(path);await page.evaluate(()=>document.fonts.ready);
  const card=page.locator('.perspective-hero').first(),button=card.locator('a');
  await card.scrollIntoViewIfNeeded();
  const geometry=()=>card.evaluate(element=>[element,element.querySelector('a')].map(target=>{
   const bounds=target.getBoundingClientRect();
   return {x:bounds.x+scrollX,y:bounds.y+scrollY,width:bounds.width,height:bounds.height};
  }));
  const before=await geometry();await button.hover();
  const samples=await card.evaluate(async element=>{
   const values=[];
   for(let frame=0;frame<12;frame++){
    await new Promise(requestAnimationFrame);
    values.push([element,element.querySelector('a')].map(target=>{
     const bounds=target.getBoundingClientRect();
     return {x:bounds.x+scrollX,y:bounds.y+scrollY,width:bounds.width,height:bounds.height};
    }));
   }
   return values;
  });
  for(const sample of samples)for(let index=0;index<before.length;index++){
   for(const dimension of ['x','y','width','height'])expect(Math.abs(sample[index][dimension]-before[index][dimension]),
    'hover and entrance effects keep each card and its button in place').toBeLessThan(.5);
  }
  await page.goto(path+'#about');
  await expect(page.locator('[data-reading-chunk]').first()).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  // A hash-only goto stays in this document. Let the route's page cue settle
  // and register later-scroll targets before deliberately reaching one.
  await frames(page);await expect(page.locator('#main')).not.toHaveAttribute('data-motion','page');await frames(page);
  const initialGroup=page.locator('.content-page > .info-block').first();
  const initialHeading=await initialGroup.locator('h2').textContent();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  expect(await page.evaluate(heading=>window.surfaceCues.some(cue=>cue.kind==='reveal'&&cue.heading===heading),initialHeading),
   'initially visible information does not dim after it has already appeared').toBe(false);
  const laterGroup=page.locator('.content-page > .info-block').last();
  const laterHeading=await laterGroup.locator('h2').textContent();
  await laterGroup.scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(heading=>window.surfaceCues.some(cue=>cue.kind==='reveal'&&cue.heading===heading),laterHeading)).toBe(true);
  const panel=page.locator('.learning-panel').first(),summary=panel.locator('summary');
  await summary.scrollIntoViewIfNeeded();await summary.focus();
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
  expect(await page.evaluate(()=>window.surfaceCues.every(cue=>cue.transform==='none'&&!cue.nested)),
   'surface cues do not translate content or multiply through nested groups').toBe(true);
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
  await expect.poll(()=>page.locator('.perspective-hero img').evaluateAll(images=>images.length===2&&images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
  if(path==='./')await page.screenshot({path:testInfo.outputPath('mobile-landing-390.png')});
  await page.goto(path+'#about');await expect(page.locator('.learning-panel').first()).toBeVisible();
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
