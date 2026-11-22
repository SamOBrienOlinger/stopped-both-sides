import {encounters,references} from '../encounters/catalog.mjs?v=colleague-witness-20261122';
import {topicGroups} from '../encounters/presentation.mjs?v=colleague-witness-20261122';
import {createDialogController} from '../accessibility/dialog.mjs?v=learning-language-20261120';
import {translateText,escapeHTML as esc} from '../locales/translate.mjs?v=contributors-expanded-20261122';
import {learningAbout,prototypeInput,firstTimeGuide} from '../learning/about.mjs?v=contributors-expanded-20261122';
import {communitySources} from '../learning/community-resources.mjs?v=community-resources-20261122';

const fold=value=>String(value||'').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase().replace(/ł/g,'l').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const indexes=new Map();
function searchIndex(language,siteRole){
 const key=language+'/'+siteRole;
 if(indexes.has(key))return indexes.get(key);
 const entries=Object.values(encounters).map(encounter=>{
  const topic=topicGroups.find(group=>group.encounters.includes(encounter.id));
  const text=[encounter.title,encounter.description,encounter.goal,topic?.title,encounter.ground];
  for(const stage of Object.values(encounter.nodes)){
   text.push(stage.title,stage.scene);
   for(const view of Object.values(stage.views))text.push(view.prompt,view.lesson,...view.choices.flatMap(choice=>[choice.text,choice.feedback]));
  }
  return {kind:'situation',id:encounter.id,title:encounter.title,description:encounter.description,originalLanguage:encounter.language,text};
 });
 const pages=[
  ['Home','#play','Browse all situations'],
  ['About','#about','A prototype with space for input'],
  ['Accessibility','#accessibility','Language & reading'],
  ['Scores & progress','#progress','Your learning record'],
  siteRole==='garda'?['Evidence library','#evidence','Garda resources']:['Human and Civil Rights & sources','#rights','Advice & support']
 ];
 for(const [title,href,description] of pages){
  const content=href==='#about'?(learningAbout()+prototypeInput(siteRole)+firstTimeGuide()).split(/<[^>]*>/).map(text=>text.trim()).filter(Boolean):[];
  entries.push({kind:'page',title,href,description,text:[title,description,...content]});
 }
 const urls=new Set();
 for(const source of [...Object.values(communitySources),...Object.values(references)]){
  if(urls.has(source.url))continue;
  urls.add(source.url);
  entries.push({kind:'source',title:source.title,href:source.url,description:source.note||'',text:[source.title,source.note,source.group]});
 }
 const index=entries.map(entry=>({...entry,label:fold(entry.title+' '+translateText(entry.title,language)),keywords:fold(entry.text.filter(Boolean).flatMap(text=>[text,translateText(text,language)]).join(' '))}));
 indexes.set(key,index);return index;
}

export function searchSite(query,{language='en',siteRole='public'}={}){
 const terms=fold(String(query).slice(0,120));
 if(!terms)return [];
 const words=terms.split(' ');
 return searchIndex(language,siteRole)
  .filter(entry=>words.every(word=>entry.keywords.includes(word)))
  .map(entry=>({...entry,score:(entry.label.includes(terms)?20:0)+words.filter(word=>entry.label.includes(word)).length*5+(entry.kind==='situation'?2:entry.kind==='page'?1:0)}))
  .sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,language));
}

export function createSiteSearch({siteRole,getLanguage,getRole,startSituation}){
 const dialog=document.querySelector('#site-search-dialog');
 if(!dialog)return;
 let restoreOnClose=true;
 const t=text=>translateText(text,getLanguage());
 const modal=createDialogController(dialog,()=>{
  if(!restoreOnClose)return;
  const trigger=document.querySelector('#site-search-trigger');
  const compact=trigger?.closest('[hidden],[inert]')||!trigger?.getClientRects().length;
  (compact?document.querySelector('[data-nav-toggle]'):trigger)?.focus({preventScroll:true});
 },'#site-search-input');
 function close(restore=true){restoreOnClose=restore;modal.close();}
 function resultHTML(entry){
  const kind=entry.kind==='situation'?'Situation':entry.kind==='page'?'Page':'Source';
  const title=entry.kind==='source'||entry.originalLanguage
   ?`<strong lang="${entry.originalLanguage||'en-IE'}" dir="ltr" data-no-translate>${esc(entry.title)}</strong>`
   :`<strong>${esc(t(entry.title))}</strong>`;
  const description=entry.kind==='source'||entry.originalLanguage?entry.description:t(entry.description);
  const content=`<span class="site-search-kind">${esc(t(kind))}</span>${title}<span class="site-search-description" ${entry.kind==='source'||entry.originalLanguage?'lang="en-IE" dir="ltr"':''}>${esc(description)}</span>`;
  if(entry.kind==='situation')return `<li><button type="button" class="site-search-result" data-search-situation="${esc(entry.id)}">${content}</button></li>`;
  return `<li><a class="site-search-result" href="${esc(entry.href)}" ${entry.kind==='source'?'target="_blank" rel="noopener noreferrer"':''}>${content}${entry.kind==='source'?`<span class="sr-only">${esc(t('opens in a new tab'))}</span>`:''}</a></li>`;
 }
 function update(){
  const query=dialog.querySelector('#site-search-input').value;
  const matches=searchSite(query,{language:getLanguage(),siteRole});
  const status=dialog.querySelector('#site-search-status');
  status.innerHTML=!query.trim()?'':matches.length?`${esc(t('Results'))}: <bdi>${matches.length}</bdi>`:esc(t('No results. Try another keyword.'));
  dialog.querySelector('#site-search-results').innerHTML=matches.slice(0,20).map(resultHTML).join('');
  dialog.querySelector('#site-search-more').textContent=matches.length>20?t('Showing the first 20 results. Add another keyword to narrow your search.'):'';
 }
 function open(){
  restoreOnClose=true;
  const language=getLanguage();
  dialog.lang=document.documentElement.lang;dialog.dir=document.documentElement.dir;
  dialog.innerHTML=`<div class="settings-content">
   <div class="site-search-heading"><h2 id="site-search-title">${esc(t('Search the website'))}</h2><button class="dialog-close" type="button" data-search-close aria-label="${esc(t('Close search'))}">×</button></div>
   <p id="site-search-help">${esc(t('Search situations, topics and sources.'))}</p>
   <form id="site-search-form" class="site-search-form" role="search"><label for="site-search-input">${esc(t('Keywords'))}</label><div class="site-search-fields"><input id="site-search-input" name="keywords" type="search" maxlength="120" autocomplete="off" aria-describedby="site-search-help" enterkeyhint="search"><button type="submit" class="primary">${esc(t('Search'))}</button></div></form>
   <p id="site-search-status" class="site-search-status" role="status" aria-live="polite" aria-atomic="true"></p>
   <ol id="site-search-results" class="site-search-results"></ol><p id="site-search-more" class="small-note"></p>
  </div>`;
  searchIndex(language,siteRole);modal.open();
 }
 document.addEventListener('click',event=>{if(event.target.closest('[data-search-open]'))open();});
 dialog.addEventListener('input',event=>{if(event.target.id==='site-search-input')update();});
 dialog.addEventListener('submit',event=>{event.preventDefault();update();dialog.querySelector('.site-search-result')?.focus();});
 dialog.addEventListener('click',event=>{
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
