import {openNavigation} from './navigation.mjs';
import {test,expect} from '@playwright/test';
import {startEncounter,answer,switchRole,continueEncounter,stateHash,decodeState} from '../../encounters/engine.mjs?v=scene-review-1';

const paths={public:'./',garda:'garda/'};
const cast={public:'public-2',garda:'garda-5'};
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function revealsReady(page){
 await frames(page);
 await expect(page.locator('#main')).not.toHaveAttribute('data-motion','page');
 await frames(page);
}
async function recordOpacity(target,kind,includePending=false){
 await target.evaluate((element,{kind,includePending})=>{
  window.__opacityTrace=new Promise(resolve=>{
   const samples=[],startedAt=performance.now();let active=false;
   const sample=()=>{
    const cue=element.getAttribute('data-motion'),pending=element.hasAttribute('data-reveal-pending');
    const style=getComputedStyle(element),opacity=Number(style.opacity),time=performance.now();
    if(cue===kind)active=true;
    if(active||includePending)samples.push({time,opacity,cue,pending,transform:style.transform});
    if(active&&cue!==kind&&!pending&&opacity===1){resolve({complete:true,samples});return;}
    if(time-startedAt>8000){resolve({complete:false,samples});return;}
    requestAnimationFrame(sample);
   };
   sample();
  });
 },{kind,includePending});
}
function expectPerceptibleFade(trace,kind,maximumStart,minimumElapsed){
 expect(trace.complete,'the cue reaches full opacity and removes its temporary state').toBe(true);
 const active=trace.samples.filter(sample=>sample.cue===kind),final=trace.samples.at(-1);
 expect(active.length,'the browser draws multiple frames of the fade').toBeGreaterThan(4);
 expect(Math.min(...active.map(sample=>sample.opacity)),'the starting opacity visibly differs from the final state').toBeLessThan(maximumStart);
 const intermediate=active.filter(sample=>sample.opacity>maximumStart&&sample.opacity<.97);
 expect(new Set(intermediate.map(sample=>Math.round(sample.opacity*100))).size,
  'opacity progresses through several visible intermediate values').toBeGreaterThan(4);
 expect(final.time-active[0].time,'the fade remains gradual instead of snapping to its endpoint').toBeGreaterThan(minimumElapsed);
 for(let index=1;index<trace.samples.length;index++){
  expect(trace.samples[index].opacity-trace.samples[index-1].opacity,
   'the surface never flashes bright and then dims').toBeGreaterThanOrEqual(-.02);
 }
 expect(trace.samples.every(sample=>sample.transform==='none'),'opacity cues keep surfaces stationary').toBe(true);
 expect(final).toMatchObject({opacity:1,pending:false,cue:null});
}

test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{
  window.__lifecycleCues=[];
  const record=element=>{
   const kind=element.getAttribute?.('data-motion');
   if(kind)window.__lifecycleCues.push({kind,className:String(element.className),roleTone:element.dataset.roleTone||'',
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
  await openNavigation(page);await recordOpacity(page.locator('#main'),'page');
  await page.locator('.header [data-nav="about"]').click();
  await expect.poll(()=>kinds(page)).toContain('page');
  await expect(page.locator('#main h1')).toBeFocused();
  await revealsReady(page);
  expectPerceptibleFade(await page.evaluate(()=>window.__opacityTrace),'page',.6,900);
  const group=page.locator('.content-page > .info-block').last();
  await expect(group).toHaveAttribute('data-reveal-pending','');
  expect(await group.evaluate(element=>Number(getComputedStyle(element).opacity))).toBeCloseTo(.4,2);
  await recordOpacity(group,'reveal',true);
  await group.scrollIntoViewIfNeeded();
  const heading=await group.locator('h2').textContent();
  await expect.poll(async()=>(await events(page)).some(event=>event.kind==='reveal'&&event.heading===heading)).toBe(true);
  const revealTrace=await page.evaluate(()=>window.__opacityTrace);
  expect(revealTrace.samples[0]).toMatchObject({opacity:.4,pending:true,cue:null});
  expectPerceptibleFade(revealTrace,'reveal',.55,1350);
  await reset(page);
  await openNavigation(page);await page.locator('.header [data-nav="play"]').click();
  await openNavigation(page);await page.locator('.header [data-nav="about"]').click();
  await revealsReady(page);
  await page.locator('.content-page > .info-block').last().scrollIntoViewIfNeeded();
  await frames(page);
  expect((await events(page)).some(event=>event.kind==='reveal'&&event.heading===heading),
   'returning to a reference group does not replay its reveal').toBe(false);
 });

 test(`${role}: focusing a newly revealed card cancels its group entrance permanently`,async({page})=>{
  await page.setViewportSize({width:390,height:568});
  await page.goto(paths[role]);
  // The hero can be classified as initially visible while the first layout
  // settles. Use a group well below the initial viewport so this test starts
  // with an actual later entrance rather than depending on initial geometry.
  const group=page.locator('.topic-explorer');
  await expect(group).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  await revealsReady(page);
  const heading=await group.locator('h2').textContent();
  expect(await group.evaluate(element=>element.getBoundingClientRect().top-innerHeight),
   'the target starts below the viewport and the observer’s 80px preload margin').toBeGreaterThan(80);
  expect((await events(page)).filter(event=>event.kind==='reveal'&&event.heading===heading)).toHaveLength(0);
  await group.scrollIntoViewIfNeeded();
  await expect(group).toHaveAttribute('data-motion','reveal');
  await group.locator('.topic-card').first().focus();
  await expect(group).not.toHaveAttribute('data-motion','reveal');
  await page.locator('.wordmark').evaluate(element=>element.focus({preventScroll:true}));
  await frames(page);
  await expect(group).not.toHaveAttribute('data-motion','reveal');
  await page.locator('.wordmark').scrollIntoViewIfNeeded();
  await group.scrollIntoViewIfNeeded();await frames(page);
  expect((await events(page)).filter(event=>event.kind==='reveal'&&event.heading===heading),
   'leaving focus or scrolling back cannot restart the cancelled card entrance').toHaveLength(1);
 });

 test(`${role}: pending entrances stay readable on focus and clear when motion is reduced`,async({page})=>{
  await page.setViewportSize({width:390,height:568});
  await page.goto(paths[role]);
  const group=page.locator('.topic-explorer');
  await expect(group).toBeVisible();await page.evaluate(()=>document.fonts.ready);await revealsReady(page);
  const heading=await group.locator('h2').textContent();
  await expect(group).toHaveAttribute('data-reveal-pending','');
  expect(await page.locator('.reference-landing').evaluate(element=>Number(getComputedStyle(element).opacity)),
   'the first viewport remains fully readable').toBe(1);
  const focus=await group.evaluate(element=>{
   const link=element.querySelector('.topic-card');link.focus({preventScroll:true});
   return {focused:document.activeElement===link,opacity:Number(getComputedStyle(element).opacity),
    pending:element.hasAttribute('data-reveal-pending'),cue:element.getAttribute('data-motion')};
  });
  expect(focus,'focus settles a pending entrance synchronously before the control is used')
   .toEqual({focused:true,opacity:1,pending:false,cue:null});
  await page.locator('.wordmark').evaluate(element=>element.focus({preventScroll:true}));
  await group.scrollIntoViewIfNeeded();await frames(page);
  expect((await events(page)).filter(event=>event.kind==='reveal'&&event.heading===heading),
   'a pending entrance consumed by focus is never replayed').toHaveLength(0);
  // Reset the viewport before reloading so reduced motion is tested against
  // a fresh offscreen queue, independently of the focus cancellation above.
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.reload();await revealsReady(page);
  await expect(page.locator('[data-reveal-pending]')).not.toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-reveal-pending],[data-motion]')).toHaveCount(0);
  expect(await group.evaluate(element=>Number(getComputedStyle(element).opacity))).toBe(1);
  await page.emulateMedia({reducedMotion:'no-preference'});await frames(page);
  await expect(page.locator('[data-reveal-pending],[data-motion]')).toHaveCount(0);
 });

 test(`${role}: recap cards and progress avoid replaying cues when controls redraw them`,async({page})=>{
  const complete=completedRoute(role);
  await page.goto(paths[role]+stateHash(complete));
  await expect(page.locator('.recap-takeaways')).toBeVisible();
  const card=page.locator('.paired-recap > .summary-item').last();
  await card.scrollIntoViewIfNeeded();
  const heading=await card.locator('h2').textContent();
  await expect.poll(async()=>(await events(page)).some(event=>event.kind==='recap'&&event.heading===heading)).toBe(true);
  await reset(page);
  await page.locator('[data-action="paired-characters"]').click();
  await page.locator('[data-action="paired-character-close"]').click();
  await page.locator('.paired-recap > .summary-item').last().scrollIntoViewIfNeeded();
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
