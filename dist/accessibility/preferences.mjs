export const PREFERENCES_KEY='garda-encounter-reading-v1';
export const defaults=Object.freeze({language:'en',size:100,contrast:'standard',spacing:false,motion:false});
export function normalisePreferences(value){
 const v=value&&typeof value==='object'?value:{};
 return {language:v.language==='ga'?'ga':'en',size:[100,115,130,150].includes(v.size)?v.size:100,contrast:v.contrast==='high'?'high':'standard',spacing:v.spacing===true,motion:v.motion===true};
}
export const preferencesStorageKey=(siteRole='')=>PREFERENCES_KEY+(['public','garda'].includes(siteRole)?':'+siteRole:'');
export function createPreferences(storage,search='',siteRole=''){
 const key=preferencesStorageKey(siteRole);
 let value={...defaults},available=!!storage;
 try{value=normalisePreferences(JSON.parse(storage?.getItem(key)||'{}'));}catch{available=false;}
 const carried=new URLSearchParams(search).get('lang');if(['en','ga'].includes(carried))value.language=carried;
 return {get value(){return {...value};},get available(){return available;},save(next){value=normalisePreferences(next);try{storage?.setItem(key,JSON.stringify(value));available=!!storage;}catch{available=false;}return this.value;}};
}
