import {test,expect} from '@playwright/test';
import {languages} from '../../locales/languages.mjs';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=pedagogy-1';
import {startEncounter,answer,switchRole,continueEncounter,stateHash,decodeState} from '../../encounters/engine.mjs';
import {progressStorageKey} from '../../encounters/progress.mjs';
import {expectControlsFit} from './control-layout.mjs';

const added=languages.filter(language=>!['en','ga'].includes(language.id));
await Promise.all(added.map(language=>loadLanguage(language.id)));
const paths={public:'./',garda:'garda/'};
const cast={public:'public-2',garda:'garda-5'};
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const saved=(page,role)=>page.evaluate(key=>localStorage.getItem(key),progressStorageKey(role));
async function openSettings(page,footer=false){
 await page.locator(footer?'#language-settings-footer':'#language-settings-trigger').click();
 await expect(page.locator('#reading-dialog')).toBeVisible();
 await expect(page.locator('#reading-title')).toBeFocused();
 await expect(page.locator('#reading-language')).toHaveAttribute('aria-describedby','language-instructions language-help translation-help');
}
async function applyLanguage(page,language,{large=false,footer=false}={}){
 await openSettings(page,footer);
 await page.locator('#reading-language').selectOption(language);
 if(large){
  await page.locator('#reading-size').selectOption('150');
  await page.locator('#reading-contrast').selectOption('high');
  await page.locator('[name="spacing"]').check();
  await page.locator('[name="motion"]').check();
 }
 await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('html')).toHaveAttribute('lang',languages.find(x=>x.id===language).tag);
 await expect(page.locator('#reading-dialog')).not.toBeVisible();
 await expect(page.locator(footer?'#language-settings-footer':'#language-settings-trigger')).toBeFocused();
}
async function fits(page,label){
 const measure=await page.evaluate(()=>({
  width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
  clipped:[...document.querySelectorAll('h1,h2,p,.choice,.scenario,.story,.info-block,.settings-content,.character-option,.recap-role')]
   .filter(el=>el.getClientRects().length&&el.scrollWidth>el.clientWidth+2)
   .map(el=>({element:el.tagName+'.'+el.className,text:el.textContent.slice(0,60),width:el.clientWidth,content:el.scrollWidth}))
 }));
 expect(measure.scroll,label).toBeLessThanOrEqual(measure.width+2);
 expect(measure.clipped,label).toEqual([]);
 await expectControlsFit(page,label);
}
async function holdInitialArabic(page){
 const initial=answer(startEncounter('public-search','public',{cast}),0);
 let release,held=false;
 await page.route('**/ar-content.mjs*',async route=>{held=true;await new Promise(resolve=>{release=resolve;});await route.continue();});
 await page.goto('./?lang=ar'+stateHash(initial),{waitUntil:'commit'});
 await expect.poll(()=>held).toBe(true);
 return {initial,async release(){
  const response=page.waitForResponse(response=>response.url().includes('/ar-content.mjs'));
  release();await response;
  await page.waitForFunction(async()=>{const module=await import(new URL('locales/translate.mjs?v=pedagogy-1',document.baseURI));return module.languageLoaded('ar');});
 }};
}

for(const role of ['public','garda'])for(const language of added){
 test(`${role}/${language.id}: language is explicit, accessible and preserves a live game and its references`,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  const initial=answer(switchRole(answer(startEncounter('public-search','public',{cast}),0),'garda'),1);
  await page.goto(paths[role]+stateHash(initial));
  await expect(page.locator('#feedback')).toBeVisible();
  const before=current(page),record=await saved(page,role);
  await openSettings(page);
  const select=page.getByRole('combobox',{name:'Language',exact:true});
  await expect(select.locator('option')).toHaveCount(9);
  await expect(select.locator(`option[value="${language.id}"]`)).toHaveAttribute('lang',language.tag);
  await expect(select.locator(`option[value="${language.id}"]`)).toHaveAttribute('dir',language.dir);
  await select.selectOption(language.id);
  // A native change event never navigates or applies a language by itself.
  await expect(page.locator('html')).toHaveAttribute('lang','en-IE');
  expect(current(page)).toEqual(before);
  await page.locator('#reading-size').selectOption('150');
  await page.locator('[name="spacing"]').check();
  await page.locator('#reading-contrast').selectOption('high');
  await page.locator('#reading-form [type="submit"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang',language.tag);
  await expect(page.locator('html')).toHaveAttribute('dir',language.dir);
  await expect(page.locator('#main')).toHaveAttribute('lang',language.tag);
  await expect(page.locator('#main')).toHaveAttribute('dir',language.dir);
  await expect(page.locator('#reading-dialog')).not.toBeVisible();
  await expect(page.locator('#language-settings-trigger')).toBeFocused();
  await expect(page.locator('#page-status')).toHaveText(translateText('Language changed. Your progress is unchanged.',language.id));
  expect(current(page)).toEqual(before);expect(await saved(page,role)).toEqual(record);
  await expect(page.locator('.story-text')).toContainText('Noor');
  await expect(page.locator('[data-cast-role="public"] strong')).toHaveText('Noor');
  await expect(page.locator('[data-cast-role="garda"] strong')).toHaveText('Aisling');
  if(language.id==='ar'){
   const ratio=page.locator('.role-score strong bdi').first();
   await expect(ratio).toHaveCSS('direction','ltr');
   await expect(ratio).toHaveCSS('unicode-bidi','isolate');
  }
  await expect(page.locator('#language-settings-trigger')).toHaveText(translateText('Language & reading',language.id));
  await expect(page.locator('.header nav')).toHaveAttribute('aria-label',translateText('Main navigation',language.id));
  await fits(page,'translated feedback at 150%');
  await openSettings(page);await fits(page,'translated dialog at 150%');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(()=>!!document.activeElement.closest('#reading-dialog'))).toBe(true);
  await page.keyboard.press('Shift+Tab');await page.keyboard.press('Escape');
  await expect(page.locator('#reading-dialog')).not.toBeVisible();
  await expect(page.locator('#language-settings-trigger')).toBeFocused();
  expect(current(page)).toEqual(before);
  await page.locator('[data-action="paired-characters"]').click();
  await expect(page.locator('[data-character="garda-5"]')).toHaveAttribute('aria-label',translateText('Choose character: Aisling',language.id));
  await page.locator('[data-action="paired-character-close"]').click();
  for(const target of ['about','accessibility',role==='public'?'rights':'evidence','progress']){
   await page.evaluate(hash=>{location.hash=hash;},target);
   await expect(page.locator('#main h1')).toBeVisible();
   await expect(page.locator('#main')).toHaveAttribute('lang',language.tag);
   await expect(page.locator('#main')).toHaveAttribute('dir',language.dir);
   if(target==='accessibility')await expect(page.locator('#main h1')).toHaveText(translateText('Learn at your own pace.',language.id));
   await fits(page,target+' at 150%');
  }
  await page.evaluate(hash=>{location.hash=hash;},stateHash(before));
  await expect(page.locator('.paired-game')).toBeVisible();expect(current(page)).toEqual(before);
  await page.locator('[data-site-switch]').click();
  await expect(page.locator('.session-return a')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang',language.tag);
  const publication=page.locator('[data-no-translate][lang="en-IE"]').filter({hasText:/Citizens Information|Misuse of Drugs|Policing/}).first();
  await expect(publication).toBeAttached();
  await page.locator('.session-return a').click();
  await expect(page.locator('.paired-game')).toBeVisible();expect(current(page)).toEqual(before);
  await page.reload();await expect(page.locator('.paired-game')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang',language.tag);expect(current(page)).toEqual(before);
  await applyLanguage(page,'en',{footer:true});
  expect(current(page)).toEqual(before);
  await expect(page.locator('html')).toHaveAttribute('dir','ltr');
  await expect(page.locator('.story-text')).toContainText('Noor');
  expect(errors).toEqual([]);
 });
}

for(const role of ['public','garda'])test(`${role}: original mode and completed recaps retain their controls in all seven languages`,async({page})=>{
 await page.goto(paths[role]+'#scenario/street');
 await expect(page.locator('.story')).toBeVisible();
 await page.locator('[data-action="choose"]').nth(1).click();
 const hash=new URL(page.url()).hash;
 for(const language of added){
  await applyLanguage(page,language.id);
  expect(new URL(page.url()).hash).toBe(hash);
  await expect(page.locator('.choice.selected')).toHaveCount(1);
  await expect(page.locator('#feedback')).toBeVisible();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
 }
 await page.locator('[data-action="next"]').click();
 expect(new URL(page.url()).hash).toBe(hash);
 await expect(page.locator('.choice.selected')).toHaveCount(0);
 let complete=startEncounter(role+'-street',role,{cast});
 while(!complete.complete)complete=continueEncounter(answer(complete,0));
 await page.evaluate(hash=>{location.hash=hash;},stateHash(complete));
 await expect(page.locator('.paired-recap')).toBeVisible();
 await page.locator('.recap-detail').first().locator(':scope > summary').click();
 for(const language of added){
  await applyLanguage(page,language.id);
  expect(current(page)).toEqual(complete);
  await expect(page.locator('.recap-detail').first()).toHaveAttribute('open','');
  await expect(page.locator('[data-action="paired-revisit"]').first()).toBeVisible();
  await expect(page.locator('.paired-recap')).toContainText('Noor');
 }
 await page.locator('[data-action="paired-revisit"]').first().click();
 await expect(page.locator('.paired-game')).toBeVisible();
 expect(current(page).cast).toEqual(cast);expect(current(page).complete).toBe(false);
});

for(const language of ['ar','zh-Hans'])for(const width of [320,1366])test(`${language}: layout, text spacing and targets at ${width}px`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:width===320?568:900});
 await page.goto('./');await expect(page.locator('.brand-intro')).toBeVisible();
 await applyLanguage(page,language,{large:true});
 await fits(page,'home');
 await page.locator('.single-mode summary').click();await fits(page,'original cards');
 await page.locator('.header [data-nav="encounters"]').click();
 await expect(page.locator('.paired-picker')).toBeVisible();
 await page.locator('.scenario-library summary').click();await fits(page,'catalogue');
 const first=page.locator('[data-action="paired-start"]').first();
 expect(await first.getAttribute('aria-label')).toContain(translateText('Play this situation',language));
 await first.click();await expect(page.locator('.paired-game')).toBeVisible();
 await page.locator('[data-action="paired-answer"]').first().click();await fits(page,'game');
 if(width===320){
  const actions=page.locator('.play-toolbar .character-actions');
  const available=(await actions.boundingBox()).width;
  for(const button of await actions.locator(':scope > button').all())expect((await button.boundingBox()).width).toBeGreaterThanOrEqual(available-2);
  const castGroup=page.locator('.play-toolbar~.encounter-cast'),castWidth=(await castGroup.boundingBox()).width;
  const names=await castGroup.locator('.cast-character').evaluateAll(els=>els.map(el=>{const name=el.querySelector('strong'),style=getComputedStyle(name);return {width:el.getBoundingClientRect().width,height:name.getBoundingClientRect().height,lineHeight:parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.5};}));
  for(const name of names){expect(name.width).toBeGreaterThanOrEqual(castWidth-2);expect(name.height).toBeLessThanOrEqual(name.lineHeight*1.5);}
 }
 for(const scene of await page.locator('.encounter-scene:visible').all()){
  await scene.scrollIntoViewIfNeeded();
  await expect.poll(()=>scene.locator('img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
  expect(await scene.evaluate(el=>{const stage=el.querySelector('.scene-stage').getBoundingClientRect();return [...el.querySelectorAll('.scene-actor')].every(actor=>{const box=actor.getBoundingClientRect();return box.left>=stage.left-1&&box.right<=stage.right+1&&box.top>=stage.top-1&&box.bottom<=stage.bottom+1;});})).toBe(true);
  const publicCaption=await scene.locator('.scene-cast-names>[data-role-tone="public"]').boundingBox();
  const gardaCaption=await scene.locator('.scene-cast-names>[data-role-tone="garda"]').boundingBox();
  const publicActor=await scene.locator('[data-scene-role="public"]').boundingBox();
  const gardaActor=await scene.locator('[data-scene-role="garda"]').boundingBox();
  expect(publicCaption.x,'Public caption follows the public figure on the left').toBeLessThan(gardaCaption.x);
  expect(publicActor.x,'Artwork keeps its original public/Garda placement').toBeLessThan(gardaActor.x);
 }
 await page.screenshot({path:testInfo.outputPath(`${language}-${width}-feedback.png`),fullPage:true});
 await openSettings(page);await fits(page,'dialog');
 const targets=await page.locator('#reading-dialog button,#reading-dialog select,#reading-dialog .settings-check').evaluateAll(els=>els.map(el=>({text:el.textContent.slice(0,40),width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})));
 for(const target of targets){expect(target.width,target.text).toBeGreaterThanOrEqual(44);expect(target.height,target.text).toBeGreaterThanOrEqual(44);}
 await page.screenshot({path:testInfo.outputPath(`${language}-${width}-settings.png`)});
});

test('A failed language download keeps the current game and allows a successful retry',async({page})=>{
 await page.goto('./'+stateHash(answer(startEncounter('public-search','public',{cast}),0)));
 await expect(page.locator('#feedback')).toBeVisible();
 const before=current(page),record=await saved(page,'public');
 await page.route('**/fr-content.mjs*',route=>route.abort());
 await openSettings(page);await page.locator('#reading-language').selectOption('fr');
 await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('#reading-status')).toContainText('The language could not be loaded.');
 await expect(page.locator('html')).toHaveAttribute('lang','en-IE');
 expect(current(page)).toEqual(before);expect(await saved(page,'public')).toEqual(record);
 await expect(page.locator('#reading-form [type="submit"]')).toBeEnabled();
 await page.unroute('**/fr-content.mjs*');
 await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('html')).toHaveAttribute('lang','fr');
 await expect(page.locator('#reading-dialog')).not.toBeVisible();expect(current(page)).toEqual(before);
});

test('In-page settings controls regain focus after their translated page is rebuilt',async({page})=>{
 await page.goto('./#accessibility');
 const pageButton=page.locator('#language-settings-page');
 await pageButton.click();await page.locator('#reading-language').selectOption('es');
 await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('html')).toHaveAttribute('lang','es');
 await expect(pageButton).toBeFocused();
 await applyLanguage(page,'ga');
 await page.evaluate(()=>{location.hash='encounters';});
 const noteButton=page.locator('#language-settings-irish-note');
 await noteButton.click();await page.locator('#reading-size').selectOption('150');
 await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('#reading-dialog')).not.toBeVisible();
 await expect(noteButton).toBeFocused();await expect(page.locator('html')).toHaveAttribute('lang','ga');
});

test('An unavailable initial language shows a visible recovery notice and retains the saved route',async({page})=>{
 const initial=answer(startEncounter('public-search','public',{cast}),0);
 await page.route('**/fr-content.mjs*',route=>route.abort());
 await page.goto('./?lang=fr'+stateHash(initial));
 await expect(page.locator('.paired-game')).toBeVisible();
 await expect(page.locator('.translation-note')).toContainText('The language could not be loaded.');
 await expect(page.locator('html')).toHaveAttribute('lang','en-IE');expect(current(page)).toEqual(initial);
 await page.unroute('**/fr-content.mjs*');
 await applyLanguage(page,'fr');
 await expect(page.locator('.translation-note')).toHaveCount(0);expect(current(page)).toEqual(initial);
});

test('An open settings dialog retains its language, draft controls and focus during initial language loading',async({page})=>{
 const startup=await holdInitialArabic(page);
 await openSettings(page);
 await expect(page.locator('#reading-dialog')).toHaveAttribute('lang','en-IE');
 await expect(page.locator('#reading-dialog')).toHaveAttribute('dir','ltr');
 await expect(page.locator('#reading-language')).toHaveValue('ar');
 await page.locator('#reading-size').selectOption('150');
 await page.locator('#reading-contrast').selectOption('high');
 await page.locator('[name="spacing"]').check();
 await page.locator('[name="motion"]').check();
 await page.locator('#reading-size').focus();
 await startup.release();
 await expect(page.locator('.paired-game')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await expect(page.locator('#reading-dialog')).toHaveAttribute('lang','en-IE');
 await expect(page.locator('#reading-dialog')).toHaveAttribute('dir','ltr');
 await expect(page.locator('#reading-title')).toHaveText('Language & reading');
 await expect(page.locator('#reading-language')).toHaveValue('ar');
 await expect(page.locator('#reading-size')).toHaveValue('150');
 await expect(page.locator('#reading-size')).toBeFocused();
 await expect(page.locator('#reading-contrast')).toHaveValue('high');
 await expect(page.locator('[name="spacing"]')).toBeChecked();
 await expect(page.locator('[name="motion"]')).toBeChecked();
 expect(current(page)).toEqual(startup.initial);
 const record=await saved(page,'public');
 await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('#reading-dialog')).not.toBeVisible();
 await expect(page.locator('#language-settings-trigger')).toBeFocused();
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('html')).toHaveCSS('--reading-size','150%');
 await expect(page.locator('html')).toHaveClass(/contrast-high/);
 await expect(page.locator('html')).toHaveClass(/reading-spacious/);
 await expect(page.locator('html')).toHaveClass(/motion-reduce/);
 expect(current(page)).toEqual(startup.initial);expect(await saved(page,'public')).toEqual(record);
 await openSettings(page);
 await expect(page.locator('#reading-dialog')).toHaveAttribute('lang','ar');
 await expect(page.locator('#reading-dialog')).toHaveAttribute('dir','rtl');
 await expect(page.locator('#reading-title')).toHaveText(translateText('Language & reading','ar'));
});

for(const fallback of [false,true])for(const timing of ['before','after'])for(const closeWith of ['Cancel','Escape'])test(`${closeWith} ${timing} initial loading retains the requested language (${fallback?'fallback':'native'} dialog)`,async({page})=>{
 if(fallback)await page.addInitScript(()=>{HTMLDialogElement.prototype.showModal=undefined;HTMLDialogElement.prototype.close=undefined;});
 const startup=await holdInitialArabic(page);
 await openSettings(page,true);
 await page.locator('#reading-size').selectOption('150');
 if(timing==='after')await startup.release();
 if(closeWith==='Escape')await page.keyboard.press('Escape');
 else await page.locator('#reading-dialog .settings-actions [data-reading-close]').click();
 await expect(page.locator('#reading-dialog')).not.toBeVisible();
 await expect(page.locator('#language-settings-footer')).toBeFocused();
 if(timing==='before')await startup.release();
 await expect(page.locator('.paired-game')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('#main')).toHaveAttribute('lang','ar');
 await expect(page.locator('#language-settings-footer')).toBeFocused();
 await expect(page.locator('html')).toHaveCSS('--reading-size','100%');
 expect(current(page)).toEqual(startup.initial);
});

for(const chosen of ['en','fr'])test(`An explicit ${chosen} preference takes precedence over a late initial language download`,async({page})=>{
 const startup=await holdInitialArabic(page);
 await openSettings(page);
 await page.locator('#reading-language').selectOption(chosen);
 await page.locator('#reading-size').selectOption('150');
 await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('#reading-dialog')).not.toBeVisible();
 const tag=languages.find(language=>language.id===chosen).tag;
 await expect(page.locator('html')).toHaveAttribute('lang',tag);
 const record=await saved(page,'public');
 await startup.release();
 await expect(page.locator('html')).toHaveAttribute('lang',tag);
 await expect(page.locator('#main')).toHaveAttribute('lang',tag);
 await expect(page.locator('html')).toHaveCSS('--reading-size','150%');
 await expect(page.locator('#language-settings-trigger')).toBeFocused();
 expect(new URL(page.url()).searchParams.get('lang')).toBe(chosen);
 expect(current(page)).toEqual(startup.initial);expect(await saved(page,'public')).toEqual(record);
 await openSettings(page);await expect(page.locator('#reading-language')).toHaveValue(chosen);
});

for(const fallback of [false,true])test(`Closing settings cancels a pending language change (${fallback?'fallback':'native'} dialog)`,async({page})=>{
 if(fallback)await page.addInitScript(()=>{HTMLDialogElement.prototype.showModal=undefined;HTMLDialogElement.prototype.close=undefined;});
 await page.goto('./'+stateHash(answer(startEncounter('public-search','public',{cast}),0)));
 await expect(page.locator('#feedback')).toBeVisible();
 const before=current(page),record=await saved(page,'public');let release,held=false;
 await page.route('**/fr-content.mjs*',async route=>{held=true;await new Promise(resolve=>{release=resolve;});await route.continue();});
 await openSettings(page);await page.locator('#reading-language').selectOption('fr');
 await page.locator('#reading-form [type="submit"]').focus();
 await page.locator('#reading-form [type="submit"]').click();
 await expect.poll(()=>held).toBe(true);await expect(page.locator('#reading-status')).toContainText('Loading');
 expect(await page.locator('#reading-status').evaluate(status=>status.closest('[aria-busy="true"]')===null)).toBe(true);
 await expect(page.locator('#reading-form [type="submit"]')).toBeDisabled();
 await expect(page.locator('#reading-dialog .settings-actions [data-reading-close]')).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.locator('#reading-dialog')).not.toBeVisible();
 const loaded=page.waitForResponse(response=>response.url().includes('/fr-content.mjs'));release();await loaded;
 // Wait for the caught import promise and its cancellation guard to settle.
 await page.waitForFunction(async()=>{const module=await import(new URL('locales/translate.mjs?v=pedagogy-1',document.baseURI));return module.languageLoaded('fr');});
 await expect(page.locator('html')).toHaveAttribute('lang','en-IE');
 await expect(page.locator('#language-settings-trigger')).toBeFocused();
 expect(current(page)).toEqual(before);expect(await saved(page,'public')).toEqual(record);
});
