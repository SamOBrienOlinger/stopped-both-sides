import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {backgroundImage,approvedBackgrounds} from '../encounters/backgrounds.mjs?v=situation-locations-20261122';
import {renderScene,renderScenePreview,sceneDirections} from '../encounters/scenes.mjs?v=link-audit-20261123';
import {startEncounter} from '../encounters/engine.mjs?v=link-audit-20261123';
import {encounters} from '../encounters/catalog.mjs?v=link-audit-20261123';
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
  const image=backgroundImage(key),directory=['public','garda'].includes(key)?'dublin-approved':'scenes/groups';
  assert.ok(image.src.includes('/assets/'+directory+'/'),key+' uses the correct foreground artwork');
  assert.equal(image.srcset.split(', ').length,3);
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
 for(const [place,id] of [['bus-stop','discrimination-colleague-race'],['square','discrimination-colleague-sexual-orientation'],['football-ground','discrimination-race']]){
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

test('Only the local match uses the stadium; the colleague race situation stays at the bus stop',()=>{
 const place='football-ground',match='discrimination-race',witness='discrimination-colleague-race';
 const matches=Object.keys(sceneDirections).filter(id=>Object.values(sceneDirections[id]).some(scene=>scene.place===place));
 assert.deepEqual(matches,[match]);
 const cast={public:'public-8',garda:'garda-9'};
 for(const role of ['public','garda'])for(const nodeId of ['opening','follow-up']){
  const html=renderScene({...startEncounter(match,role,{cast}),nodeId});
  assert.match(html,/data-scene-place="football-ground"/);
  assert.match(html,/>Outside the football ground</);
  assert.match(html,/data-scene-character="public-8"/);
  assert.match(html,/data-scene-character="garda-9"/);
  assert.equal(sceneDirections[witness][nodeId].place,'bus-stop');
 }
});

// These assignments come from the written settings. They intentionally do not
// derive their expected location from the renderer under test.
const situationLocations={
 'discrimination-gender':'bicycle-workshop',
 'discrimination-civil-status':'exhibition-entrance',
 'discrimination-family-status':'community-fair',
 'discrimination-sexual-orientation':'food-festival',
 'discrimination-age':'community-fair',
 'discrimination-religious-belief':'community-hall',
 'discrimination-traveller-community':'community-hall',
 'discrimination-colleague-traveller-community':'community-fair',
 'garda-street':'closed-shop',
 'discrimination-housing-assistance':'flat-entrance',
 'discrimination-colleague-housing-assistance':'flat-entrance'
};

test('Venue-specific browse pictures and every encounter stage match the written locations',()=>{
 for(const [id,place] of Object.entries(situationLocations)){
  const image=backgroundImage(place,{group:id.startsWith('discrimination-')});
  assert.ok(image,id+' has dedicated artwork');
  assert.equal(image.name,place);
  const preview=renderScenePreview(id);
  assert.ok(preview.includes('data-scene-place="'+place+'"'),id+' preview location');
  assert.ok(preview.includes(image.src),id+' preview artwork');
  for(const nodeId of Object.keys(encounters[id].nodes))for(const role of ['public','garda']){
   const state={...startEncounter(id,role),nodeId};
   const html=renderScene(state);
   assert.equal(sceneDirections[id][nodeId].place,place,id+'/'+nodeId);
   assert.ok(html.includes('data-scene-place="'+place+'"'),id+'/'+nodeId+' setting');
   assert.ok(html.includes(image.src),id+'/'+nodeId+' artwork');
  }
  for(const source of image.srcset.split(', ')){
   const [url,width]=source.split(' ');
   assert.match(url,new RegExp('/assets/scenes/locations/'+place+'-'+parseInt(width,10)+'\\.webp\\?'));
   assert.equal(readFileSync(new URL(url)).toString('ascii',8,12),'WEBP');
  }
 }
 // Correct existing locations must not change when a new venue is introduced.
 assert.equal(sceneDirections['garda-description']['description-detail'].place,'square');
 assert.equal(sceneDirections['public-street']['street-start'].place,'street');
 assert.equal(sceneDirections['discrimination-colleague-race'].opening.place,'bus-stop');
 assert.equal(sceneDirections['discrimination-race'].opening.place,'football-ground');
});
