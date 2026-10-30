import {test,expect} from '@playwright/test';
import {startEncounter,stateHash,decodeState,answer,continueEncounter} from '../../encounters/engine.mjs?v=scene-review-1';

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
  const scene=page.locator('.story>.encounter-scene');await scene.scrollIntoViewIfNeeded();await loaded(scene);
  await expect(scene.locator('.scene-prop')).toHaveCount(0);
  await expect(scene.locator('[data-scene-character="public-6"]')).toHaveCount(1);
  await expect(scene.locator('[data-scene-character="garda-9"]')).toHaveCount(1);
  const layout=await scene.evaluate(el=>{
   const stage=el.querySelector('.scene-stage').getBoundingClientRect();
   const setting=el.querySelector('.scene-setting').getBoundingClientRect();
   const actors=[...el.querySelectorAll('.scene-actor')].map(a=>{
    const r=a.getBoundingClientRect();
    return {character:a.dataset.sceneCharacter,left:stage.left-r.left,right:r.right-stage.right,top:stage.top-r.top,bottom:r.bottom-stage.bottom};
   });
   return {overflow:document.documentElement.scrollWidth>innerWidth+1,settingClear:setting.bottom<=stage.top+1,actors};
  });
  expect(layout.overflow,`${role} page fits at ${width}px`).toBe(false);
  expect(layout.settingClear,`${role} setting clears the portraits at ${width}px`).toBe(true);
  for(const actor of layout.actors){
   const overflow=Math.max(0,actor.left,actor.right,actor.top,actor.bottom);
   // DOMRect edges in Firefox may differ by a fractional layout unit even
   // for contained grid children. Keep the tolerance below a visible pixel.
   if(overflow>0)console.info('Portrait edge measurement',JSON.stringify({role,width,...actor,overflow}));
   expect(overflow,`${role} portrait bounds at ${width}px: ${JSON.stringify(actor)}`).toBeLessThanOrEqual(.05);
  }
  if(width===390||width===1366)await scene.screenshot({path:testInfo.outputPath(`${role}-scene-${width}.png`)});
 }
 await page.setViewportSize({width:390,height:844});
 const before=await page.locator('.story .scene-sprite img').evaluateAll(nodes=>nodes.map(n=>({src:n.src,style:n.getAttribute('style')})));
 await page.locator('[data-action="paired-answer"]').first().click();
 await expect(page.locator('#feedback')).toBeFocused();
 await expect(page.locator('#feedback .encounter-scene')).toHaveCount(0);
 expect(await page.locator('.story .scene-sprite img').evaluateAll(nodes=>nodes.map(n=>({src:n.src,style:n.getAttribute('style')})))).toEqual(before);
 await page.locator('#feedback').screenshot({path:testInfo.outputPath(`${role}-feedback-phone.png`)});
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
 const scene=page.locator('.story>.encounter-scene');await scene.scrollIntoViewIfNeeded();await loaded(scene);
 await expect(scene).toHaveAttribute('data-scene-mode','private');
 await expect(scene.locator('.scene-location--public')).toBeVisible();
 await expect(scene.locator('.scene-location--garda')).toBeVisible();
 await expect(scene.locator('.scene-location--public [data-scene-role="public"]')).toHaveCount(1);
 await expect(scene.locator('.scene-location--public [data-scene-role="garda"]')).toHaveCount(0);
 await expect(scene.locator('.scene-location--garda [data-scene-role="garda"]')).toHaveCount(1);
 await scene.screenshot({path:testInfo.outputPath('private-advice.png')});
});

// Real rendered examples: all 18 chosen characters, every location and each
// composition mode. These screenshots support human visual review, separately
// from the geometry and game-state assertions.
const reviewCases=[
 ['public-street','street-start'],['public-search','search-start'],
 ['public-custody','custody-health'],['public-arrest','arrest-silence'],
 ['garda-supervision','supervision-start'],['public-fair-treatment','fair-start'],
 ['public-fair-treatment','fair-record'],['garda-street','street-identity'],
 ['garda-communication','communication-review']
];
function reachStage(id,nodeId,cast){
 const queue=[startEncounter(id,id.startsWith('garda-')?'garda':'public',{cast})],seen=new Set();
 while(queue.length){
  const state=queue.shift();
  if(state.nodeId===nodeId)return state;
  if(state.complete||seen.has(state.nodeId))continue;seen.add(state.nodeId);
  for(let index=0;index<3;index++){
   const answered=answer(state,index);if(answered===state)continue;
   const next=continueEncounter(answered);if(!next.complete)queue.push(next);
  }
 }
 throw Error('Unreachable visual-review stage: '+id+'/'+nodeId);
}
async function characterGeometry(scene){
 const result=await scene.locator('.scene-sprite').evaluateAll(frames=>frames.map(frame=>{
  const image=frame.querySelector('img'),bounds=frame.getBoundingClientRect(),art=image.getBoundingClientRect();
  const columns=1774/320;
  return {scale:art.width/bounds.width,columns,distortion:Math.abs(art.width/art.height-image.naturalWidth/image.naturalHeight)};
 }));
 for(const portrait of result){
  expect(portrait.scale,'the sprite sheet retains the calibrated scale inside the crop').toBeCloseTo(portrait.columns,1);
  expect(portrait.distortion,'portraits retain their source proportions').toBeLessThan(.01);
 }
 const actors=await scene.locator('.scene-actor').evaluateAll(nodes=>nodes.map(actor=>{
  const pane=actor.closest('.scene-location'),bounds=pane.getBoundingClientRect(),box=actor.getBoundingClientRect();
  return {character:actor.dataset.sceneCharacter,overflow:Math.max(bounds.left-box.left,box.right-bounds.right,bounds.top-box.top,box.bottom-bounds.bottom),floorGap:(bounds.bottom-box.bottom)/bounds.height,height:box.height/bounds.height};
 }));
 for(const actor of actors){
  expect(actor.overflow,`${actor.character} stays inside its background`).toBeLessThanOrEqual(.05);
  expect(actor.floorGap,'feet remain near the foreground floor').toBeGreaterThan(.04);
  expect(actor.floorGap,'figures are not suspended above the foreground').toBeLessThan(.08);
  expect(actor.height,'the whole figure is legible within the scene').toBeGreaterThan(.5);
  expect(actor.height,'the figure does not dominate the setting').toBeLessThan(.6);
 }
 await expect(scene).not.toContainText('Separate reflections');
}
test('Visual review: all characters, locations and separate perspectives',async({page},testInfo)=>{
 test.setTimeout(120000);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:1366,height:900});
 for(let i=0;i<reviewCases.length;i++){
  const [id,nodeId]=reviewCases[i],cast={public:'public-'+(i+1),garda:'garda-'+((i+1)%9+1)};
  await page.goto('./'+stateHash(reachStage(id,nodeId,cast)));
  const scene=page.locator('.story>.encounter-scene');
  await scene.scrollIntoViewIfNeeded();await loaded(scene);await characterGeometry(scene);
  await expect(scene.locator('.scene-sprite img')).toHaveCount(2);
  await scene.screenshot({path:testInfo.outputPath(`review-${String(i+1).padStart(2,'0')}-${nodeId}.png`)});
  await page.setViewportSize({width:320,height:900});
  await scene.scrollIntoViewIfNeeded();await characterGeometry(scene);
  await scene.screenshot({path:testInfo.outputPath(`review-${String(i+1).padStart(2,'0')}-${nodeId}-phone.png`)});
  await page.setViewportSize({width:1366,height:900});
 }
});
for(const path of ['./','garda/'])test(`${path} medication scene keeps the decision before artwork on phones`,async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const state=reachStage('public-custody','custody-health',{public:'public-3',garda:'garda-4'});
 for(const width of [320,430]){
  await page.setViewportSize({width,height:932});
  await page.goto(path+stateHash(state));
  await expect(page.locator('.story-text')).toHaveText('Robin is due prescribed medication and is beginning to feel unwell. Robin has not yet told custody staff.');
  await expect(page.locator('#main')).not.toContainText('The learner knows this');
  const choices=await page.locator('.decision-choices').boundingBox(),art=await page.locator('.story--illustrated').boundingBox();
  expect(choices.y+choices.height,'the complete decision precedes decorative artwork').toBeLessThanOrEqual(art.y);
  await page.locator('.decision-context').scrollIntoViewIfNeeded();
  await page.screenshot({path:testInfo.outputPath(`medication-decision-${width}.png`)});
  const scene=page.locator('.story>.encounter-scene');await scene.scrollIntoViewIfNeeded();await loaded(scene);await characterGeometry(scene);
  await scene.screenshot({path:testInfo.outputPath(`medication-portraits-${width}.png`)});
 }
 await page.locator('[data-action="paired-answer"]').first().click();
 await expect(page.locator('#feedback')).toBeFocused();
 await expect(page.locator('#feedback .encounter-scene')).toHaveCount(0);
 await expect(page.locator('[data-action="paired-next"]')).toBeVisible();
});
