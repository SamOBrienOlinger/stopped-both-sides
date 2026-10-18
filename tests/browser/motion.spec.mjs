import {test,expect} from '@playwright/test';
import {startEncounter,answer,continueEncounter,stateHash,decodeState} from '../../encounters/engine.mjs';
import {preferencesStorageKey} from '../../accessibility/preferences.mjs';

const paths={public:'./',garda:'garda/'};
const cast={public:'public-2',garda:'garda-5'};
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);

// Record short-lived cues without making tests depend on their duration or on
// animation events firing. Translation can replace whole subtrees, so inspect
// inserted elements as well as attributes set on existing elements.
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{
  window.__motionLog=[];
  const record=element=>{
   const kind=element.getAttribute?.('data-motion');
   if(kind)window.__motionLog.push({kind,id:element.id,className:String(element.className),
    animated:element.getAnimations({subtree:true}).some(animation=>animation.playState==='running')});
  };
  new MutationObserver(records=>{
   for(const mutation of records){
    if(mutation.type==='attributes')record(mutation.target);
    for(const node of mutation.addedNodes){
     if(node.nodeType!==1)continue;
     record(node);
     node.querySelectorAll('[data-motion]').forEach(record);
    }
   }
  }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-motion']});
 });
});

const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const cues=page=>page.evaluate(()=>window.__motionLog.map(event=>event.kind));
async function resetCues(page){
 await frames(page);
 await expect(page.locator('[data-motion]'),'motion cues clean up after each interaction').toHaveCount(0);
 await page.evaluate(()=>{window.__motionLog=[];});
}
async function hasCues(page,...expected){
 await expect.poll(()=>cues(page)).toEqual(expect.arrayContaining(expected));
 const styled=await page.evaluate(()=>window.__motionLog.filter(event=>event.animated).map(event=>event.kind));
 expect(styled,'event cues are connected to the motion stylesheet').toEqual(expect.arrayContaining(expected));
}

test('Pre-opened evidence details are not treated as a new disclosure interaction',async({page})=>{
 await page.goto('garda/#evidence/model');
 await expect(page.locator('.evidence-record[open]')).toHaveCount(1);
 const group=await page.locator('.evidence-record[open]').evaluate(element=>element.closest('.evidence-group').id);
 await expect(page.locator('.evidence-nav a[aria-current="location"]')).toHaveCount(1);
 await expect(page.locator('.evidence-nav a[aria-current="location"]')).toHaveAttribute('href','#evidence/'+group);
 await frames(page);
 expect(await cues(page)).not.toContain('disclosure');
});

test('The rights topic indicator follows the selected source section',async({page})=>{
 await page.goto('./#rights');
 const topic=page.locator('.source-topic-nav a').nth(1);
 const href=await topic.getAttribute('href');
 await topic.click();
 await expect(page.locator('.source-topic-nav a[aria-current="location"]')).toHaveCount(1);
 await expect(page.locator('.source-topic-nav a[aria-current="location"]')).toHaveAttribute('href',href);
 await page.locator('.header [data-nav="rights"]').click();
 await expect(page.locator('.source-topic-nav a[aria-current]')).toHaveCount(0);
});
async function noStageReplay(page){
 await frames(page);
 expect(await cues(page),'a redraw must not present the current stage as a new stage').not.toContain('stage');
}
async function focusedContentVisible(page){
 expect(await page.evaluate(()=>{
  const element=document.activeElement,box=element.getBoundingClientRect();
  const left=Math.max(0,box.left),right=Math.min(innerWidth,box.right);
  const top=Math.max(0,box.top),bottom=Math.min(innerHeight,box.bottom);
  if(right<=left||bottom<=top)return false;
  const front=document.elementFromPoint((left+right)/2,(top+bottom)/2);
  return front===element||element.contains(front);
 }),'focused game content is not hidden behind another surface').toBe(true);
}
async function readableLayout(page){
 const result=await page.evaluate(()=>({
  viewport:document.documentElement.clientWidth,
  width:document.documentElement.scrollWidth,
  clipped:[...document.querySelectorAll('h1,h2,p,.choice,.character-option,.settings-content')]
   .filter(element=>element.getClientRects().length&&element.scrollWidth>element.clientWidth+2)
   .map(element=>({element:element.tagName+'.'+element.className,text:element.textContent.slice(0,70)})),
  hiddenText:[...document.querySelectorAll('#scene-title,.choice,#feedback,.character-option')]
   .filter(element=>element.getClientRects().length)
   .filter(element=>{
    for(let node=element;node;node=node.parentElement){
     const style=getComputedStyle(node);
     if(style.visibility==='hidden'||Number(style.opacity)===0)return true;
    }
    return false;
   }).map(element=>element.id||element.className)
 }));
 expect(result.width,'the page does not scroll horizontally').toBeLessThanOrEqual(result.viewport+2);
 expect(result.clipped,'translated text is not clipped').toEqual([]);
 expect(result.hiddenText,'essential text and controls are never waiting invisibly for an animation').toEqual([]);
}
async function motionSuppressed(page){
 await frames(page);
 const moving=await page.locator('#main *,#reading-dialog,#reading-dialog *').evaluateAll(elements=>elements
  .filter(element=>element.getClientRects().length)
  .filter(element=>{
   const style=getComputedStyle(element);
   return style.animationName!=='none'||style.transitionDuration.split(',').some(value=>parseFloat(value)>0);
  }).map(element=>element.id||element.className));
 expect(moving,'reduced motion suppresses animations and transitions').toEqual([]);
}
async function answerImmediately(page,selector='[data-action="paired-answer"]'){
 // A hash may already describe the next stage while its hashchange render is
 // still queued. Start the synchronous assertion once its control is usable.
 await expect(page.locator(selector).first()).toBeEnabled();
 const snapshot=await page.locator(selector).first().evaluate(button=>{
  button.click();
  const feedback=document.querySelector('#feedback');
  return {focused:document.activeElement===feedback,hasText:!!feedback?.textContent.trim(),
   selected:document.querySelector('.choice[aria-pressed="true"]')!==null};
 });
 expect(snapshot,'answer state, feedback and focus update synchronously').toEqual({focused:true,hasText:true,selected:true});
}

for(const role of ['public','garda']){
 test(`${role}: motion follows stage, answer and perspective changes without delaying learning`,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(paths[role]+'#encounters/'+role);
  await expect(page.locator('.paired-picker')).toBeVisible();
  await resetCues(page);
  await page.locator('[data-action="paired-quick-start"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  await hasCues(page,'stage','scene');
  await readableLayout(page);

  await resetCues(page);
  await answerImmediately(page);
  await hasCues(page,'feedback');
  await noStageReplay(page);
  await focusedContentVisible(page);
  const answered=current(page);

  await resetCues(page);
  await page.locator('[data-action="paired-switch"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#choice-title')).toBeFocused();
  await hasCues(page,'perspective');
  await noStageReplay(page);
  expect(current(page).nodeId).toBe(answered.nodeId);
  expect(current(page).answers).toEqual(answered.answers);
  expect(current(page).role).not.toBe(answered.role);
  expect(await page.locator('#choice-title').evaluate(element=>getComputedStyle(element).outlineStyle)).not.toBe('none');
  await focusedContentVisible(page);

  await answerImmediately(page);
  await resetCues(page);
  const next=continueEncounter(current(page));
  await page.locator('[data-action="paired-next"]').click();
  await expect.poll(()=>current(page)).toEqual(next);
  await hasCues(page,...(next.complete?['recap']:['stage','scene']));
  for(let step=0;step<12&&!current(page).complete;step++){
   if(current(page).answers[current(page).role]===null)await answerImmediately(page);
   await resetCues(page);
   await page.locator('[data-action="paired-next"]').click();
   await expect.poll(()=>current(page).complete||current(page).answers[current(page).role]===null).toBe(true);
  }
  expect(current(page).complete).toBe(true);
  await hasCues(page,'recap');
  expect(await page.evaluate(()=>window.__motionLog.some(event=>event.kind==='recap'&&event.className.includes('recap-takeaways'))),
   'the recap introduction highlights the learning takeaways').toBe(true);
  await expect(page.locator('.recap-takeaways')).toBeVisible();
  await readableLayout(page);
  expect(errors).toEqual([]);
 });

 test(`${role}: character, language and reading redraws preserve state without replaying the stage`,async({page})=>{
  const initial=answer(startEncounter('public-street',role,{cast}),0);
  await page.goto(paths[role]+stateHash(initial));
  await expect(page.locator('#feedback')).toBeVisible();
  await resetCues(page);
  await page.locator('.play-help > summary').click();
  await hasCues(page,'disclosure');
  await resetCues(page);

  await page.locator('#language-settings-trigger').click();
  await expect(page.locator('#reading-title')).toBeFocused();
  await hasCues(page,'dialog');
  await page.locator('#reading-language').selectOption('ga');
  await page.locator('#reading-size').selectOption('150');
  await page.locator('[name="spacing"]').check();
  await resetCues(page);
  await page.locator('#reading-form [type="submit"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang','ga');
  await expect(page.locator('#language-settings-trigger')).toBeFocused();
  await expect(page.locator('.play-help')).toHaveAttribute('open','');
  expect(current(page)).toEqual(initial);
  await noStageReplay(page);
  expect(await cues(page),'restoring an open disclosure is not a new interaction').not.toContain('disclosure');

  await resetCues(page);
  await page.locator('[data-action="paired-characters"]').click();
  await expect(page.locator('#character-picker-title')).toBeFocused();
  await hasCues(page,'picker');
  await noStageReplay(page);
  await resetCues(page);
  const chosen=role==='public'?'public-3':'garda-3';
  await page.locator('[data-character="'+chosen+'"]').click();
  await expect(page.locator('[data-character="'+chosen+'"]').first()).toBeFocused();
  await noStageReplay(page);
  expect(await cues(page),'choosing a character does not reopen the picker').not.toContain('picker');
  expect(current(page).cast[role]).toBe(chosen);
  expect(current(page).answers).toEqual(initial.answers);
  expect(current(page).history).toEqual(initial.history);
  expect(current(page).nodeId).toBe(initial.nodeId);
  await page.locator('[data-action="paired-character-close"]').click();
  await expect(page.locator('[data-action="paired-characters"]')).toBeFocused();
  await noStageReplay(page);
  await readableLayout(page);
 });

 for(const preference of ['system','site'])test(`${role}: ${preference} reduced motion keeps Arabic play usable on a narrow screen`,async({page},testInfo)=>{
  const width=preference==='system'?320:390;
  await page.setViewportSize({width,height:844});
  if(preference==='system')await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(({key,site})=>{
   localStorage.setItem(key,JSON.stringify({language:'ar',size:150,contrast:'high',spacing:true,motion:site}));
   if(site){HTMLDialogElement.prototype.showModal=undefined;HTMLDialogElement.prototype.close=undefined;}
  },{key:preferencesStorageKey(role),site:preference==='site'});
  await page.goto(paths[role]+stateHash(startEncounter('public-street',role,{cast})));
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await expect(page.locator('html')).toHaveClass(/contrast-high/);
  expect(await page.locator('html').evaluate(element=>element.style.getPropertyValue('--reading-size'))).toBe('150%');
  await expect(page.locator('#main')).toHaveAttribute('dir','rtl');
  await expect(page.locator('[data-action="paired-answer"]').first()).toBeEnabled();
  await readableLayout(page);await motionSuppressed(page);
  await answerImmediately(page);
  await readableLayout(page);await motionSuppressed(page);
  const answered=current(page);
  await page.locator('[data-action="paired-switch"]').click();
  await expect(page.locator('#choice-title')).toBeFocused();
  expect(current(page).answers).toEqual(answered.answers);
  await readableLayout(page);await motionSuppressed(page);
  await page.locator('[data-action="paired-characters"]').click();
  await expect(page.locator('#character-picker-title')).toBeFocused();
  await readableLayout(page);await motionSuppressed(page);
  await page.locator('[data-action="paired-character-close"]').click();
  await page.locator('#language-settings-trigger').click();
  await expect(page.locator('#reading-title')).toBeFocused();
  if(preference==='site')await expect(page.locator('#reading-dialog')).toHaveAttribute('data-dialog-fallback','');
  await readableLayout(page);await motionSuppressed(page);
  const targets=await page.locator('#reading-dialog button,#reading-dialog select,#reading-dialog .settings-check').evaluateAll(elements=>elements.map(element=>{
   const box=element.getBoundingClientRect();return {width:box.width,height:box.height};
  }));
  for(const box of targets){expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
  await page.keyboard.press('Escape');
  await expect(page.locator('#reading-dialog')).not.toBeVisible();
  await expect(page.locator('#language-settings-trigger')).toBeFocused();
  expect(current(page).answers).toEqual(answered.answers);
  await answerImmediately(page);
  await page.locator('[data-action="paired-next"]').click();
  await expect.poll(()=>current(page).nodeId).not.toBe(answered.nodeId);
  await readableLayout(page);await motionSuppressed(page);
  await page.screenshot({path:testInfo.outputPath(`${role}-${preference}-arabic-${width}.png`),fullPage:true});
 });

 test(`${role}: original practice also cues feedback and the next scene`,async({page})=>{
  await page.goto(paths[role]);
  await page.locator('.single-mode > summary').click();
  await resetCues(page);
  await page.locator('.single-mode [data-action="start"]').first().click();
  await expect(page.locator('#scene-title')).toBeVisible();
  await hasCues(page,'stage','scene');
  const title=await page.locator('#scene-title').textContent();
  await resetCues(page);
  await answerImmediately(page,'[data-action="choose"]');
  await hasCues(page,'feedback');
  await noStageReplay(page);
  await resetCues(page);
  await page.locator('[data-action="next"]').click();
  await expect(page.locator('#scene-title')).not.toHaveText(title);
  await hasCues(page,'stage','scene');
  await readableLayout(page);
 });
}
