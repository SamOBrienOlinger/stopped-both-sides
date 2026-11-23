import {test,expect} from '@playwright/test';
import {decodeState} from '../../encounters/engine.mjs?v=nia-public-20261123';
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);

for(const [path,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: a colleague-behaviour situation keeps both witness roles through comparison, reload and recap`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#encounters/'+role+'/discrimination');
  await expect(page.locator('.encounter-card')).toHaveCount(20);
  await page.locator('[data-ground="gender"]>summary').press('Enter');
  await page.locator('[data-action="paired-start"][data-id="discrimination-colleague-gender"]').click();
  await expect(page.locator('.witness-role-context')).toContainText(role==='public'?'someone else':'witnesses a colleague');
  await expect(page.locator('[data-scene-label-role="public"]')).toContainText('Public witness');
  await expect(page.locator('[data-scene-label-role="garda"]')).toContainText('Witnessing Garda');
  const story=await page.locator('.story-text').textContent();
  await page.locator('[data-action="paired-answer"]').first().click();
  const first=current(page);
  await page.locator('[data-action="paired-switch"]').click();
  await expect(page.locator('.story-text')).toHaveText(story);
  expect(current(page).answers[role]).toBe(first.answers[role]);
  await page.locator('[data-action="paired-answer"]').first().click();
  await page.reload();
  expect(current(page).answers).toEqual({public:0,garda:0});
  // Fresh reader input precedes Playwright's implicit scroll to the next action.
  await page.keyboard.press('Escape');
  await page.locator('[data-action="paired-next"]').click();
  await expect(page.locator('#scene-title')).toHaveText('An apology and an accurate record');
  for(const target of ['public','garda']){
   if(current(page).role!==target)await page.locator('[data-action="paired-switch"]').click();
   await page.locator('[data-action="paired-answer"]').first().click();
   if(target==='public'){
    await page.locator('#feedback .source-details>summary').click();
    await expect(page.locator('#feedback .source-details a[href="https://www.fiosru.ie/about-us/faqs/"]')).toBeVisible();
   }
  }
  await page.locator('[data-action="paired-next"]').click();
  await expect(page.locator('.summary-heading')).toContainText('One situation.');
  expect(current(page).complete).toBe(true);
  for(const step of current(page).history)expect(step.answers).toEqual({public:0,garda:0});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)).toBe(true);
 });
}
