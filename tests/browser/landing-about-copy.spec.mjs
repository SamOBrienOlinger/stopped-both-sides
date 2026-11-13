import {test,expect} from '@playwright/test';
const hero="Explore your rights and police powers through everyday encounters involving questioning, searches, arrest, young people and racism.";
const overview=["Stopped: Both Sides explores rights and police powers through everyday encounters involving questioning, searches, arrest, young people and racism.","It helps the public understand their rights and access support, while encouraging Gardaí to reflect on evidence, bias and respectful communication.","Exploring both perspectives invites learners to question assumptions, while recognising Gardaí’s particular responsibility to exercise their powers fairly."];
for(const path of ['./','garda/']){
 test(path+' home shows the revised invitation and both Browse labels',async({page})=>{
  await page.goto(path);
  await expect(page.locator('.landing-deck')).toHaveText(hero);
  await expect(page.locator('#paired-title')).toHaveText('Which side will you try first?');
  await expect(page.locator('.perspective-hero')).toHaveCount(2);
  await expect(page.locator('.about-opening')).toHaveCount(0);
  await expect(page.locator('.topic-explorer h2')).toHaveText('Browse all situations');
  await page.goto(path+'#encounters');
  await expect(page.locator('.scenario-library summary')).toHaveText('Browse all situations');
  await expect(page.locator('.scenario-library')).toHaveCount(1);
 });
 test(path+' About begins with the complete relocated project overview',async({page})=>{
  await page.goto(path+'#about');
  const opening=page.locator('.content-page>.about-opening');
  await expect(opening).toBeVisible();
  await expect(page.locator('.content-page>:first-child')).toHaveClass(/about-opening/);
  await expect(opening.locator('h1#game-title')).toHaveText('Stopped: Both Sides');
  await expect(opening.getByText('An interactive learning game for the public and Gardaí.',{exact:true})).toHaveCount(1);
  await expect(opening.locator('.about-overview p')).toHaveText(overview);
  await expect(page.locator('.content-page>.about-opening>.about-heading-block>.about-tagline')).toBeVisible();
  await expect(page.locator('.learning-section')).toBeVisible();
 });
 test(path+' home and About copy remain responsive in RTL and enlarged text',async({page})=>{
  test.setTimeout(140000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ga','ar']){
   await page.goto(path+'?lang='+lang);
   await expect(page.locator('.perspective-hero')).toHaveCount(2);
   if(lang!=='en')await expect(page.locator('.landing-deck')).not.toHaveText(hero);
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   for(const [width,height] of [[320,568],[375,812],[390,844],[568,320],[768,1024],[1366,900]]){
    await page.setViewportSize({width,height});
    await expect.poll(()=>page.evaluate(()=>{
     const root=document.documentElement,el=document.querySelector('.landing-deck');
     if(!el)return false;
     const box=el.getBoundingClientRect();
     return root.scrollWidth<=root.clientWidth+2&&box.left>=-1&&box.right<=innerWidth+1&&el.scrollWidth<=el.clientWidth+2;
    })).toBe(true);
   }
   await page.goto(path+'?lang='+lang+'#about');
   await expect(page.locator('.about-opening .about-overview p')).toHaveCount(3);
   await page.setViewportSize({width:320,height:800});
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)).toBe(true);
  }
 });
}
