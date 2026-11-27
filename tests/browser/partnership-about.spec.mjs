import {test,expect} from '@playwright/test';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=site-repairs-20261125';

for(const path of ['./','garda/'])for(const language of ['en','ar','ga','zh-Hans']){
 test(`About partnership invitation: ${path} ${language}`,async({page})=>{
  await loadLanguage(language);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:320,height:844});
  await page.goto(path+'?lang='+language+'#about');
  const overview=page.locator('.partnership-overview');
  await expect(overview.getByRole('heading',{name:translateText('Partnership and collaboration',language)})).toBeVisible();
  const contact=overview.getByRole('link',{name:translateText('Discuss partnership or funding',language)});
  await expect(contact).toHaveAttribute('href','https://samobrienolinger.github.io/SamOBrienOlinger/#contact');
  const disclosure=page.locator('.input-disclosure');
  await expect(disclosure).not.toHaveAttribute('open','');
  await disclosure.locator(':scope > summary').click();
  await expect(disclosure.locator('#partnership-pilot')).toBeVisible();
  await expect(disclosure.locator('#partnership-funding')).toBeVisible();
  await expect(disclosure.locator('.partnership-detail')).toHaveCount(3);
  await expect(disclosure.locator('#partnership-funding + p')).toContainText('not confirmed funding');
  await expect(disclosure.locator('.contribution-organisations > li')).toHaveCount(9);
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
  const links=disclosure.locator('.partnership-detail a');
  await expect(links).toHaveCount(6);
  for(const width of [280,320,1366]){
   await page.setViewportSize({width,height:900});
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)).toBe(true);
   await expect.poll(()=>links.evaluateAll(elements=>elements.every(link=>{
    const box=link.getBoundingClientRect();
    return link.clientWidth>0&&link.scrollWidth<=link.clientWidth+2&&box.height>=44&&
     box.left>=-1&&box.right<=document.documentElement.clientWidth+1;
   })),{message:'all six research and funding links have unclipped, usable link boxes at '+width+'px'}).toBe(true);
  }
  expect(errors).toEqual([]);
 });
}
