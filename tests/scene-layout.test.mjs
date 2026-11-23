import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneActorLayout,SCENE_LAYOUTS,checkSceneArtwork} from '../encounters/scene-layout.mjs?v=situation-locations-20261122';
import {encounters,stageCount} from '../encounters/catalog.mjs?v=situation-locations-20261122';
import {characters,characterFor,castForSituation} from '../encounters/characters.mjs';
import {sceneDirections,renderScene} from '../encounters/scenes.mjs?v=situation-locations-20261122';
import {startEncounter} from '../encounters/engine.mjs?v=situation-locations-20261122';
test('every scene and all 81 casts retain matching caption and actor identities',()=>{
 let count=0;
 for(const [id,e] of Object.entries(encounters))for(const nodeId of Object.keys(e.nodes)){
  const d=sceneDirections[id][nodeId];assert.ok(d);
  for(const place of [d.place,d.otherPlace])assert.ok(SCENE_LAYOUTS[place]);
  for(const p of characters.public)for(const g of characters.garda){
   const html=renderScene({...startEncounter(id),nodeId,cast:{public:p.id,garda:g.id}});
   const cast=castForSituation(id,{public:p.id,garda:g.id});
   for(const role of ['public','garda']){
    const c=characterFor(role,cast[role]);
    assert.ok(html.includes('data-scene-character="'+c.id+'"'));
    assert.ok(html.includes('data-scene-label-role="'+role+'"'));
    assert.ok(html.includes(c.name));
   }
   assert.ok(!/<div class="scene-stage[^>]*aria-hidden/.test(html));count++;
  }
 }
 assert.equal(count,stageCount*81);
});
test('scene layout preserves shared/solo anchors and rejects mismatched artwork',()=>{
 for(const place of Object.keys(SCENE_LAYOUTS)){
  const publicAnchor=sceneActorLayout(place,'public'),gardaAnchor=sceneActorLayout(place,'garda');
  assert.ok(publicAnchor.x<gardaAnchor.x,place+' separates the ordinary two-person cast');
  for(const anchor of [publicAnchor,gardaAnchor,sceneActorLayout(place,'public',{solo:true}),sceneActorLayout(place,'garda',{solo:true,wide:true})]){
   assert.ok(anchor.width>0&&anchor.width<100,place+' has a finite character size');
   assert.ok(anchor.x-anchor.width/2>=0&&anchor.x+anchor.width/2<=100,place+' retains the full sprite frame');
   assert.ok(anchor.bottom>=0&&anchor.bottom<40,place+' keeps feet on the visible floor');
  }
 }
 assert.deepEqual(sceneActorLayout('station','public',{solo:true}),sceneActorLayout('station','garda',{solo:true}));
 assert.throws(()=>sceneActorLayout('unknown','public'));
 assert.throws(()=>sceneActorLayout('street','unknown'));
 assert.throws(()=>checkSceneArtwork('street','bus-stop'));
});


test('captions expose character-specific accessible profile buttons',()=>{
 const html=renderScene(startEncounter('public-street','public',{cast:{public:'public-8',garda:'garda-9'}}));
 assert.match(html,/<button type="button" class="scene-character-label"/);
 assert.match(html,/data-scene-character-id="public-8"/);
 assert.match(html,/data-scene-character-id="garda-9"/);
 assert.match(html,/aria-haspopup="dialog" aria-controls="scene-character-dialog"/);
 assert.match(html,/aria-label="About Hassan, Member of the public"/);
 const garda=characters.garda.find(character=>character.id==='garda-9');
 assert.ok(html.includes(`aria-label="About ${garda.name}, Garda"`));
});
