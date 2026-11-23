// A classic head script: refresh positioning must be owned before the large
// application module graph loads, and after native viewport restoration ends.
(() => {
 const root=document.documentElement;
 root.setAttribute('data-scripted','');
 const reloading=root.hasAttribute('data-start-position');
 const restoringHistory=performance.getEntriesByType('navigation')[0]?.type==='back_forward'||performance.navigation?.type===2;
 let active=reloading&&!restoringHistory,frame=0,target=()=>null;
 const cleanup=[];
 const listen=(surface,type,handler,options)=>{
  surface?.addEventListener(type,handler,options);
  cleanup.push(()=>surface?.removeEventListener(type,handler,options));
 };
 const nativeRestoration=mode=>{if('scrollRestoration' in history)history.scrollRestoration=mode;};
 function release(restore=true){
  active=false;
  root.removeAttribute('data-start-position');
  if(frame)cancelAnimationFrame(frame);
  frame=0;
  for(const remove of cleanup.splice(0))remove();
  if(restore)nativeRestoration('auto');
 }
 function position(){
  if(!active)return;
  const element=target();
  let top=0;
  if(element?.isConnected){
   const padding=parseFloat(getComputedStyle(root).scrollPaddingTop)||0;
   const margin=parseFloat(getComputedStyle(element).scrollMarginTop)||0;
   const maximum=Math.max(0,(document.scrollingElement?.scrollHeight||0)-innerHeight);
   top=Math.max(0,Math.min(maximum,scrollY+element.getBoundingClientRect().top-padding-margin));
  }
  // No writes at the settled position: a scroll event must not create a loop.
  if(Math.abs(scrollY-top)>.5||Math.abs(scrollX)>.5)window.scrollTo({top,left:0,behavior:'instant'});
 }
 function schedule(){
  if(!active||frame)return;
  frame=requestAnimationFrame(()=>{frame=0;position();});
 }
 window.__stoppedPageStart={
  reloading,restoringHistory,
  get active(){return active;},
  claim(resolveTarget){
   // A gesture may have started while a language pack or module was loading.
   // Completing the render must never reclaim the reader's scroll position.
   if(!active)return;
   target=resolveTarget;
   position();schedule();
  },
  release:()=>release()
 };
 // Keep reload ownership through departure, including on engines where the
 // outgoing document cannot identify a reload using pageswap.
 addEventListener('pageswap',event=>{
  if(event.activation?.navigationType==='reload')nativeRestoration('manual');
 });
 addEventListener('pagehide',()=>release(false));
 addEventListener('pageshow',event=>{
  if(event.persisted){release();return;}
  schedule();
 });
 const failed=event=>{
  if(event.type==='error'&&event.target!==window&&event.target?.tagName!=='SCRIPT')return;
  if(!document.querySelector('.header.navigation-ready'))root.removeAttribute('data-scripted');
  release();
 };
 addEventListener('error',failed,true);
 addEventListener('unhandledrejection',failed);
 if(!active)return;
 nativeRestoration('manual');
 // Native refresh, scroll anchoring and visual-viewport restoration emit
 // scroll events too. Only a fresh input gesture relinquishes ownership;
 // touchmove/touchend from the old pull-to-refresh gesture do not qualify.
 const userIntent=event=>{if(event.isTrusted)release();};
 for(const type of ['pointerdown','touchstart','wheel','keydown','click'])listen(window,type,userIntent,{capture:true,passive:true});
 listen(window,'hashchange',()=>release());
 listen(window,'popstate',()=>release());
 listen(window,'scroll',schedule,{passive:true});
 listen(window,'resize',schedule,{passive:true});
 listen(window.visualViewport,'resize',schedule,{passive:true});
 listen(window.visualViewport,'scroll',schedule,{passive:true});
 // The parser can restore its saved range before deferred modules run.
 // Settle synchronously at that boundary, before the next painted frame.
 listen(document,'readystatechange',position);
 listen(window,'load',schedule,{once:true});
 listen(document,'DOMContentLoaded',schedule,{once:true});
 document.fonts?.ready?.then(schedule);
 listen(document.fonts,'loadingdone',schedule);
 position();schedule();
})();
