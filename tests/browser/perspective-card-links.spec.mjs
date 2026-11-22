import {test,expect} from '@playwright/test';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=situation-locations-20261122';

const entrypoints=['./','garda/'];
const titles={public:'Explore the public perspective',garda:'Explore the Garda perspective'};
const roleLinks=role=>`a.perspective-card-link[data-role-tone="${role}"]`;

for(const path of entrypoints){
 for(const [role,title] of Object.entries(titles)){
  test(`${path} ${role} link opens the selected role by mouse and keyboard`,async({page},info)=>{
   const destination=new URL('#encounters/'+role,info.project.use.baseURL).href;
   for(const input of ['mouse','keyboard']){
    await page.goto(path+'?lang=en#play');
    const link=page.getByRole('link',{name:title,exact:true});
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
    const start=page.locator('[data-action="paired-quick-start"]');
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute('data-role',role);
   }
  });
 }

 test(`${path} both role links stay accessible at mobile, 200% text and Arabic RTL`,async({page},info)=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ar']){
   await loadLanguage(lang);
   for(const [width,height] of [[320,650],[390,844],[1366,900]]){
    await page.setViewportSize({width,height});
    await page.goto(path+'?lang='+lang+'#play');
    await expect(page.locator('a.perspective-card-link')).toHaveCount(2);
    await expect.poll(()=>page.locator('.encounter-hero-art').evaluate(image=>image.complete&&image.naturalWidth>0)).toBe(true);
    await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
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
     await expect(link).toHaveAttribute('href',new URL('#encounters/'+role,info.project.use.baseURL).href);
     await expect(link).toHaveAccessibleName(translateText(title,lang));
    }
   }
  }
 });
}
