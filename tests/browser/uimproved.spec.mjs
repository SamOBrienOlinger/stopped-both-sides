import {test,expect} from '@playwright/test';

// Presentation-only regression checks for the uimproved branch.
for(const path of ['./','./garda/']){
 test(`${path} loads the refreshed visual layer without changing the role choices`,async({page})=>{
  await page.goto(path+'#play');
  await expect(page.locator('.reference-landing .perspective-hero')).toHaveCount(2);
  await expect(page.locator('link[href*="uimproved.css"]')).toHaveCount(1);
  await expect(page.locator('script[src*="uimproved.mjs"]')).toHaveCount(1);
  const styles=await page.locator('.reference-landing').evaluate(element=>{
   const style=getComputedStyle(element);
   return {radius:parseFloat(style.borderTopLeftRadius),shadow:style.boxShadow,background:style.backgroundImage};
  });
  expect(styles.radius).toBeGreaterThan(16);
  expect(styles.theme).toContain('rgba');
  expect(styles.background).toContain('gradient');
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await expect.poll(()=>page.locator('html').evaluate(element=>parseFloat(element.style.getPropertyValue('--ui-scroll-progress')))).toBeGreaterThan(85);
 });

 test(`${path} respects reduced motion in the new visual layer`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'#play');
  const values=await page.locator('.reference-landing .perspective-hero').first().evaluate(element=>{
   const style=getComputedStyle(element);
   const ambient=getComputedStyle(document.querySelector('.reference-landing'),'::after');
   return {transition:style.transitionDuration,animation:ambient.animationName};
  });
  expect(values.transition.split(',').every(value=>parseFloat(value)===0)).toBe(true);
  expect(values.animation).toBe('none');
 });
}
