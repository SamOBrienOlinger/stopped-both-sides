import {test,expect} from '@playwright/test';
import {encounters} from '../../encounters/catalog.mjs';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=site-repairs-20261125';
import {decodeState} from '../../encounters/engine.mjs?v=site-repairs-20261125';
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);

const normalized=text=>text.replace(/\s+/g,' ').trim();
const sceneText=async page=>normalized((await page.locator('.decision-context .story-text').allTextContents()).join(' '));

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
  const story=await sceneText(page);
  await page.locator('[data-action="paired-answer"]').first().click();
  const first=current(page);
  await page.locator('[data-action="paired-switch"]').click();
  await expect.poll(()=>sceneText(page)).toBe(story);
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

for(const [path,role,language] of [['./','public','ga'],['garda/','garda','ar']]){
 test(`${language}/${role}: the catalogue, decisions and feedback use the selected language on both sides`,async({page})=>{
  await loadLanguage(language);
  const encounter=encounters['discrimination-colleague-gender'];
  const stage=encounter.nodes.opening;
  const translated=text=>translateText(text,language);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang='+language+'#encounters/'+role+'/discrimination');
  await expect(page.locator('html')).toHaveAttribute('lang',language);
  const group=page.locator('[data-ground="gender"]');
  await group.locator(':scope>summary').press('Enter');
  const card=group.locator('.encounter-card').filter({has:page.locator('[data-id="'+encounter.id+'"]')});
  await expect(card.getByRole('heading')).toHaveText(translated(encounter.title));
  await card.locator('button').click();
  const affected=page.locator('.scene-supporting-person[data-scene-participant="affected"] strong');
  await expect(affected).toHaveText(translated('Woman reporting the bicycle theft'));
  const witness=page.locator('[data-scene-label-role="public"]');
  await witness.click();
  const profile=page.locator('#scene-character-dialog');
  await expect(profile.locator('.scene-profile-body')).toHaveText(translated('You witness the Garda’s behaviour towards the affected person. You are not the person being targeted.'));
  await profile.getByRole('button',{name:translated('Close character details')}).click();
  await expect(witness).toBeFocused();
  const other=role==='public'?'garda':'public';
  for(const perspective of [role,other]){
   const view=stage.views[perspective];
   await expect(page.locator('h1')).toHaveText(translated(stage.title));
   await expect.poll(()=>sceneText(page)).toBe(normalized(translated(stage.scene)));
   await expect(page.locator('.witness-role-context')).toHaveText(translated(view.context));
   await expect(page.locator('#choice-title')).toHaveText(translated(view.prompt));
   const answer=page.locator('.choice').first();
   await expect(answer).toContainText(translated(view.choices[0].text));
   await answer.click();
   await expect(page.locator('#feedback-title')).toHaveText(translated(view.choices[0].feedback));
   if(perspective===role)await page.locator('[data-action="paired-switch"]').click();
  }
  expect(current(page).answers).toEqual({public:0,garda:0});
 });
}
