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
     const hero=page.locator('[data-initial-poster] .poster-hero');
     await expect(hero.locator('#paired-title')).toBeInViewport();
     await expect.poll(()=>hero.locator('.scene-backdrop img').evaluate(image=>image.complete&&image.naturalWidth>0)).toBe(true);
     await hero.evaluate(element=>{window.__initialHero=element;});
     await expect(page.locator('#loading')).toBeVisible();
     const footer=page.locator('footer');
     await expect(footer).toBeVisible();
     await expect.poll(()=>footer.evaluate(el=>el.getBoundingClientRect().top-innerHeight),
      {message:'the footer only appears after scrolling, including during startup'}).toBeGreaterThanOrEqual(-1);
    }finally{release();}
    await expect(page.locator('#loading')).toHaveCount(0);
    await expect(page.locator('#paired-title')).toBeVisible();
    expect(await page.locator('.poster-hero').evaluate(element=>element===window.__initialHero)).toBe(true);
    await expect(page.locator('.reference-landing .perspective-card')).toHaveCount(2);
    expect(errors).toEqual([]);
   });
  }
 });
}

for(const [url,title] of [['./?lang=en#rights','Human and Civil Rights & sources'],['garda/?lang=en#evidence','Evidence & sources']]){
 test('Keyboard skip preserves the loading reference route '+url,async({page})=>{
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  await page.route(url=>url.pathname.endsWith('/app.mjs'),async route=>{
   await gate;
   await route.continue();
  });
  try{
   await page.goto(url,{waitUntil:'commit'});
   await expect(page.locator('#loading')).toBeVisible();
   await page.keyboard.press('Tab');
   await expect(page.locator('.skip')).toBeFocused();
   await page.keyboard.press('Enter');
   await expect(page.locator('#main')).toBeFocused();
   expect(new URL(page.url()).hash).toBe(url.slice(url.indexOf('#')));
  }finally{release();}
  await expect(page.locator('#main h1')).toHaveText(title);
  await expect(page.locator('#main')).toBeFocused();
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
