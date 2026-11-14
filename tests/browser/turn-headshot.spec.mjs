import {test,expect} from '@playwright/test';
import {encounters,roleLabels} from '../../encounters/catalog.mjs';
import {characters} from '../../encounters/characters.mjs';
import {startEncounter,stateHash} from '../../encounters/engine.mjs';

const cast={public:'public-6',garda:'garda-2'}; // Rory is Garda #2
const paths=['./','garda/'];
const avatarSelector='.paired-game .prompt .turn-avatar';

async function expectPortrait(page,role,id){
 const portrait=page.locator(avatarSelector);
 const character=characters[role].find(c=>c.id===id);
 await expect(portrait).toBeVisible();
 await expect(portrait).toHaveAttribute('data-character-id',id);
 await expect(portrait).toHaveAttribute('data-role',role);
 await expect(portrait).toHaveAttribute('role','img');
 await expect(portrait).toHaveAttribute('aria-label',character.name+', your current '+roleLabels[role]+' character');
 const img=portrait.locator('.character-image img');
 await expect(img).toHaveAttribute('src',role==='garda'?/characters\/garda-baseball-2026\.webp/:/characters\/cast\.webp/);
 await expect.poll(()=>img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
}

async function expectFitting(page){
 await expect.poll(()=>page.evaluate(()=>{
  const badge=document.querySelector('.paired-game .prompt .turn-banner');
  const portrait=badge?.querySelector('.turn-avatar');
  if(!badge||!portrait)return false;
  const a=portrait.getBoundingClientRect(),b=badge.getBoundingClientRect();
  const prompt=document.querySelector('.paired-game .prompt');
  const p=prompt.getBoundingClientRect();
  return {
   minAvatarSize:a.width>=40 && a.height>=40,
   avatarWithinBadge:a.left>=b.left-1 && a.right<=b.right+1 && a.top>=b.top-1 && a.bottom<=b.bottom+1,
   badgeWithinPrompt:b.left>=p.left-1 && b.right<=p.right+1,
   badgeNoScroll:badge.scrollWidth<=badge.clientWidth+2,
   pageNoOverflow:document.documentElement.scrollWidth<=document.documentElement.clientWidth+2,
   diagnostics:{
    viewport:document.documentElement.clientWidth,
    scrollWidth:document.documentElement.scrollWidth,
    badge:{x:Math.round(b.left),width:Math.round(b.width),scrollWidth:badge.scrollWidth,clientWidth:badge.clientWidth},
    portrait:{x:Math.round(a.left),width:Math.round(a.width),height:Math.round(a.height)},
    prompt:{x:Math.round(p.left),width:Math.round(p.width)},
    fontSize:getComputedStyle(document.documentElement).fontSize,
    direction:getComputedStyle(badge).direction,
    language:document.documentElement.lang
   }
  };
 })).toMatchObject({
  minAvatarSize:true,avatarWithinBadge:true,badgeWithinPrompt:true,badgeNoScroll:true,pageNoOverflow:true
 });
}

for(const path of paths){
 test(path+' displays the playable character headshot in all 14 encounters from both roles',async({page})=>{
  test.setTimeout(240000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const role of ['public','garda']){
   for(const id of Object.keys(encounters)){
    await page.goto(path+stateHash(startEncounter(id,role,{cast})),{waitUntil:'domcontentloaded'});
    await expect(page.locator('.turn-banner-title')).toHaveText('YOUR TURN');
    await expectPortrait(page,role,cast[role]);
   }
  }
 });

 test(path+' headshot updates with role switching, character selection and answer state',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(path+stateHash(startEncounter('garda-search','garda',{cast})));
  await expectPortrait(page,'garda','garda-2');
  await page.locator('[data-action="paired-switch"]').click();
  await expectPortrait(page,'public','public-6');
  await page.locator('[data-action="paired-characters"]').click();
  await page.locator('[data-character="public-9"]').click();
  await expectPortrait(page,'public','public-9');
  await page.locator('[data-action="paired-character-close"]').click();
  await page.locator('[data-action="paired-answer"]').first().click();
  await expectPortrait(page,'public','public-9');
  await page.locator('[data-action="paired-switch"]').click();
  await expectPortrait(page,'garda','garda-2');
  await page.locator('[data-action="paired-characters"]').click();
  await page.locator('[data-character="garda-5"]').click();
  await expectPortrait(page,'garda','garda-5');
  await page.reload();
  await expectPortrait(page,'garda','garda-5');
 });

 test(path+' headshot fits mobile, desktop, Arabic RTL and enlarged reading settings',async({page})=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  const widths=[[320,568],[375,812],[390,844],[568,320],[768,1024],[1366,900]];
  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang+stateHash(startEncounter('public-search','garda',{cast})),{waitUntil:'domcontentloaded'});
   await expectPortrait(page,'garda','garda-2');
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   for(const [width,height] of widths){
    await page.setViewportSize({width,height});
    await expectFitting(page);
   }
  }
 });
}
