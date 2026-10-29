// Presentation enhancements run after translation. Original wording, inline
// citations, game state and language-pack lookup keys stay intact.
export function paragraphChunks(text,language='en'){
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
 const root=document.documentElement;
 const labels={en:'Menu',ga:'Roghchlár',pt:'Menu',ar:'القائمة',pl:'Menu',ro:'Meniu',fr:'Menu',es:'Menú',zh:'菜单'};
 let open=false,lastRoute='';
 header.classList.add('navigation-ready');
 function sync(){
  const collapsed=compact.matches&&!open;
  nav.hidden=collapsed;
  toggle.setAttribute('aria-expanded',String(!collapsed));
  header.classList.toggle('navigation-open',compact.matches&&open);
  toggle.querySelector('[data-menu-label]').textContent=labels[root.lang.split('-')[0]]||labels.en;
  const active=nav.querySelector('[aria-current="page"]');
  const current=toggle.querySelector('[data-menu-current]');
  current.textContent=active?.textContent||'';
  current.hidden=!active;
 }
 function close(restore=false){open=false;sync();if(restore)toggle.focus({preventScroll:true});}
 toggle.addEventListener('click',()=>{open=!open;sync();});
 header.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&open){event.preventDefault();close(true);}
 });
 // Keep the panel open behind reading settings so closing the dialog can
 // restore focus to the same visible control.
 header.addEventListener('click',event=>{
  if(event.target.closest('nav a,.wordmark'))close();
 });
 document.addEventListener('click',event=>{if(open&&!header.contains(event.target)&&!document.querySelector('dialog[open]'))close();});
 header.addEventListener('focusout',event=>{
  if(open&&event.relatedTarget&&!header.contains(event.relatedTarget)&&!document.querySelector('dialog[open]'))close();
 });
 compact.addEventListener('change',()=>{
  const focused=document.activeElement;
  open=false;sync();
  if(compact.matches&&nav.contains(focused))toggle.focus({preventScroll:true});
  else if(!compact.matches&&focused===toggle)(nav.querySelector('[aria-current="page"]')||nav.querySelector('a'))?.focus({preventScroll:true});
 });
 function update(hash){
  const route=String(hash).split('~')[0];
  if(lastRoute!==route)open=false;
  lastRoute=route;sync();
  // Split only plain prose, leaving quotes, controls, source metadata and
  // paragraphs containing links or emphasis exactly as authored.
  main.querySelectorAll('.landing-overview p,.content-page p,.decision-context .story-text,.story .story-text,.feedback>p,.learning-panel-body p,.summary-item>p').forEach(paragraph=>{
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
 }
 sync();
 return {update};
}
