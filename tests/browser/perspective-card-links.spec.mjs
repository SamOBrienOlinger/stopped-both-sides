import {test,expect} from '@playwright/test';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=site-repairs-20261125';

const entrypoints=['./','garda/'];
const titles={public:'Explore the public perspective',garda:'Explore the Garda perspective'};
const roleLinks=role=>`a.perspective-card-link[data-role-tone="${role}"]`;

for(const path of entrypoints){
 for(const [role,title] of Object.entries(titles)){
  test(`${path} ${role} link opens the selected role by mouse and keyboard`,async({page},info)=>{
   const destination=new URL('?lang=en#encounters/'+role,info.project.use.baseURL).href;
   const entries=[
    ['.perspective-card',role==='public'?'Public perspective':'Garda perspective','mouse'],
    [roleLinks(role),title,'keyboard']
   ];
   for(const [selector,label,input] of entries){
    await page.goto(path+'?lang=en#play');
    if(input==='keyboard')await page.locator('.single-mode > summary').press('Enter');
    const link=page.locator(selector).and(page.getByRole('link',{name:label,exact:true}));
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href',destination);
    await expect(link.locator('a,button,input,[tabindex]')).toHaveCount(0);
    if(input==='mouse')await link.click();
    else {
     await link.focus();
     await expect(link).toBeFocused();
     await page.keyboard.press('Enter');
    }
    await expect(page).toHaveURL(destination);
    await expect(page.locator('html')).toHaveAttribute('lang','en-IE');
    const start=page.locator('[data-action="paired-quick-start"]');
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute('data-role',role);
   }
  });
 }

 test(`${path} first-visit and saved site languages stay with the selected role`,async({page},info)=>{
  await page.goto(path+'?lang=ar#play');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  const choices=page.locator('.sbs-poster a');
  await expect(choices).toHaveCount(4);
  for(const link of await choices.all())await expect(link).toHaveAttribute('href',/\?lang=ar#encounters\/(?:public|garda)$/);
  // The destination can have a different saved language from this explicit link.
  await page.evaluate(()=>localStorage.setItem('garda-encounter-reading-v1:public',JSON.stringify({language:'fr'})));
  await page.locator('.perspective-card').last().click();
  await expect(page).toHaveURL(new URL('?lang=ar#encounters/garda',info.project.use.baseURL).href);
  await expect(page.locator('.paired-picker')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('#main')).toHaveAttribute('dir','rtl');
 });

 test(`${path} both role links stay accessible at mobile, 200% text and Arabic RTL`,async({page},info)=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ar']){
   await loadLanguage(lang);
   for(const [width,height] of [[320,650],[390,844],[1366,900]]){
    await page.setViewportSize({width,height});
    await page.goto(path+'?lang='+lang+'#play');
    await expect(page.locator('a.perspective-card-link')).toHaveCount(2);
    await expect(page.locator('.poster-hero img.hero-public, .poster-hero img.hero-garda')).toHaveCount(2);
    await expect.poll(()=>page.locator('.poster-hero img.hero-public, .poster-hero img.hero-garda').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
    await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
    const toggle=page.locator('.single-mode > summary');
    if(!await toggle.evaluate(summary=>summary.parentElement.open))await toggle.click();
    await expect.poll(()=>page.evaluate(()=>{
     const root=document.documentElement;
     const links=[...document.querySelectorAll('a.perspective-card-link')];
     return root.scrollWidth<=root.clientWidth+2&&links.every(link=>{
      const box=link.getBoundingClientRect();
      return box.width>=44&&box.height>=48&&box.left>=-2&&box.right<=root.clientWidth+2&&
       link.scrollWidth<=link.clientWidth+1&&link.scrollHeight<=link.clientHeight+1;
     });
    })).toBe(true);
    for(const [role,title] of Object.entries(titles)){
     const link=page.locator(roleLinks(role));
     await expect(link).toHaveAttribute('href',new URL('?lang='+lang+'#encounters/'+role,info.project.use.baseURL).href);
     await expect(link).toHaveAccessibleName(translateText(title,lang));
    }
   }
  }
 });
}
