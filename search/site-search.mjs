import {encounters,references} from '../encounters/catalog.mjs?v=site-repairs-20261125';
import {topicGroups} from '../encounters/presentation.mjs?v=site-repairs-20261125';
import {accessibilityPage} from '../accessibility/ui.mjs?v=casting-logos-20261127';
import {createDialogController} from '../accessibility/dialog.mjs?v=learning-language-20261120';
import {translateText,languageLoaded,escapeHTML as esc} from '../locales/active-language.mjs?v=casting-logos-20261127';
import {learningAbout,prototypeInput,firstTimeGuide} from '../learning/about.mjs?v=mobile-layout-20261127';
import {communitySources} from '../learning/community-resources.mjs?v=site-repairs-20261125';

import {privacyNotices} from '../locales/privacy-notice.mjs?v=site-repairs-20261125';
import {sourceTopics} from '../learning/rights-topics.mjs?v=site-repairs-20261125';
import {services} from '../learning/support.mjs?v=rights-topics-20261126';
import {practiceGoals} from '../learning/play-content.mjs?v=learning-language-20261120';
import {renderPosterLanding} from '../landing/poster-landing.mjs?v=casting-logos-20261127';
import {groups as evidenceGroups} from '../garda/sources.mjs?v=site-repairs-20261125';

const fold=value=>String(value||'').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase().replace(/ł/g,'l').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const indexes=new Map();
let privacyBody='';
let privacyRequest;
export function indexPrivacyNotice(){
 if(privacyRequest)return privacyRequest;
 async function read(){
  let article=document.querySelector('.privacy-page main');
  if(!article){
   const response=await fetch(new URL('../privacy.html',import.meta.url));
   if(!response.ok)throw new Error('Privacy notice unavailable');
   article=new DOMParser().parseFromString(await response.text(),'text/html').querySelector('main');
  }
  if(article){
   privacyBody=Array.from(article.querySelectorAll('h1,h2,p'),node=>node.textContent).join(' ');
   indexes.clear();
  }
 }
 privacyRequest=read().catch(()=>{privacyRequest=undefined;});
 return privacyRequest;
}
function visibleText(html){
 return html.split(/<[^>]*>/).map(value=>value.replaceAll('&amp;','&').trim()).filter(Boolean);
}

function searchIndex(language,siteRole){
 const key=language+'/'+siteRole;
 if(indexes.has(key))return indexes.get(key);
 const entries=Object.values(encounters).map(encounter=>{
  const topic=topicGroups.find(group=>group.encounters.includes(encounter.id));
  const text=[encounter.title,encounter.description,encounter.goal||practiceGoals[encounter.id],topic?.title,encounter.ground];
  for(const stage of Object.values(encounter.nodes)){
   text.push(stage.title,stage.scene);
   for(const view of Object.values(stage.views)){
    text.push(view.context,view.phrase,view.prompt,view.lesson,...view.choices.flatMap(choice=>[choice.text,choice.feedback]));
   }
  }
  return {kind:'situation',id:encounter.id,title:encounter.title,description:encounter.description,originalLanguage:encounter.language,text};
 });
 const sideHref=(role,hash)=>role===siteRole?hash:(role==='public'?'../':'./garda/')+'?lang='+encodeURIComponent(language)+hash;
 const privacy=(siteRole==='garda'?'../':'./')+'privacy.html?perspective='+siteRole+'&lang='+encodeURIComponent(language);
 const page=(title,href,description,aliases=[],content=[])=>{
  entries.push({kind:'page',title,href,description,aliases,text:[title,description,...aliases,...content]});
 };
 page('Home','#play','Stopped: Both Sides',['Stopped: Both Sides','One situation. Two perspectives.'],
  visibleText(renderPosterLanding({siteRole,perspectiveIcon:()=>''})));
 page('Browse all situations','#encounters','Explore',['Explore','Browse all situations']);
 for(const encounter of Object.values(encounters)){
  if(!encounter.originalId)continue;
  const text=[encounter.title,practiceGoals[encounter.id]];
  for(const stage of Object.values(encounter.nodes)){
   const original=stage.views[encounter.origin];
   text.push(stage.title,original.phrase,original.context,original.prompt,original.lesson,...original.choices.flatMap(choice=>[choice.text,choice.feedback]));
  }
  entries.push({kind:'practice',title:encounter.title,description:encounter.origin==='public'?'Public perspective':'Garda perspective',
   href:sideHref(encounter.origin,'#scenario/'+encounter.originalId),text});
 }
 page('About','#about','A prototype with space for input',[],visibleText(learningAbout()+prototypeInput(siteRole)+firstTimeGuide()));
 page('Accessibility','#accessibility','Language & reading',['Language & reading'],visibleText(accessibilityPage()));
 page('Scores & progress','#progress','Your learning record',['Progress']);
 page('Human and Civil Rights & sources',sideHref('public','#rights'),'Human and Civil Rights',['Human and Civil Rights','Sources']);
 for(const topic of sourceTopics)page(topic.title,sideHref('public','#rights/'+topic.id),'Human and Civil Rights & sources');
 page('Evidence library',sideHref('garda','#evidence'),'Garda resources',['Garda Guidance','Garda resources']);
 for(const [id,title] of Object.entries(evidenceGroups)){
  page(title,sideHref('garda','#evidence/group-'+id),'Evidence library');
 }
 page('Advice & support',sideHref('public','#rights/support'),'Advice, complaints and policing oversight',
  [],services.flatMap(service=>[service.name,service.kind,service.description,service.action]));
 for(const service of services){
  page(service.name,sideHref('public','#rights/support/'+service.id),service.fullName,[service.fullName],[service.kind,service.description,service.action]);
 }
 for(const [id,source] of Object.entries(references)){
  if(id.startsWith('garda:')){
   page(source.title,sideHref('garda','#evidence/'+id.slice(6)),'Evidence library',[source.short,source.authors],
    [source.publication,source.note,source.kind,source.place,source.limit,source.use]);
  }
 }
 const notice=privacyNotices[language];
 page('Privacy & local storage',privacy,notice?.title||'Your learning and your information',
  ['Privacy','Your learning and your information',notice?.privacy,notice?.title],
  ['Local progress and settings','Learning records in links','Hosting and external resources','Contact and your rights','Privacy note',privacyBody,...Object.values(notice||{})]);

 // Sources can share a URL while using different display titles and notes in the two libraries.
 const byURL=new Map();
 const referenceEntries=Object.entries(references).sort(([a],[b])=>Number(b.startsWith(siteRole+':'))-Number(a.startsWith(siteRole+':')));
 for(const source of [...referenceEntries.map(([,source])=>source),...Object.values(communitySources),...services.map(service=>({
  title:service.name,short:service.fullName,note:service.description,url:service.url
 }))]){
  let entry=byURL.get(source.url);
  if(!entry){
   entry={kind:'source',title:source.title,href:source.url,description:source.note||'',aliases:[],text:[]};
   byURL.set(source.url,entry);
  }
  entry.aliases.push(source.title,source.short,source.authors);
  entry.text.push(source.title,source.short,source.authors,source.publication,source.year,source.note,source.group,source.kind,source.place,source.limit,source.use);
 }
 entries.push(...byURL.values());
 const bilingual=value=>[value,translateText(value,language)];
 const index=entries.map(entry=>{
  const labels=[entry.title,...(entry.aliases||[])].filter(Boolean).flatMap(bilingual).map(fold);
  return {...entry,labels,label:labels.join(' '),keywords:fold(entry.text.filter(Boolean).flatMap(bilingual).join(' '))};
 });
 if(languageLoaded(language))indexes.set(key,index);
 return index;
}

export function searchSite(query,{language='en',siteRole='public'}={}){
 const terms=fold(String(query).slice(0,120));
 if(!terms)return [];
 const words=terms.split(' ');
 return searchIndex(language,siteRole)
  .filter(entry=>words.every(word=>entry.keywords.includes(word)))
  .map(entry=>({...entry,score:(entry.labels.includes(terms)?100:0)+(entry.label.includes(terms)?20:0)+words.filter(word=>entry.label.includes(word)).length*5+(entry.kind==='situation'?2:entry.kind==='page'?1:0)}))
  .sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,language));
}

export function createSiteSearch({siteRole,getLanguage,getRole,startSituation,resolvePageHref=href=>href}){
 const moreLabels={en:'Show more results',ga:'Taispeáin níos mó torthaí',pt:'Mostrar mais resultados',ar:'عرض المزيد من النتائج',pl:'Pokaż więcej wyników',ro:'Arată mai multe rezultate',fr:'Afficher plus de résultats',es:'Mostrar más resultados','zh-Hans':'显示更多结果'};
 const dialog=document.querySelector('#site-search-dialog');
 if(!dialog)return;
 let restoreOnClose=true;
 let matches=[];
 let shown=0;
 const t=text=>translateText(text,getLanguage());
 const modal=createDialogController(dialog,()=>{
  if(!restoreOnClose)return;
  const trigger=document.querySelector('#site-search-trigger');
  const compact=trigger?.closest('[hidden],[inert]')||!trigger?.getClientRects().length;
  (compact?document.querySelector('[data-nav-toggle]'):trigger)?.focus({preventScroll:true});
 },'#site-search-input');
 function close(restore=true){restoreOnClose=restore;modal.close();}
 function fitSearchViewport(){
  if(!dialog.open)return;
  // Mobile keyboards can shrink the visual viewport while the layout
  // viewport (and the native dialog's containing block) keeps its height.
  const viewport=window.visualViewport;
  const height=viewport?.height??window.innerHeight;
  dialog.toggleAttribute('data-short-viewport',height<=200);
  if(viewport?.scale===1){
   dialog.style.setProperty('--search-viewport-top',viewport.offsetTop+'px');
   dialog.style.setProperty('--search-viewport-bottom',Math.max(0,document.documentElement.clientHeight-viewport.height-viewport.offsetTop)+'px');
   dialog.style.setProperty('--search-viewport-height',viewport.height+'px');
  }else{
   for(const edge of ['top','bottom','height'])dialog.style.removeProperty('--search-viewport-'+edge);
  }
  const input=dialog.querySelector('#site-search-input');
  if(input!==document.activeElement)return;
  const field=input.getBoundingClientRect(),bounds=dialog.getBoundingClientRect();
  // CSS positions the panel inside the visual viewport. Compare the two
  // client rectangles directly: iOS may already report both relative to the
  // visible area after it pans to the keyboard, even with a nonzero offsetTop.
  const top=bounds.top+dialog.clientTop+2;
  const bottom=bounds.top+dialog.clientTop+dialog.clientHeight-2;
  // Scroll the dialog itself. scrollIntoView also pans the document on iOS
  // and its text-size-dependent scroll margins can exceed the keyboard gap.
  if(field.top<top)dialog.scrollTop+=field.top-top;
  else if(field.bottom>bottom)dialog.scrollTop+=field.bottom-bottom;
 }
 let fitFrame=0;
 function viewportChanged(){
  if(!dialog.open)return;
  fitSearchViewport();
  // Native focus scrolling can finish after resize/scroll dispatch.
  if(!fitFrame)fitFrame=requestAnimationFrame(()=>{fitFrame=0;fitSearchViewport();});
 }
 window.addEventListener('resize',viewportChanged);
 window.visualViewport?.addEventListener('resize',viewportChanged);
 window.visualViewport?.addEventListener('scroll',viewportChanged);
 dialog.addEventListener('focusin',viewportChanged);
 function resultHTML(entry){
  const kind=entry.kind==='situation'?'Situation':entry.kind==='page'?'Page':entry.kind==='practice'?'Practise one role at a time':'Source';
  const title=entry.kind==='source'||entry.originalLanguage
   ?`<strong lang="${entry.originalLanguage||'en-IE'}" dir="ltr" data-no-translate>${esc(entry.title)}</strong>`
   :`<strong>${esc(t(entry.title))}</strong>`;
  const description=entry.kind==='source'||entry.originalLanguage?entry.description:t(entry.description);
  const content=`<span class="site-search-kind">${esc(t(kind))}</span>${title}<span class="site-search-description" ${entry.kind==='source'||entry.originalLanguage?'lang="en-IE" dir="ltr"':''}>${esc(description)}</span>`;
  if(entry.kind==='situation')return `<li><button type="button" class="site-search-result" data-search-situation="${esc(entry.id)}">${content}</button></li>`;
  return `<li><a class="site-search-result" href="${esc(entry.kind==='source'?entry.href:resolvePageHref(entry.href))}" ${entry.kind==='source'?'target="_blank" rel="noopener noreferrer"':''}>${content}${entry.kind==='source'?`<span class="sr-only">${esc(t('opens in a new tab'))}</span>`:''}</a></li>`;
 }
 function showMore(focus=false){
  const list=dialog.querySelector('#site-search-results');
  const first=shown;
  const batch=matches.slice(shown,shown+20);
  list.insertAdjacentHTML('beforeend',batch.map(resultHTML).join(''));
  shown+=batch.length;
  const button=dialog.querySelector('#site-search-more');
  button.hidden=shown>=matches.length;
  if(focus)list.children[first]?.querySelector('.site-search-result')?.focus();
 }
 function update(){
  const query=dialog.querySelector('#site-search-input').value;
  matches=searchSite(query,{language:getLanguage(),siteRole});
  const status=dialog.querySelector('#site-search-status');
  status.innerHTML=!query.trim()?'':matches.length?`${esc(t('Results'))}: <bdi>${matches.length}</bdi>`:esc(t('No results. Try another keyword.'));
  shown=0;
  dialog.querySelector('#site-search-results').replaceChildren();
  showMore();
  fitSearchViewport();
 }
 function open(){
  restoreOnClose=true;
  const language=getLanguage();
  dialog.lang=language==='en'?'en-IE':language;dialog.dir=language==='ar'?'rtl':'ltr';
  dialog.innerHTML=`<div class="settings-content">
   <div class="site-search-heading"><h2 id="site-search-title">${esc(t('Search the website'))}</h2><button class="dialog-close" type="button" data-search-close aria-label="${esc(t('Close search'))}">×</button></div>
   <p id="site-search-help">${esc(t('Search situations, topics and sources.'))}</p>
   <form id="site-search-form" class="site-search-form" role="search"><label for="site-search-input">${esc(t('Keywords'))}</label><div class="site-search-fields"><input id="site-search-input" name="keywords" type="search" maxlength="120" autocomplete="off" aria-describedby="site-search-help" enterkeyhint="search"><button type="submit" class="primary">${esc(t('Search'))}</button></div></form>
   <p id="site-search-status" class="site-search-status" role="status" aria-live="polite" aria-atomic="true"></p>
   <ol id="site-search-results" class="site-search-results"></ol><button type="button" id="site-search-more" class="text-button" aria-controls="site-search-results" hidden>${esc(moreLabels[language]||moreLabels.en)}</button>
  </div>`;
  modal.open();
  fitSearchViewport();
  indexPrivacyNotice().then(()=>{
   const input=dialog.querySelector('#site-search-input');
   if(dialog.open&&input?.value&&input===document.activeElement)update();
  });
 }
 // The reading settings rebuild the navigation when the language changes.
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-search-open]');
  if(!trigger)return;
  trigger.removeAttribute('onclick');
  delete document.documentElement.dataset.searchPending;
  open();
 });
 document.querySelector('[data-search-open]')?.removeAttribute('onclick');
 if(document.documentElement.hasAttribute('data-search-pending')){
  delete document.documentElement.dataset.searchPending;
  open();
 }
 dialog.addEventListener('input',event=>{if(event.target.id==='site-search-input')update();});
 dialog.addEventListener('submit',event=>{event.preventDefault();update();dialog.querySelector('.site-search-result')?.focus();});
 dialog.addEventListener('click',event=>{
  if(event.target.closest('#site-search-more')){showMore(true);return;}
  if(event.target.closest('[data-search-close]')){close();return;}
  const result=event.target.closest('.site-search-result');
  if(!result)return;
  if(result.dataset.searchSituation){
   const role=getRole();close(false);startSituation(result.dataset.searchSituation,role);
  }else if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey)close(result.target==='_blank');
 });
 dialog.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
  if(event.key==='ArrowDown'&&event.target.id==='site-search-input'){
   const first=dialog.querySelector('.site-search-result');if(first){event.preventDefault();first.focus();}
  }
 });
 globalThis.addEventListener('hashchange',()=>{if(dialog.open)close(false);});
}
