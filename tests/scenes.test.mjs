import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {encounters,roles,stageCount} from '../encounters/catalog.mjs?v=site-repairs-20261125';
import {characters} from '../encounters/characters.mjs?v=nia-public-20261123';
import {startEncounter,answer,switchRole,continueEncounter,encodeState,decodeState} from '../encounters/engine.mjs?v=site-repairs-20261125';
import {sceneDirections,sceneModel,renderScene,sceneAssets} from '../encounters/scenes.mjs?v=site-repairs-20261125';
import {translateText} from '../locales/translate.mjs?v=site-repairs-20261125';
import {backgroundImage} from '../encounters/backgrounds.mjs?v=situation-locations-20261122';
import {situationParticipants} from '../encounters/situation-cast.mjs?v=nia-public-20261123';

import {storyCharacter} from '../encounters/story-cast.mjs';
import {originalSceneDetails} from '../encounters/original-scene-props.mjs';

test('Every stage and all 90 character pairs have a complete illustration',()=>{
 let covered=0,pairRenderings=0;
 assert.deepEqual(Object.keys(sceneDirections).sort(),Object.keys(encounters).sort());
 for(const e of Object.values(encounters)){
  assert.deepEqual(Object.keys(sceneDirections[e.id]).sort(),Object.keys(e.nodes).sort());
  for(const nodeId of Object.keys(e.nodes)){
   covered++;
   for(const p of characters.public)for(const g of characters.garda){
    const state={...startEncounter(e.id,'public',{cast:{public:p.id,garda:g.id}}),nodeId};
    const html=renderScene(state),model=sceneModel(state);pairRenderings++;
    assert.ok(sceneAssets.includes(model.place));assert.ok(sceneAssets.includes(model.otherPlace));
    const people=Object.fromEntries(roles.map(role=>[role,storyCharacter(state,role,nodeId)]));
    const group=situationParticipants(e.id,state.cast,{nodeId});
    const {supporting}=originalSceneDetails(e.id,nodeId,model.place,people,{members:model.separate?['public']:roles,reservedCast:state.cast});
    const participants=group?group.map(p=>({role:p.role,key:p.key,character:p.character})):
     [...roles.map(role=>({role,key:role,character:people[role]})),...supporting];
    const actors=new Map([...html.matchAll(/data-scene-character="([^"]+)" data-scene-role="([^"]+)"[^>]*><div class="scene-sprite"><img src="([^"]+)"/g)]
     .map(([,id,key,src])=>[key,{id,src}]));
    assert.equal(actors.size,participants.length);
    for(const {role,key,character} of participants){
     const actor=actors.get(key);
     assert.equal(actor?.id,character.id,e.id+'/'+nodeId+' '+key);
     const asset=character.sceneArtwork?new URL(character.sceneArtwork.src).pathname.split('/assets/')[1]:
      role==='garda'?'characters/garda-uniforms/'+character.id+'.webp':
      character.id==='public-10'?'characters/nia-public-20261123.webp':'scenes/contextual-cast-1774.webp';
     assert.ok(actor.src.includes('/assets/'+asset),e.id+'/'+nodeId+' '+key+' uses '+asset);
    }
    assert.doesNotMatch(html,/Separate reflections|scene-portraits|undefined|NaN/);
    if(model.separate)assert.doesNotMatch(html,/data-story-prop=/,e.id+'/'+nodeId+' keeps the two locations independent');
   }
  }
 }
 assert.equal(covered,stageCount);
 assert.equal(pairRenderings,stageCount*90);
});

test('Answers update the phase while the illustrated story identities stay consistent',()=>{
 for(const e of Object.values(encounters))for(const stage of Object.values(e.nodes))for(const role of roles){
  const state={...startEncounter(e.id,role,{cast:{public:'public-6',garda:'garda-9'}}),nodeId:stage.id};
  const before=JSON.stringify(state),initial=sceneModel(state);
  stage.views[role].choices.forEach((choice,index)=>{
   const next=answer(state,index),model=sceneModel(next);
   assert.equal(initial.phase,'decision');
   assert.ok(renderScene(next).includes('data-scene-character="'+storyCharacter(next,'public',stage.id).id+'"'));
   assert.ok(renderScene(next).includes('characters/garda-uniforms/'+storyCharacter(next,'garda').id+'.webp'));
   assert.equal(model.phase,'response');assert.equal(model.choice,choice);
   assert.deepEqual(next.cast,state.cast);assert.equal(model.stage,stage);
   const switched=switchRole(next);assert.deepEqual(switched.cast,state.cast);
   assert.ok(renderScene(switched).includes('data-scene-character="'+storyCharacter(switched,'public',stage.id).id+'"'));
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
   for(const role of roles)assert.ok(html.includes('data-scene-character="'+storyCharacter(state,role,step.nodeId).id+'"'));
   assert.equal(sceneModel(state,{step}).nodeId,step.nodeId);
  }
  assert.deepEqual(startEncounter(state.id,role,{cast:state.cast}).cast,cast);
 }
});

test('Both entrypoints load scene styles and all locally delivered images exist',()=>{
 assert.ok(existsSync(new URL('../assets/scenes/contextual-cast-1774.webp',import.meta.url)));
 for(const garda of characters.garda)assert.ok(existsSync(new URL('../assets/characters/garda-uniforms/'+garda.id+'.webp',import.meta.url)));
 assert.ok(existsSync(new URL('../assets/characters/nia-public-20261123.webp',import.meta.url)));
 for(const place of sceneAssets){
  const src=backgroundImage(place)?.src||`../assets/scenes/${place}.webp`;
  assert.ok(existsSync(new URL(src,import.meta.url)),place);
 }
 for(const path of ['../index.html','../garda/index.html'])assert.match(readFileSync(new URL(path,import.meta.url),'utf8'),/encounters\/scenes.css/);
 for(const label of ['On the street','At the bus stop','At the station','Time to reflect','Reviewing the encounter','In the community','Private advice · separate perspectives','Same facts · compare the written scenarios','Your chosen response','The scene'])assert.notEqual(translateText(label,'ga'),label);
});
