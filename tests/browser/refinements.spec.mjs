import {openNavigation} from './navigation.mjs';
import {test,expect} from '@playwright/test';
import {startEncounter,stateHash,decodeState,answer,continueEncounter} from '../../encounters/engine.mjs?v=site-repairs-20261125';
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const cast={public:'public-2',garda:'garda-5'};
for(const role of ['public','garda'])test(`${role}: facts, identity and variation precede decisions at phone and desktop widths`,async({page},testInfo)=>{
 let state=startEncounter('public-street',role,{cast});
 while(state.nodeId!=='street-details')state=continueEncounter(answer(state,0));
 await page.goto((role==='garda'?'garda/':'./')+stateHash(state));
 await expect(page.locator('.variation-notice strong')).toHaveText('New variation');
 await expect(page.locator('.cast-character[data-cast-role="public"]')).toContainText('Noor');
 await expect(page.locator('.cast-character[data-cast-role="public"] .scenario-person')).toHaveCount(0);
 for(const width of [320,390,768,1366]){
  await page.setViewportSize({width,height:844});
  // Read both columns in the same animation frame after the layout changes.
  await page.evaluate(()=>new Promise(resolve=>
   requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
  await expect.poll(()=>page.evaluate(()=>{
   const context=document.querySelector('.decision-context');
   const choices=document.querySelector('.decision-choices');
   if(!context||!choices)return {present:false,order:false,fullWidth:false};
   const a=context.getBoundingClientRect(),b=choices.getBoundingClientRect();
   return {
    present:true,
    order:Boolean(context.compareDocumentPosition(choices)&Node.DOCUMENT_POSITION_FOLLOWING)&&
     (a.bottom<=b.top+1||a.right<=b.left+1||b.right<=a.left+1),
    fullWidth:document.documentElement.scrollWidth<=innerWidth+1
   };
  }),{message:`${role} ${width}px: story precedes the responses in reading order and does not overlap them`})
   .toEqual({present:true,order:true,fullWidth:true});
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
 await page.locator('.scenario-library>summary').click();await page.getByRole('button',{name:'Young people',exact:true}).click();
 await expect(page.locator('.encounter-card')).toHaveCount(2);
 await page.getByRole('button',{name:'All topics',exact:true}).click();await expect(page.locator('.encounter-card')).toHaveCount(34);
 await page.locator('.scenario-library [data-situation-topic="street"]>summary').click();
 await page.locator('.scenario-library [data-action="paired-start"][data-id="public-street"]').click();
 await page.locator('[data-action="paired-answer"]').first().click();const saved=current(page);
 await openNavigation(page);await page.locator('.header [data-nav="rights"]').click();
 const youngTopic=page.locator('#rights-young'),youngSummary=page.locator('#rights-young > summary');
 await youngSummary.press('Enter');
 await expect(youngTopic).toHaveAttribute('open','');
 await expect(youngSummary).toBeFocused();
 await expect(youngTopic.locator('.source-card').first()).toBeVisible();
 await page.locator('.session-return a').click();expect(current(page)).toEqual(saved);
 await openNavigation(page);await page.locator('.header [data-reading-open]').click();await page.locator('#reading-size').selectOption('150');await page.locator('#reading-language').selectOption('ga');await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('[data-action="paired-compare"]')).toHaveText('Déan comparáid leis an taobh eile');expect(current(page)).toEqual(saved);
 for(const width of [320,390,844]){await page.setViewportSize({width,height:width===844?390:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:testInfo.outputPath('irish-large-text.png'),fullPage:true});
 await openNavigation(page);await page.locator('.header [data-nav="play"]').click();
 await page.locator('.home-progress-disclosure > summary').click();
 await expect(page.locator('.home-play .saved-session-link')).toBeVisible();
});
