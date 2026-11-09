import {test,expect} from '@playwright/test';
import {openNavigation} from './navigation.mjs';
import {expectControlsFit} from './control-layout.mjs';

for(const path of ['./','garda/']){
 test(`${path} compact navigation supports keyboard, settings, route changes and resizing`,async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await page.goto(path);
  const toggle=page.locator('[data-nav-toggle]'),nav=page.locator('#main-navigation');
  await expect(toggle).toBeVisible();await expect(nav).toBeHidden();
  await toggle.focus();await page.keyboard.press('Enter');await expect(nav).toBeVisible();
  await page.keyboard.press('Tab');await expect(nav.locator('a').first()).toBeFocused();
  await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await expect(nav).toBeHidden();
  await openNavigation(page);await page.locator('#language-settings-trigger').click();
  await expect(page.locator('#reading-dialog')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.locator('#language-settings-trigger')).toBeFocused();
  await nav.locator('[data-nav="about"]').click();
  await expect(nav).toBeHidden();await expect(page.locator('#main h1')).toBeFocused();
  await expect(toggle.locator('[data-menu-current]')).toHaveText('About');
  await openNavigation(page);await nav.locator('[data-nav="about"]').click();
  await expect(nav).toBeHidden();await expect(page.locator('#main h1')).toBeFocused();
  await openNavigation(page);await expectControlsFit(page,'open mobile navigation');
  await page.setViewportSize({width:1366,height:900});
  await expect(toggle).toBeHidden();await expect(nav).toBeVisible();
  await nav.locator('[data-nav="play"]').focus();
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
  const summaryGeometry=()=>summary.evaluate(element=>{
   const bounds=element.getBoundingClientRect();
   return {x:bounds.x+scrollX,y:bounds.y+scrollY,width:bounds.width,height:bounds.height};
  });
  const summaryBefore=await summaryGeometry(),closedHeight=await panel.evaluate(element=>element.getBoundingClientRect().height);
  const finishDisclosure=()=>panel.evaluate(element=>Promise.all(element.getAnimations({subtree:true}).map(animation=>animation.finished.catch(()=>{}))));
  await page.keyboard.press('Enter');
  await expect(panel).toHaveAttribute('data-motion','disclosure');
  await expect(summary).toBeFocused();await expect(panel).toHaveAttribute('open','');
  const openingSummary=await summaryGeometry();
  await finishDisclosure();
  expect(await panel.evaluate(element=>element.getBoundingClientRect().height)).toBeGreaterThan(closedHeight);
  await page.keyboard.press('Enter');await expect(panel).not.toHaveAttribute('open','');await finishDisclosure();
  expect(Math.abs(await panel.evaluate(element=>element.getBoundingClientRect().height)-closedHeight),
   'closing a disclosure restores its original height').toBeLessThan(1);
  for(const position of [openingSummary,await summaryGeometry()])for(const dimension of ['x','y','width','height']){
   expect(Math.abs(position[dimension]-summaryBefore[dimension]),'the summary stays in place during opening and closing').toBeLessThan(1);
  }
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
   'reduced motion also stops a native disclosure-content transition').toBe(false);
  expect(await page.locator('#main').innerText()).toBe(text);
  await expect(panel.locator('.learning-example').first()).toBeVisible();
 });
}
