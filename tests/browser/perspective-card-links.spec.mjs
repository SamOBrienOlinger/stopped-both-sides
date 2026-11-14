import {test,expect} from '@playwright/test';

const entrypoints=['./','garda/'];
const descriptions={
 public:'You are stopped. Learn what you can ask and what you may need to do.',
 garda:'You make the stop. Check your reasons, assumptions and responsibilities.'
};
const titles={public:'member of the public',garda:'Garda member'};
const cards=role=>`a.perspective-hero.perspective-card-link[data-role-tone="${role}"]`;

for(const path of entrypoints){
 for(const role of ['public','garda']){
  test(`${path} full ${role} card navigates from title, image and explanation`,async({page},info)=>{
   test.setTimeout(90000);
   const destination=new URL('#encounters/'+role,info.project.use.baseURL).href;
   for(const area of ['.perspective-hero-button','img[data-approved-hero]','.perspective-caption']){
    await page.goto(path+'?lang=en#play');
    const link=page.locator(cards(role));
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href',destination);
    await expect(link).toHaveAttribute('aria-labelledby',`perspective-${role}-label perspective-${role}-action`);
    await expect(link).toHaveAttribute('aria-describedby',`perspective-${role}-description`);
    await expect(link.locator('.perspective-hero-button a, a')).toHaveCount(0);
    await expect(link.locator('.perspective-caption')).toHaveText(descriptions[role]);
    await expect(link.locator('.perspective-button-label')).toHaveText(titles[role]);
    await link.locator(area).click();
    await expect(page).toHaveURL(destination);
    await expect(page.locator('[data-action="paired-quick-start"]')).toBeVisible();
   }
  });
 }

 test(`${path} both entire cards stay accessible at mobile, 200% text and Arabic RTL`,async({page},info)=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ar']){
   for(const [width,height] of [[320,650],[390,844],[1366,900]]){
    await page.setViewportSize({width,height});
    await page.goto(path+'?lang='+lang+'#play');
    await expect(page.locator('a.perspective-card-link')).toHaveCount(2);
    await expect.poll(()=>page.locator('img[data-approved-hero]').evaluateAll(images=>images.length===2&&images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
    await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
    await expect.poll(()=>page.evaluate(()=>{
     const root=document.documentElement;
     const boxes=[...document.querySelectorAll('a.perspective-card-link')].map(a=>a.getBoundingClientRect());
     return root.scrollWidth<=root.clientWidth+2&&boxes.every(box=>box.width>100&&box.left>=-2&&box.right<=root.clientWidth+2);
    })).toBe(true);
    for(const role of ['public','garda']){
     const link=page.locator(cards(role));
     await expect(link).toHaveAttribute('href',new URL('#encounters/'+role,info.project.use.baseURL).href);
     await expect(link).toHaveAttribute('aria-labelledby',`perspective-${role}-label perspective-${role}-action`);
     await expect(link).toHaveAttribute('aria-describedby',`perspective-${role}-description`);
    }
   }
  }
  await page.goto(path+'?lang=en#play');
  const first=page.locator(cards('public'));
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new URL('#encounters/public',info.project.use.baseURL).href);
  await expect(page.locator('[data-action="paired-quick-start"]')).toBeVisible();
 });
}
