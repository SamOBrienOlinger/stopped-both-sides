import {expect,test} from '@playwright/test';
import {startEncounter,stateHash} from '../../encounters/engine.mjs?v=site-repairs-20261125';

for(const viewport of [{width:390,height:844},{width:1366,height:768}]){
 test.describe('Homepage loading at '+viewport.width+'px',()=>{
  test.use({viewport});
  for(const path of ['./','garda/']){
   test(path+' reserves the first viewport before the application starts',async({page})=>{
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    let release;
    const gate=new Promise(resolve=>{release=resolve;});
    await page.route(url=>url.pathname.endsWith('/app.mjs'),async route=>{
     await gate;
     await route.continue();
    });
    try{
     await page.goto(path+'?lang=en#play',{waitUntil:'commit'});
     await expect(page.locator('#main .initial h1')).toBeInViewport();
     await expect(page.locator('#loading')).toBeVisible();
     const footer=page.locator('footer');
     await expect(footer).toBeVisible();
     await expect.poll(()=>footer.evaluate(el=>el.getBoundingClientRect().top-innerHeight),
      {message:'the footer only appears after scrolling, including during startup'}).toBeGreaterThanOrEqual(-1);
    }finally{release();}
    await expect(page.locator('#loading')).toHaveCount(0);
    await expect(page.locator('#paired-title')).toBeVisible();
    await expect(page.locator('.reference-landing .perspective-card')).toHaveCount(2);
    expect(errors).toEqual([]);
   });
  }
 });
}

test.describe('Cold mobile match encounter',()=>{
 test.use({viewport:{width:390,height:844},deviceScaleFactor:2});
 test('loads the three characters within the mobile artwork budget',async({page,baseURL})=>{
  const errors=[],requests=[];
  const origin=new URL(baseURL).origin;
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{
   if(response.request().resourceType()==='image'&&new URL(response.url()).origin===origin)requests.push(response);
  });
  const state=startEncounter('discrimination-race','garda',{cast:{public:'public-1',garda:'garda-4'}});
  await page.goto('garda/?lang=en'+stateHash(state));
  const stage=page.locator('.encounter-scene[data-scene-id="discrimination-race/opening"] .scene-stage');
  await stage.scrollIntoViewIfNeeded();
  const actors=stage.locator('.scene-actor img');
  await expect(actors).toHaveCount(3);
  const sources=await actors.evaluateAll(async images=>{
   await Promise.all(images.map(image=>image.decode()));
   return images.map(image=>image.currentSrc);
  });
  expect(new Set(sources).size,'three distinct character images actually decoded').toBe(3);
  await page.waitForLoadState('networkidle');
  const imageBytes=[];
  for(const response of requests){
   expect(response.ok(),response.url()).toBe(true);
   imageBytes.push({url:response.url(),bytes:(await response.body()).length});
  }
  for(const url of sources)expect(imageBytes.some(image=>image.url===url&&image.bytes>0),url).toBe(true);
  const total=imageBytes.reduce((sum,image)=>sum+image.bytes,0);
  const characters=imageBytes.filter(image=>sources.includes(image.url)).reduce((sum,image)=>sum+image.bytes,0);
  // Include issued requests for unused full-size fallbacks in the overall budget.
  expect(characters,JSON.stringify(imageBytes)).toBeLessThan(250_000);
  expect(total,JSON.stringify(imageBytes)).toBeLessThan(600_000);
  expect(errors).toEqual([]);
 });
});
