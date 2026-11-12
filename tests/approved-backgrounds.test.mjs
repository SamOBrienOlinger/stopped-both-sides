import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {backgroundImage,approvedBackgrounds} from '../encounters/backgrounds.mjs';
import {renderScene} from '../encounters/scenes.mjs';
import {startEncounter} from '../encounters/engine.mjs';
test('All five approved originals have three local responsive sizes',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/dublin-approved/manifest.json',import.meta.url)));
 assert.equal(manifest.length,5);assert.equal(new Set(Object.values(approvedBackgrounds)).size,5);
 for(const entry of manifest){
  assert.equal(entry.outputs.length,3);assert.match(entry.source_rgb_sha256,/^[a-f0-9]{64}$/);
  for(const output of entry.outputs)assert.ok(existsSync(new URL('../assets/dublin-approved/'+output.file,import.meta.url)));
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
