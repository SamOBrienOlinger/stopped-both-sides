import {test,expect} from '@playwright/test';
import {encounters} from '../../encounters/catalog.mjs';
import {startEncounter,stateHash} from '../../encounters/engine.mjs';

const cast={public:'public-8',garda:'garda-9'};
const sceneSelector='.paired-scene-lead>.encounter-scene';

async function expectReadingOrder(page){
 await expect.poll(()=>page.evaluate(()=>{
  const main=document.querySelector('#main');
  const guide=main?.querySelector(':scope>.decision-guide');
  const lead=main?.querySelector(':scope>.paired-scene-lead');
  const context=main?.querySelector(':scope>.decision-context');
  const choices=main?.querySelector(':scope>.paired-game .decision-choices');
  if(!guide||!lead||!context||!choices)return {present:false,order:false,contained:false,oneScene:false,fullWidth:false};
  const rect=node=>node.getBoundingClientRect();
  const a=rect(guide),b=rect(lead),c=rect(context),d=rect(choices),root=rect(main);
  const oneScene=lead.querySelectorAll(':scope>.encounter-scene').length===1&&
    main.querySelectorAll(':scope>.paired-game .encounter-scene').length===0;
  return {
   present:true,
   order:a.bottom<=b.top+1&&b.bottom<=c.top+1&&c.bottom<=d.top+1,
   contained:b.left>=root.left-2&&b.right<=root.right+2,
   oneScene,
   fullWidth:document.documentElement.scrollWidth<=document.documentElement.clientWidth+2
  };
 }),{message:'guide → illustrated encounter → situation → choices, with no horizontal overflow'}).toEqual({
  present:true,order:true,contained:true,oneScene:true,fullWidth:true
 });
}

for(const path of ['./','garda/']){
 const role=path==='garda/'?'garda':'public';
 test(path+' all 14 scenarios show the scene before the situation and choices',async({page})=>{
  test.setTimeout(240000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const id of Object.keys(encounters)){
   await page.setViewportSize({width:320,height:900});
   await page.goto(path+stateHash(startEncounter(id,role,{cast})),{waitUntil:'domcontentloaded'});
   await expect(page.locator(sceneSelector)).toBeVisible();
   await expectReadingOrder(page);
   await page.setViewportSize({width:1366,height:900});
   await expectReadingOrder(page);
  }
  await page.locator('[data-action="paired-switch"]').click();
  await expectReadingOrder(page);
  await page.locator('[data-action="paired-answer"]').first().click();
  await expectReadingOrder(page);
 });
 test(path+' responsive scene order across breakpoints, 200% reading text and RTL',async({page})=>{
  test.setTimeout(180000);
  await page.emulateMedia({reducedMotion:'reduce'});
  const sizes=[[320,900],[375,812],[390,844],[430,932],[568,320],[660,900],[768,1024],[1024,768],[1366,900],[1920,1080],[2560,1440]];
  for(const language of ['en','ar']){
   await page.goto(path+'?lang='+language+stateHash(startEncounter('public-search',role,{cast})),{waitUntil:'domcontentloaded'});
   await expect(page.locator(sceneSelector)).toBeVisible();
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   for(const [width,height] of sizes){
    await page.setViewportSize({width,height});
    await expectReadingOrder(page);
    await expect(page.locator(sceneSelector+' .scene-character-label')).toHaveCount(2);
   }
   const button=page.locator(sceneSelector+' button[data-scene-label-role="public"]');
   await button.click();
   await expect(page.locator('#scene-character-dialog')).toBeVisible();
   await page.keyboard.press('Escape');
   await expect(page.locator('#scene-character-dialog')).toBeHidden();
   await expect(button).toBeFocused();
  }
 });
}
