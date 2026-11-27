import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {characters,characterArtwork,castForSituation} from '../encounters/characters.mjs?v=nia-public-20261123';
import {storyCharacter} from '../encounters/story-cast.mjs';
import {originalSceneDetails} from '../encounters/original-scene-props.mjs';
import {situationParticipants} from '../encounters/situation-cast.mjs?v=nia-public-20261123';
import {gardaAtlas} from '../encounters/garda-atlas.mjs';
import {gardaArtwork} from '../encounters/garda-artwork.mjs';
import {sceneCharacterArtwork} from '../encounters/scene-artwork.mjs?v=nia-public-20261123';
import {encounters,roles} from '../encounters/catalog.mjs?v=site-repairs-20261125';
import {startEncounter,answer,continueEncounter,decodeState,encodeState,switchRole} from '../encounters/engine.mjs?v=site-repairs-20261125';
import {sceneDirections,renderScene} from '../encounters/scenes.mjs?v=site-repairs-20261125';

const asset=new URL('../assets/characters/garda-baseball-2026.webp',import.meta.url);
const names=['Ciara','Rory','Jamie','Lee','Aisling','Kai','Conor','Orla','Charlie'];
const imagePart=id=>'/assets/characters/garda-uniforms/'+id+'.webp';

test('Final atlas is a real WebP and supplies nine preserved cast identities',()=>{
 assert.ok(existsSync(asset),'production WebP should be committed, not only a reference image');
 const bytes=readFileSync(asset);
 assert.equal(bytes.subarray(0,4).toString(),'RIFF');
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 assert.deepEqual(characters.garda.map(c=>c.name.replace(/^Garda (?:Sergeant )?/,'')),names);
 assert.equal(gardaAtlas.cells.length,9);
 assert.equal(gardaAtlas.width,1254);assert.equal(gardaAtlas.height,1254);
 assert.ok(Math.abs(gardaAtlas.foot/gardaAtlas.frame-.975)<1e-9);
 for(let i=0;i<9;i++){
  const character=characters.garda[i],cell=gardaAtlas.cells[i];
  const [left,top,right,bottom,centre,feet]=cell;
  assert.equal(left,(i%3)*418);assert.equal(right,left+418);
  assert.equal(top,Math.floor(i/3)*418);assert.equal(bottom,top+418);
  assert.ok(centre>left+50&&centre<right-50);
  assert.ok(feet>top+350&&feet<=bottom);
  const a=gardaArtwork(character),b=characterArtwork(character),c=sceneCharacterArtwork(character);
  for(const d of [a,b,c]){
   assert.ok(d.src.endsWith(imagePart(character.id)),character.name);
   assert.ok(existsSync(new URL(d.src)),character.name+' has a local uniform image');
   assert.ok(d.style.includes('clip-path:inset('));
   assert.equal(d.width,right-left);assert.equal(d.height,bottom-top);
  }
  assert.deepEqual(a,b);assert.deepEqual(a,c);
 }
 assert.equal(gardaArtwork(characters.public[0]),null);
 assert.match(characterArtwork(characters.public[0]).src,/\/characters\/cast\.webp/);
 assert.match(sceneCharacterArtwork(characters.public[0]).src,/\/scenes\/contextual-cast-1774\.webp/);
});

test('Every shared stage uses revised Garda artwork with each of 90 cast pairs',()=>{
 assert.equal(Object.keys(encounters).length,34);
 assert.deepEqual(Object.keys(sceneDirections).sort(),Object.keys(encounters).sort());
 let stageCount=0,pairRenderings=0;
 for(const encounter of Object.values(encounters)){
  assert.deepEqual(Object.keys(sceneDirections[encounter.id]).sort(),Object.keys(encounter.nodes).sort());
  for(const nodeId of Object.keys(encounter.nodes)){
   stageCount++;
   for(const publicCharacter of characters.public)for(const gardaCharacter of characters.garda){
    const cast={public:publicCharacter.id,garda:gardaCharacter.id};
    const state={...startEncounter(encounter.id,'public',{cast}),nodeId};
    const html=renderScene(state);pairRenderings++;
    assert.deepEqual(state.cast,castForSituation(encounter.id,cast));
    const displayed=Object.fromEntries(roles.map(role=>[role,storyCharacter(state,role)]));
    const group=situationParticipants(encounter.id,state.cast,{nodeId});
    const {place,mode}=sceneDirections[encounter.id][nodeId];
    const extras=(group||['separate','private'].includes(mode))?[]:originalSceneDetails(encounter.id,nodeId,place,displayed,{reservedCast:state.cast}).supporting;
    const people=group||[...roles.map(role=>({role,key:role,character:displayed[role]})),...extras];
    const actors=[...html.matchAll(/class="scene-actor scene-actor--([^"]+)" data-scene-character="([^"]+)" data-scene-role="([^"]+)"[^>]*><div class="scene-sprite"><img ([^>]+)>/g)];
    assert.equal(actors.length,people.length,encounter.id+'/'+nodeId);
    for(const {role,key,character} of people){
     const actor=actors.find(match=>match[1]===role&&match[2]===character.id&&match[3]===key);
     assert.ok(actor,encounter.id+'/'+nodeId+'/'+key);
     let asset;
     if(role==='garda'&&group&&key==='acting-garda'&&nodeId==='opening'){
      const column=['garda-1','garda-2'].indexOf(character.id);
      assert.ok(column>=0,'The alternate uniform sheet contains Ciara and Rory');
      asset='/characters/group-speaking-gardai.webp';
      const crop=`left:${-column*100}%;top:0%;width:200%;height:100%;clip-path:inset(0% ${(1-column)*50}% 0% ${column*50}%)`;
      assert.ok(actor[4].includes('style="'+crop+'"'),character.id+' uses its own alternate uniform');
     }else if(role==='garda'){
      asset=imagePart(character.id);
      assert.ok(actor[4].includes('style="'+gardaArtwork(character).style+'"'),character.id+' uses its own uniform');
     }
     else if(character.id==='public-10')asset='/characters/nia-public-20261123.webp';
     else if(character.sceneArtwork&&(character.id.startsWith('support-')||character.id.startsWith('story-')))
      asset='/assets/'+new URL(character.sceneArtwork.src).pathname.split('/assets/')[1];
     else asset=group||extras.some(person=>person.key===key)?'/scenes/public-gestures/'+character.id+'.webp':'/scenes/contextual-cast-1774.webp';
     assert.ok(actor[4].includes(asset),character.id+' should use '+asset);
     assert.equal(actor[4].includes('clip-path:inset('),character.sceneArtwork?character.sceneArtwork.style.includes('clip-path:inset('):true);
    }
    assert.ok(html.includes('data-scene-label-role="garda"'),'keep profile dialog buttons');
   }
  }
 }
 assert.equal(stageCount,99);
 assert.equal(pairRenderings,stageCount*90);
});

test('Switching, answering, saving and recaps retain updated Garda characters',()=>{
 for(const g of characters.garda)for(const encounter of Object.values(encounters)){
  let state=startEncounter(encounter.id,'garda',{cast:{public:'public-9',garda:g.id}});
  const savedCast={...state.cast};
  for(let i=0;i<20&&!state.complete;i++){
   const markup=renderScene(state);
   assert.ok(markup.includes(imagePart(storyCharacter(state,'garda').id)));
   state=continueEncounter(answer(state,0));
   state=decodeState(encodeState(state));
   assert.deepEqual(state.cast,savedCast);
  }
  assert.ok(state.complete,encounter.id+' / '+g.name);
  for(const step of state.history){
   const html=renderScene(state,{step,compact:true});
   assert.ok(html.includes(imagePart(storyCharacter(state,'garda',step.nodeId).id)));
   const shown=storyCharacter(state,'garda',step.nodeId);
   assert.ok(html.includes('data-scene-character="'+shown.id+'" data-scene-role="garda"'));
   assert.equal(state.cast.garda,g.id);
  }
  assert.deepEqual(switchRole(state).cast,savedCast);
 }
});

test('Scene anchors, approved backgrounds and name dialogs are retained',()=>{
 const source=readFileSync(new URL('../encounters/scenes.mjs?v=site-repairs-20261125',import.meta.url),'utf8');
 const css=readFileSync(new URL('../encounters/scenes.css',import.meta.url),'utf8');
 const caption=readFileSync(new URL('../encounters/scene-labels.mjs?v=site-repairs-20261125',import.meta.url),'utf8');
 assert.match(source,/backgroundImage\(place\)/);
 assert.match(source,/sceneActorLayout\(place,role/);
 assert.match(source,/scene-character-label/);
 assert.match(source,/data-caption-anchors/);
 assert.doesNotMatch(css,/scene-actor:is\(\[data-scene-character="garda-/);
 assert.match(caption,/createDialogController\(dialog,/);
 assert.match(caption,/modalController\.open\(/);
 assert.match(caption,/trigger\.focus/);
 assert.match(caption,/characterArtwork\(character\)/);
});
