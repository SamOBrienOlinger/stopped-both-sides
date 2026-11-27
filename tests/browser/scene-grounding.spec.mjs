import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {SCENE_GROUND_SURFACES} from './fixtures/scene-ground-surfaces.mjs';
import {buildSceneGroundingMatrix,representativeScenes,groundingCoverage,measureSceneGrounding} from './scene-grounding.mjs';

const batchSize=64;
const devices=[{width:390,height:844},{width:320,height:900},{width:568,height:320},{width:768,height:1024},{width:1366,height:900},{width:1920,height:1080}];
const editions=[['./','public'],['garda/','garda']];

async function ready(page,path='./',language='en'){
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(path+'?lang='+language+'#play',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.reference-landing .poster-hero')).toBeVisible();
 await expect(page.locator('#loading,.error')).toHaveCount(0);
 await expect(page.locator('html')).toHaveAttribute('lang',language==='en'?'en-IE':language);
 await page.evaluate(async()=>{
  await document.fonts.ready;
  const renderer=performance.getEntriesByType('resource').find(entry=>new URL(entry.name).pathname.endsWith('/encounters/scenes.mjs'))?.name;
  if(!renderer)throw Error('The application did not load its scene renderer');
  window.__groundingRenderer=await import(renderer);
 });
}

async function mount(page,items,{role='public',recap=false}={}){
 await page.evaluate(async({items,role,recap})=>{
  const renderer=window.__groundingRenderer;
  const wrap=(item,html)=>{
   if(item.surface==='preview')return '<article class="encounter-card">'+html+'</article>';
   if(item.surface==='compact')return recap?'<div class="recap-overview">'+html+'<div><p>Encounter recap</p></div></div>':'<div class="legacy-illustration">'+html+'</div>';
   return '<details class="scene-explorer" open><summary>Scene illustration</summary><div class="paired-scene-lead">'+html+'</div></details>';
  };
  const main=document.querySelector('#main');
  main.innerHTML=items.map(item=>{
   const state={...item.state,role};
   const html=item.surface==='preview'?renderer.renderScenePreview(state.id,{cast:state.cast,authored:state.authored}):renderer.renderScene(state,{compact:item.surface==='compact'});
   return '<section data-ground-case="'+item.signature+'" data-ground-surface="'+item.surface+'" data-no-translate>'+wrap(item,html)+'</section>';
  }).join('');
  const images=[...main.querySelectorAll('img')];
  images.forEach(image=>{image.loading='eager';});
  await Promise.all(images.map(image=>image.decode()));
  await document.fonts.ready;
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 },{items:items.map(({signature,surface,state})=>({signature,surface,state})),role,recap});
 await expect(page.locator('#main [data-ground-case]')).toHaveCount(items.length);
}

async function inspect(page,items,options){
 await mount(page,items,options);
 const result=await page.locator('#main .scene-location').evaluateAll(measureSceneGrounding,{surfaces:SCENE_GROUND_SURFACES});
 const expected=items.reduce((sum,item)=>sum+item.description.locations.length,0);
 expect(result.measurements.length+result.errors.filter(error=>error.issue==='scene measurement failed').length,'Every rendered location is measured').toBe(expected);
 return result;
}

async function artifact(info,name,value){
 const path=info.outputPath(name);
 await writeFile(path,JSON.stringify(value));
 await info.attach(name,{path,contentType:'application/json'});
}

function errorSummary(errors){
 // Full diagnostics remain in the JSON artifact. Keep CI annotations useful
 // when a single misplaced anchor affects hundreds of valid requested casts.
 const unique=new Map();
 for(const error of errors){
  const key=JSON.stringify([error.issue,error.place,error.role,error.roles,error.kind,error.owner,error.other,error.source]);
  if(!unique.has(key))unique.set(key,error);
 }
 return {total:errors.length,distinct:[...unique.values()].slice(0,40)};
}

// Separate surfaces keep one failing geometry category from preventing the
// other exhaustive sweeps. Each raw request is accounted for before dedupe.
for(const device of [devices[0],devices[4]])for(const surface of ['stage','compact','preview'])test(`${device.width}px ${surface}: every requested cast, authored mode and reachable scene has grounded artwork`,async({page},info)=>{
 test.setTimeout(600000);
 const matrix=buildSceneGroundingMatrix();
 expect(matrix.stages).toHaveLength(99);expect(matrix.pairs).toHaveLength(90);
 expect(matrix.stageInputs).toHaveLength(99*90*2);
 expect(matrix.previewInputs).toHaveLength(34*90*2);
 const cases=matrix.cases.filter(item=>item.surface===surface),errors=[],measurements=[];
 await page.setViewportSize(device);await ready(page);
 let measured=0,cacheEntries=0;
 for(let start=0;start<cases.length;start+=batchSize){
  const batch=cases.slice(start,start+batchSize),result=await inspect(page,batch);
  errors.push(...result.errors);measurements.push(...result.measurements);cacheEntries=result.alphaCacheEntries;measured+=batch.length;
 }
 expect(measured).toBe(cases.length);
 if(surface==='stage'&&device.width===390)await artifact(info,'scene-grounding-input-coverage.json',groundingCoverage(matrix));
 await artifact(info,'scene-grounding-'+surface+'-'+device.width+'.json',{browser:info.project.name,viewport:device,surface,logicalInputs:surface==='preview'?matrix.previewInputs.length:matrix.stageInputs.length,uniqueCompositions:measured,alphaCacheEntries:cacheEntries,errors,measurements});
 expect(errorSummary(errors),'Opaque feet/wheels, visible figures and props must fit the independently reviewed setting').toEqual({total:0,distinct:[]});
});

function compareNormalized(actual,expected){
 const errors=[];
 const key=(row,index)=>row.case+'|'+index;
 const baseline=new Map(expected.map((row,index)=>[key(row,index),row]));
 for(const [index,row] of actual.entries()){
  const before=baseline.get(key(row,index));
  if(!before){errors.push({case:row.case,issue:'responsive location missing from baseline'});continue;}
  if(row.place!==before.place||row.actors.length!==before.actors.length){errors.push({case:row.case,issue:'responsive scene changes its cast or background'});continue;}
  // Image rounding is at most one pixel at either end. Express that in the
  // smaller panel's coordinates instead of using a broad percentage margin.
  const xTolerance=1/Math.min(row.width,before.width),yTolerance=1/Math.min(row.height,before.height);
  for(let actorIndex=0;actorIndex<row.actors.length;actorIndex++){
   const actor=row.actors[actorIndex],old=before.actors[actorIndex];
   for(const property of ['frame','ink'])for(let axis=0;axis<4;axis++){
    if(Math.abs(actor[property][axis]-old[property][axis])>(axis%2?yTolerance:xTolerance))errors.push({case:row.case,place:row.place,role:actor.role,issue:'responsive '+property+' changes its normalized proportions',axis,before:old[property][axis],after:actor[property][axis]});
   }
  }
  for(let axis=0;axis<4;axis++)if(Math.abs(row.crop[axis]-before.crop[axis])>(axis%2?yTolerance:xTolerance))errors.push({case:row.case,place:row.place,issue:'responsive background crop changes',axis,before:before.crop[axis],after:row.crop[axis]});
 }
 return errors;
}

for(const [path,role] of editions)test(`${role} entrypoint: every scene structure and artwork extreme preserves grounding across device sizes`,async({page},info)=>{
 test.setTimeout(600000);
 const matrix=buildSceneGroundingMatrix(),cases=representativeScenes(matrix.cases),errors=[],rows=[];
 await page.setViewportSize(devices[0]);await ready(page,path);
 const baseline=[];
 for(const device of devices){
  await page.setViewportSize(device);
  const measured=[];
  for(let start=0;start<cases.length;start+=batchSize){
   const result=await inspect(page,cases.slice(start,start+batchSize),{role});
   errors.push(...result.errors.map(error=>({...error,viewport:device})));measured.push(...result.measurements);
  }
  if(!baseline.length)baseline.push(...measured);
  else errors.push(...compareNormalized(measured,baseline).map(error=>({...error,viewport:device})));
  rows.push({viewport:device,locations:measured.length});
 }
 // Recaps place compact scenes in a second, narrower real CSS context.
 // Enlarged RTL text exercises the badge/caption boundary while feet remain
 // physical coordinates independent of reading direction.
 await page.goto(path+'?lang=ar#play',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.reference-landing .poster-hero')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await page.evaluate(async()=>{
  document.documentElement.style.setProperty('--reading-size','200%');
  await document.fonts.ready;
  const renderer=performance.getEntriesByType('resource').find(entry=>new URL(entry.name).pathname.endsWith('/encounters/scenes.mjs'))?.name;
  window.__groundingRenderer=await import(renderer);
 });
 for(const device of [devices[1],devices[4]]){
  await page.setViewportSize(device);
  const compact=cases.filter(item=>item.surface==='compact');
  for(let start=0;start<compact.length;start+=batchSize){
   const result=await inspect(page,compact.slice(start,start+batchSize),{role,recap:true});
   errors.push(...result.errors.map(error=>({...error,viewport:device,context:'Arabic 200% recap'})));
  }
 }
 // A small set of review images covers depth, props, wheels and comparison
 // staging. The exhaustive numerical coverage does not create 11,000 PNGs.
 if(info.project.name==='chromium'){
  await page.evaluate(()=>document.documentElement.style.removeProperty('--reading-size'));
  await page.setViewportSize(devices[0]);
  const choices=[
   cases.find(item=>item.surface==='stage'&&item.description.locations.some(location=>location.actors.length===5)),
   cases.find(item=>item.surface==='stage'&&item.description.mode==='comparison'),
   matrix.cases.find(item=>item.surface==='stage'&&item.state.id==='discrimination-disability'&&item.state.cast.public==='public-6'),
   cases.find(item=>item.surface==='stage'&&item.description.locations.some(location=>location.actors.some(actor=>actor.source.includes('nia')))),
   cases.find(item=>item.surface==='stage'&&item.description.locations.some(location=>location.props.some(prop=>prop.kind==='red-bicycle')))
  ].filter(Boolean);
  for(const [index,item] of choices.entries()){
   await mount(page,[item],{role});
   await page.locator('[data-ground-case]').screenshot({path:info.outputPath('grounded-'+role+'-'+(index+1)+'-'+item.state.id+'.png')});
  }
 }
 await artifact(info,'scene-grounding-responsive-'+role+'.json',{browser:info.project.name,path,representativeCount:cases.length,structures:new Set(cases.map(item=>item.structure)).size,representativeCases:cases.map(item=>item.index),rows,errors});
 expect(errorSummary(errors),'Physical composition must survive both CSS entrypoints, device widths and enlarged RTL recaps').toEqual({total:0,distinct:[]});
});

for(const [path,role] of editions)test(`${role} landing: hero, both perspective previews and story preview stand on GPO pavement`,async({page},info)=>{
 test.setTimeout(180000);
 const errors=[],measurements=[];
 await page.setViewportSize(devices[0]);await ready(page,path);
 const locations=page.locator('.poster-hero,.perspective-scene,.story-preview__scene');
 await expect(locations).toHaveCount(4);
 await page.locator('.sbs-poster img').evaluateAll(async images=>{
  images.forEach(image=>image.loading='eager');await Promise.all(images.map(image=>image.decode()));
 });
 for(const device of devices){
  await page.setViewportSize(device);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const result=await locations.evaluateAll(measureSceneGrounding,{surfaces:SCENE_GROUND_SURFACES,landing:true});
  expect(result.measurements.length+result.errors.filter(error=>error.issue==='scene measurement failed').length).toBe(4);
  errors.push(...result.errors.map(error=>({...error,viewport:device})));measurements.push({viewport:device,locations:result.measurements});
  if(info.project.name==='chromium'&&[390,1366].includes(device.width)){
   await page.locator('.reference-landing').screenshot({path:info.outputPath('grounded-landing-'+role+'-'+device.width+'.png')});
   await page.locator('.story-preview').screenshot({path:info.outputPath('grounded-story-'+role+'-'+device.width+'.png')});
  }
 }
 await artifact(info,'scene-grounding-landing-'+role+'.json',{browser:info.project.name,path,errors,measurements});
 expect(errorSummary(errors),'Painted feet must remain on the reviewed pavement after each cover crop').toEqual({total:0,distinct:[]});
});
