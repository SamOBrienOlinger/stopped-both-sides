import {test,expect} from '@playwright/test';

// Presentation-only regression checks for the uimproved branch.
// Check the exact approved artwork and rendered resources, not the retired set.
for(const path of ['./','./garda/']){
 test(`${path} loads the refreshed visual layer without changing the role choices`,async({page})=>{
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('.reference-landing .perspective-card-link')).toHaveText(['Explore the public perspective','Explore the Garda perspective']);
  const art=page.locator('.reference-landing .encounter-hero-art');
  await expect(art).toHaveCount(1);
  await expect.poll(()=>art.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  expect(await art.evaluate(img=>img.currentSrc)).toMatch(/\/heroes\/garda-hi-vis-(480|960|1600)\.jpg/);
  await expect(page.locator('link[href*="uimproved.css"]')).toHaveCount(1);
  await expect(page.locator('script[src*="uimproved.mjs"]')).toHaveCount(1);
  const styles=await art.evaluate(element=>{
   const style=getComputedStyle(element);
   return {radius:parseFloat(style.borderTopLeftRadius),theme:getComputedStyle(document.documentElement).getPropertyValue('--ui-polish-shadow').trim()};
  });
  expect(styles.radius).toBeGreaterThan(16);
  expect(styles.theme).toContain('rgba');
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await expect.poll(()=>page.locator('html').evaluate(element=>parseFloat(element.style.getPropertyValue('--ui-scroll-progress')))).toBeGreaterThan(85);
 });

 test(`${path} respects reduced motion in the new visual layer`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  const values=await page.locator('.reference-landing .perspective-card-link').first().evaluate(element=>{
   const style=getComputedStyle(element);
   const invitation=getComputedStyle(document.querySelector('#paired-title'));
   return {transition:style.transitionDuration,animation:invitation.animationName};
  });
  expect(values.transition.split(',').every(value=>parseFloat(value)===0)).toBe(true);
  expect(values.animation).toBe('none');
 });
}
