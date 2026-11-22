import {test,expect} from '@playwright/test';
import {startEncounter,answer,stateHash,decodeState} from '../../encounters/engine.mjs';
import {expectControlsFit} from './control-layout.mjs';
import {openNavigation,openCharacterPicker} from './navigation.mjs';

const widths=[280,320,390,568,768,1024,1152,1366,1920,2560,3440];
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const enlarge=page=>page.evaluate(()=>{document.documentElement.style.setProperty('--reading-size','200%');document.documentElement.classList.add('reading-spacious');});
async function fits(page,label){
 await expect.poll(()=>page.evaluate(()=>({
  noOverflow:document.documentElement.scrollWidth<=document.documentElement.clientWidth+2,
  clipped:[...document.querySelectorAll('#main h1,#main h2,#main h3,#main p,#main summary,#main .scenario,.footer-identity,.footer-note')]
   .filter(element=>element.getClientRects().length&&element.scrollWidth>element.clientWidth+2)
   .map(element=>({element:element.tagName+'.'+element.className,text:element.textContent.trim().slice(0,50)}))
 })),{message:label}).toEqual({noOverflow:true,clipped:[]});
}

for(const [entry,role,reference] of [['./','public','#rights'],['garda/','garda','#evidence']]){
 test(`${role}: topic lists reflow down to 280px with enlarged right-to-left text`,async({page})=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['#play',`#encounters/${role}/all`,`#practice/${role}/all`]){
   await page.goto(entry+'?lang=ar'+route,{waitUntil:'domcontentloaded'});
   await expect(page.locator('html')).toHaveAttribute('dir','rtl');
   await enlarge(page);
   await page.evaluate(()=>document.querySelectorAll('#main details').forEach(details=>details.open=true));
   for(const width of widths){
    await page.setViewportSize({width,height:width===568?320:900});
    await fits(page,`${role} ${route} at ${width}px`);
    if(width===280||width===1366)await expectControlsFit(page,`${role} expanded topics at ${width}px`);
   }
  }
 });

 test(`${role}: live resizing preserves answers and keeps focused controls below the header`,async({page})=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  const saved=answer(startEncounter('public-search',role),0);
  for(const language of ['en','ar']){
   await page.goto(entry+'?lang='+language+stateHash(saved),{waitUntil:'domcontentloaded'});
   await expect(page.locator('#feedback')).toBeVisible();
   await expect(page.locator('html')).toHaveAttribute('lang',language==='en'?'en-IE':'ar');
   if(language==='ar')await enlarge(page);
   for(const width of widths){
    await page.setViewportSize({width,height:width===568?320:900});
    await expect.poll(()=>page.locator('.header').evaluate(header=>Math.abs(header.getBoundingClientRect().height-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navigation-height'))))).toBeLessThanOrEqual(1);
    await page.locator('[data-action="paired-switch"]').evaluate(button=>{button.focus();button.scrollIntoView({block:'start',behavior:'instant'});});
    await expect.poll(()=>page.locator('[data-action="paired-switch"]').evaluate(button=>button.getBoundingClientRect().top-document.querySelector('.header').getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(0);
    expect(current(page)).toEqual(saved);
    await fits(page,`${role} answered ${language} game at ${width}px`);
   }
   await page.setViewportSize({width:390,height:844});
   await expect(page.locator('#main-navigation')).toBeHidden();
   await openNavigation(page);
   await expect(page.locator('#main')).toHaveAttribute('inert','');
   await page.setViewportSize({width:1366,height:900});
   await expect(page.locator('#main')).not.toHaveAttribute('inert');
   expect(current(page)).toEqual(saved);
  }
 });

 test(`${role}: information pages and reading dialog adapt to narrow and ultrawide screens`,async({page})=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['#about',reference,'#accessibility','#progress',`#discussion/${role}/garda-supervision`]){
   for(const language of ['en','ar']){
    await page.goto(entry+'?lang='+language+route,{waitUntil:'domcontentloaded'});
    await expect(page.locator('#main h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang',language==='en'?'en-IE':'ar');
    await page.evaluate(()=>document.fonts.ready);
    if(language==='ar')await enlarge(page);
    await page.evaluate(()=>document.querySelectorAll('#main details').forEach(details=>details.open=true));
    for(const width of [280,320,768,3440]){
     await page.setViewportSize({width,height:900});
     await fits(page,`${role} ${route} ${language} at ${width}px`);
    }
   }
  }
  await page.setViewportSize({width:568,height:320});
  await expect(page.locator('#main-navigation')).toBeHidden();
  await openNavigation(page);await page.locator('#language-settings-trigger').click();
  await expect(page.locator('#reading-dialog')).toBeVisible();
  const bounds=await page.locator('#reading-dialog').boundingBox();
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y+bounds.height).toBeLessThanOrEqual(321);
  await expectControlsFit(page,`${role} landscape reading dialog`);
  await page.keyboard.press('Escape');
  // Profiles and the character chooser need the same room for enlarged text.
  await page.goto(entry+'?lang=ar'+stateHash(startEncounter('public-search',role)),{waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await enlarge(page);
  const state=current(page),profile=page.locator('#scene-character-dialog');
  for(const [width,height] of [[280,900],[568,320],[1366,900]]){
   await page.setViewportSize({width,height});
   await page.locator(`button[data-scene-label-role="${role}"]`).first().click();
   await expect(profile).toBeVisible();
   expect(await profile.locator('h2,p,button').evaluateAll(elements=>elements.filter(element=>element.scrollWidth>element.clientWidth+2).map(element=>element.textContent))).toEqual([]);
   const bounds=await profile.boundingBox();
   expect(bounds.x).toBeGreaterThanOrEqual(0);
   expect(bounds.x+bounds.width).toBeLessThanOrEqual(width+1);
   expect(bounds.y+bounds.height).toBeLessThanOrEqual(height+1);
   await expectControlsFit(page,`${role} character details at ${width}px`);
   await page.keyboard.press('Escape');
   await expect(profile).toBeHidden();
   expect(current(page)).toEqual(state);
  }
  await page.setViewportSize({width:280,height:900});
  await openCharacterPicker(page,role);
  await enlarge(page);
  await fits(page,`${role} enlarged character choices at 280px`);
  await expectControlsFit(page,`${role} enlarged character choices at 280px`);
 });
}

test('standalone privacy and button-reference pages use a fluid viewport',async({page})=>{
 for(const file of ['privacy.html','docs/button-reference.html']){
  await page.goto(file,{waitUntil:'domcontentloaded'});
  await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
  for(const size of ['100%','200%'])for(const width of widths){
   await page.setViewportSize({width,height:width===568?320:900});
   await page.evaluate(size=>document.documentElement.style.fontSize=size,size);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`${file} ${size} at ${width}px`).toBeLessThanOrEqual(2);
  }
 }
});
