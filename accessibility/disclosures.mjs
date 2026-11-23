import {paceAnimations} from './animation-clock.mjs?v=learning-language-20261120';

// Animate measured pixels rather than the experimental details-content pseudo
// element, so opening and closing behave the same in all supported browsers.
export function createDisclosures({main,allowed,onStart=()=>{},onFinish=()=>{}}){
 const active=new Map();
 let press=null;
 const properties=['height','overflow','overflow-anchor'];
 const restore=(element,property,value)=>{
  if(value.value)element.style.setProperty(property,value.value,value.priority);
  else element.style.removeProperty(property);
 };
 function intent(state,open){
  state.open=open;
  state.details.setAttribute('data-disclosure-state',open?'opening':'closing');
  state.summary.setAttribute('aria-expanded',String(open));
  if(!open&&state.details.contains(document.activeElement)&&!state.summary.contains(document.activeElement)){
   state.summary.focus({preventScroll:true});
  }
  // Native open remains in place while a close is drawn. Its contents stop
  // receiving input or accessibility focus as soon as the user closes it.
  for(const [element,inert] of state.contents)element.inert=open?inert:true;
 }
 function finish(state,open=state.open){
  if(active.get(state.details)!==state)return;
  // Completing a clipped panel between pointerdown and click can change the
  // browser's scroll position and send pointerup to a different control.
  // An unrelated redraw may remove the panel; detached content can clean up.
  if(press?.states.has(state)&&!press.clicked&&state.details.isConnected){
   state.pendingOpen=open;return;
  }
  press?.states.delete(state);state.frozen=false;
  active.delete(state.details);state.stopClock?.();
  state.animation.onfinish=null;state.animation.oncancel=null;
  state.details.open=open;
  state.animation.cancel();
  for(const property of properties)restore(state.details,property,state.styles[property]);
  for(const [element,inert] of state.contents)element.inert=inert;
  if(state.expanded===null)state.summary.removeAttribute('aria-expanded');
  else state.summary.setAttribute('aria-expanded',state.expanded);
  state.details.removeAttribute('data-disclosure-state');
  onFinish(state.details);
 }
 function freeze(state){
  // Preserve the pixels already drawn, including the clip. Merely pausing
  // WAAPI is insufficient: the frame clock writes currentTime independently.
  const height=state.details.getBoundingClientRect().height;
  press.states.add(state);state.frozen=true;
  state.stopClock?.();
  state.animation.onfinish=null;state.animation.oncancel=null;
  state.details.style.setProperty('height',height+'px');
  state.animation.cancel();
 }
 function releasePress(){
  const previous=press;
  if(!previous)return;
  press=null;globalThis.clearTimeout(previous.timer);
  for(const state of previous.states){
   if(state.frozen){state.frozen=false;finish(state,state.pendingOpen??state.open);}
  }
 }
 function play(state){
  const animation=state.animation;
  state.stopClock=paceAnimations([animation],()=>{
   if(state.animation===animation)finish(state);
  });
  animation.onfinish=()=>finish(state);animation.oncancel=()=>finish(state);
 }
 function settle(){for(const state of [...active.values()])finish(state);}
 function retarget(state,open){
  // Read the visible size before changing intent. Reversing a pending WAAPI
  // timeline can resample a later frame in Firefox; a new pixel start keeps
  // the pressed panel exactly where it was when the user changed direction.
  const from=state.details.getBoundingClientRect().height,to=open?state.openHeight:state.closedHeight;
  // A summary click may reverse the panel held by this press. Its new
  // animation starts at the held height and must not be settled on release.
  press?.states.delete(state);state.frozen=false;delete state.pendingOpen;
  state.details.style.setProperty('height',from+'px');
  state.stopClock?.();
  state.animation.onfinish=null;state.animation.oncancel=null;state.animation.cancel();
  intent(state,open);
  if(!allowed()||Math.abs(to-from)<1){finish(state);return;}
  const remaining=Math.abs(to-from)/Math.abs(state.openHeight-state.closedHeight);
  try{
   state.animation=state.details.animate([{height:from+'px'},{height:to+'px'}],{
    duration:Math.max(120,Math.min(800,800*remaining)),easing:'cubic-bezier(.4,0,.2,1)',fill:'both'
   });
   play(state);
  }catch{finish(state);}
 }
 main.addEventListener('click',event=>{
  // Click's target is now fixed. Nested disclosures may safely settle their
  // ancestors before measuring, and summary reversals retain their animation.
  if(press)press.clicked=true;
  const summary=event.target.closest?.('summary'),details=summary?.parentElement;
  if(event.defaultPrevented||event.button>0||details?.tagName!=='DETAILS'||summary!==details.querySelector('summary'))return;
  // Links and controls inside a summary keep their own native action.
  const control=event.target.closest?.('a,button,input,select,textarea');
  if(control&&summary.contains(control))return;
  const running=active.get(details);
  if(running){
   event.preventDefault();retarget(running,!running.open);
   return;
  }
  if(!allowed()||typeof details.animate!=='function')return;
  // A new nested disclosure changes its ancestor's measured content size.
  // Complete that earlier interaction before measuring this one.
  for(const state of [...active.values()]){
   if(state.details.contains(details)||details.contains(state.details))finish(state);
  }
  const open=!details.open,from=details.getBoundingClientRect().height;
  const styles=Object.fromEntries(properties.map(property=>[property,{
   value:details.style.getPropertyValue(property),priority:details.style.getPropertyPriority(property)
  }]));
  // Both sizes are measured in one task, with no intermediate painted state.
  // Summary borders and spacing are identical in the open and closed styles.
  details.open=open;
  const to=details.getBoundingClientRect().height;
  details.open=true;
  if(Math.abs(to-from)<1){details.open=open;event.preventDefault();return;}
  details.style.setProperty('height',from+'px');
  // clip does not create a scroll container. In particular, scrolling a newly
  // revealed button into view must not scroll its summary out of the panel.
  details.style.setProperty('overflow',globalThis.CSS?.supports?.('overflow','clip')?'clip':'hidden');
  details.style.setProperty('overflow-anchor','none');
  let animation;
  try{
   animation=details.animate([{height:from+'px'},{height:to+'px'}],{
    duration:800,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'
   });
  }catch{
   for(const property of properties)restore(details,property,styles[property]);
   details.open=!open;return;
  }
  event.preventDefault();
  const state={details,summary,animation,styles,open,openHeight:open?to:from,closedHeight:open?from:to,
   expanded:summary.getAttribute('aria-expanded'),
   contents:Array.from(details.children).filter(element=>element!==summary).map(element=>[element,element.inert])};
  active.set(details,state);intent(state,open);
  onStart(details);
  // Start after measurements and observer registration, not before that work.
  play(state);
 },true);
 // Scripted restoration or navigation is not a new user interaction. A close
 // from elsewhere also cancels an unfinished animation instead of reopening it.
 main.addEventListener('toggle',event=>{
  const state=active.get(event.target);
  if(state&&!event.target.open)finish(state,false);
 },true);
 document.addEventListener('pointerdown',event=>{
  if(event.button>0||event.isPrimary===false)return;
  // Transfer an interrupted press without settling underneath its next target.
  // A completed click normally clears this before another pointerdown arrives.
  if(press)globalThis.clearTimeout(press.timer);
  press={id:event.pointerId,clicked:false,states:new Set(),timer:0};
  // An expanding ancestor or an earlier sibling can move the pressed target.
  // Include controls outside main, such as footer links below an opening card.
  // Hold every active disclosure until the native activation has completed.
  for(const state of [...active.values()]){
   if(state.details.isConnected)freeze(state);else finish(state);
  }
 },true);
 globalThis.addEventListener?.('pointerup',event=>{
  if(!press||event.pointerId!==press.id)return;
  const previous=press;
  // Click normally releases synchronously below. A drag/release outside main
  // may produce no click there; pointerup has already fixed its release target.
  previous.timer=globalThis.setTimeout(()=>{if(press===previous)releasePress();},0);
 },true);
 globalThis.addEventListener?.('pointercancel',event=>{
  if(press&&event.pointerId===press.id)releasePress();
 },true);
 globalThis.addEventListener?.('blur',releasePress);
 document.addEventListener?.('visibilitychange',()=>{if(document.hidden)releasePress();});
 document.addEventListener('click',releasePress);
 main.addEventListener('click',event=>{
  releasePress();
  // Pointer focus happens between down and up. Changing a clipped layout then
  // can move the pressed control and lose its click. Once activation reaches
  // click, its target is fixed and the presentation can safely settle.
  for(const state of [...active.values()]){
   if(state.open&&state.details.contains(event.target)&&!state.summary.contains(event.target))finish(state);
  }
 });
 main.addEventListener('focusin',event=>{
  // Tabbing into newly opened content must never leave the focused control
  // clipped while a presentation effect is still drawing the panel.
  if(press&&!press.clicked)return;
  for(const state of [...active.values()]){
   if(state.open&&state.details.contains(event.target)&&!state.summary.contains(event.target))finish(state);
  }
 });
 // Reflow changes the measured endpoint. Settle to the user's latest intent
 // before the new layout is drawn rather than retaining an obsolete height.
 let viewportWidth=globalThis.innerWidth;
 globalThis.addEventListener?.('resize',()=>{
  const width=globalThis.innerWidth;
  if(width!==viewportWidth){viewportWidth=width;settle();}
 });
 document.fonts?.addEventListener?.('loadingdone',settle);
 return {settle};
}
