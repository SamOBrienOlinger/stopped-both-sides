import {expect,test} from '@playwright/test';
import {encounters} from '../../encounters/catalog.mjs';
import {startEncounter} from '../../encounters/engine.mjs';
import {topicGroups} from '../../encounters/presentation.mjs';
import {renderScene} from '../../encounters/scenes.mjs';

const situations=Object.values(encounters);

function openingImage(id){
 const scene=renderScene(startEncounter(id));
 const src=scene.match(/class="scene-backdrop" src="([^"]+)"/)[1];
 return new URL(src).pathname.split('/assets/')[1];
}

async function checkImages(cards,heading,ids){
 await expect(cards).toHaveCount(ids.length);
 const previews=cards.locator(`:scope > ${heading} + img.situation-image`);
 await expect(previews).toHaveCount(ids.length);
 for(const preview of await previews.all()){
  await preview.scrollIntoViewIfNeeded();
  await expect.poll(()=>preview.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 }
 const images=await previews.evaluateAll(elements=>elements.map(img=>{
  const bounds=img.getBoundingClientRect();
  const card=img.parentElement.getBoundingClientRect();
  const heading=img.previousElementSibling.getBoundingClientRect();
  return {
   asset:new URL(img.currentSrc).pathname.split('/assets/')[1].replace(/-\d+\.webp$/,'.webp'),
   fits:bounds.width>0&&bounds.height>0&&bounds.left>=card.left&&bounds.right<=card.right&&
    bounds.top>=heading.bottom&&bounds.bottom<=card.bottom&&
    Math.abs(bounds.width/bounds.height-img.naturalWidth/img.naturalHeight)<.02,
   decorative:img.getAttribute('alt')===''
  };
 }));
 expect(images).toEqual(ids.map(id=>({
  asset:openingImage(id).replace(/-\d+\.webp$/,'.webp'),fits:true,decorative:true
 })));
}

for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role} topic and situation cards show the matching opening artwork under their headings`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const viewport of [{width:390,height:844},{width:1366,height:900}]){
   await page.setViewportSize(viewport);
   await page.goto(entry+'?lang=en#play');
   await page.locator('.topic-disclosure>summary').press('Enter');
   await checkImages(page.locator('.topic-grid>.topic-card'),'strong',topicGroups.map(topic=>topic.encounters[0]));
   await page.goto(entry+'?lang=en#encounters/'+role+'/all');
   await checkImages(page.locator('.scenario-library .encounter-card'),'h2',situations.map(situation=>situation.id));
   await page.goto(entry+'?lang=en#practice/'+role+'/all');
   await checkImages(page.locator('.scenario-library .practice-content .scenario'),'h2',
    situations.filter(situation=>situation.origin===role).map(situation=>situation.id));
  }
 });
}
