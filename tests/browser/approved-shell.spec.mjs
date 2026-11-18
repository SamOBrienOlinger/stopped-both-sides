import {test,expect} from '@playwright/test';
for(const [role,path] of [['public','./'],['garda','garda/']])test(`${role}: the hero follows the heading and both role links show their logos`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of [[390,844],[1536,1024]]){
  await page.setViewportSize({width,height});
  await page.goto(path+'?lang=en#play');
  const landing=page.locator('.reference-landing');await expect(landing).toBeVisible();
  const art=landing.locator('#paired-title + img.encounter-hero-art');
  await expect(art).toBeVisible();
  await expect(art).toHaveAttribute('alt','');
  await expect(art).toHaveCSS('object-fit','contain');
  await expect.poll(()=>art.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  const url=await art.evaluate(img=>img.currentSrc);
  expect(url).toMatch(/\/heroes\/garda-(480|960|1600)\.webp\b/);
  const response=await page.request.get(url);
  expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/webp');
  await page.evaluate(()=>document.fonts.ready);
  const heading=landing.getByRole('heading',{name:'One situation. Two perspectives.'});
  await expect(heading).toBeVisible();
  const titleLines=await heading.locator(':scope > span').evaluateAll(lines=>lines.map(line=>
   Math.round(line.getBoundingClientRect().height/parseFloat(getComputedStyle(line).lineHeight))));
  expect(titleLines).toEqual([1,1]);
  const title=await heading.boundingBox();
  const scene=await art.boundingBox();
  const deck=await landing.locator('.landing-deck').boundingBox();
  expect(scene.y).toBeGreaterThan(title.y+title.height);
  expect(scene.y+scene.height).toBeLessThan(deck.y);
  for(const perspective of ['public','garda']){
   const logo=landing.locator(`.perspective-card-link[data-role-tone="${perspective}"] > img.perspective-icon`);
   await expect(logo).toBeVisible();
   await expect(logo).toHaveAttribute('src',new RegExp(`/assets/brand/${perspective}-perspective\\.webp$`));
   await expect(logo).toHaveAttribute('alt','');
   await expect.poll(()=>logo.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  }
  await page.screenshot({path:info.outputPath(`approved-landing-${role}-${width}.png`)});
  await page.locator('html').evaluate(e=>e.classList.add('contrast-high'));
  await expect(art).toBeHidden();
  for(const link of await landing.locator('.perspective-card-link').all())await expect(link).toBeVisible();
  await page.locator('html').evaluate(e=>e.classList.remove('contrast-high'));
 }
});
