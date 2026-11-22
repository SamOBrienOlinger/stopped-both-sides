import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,charactersForSituation,changeCharacter,createCharacterPreferences} from '../encounters/characters.mjs';
import {discriminationEncounters} from '../encounters/discrimination.mjs';
import {situationParticipants,participantLayout} from '../encounters/situation-cast.mjs';
import {startEncounter,answer,continueEncounter,switchRole,encodeState,decodeState} from '../encounters/engine.mjs?v=situation-cast-20261122';
import {renderScene,renderScenePreview} from '../encounters/scenes.mjs?v=situation-cast-20261122';

const suppliedToken='eyJ2IjoyLCJlIjoiZGlzY3JpbWluYXRpb24tY29sbGVhZ3VlLXJhY2UiLCJyIjoiZ2FyZGEiLCJwIjpbXSwiYSI6W251bGwsbnVsbF0sImMiOlsicHVibGljLTYiLCJnYXJkYS00Il19';
test('The reported race link shows a distinct Black affected adult, discriminatory colleague and two witnesses',()=>{
 const state=decodeState(suppliedToken),people=situationParticipants(state.id,state.cast);
 assert.equal(state.cast.public,'public-6','The existing public witness is retained');
 assert.equal(state.cast.garda,'garda-4');
 assert.deepEqual(people.map(person=>person.key),['affected','acting-garda','public','garda']);
 assert.equal(people[0].characterId,'public-5');
 assert.equal(people[0].label,'Black adult being singled out');
 assert.notEqual(people[1].characterId,state.cast.garda);
 assert.equal(people[2].label,'Public witness');assert.equal(people[3].label,'Witnessing Garda');
 for(const person of people)assert.ok(renderScene(state).includes('data-scene-role="'+person.key+'"'));
 assert.equal((renderScenePreview(state.id).match(/class="scene-actor /g)||[]).length,4);
});

test('Every discrimination stage and requested cast has distinct, fully labelled people and two playable roles',()=>{
 let checked=0;
 for(const encounter of Object.values(discriminationEncounters))for(const nodeId of Object.keys(encounter.nodes))for(const p of characters.public)for(const g of characters.garda){
  const people=situationParticipants(encounter.id,{public:p.id,garda:g.id},{nodeId});
  assert.equal(people.filter(person=>person.playable).length,2);
  assert.equal(new Set(people.map(person=>person.characterId)).size,people.length,encounter.id);
  for(const [index,person] of people.entries()){
   assert.ok(person.label);assert.ok(person.character);
   const anchor=participantLayout(encounter.place,people,index);
   assert.ok(anchor.width>0&&anchor.x-anchor.width/2>=0&&anchor.x+anchor.width/2<=100);
  }
  if(encounter.kind==='colleague-witness'){
   assert.ok(people.some(person=>person.key==='affected'&&!person.playable));
   assert.ok(people.some(person=>person.key==='acting-garda'&&!person.playable));
  }
  if(encounter.id==='discrimination-colleague-race')assert.ok(['public-3','public-5'].includes(people[0].characterId));
  checked++;
 }
 assert.equal(checked,20*2*81);
});

test('Age and gender requirements survive old links and reject character changes that contradict the account',()=>{
 for(const [id,allowed] of [['discrimination-gender',['public-4','public-2','public-6','public-7']],['discrimination-age',['public-9','public-3','public-6']]]){
  assert.deepEqual(charactersForSituation(id,'public').map(character=>character.id),allowed);
  const token=btoa(JSON.stringify({v:2,e:id,r:'public',p:[],a:[0,null],c:['public-1','garda-4']})).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  const state=decodeState(token);assert.equal(state.cast.public,allowed[0]);assert.equal(state.answers.public,0);
  assert.equal(changeCharacter(state,'public-1'),state);
  const changed=changeCharacter(state,allowed[1]);assert.equal(changed.cast.public,allowed[1]);assert.deepEqual(changed.answers,state.answers);
  assert.deepEqual(decodeState(encodeState(changed)),changed);
 }
 const preferences=createCharacterPreferences();preferences.choose('public','public-1');
 startEncounter('discrimination-age','public',{cast:preferences.value});
 assert.equal(preferences.value.public,'public-1','A situation-specific cast does not overwrite the global preference');
 for(const id of Object.keys(discriminationEncounters).filter(id=>id.startsWith('discrimination-colleague-')))assert.equal(charactersForSituation(id,'public').length,9);
});

test('Companions, the child and stage-specific participants follow the written account',()=>{
 const cast={public:'public-6',garda:'garda-4'};
 const people=(id,nodeId='opening')=>situationParticipants(id,cast,{nodeId});
 assert.ok(people('discrimination-colleague-gender').some(person=>person.key==='companion'));
 const child=people('discrimination-colleague-family-status').find(person=>person.key==='child');
 assert.equal(child.label,'Child, 7 years old');assert.ok(child.scale<1);
 for(const id of ['discrimination-sexual-orientation','discrimination-colleague-sexual-orientation'])assert.ok(people(id).some(person=>person.key==='partner'));
 for(const [id,partners] of [['public-1',['public-5','public-8','public-9']],['public-4',['public-7','public-2','public-6']],['public-3',['public-9']]]){
  const pair=situationParticipants('discrimination-sexual-orientation',{...cast,public:id});
  assert.ok(partners.includes(pair.find(person=>person.key==='partner').characterId));
  assert.equal(pair.find(person=>person.key==='public').characterId,id,'The same-sex couple follows the player’s selected character');
 }
 assert.ok(people('discrimination-disability').some(person=>person.key==='friend'));
 assert.ok(!people('discrimination-colleague-disability').some(person=>person.key==='friend'||person.key==='interpreter'),'An interpreter being arranged is not already in the scene');
 assert.ok(people('discrimination-race','follow-up').some(person=>person.key==='supervisor'));
 const attendant=people('discrimination-civil-status').find(person=>person.key==='attendant');
 const exhibition=people('discrimination-civil-status','follow-up');
 assert.equal(exhibition.find(person=>person.key==='attendant').characterId,attendant.characterId);
 assert.notEqual(exhibition.find(person=>person.key==='supervisor').characterId,attendant.characterId);
 assert.ok(people('discrimination-gender').some(person=>person.key==='participant'));
 assert.ok(!people('discrimination-gender','follow-up').some(person=>person.key==='participant'));
 for(const id of ['discrimination-housing-assistance','discrimination-colleague-housing-assistance']){
  assert.ok(people(id).some(person=>person.key==='agent'));
  assert.ok(!people(id,'follow-up').some(person=>person.key==='agent'));
 }
});

test('Affected identities and witnesses stay consistent through both answers, reloads and recaps',()=>{
 for(const id of Object.keys(discriminationEncounters)){
  let state=startEncounter(id,'public',{cast:{public:'public-6',garda:'garda-4'}});
  const cast=state.cast;
  const before=situationParticipants(id,cast).filter(person=>['affected','acting-garda','partner','child'].includes(person.key));
  while(!state.complete){
   for(const role of ['public','garda'])state=answer(switchRole(state,role),0);
   state=decodeState(encodeState(continueEncounter(state)));assert.deepEqual(state.cast,cast);
  }
  const after=situationParticipants(id,state.cast,{nodeId:'follow-up'});
  for(const person of before)assert.equal(after.find(other=>other.key===person.key).characterId,person.characterId);
  for(const step of state.history)assert.ok(renderScene(state,{step,compact:true}).includes('data-cast-layout="group"'));
 }
});
