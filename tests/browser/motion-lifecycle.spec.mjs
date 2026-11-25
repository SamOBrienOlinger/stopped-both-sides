import {openNavigation,openCharacterPicker} from './navigation.mjs';
import {test,expect} from '@playwright/test';
import {expectStaticHeadings} from './static-headings.mjs';
import {startEncounter,answer,switchRole,continueEncounter,stateHash,decodeState} from '../../encounters/engine.mjs?v=nia-public-20261123';

const paths={public:'./',garda:'garda/'};
const cast={public:'public-2',garda:'garda-5'};
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function revealsReady(page){
 await frames(page);
 await expect(page.locator('#main')).not.toHaveAttribute('data-motion','page');
 await frames(page);
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
 for(const action of ['paired-transfer','change-character'])test(`${role}: ${action} retains the same scene and answer during a shared-mode transfer`,async({page})=>{
  await page.addInitScript(cast=>localStorage.setItem('stopped-both-sides:characters:v1',JSON.stringify(cast)),cast);
  await page.goto(paths[role]);
  await page.locator('.single-mode > summary').click();
  await page.locator('.single-mode .practice-content a').click();
  const topic=page.locator('.scenario-library .situation-topic').filter({has:page.locator('[data-action="start"][data-id="street"]')});
  await topic.locator(':scope > summary').click();
  await topic.locator('[data-action="start"][data-id="street"]').click();
  await page.locator('[data-action="choose"]').first().click();
  await expect(page.locator('#feedback')).toBeVisible();
  if(action==='change-character'&&role==='public'){
   const subject=page.locator('button[data-scene-label-role="public"]');
   await expect(subject).toContainText('Alex');
   await expect(page.locator('.turn-avatar')).toHaveAccessibleName('Your avatar · Noor');
   await subject.click();
   const profile=page.getByRole('dialog');
   await expect(profile).toHaveAccessibleName('Alex');
   await expect(profile.locator('.scene-profile-change')).toBeHidden();
   await profile.getByRole('button',{name:'Close character details'}).click();
   await expect(page.locator('#feedback')).toBeVisible();
  }
  await reset(page);
  if(action==='change-character'&&role==='public')await page.getByRole('button',{name:'Change your avatar'}).click();
  else if(action==='change-character')await openCharacterPicker(page,role);
  else await page.locator('[data-action="paired-transfer"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  await expect.poll(async()=>kinds(page)).toContain(action==='paired-transfer'?'perspective':'picker');
  await frames(page);
  expect(await kinds(page)).not.toContain('stage');
  expect(await kinds(page)).not.toContain('scene');
  expect(current(page).answers[role]).toBe(0);
  expect(current(page).history).toHaveLength(0);
  expect(current(page).role).toBe(action==='paired-transfer'?(role==='public'?'garda':'public'):role);
  if(action==='change-character'){
   await expect(page.locator('#character-picker-title')).toBeFocused();
   const before=current(page);
   if(role==='public'){
    await expect(page.locator('#character-picker [data-character="public-2"]')).toHaveAttribute('aria-pressed','true');
    await page.locator('#character-picker [data-character="public-1"]').click();
    await page.locator('[data-action="paired-character-close"]').click();
    const change=page.getByRole('button',{name:'Change your avatar'});
    await expect(change).toBeFocused();
    await expect(page.locator('.turn-avatar')).toHaveAttribute('data-character-id','public-1');
    await change.press('Enter');
    await expect(page.locator('#character-picker [data-character="public-1"]')).toHaveAttribute('aria-pressed','true');
   }
   const option=role==='public'?page.locator('#character-picker [data-character="public-9"]'):page.locator('#character-picker [aria-pressed="false"][data-character]').first();
   const id=await option.getAttribute('data-character');
   await option.click();
   await expect.poll(()=>current(page)).toEqual({...before,cast:{...before.cast,[role]:id}});
   await page.locator('[data-action="paired-character-close"]').click();
   if(role==='public'){
    await expect(page.getByRole('button',{name:'Change your avatar'})).toBeFocused();
    await expect(page.locator('.turn-avatar')).toHaveAccessibleName('Your avatar · Pat');
    await expect(page.locator('.turn-avatar')).toHaveAttribute('data-character-id',id);
    await expect(page.locator('button[data-scene-label-role="public"]')).toHaveAccessibleName('About Alex, Member of the public');
    await expect(page.locator('.encounter-scene [data-scene-role="public"]')).toHaveAttribute('data-scene-character','public-1');
    await expect(page.locator('#feedback')).toBeVisible();
   }else await expect(page.locator('button[data-scene-label-role="garda"]')).toHaveAttribute('data-scene-character-id',id);
   expect(await kinds(page)).not.toContain('stage');
   expect(await kinds(page)).not.toContain('scene');
  }
 });

 test(`${role}: topic filters and page changes keep reference subheadings static`,async({page})=>{
  await page.goto(paths[role]+'#encounters/'+role);
  await page.locator('.scenario-library > summary').click();
  await reset(page);
  await page.getByRole('button',{name:'Young people',exact:true}).click();
  await expect(page.locator('.encounter-card')).toHaveCount(2);
  await frames(page);
  expect(await kinds(page),'filtering changes results without replaying presentation cues').toEqual([]);
  await expectStaticHeadings(page.locator('.encounter-card :is(h2,h3)'),'filtered catalogue headings');
  await openNavigation(page);
  await page.locator('.header [data-nav="about"]').click();
  await expect.poll(()=>kinds(page)).toContain('page');
  await expect(page.locator('#main h1')).toBeFocused();
  await expect(page.locator('#main')).not.toHaveAttribute('data-motion','page');
  await expectStaticHeadings(page.locator('#main :is(h2,h3,h4,[data-card-heading]:not(h1))'),
   'About subheadings during the primary page cue');
  const group=page.locator('.learning-intro'),heading=group.locator(':scope > h2');
  await page.evaluate(()=>document.fonts.ready);
  await expect(group).not.toHaveAttribute('data-reveal-pending');
  await expectStaticHeadings(heading,'offscreen reference heading');
  await group.scrollIntoViewIfNeeded();
  await expectStaticHeadings(heading,'reference heading reached by scrolling');
  await reset(page);
  await openNavigation(page);await page.locator('.header [data-nav="play"]').click();
  await openNavigation(page);await page.locator('.header [data-nav="about"]').click();
  await revealsReady(page);
  await group.scrollIntoViewIfNeeded();
  await expectStaticHeadings(heading,'reference heading after returning');
  expect((await events(page)).some(event=>event.kind==='reveal'&&event.className.includes('learning-intro')),
   'reference headings never receive a later-entry cue').toBe(false);
 });

 test(`${role}: dropdown headings stay static before focus and after repeated scrolling`,async({page})=>{
  await page.setViewportSize({width:390,height:568});
  await page.goto(paths[role]);
  const group=page.locator('.topic-explorer'),heading=group.locator('h2');
  await expect(group).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  await revealsReady(page);
  expect(await group.evaluate(element=>element.getBoundingClientRect().top-innerHeight),
   'the target starts below the viewport and the observer preload margin').toBeGreaterThan(80);
  await expect(group).not.toHaveAttribute('data-reveal-pending');
  await expectStaticHeadings(heading,'offscreen Browse all situations');
  await group.scrollIntoViewIfNeeded();
  await expectStaticHeadings(heading,'Browse all situations after scrolling');
  await group.locator('summary.topic-disclosure-trigger').focus();
  await expectStaticHeadings(heading,'focused catalogue disclosure heading');
  await page.locator('.wordmark').evaluate(element=>element.focus({preventScroll:true}));
  await page.locator('.wordmark').scrollIntoViewIfNeeded();
  await group.scrollIntoViewIfNeeded();
  await expectStaticHeadings(heading,'catalogue heading after returning');
  expect((await events(page)).filter(event=>event.kind==='reveal'&&event.className.includes('topic-explorer')),
   'the catalogue group is never a parent fade surface').toHaveLength(0);
 });

 test(`${role}: heading visibility does not depend on focus or the motion preference`,async({page})=>{
  await page.setViewportSize({width:390,height:568});
  await page.goto(paths[role]);
  const group=page.locator('.topic-explorer'),heading=group.locator('h2');
  await expect(group).toBeVisible();await page.evaluate(()=>document.fonts.ready);await revealsReady(page);
  await expectStaticHeadings(heading,'secondary heading before focus');
  const focus=await group.evaluate(element=>{
   const trigger=element.querySelector('summary.topic-disclosure-trigger');trigger.focus({preventScroll:true});
   return {focused:document.activeElement===trigger,opacity:Number(getComputedStyle(element).opacity),
    pending:element.hasAttribute('data-reveal-pending'),cue:element.getAttribute('data-motion')};
  });
  expect(focus,'a heading-bearing control is available before any focus settlement')
   .toEqual({focused:true,opacity:1,pending:false,cue:null});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.reload();await revealsReady(page);
  await expect(page.locator('.sbs-poster [data-landing-reveal="pending"]')).not.toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-reveal-pending],[data-motion],[data-landing-reveal]')).toHaveCount(0);
  await expectStaticHeadings(heading,'secondary heading with reduced motion');
  await page.emulateMedia({reducedMotion:'no-preference'});await frames(page);
  await expect(page.locator('[data-reveal-pending],[data-motion]')).toHaveCount(0);
  await expectStaticHeadings(heading,'secondary heading when motion is restored');
 });

 test(`${role}: recap cards and progress avoid replaying cues when controls redraw them`,async({page})=>{
  const complete=completedRoute(role);
  await page.goto(paths[role]+stateHash(complete));
  await expect(page.locator('.recap-takeaways')).toBeVisible();
  const card=page.locator('.paired-recap > .summary-item').last();
  await card.scrollIntoViewIfNeeded();
  const heading=await card.locator('h2').textContent();
  await expectStaticHeadings(card.locator('h2'),'recap card heading on first entry');
  await reset(page);
  await openCharacterPicker(page);
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
 await expect(page.locator('#feedback [data-motion="feedback"]')).not.toHaveCount(0);
 await expectStaticHeadings(page.locator('#feedback :is(h2,h3)'),'feedback heading during its content cue');
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
