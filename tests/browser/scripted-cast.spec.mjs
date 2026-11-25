import {test,expect} from '@playwright/test';
import {startEncounter,stateHash,decodeState} from '../../encounters/engine.mjs';

const cast={public:'public-9',garda:'garda-2'};
const publicLabel='button[data-scene-label-role="public"]';

test('The described person changes only at the variation, including profile, saved progress and recap',async({page})=>{
 await page.goto('garda/'+stateHash(startEncounter('garda-description','public',{cast})));
 for(const [i,id] of ['story-amina','story-amina','story-other-person'].entries()){
  const scene=page.locator('.encounter-scene');
  const name=i===2?'Person matching the fuller description':'Amina';
  await expect(scene.locator(publicLabel)).toContainText(name);
  await expect(scene.locator('[data-scene-role="public"] img')).toHaveAttribute('src',new RegExp(id+'\\.webp$'));
  await expect(scene.locator('[data-story-prop="red-bicycle"]')).toHaveCount(i===2?1:0);
  await expect(page.locator('.turn-avatar')).toHaveAccessibleName('Your avatar · Pat');
  await expect(page.locator('.turn-avatar')).toHaveAttribute('data-character-id','public-9');
  await expect(page.locator('[data-cast-role="public"]')).toContainText(name);
  await scene.locator(publicLabel).click();
  const profile=page.getByRole('dialog');
  await expect(profile).toHaveAccessibleName(name);
  await expect(profile.locator('img')).toHaveAttribute('src',new RegExp(id+'\\.webp$'));
  await expect(profile.locator('.scene-profile-change')).toBeHidden();
  await profile.getByRole('button',{name:'Close character details'}).click();
  await page.locator('[data-action="paired-answer"]').first().click();
  await page.locator('[data-action="paired-next"]').click();
  if(i===1){
   await page.reload();
   const saved=decodeState(new URL(page.url()).hash.slice(11));
   expect(saved.cast).toEqual(cast);
   expect(saved.history).toHaveLength(2);
  }
 }
 const recap=page.locator('.paired-recap .encounter-scene');
 await expect(recap).toHaveCount(3);
 for(const [i,id] of ['story-amina','story-amina','story-other-person'].entries()){
  await expect(recap.nth(i).locator(publicLabel)).toHaveAttribute('data-scene-character-id',id);
 }
});

test('One-role named practice keeps Niamh when transferring, refreshing and replaying from the recap',async({page})=>{
 await page.addInitScript(cast=>localStorage.setItem('stopped-both-sides:characters:v1',JSON.stringify(cast)),cast);
 await page.goto('./#scenario/search');
 await expect(page.locator('.story')).toContainText('Niamh');
 await expect(page.locator('.turn-avatar')).toHaveAccessibleName('Your avatar · Pat');
 await expect(page.locator(publicLabel)).toHaveAttribute('data-scene-character-id','story-niamh');
 await page.locator('[data-action="choose"]').first().click();
 await page.locator('[data-action="paired-transfer"]').click();
 await page.reload();
 const state=decodeState(new URL(page.url()).hash.slice(11));
 expect(state.authored).toBe(true);
 expect(state.cast.public).toBe('public-9');
 expect(state.answers.public).toBe(0);
 await expect(page.locator('[data-cast-role="public"]')).toContainText('Niamh');
 for(let i=0;i<4;i++){
  await page.locator('[data-action="paired-answer"]').first().click();
  await page.locator('[data-action="paired-next"]').click();
 }
 await page.locator('[data-action="paired-replay-role"]').first().click();
 await expect(page.locator('[data-cast-role="public"]')).toContainText('Niamh');
 await expect(page.locator('.turn-avatar')).toHaveAccessibleName('Your avatar · Pat');
});

test('A saved patrol member sees the correct supervising sergeant and can choose another eligible sergeant',async({page})=>{
 await page.goto('garda/'+stateHash(startEncounter('garda-supervision','garda',{cast})));
 await expect(page.locator('.turn-avatar')).toHaveAccessibleName('Your avatar · Garda Rory');
 const actor=page.locator('button[data-scene-label-role="garda"]');
 await expect(actor).toHaveAccessibleName('About Garda Sergeant Ciara, Supervising sergeant');
 await actor.click();
 const profile=page.getByRole('dialog');
 await expect(profile).toHaveAccessibleName('Garda Sergeant Ciara');
 await expect(profile.locator('.scene-profile-role')).toHaveText('Supervising sergeant');
 await profile.getByRole('button',{name:'Change character'}).click();
 await expect(page.locator('#character-picker .character-option')).toHaveCount(3);
 await page.locator('#character-picker [data-character="garda-6"]').click();
 await page.reload();
 await expect(actor).toHaveAccessibleName('About Garda Sergeant Kai, Supervising sergeant');
 await expect(page.locator('.turn-avatar')).toHaveAttribute('data-character-id','garda-6');
});
