import {test,expect} from '@playwright/test';
import {characters} from '../../encounters/characters.mjs';
import {encounters} from '../../encounters/catalog.mjs';
import {startEncounter,stateHash,answer,continueEncounter} from '../../encounters/engine.mjs';

const file=/\/assets\/characters\/garda-baseball-2026\.webp(?:\?|$)/;
const stage='.paired-scene-lead>.encounter-scene';
const entrypoints=[['./','public'],['garda/','garda']];
async function imageLoaded(image){
 await expect(image).toHaveAttribute('src',file);
 await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth===1254&&node.naturalHeight===1254)).toBe(true);
}
async function visibleActor(page,id){
 const actor=page.locator(stage+' [data-scene-character="'+id+'"]');
 await expect(actor).toHaveCount(1);
 await imageLoaded(actor.locator('img'));
 await expect(actor.locator('.scene-sprite')).not.toHaveCSS('transform',/matrix\(-1/);
}

for(const [path,role] of entrypoints){
 test(`${path}: all nine Garda selections, active scenes, headshots, profile dialogs and recaps use the new artwork`,async({page},info)=>{
  test.setTimeout(240000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const g of characters.garda){
   const cast={public:'public-3',garda:g.id};
   await page.setViewportSize({width:390,height:844});
   await page.goto(path+stateHash(startEncounter('public-street',role,{cast})),{waitUntil:'domcontentloaded'});
   await visibleActor(page,g.id);
   const scene=page.locator(stage);
   await expect(scene.locator('[data-scene-character="public-3"] img')).toHaveAttribute('src',/contextual-cast\.webp/);
   await expect(scene.locator('[data-scene-label-role="garda"]')).toContainText(g.name);
   await expect(page.locator('.cast-character[data-character-id="'+g.id+'"] img')).toHaveAttribute('src',file);
   if(role==='garda')await imageLoaded(page.locator('.turn-avatar img'));
   const label=scene.locator('[data-scene-label-role="garda"]');
   await label.click();
   await expect(page.locator('#scene-character-dialog')).toBeVisible();
   await expect(page.locator('#scene-character-dialog-name')).toHaveText(g.name);
   await imageLoaded(page.locator('#scene-character-dialog img'));
   await page.keyboard.press('Escape');await expect(label).toBeFocused();
   await scene.screenshot({path:info.outputPath('garda-'+g.id+'-phone.png')});
   await page.setViewportSize({width:1366,height:900});
   await scene.scrollIntoViewIfNeeded();
   await scene.screenshot({path:info.outputPath('garda-'+g.id+'-desktop.png')});
   await page.locator('[data-action="paired-switch"]').click();
   await visibleActor(page,g.id);
   await page.locator('[data-action="paired-switch"]').click();
  }
 });

 test(`${path}: all 14 shared encounters preserve Garda imagery and the approved layouts`,async({page})=>{
  test.setTimeout(180000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [i,encounter] of Object.values(encounters).entries()){
   const g=characters.garda[i%9];
   await page.goto(path+stateHash(startEncounter(encounter.id,role,{cast:{public:'public-6',garda:g.id}})),{waitUntil:'domcontentloaded'});
   await visibleActor(page,g.id);
   await expect(page.locator(stage+' .scene-panel')).toHaveCount(1);
   const location=page.locator(stage+' .scene-location');
   await expect(location).toHaveAttribute('data-scene-place',/^(street|bus-stop|square|station|advice-room|meeting-room)$/);
   await expect(page.locator('.paired-scene-lead')).toBeVisible();
   const labels=page.locator(stage+' [data-scene-label-role]');await expect(labels).toHaveCount(2);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
 });

 test(`${path}: nine Garda character choices update selector and survivor state`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(path+'#encounters/'+role);
  await page.locator('[data-action="paired-setup-characters"]').click();
  await expect(page.locator('.character-option')).toHaveCount(9);
  for(const g of characters[role]){
   const choice=page.locator('[data-character="'+g.id+'"]');
   await choice.click();
   await expect(choice).toHaveAttribute('aria-pressed','true');
   if(role==='garda')await imageLoaded(choice.locator('img'));
  }
  await page.reload();await page.locator('[data-action="paired-setup-characters"]').click();
  await expect(page.locator('[data-character="'+role+'-9"]')).toHaveAttribute('aria-pressed','true');
 });
}

test('All 81 cast pairings use one new Garda image and one preserved public image in rendered scenes',async({page})=>{
 test.setTimeout(120000);
 await page.goto('./#play');
 const result=await page.evaluate(async()=>{
  const {characters}=await import('/stopped-both-sides/encounters/characters.mjs?v=garda-baseball-20261114');
  const {startEncounter}=await import('/stopped-both-sides/encounters/engine.mjs');
  const {renderScene}=await import('/stopped-both-sides/encounters/scenes.mjs?v=garda-baseball-20261114');
  let checked=0;
  for(const p of characters.public)for(const g of characters.garda){
   const html=renderScene(startEncounter('garda-search','garda',{cast:{public:p.id,garda:g.id}}));
   if((html.match(/garda-baseball-2026.webp/g)||[]).length!==1)return {checked,wrong:g.id+' '+p.id};
   if((html.match(/contextual-cast.webp/g)||[]).length!==1)return {checked,wrong:g.id+' '+p.id};
   if(!html.includes('data-scene-character="'+g.id+'"'))return {checked,wrong:g.id};
   checked++;
  }
  return {checked};
 });
 expect(result).toEqual({checked:81});
});

test('Phone, desktop, 200% text and Arabic RTL preserve crop, captions and usable profile dialogs',async({page},info)=>{
 test.setTimeout(180000);
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const language of ['en','ar'])for(const id of ['garda-2','garda-3','garda-5','garda-7']){
  const state=startEncounter('public-search','garda',{cast:{public:'public-9',garda:id}});
  await page.goto('./?lang='+language+stateHash(state),{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
  for(const [w,h] of [[320,900],[390,844],[568,320],[768,1024],[1366,900]]){
   await page.setViewportSize({width:w,height:h});
   if(h<=448&&w>h)await expect(page.locator('.header')).toHaveCSS('position','static');
   await visibleActor(page,id);
   const label=page.locator(stage+' [data-scene-label-role="garda"]');
   await expect(label).toBeVisible();
   const metrics=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
   expect(metrics.scroll,'no horizontal overflow '+language+' '+w+' '+id).toBeLessThanOrEqual(metrics.viewport+2);
   const actor=page.locator(stage+' [data-scene-character="'+id+'"]');
   const frame=await actor.boundingBox(),panel=await page.locator(stage+' .scene-location').first().boundingBox();
   expect(frame.x,'actor stays in panel').toBeGreaterThanOrEqual(panel.x-.1);
   expect(frame.x+frame.width,'actor stays in panel').toBeLessThanOrEqual(panel.x+panel.width+.1);
   if(w===320)await page.locator(stage).screenshot({path:info.outputPath(language+'-'+id+'-'+w+'.png')});
   await label.click();
   await expect(page.locator('#scene-character-dialog')).toBeVisible();
   await imageLoaded(page.locator('#scene-character-dialog img'));
   await page.keyboard.press('Escape');await expect(label).toBeFocused();
  }
 }
});
