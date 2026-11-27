import {test,expect} from '@playwright/test';

// Presentation-only regression checks for the uimproved branch.
// Check the exact approved artwork and rendered resources, not the retired set.
for(const path of ['./','./garda/']){
 test(`${path} loads the refreshed visual layer without changing the role choices`,async({page})=>{
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('.reference-landing .perspective-card')).toHaveText(['Public perspective','Garda perspective']);
  await expect(page.locator('link[href*="poster-landing.css"]')).toHaveCount(1);
  await expect(page.locator('link[href*="uimproved.css"]')).toHaveCount(1);
  await expect(page.locator('script[src*="uimproved.mjs"]')).toHaveCount(1);
  const panels=page.locator('.reference-landing .perspective-card');
  await expect(panels).toHaveCount(2);
  for(const panel of await panels.all())await expect(panel).toBeVisible();
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await expect.poll(()=>page.locator('html').evaluate(element=>parseFloat(element.style.getPropertyValue('--ui-scroll-progress')))).toBeGreaterThan(85);
 });

 test(`${path} respects reduced motion in the new visual layer`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  const values=await page.locator('.reference-landing .perspective-card').first().evaluate(element=>{
   const style=getComputedStyle(element);
   const invitation=getComputedStyle(document.querySelector('#paired-title'));
   return {transition:style.transitionDuration,animation:invitation.animationName};
  });
  expect(values.transition.split(',').every(value=>parseFloat(value)===0)).toBe(true);
  expect(values.animation).toBe('none');
 });
}
