import {test,expect} from '@playwright/test';
import {decodeState} from '../../encounters/engine.mjs';

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
}
async function settings(page){
 await page.locator('.header [data-reading-open]').click();
 await expect(page.locator('#reading-dialog')).toBeVisible();
 await expect(page.locator('#reading-title')).toBeFocused();
}
async function checkHeroControls(page){
 await expect(page.locator('.perspective-hero')).toHaveCount(2);
 await expect.poll(()=>page.locator('.perspective-hero img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
 const measurements=await page.locator('.perspective-hero').evaluateAll(cards=>cards.map(card=>{
  const img=card.querySelector('img'),image=img.getBoundingClientRect();
  const link=card.querySelector('a'),button=link.getBoundingClientRect();
  return {centre:Math.abs(button.x+button.width/2-image.x-image.width/2),
   inside:button.x>=image.x&&button.right<=image.right,
   above:button.bottom<=image.y+1,
   buttonX:button.x,buttonRight:button.right,height:button.height,width:button.width,
   clipped:link.scrollWidth>link.clientWidth+1||link.scrollHeight>link.clientHeight+1,
   x:image.x,y:image.y,imageRight:image.right,imageHeight:image.height,
   imageWidth:image.width,sourceRatio:img.naturalWidth/img.naturalHeight,
   displayedRatio:image.width/image.height,fit:getComputedStyle(img).objectFit};
 }));
 for(const result of measurements){
  expect(result.centre,'perspective control stays horizontally centred').toBeLessThanOrEqual(1);
  expect(result.above,'controls must never cover the scene artwork').toBe(true);
  expect(result.inside,'control stays within its column').toBe(true);
  expect(result.height,'touch target height').toBeGreaterThanOrEqual(48);
  expect(result.width,'touch target width').toBeGreaterThanOrEqual(44);
  expect(result.clipped,'translated control text must not clip').toBe(false);
  expect(result.fit,'show the full source scene, not a portrait crop').toBe('contain');
  expect(Math.abs(result.displayedRatio-result.sourceRatio),'preserve the source image proportions').toBeLessThan(.01);
 }
 expect(measurements[0].buttonRight,'role links never overlap').toBeLessThanOrEqual(measurements[1].buttonX);
 expect(Math.abs(measurements[0].y-measurements[1].y),'both scenes stay level at every viewport').toBeLessThanOrEqual(1);
 expect(Math.abs(measurements[0].imageWidth-measurements[1].imageWidth),'both scenes get equal space').toBeLessThanOrEqual(1);
 expect(measurements[1].x-measurements[0].imageRight,'a visible gutter prevents one scene obscuring the other').toBeGreaterThanOrEqual(4);
 await expect(page.locator('.brick-cloud')).toHaveCount(0);
}
async function captureHero(page,role,width,state,testInfo){
 if(![390,768,1366].includes(width))return;
 await testInfo.attach(`hero-${role}-${width}-${state}`,{
  body:await page.locator('.overlapping-heroes').screenshot({animations:'disabled'}),
  contentType:'image/png'
 });
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
 await expect(page.locator('.header [data-reading-open]')).toBeFocused();
}
async function chooseFirst(page,role){
 await page.locator('.header [data-nav="encounters"]').click();
 await expect(page.locator('.encounter-card')).toHaveCount(14);
 await page.locator('.setup-role summary').click();
 await page.locator(`.role-picker a[href="#encounters/${role}"]`).click();
 await expect(page.locator('.character-option')).toHaveCount(0);
 await fits(page,'simple setup');
 await page.locator('[data-action="paired-setup-characters"]').click();
 await expect(page.locator('.character-option')).toHaveCount(9);await fits(page,'character picker');
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
   await page.locator('.single-mode summary').click();await fits(page,'original situations');
   await page.locator('.single-mode [data-action="start"]').first().click();
   await expect(page.locator('.story')).toBeVisible();
   await page.locator('[data-action="choose"]').first().click();
   await expect(page.locator('#feedback')).toBeVisible();await fits(page,'original practice feedback');
   await chooseFirst(page,role);await fits(page,'shared situation');
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
   await page.locator('[data-action="paired-characters"]').click();
   await expect(page.locator('#character-picker-title')).toBeFocused();
   await expect(page.locator('.character-option')).toHaveCount(9);await fits(page,'large Irish character picker');
   await page.locator('[data-action="paired-character-close"]').click();
   await expect(page.locator('[data-action="paired-characters"]')).toBeFocused();
   await page.locator('.perspective-bar [data-action="paired-switch"]').click();
   await expect(page.locator('html')).toHaveAttribute('data-perspective',role==='public'?'garda':'public');
   await fits(page,'other perspective');
   await checkDialog(page);
   await page.locator('.header [data-nav="play"]').click();await ready(page);await fits(page,'large Irish home');await checkHeroControls(page);
   await captureHero(page,role,width,'large-text',testInfo);
   await expect(page.locator('.perspective-button-label').first()).toHaveText('Dearcadh an phobail');
   await expect(page.locator('.perspective-button-label').last()).toHaveText('Dearcadh an Gharda');
   for(const target of ['encounters','progress','about',role==='public'?'rights':'evidence']){
    await page.locator(`.header [data-nav="${target}"]`).click();await ready(page);await fits(page,target);
   }
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
  await page.locator('[data-site-switch]').click();
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
  for(let stage=0;stage<10&&!readState(page).complete;stage++){
   if(readState(page).answers[readState(page).role]===null)await page.locator('[data-action="paired-answer"]').first().click();
   await page.locator('[data-action="paired-next"]').click();
   await expect.poll(()=>readState(page).complete||readState(page).answers[readState(page).role]===null).toBe(true);
  }
  expect(readState(page).complete).toBe(true);
  await expect(page.locator('.paired-recap')).toBeVisible();await fits(page,'Irish recap');
  await page.locator('.header [data-nav="progress"]').click();
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
   await page.locator(`.paired-entry a[href="#encounters/${role}"]`).tap();
   await expect(page.locator('.encounter-card')).toHaveCount(14);
   await page.locator('[data-action="paired-quick-start"]').tap();
   await expect(page.locator('.paired-game')).toBeVisible();
   await page.locator('[data-action="paired-answer"]').first().tap();
   await expect(page.locator('#feedback')).toBeVisible();
   const before=readState(page);await page.setViewportSize({width:844,height:390});
   await fits(page,'touch landscape');expect(readState(page)).toEqual(before);
   await page.locator('.perspective-bar [data-action="paired-switch"]').tap();
   await expect(page.locator('html')).toHaveAttribute('data-perspective',role==='public'?'garda':'public');
   expect(readState(page).answers).toEqual(before.answers);
   await page.setViewportSize({width:390,height:844});await fits(page,'touch portrait');
  }finally{await context.close();}
 });
}
