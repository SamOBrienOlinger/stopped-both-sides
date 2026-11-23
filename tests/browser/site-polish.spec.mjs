import {test,expect} from '@playwright/test';

const cases=[{path:'./',role:'public'},{path:'garda/',role:'garda'}];
const portfolio='https://samobrienolinger.github.io/SamOBrienOlinger/';

for(const {path,role} of cases){
 test(path+' shared footer puts the disclaimer below the controls and above the copyright',async({page})=>{
  await page.goto(path);
  const identity=page.locator('.footer-top + .footer-identity');
  await expect(identity.locator('.footer-creator')).toHaveText('Sam Tim Solutions');
  await expect(identity.locator('.footer-creator')).toHaveAttribute('href',portfolio);
  await expect(identity.locator('.footer-copyright')).toHaveText('Copyright © 2026. All rights reserved');
  await expect(page.locator('.footer-top > .footer-tools + .footer-note')).toHaveText('General information, not legal advice. Not endorsed by any organisation or An Garda Síochána.');
  await expect(page.locator('.footer-top > .footer-tools > :is(a,button)')).toHaveCount(4);
  await page.evaluate(()=>document.documentElement.classList.add('contrast-high'));
  const colours=await page.locator('.footer').evaluate(footer=>({
   copyright:getComputedStyle(footer.querySelector('.footer-copyright')).color,
   foreground:getComputedStyle(footer).color
  }));
  expect(colours.copyright).toBe(colours.foreground);
 });

 test(path+' compact footer keeps readable targets on phones, desktop and enlarged right-to-left text',async({page},testInfo)=>{
  const footer=page.locator('.footer');
  const settings=footer.locator('#language-settings-footer');
  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang+'#play');
   await page.evaluate(()=>document.fonts.ready);
   if(lang==='ar'){
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
   }
   for(const width of [320,375,390,430,768,1366]){
    await page.setViewportSize({width,height:844});
    await expect.poll(()=>footer.evaluate((element,compact)=>{
     const bounds=element.getBoundingClientRect();
     const inner=element.querySelector('.footer-inner');
     const padding=getComputedStyle(inner);
     const contentWidth=inner.clientWidth-parseFloat(padding.paddingLeft)-parseFloat(padding.paddingRight);
     const links=[...element.querySelectorAll('.footer-tools > :is(a,button)')];
     const note=element.querySelector('.footer-note').getBoundingClientRect();
     const identity=element.querySelector('.footer-identity').getBoundingClientRect();
     return links.length===4 && Math.abs(note.width-contentWidth)<=1 && note.bottom<=identity.top &&
      (!compact || bounds.height<=235) &&
      element.scrollWidth<=element.clientWidth+1 &&
      links.every(link=>{
       const box=link.getBoundingClientRect();
       return box.height>=44 && box.width>=44 && box.left>=bounds.left && box.right<=bounds.right &&
        box.bottom<=note.top && link.scrollWidth<=link.clientWidth+1;
      });
    },lang==='en' && width<=430)).toBe(true);
    await expect.poll(()=>footer.evaluate(element=>[...element.querySelectorAll('a,button')].every(control=>{
     const box=control.getBoundingClientRect();return box.width>=44&&box.height>=44;
    })),'every footer action retains a full touch target').toBe(true);
    if(lang==='en'){
     const measure=()=>footer.evaluate(element=>({height:element.getBoundingClientRect().height,
      fonts:[...element.querySelectorAll('a,button,p')].map(item=>getComputedStyle(item).fontSize)}));
     const compact=await measure();
     const stylesheet=page.locator('link[href*="navigation-footer.css"]');
     await expect(stylesheet).toHaveCount(1);
     await stylesheet.evaluate(link=>{link.disabled=true;});
     const previous=await measure();
     await stylesheet.evaluate(link=>{link.disabled=false;});
     expect(previous.height-compact.height,'the footer saves space through layout and spacing').toBeGreaterThanOrEqual(10);
     expect(compact.fonts,'footer text has not been shrunk').toEqual(previous.fonts);
     if(width>=768){
      const centres=await footer.locator('.footer-identity').evaluate(element=>[...element.children].map(child=>{
       const box=child.getBoundingClientRect();return box.top+box.height/2;
      }));
      expect(Math.max(...centres)-Math.min(...centres),'desktop identity and copyright share one row').toBeLessThanOrEqual(1);
     }
     if(width===375||width===1366)await footer.screenshot({path:testInfo.outputPath(`${role}-compact-footer-${width}.png`)});
    }
   }
  }
  await settings.focus();
  await expect(settings).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#reading-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(settings).toBeFocused();
 });

 test(path+' navigation clears mobile reading content and stays available on desktop',async({page})=>{
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
     headerTop:Math.round(header.getBoundingClientRect().top),
     headerBottom:Math.round(header.getBoundingClientRect().bottom),
     scrolled:window.scrollY>50,
     noHorizontalOverflow:document.documentElement.scrollWidth<=document.documentElement.clientWidth+2
    };
   }).then(bounds=>({
    navigationClear:width<1152?bounds.headerBottom<=0:Math.abs(bounds.headerTop)<=2,
    scrolled:bounds.scrolled,noHorizontalOverflow:bounds.noHorizontalOverflow
   }))).toEqual({navigationClear:true,scrolled:true,noHorizontalOverflow:true});
   if(width<1152){
    // Return to the menu through the page, rather than assuming a phone
    // header is still pinned above the section being read.
    await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
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

 test(path+' in-page focus targets remain visible when scrolled into view',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(path+'#encounters');
  const button=page.locator('[data-action="paired-setup-characters"]');
  await expect(button).toBeVisible();
  await button.evaluate(element=>element.scrollIntoView({block:'start'}));
  const bounds=await button.evaluate(element=>({
   buttonTop:element.getBoundingClientRect().top,
   headerBottom:document.querySelector('.header').getBoundingClientRect().bottom
  }));
  expect(bounds.buttonTop,'the focused character control remains in the viewport below any visible navigation')
   .toBeGreaterThanOrEqual(Math.max(0,bounds.headerBottom)-2);
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
     const children=['#paired-title','[data-hero-perspective="garda"]','#perspectives-title','[data-hero-perspective="public"]','.landing-deck','.landing-role-actions','.small-note']
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
 await page.locator('.single-mode .practice-content a').click();
 await page.locator('.scenario-library .situation-topic>summary').first().click();
  await page.locator('.scenario-library [data-action="start"]').first().click();
 await expect(page.locator('.story')).toBeVisible();
 await expect(page.locator('.story .character')).toHaveCount(0);
 await expect(page.locator('.story')).not.toContainText('Your role:');
 await expect(page.locator('.story')).not.toContainText('Fictional situation · Republic of Ireland');
});
