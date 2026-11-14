import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {characters,characterArtwork,createCast,changeCharacter} from '../encounters/characters.mjs';
import {gardaAtlas} from '../encounters/garda-atlas.mjs';
import {gardaArtwork} from '../encounters/garda-artwork.mjs';
import {sceneCharacterArtwork} from '../encounters/scene-artwork.mjs';
import {encounters,roles} from '../encounters/catalog.mjs';
import {startEncounter,answer,continueEncounter,decodeState,encodeState,switchRole} from '../encounters/engine.mjs';
import {sceneDirections,renderScene} from '../encounters/scenes.mjs';

const asset=new URL('../assets/characters/garda-baseball-2026.webp',import.meta.url);
const names=['Ciara','Rory','Jamie','Lee','Aisling','Kai','Conor','Orla','Charlie'];
const imagePart='/assets/characters/garda-baseball-2026.webp';

test('Final atlas is a real WebP and supplies nine preserved cast identities',()=>{
 assert.ok(existsSync(asset),'production WebP should be committed, not only a reference image');
 const bytes=readFileSync(asset);
 assert.equal(bytes.subarray(0,4).toString(),'RIFF');
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 assert.deepEqual(characters.garda.map(c=>c.name),names);
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
   assert.ok(d.src.includes(imagePart),character.name);
   assert.ok(d.style.includes('clip-path:inset('));
   assert.equal(d.width,1254);assert.equal(d.height,1254);
  }
  assert.deepEqual(a,b);assert.deepEqual(a,c);
 }
 assert.equal(gardaArtwork(characters.public[0]),null);
 assert.match(characterArtwork(characters.public[0]).src,/\/characters\/cast\.webp/);
 assert.match(sceneCharacterArtwork(characters.public[0]).src,/\/scenes\/contextual-cast\.webp/);
});

test('Every shared stage uses revised Garda artwork with each of 81 cast pairs',()=>{
 assert.equal(Object.keys(encounters).length,14);
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
    assert.match(html,new RegExp('data-scene-character="'+gardaCharacter.id+'"'));
    assert.match(html,new RegExp('data-scene-character="'+publicCharacter.id+'"'));
    assert.equal((html.match(/characters\/garda-baseball-2026.webp/g)||[]).length,1);
    assert.equal((html.match(/scenes\/contextual-cast.webp/g)||[]).length,1);
    assert.equal((html.match(/clip-path:inset\(/g)||[]).length,2);
    assert.ok(html.includes('data-scene-label-role="garda"'),'keep profile dialog buttons');
   }
  }
 }
 assert.equal(stageCount,59);
 assert.equal(pairRenderings,59*81);
});

test('Switching, answering, saving and recaps retain updated Garda characters',()=>{
 for(const g of characters.garda)for(const encounter of Object.values(encounters)){
  let state=startEncounter(encounter.id,'garda',{cast:{public:'public-9',garda:g.id}});
  const savedCast={...state.cast};
  for(let i=0;i<20&&!state.complete;i++){
   const markup=renderScene(state);
   assert.match(markup,/characters\/garda-baseball-2026.webp/);
   state=continueEncounter(answer(state,0));
   state=decodeState(encodeState(state));
   assert.deepEqual(state.cast,savedCast);
  }
  assert.ok(state.complete,encounter.id+' / '+g.name);
  for(const step of state.history){
   const html=renderScene(state,{step,compact:true});
   assert.match(html,/characters\/garda-baseball-2026.webp/);
   assert.match(html,new RegExp('data-scene-character="'+g.id+'"'));
  }
  assert.deepEqual(switchRole(state).cast,savedCast);
 }
});

test('Scene anchors, approved backgrounds and name dialogs are retained',()=>{
 const source=readFileSync(new URL('../encounters/scenes.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../encounters/scenes.css',import.meta.url),'utf8');
 const caption=readFileSync(new URL('../encounters/scene-labels.mjs',import.meta.url),'utf8');
 assert.match(source,/backgroundImage\(place\)/);
 assert.match(source,/sceneActorLayout\(place,role/);
 assert.match(source,/scene-character-label/);
 assert.match(source,/data-caption-anchors/);
 assert.doesNotMatch(css,/scene-actor:is\(\[data-scene-character="garda-/);
 assert.match(caption,/modal\.showModal\(/);
 assert.match(caption,/trigger\.focus/);
 assert.match(caption,/characterArtwork\(character\)/);
});
