import {test,expect} from '@playwright/test';

const paths=['./','garda/'];
const unwanted=[
 'No sign-up. No timer. You can try again.',
 'Take your time. You can revisit any choice. Your score reflects learning in the resource; your human and civil rights never depend on it.',
 'Choose any situation. Each one can be explored from both perspectives.'
];
const headings=['Choose a perspective','Understand the situation you are in','Choose a response','Learn why it matters'];
const details=[
 'Start as a member of the public or a Garda.',
 'Interact with a member of the public and/or with a Garda.',
 'Try what you would say or do.',
 'Get an explanation, then try the other side.'
];

for(const path of paths){
 test(path+' practice matches the landing dropdowns and opens its single-role situations',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  const dropdown=page.locator('details.single-mode');
  const toggle=dropdown.locator('summary');
  const content=dropdown.locator('.practice-content');
  const browse=content.getByRole('link',{name:'Browse situations',exact:true});
  await expect(toggle.getByRole('heading',{name:'Practise one role at a time'})).toBeVisible();
  await expect(content.locator(':scope > p')).toHaveText('Make choices in one role and review what you learned.');
  await expect(dropdown).not.toHaveAttribute('open','');
  await expect(content).toBeHidden();
  for(const width of [390,1366]){
   await page.setViewportSize({width,height:900});
   await expect.poll(()=>page.locator('summary.landing-disclosure-trigger').evaluateAll(triggers=>{
    if(triggers.length!==4)return false;
    const first=triggers[0].getBoundingClientRect();
    return triggers.every(trigger=>{
     const bounds=trigger.getBoundingClientRect();
     return Math.abs(bounds.left-first.left)<=1&&Math.abs(bounds.right-first.right)<=1;
    });
   })).toBe(true);
  }
  await toggle.press('Enter');
  await expect(dropdown).toHaveAttribute('open','');
  await expect(browse).toBeVisible();
  await toggle.press('Space');
  await expect(content).toBeHidden();
  await toggle.click();
  await browse.click();
  await expect(page.locator('.play-modes a[aria-current="page"]')).toContainText('Practise one role');
  const scenarios=page.locator('.scenario-library [data-action="start"]');
  await expect(scenarios).toHaveCount(path==='garda/'?8:6);
  await page.locator('.scenario-library .situation-topic>summary').first().click();
  await scenarios.first().click();
  await expect(page).toHaveURL(/#scenario\//);
  await expect(page.locator('#scene-title')).toBeVisible();
 });

 test(path+' landing removes redundant text while retaining the four learning steps',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('.perspective-card-link[data-role-tone="public"]')).toHaveText('Explore the public perspective');
  await expect(page.locator('.perspective-card-link[data-role-tone="garda"]')).toHaveText('Explore the Garda perspective');
  for(const sentence of unwanted)await expect(page.locator('#main')).not.toContainText(sentence);
  const guide=page.locator('.how-to-play');
  const dropdown=guide.locator('details.how-to-disclosure');
  const toggle=dropdown.locator('summary.how-to-disclosure-trigger');
  await expect(toggle.getByRole('heading',{name:'How it works'})).toBeVisible();
  await expect(dropdown).toHaveAttribute('open','');
  await expect(guide.locator('ol.learning-steps')).toHaveAttribute('role','list');
  const cards=guide.locator('li.learning-card');
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCount(4);
  await expect(cards.locator('.step-number')).toHaveText(['1','2','3','4']);
  await expect(cards.locator('h3 > span:last-child')).toHaveText(headings);
  await expect(cards.locator('.learning-step-copy')).toHaveText(details);
  await expect(cards.locator('.learning-step-visual')).toHaveCount(4);
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(dropdown).not.toHaveAttribute('open','');
  await expect(cards.first()).toBeHidden();
  await page.keyboard.press('Enter');
  await expect(dropdown).toHaveAttribute('open','');
  await expect(cards.first()).toBeVisible();
  await page.goto(path+'?lang=en#encounters/public');
  await expect(page.locator('.scenario-library')).toBeVisible();
  await expect(page.locator('.scenario-library')).not.toContainText(unwanted[2]);
 });

 test(path+' step cards remain readable across phone, desktop, 200 percent text and RTL',async({page},info)=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang+'#play');
   const guide=page.locator('.how-to-play');
   const dropdown=guide.locator('details.how-to-disclosure');
   await expect(guide.locator('li.learning-card')).toHaveCount(4);
   await expect(dropdown).toHaveAttribute('open','');
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   for(const width of [320,390,768,1366]){
    await page.setViewportSize({width,height:width<700?844:900});
    await expect.poll(()=>guide.evaluate(section=>{
     const rect=section.getBoundingClientRect(),root=document.documentElement;
     const cards=[...section.querySelectorAll('li.learning-card')];
     return {
      noPageOverflow:root.scrollWidth<=root.clientWidth+2,
      sectionFits:rect.left>=-2&&rect.right<=root.clientWidth+2,
      stepsVisible:cards.length===4&&cards.every(card=>card.getBoundingClientRect().height>0),
      cardsFit:cards.every(card=>{
       const bounds=card.getBoundingClientRect();
       return bounds.left>=rect.left-2&&bounds.right<=rect.right+2&&card.scrollWidth<=card.clientWidth+2;
      }),
      copyFits:cards.every(card=>{
       const copy=card.querySelector('.learning-step-copy');
       return copy&&copy.scrollWidth<=copy.clientWidth+2;
      }),
      badgesClear:cards.every(card=>{
       const number=card.querySelector('.step-number')?.getBoundingClientRect();
       const icon=card.querySelector('.learning-step-visual')?.getBoundingClientRect();
       if(!number||!icon)return false;
       const horizontal=Math.min(number.right,icon.right)-Math.max(number.left,icon.left);
       const vertical=Math.min(number.bottom,icon.bottom)-Math.max(number.top,icon.top);
       return horizontal<=0||vertical<=0;
      })
     };
    })).toEqual({noPageOverflow:true,sectionFits:true,stepsVisible:true,cardsFit:true,copyFits:true,badgesClear:true});
   }
  }
  await page.goto(path+'?lang=en#play');
  await page.emulateMedia({reducedMotion:'reduce'});
  const role=path==='garda/'?'garda':'public';
  const dropdown=page.locator('.how-to-play details.how-to-disclosure');
  await dropdown.locator('summary').click();
  for(const width of [390,1366]){
   await page.setViewportSize({width,height:900});
   await expect(dropdown).not.toHaveAttribute('open','');
   await dropdown.locator('summary').screenshot({
    path:info.outputPath(role+'-how-it-works-closed-'+width+'.png'),
    animations:'disabled'
   });
   await dropdown.locator('summary').click();
   await expect(dropdown).toHaveAttribute('open','');
   await page.locator('.how-to-play').screenshot({
    path:info.outputPath(role+'-how-it-works-'+width+'.png'),
    animations:'disabled'
   });
   await dropdown.locator('summary').click();
   await expect(dropdown).not.toHaveAttribute('open','');
  }
 });
}
