import {test,expect} from '@playwright/test';

// Diagnostic branch only. The workflow repeats these eight cases five times.
// Each variant preserves the real browse and Start clicks without settlement
// waits; only the indicated presentation capability changes.
const variants=[
 {name:'current'},
 {name:'all-heading-containment-off',css:'#main [data-heading-card]{container-type:normal!important}'},
 {name:'disclosure-related-containment-off',css:'#main :is(details [data-heading-card],[data-heading-card]:has(details),details[data-heading-card]){container-type:normal!important}'},
 {name:'native-disclosure-opening',nativeOpen:true}
];

async function recordNativeFlow(page,nativeOpen){
 await page.addInitScript(({nativeOpen})=>{
  // Exercise the production controller's native-disclosure fallback without
  // changing unrelated heading or page motion, or substituting activations.
  if(nativeOpen)Object.defineProperty(HTMLDetailsElement.prototype,'animate',{configurable:true,value:undefined});
  const events=[];let armed=false,frame=0;
  const id=element=>{
   if(!element)return null;
   const action=element.closest?.('[data-action]'),topic=element.closest?.('[data-situation-topic]');
   return {tag:element.tagName||element.nodeName,id:element.id||'',className:String(element.className||''),
    action:action?.getAttribute('data-action')||null,situation:action?.getAttribute('data-id')||null,
    topic:topic?.getAttribute('data-situation-topic')||null,text:element.textContent?.trim().slice(0,90)||''};
  };
  const box=element=>{
   if(!element)return null;
   const r=element.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};
  };
  const snapshot=(full=false)=>{
   const button=document.querySelector('.scenario-library [data-action="paired-start"][data-id="public-street"]');
   const street=document.querySelector('.scenario-library [data-situation-topic="street"]');
   const library=document.querySelector('.scenario-library');
   const result={time:performance.now(),hash:location.hash,scrollY,rootScroll:document.scrollingElement?.scrollTop,
    viewport:{height:innerHeight,width:innerWidth,pageTop:visualViewport?.pageTop,offsetTop:visualViewport?.offsetTop},
    active:id(document.activeElement),button:box(button),street:street?{...box(street),open:street.open,
     state:street.getAttribute('data-disclosure-state'),style:street.getAttribute('style'),scrollTop:street.scrollTop,
     animations:street.getAnimations().map(animation=>({time:animation.currentTime,state:animation.playState,rate:animation.playbackRate}))}:null,
    library:library?{...box(library),open:library.open,state:library.getAttribute('data-disclosure-state'),scrollTop:library.scrollTop}:null};
   if(full){
    result.ancestors=[];
    for(let element=button;element;element=element.parentElement){
     const style=getComputedStyle(element);
     result.ancestors.push({element:id(element),box:box(element),container:style.containerType,
      overflowX:style.overflowX,overflowY:style.overflowY,scrollTop:element.scrollTop,
      scrollHeight:element.scrollHeight,clientHeight:element.clientHeight,
      transform:style.transform,position:style.position,overflowAnchor:style.overflowAnchor});
    }
   }
   return result;
  };
  const record=(kind,event,full=true)=>{
   if(!armed)return;
   const point=typeof event?.clientX==='number'?{x:event.clientX,y:event.clientY}:null;
   events.push({kind,...snapshot(full),event:event?{type:event.type,time:event.timeStamp,trusted:event.isTrusted,
    phase:event.eventPhase,target:id(event.target),relatedTarget:id(event.relatedTarget),
    pointerId:event.pointerId,button:event.button,buttons:event.buttons,point,
    hit:point?id(document.elementFromPoint(point.x,point.y)):null}:null});
  };
  for(const type of ['pointerdown','mousedown','focus','focusin','pointerup','mouseup','click','pointercancel']){
   // Window capture precedes the production document-level press hold.
   window.addEventListener(type,event=>record('window-capture',event),true);
   // Window bubble follows both the document hold and main's event handlers.
   window.addEventListener(type,event=>record('window-bubble',event));
  }
  window.addEventListener('scroll',event=>record('scroll',event,false),true);
  document.addEventListener('DOMContentLoaded',()=>{
   new MutationObserver(records=>{
    if(records.some(record=>record.target.matches?.('.scenario-library,.scenario-library [data-situation-topic="street"]')))
     record('disclosure-mutation',null,false);
   }).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['style','open','data-disclosure-state']});
  },{once:true});
  const draw=()=>{
   if(!armed)return;
   record('frame',null,false);frame=requestAnimationFrame(draw);
  };
  window.__realDisclosureDiagnostic={
   start(){armed=true;record('before-start',null);frame=requestAnimationFrame(draw);},
   stop(){record('after-start',null);armed=false;cancelAnimationFrame(frame);return {events,final:snapshot(true)};}
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
   await page.getByRole('button',{name:'All topics',exact:true}).click();
   await page.locator('.scenario-library [data-situation-topic="street"]>summary').click();
   await page.evaluate(()=>window.__realDisclosureDiagnostic.start());
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
    target:event.event.target,hit:event.event.hit,button:event.button,street:event.street}))}));
  expect(failure,'the real native Start click reaches an encounter').toBeNull();
 });
}
