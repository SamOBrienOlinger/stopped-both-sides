import {test,expect} from '@playwright/test';

const pages=[{path:'./',role:'public'},{path:'garda/',role:'garda'}];
const categories=[
 ['street','Street stops','Stopped on the street'],
 ['search','Searches','Asked to open your bag'],
 ['custody','Arrest and custody','Told you are under arrest'],
 ['young','Young people','You are sixteen'],
 ['fairness','Fair treatment','“Why was I singled out?”'],
 ['discrimination','Discrimination','10 protected grounds']
];

for(const {path,role} of pages){
 test(path+' Browse all situations is a keyboard-accessible dropdown with working topic links',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  const disclosure=page.locator('.topic-explorer details.topic-disclosure');
  const trigger=disclosure.locator('summary.topic-disclosure-trigger');
  const links=disclosure.locator('a.topic-card');
  await expect(disclosure).toHaveCount(1);
  await expect(trigger.getByRole('heading',{name:'Browse all situations'})).toBeVisible();
  await expect(disclosure).not.toHaveAttribute('open','');
  await expect(links).toHaveCount(categories.length);
  await expect(links.first()).toBeHidden();
  await trigger.click();
  await expect(disclosure).toHaveAttribute('open','');
  await expect(links.first()).toBeVisible();
  await expect(links.filter({hasText:'→'})).toHaveCount(0);
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
 test(`${role}: the Discrimination topic covers every IHREC ground and opens the housing assistance situation`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  await page.locator('.topic-disclosure>summary').press('Enter');
  await page.getByRole('link',{name:/^Discrimination/}).click();
  await expect(page.getByRole('heading',{name:'Discrimination',exact:true})).toBeVisible();
  await expect(page.locator('.encounter-card h2')).toHaveText([
   'Gender','Civil status','Family status','Sexual orientation','Age','Religious belief',
   'Traveller community','Race','Disability','Housing assistance'
  ]);
  await expect(page.locator('.discrimination-intro a')).toHaveAttribute('href','https://www.ihrec.ie/your-rights/protected-grounds');
  await page.getByRole('button',{name:/^Explore this situation: Housing assistance/}).click();
  await expect(page.locator('#scene-title')).toHaveText('Turned away from a viewing');
  const story=await page.locator('.story-text').textContent();
  await page.locator('[data-action="paired-answer"]').first().click();
  await page.locator('#feedback .source-details>summary').click();
  await expect(page.locator('#feedback .source-details a').first()).toHaveAttribute('href','https://www.ihrec.ie/your-rights/housing-assistance-payment/housing');
  await page.locator('[data-action="paired-switch"]').click();
  await expect(page.locator('.story-text')).toHaveText(story);
  await page.getByRole('link',{name:'Back to situations'}).click();
  await expect(page.getByRole('button',{name:/^Explore this situation: Housing assistance/})).toBeFocused();
  await page.goto(path+'?lang=ar#encounters/'+role+'/discrimination');
  await expect(page.getByRole('heading',{name:'التمييز',exact:true})).toBeVisible();
  await expect(page.locator('.discrimination-intro')).toContainText('سيناريوهات التمييز باللغة الإنجليزية.');
  await page.setViewportSize({width:320,height:800});
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
  await page.locator('[data-action="paired-start"][data-id="discrimination-housing-assistance"]').click();
  await expect(page.locator('#scene-title>span[lang="en-IE"]')).toHaveText('Turned away from a viewing');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)).toBe(true);
 });
 test(path+' opened dropdown fits phone, desktop, 200 percent text and Arabic RTL',async({page},testInfo)=>{
  test.setTimeout(140000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang+'#play');
   const disclosure=page.locator('.topic-explorer details.topic-disclosure');
   const trigger=disclosure.locator('summary');
   await expect(trigger).toBeVisible();
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   await trigger.click();
   await expect(disclosure).toHaveAttribute('open','');
   for(const width of [320,390,768,1366]){
    await page.setViewportSize({width,height:width<700?844:900});
    await expect.poll(()=>disclosure.evaluate((element,topicCount)=>{
     const root=document.documentElement,trigger=element.querySelector('summary');
     const links=[...element.querySelectorAll('a.topic-card')];
     const box=element.getBoundingClientRect();
     const positions=links.map(item=>item.getBoundingClientRect());
     return {
      enlarged:getComputedStyle(root).getPropertyValue('--reading-size').trim()==='200%',
      noOverflow:root.scrollWidth<=root.clientWidth+2,
      fits:box.left>=-2&&box.right<=root.clientWidth+2,
      headingFits:trigger.scrollWidth<=trigger.clientWidth+2,
      allVisible:positions.length===topicCount&&positions.every(p=>p.width>0&&p.height>0),
      ordered:positions.every((p,i)=>!i||positions[i-1].bottom<=p.top+2),
      textFits:links.every(item=>item.scrollWidth<=item.clientWidth+2),
      lastTitleReadable:(()=>{
       const card=links[links.length-1],title=card.querySelector('strong');
       return !!title&&title.getBoundingClientRect().width>=card.getBoundingClientRect().width*.5;
      })()
     };
    },categories.length)).toEqual({enlarged:true,noOverflow:true,fits:true,headingFits:true,allVisible:true,ordered:true,textFits:true,lastTitleReadable:true});
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
