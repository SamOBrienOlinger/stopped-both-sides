import {decodeState} from '../encounters/engine.mjs';

// Presentation only. The game has already updated its state, text and focus
// before a cue starts; nothing waits for an animation or transition event.
export function createMotion({main,getLegacyState=()=>null}){
 if(!main?.querySelector||typeof globalThis.requestAnimationFrame!=='function')return {update(){},openDialog(){}};
 const root=document.documentElement;
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
 const forced=globalThis.matchMedia?.('(forced-colors: active)');
 const active=new Map(),frames=new Set(),seen=new Set(),userDisclosures=new WeakSet();
 let previous=null,observer=null;
 const allowed=()=>!reduced?.matches&&!forced?.matches&&!root.classList.contains('motion-reduce');
 const all=selector=>Array.from(main.querySelectorAll(selector));
 const preferences=()=>[root.lang,root.dir,root.style.getPropertyValue('--reading-size'),
  ...['contrast-high','reading-spacious','motion-reduce'].map(name=>root.classList.contains(name))].join('|');

 function remove(element){
  clearTimeout(active.get(element));active.delete(element);
  element.removeAttribute('data-motion');
 }
 function clear(){
  for(const frame of frames)cancelAnimationFrame(frame);
  frames.clear();
  for(const element of active.keys())remove(element);
 }
 function afterFocus(callback){
  const frame=requestAnimationFrame(()=>{frames.delete(frame);callback();});
  frames.add(frame);
 }
 function cue(element,kind){
  if(!element||!allowed())return;
  afterFocus(()=>{
   if(!element.isConnected||!element.getClientRects().length||!allowed())return;
   remove(element);element.setAttribute('data-motion',kind);
   // Cleanup is independent of browser animation events (including cancellation).
   active.set(element,setTimeout(()=>remove(element),680));
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

 // Observe visible groups once per route, never individual paragraphs or
 // characters. Their default styles remain fully readable without this API.
 function observeReveals(next,suppress){
  observer?.disconnect();observer=null;
  const selectors=next.complete?['.summary-list > .summary-item']:
   next.mode==='content'?['.content-page > .info-block','.source-card','.evidence-record',
    '.progress-page > .role-results > .info-block','.progress-situations > .info-block',
    '.landing-overview','.perspective-hero','.how-step','.start-panel','.learning-section',
    '.topic-explorer','.learning-goals','.source-topic']:[];
  const candidates=[];
  for(const selector of selectors)all(selector).forEach((element,index)=>{
   if(element.parentElement?.closest('details'))return;
   const identity=element.id||element.querySelector('[data-action="paired-start"][data-id]')?.dataset.id||element.dataset.roleTone||index;
   const key=`${next.revealScope}|${selector}|${identity}`;
   if(suppress||!allowed()){seen.add(key);return;}
   if(!seen.has(key))candidates.push({element,key});
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
  },{threshold:0,rootMargin:'0px 0px -24px 0px'});
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
    for(const scene of all('.story .scene-stage'))cue(scene,'scene');
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
  // A preference redraw must not replay either on-screen or later-scroll cues.
  observeReveals(next,preferenceChange);
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
  if(details.open&&userDisclosures.has(details))cue(details,'disclosure');
  else if(!details.open)remove(details);
  userDisclosures.delete(details);
 },true);
 const stopIfReduced=()=>{if(!allowed()){clear();observer?.disconnect();}};
 reduced?.addEventListener?.('change',stopIfReduced);
 forced?.addEventListener?.('change',stopIfReduced);
 return {update,openDialog:dialog=>cue(dialog.querySelector('.settings-content')||dialog,'dialog')};
}
