import test from 'node:test';
import assert from 'node:assert/strict';
import {encounters} from '../encounters/catalog.mjs';
import {startEncounter} from '../encounters/engine.mjs';
import {renderScene,renderScenePreview} from '../encounters/scenes.mjs';

const objectNames=html=>[...html.matchAll(/data-story-prop="([^"]+)"/g)].map(match=>match[1]);
const roleNames=html=>[...html.matchAll(/data-scene-role="([^"]+)"/g)].map(match=>match[1]);
const sceneActors=html=>[...html.matchAll(/data-scene-character="([^"]+)" data-scene-role="([^"]+)"/g)]
 .map(([,id,role])=>({id,role}));

test('Original scenario thumbnails distinguish every opening and include its supporting people',()=>{
 const originals=Object.values(encounters).filter(e=>!e.id.startsWith('discrimination-'));
 const previews=originals.map(e=>renderScenePreview(e.id));
 assert.equal(new Set(previews).size,originals.length);
 for(const [id,expected] of [
  ['garda-young-person',['public','garda','friendA','friendB','colleague']],
  ['garda-colleague',['public','garda','colleague']],
  ['garda-communication',['public','garda','colleague']],
  ['public-fair-treatment',['public','garda','passerby']]
 ])assert.deepEqual(roleNames(renderScenePreview(id)),expected);
});

test('Bags, repair tools and the bicycle follow the written encounter through the relevant stages',()=>{
 const scene=(id,nodeId)=>renderScene({...startEncounter(id),nodeId});
 assert.deepEqual(objectNames(renderScenePreview('garda-colleague')),['toolbox']);
 assert.deepEqual(objectNames(renderScenePreview('public-search')),['travel-bag']);
 assert.deepEqual(objectNames(renderScenePreview('garda-search')),['travel-bag']);
 for(const node of ['description-start','description-repair','description-detail'])
  assert.deepEqual(objectNames(scene('garda-description',node)),[]);
 assert.deepEqual(objectNames(scene('garda-description','description-power')),['red-bicycle']);
 assert.deepEqual(objectNames(scene('garda-colleague','colleague-review')),[]);
 assert.deepEqual(objectNames(scene('public-search','search-end')),[]);
});

test('Jamie’s parent appears when the story confirms arrival at the station',()=>{
 const sceneAt=nodeId=>renderScene({...startEncounter('public-young-person'),nodeId});
 assert.ok(!roleNames(sceneAt('youth-start')).includes('parent'));
 assert.ok(!roleNames(sceneAt('youth-adult')).includes('parent'));
 assert.ok(roleNames(sceneAt('youth-solicitor')).includes('parent'));
});

test('Scripted people never free the stored playable avatar to become a supporting actor',()=>{
 const cases=[
  ['public-young-person','youth-solicitor','public-5','parent'],
  ['public-fair-treatment','fair-start','public-2','passerby'],
  ['garda-description','description-start','public-2','passerby'],
  ...['young-start','young-contact','young-review'].flatMap(nodeId=>[
   ['garda-young-person',nodeId,'public-1','friendB'],
   ['garda-young-person',nodeId,'public-7','friendA']
  ]),
  ['garda-street','street-information','public-8','cleaner'],
  ['garda-colleague','colleague-specific','public-3','customer']
 ];
 for(const [id,nodeId,publicId,supportRole] of cases)for(const role of ['public','garda'])for(const authored of [false,true]){
  const cast={public:publicId,garda:'garda-1'},state={...startEncounter(id,role,{cast,authored}),nodeId};
  for(const options of [{},{compact:true,step:{nodeId,answers:state.answers,continuedAs:role}}]){
   const actors=sceneActors(renderScene(state,options));
   const supporting=actors.filter(actor=>!['public','garda'].includes(actor.role));
   const context=`${id}/${nodeId}, ${role}, authored=${authored}, compact=${!!options.compact}`;
   assert.ok(supporting.some(actor=>actor.role===supportRole),context+' retains the written supporting role');
   assert.ok(supporting.every(actor=>!Object.values(cast).includes(actor.id)),context+' reserves both stored avatars');
   assert.equal(new Set(actors.map(actor=>actor.id)).size,actors.length,context+' keeps each person distinct');
  }
 }
});

test('Opening previews reserve selected avatars when a fixed story person replaces them',()=>{
 for(const [id,publicId] of [
  ['public-fair-treatment','public-2'],['garda-description','public-2'],
  ['garda-young-person','public-1'],['garda-young-person','public-7']
 ])for(const authored of [false,true]){
  const cast={public:publicId,garda:'garda-1'};
  const supporting=sceneActors(renderScenePreview(id,{cast,authored})).filter(actor=>!['public','garda'].includes(actor.role));
  assert.ok(supporting.length>0,id+' retains its supporting people');
  assert.ok(supporting.every(actor=>!Object.values(cast).includes(actor.id)),id+' does not preview a selected avatar as a third party');
 }
});
