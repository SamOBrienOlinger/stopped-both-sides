import {test,expect} from '@playwright/test';

const paths=['./','garda/'];
const invitation=[
 'Explore your rights and police powers through everyday encounters involving questioning, searches, arrest, young people and racism.',
 'Which side will you try first?',
 'Know your rights. Understand fair decisions.',
 'Read a situation, choose a response, then find out why it matters.'
];

for(const path of paths){
 test(path+' landing invitation matches the portfolio staggered reveal and honours reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(path+'?lang=en#play');
  const group=page.locator('.reference-landing .landing-instructions');
  await expect(group).toBeVisible();
  await expect(group.locator(':scope > .landing-deck, :scope > #paired-title, :scope > .landing-purpose, :scope > .small-note')).toHaveText(invitation);
  await expect.poll(()=>group.evaluate(element=>element.classList.contains('is-revealing'))).toBe(true);
  const animation=await group.evaluate(element=>[...element.children].map(child=>({
   name:getComputedStyle(child).animationName,
   duration:getComputedStyle(child).animationDuration,
   delay:getComputedStyle(child).animationDelay,
   align:getComputedStyle(child).textAlign
  })));
  expect(animation.map(item=>item.name)).toEqual(Array(4).fill('landing-portfolio-line-reveal'));
  expect(animation.map(item=>item.duration)).toEqual(Array(4).fill('1s'));
  expect(animation.map(item=>item.delay)).toEqual(['0s','0.1s','0.2s','0.3s']);
  expect(animation.every(item=>item.align==='center')).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>group.evaluate(element=>[...element.children].map(child=>getComputedStyle(child).animationName))).toEqual(Array(4).fill('none'));
  await page.setViewportSize({width:320,height:568});
  await expect.poll(()=>page.evaluate(()=>{
   const root=document.documentElement,group=document.querySelector('.landing-instructions');
   const box=group.getBoundingClientRect();
   return root.scrollWidth<=root.clientWidth+2 && box.left>=-2 && box.right<=root.clientWidth+2;
  })).toBe(true);
 });

 test(path+' compact Menu omits Play subtitle but keeps the Play navigation link',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(path+'#encounters');
  const toggle=page.locator('[data-nav-toggle]');
  await expect(toggle).toBeVisible();
  await expect(toggle.locator('[data-menu-label]')).toHaveText('Menu');
  await expect(toggle.locator('[data-menu-current]')).toBeHidden();
  await expect(toggle).not.toContainText('Play');
  await toggle.click();
  await expect(page.locator('#main-navigation [data-nav="encounters"]')).toHaveText('Play');
  await page.locator('#main-navigation [data-nav="about"]').click();
  await expect(toggle.locator('[data-menu-current]')).toHaveText('About');
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
