import {test,expect} from '@playwright/test';
import {openNavigation} from './navigation.mjs';
import {decodeState} from '../../encounters/engine.mjs?v=nia-public-20261123';

for(const [path,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: keyword search opens from the requested navbar position, handles no results and preserves an answered game`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#practice/'+role+'/all');
  const group=page.locator('[data-situation-topic="discrimination"]');
  await expect(group).toBeVisible();
  await expect(group).not.toHaveAttribute('open','');
  await group.locator(':scope>summary').click();
  await expect(group.locator('.discrimination-ground')).toHaveCount(10);
  const ground=group.locator('[data-ground="race"]');
  await ground.locator(':scope>summary').click();
  await ground.locator('[data-id="discrimination-colleague-race"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  expect(decodeState(new URL(page.url()).hash.slice(11)).role).toBe(role);
  await expect(page.locator('[data-return-to-play]').first()).toHaveAttribute('href','#practice/'+role+'/all');
  await page.locator('[data-action="paired-answer"]').first().click();
  const token=new URL(page.url()).hash;
  const storage=await page.evaluate(()=>JSON.stringify(localStorage));
  await openNavigation(page);
  expect(await page.locator('#site-search-trigger').evaluate(button=>({before:button.previousElementSibling.dataset.nav,after:button.nextElementSibling.id}))).toEqual({before:'about',after:'language-settings-trigger'});
  await page.locator('#site-search-trigger').click();
  await expect(page.locator('#site-search-input')).toBeFocused();
  await expect(page.locator('[data-nav-toggle]')).toHaveAttribute('aria-expanded','false');
  await page.locator('#site-search-input').fill('no_result_791882');
  await expect(page.locator('#site-search-status')).toHaveText('No results. Try another keyword.');
  await page.locator('#site-search-input').fill('Traveller');
  await expect(page.locator('.site-search-result')).not.toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-search-dialog')).not.toBeVisible();
  await expect(page.locator('[data-nav-toggle]')).toBeFocused();
  expect(new URL(page.url()).hash).toBe(token);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);
  await openNavigation(page);await page.locator('#site-search-trigger').click();
  await page.locator('#site-search-input').fill('AONTAS');
  await page.locator('.site-search-result[href="#about"]').click();
  await expect(page.locator('.input-disclosure')).toBeVisible();
  await expect(page.locator('#site-search-dialog')).not.toBeVisible();
  await openNavigation(page);await page.locator('#site-search-trigger').click();
  await page.locator('#site-search-input').fill('colleague race');
  await page.locator('[data-search-situation="discrimination-colleague-race"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  expect(decodeState(new URL(page.url()).hash.slice(11)).role).toBe(role);
 });

 test(`${role}: contribution lists and search fit enlarged text, all site languages and narrow or wide screens`,async({page})=>{
  test.setTimeout(150000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ga','pt','ar','pl','ro','fr','es','zh-Hans']){
   await page.goto(path+'?lang='+lang+'#about');
   const contribution=page.locator('.input-disclosure');
   await contribution.locator(':scope>summary').click();
   await expect(contribution.locator('.contribution-organisations>li')).toHaveCount(9);
   await expect(contribution.locator('.contribution-points>li')).toHaveCount(8);
   await expect(contribution.locator('.contribution-organisations a')).toHaveCount(40);
   await page.evaluate(()=>{document.documentElement.style.setProperty('--reading-size','200%');document.documentElement.classList.add('reading-spacious');});
   for(const width of [280,390,768,1366,2560]){
    await page.setViewportSize({width,height:900});
    await expect.poll(()=>page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,clipped:[...document.querySelectorAll('.contribution-content :is(h3,h4,p,li,a)')].filter(element=>element.scrollWidth>element.clientWidth+2).map(element=>({tag:element.tagName,text:element.textContent.slice(0,80),width:element.clientWidth,scroll:element.scrollWidth}))})),{message:`${role}: contribution list in ${lang} at ${width}px`}).toEqual({overflow:false,clipped:[]});
   }
   await page.setViewportSize({width:390,height:844});
   await expect(page.locator('#main-navigation')).toBeHidden();
   await openNavigation(page);await page.locator('#site-search-trigger').click();
   await page.locator('#site-search-input').fill(lang==='zh-Hans'?'歧视':lang==='ar'?'التمييز':'discrimination');
   await expect(page.locator('.site-search-result')).not.toHaveCount(0);
   for(const [width,height] of [[280,900],[568,320],[1366,900]]){
    await page.setViewportSize({width,height});
    // A single-line search field may scroll its value; its box must fit.
    await expect.poll(()=>page.locator('#site-search-dialog').evaluate(dialog=>{
     const field=dialog.querySelector('input'),box=field.getBoundingClientRect(),bounds=dialog.getBoundingClientRect();
     return {fits:dialog.scrollWidth<=dialog.clientWidth+2&&box.left>=bounds.left&&box.right<=bounds.right,clipped:[...dialog.querySelectorAll('h2,p,button,a')].some(element=>element.scrollWidth>element.clientWidth+2)};
    })).toEqual({fits:true,clipped:false});
   }
   await page.keyboard.press('Escape');
  }
 });
}
