import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {encounters,roles,stageCount} from '../encounters/catalog.mjs?v=situation-locations-20261122';
import {characters} from '../encounters/characters.mjs';
import {startEncounter,answer,switchRole,continueEncounter,encodeState,decodeState} from '../encounters/engine.mjs?v=situation-locations-20261122';
import {sceneDirections,sceneModel,renderScene,sceneAssets} from '../encounters/scenes.mjs?v=situation-locations-20261122';
import {translateText} from '../locales/translate.mjs?v=situation-locations-20261122';
import {backgroundImage} from '../encounters/backgrounds.mjs?v=situation-locations-20261122';
import {situationParticipants} from '../encounters/situation-cast.mjs?v=situation-locations-20261122';

test('Every stage and all 81 character pairs have a complete illustration',()=>{
 let covered=0;
 assert.deepEqual(Object.keys(sceneDirections).sort(),Object.keys(encounters).sort());
 for(const e of Object.values(encounters)){
  assert.deepEqual(Object.keys(sceneDirections[e.id]).sort(),Object.keys(e.nodes).sort());
  for(const nodeId of Object.keys(e.nodes)){
   covered++;
   for(const p of characters.public)for(const g of characters.garda){
    const state={...startEncounter(e.id,'public',{cast:{public:p.id,garda:g.id}}),nodeId};
    const html=renderScene(state),model=sceneModel(state);
    assert.ok(sceneAssets.includes(model.place));assert.ok(sceneAssets.includes(model.otherPlace));
    assert.match(html,new RegExp(`data-scene-character="${state.cast.public}"`));
    assert.match(html,new RegExp(`data-scene-character="${state.cast.garda}"`));
    const participants=situationParticipants(e.id,state.cast,{nodeId})||roles.map(role=>({role}));
    assert.equal((html.match(/scenes\/contextual-cast.webp/g)||[]).length,participants.filter(person=>person.role==='public'&&!person.character?.sceneArtwork).length);
    assert.equal((html.match(/characters\/discrimination-support-20261122.png/g)||[]).length,participants.filter(person=>person.character?.sceneArtwork).length);
    assert.equal((html.match(/characters\/garda-baseball-2026.webp/g)||[]).length,participants.filter(person=>person.role==='garda').length);
    assert.equal((html.match(/clip-path:inset\(/g)||[]).length,participants.length,'each character is isolated from neighbouring figures');
    assert.doesNotMatch(html,/Separate reflections|scene-portraits/);
    assert.doesNotMatch(html,/undefined|NaN|data-pose|scene-pose|reflecting-clean|speaking-clean|listening-clean/);
    assert.doesNotMatch(html,/scene-prop|props\.webp/,`${e.id}/${nodeId} must not place loose objects on the floor`);
   }
  }
 }
 assert.equal(covered,stageCount);
});

test('Answers update the phase while illustrated characters retain their neutral stance',()=>{
 for(const e of Object.values(encounters))for(const stage of Object.values(e.nodes))for(const role of roles){
  const state={...startEncounter(e.id,role,{cast:{public:'public-6',garda:'garda-9'}}),nodeId:stage.id};
  const before=JSON.stringify(state),initial=sceneModel(state);
  stage.views[role].choices.forEach((choice,index)=>{
   const next=answer(state,index),model=sceneModel(next);
   assert.equal(initial.phase,'decision');
   assert.doesNotMatch(renderScene(next),/data-pose|scenes\/(?:listening|speaking|reflecting)-clean/);
   assert.match(renderScene(next),/scenes\/contextual-cast.webp/);
   assert.match(renderScene(next),/characters\/garda-baseball-2026.webp/);
   assert.equal(model.phase,'response');assert.equal(model.choice,choice);
   assert.deepEqual(next.cast,state.cast);assert.equal(model.stage,stage);
   const switched=switchRole(next);assert.deepEqual(switched.cast,state.cast);
   assert.match(renderScene(switched),/data-scene-character="public-6"/);
  });
  assert.equal(JSON.stringify(state),before);
 }
});

test('Private advice and independent reflections keep the selected pair in separate locations',()=>{
 const keys=[['public-arrest','arrest-silence'],['public-fair-treatment','fair-record'],['garda-communication','communication-review'],['garda-colleague','colleague-review'],['garda-new-evidence','update-record']];
 for(const [id,nodeId] of keys){
  const state={...startEncounter(id),nodeId},m=sceneModel(state);
  assert.equal(m.separate,true);assert.notEqual(m.place,m.otherPlace);
  const html=renderScene(state);
  assert.match(html,/scene-location--public/);assert.match(html,/scene-location--garda/);
  const publicPanel=html.slice(html.indexOf('scene-location--public'),html.indexOf('scene-location--garda'));
  assert.match(publicPanel,/data-scene-role="public"/);assert.doesNotMatch(publicPanel,/data-scene-role="garda"/);
  if(m.mode==='separate'){assert.equal(m.label,'');assert.doesNotMatch(html,/scene-setting/);}
 }
});

test('Recap pictures, replays and reloads keep the same pair throughout both perspectives',()=>{
 for(const e of Object.values(encounters))for(const role of roles){
  let state=startEncounter(e.id,role,{cast:{public:'public-9',garda:'garda-5'}});
  const cast={...state.cast};
  while(!state.complete){state=continueEncounter(answer(state,0));state=decodeState(encodeState(state));assert.deepEqual(state.cast,cast);}
  for(const step of state.history){
   const html=renderScene(state,{step,compact:true});
   assert.match(html,new RegExp('data-scene-character="'+cast.public+'"'));assert.match(html,new RegExp('data-scene-character="'+cast.garda+'"'));
   assert.equal(sceneModel(state,{step}).nodeId,step.nodeId);
  }
  assert.deepEqual(startEncounter(state.id,role,{cast:state.cast}).cast,cast);
 }
});

test('Both entrypoints load scene styles and all locally delivered images exist',()=>{
 assert.ok(existsSync(new URL('../assets/scenes/contextual-cast.webp',import.meta.url)));
 assert.ok(existsSync(new URL('../assets/characters/garda-baseball-2026.webp',import.meta.url)));
 for(const place of sceneAssets){
  const src=backgroundImage(place)?.src||`../assets/scenes/${place}.webp`;
  assert.ok(existsSync(new URL(src,import.meta.url)),place);
 }
 for(const path of ['../index.html','../garda/index.html'])assert.match(readFileSync(new URL(path,import.meta.url),'utf8'),/encounters\/scenes.css/);
 for(const label of ['On the street','At the bus stop','At the station','Time to reflect','Reviewing the encounter','In the community','Private advice · separate perspectives','Same facts · compare the written scenarios','Your chosen response','The scene'])assert.notEqual(translateText(label,'ga'),label);
});
