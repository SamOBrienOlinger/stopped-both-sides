// Presentation enhancements run after translation. Original wording, inline
// citations, game state and language-pack lookup keys stay intact.
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
 function sizeHeader(){
  const height=header.getBoundingClientRect?.().height;
  if(height>0){
   const value=Math.ceil(height)+'px';
   if(root.style.getPropertyValue('--navigation-height')!==value)root.style.setProperty('--navigation-height',value);
  }
 }
 // Text preferences and translated navigation can change the header's height
 // without crossing a viewport breakpoint. Keep focused content clear of it.
 if(typeof globalThis.ResizeObserver==='function')new ResizeObserver(sizeHeader).observe(header);
 globalThis.addEventListener?.('resize',sizeHeader);
 document.fonts?.ready?.then(sizeHeader);
 const labels={en:'Menu',ga:'Roghchlár',pt:'Menu',ar:'القائمة',pl:'Menu',ro:'Meniu',fr:'Menu',es:'Menú',zh:'菜单'};
 let open=false,lastRoute='',panelAnimation=null,landingObserver=null,observedLanding=null;
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
  if(compact.matches&&event.target.closest('[data-reading-open]')){
   close(false,false);return;
  }
  const link=event.target.closest('nav a,.wordmark');
  if(link){
   close(false,false);
   if(link.origin===location.origin&&link.pathname===location.pathname&&link.hash===location.hash)main.querySelector('h1')?.focus();
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
 function syncLandingReveal(){
  // Mirror the portfolio hero's staggered, viewport-triggered word reveal.
  // The text remains fully readable if JS or the observer is missing.
  const next=main.querySelector('.reference-landing .landing-instructions');
  if(next===observedLanding)return;
  landingObserver?.disconnect();
  landingObserver=null;
  observedLanding=next;
  if(!next||typeof globalThis.IntersectionObserver!=='function')return;
  landingObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
    entry.target.classList.toggle('is-revealing',entry.isIntersecting);
   }
  },{rootMargin:'0px 0px -15% 0px',threshold:0});
  landingObserver.observe(next);
 }

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
  syncLandingReveal();
 }
 sync();
 return {update};
}
