// English is the source language of the application templates. Only fetch the
// translation tables when a saved preference, a link or the reader requests them.
import {normaliseLanguage} from './languages.mjs';
export {escapeHTML} from './html.mjs';

let translator;
let loading;
let attempts=0;

export function languageLoaded(language){
 return language==='en'||Boolean(translator?.languageLoaded(language));
}

export async function loadLanguage(value){
 const language=normaliseLanguage(value);
 if(language==='en')return;
 if(!translator){
  if(!loading){
   const attempt=attempts++;
   const retry=attempt?'&retry='+attempt:'';
   loading=import('./translate.mjs?v=responsive-fixes-20261127'+retry)
    .then(module=>{translator=module;})
    .finally(()=>{loading=undefined;});
  }
  await loading;
 }
 await translator.loadLanguage(language);
}

export function translateText(text,language='en'){
 return language==='en'||!translator?text:translator.translateText(text,language);
}
export function translateHTML(html,language='en'){
 return language==='en'||!translator?html:translator.translateHTML(html,language);
}
