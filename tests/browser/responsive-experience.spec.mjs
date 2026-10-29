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
  await openNavigation(page);await expectControlsFit(page,'open mobile navigation');
  await page.setViewportSize({width:1366,height:900});
  await expect(toggle).toBeHidden();await expect(nav).toBeVisible();
  await nav.locator('[data-nav="play"]').focus();
  await page.setViewportSize({width:390,height:844});
  await expect(toggle).toBeFocused();await expect(nav).toBeHidden();
 });

 test(`${path} readable paragraphs and scroll reveals keep text available with reduced motion`,async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{
   window.revealDelays=[];
   new MutationObserver(records=>{
    for(const record of records){
     const element=record.target;
     if(element.getAttribute?.('data-motion')==='reveal')window.revealDelays.push(getComputedStyle(element).animationDelay);
    }
   }).observe(document,{subtree:true,attributes:true,attributeFilter:['data-motion']});
  });
  await page.goto(path+'#about');
  await expect(page.locator('[data-reading-chunk]').first()).toBeVisible();
  const panel=page.locator('.learning-panel').first();
  await panel.locator('summary').click();
  await expect(panel.locator('.learning-example')).toHaveCount(6);
  await panel.locator('.learning-example').first().scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(()=>window.revealDelays.some(value=>parseFloat(value)>0))).toBe(true);
  const text=await page.locator('#main').innerText();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-motion]')).toHaveCount(0);
  expect(await page.locator('#main').innerText()).toBe(text);
  await expect(panel.locator('.learning-example').first()).toBeVisible();
 });
}
