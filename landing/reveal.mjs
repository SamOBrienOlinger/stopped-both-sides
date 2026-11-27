import {paceAnimations} from '../accessibility/animation-clock.mjs?v=learning-language-20261120';

// Share in-progress entrances between the first painted hero and the full page.
const controllers=new WeakMap();
export function syncLandingReveal(main){
 if(!controllers.has(main))controllers.set(main,createController(main));
 controllers.get(main)();
}

function createController(main){
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const forced=matchMedia('(forced-colors: active)');
 const landingMotionAllowed=()=>!reduced.matches&&!forced.matches&&!root.classList.contains('motion-reduce')&&!root.classList.contains('contrast-high');
 let landingObserver=null,observedLanding=null,lastLandingPreferences=null;
 const landingItems=new Map();
 function settleLandingItem(item,complete=false){
  const state=landingItems.get(item);
  state?.stop?.();clearTimeout(state?.timer);
  state?.cancelReadiness?.();
  landingObserver?.unobserve(item);
  item.style.removeProperty('--landing-reveal-delay');
  if(complete&&state){
   state.stop=null;state.timer=0;state.status='complete';
   item.setAttribute('data-landing-reveal','complete');
  }else{
   landingItems.delete(item);
   item.removeAttribute('data-landing-reveal');
  }
 }
 function clearLandingReveal(){
  landingObserver?.disconnect();landingObserver=null;
  for(const item of [...landingItems.keys()])settleLandingItem(item);
 }
 function revealLandingItem(item){
  const state=landingItems.get(item);
  if(!state||state.status!=='pending'||!state.ready||!state.visible)return;
  if(!item.isConnected||!landingMotionAllowed()||item.contains(document.activeElement)){
   settleLandingItem(item);return;
  }
  landingObserver?.unobserve(item);
  item.style.setProperty('--landing-reveal-delay',state.delay+'ms');
  state.status='active';item.setAttribute('data-landing-reveal','active');
  const animations=(item.getAnimations?.()||[]).filter(animation=>
   animation.animationName==='landing-portfolio-line-reveal');
  const complete=()=>{if(landingItems.get(item)===state)settleLandingItem(item,true);};
  if(animations.length)state.stop=paceAnimations(animations,complete);
  else state.timer=setTimeout(complete,2000);
 }
 function prepareLandingImage(image,state){
  // Reserve the image's authored dimensions while its pixels load. Its fade
  // starts only once it can paint; the neighbouring copy never waits for it.
  const current=()=>landingItems.get(image)===state&&state.status==='pending'&&image.isConnected;
  const cleanup=()=>{
   image.removeEventListener('load',loaded);image.removeEventListener('error',failed);
   state.cancelReadiness=null;
  };
  const ready=()=>{
   if(!current())return;
   state.ready=true;
   revealLandingItem(image);
  };
  const failed=()=>{cleanup();if(current())settleLandingItem(image);};
  const loaded=()=>{
   cleanup();
   if(!current())return;
   if(!image.naturalWidth){failed();return;}
   // A decode can be cancelled by a responsive source change. A successfully
   // loaded image may still paint; a removed route or preference change must
   // never be revived by either completion path.
   try{Promise.resolve(image.decode?.()).then(ready,()=>{
    if(image.complete&&image.naturalWidth)ready();else failed();
   });}catch{ready();}
  };
  state.cancelReadiness=cleanup;
  if(image.complete)loaded();
  else{
   image.addEventListener('load',loaded,{once:true});
   image.addEventListener('error',failed,{once:true});
  }
 }
 function observeNewItems(){
  for(const item of main.querySelectorAll('.sbs-poster [data-poster-reveal]')){
   // The caller restores route focus/scroll after update(). The observer
   // measures that new viewport, rather than the previous page's scroll.
   if(landingItems.has(item)||item.contains(document.activeElement))continue;
   const state={status:'pending',stop:null,timer:0,ready:item.tagName!=='IMG',visible:false,delay:0,cancelReadiness:null};
   landingItems.set(item,state);
   item.setAttribute('data-landing-reveal','pending');landingObserver.observe(item);
   if(!state.ready)prepareLandingImage(item,state);
  }
 }
 function sync(){
  // This is a tall invitation. Each item owns its viewport entrance, so later
  // text, imagery and actions do not spend their animation before being read.
  // Default CSS stays visible when JS, the observer or motion is unavailable.
  const next=main.querySelector('.sbs-poster');
  const preferences=[root.lang,root.dir||'ltr',root.style.getPropertyValue('--reading-size')||'100%',
   ...['contrast-high','reading-spacious','motion-reduce'].map(name=>root.classList.contains(name))].join('|');
  const preferenceChange=lastLandingPreferences!==null&&preferences!==lastLandingPreferences;
  lastLandingPreferences=preferences;
  if(next===observedLanding){
   if(preferenceChange||!landingMotionAllowed())clearLandingReveal();
   // The home router appends the overview, deck and actions to its early hero.
   else if(landingObserver)observeNewItems();
   return;
  }
  clearLandingReveal();observedLanding=next;
  if(!next||preferenceChange||!landingMotionAllowed()||typeof globalThis.IntersectionObserver!=='function')return;
  landingObserver=new IntersectionObserver(entries=>{
   const arriving=new Set();
   for(const entry of entries){
    const state=landingItems.get(entry.target);
    if(!state||state.status!=='pending')continue;
    state.visible=entry.isIntersecting;
    if(entry.isIntersecting)arriving.add(entry.target);
   }
   // Stagger newly visible neighbours in reading order. Later scrolls begin
   // their own short sequence instead of inheriting a long page-wide delay.
   let index=0;
   for(const [item,state] of landingItems)if(arriving.has(item)){
    state.delay=Math.min(index++*100,300);
    revealLandingItem(item);
   }
  },{rootMargin:'0px 0px -15% 0px',threshold:0});
  observeNewItems();
 }
 main.addEventListener('focusin',event=>{
  // Route focus must expose its heading immediately, before the next frame.
  // Unobserving also prevents scrolling away and back from restarting it.
  for(const item of [...landingItems.keys()])if(item.contains(event.target))settleLandingItem(item);
 });
 const settleLandingPreference=()=>{if(!landingMotionAllowed())clearLandingReveal();};
 reduced.addEventListener('change',settleLandingPreference);
 forced.addEventListener('change',settleLandingPreference);
 return sync;
}
