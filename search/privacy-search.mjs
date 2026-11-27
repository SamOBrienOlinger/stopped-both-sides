import {createSiteSearch,indexPrivacyNotice} from './site-search.mjs?v=casting-logos-20261127';
import {sites} from '../site.mjs';
import {createPreferences} from '../accessibility/preferences.mjs';
import {createCharacterPreferences} from '../encounters/characters.mjs?v=casting-logos-20261127';
import {startEncounter,stateHash} from '../encounters/engine.mjs?v=casting-logos-20261127';
import {loadLanguage,translateText} from '../locales/active-language.mjs?v=casting-logos-20261127';
import {languageInfo} from '../locales/languages.mjs';
import {privacyNotices} from '../locales/privacy-notice.mjs?v=site-repairs-20261125';

const role=new URLSearchParams(location.search).get('perspective')==='garda'?'garda':'public';
let storage;
try{storage=window.localStorage;}catch{/* Private browsing can disable storage. */}
let {language}=createPreferences(storage,location.search,role).value;
try{await loadLanguage(language);}catch{language='en';}

// Read the static English text before replacing it so both languages remain searchable.
await indexPrivacyNotice();
const notice=privacyNotices[language];
const {tag,dir}=languageInfo(language);
document.documentElement.lang=tag;
document.documentElement.dir=dir;
if(notice){
 document.title=notice.privacy+' | Stopped: Both Sides';
 for(const element of document.querySelectorAll('[data-privacy-copy]')){
  const message=notice[element.dataset.privacyCopy];
  const links=[...element.querySelectorAll('a')];
  let index=0;
  const nodes=message.split(/(\[\[.*?\]\])/u).map(part=>{
   if(!part.startsWith('[['))return document.createTextNode(part);
   const link=links[index++];
   link.textContent=part.slice(2,-2);
   return link;
  });
  element.replaceChildren(...nodes);
 }
 document.querySelector('main nav').setAttribute('aria-label',notice.privacy);
 document.querySelector('[data-back-to-top]').textContent=notice.top;
}
const trigger=document.querySelector('#site-search-trigger');
trigger.textContent=translateText('Search',language);
for(const link of document.querySelectorAll('main nav a'))link.textContent=translateText(link.textContent,language);
for(const link of document.querySelectorAll('main a[href]')){
 const destination=new URL(link.href);
 if(destination.origin===location.origin){
  destination.searchParams.set('lang',language);
  link.href=destination.href;
 }
}
function pageURL(href){
 const url=new URL(href,sites[role]);
 url.searchParams.set('lang',language);
 return url.href;
}
createSiteSearch({
 siteRole:role,getRole:()=>role,getLanguage:()=>language,resolvePageHref:pageURL,
 startSituation(id){
  const characterId=createCharacterPreferences(storage).value[role];
  location.assign(pageURL(stateHash(startEncounter(id,role,{characterId}))));
 }
});
