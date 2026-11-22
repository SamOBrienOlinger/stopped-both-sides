import {test,expect} from '@playwright/test';
import {topicGroups} from '../../encounters/presentation.mjs';

for(const [path,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: every topic expands in place with only its own situations`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  const browser=page.locator('.topic-disclosure');
  await browser.locator(':scope>summary').press('Enter');
  const groups=browser.locator('.situation-topic');
  await expect(groups).toHaveCount(6);
  await expect(browser.locator('.encounter-card:visible')).toHaveCount(0);
  for(const topic of topicGroups){
   const group=browser.locator(`[data-situation-topic="${topic.id}"]`);
   const trigger=group.locator(':scope>summary');
   await expect(trigger.locator('strong')).toHaveText(topic.title);
   await trigger.press('Enter');
   await expect(group).toHaveAttribute('open','');
   const cards=group.locator('[data-action="paired-start"]');
   expect(await cards.evaluateAll(elements=>elements.map(element=>element.dataset.id))).toEqual(topic.encounters);
   await expect(browser.locator('.encounter-card:visible')).toHaveCount(topic.id==='discrimination'?0:topic.encounters.length);
   if(topic.id==='discrimination')await expect(group.locator('.discrimination-ground')).toHaveCount(10);
   await trigger.press('Space');
   await expect(group).not.toHaveAttribute('open','');
   await expect(browser.locator('.encounter-card:visible')).toHaveCount(0);
  }
  await browser.getByRole('button',{name:'All topics',exact:true}).click();
  await expect(page).toHaveURL(new RegExp('#encounters/'+role+'/all$'));
  await expect(page.locator('.scenario-library .situation-topic')).toHaveCount(6);
  await expect(page.locator('.scenario-library .situation-topic[open]')).toHaveCount(0);
  await expect(page.locator('.scenario-library .encounter-card')).toHaveCount(34);
  await expect(page.locator('.scenario-library .encounter-card:visible')).toHaveCount(0);
 });

 test(`${role}: catalogue filters, individual expansion and return focus work together`,async({page})=>{
  await page.goto(path+'?lang=en#encounters/'+role+'/all');
  const library=page.locator('.scenario-library');
  await expect(library.locator('.situation-topic[open]')).toHaveCount(0);
  const search=library.locator('[data-situation-topic="search"]');
  await search.locator(':scope>summary').click();
  await expect(search.locator('.encounter-card:visible')).toHaveCount(3);
  await search.locator('[data-id="public-search"]').click();
  await expect(page.locator('#scene-title')).toBeVisible();
  await page.locator('[data-return-to-play]').click();
  await expect(library.locator('[data-id="public-search"]')).toBeFocused();
  await expect(search).toHaveAttribute('open','');
  await library.getByRole('button',{name:'Discrimination',exact:true}).click();
  await expect(library.locator('.situation-topic')).toHaveCount(1);
  await expect(library.locator('[data-situation-topic="discrimination"]')).toHaveAttribute('open','');
  await expect(library.locator('.encounter-card:visible')).toHaveCount(0);
  await expect(library.locator('.discrimination-ground')).toHaveCount(10);
  await expect(library.locator('.situation-kind')).toHaveCount(10);
  await library.getByRole('button',{name:'All topics',exact:true}).click();
  await expect(library.locator('.encounter-card')).toHaveCount(34);
  await expect(library.locator('.encounter-card:visible')).toHaveCount(0);
  await expect(library.locator('.situation-topic[open]')).toHaveCount(0);
  // Clicking All topics again also resets manually opened groups on the same URL.
  await search.locator(':scope>summary').press('Enter');
  await expect(search.locator('.encounter-card:visible')).toHaveCount(3);
  await library.getByRole('button',{name:'All topics',exact:true}).click();
  await expect(library.locator('.situation-topic[open]')).toHaveCount(0);
  await expect(library.locator('.encounter-card:visible')).toHaveCount(0);
  await page.goto(path+'?lang=en#practice/'+role+'/all');
  await library.getByRole('button',{name:'All topics',exact:true}).click();
  await expect(library.locator('[data-action="start"]')).toHaveCount(role==='garda'?8:6);
  await expect(library.locator('[data-action="start"]:visible')).toHaveCount(0);
  await expect(library.locator('.situation-topic[open]')).toHaveCount(0);
  await library.locator('[data-situation-topic="street"]>summary').press('Enter');
  await expect(library.locator('[data-action="start"][data-id="street"]')).toBeVisible();
  await expect(library.locator('[data-situation-topic="discrimination"]')).toHaveCount(1);
  await expect(library.locator('.discrimination-ground')).toHaveCount(10);
  await expect(library.locator('.discrimination-ground [data-action="paired-start"]')).toHaveCount(20);
 });

 test(`${role}: topic disclosures fit small screens and enlarged Arabic text`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang+'#play');
   await page.locator('.topic-disclosure>summary').click();
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   const search=page.locator('[data-situation-topic="search"]');
   await search.locator(':scope>summary').press('Enter');
   for(const width of [320,390,768,1366]){
    await page.setViewportSize({width,height:900});
    await expect.poll(()=>page.evaluate(()=>{
     const root=document.documentElement;
     const headers=[...document.querySelectorAll('.situation-topic-trigger')];
     const cards=[...document.querySelectorAll('[data-situation-topic="search"] .encounter-card')];
     return root.scrollWidth<=root.clientWidth+2&&headers.every(el=>el.scrollWidth<=el.clientWidth+2)&&cards.every(el=>el.scrollWidth<=el.clientWidth+2);
    })).toBe(true);
   }
  }
 });
 test(`${role}: the Discrimination topic covers every IHREC ground and opens the housing assistance situation`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  await page.locator('.topic-disclosure>summary').press('Enter');
  const discrimination=page.locator('.topic-disclosure [data-situation-topic="discrimination"]');
  await discrimination.locator(':scope>summary').press('Enter');
  await discrimination.getByRole('link',{name:'Browse situations',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Discrimination',exact:true})).toBeVisible();
  await expect(page.locator('.encounter-card')).toHaveCount(20);
  await expect(page.locator('.encounter-card .situation-kind')).toHaveCount(10);
  await expect(page.locator('[data-id="discrimination-gender"]')).toHaveCount(1);
  await expect(page.locator('[data-id="discrimination-colleague-gender"]')).toHaveCount(1);
  await expect(page.locator('.discrimination-intro a')).toHaveAttribute('href','https://www.ihrec.ie/your-rights/protected-grounds');
  await page.locator('[data-ground="housing-assistance"]>summary').press('Enter');
  await page.locator('[data-action="paired-start"][data-id="discrimination-housing-assistance"]').click();
  await expect(page.locator('#scene-title')).toHaveText('Turned away from a viewing');
  const story=await page.locator('.story-text').textContent();
  await page.locator('[data-action="paired-answer"]').first().click();
  await page.locator('#feedback .source-details>summary').click();
  await expect(page.locator('#feedback .source-details a').first()).toHaveAttribute('href','https://www.ihrec.ie/your-rights/housing-assistance-payment/housing');
  await page.locator('[data-action="paired-switch"]').click();
  await expect(page.locator('.story-text')).toHaveText(story);
  await page.getByRole('link',{name:'Back to situations'}).click();
  await expect(page.locator('[data-action="paired-start"][data-id="discrimination-housing-assistance"]')).toBeFocused();
  await page.goto(path+'?lang=ar#encounters/'+role+'/discrimination');
  await expect(page.getByRole('heading',{name:'التمييز',exact:true})).toBeVisible();
  await expect(page.locator('.discrimination-intro')).toContainText('سيناريوهات التمييز باللغة الإنجليزية.');
  await page.setViewportSize({width:320,height:800});
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
  await page.locator('[data-ground="housing-assistance"]>summary').press('Enter');
  await page.locator('[data-action="paired-start"][data-id="discrimination-housing-assistance"]').click();
  await expect(page.locator('#scene-title>span[lang="en-IE"]')).toHaveText('Turned away from a viewing');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)).toBe(true);
 });

}
