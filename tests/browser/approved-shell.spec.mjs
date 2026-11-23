import {test,expect} from '@playwright/test';
for(const [role,path] of [['public','./'],['garda','garda/']])test(`${role}: both views follow the heading without cropping and both role links show their logos`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of [[390,844],[1536,1024]]){
  await page.setViewportSize({width,height});
  await page.goto(path+'?lang=en#play');
  const landing=page.locator('.reference-landing');await expect(landing).toBeVisible();
  const pair=landing.locator('#paired-title + .encounter-hero-pair');
  await expect(pair).toBeVisible();
  await expect(pair).toHaveAttribute('aria-hidden','true');
  const images=pair.locator(':scope > img.encounter-hero-art');
  await expect(images).toHaveCount(2);
  expect(await images.evaluateAll(nodes=>nodes.map(image=>image.dataset.heroPerspective))).toEqual(['garda','public']);
  for(const [perspective,extension,type] of [['garda','jpg','jpeg'],['public','webp','webp']]){
   const art=pair.locator(`[data-hero-perspective="${perspective}"]`);
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
  const heading=landing.getByRole('heading',{name:'One situation. Two perspectives.'});
  await expect(heading).toBeVisible();
  const titleLines=await heading.locator(':scope > span').evaluateAll(lines=>lines.map(line=>
   Math.round(line.getBoundingClientRect().height/parseFloat(getComputedStyle(line).lineHeight))));
  expect(titleLines).toEqual([1,1]);
  const title=await heading.boundingBox();
  const scene=await pair.boundingBox();
  const deck=await landing.locator('.landing-deck').boundingBox();
  expect(scene.y).toBeGreaterThan(title.y+title.height);
  expect(scene.y+scene.height).toBeLessThan(deck.y);
  const [first,second]=await images.evaluateAll(nodes=>nodes.map(image=>{
   const box=image.getBoundingClientRect();
   return {x:box.x,y:box.y,right:box.right,bottom:box.bottom,width:box.width,height:box.height,ratio:image.naturalWidth/image.naturalHeight};
  }));
  for(const image of [first,second])expect(Math.abs(image.width/image.height-image.ratio),'the complete view keeps its source proportions').toBeLessThan(.01);
  expect(Math.abs(first.width-second.width),'both views receive equal space').toBeLessThanOrEqual(1);
  expect(Math.abs(first.height-second.height),'both views use the same scale').toBeLessThanOrEqual(1);
  if(width>=704){
   expect(Math.abs(first.y-second.y),'desktop views share a row').toBeLessThanOrEqual(1);
   expect(second.x,'desktop views do not overlap').toBeGreaterThan(first.right);
  }else{
   expect(Math.abs(first.x-second.x),'mobile views share a column').toBeLessThanOrEqual(1);
   expect(second.y,'mobile views do not overlap').toBeGreaterThan(first.bottom);
  }
  for(const perspective of ['public','garda']){
   const logo=landing.locator(`.perspective-card-link[data-role-tone="${perspective}"] > img.perspective-icon`);
   await expect(logo).toBeVisible();
   await expect(logo).toHaveAttribute('src',new RegExp(`/assets/brand/${perspective}-perspective\\.webp$`));
   await expect(logo).toHaveAttribute('alt','');
   await expect.poll(()=>logo.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  }
  await page.screenshot({path:info.outputPath(`approved-landing-${role}-${width}.png`)});
  await page.locator('html').evaluate(e=>e.classList.add('contrast-high'));
  await expect(pair).toBeHidden();
  for(const art of await images.all())await expect(art).toBeHidden();
  for(const link of await landing.locator('.perspective-card-link').all())await expect(link).toBeVisible();
  await page.locator('html').evaluate(e=>e.classList.remove('contrast-high'));
 }
});
