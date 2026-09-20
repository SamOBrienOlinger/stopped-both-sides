import {test,expect} from '@playwright/test';
import {startEncounter,currentStage,stateHash,decodeState,switchRole,answer,continueEncounter} from '../../encounters/engine.mjs';
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const cast={public:'public-2',garda:'garda-5'};
for(const role of ['public','garda'])test(`${role}: facts, identity and variation precede decisions at phone and desktop widths`,async({page},testInfo)=>{
 let state=startEncounter('public-street',role,{cast});
 while(state.nodeId!=='street-details')state=continueEncounter(answer(state,0));
 await page.goto((role==='garda'?'garda/':'./')+stateHash(state));
 await expect(page.locator('.variation-notice strong')).toHaveText('New variation');
 await expect(page.locator('.cast-character[data-cast-role="public"]')).toContainText('Noor');
 await expect(page.locator('.cast-character[data-cast-role="public"]')).toContainText('24 years old');
 for(const width of [320,390,768,1366]){
  await page.setViewportSize({width,height:844});
  const context=await page.locator('.decision-context').boundingBox(),choices=await page.locator('.decision-choices').boundingBox();
  expect(context.y+context.height).toBeLessThanOrEqual(choices.y);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  if(width===390||width===1366){await page.locator('#scene-title').focus();await page.screenshot({path:testInfo.outputPath(`${role}-decision-${width}.png`),fullPage:true});}
 }
 await page.locator('[data-action="paired-answer"]').first().click();const before=current(page);
 await page.locator('[data-action="paired-compare"]').click();
 expect(current(page).answers).toEqual(before.answers);expect(current(page).cast).toEqual(cast);expect(current(page).nodeId).toBe(before.nodeId);
 await page.locator('[data-action="paired-answer"]').first().click();
 await page.locator('[data-action="paired-next"]').click();
 while(!current(page).complete){await page.locator('[data-action="paired-answer"]').first().click();await page.locator('[data-action="paired-next"]').click();}
 await expect(page.locator('.recap-takeaways')).toBeVisible();
 await expect(page.locator('.recap-scores')).not.toHaveAttribute('open','');
 await expect(page.locator('.paired-recap .encounter-scene')).toHaveCount(current(page).history.length);
 const recap=await page.locator('.paired-recap').boundingBox();expect(recap.width).toBeGreaterThan(900);
 await page.screenshot({path:testInfo.outputPath(`${role}-recap.png`),fullPage:true});
});

test('Topics, source navigation and returning-player actions are usable with enlarged text',async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});await page.goto('./#encounters/public');
 await page.locator('.scenario-library summary').click();await page.getByRole('button',{name:'Young people',exact:true}).click();
 await expect(page.locator('.encounter-card')).toHaveCount(2);
 await page.getByRole('button',{name:'All topics',exact:true}).click();await expect(page.locator('.encounter-card')).toHaveCount(16);
 await page.locator('[data-action="paired-quick-start"]').click();await page.locator('[data-action="paired-answer"]').first().click();const saved=current(page);
 await page.locator('.header [data-nav="rights"]').click();await page.getByRole('link',{name:'Under 18s',exact:true}).click();
 await expect(page.locator('#rights-young')).toBeFocused();await page.locator('.session-return a').click();expect(current(page)).toEqual(saved);
 await page.locator('.header [data-reading-open]').click();await page.locator('#reading-size').selectOption('150');await page.locator('#reading-language').selectOption('ga');await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('[data-action="paired-compare"]')).toHaveText('Féach ar an taobh eile');expect(current(page)).toEqual(saved);
 for(const width of [320,390,844]){await page.setViewportSize({width,height:width===844?390:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:testInfo.outputPath('irish-large-text.png'),fullPage:true});
 await page.locator('.header [data-nav="play"]').click();await expect(page.locator('.session-return a')).toBeVisible();
});

test('Witness reporting keeps role knowledge distinct and ends with the fuller picture',async({page},testInfo)=>{
 const witnessCast={...cast,public:'public-5'};
 await page.setViewportSize({width:390,height:844});
 await page.goto('./'+stateHash(startEncounter('public-witness','public',{cast:witnessCast})));
 await expect(page.locator('[data-cast-role="public"] strong')).toHaveText('Daniel');
 await expect(page.locator('.story-text')).toContainText('Daniel, 24, arrives');
 await expect(page.locator('.story-text')).toContainText('Cian steps backwards');
 await expect(page.locator('.knowledge-panel section')).toHaveCount(3);
 await expect(page.locator('.knowledge-panel')).toContainText('You arrived part-way through');
 const scene=await page.locator('.story-text').innerText();
 await page.locator('[data-action="paired-switch"]').click();
 await expect(page.locator('.story-text')).toHaveText(scene);
 await expect(page.locator('.knowledge-panel')).toContainText('you did not see Cian strike');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:testInfo.outputPath('witness-knowledge-phone.png'),fullPage:true});

 let recap=startEncounter('public-witness','public',{cast:witnessCast});
 while(!recap.complete){
  for(const role of ['public','garda']){
   const choices=currentStage(recap).views[role].choices;
   recap=answer(switchRole(recap,role),choices.findIndex(choice=>choice.points===1));
  }
  recap=continueEncounter(recap);
 }
 await page.goto('./'+stateHash(recap));await page.setViewportSize({width:1366,height:768});
 await expect(page.locator('.fuller-picture')).toBeVisible();
 await expect(page.locator('.fuller-picture li')).toHaveCount(5);
 await expect(page.locator('.fuller-picture')).toContainText('It does not decide whether the conduct was unlawful or corrupt.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:testInfo.outputPath('witness-fuller-picture-desktop.png'),fullPage:true});
 await page.locator('.header [data-reading-open]').click();await page.locator('#reading-language').selectOption('ga');await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('.fuller-picture .eyebrow')).toHaveText('AN PICTIÚR NÍOS IOMLÁINE');
 await expect(page.locator('.paired-recap')).toContainText('Daniel');
 await expect(page.locator('.paired-recap')).toContainText('Cian');
});
