import {openNavigation} from './navigation.mjs';
import {test,expect} from '@playwright/test';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=scene-review-1';

await Promise.all(['ar','fr'].map(loadLanguage));
const variants=[
 {language:'en',width:1280,large:false},
 {language:'en',width:320,large:false},
 {language:'ar',width:390,large:true},
 {language:'fr',width:390,large:true}
];

for(const path of ['./','garda/'])for(const {language,width,large} of variants){
 test(`${path} About learning section: ${language}, ${width}px${large?', enlarged reading':''}`,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width,height:900});
  await page.goto(path+'?lang='+language+'#about');
  const section=page.locator('.learning-section');
  await expect(section.locator('h2')).toHaveText(translateText('Learning through choices',language));
  await expect(section.locator('.learning-goal')).toHaveCount(4);
  await expect(section.locator('details')).toHaveCount(5);
  const first=section.locator('summary').first();
  await first.focus();await page.keyboard.press('Enter');
  await expect(section.locator('details').first()).toHaveAttribute('open','');
  await expect(first).toBeFocused();
  await page.keyboard.press('Space');
  await expect(section.locator('details').first()).not.toHaveAttribute('open','');
  for(const summary of await section.locator('summary').all())await summary.click();
  await expect(section.locator('details[open]')).toHaveCount(5);
  if(large){
   await openNavigation(page);await page.locator('#language-settings-trigger').click();
   await page.locator('#reading-size').selectOption('150');
   await page.locator('#reading-contrast').selectOption('high');
   await page.locator('[name="spacing"]').check();
   await page.locator('[name="motion"]').check();
   await page.locator('#reading-form [type="submit"]').click();
   await expect(page.locator('#reading-dialog')).not.toBeVisible();
   await expect(section.locator('details[open]')).toHaveCount(5);
  }
  await expect(section.locator('.learning-examples article')).toHaveCount(6);
  await expect(section.locator('.learning-stages>li')).toHaveCount(6);
  await expect(section.locator('.learning-outcomes>li')).toHaveCount(8);
  await expect(section.locator('.learning-references>li')).toHaveCount(8);
  expect(new URL(page.url()).hash).toBe('#about');
  const layout=await page.evaluate(()=>({
   width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
   clipped:[...document.querySelectorAll('.learning-section p,.learning-section h2,.learning-section h3,.learning-section summary,.learning-section li,.learning-section dd')]
    .filter(element=>element.getClientRects().length&&element.scrollWidth>element.clientWidth+2)
    .map(element=>element.textContent.slice(0,80)),
   targets:[...document.querySelectorAll('.learning-panel>summary')].map(element=>element.getBoundingClientRect().height)
  }));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width+2);
  expect(layout.clipped).toEqual([]);
  expect(layout.targets.every(height=>height>=44)).toBe(true);
  if(language==='ar'){
   await expect(page.locator('#main')).toHaveAttribute('dir','rtl');
   await expect(section.locator('.learning-references [data-no-translate]').first()).toHaveCSS('direction','ltr');
  }
  expect(errors).toEqual([]);
 });
}
