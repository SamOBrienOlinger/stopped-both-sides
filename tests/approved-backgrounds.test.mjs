import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {backgroundImage,approvedBackgrounds} from '../encounters/backgrounds.mjs';
import {renderScene,renderScenePreview} from '../encounters/scenes.mjs?v=colleague-witness-20261122';
import {startEncounter} from '../encounters/engine.mjs?v=colleague-witness-20261122';
test('All five background illustrations match their recorded responsive assets',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/dublin-approved/manifest.json',import.meta.url)));
 assert.equal(manifest.length,5);assert.equal(new Set(Object.values(approvedBackgrounds)).size,5);
 for(const entry of manifest){
  assert.match(entry.source_rgb_sha256,/^[a-f0-9]{64}$/);
  assert.deepEqual(entry.outputs.map(output=>output.file),[480,960,1600].map(width=>`${entry.name}-${width}.webp`));
  for(const output of entry.outputs){
   const bytes=readFileSync(new URL('../assets/dublin-approved/'+output.file,import.meta.url));
   assert.equal(bytes.length,output.bytes,output.file);
   assert.equal(createHash('sha256').update(bytes).digest('hex'),output.sha256,output.file);
  }
 }
 for(const key of Object.keys(approvedBackgrounds)){
  const image=backgroundImage(key);assert.ok(image.src.includes('/assets/dublin-approved/'));assert.equal(image.srcset.split(', ').length,3);
 }
 assert.equal(backgroundImage('station'),null);
});
test('Exterior art keeps selected roles and narrative state unchanged',()=>{
 for(const id of ['public-street','public-search','public-fair-treatment','garda-colleague','garda-new-evidence']){
  const state=startEncounter(id,'public',{cast:{public:'public-6',garda:'garda-9'}}),before=JSON.stringify(state),html=renderScene(state);
  assert.match(html,/data-approved-art=/);assert.match(html,/srcset=/);
  assert.match(html,/data-scene-character="public-6"/);assert.match(html,/data-scene-character="garda-9"/);
  assert.equal(JSON.stringify(state),before);
 }
 const indoor=renderScene(startEncounter('public-custody'));
 assert.doesNotMatch(indoor,/data-approved-art/);assert.match(indoor,/assets\/scenes\/station.webp/);
});

test('Outdoor discrimination scenes use the same clear foreground in play and previews',()=>{
 for(const [place,id] of [['street','discrimination-housing-assistance'],['bus-stop','discrimination-colleague-race'],['square','discrimination-gender']]){
  const image=backgroundImage(place,{group:true});
  for(const source of image.srcset.split(', ')){
   const [url,width]=source.split(' ');
   assert.match(url,new RegExp('/assets/scenes/groups/'+image.name+'-'+parseInt(width,10)+'\\.webp\\?'));
   assert.equal(readFileSync(new URL(url)).toString('ascii',8,12),'WEBP');
  }
  assert.ok(renderScene(startEncounter(id)).includes(image.src));
  assert.ok(renderScenePreview(id).includes(image.src));
 }
});
