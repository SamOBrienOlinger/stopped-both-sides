// Presentation enhancements run after translation. Original wording, inline
// citations, game state and language-pack lookup keys stay intact.
import {decorateCardHeadings} from './card-headings.mjs?v=static-headings-20261123';
import {paceAnimations} from './animation-clock.mjs?v=learning-language-20261120';
import {focusPageStart} from './focus.mjs?v=mobile-flow-20261123b';
export function paragraphChunks(text,language='en'){
 const authored=text.split(/\r?\n[ \t]*\r?\n/).map(paragraph=>paragraph.trim()).filter(Boolean);
 if(authored.length>1)return authored;
 if(text.length<260||typeof Intl?.Segmenter!=='function')return [text];
 let sentences;
 try{sentences=Array.from(new Intl.Segmenter(language,{granularity:'sentence'}).segment(text),item=>item.segment.trim()).filter(Boolean);}
 catch{return [text];}
 if(sentences.length<2)return [text];
 const chunks=[];let group=[],length=0;
 for(const sentence of sentences){
  if(group.length&&(group.length===2||length+sentence.length>280)){
   chunks.push(group.join(' '));group=[];length=0;
  }
  group.push(sentence);length+=sentence.length+1;
 }
 if(group.length)chunks.push(group.join(' '));
 return chunks;
}

export function createLayout({main}){
 const header=document.querySelector('.header');
 if(!header?.querySelector||!main?.querySelectorAll)return {update(){}};
 const nav=header.querySelector('nav'),toggle=header.querySelector('[data-nav-toggle]');
 if(!nav||!toggle)return {update(){}};
 const compact=matchMedia('(max-width: 71.999rem)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const forced=matchMedia('(forced-colors: active)');
 const root=document.documentElement;
 const headerOverlays=()=>{
  const position=globalThis.getComputedStyle?.(header)?.position;
  return !position||position==='sticky'||position==='-webkit-sticky'||position==='fixed';
 };
 function sizeHeader(){
  const height=header.getBoundingClientRect?.().height;
  if(height>0){
   const value=Math.ceil(height)+'px';
   if(root.style.getPropertyValue('--navigation-height')!==value){
    root.style.setProperty('--navigation-height',value);
    // Preserve keyboard access when an overlay header grows. A normal-flow
    // header cannot cover the control and must not cause corrective scrolling.
    // Route headings retain focus while someone reads: they must never pull
    // the page back merely because the header changes size afterwards.
    const focused=document.activeElement;
    const isControl=element=>element?.tabIndex>=0||element?.matches?.('a[href],button,input,select,textarea,summary,[role="button"]');
    if(headerOverlays()&&main.contains?.(focused)&&isControl(focused))globalThis.requestAnimationFrame?.(()=>{
     if(!headerOverlays()||document.activeElement!==focused||!isControl(focused))return;
     const box=focused.getBoundingClientRect(),bottom=header.getBoundingClientRect().bottom;
     if(box.bottom>0&&box.top<bottom)focused.scrollIntoView?.({block:'nearest',behavior:'instant'});
    });
   }
  }
 }
 // Text preferences and translated navigation can change the header's height
 // without crossing a viewport breakpoint. Keep focused content clear of it.
 if(typeof globalThis.ResizeObserver==='function')new ResizeObserver(sizeHeader).observe(header);
 globalThis.addEventListener?.('resize',sizeHeader);
 document.fonts?.ready?.then(sizeHeader);
 const labels={en:'Menu',ga:'Roghchlár',pt:'Menu',ar:'القائمة',pl:'Menu',ro:'Meniu',fr:'Menu',es:'Menú',zh:'菜单'};
 let open=false,lastRoute='',panelAnimation=null,landingObserver=null,observedLanding=null,lastLandingPreferences=null;
 const landingItems=new Map();
 const background=new Map();
 header.classList.add('navigation-ready');
 const motionAllowed=()=>!reduced.matches&&!forced.matches&&!root.classList.contains('motion-reduce');
 function blockBackground(blocked){
  if(blocked){
   for(const element of Array.from(document.body.children)){
    if(element===header||element.contains(header)||element.matches('dialog,script,[role="status"],.dialog-backdrop'))continue;
    if(!background.has(element))background.set(element,element.inert);
    element.inert=true;
   }
  }else{
   for(const [element,inert] of background)element.inert=inert;
   background.clear();
  }
 }
 function showPanel(visible,animate){
  const wasHidden=nav.hidden;
  const opacity=wasHidden?0:Number(getComputedStyle(nav).opacity);
  panelAnimation?.cancel();panelAnimation=null;
  // A closing panel is immediately unavailable to keyboard and pointer input,
  // while its surface can finish fading without moving the content below it.
  nav.inert=!visible;
  if(visible)nav.removeAttribute('aria-hidden');else nav.setAttribute('aria-hidden','true');
  if(!animate||!compact.matches||!motionAllowed()||typeof nav.animate!=='function'||(!visible&&wasHidden)){
   nav.hidden=!visible;return;
  }
  nav.hidden=false;
  const animation=nav.animate([{opacity},{opacity:visible?1:0}],{
   duration:400,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'
  });
  panelAnimation=animation;
  animation.onfinish=()=>{
   if(panelAnimation!==animation)return;
   nav.hidden=!visible;
   panelAnimation=null;animation.cancel();
  };
 }
 function sync(animate=false){
  const collapsed=compact.matches&&!open;
  showPanel(!collapsed,animate);
  blockBackground(compact.matches&&open);
  toggle.setAttribute('aria-expanded',String(!collapsed));
  header.classList.toggle('navigation-open',compact.matches&&open);
  toggle.querySelector('[data-menu-label]').textContent=labels[root.lang.split('-')[0]]||labels.en;
  const active=nav.querySelector('[aria-current="page"]');
  const current=toggle.querySelector('[data-menu-current]');
  current.textContent=active?.dataset.nav==='play'?'':active?.textContent.trim()||'';
  current.hidden=!current.textContent;
  sizeHeader();
 }
 function close(restore=false,animate=true){open=false;sync(animate);if(restore)toggle.focus({preventScroll:true});}
 toggle.addEventListener('click',()=>{open=!open;sync(true);});
 // Safari can leave focus on the page after a pointer opens the menu.
 // Escape must still close the overlay and return focus to its trigger.
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&open){event.preventDefault();close(true);}
 });
 // Settings replace the compact menu. Returning from the dialog then restores
 // focus to Menu, leaving the learning content visible and usable.
 header.addEventListener('click',event=>{
  if(compact.matches&&event.target.closest('[data-reading-open],[data-search-open]')){
   close(false,false);return;
  }
  const link=event.target.closest('nav a,.wordmark');
  if(link){
   close(false,false);
   // Re-selecting the current page does not fire hashchange. Give it the same
   // full-page entry as a new route, even when Safari retains heading focus.
   if(!event.defaultPrevented&&event.button===0&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&link.href===location.href){
    event.preventDefault();focusPageStart(main);
   }
  }
 });
 document.addEventListener('click',event=>{if(open&&!header.contains(event.target)&&!document.querySelector('dialog[open]'))close();});
 // Close outside the header on click, not focusout: pointer focus happens
 // before mouseup, so keep the menu stable until activation has completed.
 compact.addEventListener('change',()=>{
  const focused=document.activeElement;
  open=false;sync();
  if(compact.matches&&nav.contains(focused))toggle.focus({preventScroll:true});
  else if(!compact.matches&&focused===toggle)(nav.querySelector('[aria-current="page"]')||nav.querySelector('a'))?.focus({preventScroll:true});
 });
 const settlePanel=()=>sync();
 reduced.addEventListener('change',settlePanel);
 forced.addEventListener('change',settlePanel);
 const landingMotionAllowed=()=>motionAllowed()&&!root.classList.contains('contrast-high');
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
 function syncLandingReveal(){
  // This is a tall invitation. Each item owns its viewport entrance, so later
  // text, imagery and actions do not spend their animation before being read.
  // Default CSS stays visible when JS, the observer or motion is unavailable.
  const next=main.querySelector('.sbs-poster');
  const preferences=[root.lang,root.dir,root.style.getPropertyValue('--reading-size'),
   ...['contrast-high','reading-spacious','motion-reduce'].map(name=>root.classList.contains(name))].join('|');
  const preferenceChange=lastLandingPreferences!==null&&preferences!==lastLandingPreferences;
  lastLandingPreferences=preferences;
  if(next===observedLanding){
   if(preferenceChange||!landingMotionAllowed())clearLandingReveal();
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
  for(const item of main.querySelectorAll('.sbs-poster [data-poster-reveal]')){
   // The caller restores route focus/scroll after update(). The observer
   // measures that new viewport, rather than the previous page's scroll.
   if(item.contains(document.activeElement))continue;
   const state={status:'pending',stop:null,timer:0,ready:item.tagName!=='IMG',visible:false,delay:0,cancelReadiness:null};
   landingItems.set(item,state);
   item.setAttribute('data-landing-reveal','pending');landingObserver.observe(item);
   if(!state.ready)prepareLandingImage(item,state);
  }
 }
 main.addEventListener('focusin',event=>{
  // Route focus must expose its heading immediately, before the next frame.
  // Unobserving also prevents scrolling away and back from restarting it.
  for(const item of [...landingItems.keys()])if(item.contains(event.target))settleLandingItem(item);
 });
 const settleLandingPreference=()=>{if(!landingMotionAllowed())clearLandingReveal();};
 reduced.addEventListener('change',settleLandingPreference);
 forced.addEventListener('change',settleLandingPreference);

 function update(hash){
  const route=String(hash).split('~')[0];
  if(lastRoute!==route&&!document.activeElement?.matches('[data-reading-open]'))open=false;
  lastRoute=route;sync();
  // Split only plain prose, leaving quotes, controls, source metadata and
  // paragraphs containing links or emphasis exactly as authored.
  main.querySelectorAll('.landing-overview p,.content-page p,.decision-context .story-text,.comparison-context,.comparison-role-context,.story .story-text,.feedback>p,.learning-panel-body p,.summary-item>p').forEach(paragraph=>{
   if(paragraph.childElementCount||paragraph.dataset.readingChunk||paragraph.closest('[data-no-translate],blockquote')||paragraph.matches('.eyebrow,.learning-citations,.source-meta,.chosen,.learning-scene'))return;
   const chunks=paragraphChunks(paragraph.textContent,paragraph.lang||main.lang||root.lang);
   if(chunks.length<2)return;
   const fragment=document.createDocumentFragment();
   chunks.forEach((text,index)=>{
    const copy=paragraph.cloneNode(false);
    if(index)copy.removeAttribute('id');
    copy.dataset.readingChunk='true';copy.textContent=text;fragment.append(copy);
   });
   paragraph.replaceWith(fragment);
  });
  decorateCardHeadings(main);
  syncLandingReveal();
 }
 sync();
 return {update};
}
