import {test,expect} from '@playwright/test';

// Presentation-only regression checks for the uimproved branch.
// Check the exact approved artwork and rendered resources, not the retired set.
for(const path of ['./','./garda/']){
 test(`${path} loads the refreshed visual layer without changing the role choices`,async({page})=>{
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('.reference-landing .perspective-hero')).toHaveCount(2);
  await expect(page.locator('.reference-landing .perspective-button-action')).toHaveText(['Explore','Explore']);
  await expect(page.locator('.reference-landing .perspective-button-action-short')).toHaveText(['Explore','Explore']);
  const heroes=page.locator('.reference-landing [data-approved-hero]');
  await expect(heroes).toHaveCount(2);
  await expect.poll(()=>heroes.evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
  const heroSources=await heroes.evaluateAll(images=>images.map(image=>image.currentSrc));
  expect(heroSources[0]).toMatch(/\/dublin-approved\/liffey-bridge-(480|960|1600)\.webp/);
  expect(heroSources[1]).toMatch(/\/dublin-approved\/gpo-city-(480|960|1600)\.webp/);
  await expect(page.locator('link[href*="uimproved.css"]')).toHaveCount(1);
  await expect(page.locator('script[src*="uimproved.mjs"]')).toHaveCount(1);
  const styles=await page.locator('.play-invitation').evaluate(element=>{
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
  const values=await page.locator('.reference-landing .perspective-hero').first().evaluate(element=>{
   const style=getComputedStyle(element);
   const invitation=getComputedStyle(document.querySelector('.play-invitation'),'::after');
   return {transition:style.transitionDuration,animation:invitation.animationName};
  });
  expect(values.transition.split(',').every(value=>parseFloat(value)===0)).toBe(true);
  expect(values.animation).toBe('none');
 });
}
