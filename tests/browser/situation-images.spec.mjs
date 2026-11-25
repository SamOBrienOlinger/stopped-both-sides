import {expect,test} from '@playwright/test';
import {encounters} from '../../encounters/catalog.mjs?v=site-repairs-20261125';
import {defaultCast} from '../../encounters/characters.mjs?v=nia-public-20261123';
import {startEncounter} from '../../encounters/engine.mjs?v=site-repairs-20261125';
import {topicGroups} from '../../encounters/presentation.mjs?v=site-repairs-20261125';
import {renderScene} from '../../encounters/scenes.mjs?v=site-repairs-20261125';
import {situationParticipants} from '../../encounters/situation-cast.mjs?v=nia-public-20261123';
import {discriminationSpacingErrors} from './scene-spacing.mjs';

import {storyCharacter} from '../../encounters/story-cast.mjs';
import {originalSceneDetails} from '../../encounters/original-scene-props.mjs';
import {sceneDirections} from '../../encounters/scenes.mjs?v=site-repairs-20261125';
const cast=defaultCast();
function previewCast(id,authored){
 const group=situationParticipants(id,cast);
 if(group)return group.map(p=>({role:p.key,id:p.characterId,visible:true}));
 const nodeId=encounters[id].start;
 const selected=Object.fromEntries(Object.keys(cast).map(role=>[role,storyCharacter({id,nodeId,cast,authored},role)]));
 const extras=originalSceneDetails(id,nodeId,sceneDirections[id][nodeId].place,selected).supporting;
 return [...Object.entries(selected).map(([role,c])=>({role,id:c.id,visible:true})),
  ...extras.map(({key,character})=>({role:key,id:character.id,visible:true}))];
}

function responsiveAsset(source){
 const {pathname,search}=new URL(source);
 return pathname.split('/assets/')[1].replace(/-\d+\.webp$/,'.webp')+search;
}

function openingImage(id){
 const scene=renderScene(startEncounter(id));
 const src=scene.match(/class="scene-backdrop" src="([^"]+)"/)[1];
 return responsiveAsset(src);
}

async function checkScenes(cards,heading,ids,authored=false){
 await expect(cards).toHaveCount(ids.length);
 const previews=cards.locator(`:scope > ${heading} + .situation-image`);
 await expect(previews).toHaveCount(ids.length);
 for(const [index,preview] of (await previews.all()).entries()){
  await preview.scrollIntoViewIfNeeded();
  await expect.poll(()=>preview.evaluate((scene,count)=>{
   const images=[...scene.querySelectorAll('img')];
   return scene.querySelectorAll('.scene-sprite img').length===count&&images.every(img=>img.complete&&img.naturalWidth>0);
  },previewCast(ids[index],authored).length)).toBe(true);
 }
 const scenes=await previews.evaluateAll(elements=>elements.map(scene=>{
  const img=scene.querySelector('.scene-backdrop');
  const bounds=scene.getBoundingClientRect();
  const card=scene.parentElement.getBoundingClientRect();
  const heading=scene.previousElementSibling.getBoundingClientRect();
  const actors=[...scene.querySelectorAll('.scene-actor')].map(actor=>{
   const frame=actor.getBoundingClientRect();
   const image=actor.querySelector('img');
   const isolated=getComputedStyle(image).clipPath.startsWith('inset(')||
    (new URL(image.src).pathname.includes('/story-')&&image.naturalWidth===image.naturalHeight);
   return {
    role:actor.dataset.sceneRole,id:actor.dataset.sceneCharacter,
    visible:frame.width>0&&frame.height>0&&frame.left>=bounds.left&&frame.right<=bounds.right&&
     frame.top>=bounds.top&&frame.bottom<=bounds.bottom&&
     isolated
   };
  });
  return {
   asset:img.currentSrc,
   fits:bounds.width>0&&bounds.height>0&&bounds.left>=card.left&&bounds.right<=card.right&&
    bounds.top>=heading.bottom&&bounds.bottom<=card.bottom&&
    Math.abs(bounds.width/bounds.height-img.naturalWidth/img.naturalHeight)<.02,
   actors,
   decorative:scene.getAttribute('aria-hidden')==='true'&&!scene.querySelector('a,button,[tabindex]')
  };
 }));
 expect(scenes.map(scene=>({...scene,asset:responsiveAsset(scene.asset)}))).toEqual(ids.map(id=>({
  asset:openingImage(id),fits:true,decorative:true,
  actors:previewCast(id,authored)
 })));
 expect(await previews.evaluateAll(discriminationSpacingErrors,ids),'Preview figure spacing').toEqual([]);
}

for(const [entry,role] of [['./','public'],['garda/','garda']])for(const viewport of [{width:390,height:844},{width:1366,height:900}]){
 test(`${role} ${viewport.width}px cards show their opening scene with the story's characters`,async({page})=>{
  const rendererURLs=new Set();
  page.on('request',request=>{
   const url=new URL(request.url());
   if(url.pathname.endsWith('/encounters/scenes.mjs'))rendererURLs.add(url.href);
  });
  await page.emulateMedia({reducedMotion:'reduce'});
   await page.setViewportSize(viewport);
   await page.goto(entry+'?lang=en#play');
   await page.locator('.topic-disclosure>summary').press('Enter');
   for(const topic of topicGroups){
    const group=page.locator(`[data-situation-topic="${topic.id}"]`);
    await group.locator(':scope>summary').press('Enter');
    for(const summary of await group.locator('.discrimination-ground>summary').all())await summary.press('Enter');
    await checkScenes(group.locator('.encounter-card'),'h3',topic.encounters);
    await group.locator(':scope>summary').press('Space');
   }
   await page.goto(entry+'?lang=en#encounters/'+role+'/all');
   await page.getByRole('button',{name:'All topics',exact:true}).click();
   for(const summary of await page.locator('.scenario-library .situation-topic>summary').all())await summary.press('Enter');
   for(const summary of await page.locator('.scenario-library .discrimination-ground>summary').all())await summary.press('Enter');
   await checkScenes(page.locator('.scenario-library .encounter-card'),'h2',topicGroups.flatMap(topic=>topic.encounters));
   await page.goto(entry+'?lang=en#practice/'+role+'/all');
   await page.getByRole('button',{name:'All topics',exact:true}).click();
   for(const summary of await page.locator('.scenario-library .situation-topic>summary').all())await summary.press('Enter');
   for(const summary of await page.locator('.scenario-library .discrimination-ground>summary').all())await summary.press('Enter');
   await checkScenes(page.locator('.scenario-library .practice-content .scenario'),'h2',
    topicGroups.flatMap(topic=>topic.encounters).filter(id=>encounters[id].origin===role),true);
  expect([...rendererURLs], 'All pages should import the same cached scene renderer URL').toHaveLength(1);
 });
}
