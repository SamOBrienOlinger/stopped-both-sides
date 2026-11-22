import {test,expect} from '@playwright/test';
import {discriminationEncounters} from '../../encounters/discrimination.mjs';
import {startEncounter,answer,continueEncounter,stateHash,decodeState} from '../../encounters/engine.mjs?v=situation-cast-20261122';
import {situationParticipants} from '../../encounters/situation-cast.mjs';
import {openCharacterPicker} from './navigation.mjs';

const suppliedToken='eyJ2IjoyLCJlIjoiZGlzY3JpbWluYXRpb24tY29sbGVhZ3VlLXJhY2UiLCJyIjoiZ2FyZGEiLCJwIjpbXSwiYSI6W251bGwsbnVsbF0sImMiOlsicHVibGljLTYiLCJnYXJkYS00Il19';
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const sceneSelector='.paired-scene-lead>.encounter-scene';

for(const [path,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: the reported race scene separates the Black adult, colleague and both playable witnesses`,async({page},info)=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  const initial={...decodeState(suppliedToken),role};
  await page.goto(path+'?lang=en'+stateHash(initial));
  const scene=page.locator(sceneSelector);await expect(scene).toBeVisible();
  await expect(scene.locator('.scene-actor')).toHaveCount(4);
  await expect(scene.locator('[data-scene-role="affected"]')).toHaveAttribute('data-scene-character','support-race-adult');
  await expect(scene.locator('[data-scene-role="affected"] img')).toHaveAttribute('src',/discrimination-support-20261122.png/);
  await expect(scene.locator('[data-scene-participant="affected"]')).toContainText('Black adult being singled out');
  await expect(scene.locator('[data-scene-participant="acting-garda"]')).toContainText('Garda whose conduct is being challenged');
  await expect(scene.locator('[data-scene-label-role="public"]')).toContainText('Public witness');
  await expect(scene.locator('[data-scene-label-role="garda"]')).toContainText('Witnessing Garda');
  await expect.poll(()=>scene.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
  await scene.screenshot({path:info.outputPath('race-cast-phone.png')});
  await page.locator('[data-action="paired-answer"]').first().click();
  const answered=current(page);
  const caption=await openCharacterPicker(page,'public');
  await expect(page.locator('.character-option')).toHaveCount(9);
  await page.locator('[data-character="public-5"]').click();
  await page.locator('[data-action="paired-character-close"]').click();
  await expect(caption).toBeFocused();
  expect(current(page).answers).toEqual(answered.answers);
  await expect(scene.locator('[data-scene-role="affected"]')).toHaveAttribute('data-scene-character','support-race-adult');
  await page.reload();await expect(scene).toBeVisible();
  expect(current(page).cast.public).toBe('public-5');
  for(const target of ['public','garda']){
   await scene.locator('[data-scene-label-role="'+target+'"]').click();
   await expect(page.locator('#scene-character-dialog .scene-profile-body')).toContainText(target==='public'?'not the person being targeted':'not the Garda whose conduct');
   await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:1366,height:900});
  await scene.screenshot({path:info.outputPath('race-cast-desktop.png')});
 });

 test(`${role}: character choices retain the written gender, same-sex couple and older age`,async({page})=>{
  for(const [id,count,label] of [['discrimination-gender',4,'Woman with a booking'],['discrimination-sexual-orientation',9,'Member of the couple'],['discrimination-age',3,'Applicant, 67 years old']]){
   await page.goto(path+'?lang=en'+stateHash(startEncounter(id,role,{cast:{public:'public-1',garda:'garda-4'}})));
   await expect(page.locator(sceneSelector+' [data-scene-label-role="public"]')).toContainText(label);
   await openCharacterPicker(page,'public');
   await expect(page.locator('.character-option')).toHaveCount(count);
   if(count<9){
    await expect(page.locator('.scene-cast-requirement')).toContainText('match the age or gender');
    await expect(page.locator('[data-character="public-1"]')).toHaveCount(0);
   }
   const next=page.locator('.character-option').nth(1),nextId=await next.getAttribute('data-character');
   await next.click();await page.locator('[data-action="paired-character-close"]').click();
   expect(current(page).cast.public).toBe(nextId);
   await page.reload();expect(current(page).cast.public).toBe(nextId);
  }
 });
}

test('All twenty discrimination scenes and follow-ups keep every participant and numbered label inside narrow and enlarged layouts',async({page})=>{
 test.setTimeout(120000);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('./?lang=en#play');
 const states=Object.keys(discriminationEncounters).flatMap(id=>{
  const state=startEncounter(id,'public',{cast:{public:'public-6',garda:'garda-4'}});
  return [state,continueEncounter(answer(state,0))];
 });
 const expectations=states.map(state=>({id:state.id+'/'+state.nodeId,people:situationParticipants(state.id,state.cast,{nodeId:state.nodeId}).map(person=>({key:person.key,id:person.characterId,number:person.number}))}));
 await page.evaluate(async states=>{
  const {renderScene}=await import('/stopped-both-sides/encounters/scenes.mjs?v=situation-cast-20261122');
  document.querySelector('#main').innerHTML=states.map(state=>'<div style="max-width:40rem;margin:auto">'+renderScene(state)+'</div>').join('');
  document.querySelectorAll('#main img').forEach(image=>image.loading='eager');
 },states);
 await expect.poll(()=>page.locator('#main img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
 for(const width of [280,390,768,1366]){
  await page.setViewportSize({width,height:900});
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
  const errors=await page.evaluate(expectations=>{
   const errors=[];
   for(const {id,people} of expectations){
    const scene=document.querySelector('[data-scene-id="'+id+'"]'),location=scene.querySelector('.scene-location'),bounds=location.getBoundingClientRect();
    if(scene.scrollWidth>scene.clientWidth+1)errors.push(id+': scene overflow');
    const cards=[];
    for(const person of people){
     const actor=location.querySelector('[data-scene-role="'+person.key+'"]'),card=scene.querySelector('[data-scene-participant="'+person.key+'"]');
     if(actor.dataset.sceneCharacter!==person.id)errors.push(id+': wrong actor '+person.key);
     if(actor.querySelector('.scene-person-number').textContent!==String(person.number)||card.querySelector('.scene-roster-number').textContent!==String(person.number))errors.push(id+': wrong number '+person.key);
     const frame=actor.getBoundingClientRect(),box=card.getBoundingClientRect();cards.push(box);
     if(frame.left<bounds.left-.5||frame.right>bounds.right+.5||frame.top<bounds.top-.5||frame.bottom>bounds.bottom+.5)errors.push(id+': actor clipped '+person.key);
     if(card.scrollWidth>card.clientWidth+1||card.scrollHeight>card.clientHeight+1)errors.push(id+': card clipped '+person.key);
    }
    if(cards.some((a,i)=>cards.slice(i+1).some(b=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5)))errors.push(id+': overlapping cards');
   }
   if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1)errors.push('page overflow');
   return errors;
  },expectations);
  expect(errors,width+'px').toEqual([]);
 }
});
