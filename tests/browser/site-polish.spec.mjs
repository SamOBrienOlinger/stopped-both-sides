import {test,expect} from '@playwright/test';

const cases=[{path:'./',role:'public'},{path:'garda/',role:'garda'}];
const portfolio='https://samobrienolinger.github.io/SamOBrienOlinger/';

for(const {path,role} of cases){
 test(path+' shared footer retains owner link and copyright wording',async({page})=>{
  await page.goto(path);
  await expect(page.locator('.footer-creator')).toHaveText('Sam Tim Solutions');
  await expect(page.locator('.footer-creator')).toHaveAttribute('href',portfolio);
  await expect(page.locator('.footer-copyright')).toHaveText('Copyright © 2026. All rights reserved');
  await expect(page.locator('.footer-note')).toContainText('General information, not legal advice.');
  await expect(page.locator('.footer-tools a')).toHaveCount(3);
  await page.evaluate(()=>document.documentElement.classList.add('contrast-high'));
  const colours=await page.locator('.footer').evaluate(footer=>({
   copyright:getComputedStyle(footer.querySelector('.footer-copyright')).color,
   foreground:getComputedStyle(footer).color
  }));
  expect(colours.copyright).toBe(colours.foreground);
 });

 test(path+' top navigation stays visible after scrolling with compact menu usable',async({page})=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1366,768]]){
   await page.setViewportSize({width,height});
   await page.goto(path+'#about');
   await expect(page.locator('.about-opening')).toBeVisible();
   await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   await expect.poll(()=>page.evaluate(()=>{
    const header=document.querySelector('.header');
    return {
     stuck:getComputedStyle(header).position==='sticky'&&Math.abs(header.getBoundingClientRect().top)<=2,
     scrolled:window.scrollY>50,
     noHorizontalOverflow:document.documentElement.scrollWidth<=document.documentElement.clientWidth+2
    };
   })).toEqual({stuck:true,scrolled:true,noHorizontalOverflow:true});
   if(width<1152){
    const toggle=page.locator('[data-nav-toggle]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('#main-navigation')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await expect(toggle).toBeFocused();
   }
  }
 });

 test(path+' in-page focus targets clear the sticky header when scrolled into view',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(path+'#encounters');
  const button=page.locator('[data-action="paired-setup-characters"]');
  await expect(button).toBeVisible();
  await button.evaluate(element=>element.scrollIntoView({block:'start'}));
  const bounds=await button.evaluate(element=>({
   buttonTop:element.getBoundingClientRect().top,
   headerBottom:document.querySelector('.header').getBoundingClientRect().bottom
  }));
  expect(bounds.buttonTop,'the focused character control remains below sticky navigation')
   .toBeGreaterThanOrEqual(bounds.headerBottom-2);
  await button.focus();
  await expect(button).toBeFocused();
  await button.click();
  await expect(page.locator('#character-picker')).toBeVisible();
 });

 test(path+' landing invitation has accessible order and fits enlarged text and RTL',async({page})=>{
  test.setTimeout(150000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang);
   await expect(page.locator('.landing-instructions')).toBeVisible();
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   for(const [width,height] of [[320,568],[390,844],[768,1024],[1366,768]]){
    await page.setViewportSize({width,height});
    await expect.poll(()=>page.evaluate(()=>{
     const section=document.querySelector('.landing-instructions');
     const children=['.landing-deck','#paired-title','.landing-purpose','.small-note']
      .map(selector=>section.querySelector(selector)?.getBoundingClientRect());
     const root=document.documentElement;
     const box=section.getBoundingClientRect();
     return {
      present:children.every(Boolean),
      verticalOrder:children.every((rect,i)=>!i||children[i-1].bottom<=rect.top+2),
      withinViewport:box.left>=-2&&box.right<=root.clientWidth+2,
      withinPage:section.scrollWidth<=section.clientWidth+2&&root.scrollWidth<=root.clientWidth+2
     };
    })).toEqual({present:true,verticalOrder:true,withinViewport:true,withinPage:true});
   }
  }
 });

 test(path+' About heading sits directly between the project title and overview',async({page})=>{
  await page.goto(path+'#about');
  const opening=page.locator('.content-page>.about-opening');
  await expect(opening.locator(':scope>.brand-intro')).toBeVisible();
  await expect(opening.locator(':scope>.about-heading-block')).toBeVisible();
  await expect(opening.locator(':scope>.about-overview')).toBeVisible();
  const ordered=await opening.evaluate(element=>[...element.children].slice(0,3).map(el=>el.classList.contains('brand-intro')?'brand':el.classList.contains('about-heading-block')?'heading':el.classList.contains('about-overview')?'overview':'other'));
  expect(ordered).toEqual(['brand','heading','overview']);
  const heading=opening.locator('.about-heading-block');
  await expect(heading.locator('.eyebrow')).toHaveText(role==='public'?'ABOUT THE PROJECT':'ABOUT THE GARDA PERSPECTIVE');
  await expect(heading.locator('h2')).toHaveText(role==='public'?'Learn through situations.Make room for lived experience.':'Examine the decision.Keep the person in view.');
 });
}

test('Garda individual practice omits the redundant patrol role and fictional situation strip',async({page})=>{
 await page.goto('garda/#play');
 await page.locator('.single-mode summary').click();
 await page.locator('.single-mode [data-action="start"]').first().click();
 await expect(page.locator('.story')).toBeVisible();
 await expect(page.locator('.story .character')).toHaveCount(0);
 await expect(page.locator('.story')).not.toContainText('Your role:');
 await expect(page.locator('.story')).not.toContainText('Fictional situation · Republic of Ireland');
});
