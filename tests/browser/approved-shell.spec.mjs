import {test,expect} from '@playwright/test';
for(const [role,path,art] of [['public','./','quayside'],['garda','garda/','suburban-street']])test(`${role}: the invitation shows full approved art on desktop`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [390,1366]){
  await page.setViewportSize({width,height:900});
  await page.goto(path+'?lang=en#play');
  const landing=page.locator('.reference-landing');await expect(landing).toBeVisible();
  const invitation=landing.locator('.play-invitation');
  const artwork=()=>invitation.evaluate(e=>{
   const style=getComputedStyle(e,'::after');
   return {content:style.content,display:style.display,image:style.backgroundImage,size:style.backgroundSize};
  });
  const artStyle=await artwork();
  if(width===1366){
   expect(artStyle.display).not.toBe('none');
   expect(artStyle.content).not.toBe('none');
   expect(artStyle.image).toContain(`/dublin-approved/${art}-960.webp`);
   expect(artStyle.image).not.toContain('/dublin-lego/');
   expect(artStyle.size).toBe('contain');
   const url=artStyle.image.match(/url\("?([^"\)]+)"?\)/)?.[1];expect(url).toBeTruthy();
   const response=await page.request.get(url);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/webp');
  }else{
   expect(artStyle.content).toBe('none');
  }
  await expect.poll(()=>page.locator('[data-approved-hero]').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await landing.screenshot({path:info.outputPath(`approved-landing-${role}-${width}.png`)});
  await page.locator('html').evaluate(e=>e.classList.add('contrast-high'));
  const contrast=await artwork();
  expect(contrast.content==='none'||contrast.display==='none').toBe(true);
  await page.locator('html').evaluate(e=>e.classList.remove('contrast-high'));
 }
});
