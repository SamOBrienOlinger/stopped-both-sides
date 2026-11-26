import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {answer,continueEncounter,decodeState,encodeState,revisit,startEncounter,switchRole} from '../encounters/engine.mjs';
import {runScores} from '../encounters/progress.mjs';
import {storyCastOptions,storyCharacter,storyCharacterById} from '../encounters/story-cast.mjs';
import {renderScene,renderScenePreview} from '../encounters/scenes.mjs';

const preferred={public:'public-9',garda:'garda-2'};
const advance=(s,index=0)=>continueEncounter(answer(s,index));
const oldToken=data=>Buffer.from(JSON.stringify(data)).toString('base64url');

test('Alex comparison depicts both written identities only at its stage without changing a saved player cast',()=>{
 for(const authored of [false,true])for(const role of ['public','garda']){
  let state=startEncounter('garda-street',role,{cast:preferred,authored});
  assert.ok(!renderScenePreview(state.id,{cast:preferred,authored}).includes('story-alex-comparison'));
  while(state.nodeId!=='street-identity'){
   assert.equal(storyCharacter(state,'public').id,authored?'public-1':preferred.public);
   state=advance(state);
  }
  const saved=encodeState(state),snapshot=structuredClone(state);
  const alex=storyCharacter(state,'public');
  assert.equal(alex.id,'story-alex-comparison');
  assert.equal(alex.name,'Alex');
  assert.equal(storyCharacterById(alex.id),alex);
  assert.match(alex.sceneArtwork.src,/\/assets\/characters\/story-alex-comparison-20261126\.png$/);
  assert.equal(alex.sceneArtwork.width,alex.sceneArtwork.height);
  const html=renderScene(switchRole(state));
  assert.ok(html.includes('data-scene-character="story-alex-comparison" data-scene-role="public"'));
  assert.ok(html.includes('data-scene-character-id="story-alex-comparison" data-story-fixed'));
  assert.ok(html.includes('story-alex-comparison-20261126.png'));
  assert.equal(storyCharacter(state,'garda').id,preferred.garda);
  assert.deepEqual(state,snapshot);
  assert.deepEqual(state.cast,preferred);
  assert.deepEqual(decodeState(saved),state);
  assert.equal(encodeState(decodeState(saved)),saved);
  assert.equal(storyCharacter(decodeState(saved),'public').id,alex.id);
  const completed=advance(state);
  assert.equal(completed.complete,true);
  assert.equal(storyCharacter(completed,'public').id,alex.id);
  assert.ok(renderScene(completed,{step:completed.history.at(-1),compact:true}).includes(alex.sceneArtwork.src));
  assert.ok(!renderScene(completed,{step:completed.history[0],compact:true}).includes('story-alex-comparison'));
  assert.equal(storyCharacter(revisit(completed,0),'public').id,authored?'public-1':preferred.public);
  assert.deepEqual(completed.cast,preferred);
 }
 const saved=oldToken({v:2,e:'garda-street',r:'garda',p:[[null,0,1],[null,0,1]],a:[null,null],c:Object.values(preferred)});
 const oldState=decodeState(saved);
 assert.equal(oldState.nodeId,'street-identity');
 assert.equal(storyCharacter(oldState,'public').id,'story-alex-comparison');
 assert.deepEqual(oldState.cast,preferred);
 assert.equal(encodeState(oldState),saved);
});

test('Old description routes retain their chosen roster, answers and score while recaps follow the person in each scene',()=>{
 const saved=oldToken({v:2,e:'garda-description',r:'public',p:[[0,null,0],[0,null,0]],a:[null,1],c:Object.values(preferred)});
 const state=decodeState(saved);
 assert.deepEqual(state.cast,preferred);
 assert.equal(state.nodeId,'description-power');
 assert.deepEqual(state.answers,{public:null,garda:1});
 const other=storyCharacter(state,'public');
 assert.equal(other.name,'Person matching the fuller description');
 assert.ok(existsSync(new URL(other.sceneArtwork.src)));
 const html=renderScene(state);
 assert.ok(html.includes('data-scene-character="story-other-person" data-scene-role="public"'));
 assert.ok(html.includes('data-story-prop="red-bicycle"'));
 assert.ok(!html.includes('story-amina'));
 for(const step of state.history){
  const earlier=renderScene(state,{step,compact:true});
  assert.ok(earlier.includes('story-amina.webp'));
  assert.ok(!earlier.includes('story-other-person')&&!earlier.includes('data-story-prop="red-bicycle"'));
 }
 assert.equal(storyCharacter(revisit(state),'public').name,'Amina');
 assert.deepEqual(decodeState(encodeState(state)),state);
 assert.equal(encodeState(state),saved);
 const completed=advance(state);
 assert.equal(completed.complete,true);
 assert.equal(storyCharacter(completed,'public').id,other.id);
 assert.equal(runScores(completed).public.points,3);
 assert.equal(runScores(completed).garda.points,0);
 const v1=decodeState(oldToken({v:1,e:'garda-description',r:'public',p:[],a:[null,null]}));
 assert.equal(storyCharacter(v1,'public').id,'story-amina');
});

test('Jamie stays visibly sixteen across perspectives and has a distinct portrait for the identity comparison',()=>{
 for(const id of ['public-young-person','garda-young-person']){
  let state=startEncounter(id,'public',{cast:preferred});
  assert.ok(renderScenePreview(id,{cast:preferred}).includes('story-jamie.webp'));
  while(!state.complete){
   const resolved=storyCharacter(state,'public');
   const expected=state.nodeId==='young-review'?'story-jamie-comparison':'story-jamie';
   assert.equal(resolved.id,expected);
   assert.equal(resolved.name,'Jamie');
   assert.ok(existsSync(new URL(resolved.sceneArtwork.src)));
   assert.ok(renderScene(switchRole(state)).includes('data-scene-character-id="'+expected+'" data-story-fixed'));
   state=advance(state);
  }
  assert.deepEqual(state.cast,preferred);
 }
});

test('Named individual-practice roles persist on a two-role link, while shared fictional roles keep preferences',()=>{
 const named={'public-street':'Alex','garda-street':'Alex','public-search':'Niamh','garda-search':'Niamh','public-custody':'Maya',
  'garda-communication':'Maya','garda-colleague':'Patrick','public-arrest':'Daniel','garda-new-evidence':'Daniel'};
 for(const [id,name] of Object.entries(named)){
  const shared=startEncounter(id,'public',{cast:preferred});
  assert.equal(storyCharacter(shared,'public').name,'Pat');
  const authored=startEncounter(id,'public',{cast:preferred,authored:true});
  let state=decodeState(encodeState(switchRole(advance(authored))));
  assert.deepEqual(state.cast,preferred);
  assert.equal(storyCharacter(state,'public').name,name);
  assert.equal(storyCharacter(state,'garda').name,'Garda Rory');
  while(!state.complete)state=advance(state);
  assert.equal(storyCharacter(state,'public').name,name);
  assert.equal(storyCharacter(revisit(state,0),'public').name,name);
 }
});

test('Supervision preserves a selected sergeant or depicts an eligible officer for an old non-sergeant save',()=>{
 const eligible=storyCastOptions('garda-supervision','garda').map(person=>person.id);
 assert.deepEqual(eligible,['garda-1','garda-6','garda-9']);
 for(const id of [...eligible,'garda-2']){
  const state=decodeState(oldToken({v:2,e:'garda-supervision',r:'garda',p:[[null,0,1]],a:[null,0],c:['public-2',id]}));
  assert.equal(state.cast.garda,id);
  const displayed=storyCharacter(state,'garda');
  assert.equal(displayed.id,id==='garda-2'?'garda-1':id);
  assert.ok(renderScene(state).includes('aria-label="About '+displayed.name+', Supervising sergeant"'));
  assert.match(displayed.name,/^Garda Sergeant /);
  assert.equal(runScores(state).garda.answered,2);
 }
});

