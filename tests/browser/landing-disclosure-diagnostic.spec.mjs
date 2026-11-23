import {test,expect} from '@playwright/test';

// Diagnostic branch only. The workflow repeats these ten cases five times.
// Each variant preserves the real browse and Start clicks without settlement
// waits; only the indicated presentation capability changes.
const variants=[
 {name:'current'},
 {name:'all-heading-containment-off',css:'#main [data-heading-card]{container-type:normal!important}'},
 {name:'disclosure-related-containment-off',css:'#main :is(details [data-heading-card],[data-heading-card]:has(details),details[data-heading-card]){container-type:normal!important}'},
 {name:'paint-only-clipping',css:'#main details[data-disclosure-state]{overflow:visible!important;clip-path:inset(0)}'},
 {name:'native-disclosure-opening',nativeOpen:true}
];

async function recordNativeFlow(page,nativeOpen){
 await page.addInitScript(({nativeOpen})=>{
  // Exercise the production controller's native-disclosure fallback without
  // changing unrelated heading or page motion, or substituting activations.
  if(nativeOpen)Object.defineProperty(HTMLDetailsElement.prototype,'animate',{configurable:true,value:undefined});
  const events=[];let armed=false;
  const id=element=>{
   if(!element)return null;
   const action=element.closest?.('[data-action]'),topic=element.closest?.('[data-situation-topic]');
   return {tag:element.tagName||element.nodeName,id:element.id||'',
    action:action?.getAttribute('data-action')||null,situation:action?.getAttribute('data-id')||null,
    topic:topic?.getAttribute('data-situation-topic')||null};
  };
  const snapshot=()=>{
   const street=document.querySelector('.scenario-library [data-situation-topic="street"]');
   const library=document.querySelector('.scenario-library');
   return {time:performance.now(),hash:location.hash,scrollY,active:id(document.activeElement),
    street:street?{open:street.open,state:street.getAttribute('data-disclosure-state'),style:street.getAttribute('style')}:null,
    library:library?{open:library.open,state:library.getAttribute('data-disclosure-state'),style:library.getAttribute('style')}:null};
  };
  const record=(kind,event)=>{
   // Arm in the already requested Street click, without another browser RPC
   // between opening Street stops and pressing its action. Attribute reads
   // below do not force layout or sample the animation timeline.
   if(kind==='window-capture'&&event?.type==='click'&&
    event.target.closest?.('summary')?.parentElement?.getAttribute('data-situation-topic')==='street')armed=true;
   if(!armed)return;
   const point=typeof event?.clientX==='number'?{x:event.clientX,y:event.clientY}:null;
   events.push({kind,...snapshot(),event:event?{type:event.type,time:event.timeStamp,trusted:event.isTrusted,
    phase:event.eventPhase,target:id(event.target),relatedTarget:id(event.relatedTarget),
    pointerId:event.pointerId,button:event.button,buttons:event.buttons,point}:null});
  };
  for(const type of ['pointerdown','mousedown','focus','focusin','pointerup','mouseup','click','pointercancel']){
   // Window capture precedes the production document-level press hold.
   window.addEventListener(type,event=>record('window-capture',event),true);
   // Window bubble follows both the document hold and main's event handlers.
   window.addEventListener(type,event=>record('window-bubble',event));
  }
  window.addEventListener('scroll',event=>record('scroll',event),true);
  window.__realDisclosureDiagnostic={
   stop(){record('after-start',null);armed=false;return {events,final:snapshot()};}
  };
 },{nativeOpen:!!nativeOpen});
}

for(const variant of variants)for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: shared Street start with ${variant.name}`,async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await recordNativeFlow(page,variant.nativeOpen);
  let failure=null;
  try{
   await page.goto(entry+'?lang=en#encounters/'+role);
   if(variant.css)await page.addStyleTag({content:variant.css});
   await page.locator('.scenario-library>summary').click();
   await page.getByRole('button',{name:'Young people',exact:true}).click();
   if(role==='public')await expect(page.locator('.encounter-card')).toHaveCount(2);
   await page.getByRole('button',{name:'All topics',exact:true}).click();
   if(role==='public')await expect(page.locator('.encounter-card')).toHaveCount(34);
   await page.locator('.scenario-library [data-situation-topic="street"]>summary').click();
   await page.locator('.scenario-library [data-action="paired-start"][data-id="public-street"]').click();
   await expect(page.locator('#scene-title')).toBeVisible({timeout:3000});
   await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible({timeout:3000});
  }catch(error){failure=String(error);}
  const evidence=await page.evaluate(()=>window.__realDisclosureDiagnostic?.stop()).catch(error=>({error:String(error)}));
  const result={variant:variant.name,role,repeat:testInfo.repeatEachIndex,success:failure===null,failure,...evidence};
  await testInfo.attach('real-disclosure-events.json',{body:Buffer.from(JSON.stringify(result,null,2)),contentType:'application/json'});
  await page.screenshot({path:testInfo.outputPath('after-start.png'),fullPage:false});
  console.log(JSON.stringify({variant:variant.name,role,repeat:testInfo.repeatEachIndex,success:result.success,
   events:result.events?.filter(event=>event.kind==='window-capture'&&event.event?.type!=='focus').map(event=>({
    type:event.event.type,time:event.time,scrollY:event.scrollY,state:event.street?.state,
    target:event.event.target,street:event.street}))}));
  expect(failure,'the real native Start click reaches an encounter').toBeNull();
 });
}
