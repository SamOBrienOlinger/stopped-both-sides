import {test,expect} from '@playwright/test';

const pages=[{path:'./',role:'public'},{path:'garda/',role:'garda'}];
const categories=[
 ['street','Street stops','Stopped on the street'],
 ['search','Searches','Asked to open your bag'],
 ['custody','Arrest and custody','Told you are under arrest'],
 ['young','Young people','You are sixteen'],
 ['fairness','Fair treatment','“Why was I singled out?”']
];

for(const {path,role} of pages){
 test(path+' Browse all situations is a keyboard-accessible dropdown with five working links',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  const disclosure=page.locator('.topic-explorer details.topic-disclosure');
  const trigger=disclosure.locator('summary.topic-disclosure-trigger');
  const links=disclosure.locator('a.topic-card');
  await expect(disclosure).toHaveCount(1);
  await expect(trigger.getByRole('heading',{name:'Browse all situations'})).toBeVisible();
  await expect(disclosure).not.toHaveAttribute('open','');
  await expect(links).toHaveCount(5);
  await expect(links.first()).toBeHidden();
  await trigger.click();
  await expect(disclosure).toHaveAttribute('open','');
  await expect(links.first()).toBeVisible();
  await expect(links.locator('strong')).toHaveText(categories.map(x=>x[1]));
  await expect(links.locator('.topic-preview')).toHaveText(categories.map(x=>x[2]));
  for(const [id,title,example] of categories){
   const link=links.filter({has:page.locator('strong').filter({hasText:title})});
   await expect(link).toHaveAttribute('href','#encounters/'+role+'/'+id);
   await expect(link).toContainText(example);
  }
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(disclosure).not.toHaveAttribute('open','');
  await expect(links.first()).toBeHidden();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open','');
  await disclosure.locator('a.topic-card[href="#encounters/'+role+'/search"]').click();
  await expect(page).toHaveURL(new RegExp('#encounters/'+role+'/search$'));
  await expect(page.locator('.simple-setup.topic-selected')).toBeVisible();
  await expect(page.locator('.scenario-library')).toHaveAttribute('open','');
  await expect(page.locator('.scenario-library [data-action="paired-start"]')).toHaveCount(3);
 });
 test(path+' opened dropdown fits phone, desktop, 200 percent text and Arabic RTL',async({page},testInfo)=>{
  test.setTimeout(140000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang+'#play');
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   const disclosure=page.locator('.topic-explorer details.topic-disclosure');
   await disclosure.locator('summary').click();
   await expect(disclosure).toHaveAttribute('open','');
   for(const width of [320,390,768,1366]){
    await page.setViewportSize({width,height:width<700?844:900});
    await expect.poll(()=>disclosure.evaluate(element=>{
     const root=document.documentElement,trigger=element.querySelector('summary');
     const links=[...element.querySelectorAll('a.topic-card')];
     const box=element.getBoundingClientRect();
     const positions=links.map(item=>item.getBoundingClientRect());
     return {
      noOverflow:root.scrollWidth<=root.clientWidth+2,
      fits:box.left>=-2&&box.right<=root.clientWidth+2,
      headingFits:trigger.scrollWidth<=trigger.clientWidth+2,
      allVisible:positions.length===5&&positions.every(p=>p.width>0&&p.height>0),
      ordered:positions.every((p,i)=>!i||positions[i-1].bottom<=p.top+2),
      textFits:links.every(item=>item.scrollWidth<=item.clientWidth+2)
     };
    })).toEqual({noOverflow:true,fits:true,headingFits:true,allVisible:true,ordered:true,textFits:true});
   }
  }
  await page.goto(path+'?lang=en#play');
  await page.emulateMedia({reducedMotion:'reduce'});
  const dropdown=page.locator('.topic-explorer details.topic-disclosure');
  await dropdown.locator('summary').click();
  for(const width of [390,1366]){
   await page.setViewportSize({width,height:900});
   await dropdown.screenshot({path:testInfo.outputPath(role+'-topic-dropdown-'+width+'.png'),animations:'disabled'});
  }
 });
}
