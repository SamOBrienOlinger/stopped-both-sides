import {test as base,expect,devices} from '@playwright/test';
import {progressStorageKey} from '../../encounters/progress.mjs?v=situation-locations-20261122';
import {preferencesStorageKey} from '../../accessibility/preferences.mjs';

const test=base.extend({isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:devices['iPhone 13'].userAgent});
test.use({viewport:{width:390,height:844},reducedMotion:'no-preference',trace:'on'});
// Exact localStorage values observed immediately before Privacy in the failing
// 93c87e5 public/Garda mobile portrait traces, after the full route sequence.
const fixtures={
  "public": [
    "eyJ2IjoxLCJyb3dzIjpbWyJwdWJsaWMtYXJyZXN0IiwwLFtbMCwwLDBdXSxudWxsLG51bGxdLFsicHVibGljLXN0cmVldCIsMCxbWzAsMSwxXSxbMiwxLDFdLFszLDAsMF0sWzQsMSwxXV0sWzMsNF0sWzMsNF1dXSwibGFzdCI6ImV5SjJJam95TENKbElqb2ljSFZpYkdsakxYTjBjbVZsZENJc0luSWlPaUp3ZFdKc2FXTWlMQ0p3SWpwYld6QXNiblZzYkN3d1hTeGJNQ3h1ZFd4c0xEQmRMRnN3TEc1MWJHd3NNRjBzV3pBc2JuVnNiQ3d3WFYwc0ltRWlPbHR1ZFd4c0xHNTFiR3hkTENKaklqcGJJbkIxWW14cFl5MHlJaXdpWjJGeVpHRXROU0pkZlEiLCJzYXZlZCI6W1sic2hhcmVkIiwiZXlKMklqb3lMQ0psSWpvaWNIVmliR2xqTFhOMGNtVmxkQ0lzSW5JaU9pSndkV0pzYVdNaUxDSndJanBiV3pBc2JuVnNiQ3d3WFN4Yk1DeHVkV3hzTERCZExGc3dMRzUxYkd3c01GMHNXekFzYm5Wc2JDd3dYVjBzSW1FaU9sdHVkV3hzTEc1MWJHeGRMQ0pqSWpwYkluQjFZbXhwWXkweUlpd2laMkZ5WkdFdE5TSmRmUSIsIiNlbmNvdW50ZXJzL3B1YmxpYy9zdHJlZXQiXSxbInNoYXJlZCIsImV5SjJJam95TENKbElqb2ljSFZpYkdsakxXRnljbVZ6ZENJc0luSWlPaUp3ZFdKc2FXTWlMQ0p3SWpwYlhTd2lZU0k2VzI1MWJHd3NiblZzYkYwc0ltTWlPbHNpY0hWaWJHbGpMVElpTENKbllYSmtZUzAxSWwxOSIsIiNlbmNvdW50ZXJzL3B1YmxpYy9jdXN0b2R5Il0sWyJwcmFjdGljZSIsImV5SjJJam95TENKbElqb2ljSFZpYkdsakxYTjBjbVZsZENJc0luSWlPaUp3ZFdKc2FXTWlMQ0p3SWpwYld6QXNiblZzYkN3d1hTeGJNQ3h1ZFd4c0xEQmRMRnN3TEc1MWJHd3NNRjBzV3pBc2JuVnNiQ3d3WFYwc0ltRWlPbHR1ZFd4c0xHNTFiR3hkTENKaklqcGJJbkIxWW14cFl5MHlJaXdpWjJGeVpHRXROU0pkZlEiLCIjcHJhY3RpY2UvcHVibGljL3N0cmVldCJdLFsicHJhY3RpY2UiLCJleUoySWpveUxDSmxJam9pY0hWaWJHbGpMWE4wY21WbGRDSXNJbklpT2lKd2RXSnNhV01pTENKd0lqcGJYU3dpWVNJNlcyNTFiR3dzYm5Wc2JGMHNJbU1pT2xzaWNIVmliR2xqTFRFaUxDSm5ZWEprWVMweElsMTkiLCIjcHJhY3RpY2UvcHVibGljL3N0cmVldCJdXX0",
    "{\"language\":\"en\",\"size\":100,\"contrast\":\"standard\",\"spacing\":false,\"motion\":false}"
  ],
  "garda": [
    "eyJ2IjoxLCJyb3dzIjpbWyJwdWJsaWMtYXJyZXN0IiwxLFtbMCwxLDFdXSxudWxsLG51bGxdLFsiZ2FyZGEtc3RyZWV0IiwxLFtbMCwxLDFdLFszLDEsMV0sWzQsMSwxXV0sWzMsM10sWzMsM11dLFsicHVibGljLXN0cmVldCIsMSxbWzAsMSwxXSxbMSwxLDFdLFszLDEsMV0sWzQsMSwxXV0sWzQsNF0sWzQsNF1dXSwibGFzdCI6ImV5SjJJam95TENKbElqb2ljSFZpYkdsakxYTjBjbVZsZENJc0luSWlPaUpuWVhKa1lTSXNJbkFpT2x0YmJuVnNiQ3d3TERGZExGdHVkV3hzTERBc01WMHNXMjUxYkd3c01Dd3hYU3hiYm5Wc2JDd3dMREZkWFN3aVlTSTZXMjUxYkd3c2JuVnNiRjBzSW1NaU9sc2ljSFZpYkdsakxUSWlMQ0puWVhKa1lTMDFJbDE5Iiwic2F2ZWQiOltbInNoYXJlZCIsImV5SjJJam95TENKbElqb2ljSFZpYkdsakxYTjBjbVZsZENJc0luSWlPaUpuWVhKa1lTSXNJbkFpT2x0YmJuVnNiQ3d3TERGZExGdHVkV3hzTERBc01WMHNXMjUxYkd3c01Dd3hYU3hiYm5Wc2JDd3dMREZkWFN3aVlTSTZXMjUxYkd3c2JuVnNiRjBzSW1NaU9sc2ljSFZpYkdsakxUSWlMQ0puWVhKa1lTMDFJbDE5IiwiI2VuY291bnRlcnMvZ2FyZGEvc3RyZWV0Il0sWyJzaGFyZWQiLCJleUoySWpveUxDSmxJam9pY0hWaWJHbGpMV0Z5Y21WemRDSXNJbklpT2lKbllYSmtZU0lzSW5BaU9sdGRMQ0poSWpwYmJuVnNiQ3h1ZFd4c1hTd2lZeUk2V3lKd2RXSnNhV010TWlJc0ltZGhjbVJoTFRVaVhYMCIsIiNlbmNvdW50ZXJzL2dhcmRhL2N1c3RvZHkiXSxbInByYWN0aWNlIiwiZXlKMklqb3lMQ0psSWpvaVoyRnlaR0V0YzNSeVpXVjBJaXdpY2lJNkltZGhjbVJoSWl3aWNDSTZXMXR1ZFd4c0xEQXNNVjBzVzI1MWJHd3NNQ3d4WFN4YmJuVnNiQ3d3TERGZFhTd2lZU0k2VzI1MWJHd3NiblZzYkYwc0ltTWlPbHNpY0hWaWJHbGpMVElpTENKbllYSmtZUzAxSWwxOSIsIiNwcmFjdGljZS9nYXJkYS9zdHJlZXQiXSxbInByYWN0aWNlIiwiZXlKMklqb3lMQ0psSWpvaVoyRnlaR0V0YzNSeVpXVjBJaXdpY2lJNkltZGhjbVJoSWl3aWNDSTZXMTBzSW1FaU9sdHVkV3hzTEc1MWJHeGRMQ0pqSWpwYkluQjFZbXhwWXkweklpd2laMkZ5WkdFdE1TSmRmUSIsIiNwcmFjdGljZS9nYXJkYS9zdHJlZXQiXV19",
    "{\"language\":\"en\",\"size\":100,\"contrast\":\"standard\",\"spacing\":false,\"motion\":false}"
  ]
};
const seedKey='mobile-history-baseline-seeded',documentsKey='mobile-history-baseline-documents';

async function observe(page,role){
 const keys=[progressStorageKey(role),preferencesStorageKey(role)];
 await page.addInitScript(({keys,values,seedKey,documentsKey})=>{
  if(!sessionStorage.getItem(seedKey)){
   keys.forEach((key,index)=>localStorage.setItem(key,values[index]));
   sessionStorage.setItem(seedKey,'1');
  }
  const rect=selector=>{
   const element=document.querySelector(selector);if(!element)return null;
   const box=element.getBoundingClientRect();
   return {top:box.top,bottom:box.bottom,height:box.height,left:box.left,right:box.right};
  };
  const snapshot=()=>({at:performance.now(),url:location.href,scrollY,scrollX,
   navigationType:performance.getEntriesByType('navigation')[0]?.type,
   restoration:history.scrollRestoration,readyState:document.readyState,
   initial:!!document.querySelector('#main>.initial'),
   header:rect('.header'),opening:rect('#main>:first-child'),heading:rect('#main h1'),
   headerPosition:document.querySelector('.header')&&getComputedStyle(document.querySelector('.header')).position,
   navigationReady:document.querySelector('.header')?.classList.contains('navigation-ready'),
   stylesReady:[...document.querySelectorAll('head link[rel~="stylesheet"]')].every(link=>link.sheet),
   activeTag:document.activeElement?.tagName,activeId:document.activeElement?.id,
   viewport:{width:innerWidth,height:innerHeight},visualViewport:window.visualViewport&&{
    pageTop:visualViewport.pageTop,offsetTop:visualViewport.offsetTop,height:visualViewport.height}});
  const record={url:location.href,userAgent:navigator.userAgent,frames:[],events:[]};
  window.__mobileHistoryTrace=record;window.__mobileHistorySnapshot=snapshot;
  for(const type of ['pageshow','pageswap','pagehide','DOMContentLoaded','load'])addEventListener(type,event=>{
   record.events.push({type,persisted:event.persisted,activation:event.activation?.navigationType,...snapshot()});
   if(type==='pagehide'){
    const documents=JSON.parse(sessionStorage.getItem(documentsKey)||'[]');
    documents.push(record);sessionStorage.setItem(documentsKey,JSON.stringify(documents));
   }
  });
  const start=performance.now();
  const frame=()=>{
   record.frames.push(snapshot());
   if(performance.now()-start<2500&&record.frames.length<180)requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
 },{keys,values:fixtures[role],seedKey,documentsKey});
 return keys;
}

async function settleReading(page){
 return page.evaluate(()=>new Promise((resolve,reject)=>{
  const started=performance.now();let previous=scrollY,stable=0;
  const sample=()=>{
   const header=document.querySelector('.header').getBoundingClientRect().bottom;
   const moving=document.querySelector('.landing-instructions').getAnimations({subtree:true}).some(animation=>{
    if(animation.playState==='finished'||animation.playState==='idle')return false;
    const box=animation.effect?.target?.getBoundingClientRect();
    return box&&box.bottom>header&&box.top<innerHeight;
   });
   stable=!moving&&Math.abs(scrollY-previous)<.5?stable+1:0;previous=scrollY;
   if(stable>=6)resolve(scrollY);
   else if(performance.now()-started>5000)reject(new Error('Native reading position did not settle'));
   else requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
 }));
}

for(const [role,path] of [['public','./'],['garda','garda/']]){
 test(role+' original mobile WebKit native history characterization',async({page},testInfo)=>{
  test.setTimeout(60000);
  const keys=await observe(page,role);
  const anchor=role==='public'?'#rights/support':'#evidence/model';
  await page.goto(path+'?lang=en'+anchor);
  await expect(page.locator('#main h1')).toBeAttached();
  // Match the final portrait sequence: explicit source topic, then Home,
  // actual document reload, and the driver's supported scroll setup.
  await page.goto(path+'?lang=en#play');
  await expect(page.locator('#paired-title')).toBeAttached();
  await page.reload();
  await expect(page.locator('#paired-title')).toBeAttached();
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>scrollTo({top:500,left:0,behavior:'instant'}));
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(300);
  const readingPosition=await settleReading(page);
  const storage=()=>page.evaluate(keys=>keys.map(key=>localStorage.getItem(key)),keys);
  const before={...await page.evaluate(()=>window.__mobileHistorySnapshot()),readingPosition,stored:await storage()};
  await page.screenshot({path:testInfo.outputPath('before-privacy.png'),timeout:5000});
  await page.goto('privacy.html');await expect(page).toHaveURL(/\/privacy\.html$/);
  await page.goBack();await expect(page).toHaveURL(before.url);
  await expect(page.locator('#paired-title')).toBeAttached();
  await page.evaluate(()=>document.fonts.ready);
  const immediate=await page.evaluate(()=>window.__mobileHistorySnapshot());
  await settleReading(page);
  await page.waitForTimeout(1200);
  const after={...await page.evaluate(()=>window.__mobileHistorySnapshot()),stored:await storage()};
  await page.screenshot({path:testInfo.outputPath('after-back.png'),timeout:5000});
  const diagnostics=await page.evaluate(key=>({documents:JSON.parse(sessionStorage.getItem(key)||'[]'),current:window.__mobileHistoryTrace}),documentsKey);
  await page.goForward();await expect(page).toHaveURL(/\/privacy\.html$/);
  const record={baseline:'31dac5e23e31a686bf48f4afcf96d95021bd742d',role,before,immediate,after,forward:await page.evaluate(()=>window.__mobileHistorySnapshot()),diagnostics};
  console.log('MOBILE_HISTORY_BASELINE '+JSON.stringify({role,before:before.scrollY,readingPosition,immediate:immediate.scrollY,after:after.scrollY,restoration:after.restoration,header:after.header,heading:after.heading,navigationType:after.navigationType,forward:record.forward.url}));
  await testInfo.attach('mobile-history-baseline.json',{body:Buffer.from(JSON.stringify(record)),contentType:'application/json'});
  expect(after.stored).toEqual(before.stored);
 });
}
