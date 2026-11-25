import test from 'node:test';
import assert from 'node:assert/strict';
import {encounters} from '../encounters/catalog.mjs';
import {startEncounter} from '../encounters/engine.mjs';
import {renderScene,renderScenePreview} from '../encounters/scenes.mjs';

const objectNames=html=>[...html.matchAll(/data-story-prop="([^"]+)"/g)].map(match=>match[1]);
const roleNames=html=>[...html.matchAll(/data-scene-role="([^"]+)"/g)].map(match=>match[1]);

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
