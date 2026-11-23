import {test,expect} from '@playwright/test';

// Diagnostic branch only. Run these eight cases twice. The actual Street
// markup is held at a deliberately partial reveal, then receives real input.
// Product sources and the original immediate-start regression tests are intact.
const variants=[
 {name:'current'},
 {name:'all-heading-containment-off',css:'#main [data-heading-card]{container-type:normal!important}'},
 {name:'paint-only-clipping',css:'#main details[data-disclosure-state]{overflow:visible!important;clip-path:inset(0)}'},
 {name:'prevent-native-focus-scroll',preventFocusScroll:true}
];

async function recordNativeFlow(page,preventFocusScroll){
 await page.addInitScript(({preventFocusScroll})=>{
  // Retain the real controller and WAAPI lifecycle while fixture preparation
  // establishes the partial clip. No other animation's duration changes.
  const animate=HTMLDetailsElement.prototype.animate;
  Object.defineProperty(HTMLDetailsElement.prototype,'animate',{configurable:true,value:function(frames,options){
   return animate.call(this,frames,this.matches('.scenario-library [data-situation-topic="street"]')?
    {...options,duration:30000}:options);
  }});
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
  if(preventFocusScroll)window.addEventListener('mousedown',event=>{
   const button=event.target.closest?.('.scenario-library [data-action="paired-start"][data-id="public-street"]');
   if(!button||event.button!==0||button.closest('[data-situation-topic="street"]')?.getAttribute('data-disclosure-state')!=='opening')return;
   event.preventDefault();button.focus({preventScroll:true});
  },true);
  window.addEventListener('scroll',event=>record('scroll',event),true);
  window.__realDisclosureDiagnostic={
   stop(){record('after-start',null);armed=false;return {events,final:snapshot()};}
  };
 },{preventFocusScroll:!!preventFocusScroll});
}

for(const variant of variants)for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: partly revealed Street start with ${variant.name}`,async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await recordNativeFlow(page,variant.preventFocusScroll);
  let failure=null,fixture=null;
  try{
   await page.goto(entry+'?lang=en#encounters/'+role);
   await page.addStyleTag({content:'#main .scenario-library [data-situation-topic="street"][data-disclosure-state]{height:var(--diagnostic-clip-height)!important}\n'+(variant.css||'')});
   await page.locator('.scenario-library>summary').click();
   await page.getByRole('button',{name:'Young people',exact:true}).click();
   if(role==='public')await expect(page.locator('.encounter-card')).toHaveCount(2);
   await page.getByRole('button',{name:'All topics',exact:true}).click();
   if(role==='public')await expect(page.locator('.encounter-card')).toHaveCount(34);
   await page.locator('.scenario-library [data-situation-topic="street"]').evaluate(street=>{
    street.style.setProperty('--diagnostic-clip-height',street.getBoundingClientRect().height+'px');
   });
   await page.locator('.scenario-library [data-situation-topic="street"]>summary').click();
   fixture=await page.evaluate(()=>{
    const street=document.querySelector('.scenario-library [data-situation-topic="street"]');
    const button=street.querySelector('[data-action="paired-start"][data-id="public-street"]');
    let panel=street.getBoundingClientRect(),control=button.getBoundingClientRect();
    street.style.setProperty('--diagnostic-clip-height',(control.top-panel.top+control.height*.65)+'px');
    control=button.getBoundingClientRect();
    scrollTo({top:scrollY+control.top-innerHeight/2,behavior:'instant'});
    panel=street.getBoundingClientRect();control=button.getBoundingClientRect();
    const point={x:control.left+control.width/2,y:control.top+control.height*.3};
    const hit=document.elementFromPoint(point.x,point.y)?.closest('[data-action="paired-start"]');
    const rect=box=>({x:box.x,y:box.y,width:box.width,height:box.height,bottom:box.bottom});
    return {state:street.getAttribute('data-disclosure-state'),scrollY,point,hit:hit===button,
     visibleFraction:(Math.min(panel.bottom,control.bottom)-Math.max(panel.top,control.top))/control.height,
     button:rect(control),panel:rect(panel),style:street.getAttribute('style')};
   });
   expect(fixture.state,'the actual controller is still opening').toBe('opening');
   expect(fixture.visibleFraction,'the actual button crosses the clip boundary').toBeGreaterThan(.55);
   expect(fixture.visibleFraction).toBeLessThan(.75);
   expect(fixture.hit,'the observed visible press point hits the actual Start button').toBe(true);
   // A real held mouse press gives the browser time to perform any queued
   // native focus scroll. There is no forced click or synthetic activation.
   await page.mouse.click(fixture.point.x,fixture.point.y,{delay:150});
   await expect(page.locator('#scene-title')).toBeVisible({timeout:3000});
   await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible({timeout:3000});
  }catch(error){failure=String(error);}
  const evidence=await page.evaluate(()=>window.__realDisclosureDiagnostic?.stop()).catch(error=>({error:String(error)}));
  const down=evidence.events?.find(event=>event.kind==='window-capture'&&event.event?.type==='pointerdown'&&event.event.target?.action==='paired-start');
  const up=evidence.events?.find(event=>event.kind==='window-capture'&&event.event?.type==='pointerup'&&event.time>=down?.time);
  const click=evidence.events?.find(event=>event.kind==='window-capture'&&event.event?.type==='click'&&event.time>=down?.time);
  const stableActivation=down?.street?.state==='opening'&&down?.event?.trusted&&up?.event?.trusted&&click?.event?.trusted&&
   up.event.target?.action==='paired-start'&&click.event.target?.action==='paired-start'&&Math.abs(up.scrollY-down.scrollY)<=1;
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
  expect(Math.abs(up.scrollY-down.scrollY),'the page does not move between press and release').toBeLessThanOrEqual(1);
  expect(failure,'the real native Start click reaches an encounter').toBeNull();
 });
}
