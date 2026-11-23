import {test,expect} from '@playwright/test';
import {encounters} from '../../encounters/catalog.mjs?v=link-audit-20261123';
import {startEncounter,currentStage,answer,switchRole,continueEncounter,stateHash,decodeState} from '../../encounters/engine.mjs?v=link-audit-20261123';

const readState=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);

function answeredThirdStage(role){
 let state=startEncounter('public-search',role,{cast:{public:'public-2',garda:'garda-5'}});
 for(let step=0;step<2;step++){
  for(const perspective of ['public','garda']){
   state=switchRole(state,perspective);
   const choice=currentStage(state).views[perspective].choices.findIndex(item=>item.points===1);
   state=answer(state,choice);
  }
  state=continueEncounter(switchRole(state,role));
 }
 return answer(state,0);
}

const openingGeometry=()=>{
 const header=document.querySelector('.header'),title=document.querySelector('#scene-title');
 const bar=header.getBoundingClientRect(),heading=title.getBoundingClientRect();
 return {
  atTop:Math.abs(scrollY)<=1,
  headerVisible:Math.abs(bar.top)<=1&&bar.bottom<=innerHeight&&getComputedStyle(header).opacity==='1',
  titleClear:heading.top>=bar.bottom-1&&heading.bottom<=innerHeight,
  noHorizontalOverflow:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1
 };
};

for(const [path,role] of [['./','public'],['garda/','garda']]){
 test(role+' previous-stage control preserves earlier history and restores an unanswered decision',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const initial=answeredThirdStage(role);
  expect(initial.complete).toBe(false);expect(initial.history).toHaveLength(2);
  await page.goto(path+'?lang=en'+stateHash(initial));
  await expect(page.locator('#feedback')).toBeVisible();
  expect(readState(page)).toEqual(initial);

  for(const activation of ['pointer','keyboard']){
   const before=readState(page),previous=before.history.at(-1);
   const control=page.locator('[data-action="paired-back"]');
   await expect(control).toHaveAccessibleName('Revisit the previous stage');
   if(activation==='pointer')await control.click();else await control.press('Enter');
   await expect.poll(()=>readState(page)).toEqual({
    ...before,nodeId:previous.nodeId,history:before.history.slice(0,-1),
    answers:{public:null,garda:null},complete:false
   });
   const title=page.locator('#scene-title');
   await expect(title).toHaveText(encounters[before.id].nodes[previous.nodeId].title);
   await expect(title).toBeFocused();
   await expect(page.locator('#feedback')).toHaveCount(0);
   await expect.poll(()=>page.evaluate(openingGeometry)).toEqual({
    atTop:true,headerVisible:true,titleClear:true,noHorizontalOverflow:true
   });
  }

  await expect(page.locator('[data-action="paired-back"]')).toHaveCount(0);
  await page.locator('[data-action="paired-answer"]').first().click();
  await expect(page.locator('#feedback')).toBeFocused();
  expect(readState(page)).toMatchObject({
   role,cast:initial.cast,nodeId:initial.history[0].nodeId,history:[],answers:{[role]:0}
  });
 });

 test(role+' Back to Top preserves the game and settles below the visible navbar',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const initial=answeredThirdStage(role);
  await page.goto(path+'?lang=en'+stateHash(initial));
  const title=page.locator('#scene-title'),wordmark=page.locator('.header .wordmark');
  await expect(title).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  const beforeURL=page.url(),beforeTitle=await title.textContent();

  for(const motion of ['no-preference','reduce']){
   await page.emulateMedia({reducedMotion:motion});
   const control=page.locator('[data-back-to-top]');
   await control.scrollIntoViewIfNeeded();
   await expect(control).toBeVisible();
   await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(50);
   await control.click();
   await expect(wordmark).toBeFocused();
   await expect.poll(()=>page.evaluate(openingGeometry)).toEqual({
    atTop:true,headerVisible:true,titleClear:true,noHorizontalOverflow:true
   });
   expect(page.url()).toBe(beforeURL);
   expect(readState(page)).toEqual(initial);
   await expect(title).toHaveText(beforeTitle);

   const positions=await page.evaluate(()=>new Promise(resolve=>{
    const samples=[],started=performance.now();
    const sample=()=>{
     const header=document.querySelector('.header').getBoundingClientRect();
     const heading=document.querySelector('#scene-title').getBoundingClientRect();
     samples.push({scrollY,headerTop:header.top,titleClear:heading.top>=header.bottom-1});
     if(samples.length>=16&&performance.now()-started>=500)resolve(samples);
     else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
   }));
   expect(positions.every(item=>Math.abs(item.scrollY)<=1&&Math.abs(item.headerTop)<=1&&item.titleClear),
    motion+' keeps the opening steady after Back to Top').toBe(true);
  }
 });
}
