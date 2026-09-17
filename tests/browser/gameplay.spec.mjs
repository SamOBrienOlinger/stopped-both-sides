import {test,expect} from '@playwright/test';
import {encounters,roles} from '../../encounters/catalog.mjs';
import {startEncounter,stateHash,decodeState} from '../../encounters/engine.mjs';
import {storyIdentity} from '../../encounters/narrative.mjs';

const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const cast={public:'public-2',garda:'garda-5'};

for(const entry of ['public','garda'])for(const e of Object.values(encounters))test(`${entry} site: ${e.id} completes with consistent characters and both perspectives`,async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto((entry==='garda'?'garda/':'./')+stateHash(startEncounter(e.id,entry,{cast})));
 for(let step=0;step<10&&!current(page).complete;step++){
  await expect(page.locator('.paired-game')).toBeVisible();
  const base=current(page),node=e.nodes[base.nodeId],identity=storyIdentity(e);
  await expect(page.locator('[data-cast-role="public"] strong')).toHaveText('Noor');
  await expect(page.locator('[data-cast-role="garda"] strong')).toHaveText('Aisling');
  await expect.poll(()=>page.locator('.story img').evaluateAll(images=>images.length>0&&images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
  if(identity&&node.scene.includes(identity.name)){
   await expect(page.locator('.story-text')).toContainText('Noor');
   await expect(page.locator('.story-text')).not.toContainText(identity.name);
  }
  for(const role of [base.role,base.role==='public'?'garda':'public']){
   if(current(page).role!==role)await page.locator('[data-action="paired-switch"]').click();
   const index=node.views[role].choices.findIndex(choice=>choice.points===1);
   await page.locator('[data-action="paired-answer"]').nth(index).click();
   await expect(page.locator('#feedback')).toBeVisible();
   if(identity)await expect(page.locator('.decision-choices')).not.toContainText(identity.name);
   expect(current(page).answers[role]).toBe(index);
  }
  const answered=current(page),next=node.views[answered.role].choices[answered.answers[answered.role]].next;
  await page.locator('[data-action="paired-next"]').click();
  await expect.poll(()=>current(page).nodeId).toBe(next);expect(current(page).cast).toEqual(cast);
 }
 const complete=current(page);expect(complete.complete).toBe(true);
 await expect(page.locator('.paired-recap .encounter-scene')).toHaveCount(complete.history.length);
 for(const role of roles)expect(complete.history.every(step=>step.answers[role]!==null)).toBe(true);
 if(storyIdentity(e))await expect(page.locator('.paired-recap')).not.toContainText(storyIdentity(e).name);
 await page.reload();await expect(page.locator('.paired-recap')).toBeVisible();expect(current(page)).toEqual(complete);
 await page.locator('[data-action="paired-revisit"]').first().click();
 await expect(page.locator('.paired-game')).toBeVisible();expect(current(page).nodeId).toBe(e.start);expect(current(page).cast).toEqual(cast);
 expect(current(page).answers).toEqual({public:null,garda:null});expect(errors).toEqual([]);
});

for(const entry of ['public','garda'])test(`${entry}: reported Noor/Aisling mismatch stays fixed after renaming, Irish, resume and recap`,async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto((entry==='garda'?'garda/':'./')+stateHash(startEncounter('garda-street','garda',{cast})));
 await expect(page.locator('.story-text')).toContainText('Noor, 24, stands beside a closed shop');
 await expect(page.locator('[data-cast-role="public"]')).toContainText('24 years old');
 await expect.poll(()=>page.locator('.story img').evaluateAll(images=>images.length>0&&images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
 // Full-page captures can precede async decoding of off-screen artwork. Also
 // inspect the actual scene in the viewport, as a player sees it after scrolling.
 await page.locator('.story>.encounter-scene').scrollIntoViewIfNeeded();
 await page.locator('.story img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
 await page.locator('.story>.encounter-scene').screenshot({path:testInfo.outputPath(`${entry}-visible-character-scene.png`)});
 await page.screenshot({path:testInfo.outputPath(`${entry}-consistent-names.png`),fullPage:true});
 await page.locator('[data-action="paired-answer"]').first().click();const saved=current(page);
 await page.locator('[data-action="paired-switch"]').click();
 await page.locator('[data-action="paired-characters"]').click();
 await expect(page.locator('[data-character="public-1"]')).toHaveAttribute('aria-label','Choose character: Alex');
 await page.locator('[data-character="public-3"]').click();
 await page.locator('[data-action="paired-character-close"]').click();
 expect(current(page).answers).toEqual(saved.answers);expect(current(page).history).toEqual(saved.history);
 await expect(page.locator('.story-text')).toContainText('Robin, 24');await expect(page.locator('.story-text')).not.toContainText('Noor');
 await page.locator('.header [data-reading-open]').click();await page.locator('#reading-language').selectOption('ga');await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('.story-text')).toContainText('Robin');await expect(page.locator('.story-text')).not.toContainText('Alex');
 await expect(page.locator('[data-cast-role="public"]')).toContainText('24 bliain d’aois');
 await page.locator('[data-site-switch]').click();await page.locator('.session-return a').click();
 await expect(page.locator('.story-text')).toContainText('Robin');expect(current(page).answers).toEqual(saved.answers);
 while(!current(page).complete){
  if(current(page).answers[current(page).role]===null)await page.locator('[data-action="paired-answer"]').first().click();
  await page.locator('[data-action="paired-next"]').click();
 }
 await expect(page.locator('.paired-recap')).toContainText('Robin');await expect(page.locator('.paired-recap')).not.toContainText('Alex');
 await page.locator('[data-action="paired-characters"]').click();await page.locator('[data-character="public-4"]').click();await page.locator('[data-action="paired-character-close"]').click();
 await expect(page.locator('.paired-recap')).toContainText('Maya');await expect(page.locator('.paired-recap')).not.toContainText('Robin');
 expect(current(page).complete).toBe(true);await page.reload();await expect(page.locator('.paired-recap')).toContainText('Maya');
});
