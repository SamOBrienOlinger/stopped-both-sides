import {paceAnimations} from './animation-clock.mjs?v=render-paced-1';

// Animate measured pixels rather than the experimental details-content pseudo
// element, so opening and closing behave the same in all supported browsers.
export function createDisclosures({main,allowed,onStart=()=>{},onFinish=()=>{}}){
 const active=new Map();
 let pointerFocus=false;
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
 main.addEventListener('pointerdown',()=>{pointerFocus=true;},true);
 globalThis.addEventListener?.('pointerup',()=>setTimeout(()=>{pointerFocus=false;},0));
 globalThis.addEventListener?.('pointercancel',()=>{pointerFocus=false;});
 main.addEventListener('click',event=>{
  pointerFocus=false;
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
  if(pointerFocus)return;
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
