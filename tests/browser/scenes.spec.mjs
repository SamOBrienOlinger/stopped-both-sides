import {test,expect} from '@playwright/test';
import {startEncounter,stateHash,decodeState,answer,continueEncounter} from '../../encounters/engine.mjs';

const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const cast={public:'public-6',garda:'garda-9'};
async function loaded(scene){
 await expect.poll(()=>scene.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
}
for(const role of ['public','garda'])test(`${role}: illustrated decisions remain usable from phone to desktop`,async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((role==='garda'?'garda/':'./')+stateHash(startEncounter('public-search',role,{cast})));
 for(const width of [320,390,768,1366,1920]){
  await page.setViewportSize({width,height:900});
  const scene=page.locator('.story>.encounter-scene');await loaded(scene);
  await expect(scene.locator('[data-scene-character="public-6"]')).toHaveCount(1);
  await expect(scene.locator('[data-scene-character="garda-9"]')).toHaveCount(1);
  const layout=await scene.evaluate(el=>{
   const stage=el.querySelector('.scene-stage').getBoundingClientRect();
   return {overflow:document.documentElement.scrollWidth>innerWidth+1,actors:[...el.querySelectorAll('.scene-actor')].every(a=>{const r=a.getBoundingClientRect();return r.left>=stage.left&&r.right<=stage.right&&r.top>=stage.top&&r.bottom<=stage.bottom;})};
  });
  expect(layout).toEqual({overflow:false,actors:true});
  if(width===390||width===1366)await scene.screenshot({path:testInfo.outputPath(`${role}-scene-${width}.png`)});
 }
 await page.setViewportSize({width:390,height:844});
 const before=await page.locator('.story .scene-actor').evaluateAll(nodes=>nodes.map(n=>n.dataset.pose));
 await page.locator('[data-action="paired-answer"]').first().click();
 await expect(page.locator('#feedback')).toBeFocused();
 await expect(page.locator('#feedback .encounter-scene')).toBeVisible();
 await loaded(page.locator('#feedback .encounter-scene'));
 expect(await page.locator('.story .scene-actor').evaluateAll(nodes=>nodes.map(n=>n.dataset.pose))).not.toEqual(before);
 await page.locator('#feedback .encounter-scene').screenshot({path:testInfo.outputPath(`${role}-feedback-phone.png`)});
 await page.locator('[data-action="paired-switch"]').click();expect(current(page).cast).toEqual(cast);
 if(current(page).answers[current(page).role]===null)await page.locator('[data-action="paired-answer"]').first().click();
 await page.locator('[data-action="paired-next"]').click();
 await expect(page.locator('.story>.encounter-scene')).toBeVisible();expect(current(page).cast).toEqual(cast);
 await page.reload();await expect(page.locator('.paired-game')).toBeVisible();expect(current(page).cast).toEqual(cast);
 for(let i=0;i<8&&!current(page).complete;i++){
  await page.locator('[data-action="paired-answer"]').first().click();await page.locator('[data-action="paired-next"]').click();
 }
 expect(current(page).complete).toBe(true);
 await expect(page.locator('.paired-recap .encounter-scene')).toHaveCount(current(page).history.length);
 await page.locator('[data-action="paired-replay-role"]').first().click();
 await expect(page.locator('.paired-game')).toBeVisible();expect(current(page).cast).toEqual(cast);
 expect(errors).toEqual([]);
});

test('Private legal advice illustrates separate locations, with both selected characters',async({page},testInfo)=>{
 let state=startEncounter('public-arrest','public',{cast});
 // This route reaches the private-advice node through validated choices.
 for(let i=0;i<8&&state.nodeId!=='arrest-silence'&&!state.complete;i++)state=continueEncounter(answer(state,0));
 expect(state.nodeId).toBe('arrest-silence');
 await page.goto('./'+stateHash(state));
 const scene=page.locator('.story>.encounter-scene');await loaded(scene);
 await expect(scene).toHaveAttribute('data-scene-mode','private');
 await expect(scene.locator('.scene-location--public')).toBeVisible();
 await expect(scene.locator('.scene-location--garda')).toBeVisible();
 await scene.screenshot({path:testInfo.outputPath('private-advice.png')});
});
