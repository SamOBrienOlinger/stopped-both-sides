import {test,expect} from '@playwright/test';
import {encounters,stageCount} from '../../encounters/catalog.mjs?v=site-repairs-20261125';
import {defaultCast} from '../../encounters/characters.mjs?v=nia-public-20261123';
import {startEncounter} from '../../encounters/engine.mjs?v=site-repairs-20261125';
import {discriminationSpacingErrors} from './scene-spacing.mjs';
import {measureLocations} from './location-measurements.mjs';

// Measure actual browser boxes rather than copying the production anchor data.
// The same opening composition must survive a browse card and the larger stage.

const cast=defaultCast();
const states=Object.values(encounters).flatMap(encounter=>Object.keys(encounter.nodes).map(nodeId=>({...startEncounter(encounter.id,'public',{cast}),nodeId})));
const openingIds=Object.fromEntries(Object.values(encounters).map(encounter=>[encounter.id,encounter.id+'/'+encounter.start]));

function checkGeometry(locations){
 for(const location of locations){
  expect(location.panelWidth,location.id+' has a rendered panel').toBeGreaterThan(40);
  for(const actor of location.actors){
   const label=location.id+'/'+actor.role;
   expect(actor.overflow,label+' retains the complete sprite').toBeLessThanOrEqual(.1);
   expect(actor.distortion,label+' preserves the sprite aspect ratio').toBeLessThan(.01);
   if(/^characters\/story-(?:amina|jamie|jamie-comparison|other-person)\.webp$/.test(actor.source)){
    expect(actor.crop,label+' displays the whole standalone figure').toBe('none');
    expect(actor.scale,label+' fits its calibrated square frame').toBeCloseTo(1,2);
   }else expect(actor.crop,label+' isolates the correct atlas cell').toMatch(/^inset\(/);
   // Group members may stand farther back; a child is intentionally smaller.
   // These broad visible-floor/legibility bounds catch vanishing figures,
   // floating people and foreground giants without enforcing one size everywhere.
   expect(actor.height,label+' remains legible').toBeGreaterThan(actor.role==='child' ? .18 : .23);
   expect(actor.height,label+' remains proportionate to the setting').toBeLessThan(.67);
   expect(actor.floor,label+' has a visible floor margin').toBeGreaterThanOrEqual(.005);
   if(location.id==='garda-colleague/colleague-specific'&&actor.role==='customer'){
    expect(actor.floor,label+' stands at the shop entrance').toBeCloseTo(.37,2);
   }else expect(actor.floor,label+' stands on the foreground floor').toBeLessThanOrEqual(.35);
  }
 }
}

function expectCompositionMatches(actual,expected,label){
 expect(actual.place,label+' setting').toBe(expected.place);
 expect(actual.asset,label+' backdrop').toBe(expected.asset);
 expect(actual.actors.map(person=>[person.role,person.character]),label+' cast').toEqual(expected.actors.map(person=>[person.role,person.character]));
 for(let i=0;i<actual.actors.length;i++)for(const key of ['x','width','height','floor']){
  expect(actual.actors[i][key],label+' '+actual.actors[i].role+' '+key).toBeCloseTo(expected.actors[i][key],2);
 }
}

test('All 34 browse pictures and all 99 stages preserve actor scale across mobile and desktop',async({page},info)=>{
 test.setTimeout(240000);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('./?lang=en#play');
 await page.evaluate(async({states,ids})=>{
  const renderer=performance.getEntriesByType('resource').find(entry=>new URL(entry.name).pathname.endsWith('/encounters/scenes.mjs'))?.name;
  if(!renderer)throw Error('The application has not loaded its scene renderer');
  const {renderScene,renderScenePreview}=await import(renderer);
  const main=document.querySelector('#main');
  main.innerHTML='<section data-review-previews style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:1rem">'+ids.map(id=>'<article class="encounter-card" data-review-preview="'+id+'"><h2>'+id+'</h2>'+renderScenePreview(id)+'</article>').join('')+'</section><section data-review-stages>'+states.map(state=>'<div style="max-width:40rem;margin:1rem auto">'+renderScene(state)+'</div>').join('')+'</section>';
  main.querySelectorAll('img').forEach(image=>image.loading='eager');
 },{states,ids:Object.keys(encounters)});
 await expect(page.locator('[data-review-preview]')).toHaveCount(34);
 await expect(page.locator('[data-review-stages] [data-scene-id]')).toHaveCount(stageCount);
 await expect.poll(()=>page.locator('#main img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
 let desktop;
 for(const width of [1366,390,280]){
  await page.setViewportSize({width,height:900});
  if((width===1366||width===390)&&info.project.name==='chromium'){
   for(const [index,scene] of (await page.locator('[data-review-stages] .scene-stage').all()).entries()){
    await scene.screenshot({path:info.outputPath('scale-'+width+'-'+String(index+1).padStart(3,'0')+'-'+states[index].id+'-'+states[index].nodeId+'.png')});
   }
   for(const [index,preview] of (await page.locator('[data-review-preview] .scene-location').all()).entries()){
    await preview.screenshot({path:info.outputPath('preview-'+width+'-'+String(index+1).padStart(2,'0')+'-'+Object.keys(encounters)[index]+'.png')});
   }
  }
  const all=await page.locator('#main .scene-location').evaluateAll(measureLocations);
  checkGeometry(all);
  const previews=all.filter(location=>location.preview);
  for(const preview of previews){
   const opening=all.find(location=>!location.preview&&location.id===openingIds[preview.id]);
   expectCompositionMatches(preview,opening,width+'px '+preview.id+' browse/opening');
  }
  if(desktop){
   expect(all).toHaveLength(desktop.length);
   for(const [index,location] of all.entries())expectCompositionMatches(location,desktop[index],width+'px '+location.id);
  }else desktop=all;
  const locations=page.locator('[data-review-stages] .scene-location');
  const ids=await locations.evaluateAll(elements=>elements.map(element=>element.closest('[data-scene-id]').dataset.sceneId));
  expect(await locations.evaluateAll(discriminationSpacingErrors,ids),width+'px group spacing').toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+'px page fits').toBe(true);
 }
 await info.attach('all-situation-scales.json',{body:JSON.stringify(desktop,null,2),contentType:'application/json'});
});
