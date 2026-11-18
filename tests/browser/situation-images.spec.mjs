import {expect,test} from '@playwright/test';
import {encounters} from '../../encounters/catalog.mjs';
import {defaultCast} from '../../encounters/characters.mjs';
import {startEncounter} from '../../encounters/engine.mjs';
import {topicGroups} from '../../encounters/presentation.mjs';
import {renderScene} from '../../encounters/scenes.mjs';

const situations=Object.values(encounters);
const cast=defaultCast();

function responsiveAsset(source){
 const {pathname,search}=new URL(source);
 return pathname.split('/assets/')[1].replace(/-\d+\.webp$/,'.webp')+search;
}

function openingImage(id){
 const scene=renderScene(startEncounter(id));
 const src=scene.match(/class="scene-backdrop" src="([^"]+)"/)[1];
 return responsiveAsset(src);
}

async function checkScenes(cards,heading,ids){
 await expect(cards).toHaveCount(ids.length);
 const previews=cards.locator(`:scope > ${heading} + .situation-image`);
 await expect(previews).toHaveCount(ids.length);
 for(const preview of await previews.all()){
  await preview.scrollIntoViewIfNeeded();
  await expect.poll(()=>preview.evaluate(scene=>{
   const images=[...scene.querySelectorAll('img')];
   return images.length===3&&images.every(img=>img.complete&&img.naturalWidth>0);
  })).toBe(true);
 }
 const scenes=await previews.evaluateAll(elements=>elements.map(scene=>{
  const img=scene.querySelector('.scene-backdrop');
  const bounds=scene.getBoundingClientRect();
  const card=scene.parentElement.getBoundingClientRect();
  const heading=scene.previousElementSibling.getBoundingClientRect();
  const actors=[...scene.querySelectorAll('.scene-actor')].map(actor=>{
   const frame=actor.getBoundingClientRect();
   return {
    role:actor.dataset.sceneRole,id:actor.dataset.sceneCharacter,
    visible:frame.width>0&&frame.height>0&&frame.left>=bounds.left&&frame.right<=bounds.right&&
     frame.top>=bounds.top&&frame.bottom<=bounds.bottom&&
     getComputedStyle(actor.querySelector('img')).clipPath.startsWith('inset(')
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
  actors:Object.entries(cast).map(([role,id])=>({role,id,visible:true}))
 })));
}

for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role} cards show their opening scene with a Garda and public character`,async({page})=>{
  const rendererURLs=new Set();
  page.on('request',request=>{
   const url=new URL(request.url());
   if(url.pathname.endsWith('/encounters/scenes.mjs'))rendererURLs.add(url.href);
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const viewport of [{width:390,height:844},{width:1366,height:900}]){
   await page.setViewportSize(viewport);
   await page.goto(entry+'?lang=en#play');
   await page.locator('.topic-disclosure>summary').press('Enter');
   await checkScenes(page.locator('.topic-grid>.topic-card'),'strong',topicGroups.map(topic=>topic.encounters[0]));
   await page.goto(entry+'?lang=en#encounters/'+role+'/all');
   await checkScenes(page.locator('.scenario-library .encounter-card'),'h2',situations.map(situation=>situation.id));
   await page.goto(entry+'?lang=en#practice/'+role+'/all');
   await checkScenes(page.locator('.scenario-library .practice-content .scenario'),'h2',
    situations.filter(situation=>situation.origin===role).map(situation=>situation.id));
  }
  expect([...rendererURLs], 'All pages should import the same cached scene renderer URL').toHaveLength(1);
 });
}
