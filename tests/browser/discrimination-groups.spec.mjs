import {test,expect} from '@playwright/test';

const grounds=['gender','civil-status','family-status','sexual-orientation','age','religious-belief','traveller-community','race','disability','housing-assistance'];
const pages=[
 ['public landing','./?lang=en#play','public'],
 ['public catalogue','./?lang=en#encounters/public','public'],
 ['Garda catalogue on the public entrypoint','./?lang=en#encounters/garda/all','garda'],
 ['Garda landing','garda/?lang=en#play','garda'],
 ['Garda catalogue','garda/?lang=en#encounters/garda/discrimination','garda']
];

for(const [name,url,role] of pages)test(`${name}: the ten grounds expand to the correct situations and preserve return focus`,async({page})=>{
 test.setTimeout(100000);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(url);
 const outer=page.locator(url.includes('#play')?'.topic-disclosure':'.scenario-library');
 if(await outer.getAttribute('open')===null)await outer.locator(':scope>summary').press('Enter');
 const topic=outer.locator('[data-situation-topic="discrimination"]');
 if(await topic.getAttribute('open')===null)await topic.locator(':scope>summary').press('Enter');
 await expect(topic.locator('.discrimination-ground')).toHaveCount(10);
 await expect(topic.locator('.discrimination-ground[open]')).toHaveCount(0);
 await expect(topic.locator('.encounter-card:visible')).toHaveCount(0);
 for(const ground of grounds){
  const group=topic.locator(`[data-ground="${ground}"]`);
  await group.locator(':scope>summary').press('Enter');
  await expect(group).toHaveAttribute('open','');
  const cards=group.locator('[data-action="paired-start"]');
  expect(await cards.evaluateAll(items=>items.map(item=>item.dataset.id))).toEqual(['discrimination-'+ground,'discrimination-colleague-'+ground]);
  await expect(cards.first()).toHaveAttribute('data-role',role);
  await expect(topic.locator('.encounter-card:visible')).toHaveCount(2);
  await group.locator(':scope>summary').press('Space');
  await expect(topic.locator('.encounter-card:visible')).toHaveCount(0);
 }
 await topic.locator('[data-ground="gender"]>summary').press('Enter');
 await topic.locator('[data-id="discrimination-colleague-gender"]').click();
 await expect(page.locator('.witness-role-context')).toBeVisible();
 await expect(page.locator('.flow-role-bar')).toContainText(role==='garda'?'Exploring the Garda perspective':'Exploring the public perspective');
 await page.locator('[data-return-to-play]').click();
 await expect(page.locator('[data-id="discrimination-colleague-gender"]')).toBeFocused();
 await expect(page.locator('[data-ground="gender"]')).toHaveAttribute('open','');
 await expect(page.locator('.discrimination-ground[open]')).toHaveCount(1);
 await page.getByRole('button',{name:'All topics',exact:true}).click();
 await expect(page.locator('.situation-topic[open]')).toHaveCount(0);
 await expect(page.locator('.discrimination-ground[open]')).toHaveCount(0);
 await expect(page.locator('.encounter-card:visible')).toHaveCount(0);
});

test('Expanded ground buttons and situations fit mobile, desktop and enlarged Arabic text',async({page})=>{
 test.setTimeout(100000);
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const language of ['en','ar'])for(const route of ['#play','#encounters/garda/discrimination']){
  await page.goto('./?lang='+language+route);
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
  if(route==='#play'){
   await page.locator('.topic-disclosure>summary').press('Enter');
   await page.locator('[data-situation-topic="discrimination"]>summary').press('Enter');
  }
  const group=page.locator('[data-ground="gender"]');
  await group.locator(':scope>summary').press('Enter');
  await expect(group.locator('.encounter-card:visible')).toHaveCount(2);
  for(const width of [320,390,768,1366]){
   await page.setViewportSize({width,height:900});
   await expect.poll(()=>page.evaluate(()=>{
    const root=document.documentElement;
    const items=[...document.querySelectorAll('.discrimination-ground-trigger,[data-ground="gender"] .encounter-card')];
    return root.scrollWidth<=root.clientWidth+2&&items.every(item=>item.scrollWidth<=item.clientWidth+2);
   })).toBe(true);
  }
  if(language==='ar'){
   await expect(page.locator('html')).toHaveAttribute('dir','rtl');
   await expect(group.locator(':scope>summary>strong')).not.toHaveText('Gender');
  }
 }
});
