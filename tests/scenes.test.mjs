import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {encounters,roles,stageCount} from '../encounters/catalog.mjs';
import {characters} from '../encounters/characters.mjs';
import {startEncounter,answer,switchRole,continueEncounter,encodeState,decodeState} from '../encounters/engine.mjs';
import {sceneDirections,sceneModel,renderScene,sceneAssets} from '../encounters/scenes.mjs';
import {translateText} from '../locales/translate.mjs';

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
    assert.match(html,new RegExp(`data-scene-character="${p.id}"`));
    assert.match(html,new RegExp(`data-scene-character="${g.id}"`));
    assert.match(html,new RegExp(`left:-${p.column*100}%;top:-${p.row*100}%`));
    if(g.id==='garda-5'){
     assert.equal((html.match(/characters\/aisling-hijab.webp/g)||[]).length,3);
     for(const position of ['left:-100%;top:-0%','left:-0%;top:-100%','left:-100%;top:-100%'])assert.ok(html.includes(position+';width:200%;height:200%'));
    }else assert.match(html,new RegExp(`left:-${g.column*100}%;top:-${g.row*100}%`));
    assert.doesNotMatch(html,/undefined|NaN/);
   }
  }
 }
 assert.equal(covered,stageCount);
});

test('Every answer updates the visual moment without changing cast, facts or scoring',()=>{
 for(const e of Object.values(encounters))for(const stage of Object.values(e.nodes))for(const role of roles){
  const state={...startEncounter(e.id,role,{cast:{public:'public-6',garda:'garda-9'}}),nodeId:stage.id};
  const before=JSON.stringify(state),initial=sceneModel(state);
  stage.views[role].choices.forEach((choice,index)=>{
   const next=answer(state,index),model=sceneModel(next);
   assert.notDeepEqual(model.poses,initial.poses);
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
  assert.match(renderScene(state),/scene-location--public/);assert.match(renderScene(state),/scene-location--garda/);
 }
});

test('Recap pictures, replays and reloads keep the same pair throughout both perspectives',()=>{
 for(const e of Object.values(encounters))for(const role of roles){
  let state=startEncounter(e.id,role,{cast:{public:'public-9',garda:'garda-5'}});
  const cast={...state.cast};
  while(!state.complete){state=continueEncounter(answer(state,0));state=decodeState(encodeState(state));assert.deepEqual(state.cast,cast);}
  for(const step of state.history){
   const html=renderScene(state,{step,compact:true});
   assert.match(html,/data-scene-character="public-9"/);assert.match(html,/data-scene-character="garda-5"/);
   assert.equal(sceneModel(state,{step}).nodeId,step.nodeId);
  }
  assert.deepEqual(startEncounter(state.id,role,{cast:state.cast}).cast,cast);
 }
});

test('Both entrypoints load scene styles and all locally delivered images exist',()=>{
 assert.ok(existsSync(new URL('../assets/characters/aisling-hijab.webp',import.meta.url)));
 for(const name of sceneAssets)assert.ok(existsSync(new URL(`../assets/scenes/${name}.webp`,import.meta.url)),name);
 for(const path of ['../index.html','../garda/index.html'])assert.match(readFileSync(new URL(path,import.meta.url),'utf8'),/encounters\/scenes.css/);
 for(const label of ['On the street','At the bus stop','At the station','Time to reflect','Reviewing the encounter','In the community','Private advice · separate perspectives','Separate reflections','Same facts · compare the written scenarios','Your chosen response','The scene'])assert.notEqual(translateText(label,'ga'),label);
});
