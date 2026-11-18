import {test,expect} from '@playwright/test';
for(const [role,path] of [['public','./'],['garda','garda/']])test(`${role}: the invitation shows the full Dublin encounter illustration`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of [[390,844],[1536,1024]]){
  await page.setViewportSize({width,height});
  await page.goto(path+'?lang=en#play');
  const landing=page.locator('.reference-landing');await expect(landing).toBeVisible();
  const art=landing.locator('img.encounter-hero-art');
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
  const copy=await landing.locator('.landing-instructions').boundingBox();
  const scene=await art.boundingBox();
  if(width===1536){
   expect(scene.x).toBeGreaterThan(copy.x+copy.width);
   expect(scene.y).toBeLessThan(copy.y+copy.height);
  }else{
   expect(scene.y).toBeGreaterThan(copy.y+copy.height);
  }
  await page.screenshot({path:info.outputPath(`approved-landing-${role}-${width}.png`)});
  await page.locator('html').evaluate(e=>e.classList.add('contrast-high'));
  await expect(art).toBeHidden();
  for(const link of await landing.locator('.perspective-card-link').all())await expect(link).toBeVisible();
  await page.locator('html').evaluate(e=>e.classList.remove('contrast-high'));
 }
});
