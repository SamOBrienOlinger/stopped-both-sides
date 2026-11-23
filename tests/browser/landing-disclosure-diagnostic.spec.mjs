import {test,expect} from '@playwright/test';

// Diagnostic branch only. Run these ten cases twice. The actual Street WAAPI
// effect is held at a partial reveal, then receives ordinary native input.
// Product sources and the original immediate-start regression tests are intact.
const variants=[
 {name:'current-locator'},
 {name:'current-observed-point',observedPoint:true},
 {name:'current-direct-mouse',directMouse:true},
 {name:'keep-native-effect',keepEffect:true},
 {name:'paint-only-clipping',css:'#main details[data-disclosure-state]{overflow:visible!important;clip-path:inset(0)}'},
];

async function recordNativeFlow(page,keepEffect){
 await page.addInitScript(({keepEffect})=>{
  // Retain the real controller and WAAPI lifecycle while fixture preparation
  // establishes the partial clip. No other animation's duration changes.
  const animate=HTMLDetailsElement.prototype.animate;
  const nativeTime=Object.getOwnPropertyDescriptor(Animation.prototype,'currentTime');
  let pressActive=false,pressTime=null,track=null;
  Object.defineProperty(HTMLDetailsElement.prototype,'animate',{configurable:true,value:function(frames,options){
   if(!this.matches('.scenario-library [data-situation-topic="street"]'))return animate.call(this,frames,options);
   const animation=animate.call(this,frames,{...options,duration:30000});
   let heldTime=null;
   Object.defineProperty(animation,'currentTime',{configurable:true,
    get(){return nativeTime.get.call(animation);},
    set(value){nativeTime.set.call(animation,heldTime===null?value:heldTime);}
   });
   track={animation,hold(time){heldTime=time;nativeTime.set.call(animation,time);},
    time(){return nativeTime.get.call(animation);}};
   window.__streetNativeTimeline=track;
   if(keepEffect){
    const cancel=animation.cancel;
    Object.defineProperty(animation,'cancel',{configurable:true,value:function(){
     if(pressActive){
      // stopClock restored rate1 just before this call. Retain the native
      // sampled effect at the time captured before that restoration.
      animation.playbackRate=0;nativeTime.set.call(animation,pressTime??heldTime);return;
     }
     return cancel.call(animation);
    }});
   }
   return animation;
  }});
  if(keepEffect){
   window.addEventListener('pointerdown',event=>{
    if(event.button>0||event.isPrimary===false)return;
    pressActive=true;pressTime=track?.time()??null;
   },true);
   window.addEventListener('pointerup',()=>{setTimeout(()=>{pressActive=false;},0);},true);
   for(const type of ['click','pointercancel','blur'])window.addEventListener(type,()=>{pressActive=false;},true);
  }
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
 },{keepEffect:!!keepEffect});
}

for(const variant of variants)for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: partly revealed Street start with ${variant.name}`,async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await recordNativeFlow(page,variant.keepEffect);
  let failure=null,fixture=null;
  try{
   await page.goto(entry+'?lang=en#encounters/'+role);
   if(variant.css)await page.addStyleTag({content:variant.css});
   await page.locator('.scenario-library>summary').click();
   await page.getByRole('button',{name:'Young people',exact:true}).click();
   if(role==='public')await expect(page.locator('.encounter-card')).toHaveCount(2);
   await page.getByRole('button',{name:'All topics',exact:true}).click();
   if(role==='public')await expect(page.locator('.encounter-card')).toHaveCount(34);
   await page.evaluate(()=>document.fonts.ready);
   await page.locator('.scenario-library [data-situation-topic="street"]>summary').click();
   fixture=await page.evaluate(()=>{
    const street=document.querySelector('.scenario-library [data-situation-topic="street"]');
    const button=street.querySelector('[data-action="paired-start"][data-id="public-street"]');
    let panel=street.getBoundingClientRect(),control=button.getBoundingClientRect();
    const targetHeight=control.top-panel.top+control.height*.65;
    const timeline=window.__streetNativeTimeline;
    let low=0,high=30000;
    for(let step=0;step<20;step++){
     const time=(low+high)/2;timeline.hold(time);
     if(street.getBoundingClientRect().height<targetHeight)low=time;else high=time;
    }
    timeline.hold((low+high)/2);
    control=button.getBoundingClientRect();
    scrollTo({top:scrollY+control.top-innerHeight/2,behavior:'instant'});
    panel=street.getBoundingClientRect();control=button.getBoundingClientRect();
    const point={x:control.left+control.width/2,y:control.top+control.height*.3};
    const hit=document.elementFromPoint(point.x,point.y)?.closest('[data-action="paired-start"]');
    const centerHit=document.elementFromPoint(point.x,control.top+control.height/2)?.closest('[data-action="paired-start"]');
    const rect=box=>({x:box.x,y:box.y,width:box.width,height:box.height,bottom:box.bottom});
    return {state:street.getAttribute('data-disclosure-state'),scrollY,point,hit:hit===button,centerHit:centerHit===button,
     localPoint:{x:control.width/2,y:control.height*.3},nativeTime:timeline.time(),
     visibleFraction:(Math.min(panel.bottom,control.bottom)-Math.max(panel.top,control.top))/control.height,
     button:rect(control),panel:rect(panel),style:street.getAttribute('style')};
   });
   expect(fixture.state,'the actual controller is still opening').toBe('opening');
   expect(fixture.visibleFraction,'the actual button crosses the clip boundary').toBeGreaterThan(.55);
   expect(fixture.visibleFraction).toBeLessThan(.75);
   expect(fixture.hit,'the observed visible press point hits the actual Start button').toBe(true);
   expect(fixture.centerHit,'the default locator point is also inside the revealed button').toBe(true);
   const action=page.locator('.scenario-library [data-action="paired-start"][data-id="public-street"]');
   // Keep ordinary quick input. Locator variants retain the browser engine's
   // native scrollIntoView path; the mouse control isolates that extra step.
   if(variant.directMouse)await page.mouse.click(fixture.point.x,fixture.point.y);
   else if(variant.observedPoint)await action.click({position:fixture.localPoint});
   else await action.click();
   await expect(page.locator('#scene-title')).toBeVisible({timeout:3000});
   await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible({timeout:3000});
  }catch(error){failure=String(error);}
  const evidence=await page.evaluate(()=>window.__realDisclosureDiagnostic?.stop()).catch(error=>({error:String(error)}));
  const down=evidence.events?.find(event=>event.kind==='window-capture'&&event.event?.type==='pointerdown'&&event.event.target?.action==='paired-start');
  const up=evidence.events?.find(event=>event.kind==='window-capture'&&event.event?.type==='pointerup'&&event.time>=down?.time);
  const click=evidence.events?.find(event=>event.kind==='window-capture'&&event.event?.type==='click'&&event.time>=down?.time);
  const stableActivation=down?.street?.state==='opening'&&down?.event?.trusted&&up?.event?.trusted&&click?.event?.trusted&&
   up.event.target?.action==='paired-start'&&up.event.target?.situation==='public-street'&&
   click.event.target?.action==='paired-start'&&click.event.target?.situation==='public-street'&&Math.abs(up.scrollY-down.scrollY)<=1;
  if(!failure&&!stableActivation)failure='Native press, release, click, or scroll did not stay stable during the active reveal';
  const result={variant:variant.name,role,repeat:testInfo.repeatEachIndex,success:failure===null,failure,fixture,...evidence};
  await testInfo.attach('real-disclosure-events.json',{body:Buffer.from(JSON.stringify(result,null,2)),contentType:'application/json'});
  await page.screenshot({path:testInfo.outputPath('after-start.png'),fullPage:false});
  console.log(JSON.stringify({variant:variant.name,role,repeat:testInfo.repeatEachIndex,success:result.success,
   events:result.events?.filter(event=>event.kind==='window-capture'&&event.event?.type!=='focus').map(event=>({
    type:event.event.type,time:event.time,scrollY:event.scrollY,state:event.street?.state,
    target:event.event.target,street:event.street}))}));
  expect(down?.street?.state,'the recorded trusted press actually exercises the active partial reveal').toBe('opening');
  expect(down?.event?.trusted).toBe(true);expect(up?.event?.trusted).toBe(true);expect(click?.event?.trusted).toBe(true);
  expect(up?.event?.target?.action,'native release stays on Start').toBe('paired-start');
  expect(click?.event?.target?.action,'native activation stays on Start').toBe('paired-start');
  expect(up?.event?.target?.situation).toBe('public-street');expect(click?.event?.target?.situation).toBe('public-street');
  expect(Math.abs(up.scrollY-down.scrollY),'the page does not move between press and release').toBeLessThanOrEqual(1);
  expect(failure,'the real native Start click reaches an encounter').toBeNull();
 });
}
