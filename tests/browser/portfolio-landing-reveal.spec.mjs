import {test,expect} from '@playwright/test';
import {startEncounter,stateHash} from '../../encounters/engine.mjs?v=situation-locations-20261122';
import {openNavigation} from './navigation.mjs';

const paths=['./','garda/'];
const arrest=stateHash(startEncounter('public-arrest','garda',{cast:{public:'public-5',garda:'garda-6'}}));
const invitation=[
 'One situation.',
 'Two perspectives.',
 'Explore your human and civil rights and police powers through interactions between members of the public and Gardaí.',
 'Read a situation, choose a response, then find out why it matters.'
];
const invitationText=':scope > :is(.encounter-hero-title,.landing-deck,.small-note)';

for(const path of paths){
 test(path+' landing invitation matches the portfolio staggered reveal and honours reduced motion',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(path+'?lang=en#play');
  const group=page.locator('.reference-landing .landing-instructions');
  await expect(group).toBeVisible();
  const lines=group.locator(invitationText);
  await expect(lines).toHaveText(invitation);
  await expect.poll(()=>group.evaluate(element=>element.classList.contains('is-revealing'))).toBe(true);
  const animation=await lines.evaluateAll(children=>children.map(child=>({
   name:getComputedStyle(child).animationName,
   duration:getComputedStyle(child).animationDuration,
   delay:getComputedStyle(child).animationDelay,
   align:getComputedStyle(child).textAlign
  })));
  expect(animation.map(item=>item.name)).toEqual(Array(4).fill('landing-portfolio-line-reveal'));
  expect(animation.map(item=>item.duration)).toEqual(Array(4).fill('1s'));
  expect(animation.map(item=>item.delay)).toEqual(['0s','0.1s','0.2s','0.3s']);
  expect(animation.every(item=>item.align==='start'||item.align==='left')).toBe(true);
  await expect(group.locator('.landing-role-actions')).toHaveCSS('animation-name','none');
  for(const image of await group.locator('.encounter-hero-art').all())await expect(image).toHaveCSS('animation-name','none');
  await group.evaluate(async element=>{
   await document.fonts.ready;
   await Promise.all([...element.children].flatMap(child=>child.getAnimations())
    .map(animation=>animation.finished.catch(()=>{})));
  });
  await expect.poll(()=>lines.evaluateAll(children=>children
   .map(child=>getComputedStyle(child).opacity))).toEqual(Array(4).fill('1'));
  const label=path==='garda/'?'garda':'public';
  await group.screenshot({path:testInfo.outputPath(label+'-landing-typography-desktop.png')});
  await page.setViewportSize({width:390,height:844});
  await group.evaluate(async element=>{
   await Promise.all([...element.children].flatMap(child=>child.getAnimations())
    .map(animation=>animation.finished.catch(()=>{})));
  });
  await group.screenshot({path:testInfo.outputPath(label+'-landing-typography-phone.png')});
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>lines.evaluateAll(children=>children.map(child=>getComputedStyle(child).animationName))).toEqual(Array(4).fill('none'));
  await page.setViewportSize({width:320,height:568});
  await expect.poll(()=>page.evaluate(()=>{
   const root=document.documentElement,group=document.querySelector('.landing-instructions');
   const box=group.getBoundingClientRect();
   return root.scrollWidth<=root.clientWidth+2 && box.left>=-2 && box.right<=root.clientWidth+2;
  })).toBe(true);
 });

 test(path+' landing pairs each heading with its image and keeps route focus unframed',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#play');
  const group=page.locator('.landing-instructions');
  const images=group.locator('.encounter-hero-art');
  await expect(images).toHaveCount(2);
  await expect.poll(()=>images.evaluateAll(nodes=>nodes.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
  await page.evaluate(()=>document.fonts.ready);
  const fits=()=>group.evaluate(element=>{
   const selectors=['#paired-title','[data-hero-perspective="garda"]','#perspectives-title','[data-hero-perspective="public"]','.landing-deck','.landing-role-actions','.small-note'];
   const children=selectors.map(selector=>element.querySelector(selector));
   const root=document.documentElement,box=element.getBoundingClientRect();
   const rects=children.map(child=>child.getBoundingClientRect());
   return {
    order:children.every((child,index)=>!index||!!(children[index-1].compareDocumentPosition(child)&Node.DOCUMENT_POSITION_FOLLOWING)),
    vertical:rects.every((rect,index)=>!index||rects[index-1].bottom<=rect.top+1),
    contained:rects.every(rect=>rect.left>=box.left-1&&rect.right<=box.right+1)&&box.left>=-1&&box.right<=root.clientWidth+1,
    noOverflow:root.scrollWidth<=root.clientWidth+1&&children.every(child=>child.scrollWidth<=child.clientWidth+1),
    proportions:children.filter(child=>child.tagName==='IMG').every(image=>Math.abs(image.clientWidth/image.clientHeight-16/9)<.02)
   };
  });
  const expected={order:true,vertical:true,contained:true,noOverflow:true,proportions:true};
  const label=path==='garda/'?'garda':'public';
  for(const width of [280,320,375,390,768,1366]){
   await page.setViewportSize({width,height:844});
   await expect.poll(fits,'headings, complete images and controls fit at '+width+'px').toEqual(expected);
   if(width===375||width===1366)await group.screenshot({path:testInfo.outputPath(`${label}-landing-sequence-${width}.png`)});
  }

  // Reproduce the reported rectangle using a real keyboard-activated route return.
  await page.setViewportSize({width:375,height:812});
  await page.goto(path+'?lang=en#about');
  await openNavigation(page);
  await page.locator('#main-navigation [data-nav="play"]').focus();
  await page.keyboard.press('Enter');
  const title=page.locator('#paired-title');
  await expect(title).toBeFocused();
  await expect(title).toHaveCSS('outline-style','none');
  await expect(title).toHaveCSS('box-shadow','none');
  await group.screenshot({path:testInfo.outputPath(`${label}-landing-return-focus-375.png`)});
  await page.keyboard.press('Tab');
  const firstLink=group.locator('.perspective-card-link').first();
  await expect(firstLink).toBeFocused();
  await expect(firstLink).toHaveCSS('outline-style','solid');
  expect(await firstLink.evaluate(link=>parseFloat(getComputedStyle(link).outlineWidth))).toBeGreaterThanOrEqual(2);

  for(const lang of ['en','ar']){
   await page.goto(path+'?lang='+lang+'#play');
   await expect(page.locator('html')).toHaveAttribute('lang',lang==='en'?'en-IE':'ar');
   await page.evaluate(async()=>{await document.fonts.ready;document.documentElement.style.setProperty('--reading-size','200%');});
   for(const width of [280,375,768]){
    await page.setViewportSize({width,height:844});
    await expect.poll(fits,lang+' headings and images fit at 200% / '+width+'px').toEqual(expected);
   }
  }
 });

 test(path+' compact Menu shows Play across the situation picker and both learning modes',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('.reference-landing')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  const toggle=page.locator('[data-nav-toggle]');
  const current=toggle.locator('[data-menu-current]');
  const play=page.locator('#main-navigation [data-nav="encounters"]');
  const sizes=()=>toggle.evaluate(button=>({
   button:button.getBoundingClientRect().height,
   header:button.closest('.header').getBoundingClientRect().height
  }));
  await expect(toggle).toBeVisible();
  await expect(toggle.locator('[data-menu-label]')).toHaveText('Menu');
  await expect(current).toBeHidden();
  const homeSizes=await sizes();
  await toggle.click();
  await play.click();
  await expect(current).toBeVisible();
  await expect(current).toHaveText('Explore');
  await expect.poll(sizes,'adding Play keeps the Menu and sticky header the same height').toEqual(homeSizes);
  await toggle.click();
  await expect(play).toHaveText('Explore');
  await expect(play).toHaveAttribute('aria-current','page');
  await page.locator('#main-navigation [data-nav="about"]').click();
  await expect(current).toHaveText('About');
  await toggle.click();
  await play.click();
  await page.locator('[data-action="paired-quick-start"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  await expect(current).toHaveText('Explore');
  await page.goto(path+'?lang=en'+arrest);
  await expect(page.locator('html')).toHaveAttribute('data-perspective','garda');
  await expect(current).toHaveText('Explore');
  await expect.poll(sizes).toEqual(homeSizes);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await expect.poll(sizes).toEqual(homeSizes);
  await page.keyboard.press('Escape');
  await page.locator('.footer a[href="#accessibility"]').click();
  await expect(current).toBeHidden();
  await page.goto(path+'?lang=en#scenario/street');
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(current).toHaveText('Explore');
  await page.goto(path+'?lang=en#play');
  await expect(current).toBeHidden();
 });

 test(path+' profile dialogs describe this encounter without the old wording',async({page})=>{
  await page.goto(path+'#encounters');
  await page.locator('[data-action="paired-quick-start"]').click();
  const modal=page.locator('#scene-character-dialog');
  for(const role of ['public','garda']){
   await page.locator('.paired-scene-lead .scene-character-label[data-scene-label-role="'+role+'"]').click();
   await expect(modal).toBeVisible();
   await expect(modal.locator('#scene-character-dialog-summary')).toContainText('in this encounter');
   await expect(modal.locator('#scene-character-dialog-summary')).not.toContainText('in the fictional encounter');
   await modal.getByRole('button',{name:'Close character details'}).click();
   await expect(modal).not.toBeVisible();
  }
 });
}
