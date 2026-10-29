import {openNavigation} from './navigation.mjs';
import {test,expect} from '@playwright/test';
import {startEncounter,answer,switchRole,continueEncounter,stateHash,decodeState} from '../../encounters/engine.mjs';

const paths={public:'./',garda:'garda/'};
const cast={public:'public-2',garda:'garda-5'};
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{
  window.__lifecycleCues=[];
  const record=element=>{
   const kind=element.getAttribute?.('data-motion');
   if(kind)window.__lifecycleCues.push({kind,className:String(element.className),
    heading:element.querySelector?.('h2')?.textContent||''});
  };
  new MutationObserver(records=>{
   for(const mutation of records){
    if(mutation.type==='attributes')record(mutation.target);
    for(const node of mutation.addedNodes){
     if(node.nodeType!==1)continue;
     record(node);node.querySelectorAll('[data-motion]').forEach(record);
    }
   }
  }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-motion']});
 });
});
async function reset(page){
 await frames(page);
 await expect(page.locator('[data-motion]')).toHaveCount(0);
 await page.evaluate(()=>{window.__lifecycleCues=[];});
}
const events=page=>page.evaluate(()=>window.__lifecycleCues);
const kinds=async page=>(await events(page)).map(event=>event.kind);
function completedRoute(role){
 let state=startEncounter('public-street',role,{cast});
 for(let step=0;step<12&&!state.complete;step++){
  state=answer(state,0);state=switchRole(state);
  state=answer(state,0);state=switchRole(state);
  state=continueEncounter(state);
 }
 if(!state.complete)throw new Error('The lifecycle test route did not finish');
 return state;
}

for(const role of ['public','garda']){
 for(const action of ['paired-transfer','paired-character-transfer'])test(`${role}: ${action} retains the same scene and answer during a shared-mode transfer`,async({page})=>{
  await page.goto(paths[role]);
  await page.locator('.single-mode > summary').click();
  await page.locator('.single-mode [data-action="start"]').first().click();
  await page.locator('[data-action="choose"]').first().click();
  await expect(page.locator('#feedback')).toBeVisible();
  await reset(page);
  await page.locator('[data-action="'+action+'"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  await expect.poll(async()=>kinds(page)).toContain(action==='paired-transfer'?'perspective':'picker');
  await frames(page);
  expect(await kinds(page)).not.toContain('stage');
  expect(await kinds(page)).not.toContain('scene');
  expect(current(page).answers[role]).toBe(0);
  expect(current(page).history).toHaveLength(0);
  expect(current(page).role).toBe(action==='paired-transfer'?(role==='public'?'garda':'public'):role);
  if(action==='paired-character-transfer')await expect(page.locator('#character-picker-title')).toBeFocused();
 });

 test(`${role}: topic filters do not animate a redraw and reference groups reveal once per visit`,async({page})=>{
  await page.goto(paths[role]+'#encounters/'+role);
  await page.locator('.scenario-library > summary').click();
  await reset(page);
  await page.getByRole('button',{name:'Young people',exact:true}).click();
  await expect(page.locator('.encounter-card')).toHaveCount(2);
  await frames(page);
  expect(await kinds(page),'filtering changes results without replaying presentation cues').toEqual([]);
  await openNavigation(page);await page.locator('.header [data-nav="about"]').click();
  const group=page.locator('.content-page > .info-block').first();
  await group.scrollIntoViewIfNeeded();
  const heading=await group.locator('h2').textContent();
  await expect.poll(async()=>(await events(page)).some(event=>event.kind==='reveal'&&event.heading===heading)).toBe(true);
  await reset(page);
  await openNavigation(page);await page.locator('.header [data-nav="play"]').click();
  await openNavigation(page);await page.locator('.header [data-nav="about"]').click();
  await page.locator('.content-page > .info-block').first().scrollIntoViewIfNeeded();
  await frames(page);
  expect((await events(page)).some(event=>event.kind==='reveal'&&event.heading===heading),
   'returning to a reference group does not replay its reveal').toBe(false);
 });

 test(`${role}: recap cards and progress avoid replaying cues when controls redraw them`,async({page})=>{
  const complete=completedRoute(role);
  await page.goto(paths[role]+stateHash(complete));
  await expect(page.locator('.recap-takeaways')).toBeVisible();
  const card=page.locator('.paired-recap > .summary-item').first();
  await card.scrollIntoViewIfNeeded();
  const heading=await card.locator('h2').textContent();
  await expect.poll(async()=>(await events(page)).some(event=>event.kind==='recap'&&event.heading===heading)).toBe(true);
  await reset(page);
  await page.locator('[data-action="paired-characters"]').click();
  await page.locator('[data-action="paired-character-close"]').click();
  await page.locator('.paired-recap > .summary-item').first().scrollIntoViewIfNeeded();
  await frames(page);
  expect((await events(page)).some(event=>event.kind==='recap'&&event.heading===heading),
   'an already read recap card remains steady after a redraw').toBe(false);
  expect(current(page)).toEqual(complete);

  await reset(page);
  await openNavigation(page);await page.locator('.header [data-nav="progress"]').click();
  await expect(page.locator('.progress-page')).toBeVisible();
  await expect.poll(async()=>kinds(page)).toContain('progress');
  const before=await page.locator('.progress-page progress').evaluateAll(elements=>elements.map(element=>element.value));
  await reset(page);
  await page.locator('[data-action="paired-clear"]').click();
  await expect(page.locator('[data-action="paired-clear-cancel"]')).toBeVisible();
  await page.locator('[data-action="paired-clear-cancel"]').click();
  await frames(page);
  expect(await kinds(page),'opening and cancelling a confirmation does not reanimate unchanged progress').not.toContain('progress');
  expect(await page.locator('.progress-page progress').evaluateAll(elements=>elements.map(element=>element.value))).toEqual(before);
 });
}

test('Changing the system motion preference stops an active cue and retains the current answer',async({page})=>{
 await page.goto('./'+stateHash(startEncounter('public-street','public',{cast})));
 await expect(page.locator('.paired-game')).toBeVisible();
 await reset(page);
 await page.locator('[data-action="paired-answer"]').first().click();
 await expect(page.locator('#feedback')).toHaveAttribute('data-motion','feedback');
 const answered=current(page);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('[data-motion]')).toHaveCount(0);
 expect(await page.locator('#feedback').evaluate(element=>getComputedStyle(element).animationName)).toBe('none');
 expect(current(page)).toEqual(answered);
 await reset(page);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await frames(page);
 expect(await kinds(page),'turning motion back on does not replay an old event').toEqual([]);
 await page.locator('[data-action="paired-change"]').click();
 await page.locator('[data-action="paired-answer"]').first().click();
 await expect.poll(async()=>kinds(page)).toContain('feedback');
 expect(current(page)).toEqual(answered);
});
