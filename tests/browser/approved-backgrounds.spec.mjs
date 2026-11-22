import {test,expect} from '@playwright/test';
import {startEncounter,stateHash} from '../../encounters/engine.mjs?v=pabi-privacy-20261122';
const cast={public:'public-6',garda:'garda-9'};
for(const role of ['public','garda'])test(`${role}: the landing image loads without cropping at mobile and desktop sizes`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,1366]){
  await page.setViewportSize({width,height:900});await page.goto((role==='garda'?'garda/':'./')+'?lang=en#play');
  const image=page.locator('.encounter-hero-art');await expect(image).toHaveCount(1);
  await expect.poll(()=>image.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
  const layout=await image.evaluate(i=>({src:i.currentSrc,fit:getComputedStyle(i).objectFit,ratio:i.clientWidth/i.clientHeight}));
  expect(layout.src).toContain('/heroes/garda-');expect(layout.fit).toBe('contain');expect(layout.ratio).toBeCloseTo(16/9,1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.locator('.reference-landing').screenshot({path:info.outputPath(`landing-${role}-${width}.png`)});
 }
});
for(const [id,art,leftMin,rightMax] of [['public-street','suburban-street',.20,.64],['public-search','bus-stop',.44,.90],['public-fair-treatment','quayside',.24,.70]])test(`${art}: chosen characters stay within pavement anchors`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,1366]){
  await page.setViewportSize({width,height:900});await page.goto('./'+stateHash(startEncounter(id,'public',{cast})));
  const pane=page.locator('.paired-scene-lead [data-approved-art]');await pane.scrollIntoViewIfNeeded();
  await expect.poll(()=>pane.locator('img').evaluateAll(nodes=>nodes.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await expect(pane).toHaveAttribute('data-approved-art',art);
  const bounds=await pane.evaluate(p=>{
   const r=p.getBoundingClientRect();return [...p.querySelectorAll('.scene-actor')].map(a=>{const b=a.getBoundingClientRect();return {left:(b.left-r.left)/r.width,right:(b.right-r.left)/r.width,foot:(r.bottom-b.bottom)/r.height,height:b.height/r.height}});
  });
  expect(bounds).toHaveLength(2);
  for(const a of bounds){expect(a.left).toBeGreaterThanOrEqual(leftMin-.002);expect(a.right).toBeLessThanOrEqual(rightMax+.002);expect(a.foot).toBeCloseTo(.06,2);expect(a.height).toBeGreaterThan(.46);expect(a.height).toBeLessThan(.51)}
  await page.locator('.paired-scene-lead>.encounter-scene').screenshot({path:info.outputPath(`${art}-${width}.png`)});
  await page.locator('[data-action="paired-switch"]').click();await expect(page.locator('.paired-scene-lead [data-scene-character="public-6"]')).toHaveCount(1);await expect(page.locator('.paired-scene-lead [data-scene-character="garda-9"]')).toHaveCount(1);
 }
});
