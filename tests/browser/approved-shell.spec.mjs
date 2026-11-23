import {test,expect} from '@playwright/test';
for(const [role,path] of [['public','./'],['garda','garda/']])test(`${role}: each view follows its heading without cropping and both role links show their logos`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of [[390,844],[1536,1024]]){
  await page.setViewportSize({width,height});
  await page.goto(path+'?lang=en#play');
  const landing=page.locator('.reference-landing');await expect(landing).toBeVisible();
  await expect(landing).toHaveAccessibleName('One situation. Two perspectives.');
  const images=landing.locator('.landing-instructions > img.encounter-hero-art');
  await expect(images).toHaveCount(2);
  expect(await images.evaluateAll(nodes=>nodes.map(image=>image.dataset.heroPerspective))).toEqual(['garda','public']);
  for(const [perspective,extension,type] of [['garda','jpg','jpeg'],['public','webp','webp']]){
   const art=landing.locator(`[data-hero-perspective="${perspective}"]`);
   await expect(art).toBeVisible();
   await expect(art).toHaveAttribute('alt','');
   await expect(art).toHaveCSS('object-fit','contain');
   await expect(art).toHaveCSS('transform','none');
   await expect.poll(()=>art.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
   const url=await art.evaluate(img=>img.currentSrc);
   expect(url).toMatch(new RegExp(`/heroes/${perspective}-hi-vis-(480|960|1600)\\.${extension}\\b`));
   const response=await page.request.get(url);
   expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/'+type);
  }
  await page.evaluate(()=>document.fonts.ready);
  const heading=landing.getByRole('heading',{name:'One situation.',level:1,exact:true});
  const secondHeading=landing.getByRole('heading',{name:'Two perspectives.',level:2,exact:true});
  await expect(heading).toBeVisible();
  await expect(secondHeading).toBeVisible();
  await expect(landing.locator('#paired-title + img')).toHaveAttribute('data-hero-perspective','garda');
  await expect(landing.locator('#perspectives-title + img')).toHaveAttribute('data-hero-perspective','public');
  const title=await heading.boundingBox();
  const secondTitle=await secondHeading.boundingBox();
  const deck=await landing.locator('.landing-deck').boundingBox();
  const [first,second]=await images.evaluateAll(nodes=>nodes.map(image=>{
   const box=image.getBoundingClientRect();
   return {x:box.x,y:box.y,right:box.right,bottom:box.bottom,width:box.width,height:box.height,ratio:image.naturalWidth/image.naturalHeight};
  }));
  for(const image of [first,second])expect(Math.abs(image.width/image.height-image.ratio),'the complete view keeps its source proportions').toBeLessThan(.01);
  expect(first.y,'the first image is directly below One situation.').toBeGreaterThan(title.y+title.height);
  expect(secondTitle.y,'Two perspectives. follows the first image').toBeGreaterThan(first.bottom);
  expect(second.y,'the reverse image is directly below Two perspectives.').toBeGreaterThan(secondTitle.y+secondTitle.height);
  expect(second.bottom,'the introduction follows both illustrations').toBeLessThan(deck.y);
  expect(Math.abs(first.width-second.width),'both views receive equal space').toBeLessThanOrEqual(1);
  expect(Math.abs(first.height-second.height),'both views use the same scale').toBeLessThanOrEqual(1);
  expect(Math.abs(first.x-second.x),'both complete views share a column at every width').toBeLessThanOrEqual(1);
  expect(second.y,'the views do not overlap').toBeGreaterThan(first.bottom);
  for(const perspective of ['public','garda']){
   const logo=landing.locator(`.perspective-card-link[data-role-tone="${perspective}"] > img.perspective-icon`);
   await expect(logo).toBeVisible();
   await expect(logo).toHaveAttribute('src',new RegExp(`/assets/brand/${perspective}-perspective\\.webp$`));
   await expect(logo).toHaveAttribute('alt','');
   await expect.poll(()=>logo.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  }
  await page.screenshot({path:info.outputPath(`approved-landing-${role}-${width}.png`)});
  await page.locator('html').evaluate(e=>e.classList.add('contrast-high'));
  for(const art of await images.all())await expect(art).toBeHidden();
  await expect(heading).toBeVisible();
  await expect(secondHeading).toBeVisible();
  for(const link of await landing.locator('.perspective-card-link').all())await expect(link).toBeVisible();
  await page.locator('html').evaluate(e=>e.classList.remove('contrast-high'));
 }
});
