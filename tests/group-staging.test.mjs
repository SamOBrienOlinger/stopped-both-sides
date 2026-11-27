import test from 'node:test';
import assert from 'node:assert/strict';
import {situationParticipants,participantLayout} from '../encounters/situation-cast.mjs';
import {renderScene,renderScenePreview} from '../encounters/scenes.mjs';
import {startEncounter,answer,continueEncounter} from '../encounters/engine.mjs';

const cast={public:'public-1',garda:'garda-1'};
function marks(id,nodeId,place){
 const people=situationParticipants(id,cast,{nodeId});
 return Object.fromEntries(people.map((person,index)=>[person.key,{...participantLayout(place,people,index),person}]));
}

test('Parent and child remain paired on one floor, while the visual focus moves towards the public witness',()=>{
 const id='discrimination-colleague-family-status',before=marks(id,'opening','station'),after=marks(id,'follow-up','station');
 for(const stage of [before,after]){
  assert.equal(stage.affected.bottom,stage.child.bottom);
  assert.ok(stage.child.width<stage.affected.width);
  assert.ok(stage.child.x-stage.affected.x<19);
  assert.deepEqual(Object.values(stage).map(entry=>entry.person.number),[1,2,3,4,5]);
 }
 assert.ok(before.public.bottom>before['acting-garda'].bottom);
 assert.ok(after.public.bottom<after['acting-garda'].bottom);
 assert.notEqual(before.affected.person.character.sceneArtwork.style,after.affected.person.character.sceneArtwork.style);
});

test('Either possible challenged officer addresses the family while the witnessing Garda keeps their chosen uniform',()=>{
 for(const preferred of ['garda-1','garda-2','garda-5']){
  const requested={public:'public-1',garda:preferred};
  const people=situationParticipants('discrimination-colleague-family-status',requested);
  const speaker=people.find(person=>person.key==='acting-garda');
  const witness=people.find(person=>person.key==='garda');
  assert.notEqual(speaker.characterId,preferred);
  assert.match(speaker.character.sceneArtwork.src,/group-speaking-gardai\.webp$/);
  assert.equal(witness.character.id,preferred);
  assert.equal(witness.character.sceneArtwork,undefined);
 }
});

test('The stadium opening places the spectator and steward either side of the reader and removes the ticket after the scan rules are explained',()=>{
 const id='discrimination-race',stage=marks(id,'opening','football-ground');
 assert.ok(stage.public.x<45&&45<stage.steward.x);
 assert.ok(stage.garda.bottom>stage.steward.bottom);
 const state=startEncounter(id,'public',{cast});
 for(const html of [renderScene(state),renderScenePreview(id)]){
  assert.match(html,/data-held-by="public" data-scene-object="ticket"/);
  assert.match(html,/public-gestures\/public-1\.webp/);
  assert.match(html,/garda-uniforms\/garda-2\.webp/);
 }
 const next=continueEncounter(answer(state,0));
 assert.doesNotMatch(renderScene(next),/data-scene-object="ticket"/);
 assert.match(renderScene(next),/data-scene-participant="supervisor"/);
});
