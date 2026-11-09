import {decodeState} from '../encounters/engine.mjs';

// Presentation only. The game has already updated its state, text and focus
// before a cue starts; nothing waits for an animation or transition event.
export function createMotion({main,getLegacyState=()=>null}){
 if(!main?.querySelector||typeof globalThis.requestAnimationFrame!=='function')return {update(){},openDialog(){}};
 const root=document.documentElement;
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
 const forced=globalThis.matchMedia?.('(forced-colors: active)');
 const active=new Map(),frames=new Map(),seen=new Set(),userDisclosures=new WeakSet();
 let previous=null,observer=null;
 const allowed=()=>!reduced?.matches&&!forced?.matches&&!root.classList.contains('motion-reduce');
 const all=selector=>Array.from(main.querySelectorAll(selector));
 const preferences=()=>[root.lang,root.dir,root.style.getPropertyValue('--reading-size'),
  ...['contrast-high','reading-spacious','motion-reduce'].map(name=>root.classList.contains(name))].join('|');

 function remove(element){
  for(const [frame,pending] of frames)if(pending.element===element){
   cancelAnimationFrame(frame);frames.delete(frame);
  }
  clearTimeout(active.get(element));active.delete(element);
  element.removeAttribute('data-motion');
 }
 function clear(){
  for(const frame of frames.keys())cancelAnimationFrame(frame);
  frames.clear();
  for(const element of active.keys())remove(element);
 }
 const isEntrance=kind=>kind==='reveal'||kind==='recap';
 function afterFocus(element,kind,callback){
  const frame=requestAnimationFrame(()=>{frames.delete(frame);callback();});
  frames.set(frame,{element,kind});
 }
 function cue(element,kind){
  if(!element||!allowed())return;
  afterFocus(element,kind,()=>{
   if(!element.isConnected||!element.getClientRects().length||!allowed())return;
   if(isEntrance(kind)&&element.contains(document.activeElement))return;
   remove(element);
   element.setAttribute('data-motion',kind);
   // Follow the rendered duration so cues finish naturally.
   // The timeout still cleans up if animation events are cancelled or missing.
   const ends=(element.getAnimations?.({subtree:true})||[])
    .map(animation=>animation.effect?.getComputedTiming().endTime).filter(Number.isFinite);
   const duration=(globalThis.getComputedStyle?.(root).getPropertyValue('--ui-reveal-time')||'1600ms').trim();
   const fallback=parseFloat(duration)*(duration.endsWith('ms')?1:1000)||1600;
   const end=ends.length?Math.max(...ends):fallback;
   active.set(element,setTimeout(()=>remove(element),end+100));
  });
 }
 function snapshot(hash){
  const route=String(hash).replace(/^#/,'').split('~')[0]||'play';
  const shared=route.startsWith('encounter/')?decodeState(route.slice(10)):null;
  const legacy=route.startsWith('scenario/')?getLegacyState():null;
  const state=shared||legacy,mode=shared?'shared':legacy?'legacy':'content';
  const path=state?.history.map(step=>step.nodeId).join('/')||'';
  const role=shared?.role||root.dataset.perspective;
  // Original practice can transfer into the shared view of the same moment.
  // Its presentation mode changes, but its logical stage does not.
  const id=shared?.id||(legacy?`${role}-${legacy.scenarioId}`:'');
  const complete=!!state?.complete;
  const page=state?`${id}/${complete?'recap':'game'}`:
   /^(rights|evidence)(\/|$)/.test(route)?route.split('/')[0]:route;
  const picker=main.querySelector('.character-picker');
  return {page,mode,role,complete,stage:state?`${id}/${path}/${state.nodeId}`:'',
   answer:shared?shared.answers[role]:legacy?.selected??null,
   picker:!!picker,character:picker?.querySelector('[aria-pressed="true"]')?.dataset.character||'',
   preferences:preferences(),revealScope:complete?`${page}/${path}`:page,
   progress:all('.progress-page progress').map(element=>element.value).join(',')};
 }

 // Keep the initial viewport steady. Only groups reached later can receive a
 // cue, and a group and its descendants never animate independently.
 function observeReveals(next,suppress,disclosure=null){
  observer?.disconnect();observer=null;
  const selectors=next.complete?['.summary-list > .summary-item']:
   next.mode==='content'?['.content-page > .info-block','.source-card','.evidence-record',
    '.progress-page > .role-results > .info-block','.progress-situations > .info-block',
    '.landing-overview','.perspective-hero','.how-step','.start-panel',
    '.topic-explorer','.learning-goals','.source-topic',
    '.learning-intro','.learning-cycle','.learning-context','.learning-panel',
    '.learning-example','.learning-outcomes > li','.evidence-group > h2']:[];
  const targets=[],elements=new Set();
  for(const selector of selectors)all(selector).forEach((element,index)=>{
   if(element.parentElement?.closest('details:not([open])'))return;
   if(elements.has(element))return;
   elements.add(element);
   const identity=element.id||element.querySelector('[data-action="paired-start"][data-id]')?.dataset.id||element.dataset.roleTone||index;
   const key=`${next.revealScope}|${selector}|${identity}`;
   targets.push({element,key});
  });
  const viewport=globalThis.innerHeight||document.documentElement.clientHeight;
  const candidates=targets.filter(({element,key})=>{
   let nested=false;
   for(let parent=element.parentElement;parent&&parent!==main;parent=parent.parentElement){
    if(elements.has(parent)){nested=true;break;}
   }
   if(suppress||!allowed()||nested||disclosure?.contains(element)){
    seen.add(key);return false;
   }
   if(seen.has(key)||!element.getClientRects().length)return false;
   // Already visible or already passed content must not dim after being read.
   if(element.getBoundingClientRect().top<viewport||element.contains(document.activeElement)){
    seen.add(key);return false;
   }
   return true;
  });
  if(!candidates.length||typeof globalThis.IntersectionObserver!=='function')return;
  const keys=new Map(candidates.map(item=>[item.element,item.key]));
  observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    const key=keys.get(entry.target);
    observer?.unobserve(entry.target);
    if(seen.has(key))continue;
    seen.add(key);cue(entry.target,next.complete?'recap':'reveal');
   }
  },{threshold:0,rootMargin:'0px 0px 80px 0px'});
  for(const {element} of candidates)observer.observe(element);
 }

 function update(hash){
  clear();
  const next=snapshot(hash),before=previous;
  previous=next;
  const preferenceChange=!!before&&before.preferences!==next.preferences;
  const stageChange=next.mode!=='content'&&(!before||before.stage!==next.stage||before.page!==next.page);
  if(!preferenceChange){
   if(next.complete&&stageChange)cue(main.querySelector('.recap-takeaways')||main.querySelector('.summary-heading'),'recap');
   else if(stageChange){
    cue(main.querySelector('.decision-context,.game-grid > .story'),'stage');
    for(const scene of all('.story .scene-stage,.legacy-illustration .scene-stage'))cue(scene,'scene');
   }else if(before&&before.role!==next.role){
    cue(main.querySelector('.play-toolbar,.legacy-perspective,.setup-role'),'perspective');
    cue(main.querySelector(next.complete?'.recap-takeaways':'.decision-choices,.game-grid > section[aria-labelledby="choice-title"]'),'perspective');
   }else if(next.mode!=='content'&&!next.complete&&next.answer!==null&&before?.answer!==next.answer){
    cue(main.querySelector('#feedback'),'feedback');
   }
   if(next.picker&&!before?.picker)cue(main.querySelector('.character-picker'),'picker');
   else if(next.picker&&next.character!==before?.character)
    cue(main.querySelector('.character-picker [aria-pressed="true"]'),'selection');
   if(next.page==='progress'&&(before?.page!=='progress'||before.progress!==next.progress)){
    for(const progress of all('.progress-page progress'))if(progress.value>0)cue(progress,'progress');
   }
  }
  // The caller applies route focus and scrolling after update(). Measure the
  // new viewport afterwards; a second render cancels this queued registration.
  // A preference redraw must not replay either on-screen or later-scroll cues.
  afterFocus(main,'observe',()=>observeReveals(next,preferenceChange));
 }

 // Only an actual summary activation starts a disclosure cue. Programmatically
 // restored open sections (preferences, deep links) do not imitate a new action.
 main.addEventListener('click',event=>{
  const summary=event.target.closest?.('summary');
  const details=summary?.parentElement;
  if(details?.tagName==='DETAILS'&&!details.open)userDisclosures.add(details);
 },true);
 main.addEventListener('toggle',event=>{
  const details=event.target;
  if(details.tagName!=='DETAILS')return;
  if(details.open&&userDisclosures.has(details)){
   // Opening a disclosure is one native interaction, not a parent reveal plus
   // a second set of entrances for the newly exposed children.
   for(const element of [...active.keys()]){
    if(details.contains(element)||(isEntrance(element.getAttribute('data-motion'))&&element.contains(details)))remove(element);
   }
   for(const {element,kind} of [...frames.values()]){
    if(details.contains(element)||(isEntrance(kind)&&element.contains(details)))remove(element);
   }
   cue(details,'disclosure');
   if(previous)observeReveals(previous,false,details);
  }
  else if(!details.open)remove(details);
  userDisclosures.delete(details);
 },true);
 // Cancelling the attribute as well as the animation makes focus cancellation
 // permanent; moving focus away cannot restart an entrance from its first frame.
 main.addEventListener('focusin',event=>{
  for(const element of [...active.keys()]){
   if(isEntrance(element.getAttribute('data-motion'))&&element.contains(event.target))remove(element);
  }
  for(const {element,kind} of [...frames.values()]){
   if(isEntrance(kind)&&element.contains(event.target))remove(element);
  }
 });
 const stopIfReduced=()=>{if(!allowed()){clear();observer?.disconnect();}};
 reduced?.addEventListener?.('change',stopIfReduced);
 forced?.addEventListener?.('change',stopIfReduced);
 return {update,openDialog:dialog=>cue(dialog.querySelector('.settings-content')||dialog,'dialog')};
}
