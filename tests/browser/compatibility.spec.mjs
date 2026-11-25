import {openNavigation,expectSettingsFocusReturn,openCharacterPicker} from './navigation.mjs';
import {test,expect} from '@playwright/test';
import {decodeState} from '../../encounters/engine.mjs?v=nia-public-20261123';
import {expectControlsFit} from './control-layout.mjs';

const sizes=[[320,568],[390,844],[568,320],[768,1024],[1024,768],[1366,768],[1920,1080],[2560,1440]];
const readState=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const paths={public:'./',garda:'garda/'};
async function ready(page){
 await expect(page.locator('#main h1')).toBeVisible();
 await expect(page.locator('#loading,.error')).toHaveCount(0);
 await page.evaluate(()=>document.fonts.ready.then(()=>true));
}
async function fits(page,label){
 const result=await page.evaluate(()=>{
  const width=document.documentElement.clientWidth;
  const clips=[...document.querySelectorAll('h1,h2,.story,.scenario,.choice,.role-score,.recap-role,.info-block,.settings-content,.character-picker,.character-option,.cast-character,.character-actions,.start-panel,.recommended-situation')]
   .filter(el=>el.getClientRects().length&&el.scrollWidth>el.clientWidth+2)
   .map(el=>({element:el.tagName+'.'+el.className,text:el.textContent.slice(0,70),width:el.clientWidth,content:el.scrollWidth}));
  return {width,scroll:document.documentElement.scrollWidth,clips};
 });
 expect(result.scroll,label+' must not scroll horizontally').toBeLessThanOrEqual(result.width+2);
 expect(result.clips,label+' must not clip text').toEqual([]);
 await expectControlsFit(page,label);
}
async function settings(page){
 await openNavigation(page);await page.locator('.header [data-reading-open]').click();
 await expect(page.locator('#reading-dialog')).toBeVisible();
 await expect(page.locator('#reading-title')).toBeFocused();
}
async function checkHeroControls(page){
 await page.emulateMedia({reducedMotion:'reduce'});
 const hero=page.locator('.reference-landing');
 const links=hero.locator('.perspective-card-link');
 await expect(links).toHaveCount(2);
 const targets=await links.evaluateAll(controls=>controls.map(control=>{
  const {x,y,bottom,width,height}=control.getBoundingClientRect();
  return {x,y,bottom,width,height,
   clipped:control.scrollWidth>control.clientWidth+1||control.scrollHeight>control.clientHeight+1};
 }));
 const [first,second]=targets;
 const overlap=Math.min(first.x+first.width,second.x+second.width)-Math.max(first.x,second.x);
 expect(overlap<=1||second.y>=first.bottom-1,'the two links never overlap').toBe(true);
 for(const target of targets){
  expect(target.height,'touch target height').toBeGreaterThanOrEqual(48);
  expect(target.width,'touch target width').toBeGreaterThanOrEqual(44);
  expect(target.clipped,'translated control text must fit').toBe(false);
 }
 const figures=hero.locator('img.hero-public, img.hero-garda');
 await expect(figures).toHaveCount(2);
 await expect(hero.locator('#paired-title')).toBeVisible();
 await expect(hero.locator('#perspectives-title')).toBeVisible();
 const highContrast=await page.locator('html').evaluate(root=>root.classList.contains('contrast-high'));
 for(const figure of await figures.all()){
  if(highContrast)await expect(figure).toBeHidden();
  else {
   await expect(figure).toBeVisible();
   await expect.poll(()=>figure.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  }
 }
 await expect(hero.locator('.hero-question')).toBeVisible();
 for(const label of await hero.locator('.perspective-label').all())await expect(label).toBeVisible();
 await expect(page.locator('.brick-cloud')).toHaveCount(0);
}
async function captureHero(page,role,width,state,testInfo){
 if(![320,390,768,1366].includes(width))return;
 await testInfo.attach(`hero-${role}-${width}-${state}`,{
  body:await page.locator('.reference-landing').screenshot({animations:'disabled'}),
  contentType:'image/png'
 });
}
async function captureControls(page,role,width,state,testInfo,groups){
 if(!testInfo||![320,390,768,1366].includes(width))return;
 for(const [name,selector] of groups){
  const control=page.locator(selector).first();
  if(!await control.isVisible())continue;
  await testInfo.attach(`${name}-${role}-${width}-${state}`,{
   body:await control.screenshot({animations:'disabled'}),contentType:'image/png'
  });
 }
}
async function checkDialog(page){
 await settings(page);
 await fits(page,'reading settings');
 const bounds=await page.locator('#reading-dialog').boundingBox();
 expect(bounds.x).toBeGreaterThanOrEqual(0);
 expect(bounds.y).toBeGreaterThanOrEqual(0);
 expect(bounds.y+bounds.height).toBeLessThanOrEqual(page.viewportSize().height+2);
 await page.keyboard.press('Shift+Tab');
 expect(await page.evaluate(()=>!!document.activeElement.closest('#reading-dialog'))).toBe(true);
 await page.keyboard.press('Escape');
 await expect(page.locator('#reading-dialog')).not.toBeVisible();
 await expectSettingsFocusReturn(page);
}
async function chooseFirst(page,role,testInfo){
 await openNavigation(page);await page.locator('.header [data-nav="encounters"]').click();
 await expect(page.locator('.encounter-card')).toHaveCount(34);
 await page.locator('.setup-role summary').click();
 await page.locator(`.role-picker a[href="#encounters/${role}"]`).click();
 await expect(page.locator('.character-option')).toHaveCount(0);
 await fits(page,'simple setup');
 await page.locator('[data-action="paired-setup-characters"]').click();
 await expect(page.locator('.character-option')).toHaveCount(role==='public'?10:9);await fits(page,'character picker');
 await captureControls(page,role,page.viewportSize().width,'standard',testInfo,[['character-picker','.character-picker']]);
 await page.locator('[data-action="paired-setup-done"]').click();
 await expect(page.locator(`[data-action="paired-start"]`).first()).toHaveAttribute('data-role',role);
 await page.locator('[data-action="paired-quick-start"]').click();
 await expect(page.locator('.paired-game')).toBeVisible();
}

for(const role of ['public','garda']){
 for(const [width,height] of sizes){
  test(`${role} fits ${width}x${height} with large Irish text`,async({page},testInfo)=>{
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{if(response.status()>=400&&response.url().includes('/stopped-both-sides/'))errors.push(response.status()+' '+response.url());});
   await page.setViewportSize({width,height});
   await page.goto(paths[role]);await ready(page);await fits(page,'home');await checkHeroControls(page);
   await captureHero(page,role,width,'standard',testInfo);
   await captureControls(page,role,width,'standard',testInfo,[['navbar','.header'],['how-it-works','.how-to-play'],['footer','.footer']]);
   await page.locator('.single-mode summary').click();await page.locator('.single-mode .practice-content a').click();await fits(page,'original situations');
   await page.locator('.scenario-library .situation-topic>summary').first().click();
  await page.locator('.scenario-library [data-action="start"]').first().click();
   await expect(page.locator('.story')).toBeVisible();
   await page.locator('[data-action="choose"]').first().click();
   await expect(page.locator('#feedback')).toBeVisible();await fits(page,'original practice feedback');
   await chooseFirst(page,role,testInfo);await fits(page,'shared situation');
   await page.locator('[data-action="paired-answer"]').first().click();
   await expect(page.locator('#feedback')).toBeVisible();await fits(page,'feedback');
   await checkDialog(page);
   await settings(page);
   await page.locator('#reading-language').selectOption('ga');
   await page.locator('#reading-size').selectOption('150');
   await page.locator('[name="spacing"]').check();
   await page.locator('#reading-contrast').selectOption('high');
   await page.locator('#reading-form [type="submit"]').click();
   await expect(page.locator('html')).toHaveAttribute('lang','ga');
   await fits(page,'large Irish feedback');
   await captureControls(page,role,width,'large-irish',testInfo,[['navbar','.header'],['character-actions','.flow-role-bar'],['feedback-actions','.flow-feedback-actions'],['footer','.footer']]);
   const caption=await openCharacterPicker(page);
   await expect(page.locator('#character-picker-title')).toBeFocused();
   await expect(page.locator('.character-option')).toHaveCount(role==='public'?10:9);await fits(page,'large Irish character picker');
   await captureControls(page,role,width,'large-irish',testInfo,[['character-picker','.character-picker']]);
   await page.locator('[data-action="paired-character-close"]').click();
   await expect(caption).toBeFocused();
   await page.locator('.flow-role-bar + [data-action="paired-switch"]').click();
   await expect(page.locator('html')).toHaveAttribute('data-perspective',role==='public'?'garda':'public');
   await fits(page,'other perspective');
   await checkDialog(page);
   await openNavigation(page);await page.locator('.header [data-nav="play"]').click();await ready(page);await fits(page,'large Irish home');await checkHeroControls(page);
   await captureHero(page,role,width,'large-text',testInfo);
   await captureControls(page,role,width,'large-text',testInfo,[['how-it-works','.how-to-play']]);
   await expect(page.locator('.perspective-card-link').first()).toHaveText('Fiosraigh dearcadh an phobail');
   await expect(page.locator('.perspective-card-link').last()).toHaveText('Fiosraigh dearcadh an Gharda');
   for(const target of ['encounters','progress','about',role==='public'?'rights':'evidence']){
    await openNavigation(page);await page.locator(`.header [data-nav="${target}"]`).click();await ready(page);await fits(page,target);
   }
   await openNavigation(page);
   const undersized=await page.locator('.header nav a,.settings-button,.site-switch').evaluateAll(elements=>elements.filter(el=>{
    const box=el.getBoundingClientRect();return box.width<44||box.height<44;
   }).map(el=>el.textContent));
   expect(undersized,'primary navigation targets').toEqual([]);
   expect(errors).toEqual([]);
  });
 }

 test(`${role} choices, language, switching, reload and recap work`,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto(paths[role]);await ready(page);await chooseFirst(page,role);
  await page.locator('[data-action="paired-answer"]').first().click();
  await expect(page.locator('#feedback')).toBeVisible();
  const before=readState(page);
  await openNavigation(page);await page.locator('[data-site-switch]').click();
  await expect(page.locator('.content-page h1')).toContainText('sources');
  await page.locator('.session-return a').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  expect(readState(page)).toEqual(before);
  await page.locator('[data-action="paired-switch"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-perspective',role==='public'?'garda':'public');
  expect(readState(page).answers).toEqual(before.answers);
  expect(readState(page).nodeId).toEqual(before.nodeId);
  await page.locator('[data-action="paired-answer"]').first().click();
  await settings(page);await page.locator('#reading-language').selectOption('ga');
  await page.locator('#reading-form [type="submit"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang','ga');
  const saved=readState(page);await page.reload();await ready(page);
  expect(readState(page)).toEqual(saved);
  // Fresh reader input precedes Playwright's implicit scroll to the game controls.
  await page.keyboard.press('Escape');
  for(let stage=0;stage<10&&!readState(page).complete;stage++){
   if(readState(page).answers[readState(page).role]===null)await page.locator('[data-action="paired-answer"]').first().click();
   await page.locator('[data-action="paired-next"]').click();
   await expect.poll(()=>readState(page).complete||readState(page).answers[readState(page).role]===null).toBe(true);
  }
  expect(readState(page).complete).toBe(true);
  await expect(page.locator('.paired-recap')).toBeVisible();await fits(page,'Irish recap');
  await openNavigation(page);await page.locator('.header [data-nav="progress"]').click();
  await expect(page.locator('.progress-page')).toBeVisible();await fits(page,'saved progress');
  expect(errors).toEqual([]);
 });

 test(`${role} remains playable without newer clone, hasOwn or dialog methods`,async({page})=>{
  await page.addInitScript(()=>{
   window.structuredClone=undefined;Object.hasOwn=undefined;
   HTMLDialogElement.prototype.showModal=undefined;HTMLDialogElement.prototype.close=undefined;
   Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}});
  });
  await page.setViewportSize({width:320,height:568});
  await page.goto(paths[role]);await ready(page);await chooseFirst(page,role);
  await page.locator('[data-action="paired-answer"]').first().click();
  await expect(page.locator('#feedback')).toBeVisible();
  await checkDialog(page);
  await settings(page);await page.locator('#reading-language').selectOption('ga');
  await page.locator('#reading-form [type="submit"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang','ga');
  await expect(page.locator('#feedback')).toBeVisible();
  await expect(page.locator('.dialog-backdrop')).toHaveCount(0);
  await expect(page.locator('#main')).not.toHaveAttribute('aria-hidden','true');
 });

 test(`${role} touch input survives portrait and landscape`,async({browser,browserName,baseURL})=>{
  const context=await browser.newContext({baseURL,viewport:{width:390,height:844},
   hasTouch:true,isMobile:browserName!=='firefox',deviceScaleFactor:3});
  const page=await context.newPage();
  try{
   await page.goto(paths[role]);await ready(page);
   await checkHeroControls(page);
   await page.locator(`.reference-landing a.perspective-card-link[data-role-tone="${role}"]`).tap();
   await expect(page.locator('.encounter-card')).toHaveCount(34);
   await page.locator('[data-action="paired-quick-start"]').tap();
   await expect(page.locator('.paired-game')).toBeVisible();
   await page.locator('[data-action="paired-answer"]').first().tap();
   await expect(page.locator('#feedback')).toBeVisible();
   const before=readState(page);await page.setViewportSize({width:844,height:390});
   await fits(page,'touch landscape');expect(readState(page)).toEqual(before);
   await page.locator('.flow-role-bar + [data-action="paired-switch"]').tap();
   await expect(page.locator('html')).toHaveAttribute('data-perspective',role==='public'?'garda':'public');
   expect(readState(page).answers).toEqual(before.answers);
   await page.setViewportSize({width:390,height:844});await fits(page,'touch portrait');
  }finally{await context.close();}
 });
}
