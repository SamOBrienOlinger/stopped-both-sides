import {test,expect} from '@playwright/test';
for(const [role,path,art] of [['public','./','liffey-bridge'],['garda','garda/','gpo-city']])test(`${role}: landing shell also uses the approved original`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [390,1366]){
  await page.setViewportSize({width,height:900});
  await page.goto(path+'?lang=en#play');
  const landing=page.locator('.reference-landing');await expect(landing).toBeVisible();
  const bg=await landing.evaluate(e=>getComputedStyle(e,'::after').backgroundImage);
  expect(bg).toContain(`/dublin-approved/${art}-960.webp`);
  expect(bg).not.toContain('/dublin-lego/');
  const url=bg.match(/url\("?([^"\)]+)"?\)/)?.[1];expect(url).toBeTruthy();
  const response=await page.request.get(url);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/webp');
  await expect.poll(()=>page.locator('[data-approved-hero]').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await landing.screenshot({path:info.outputPath(`approved-landing-${role}-${width}.png`)});
  await page.locator('html').evaluate(e=>e.classList.add('contrast-high'));
  expect(await landing.evaluate(e=>getComputedStyle(e,'::after').display)).toBe('none');
 }
});
