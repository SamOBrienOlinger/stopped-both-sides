import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneActorLayout,SCENE_LAYOUTS,checkSceneArtwork} from '../encounters/scene-layout.mjs';
import {encounters} from '../encounters/catalog.mjs';
import {characters} from '../encounters/characters.mjs';
import {sceneDirections,renderScene} from '../encounters/scenes.mjs';
import {startEncounter} from '../encounters/engine.mjs';
test('every scene and all 81 casts retain matching caption and actor identities',()=>{
 let count=0;
 for(const [id,e] of Object.entries(encounters))for(const nodeId of Object.keys(e.nodes)){
  const d=sceneDirections[id][nodeId];assert.ok(d);
  for(const place of [d.place,d.otherPlace])assert.ok(SCENE_LAYOUTS[place]);
  for(const p of characters.public)for(const g of characters.garda){
   const html=renderScene({...startEncounter(id),nodeId,cast:{public:p.id,garda:g.id}});
   for(const [role,c] of [['public',p],['garda',g]]){
    assert.ok(html.includes('data-scene-character="'+c.id+'"'));
    assert.ok(html.includes('data-scene-label-role="'+role+'"'));
    assert.ok(html.includes(c.name));
   }
   assert.ok(!/<div class="scene-stage[^>]*aria-hidden/.test(html));count++;
  }
 }
 assert.equal(count,59*81);
});
test('scene layout preserves shared/solo anchors and rejects mismatched artwork',()=>{
 assert.equal(sceneActorLayout('street','garda').x,50);
 assert.equal(sceneActorLayout('street','public').x,34);
 assert.equal(sceneActorLayout('station','garda',{solo:true}).x,50);
 assert.equal(sceneActorLayout('station','garda',{solo:true,wide:true}).width,32);
 assert.throws(()=>sceneActorLayout('unknown','public'));
 assert.throws(()=>sceneActorLayout('street','unknown'));
 assert.throws(()=>checkSceneArtwork('street','bus-stop'));
});
