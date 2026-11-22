import {expect,test} from '@playwright/test';
import {decodeState,startEncounter,stateHash} from '../../encounters/engine.mjs?v=colleague-witness-20261122';

const sharedState=page=>decodeState(new URL(page.url()).hash.slice(11));
const currentTopic=page=>page.locator('.topic-filter[aria-pressed="true"]');

for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role} can start on Home and reach a decision before the illustration`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(entry+'?lang=en');
  const start=page.locator('.home-play [data-action="paired-quick-start"]');
  await expect(start).toBeInViewport();
  await start.press('Enter');
  await expect(page.locator('#scene-title')).toBeFocused();
  expect(sharedState(page).id).toBe(role+'-street');
  await expect(page.locator('.flow-role-bar')).toContainText(role==='garda'?'Exploring the Garda perspective':'Exploring the public perspective');
  const first=page.locator('[data-action="paired-answer"]').first();
  await expect(first).toBeInViewport();
  const illustration=page.locator('.scene-explorer');
  const question=await page.locator('#choice-title').boundingBox();
  const panel=await illustration.boundingBox();
  expect(question.y+question.height).toBeLessThan(panel.y);
  await illustration.locator('summary').press('Enter');
  await expect(illustration.locator('.encounter-scene')).toBeHidden();
  await illustration.locator('summary').press('Space');
  await expect(illustration.locator('.encounter-scene')).toBeVisible();
 });

 test(`${role} keeps the topic and saved role when browsing, comparing and returning`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(entry+'?lang=en#encounters/public/search');
  await expect(currentTopic(page)).toHaveText('Searches');
  await page.locator('.setup-role summary').press('Enter');
  await page.locator('.role-picker a[data-role-tone="garda"]').click();
  await expect(page).toHaveURL(/#encounters\/garda\/search$/);
  await expect(currentTopic(page)).toHaveText('Searches');
  await page.locator('[data-action="paired-start"][data-id="public-search"]').click();
  expect(sharedState(page).role).toBe('garda');
  await page.locator('[data-action="paired-answer"]').first().press('Enter');
  await expect(page.locator('#feedback')).toBeFocused();
  await expect(page.locator('[data-action="paired-next"]')).toHaveText('Next decision');
  const answered=sharedState(page);
  await page.getByRole('button',{name:'Compare the other side',exact:true}).click();
  await expect(page.locator('#choice-title')).toBeFocused();
  await expect(page.locator('.flow-role-bar')).toContainText('Exploring the public perspective');
  expect(sharedState(page)).toEqual({...answered,role:'public'});
  await page.locator('[data-return-to-play]').click();
  await expect(page).toHaveURL(/#encounters\/garda\/search$/);
  await expect(currentTopic(page)).toHaveText('Searches');
  await expect(page.locator('.scenario-library [data-action="paired-start"][data-id="public-search"]')).toBeFocused();
 });

 test(`${role} can open desktop practice from Discrimination`,async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  const discrimination=entry+'?lang=en#encounters/'+role+'/discrimination';
  await page.goto(discrimination);
  await expect(currentTopic(page)).toHaveText('Discrimination');
  await expect(page.locator('.scenario-library .encounter-card')).toHaveCount(20);

  const modes=page.getByRole('navigation',{name:'Ways to explore'});
  const practice=modes.getByRole('link',{name:/^Practise one role/});
  const firstPractice=page.locator('.scenario-library [data-action="start"][data-id="street"]');
  await practice.click();
  expect(new URL(page.url()).hash).toBe('#practice/'+role+'/all');
  await expect(practice).toHaveAttribute('aria-current','page');
  await expect(currentTopic(page)).toHaveText('All topics');
  await expect(page.locator('.topic-filter[data-topic="discrimination"]')).toHaveCount(0);
  await page.locator('.scenario-library [data-situation-topic="street"]>summary').click();
  await expect(firstPractice).toBeVisible();

  await page.goBack();
  await expect(currentTopic(page)).toHaveText('Discrimination');
  await page.goto(entry+'?lang=en#practice/'+role+'/discrimination');
  await expect(currentTopic(page)).toHaveText('All topics');
  await page.locator('.scenario-library [data-situation-topic="street"]>summary').click();
  await firstPractice.click();
  await expect(page.locator('#choice-title')).toBeVisible();
 });
}

test('a practice recap and an unfinished shared situation stay independently accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('./?lang=en'+stateHash(startEncounter('public-arrest','garda')));
 await page.locator('[data-action="paired-answer"]').first().click();
 const interrupted=new URL(page.url()).hash;
 await page.goto('./?lang=en#practice/public/street');
 await expect(currentTopic(page)).toHaveText('Street stops');
 await expect(page.locator('.play-modes a[aria-current="page"]')).toContainText('Practise one role');
 await page.locator('[data-action="start"][data-id="street"]').click();
 await expect(page.getByRole('button',{name:'Open the two-role version',exact:true})).toBeVisible();
 await page.locator('.choice').nth(1).click();
 await page.reload();
 await expect(page.locator('.choice[aria-pressed="true"]')).toBeVisible();
 await page.getByRole('button',{name:'Try another answer',exact:true}).click();
 await expect(page.locator('#choice-title')).toBeFocused();
 await expect(page.locator('.choice[aria-pressed="true"]')).toHaveCount(0);
 for(let i=0;i<8&&(await page.locator('.choice').count());i++){
  await page.locator('.choice').first().click();
  const next=page.locator('[data-action="next"]');
  await expect(next).toHaveText(/^(Next decision|View recap)$/);
  await next.click();
 }
 const another=page.getByRole('link',{name:'Choose another situation',exact:true});
 await expect(another).toBeInViewport();
 await another.click();
 await expect(page).toHaveURL(/#practice\/public\/street$/);
 await expect(currentTopic(page)).toHaveText('Street stops');
 await expect(page.getByRole('link',{name:'Resume your situation',exact:true})).toHaveCount(0);
 await expect(page.getByRole('link',{name:'Open recap',exact:true})).toBeVisible();
 await page.goto('./?lang=en#progress');
 await expect(page.getByRole('link',{name:'Resume your situation',exact:true})).toHaveAttribute('href',interrupted);
 await page.getByRole('link',{name:'Open recap',exact:true}).click();
 await page.reload();
 await expect(another).toBeVisible();
 await page.goto('./?lang=en#play');
 await expect(page.locator('.home-play .session-return')).toBeInViewport();
 await page.locator('.home-play').getByRole('link',{name:'Resume your situation',exact:true}).click();
 await expect(page.locator('#feedback')).toBeVisible();
 expect(new URL(page.url()).hash).toBe(interrupted);
});

test('the practice starting-role link carries the topic and language to the other entrypoint',async({page})=>{
 await page.goto('./?lang=fr#practice/public/search');
 await page.locator('.setup-role summary').click();
 await page.locator('.role-picker a[data-role-tone="garda"]').click();
 await expect(page).toHaveURL(/\/garda\/\?lang=fr#practice\/garda\/search$/);
 await expect(page.locator('html')).toHaveAttribute('lang','fr');
 await expect(currentTopic(page)).toHaveText('Fouilles');
 await expect(page.locator('[data-action="start"][data-id="search"]')).toBeVisible();
});
