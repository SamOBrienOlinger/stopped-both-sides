import {normaliseLanguage,supportedLanguages} from '../locales/languages.mjs';
export const PREFERENCES_KEY='garda-encounter-reading-v1';
export const LANGUAGE_KEY=PREFERENCES_KEY+':language';
export const defaults=Object.freeze({language:'en',size:100,contrast:'standard',spacing:false,motion:false});
export function normalisePreferences(value){
 const v=value&&typeof value==='object'?value:{};
 return {language:normaliseLanguage(v.language),size:[100,115,130,150].includes(v.size)?v.size:100,contrast:v.contrast==='high'?'high':'standard',spacing:v.spacing===true,motion:v.motion===true};
}
export const preferencesStorageKey=(siteRole='')=>PREFERENCES_KEY+(['public','garda'].includes(siteRole)?':'+siteRole:'');
export function createPreferences(storage,search='',siteRole=''){
 const key=preferencesStorageKey(siteRole);
 let value={...defaults},available=!!storage,saved=null;
 try{saved=storage?.getItem(key);value=normalisePreferences(JSON.parse(saved||'{}'));}catch{available=false;}
 // A first visit may inherit the other side's language; an existing preference
 // for this side is retained. An explicit companion-link language takes priority.
 try{const shared=storage?.getItem(LANGUAGE_KEY);if(!saved&&supportedLanguages.includes(shared))value.language=shared;}catch{available=false;}
 const carried=new URLSearchParams(search).get('lang');if(carried&&(normaliseLanguage(carried)!=='en'||supportedLanguages.includes(carried)||carried==='en-IE'))value.language=normaliseLanguage(carried);
 return {get value(){return {...value};},get available(){return available;},save(next){value=normalisePreferences(next);try{storage?.setItem(key,JSON.stringify(value));storage?.setItem(LANGUAGE_KEY,value.language);available=!!storage;}catch{available=false;}return this.value;}};
}

