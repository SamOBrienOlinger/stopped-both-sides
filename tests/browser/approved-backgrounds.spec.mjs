import {test,expect} from '@playwright/test';
import {decodeState,startEncounter,stateHash} from '../../encounters/engine.mjs?v=nia-public-20261123';
const cast={public:'public-6',garda:'garda-9'};
for(const role of ['public','garda'])test(`${role}: the poster loads the approved GPO background at mobile and desktop sizes`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,1366]){
  await page.setViewportSize({width,height:900});await page.goto((role==='garda'?'garda/':'./')+'?lang=en#play');
  const image=page.locator('.poster-hero .scene-backdrop img');
  await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
  const url=await image.evaluate(i=>i.currentSrc);
  expect(new URL(url).pathname).toMatch(/\/assets\/dublin-approved\/gpo-city-(480|960|1600)\.webp$/);
  const response=await page.request.get(url);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/webp');
  await expect(image).toHaveCSS('object-fit','cover');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.locator('.reference-landing').screenshot({path:info.outputPath(`landing-${role}-${width}.png`)});
 }
});
// Expected foot positions are measured against the pavement in each illustration.
// The nearby passerby in Amina’s opening scene stands further back on the quay.
const outdoorOpenings=[
 ['public-street','suburban-street',{public:[.24,.28,.04],garda:[.51,.23,.14]}],
 ['public-search','bus-stop',{public:[.60,.26,.06],garda:[.84,.24,.09]}],
 ['public-fair-treatment','quayside',{public:[.39,.26,.06],garda:[.68,.26,.03],passerby:[.19,.17,.18]}]
];
for(const [id,art,positions] of outdoorOpenings)test(`${art}: the pictured people stay on their pavement marks`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,1366]){
  await page.setViewportSize({width,height:900});await page.goto('./'+stateHash(startEncounter(id,'public',{cast})));
  const pane=page.locator('.paired-scene-lead [data-approved-art]');await pane.scrollIntoViewIfNeeded();
  await expect.poll(()=>pane.locator('img').evaluateAll(nodes=>nodes.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await expect(pane).toHaveAttribute('data-approved-art',art);
  const bounds=await pane.evaluate(p=>{
   const r=p.getBoundingClientRect();
   return [...p.querySelectorAll('.scene-actor')].map(a=>{
    const b=a.getBoundingClientRect();
    return {role:a.dataset.sceneRole,x:(b.left+b.width/2-r.left)/r.width,width:b.width/r.width,
     floor:(r.bottom-b.bottom)/r.height,height:b.height/r.height};
   });
  });
  expect(bounds.map(actor=>actor.role).sort()).toEqual(Object.keys(positions).sort());
  for(const actor of bounds){
   const [x,width,floor]=positions[actor.role];
   expect(actor.x).toBeCloseTo(x,2);expect(actor.width).toBeCloseTo(width,2);
   expect(actor.floor).toBeCloseTo(floor,2);expect(actor.height).toBeCloseTo(width*16/9,2);
  }
  await page.locator('.paired-scene-lead>.encounter-scene').screenshot({path:info.outputPath(`${art}-${width}.png`)});
  await page.locator('[data-action="paired-switch"]').click();
  const publicId=id==='public-fair-treatment'?'story-amina':'public-6';
  await expect(page.locator('.paired-scene-lead [data-scene-role="public"]')).toHaveAttribute('data-scene-character',publicId);
  await expect(page.locator('.paired-scene-lead [data-scene-role="garda"]')).toHaveAttribute('data-scene-character','garda-9');
  expect(decodeState(new URL(page.url()).hash.slice(11)).cast).toEqual(cast);
 }
});
