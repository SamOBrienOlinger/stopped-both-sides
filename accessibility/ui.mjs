import {decodeState} from '../encounters/engine.mjs';
import {createPreferences,defaults} from './preferences.mjs?v=site-languages-1';
import {createDialogController} from './dialog.mjs';
import {translateText,translateHTML,loadLanguage,languageLoaded,escapeHTML as esc} from '../locales/translate.mjs?v=scene-review-1';
import {languages,languageInfo,normaliseLanguage} from '../locales/languages.mjs';
const translateNotice='Working translation: independent Irish-language and legal review is still needed. You can return to English at any time.';
const languageHelp='Portuguese, Arabic, Polish, Romanian, French, Spanish and Simplified Chinese cover the whole site, including both game modes and reference pages. Irish covers the shared game.';
const reviewNotice='Translations support learning and have not been independently reviewed. Original source publications keep their own language. You can return to English at any time.';
const loadError='The language could not be loaded. Your current language and progress are unchanged. Check your connection and try again.';
export function perspectiveForRoute(hash,siteRole='public'){
 const route=hash.replace(/^#/, '').split('~')[0];
 if(route.startsWith('encounter/'))return decodeState(route.slice(10))?.role||siteRole;
 if(route==='encounters/public')return 'public';
 if(route==='encounters/garda')return 'garda';
 return siteRole;
}
export function createReadingTools({main,rerender,siteRole='public',transformContent=html=>html,onRender=()=>{},onDialogOpen=()=>{}}){
 let storage;try{storage=globalThis.localStorage;}catch{}
 const preferences=createPreferences(storage,globalThis.location?.search||'',siteRole);
 const root=document.documentElement,dialog=document.querySelector('#reading-dialog'),live=document.querySelector('#page-status');
 let opener=null,openerId='',loadGeneration=0,initialLoadFailed=false;
 let activeLanguage=languageLoaded(preferences.value.language)?preferences.value.language:'en';
 let dialogLanguage=activeLanguage;
 const t=text=>translateText(text,activeLanguage);
 const restoreFocus=()=>{
  const target=(openerId&&document.getElementById?.(openerId))||(opener?.isConnected?opener:null)||document.querySelector('[data-reading-open]');
  target?.focus?.({preventScroll:true});
  const box=target?.getBoundingClientRect?.();
  if(box&&(box.top<0||box.bottom>window.innerHeight))target.scrollIntoView?.({block:'nearest',behavior:'instant'});
 };
 const modal=createDialogController(dialog,()=>{loadGeneration++;restoreFocus();});
 const shell=['.header nav','.skip','.footer'].map(selector=>{const el=document.querySelector(selector);return el?{el,html:el.innerHTML}:null;}).filter(Boolean);
 const wordmark=document.querySelector('.wordmark');
 const wordmarkLabel=wordmark?.getAttribute?.('aria-label');
 function announce(message){if(live){live.textContent='';queueMicrotask(()=>{live.textContent=t(message);});}}
 function applyDisplay(){
  const p=preferences.value,language=languageInfo(activeLanguage),focused=document.activeElement;
  if(root){
   root.lang=language.tag;root.dir=language.dir;
   root.setAttribute?.('dir',language.dir);
   root.style.setProperty('--reading-size',p.size+'%');
   root.classList.toggle('contrast-high',p.contrast==='high');
   root.classList.toggle('reading-spacious',p.spacing);root.classList.toggle('motion-reduce',p.motion);
  }
  for(const {el,html} of shell)el.innerHTML=translateHTML(html,activeLanguage);
  document.querySelector('.header nav')?.setAttribute('aria-label',t('Main navigation'));
  document.querySelectorAll('[data-reading-open]').forEach(button=>button.textContent=t('Language & reading'));
  if(wordmarkLabel)wordmark.setAttribute('aria-label',t(wordmarkLabel));
  if(focused?.id&&focused.isConnected===false)document.getElementById?.(focused.id)?.focus?.({preventScroll:true});
 }
 function dialogHTML(){const p=preferences.value;return translateHTML(`<form class="settings-content" id="reading-form"><div class="settings-heading"><h2 id="reading-title" tabindex="-1">Language & reading</h2><button class="dialog-close" type="button" data-reading-close aria-label="Close settings">×</button></div><p id="reading-intro" class="settings-help">Your language and reading preferences are saved in this browser. Applying them keeps your answers, role and scores.</p><div class="settings-field"><label for="reading-language">Language</label><select id="reading-language" name="language" aria-describedby="language-instructions language-help translation-help">${languages.map(language=>`<option value="${language.id}" lang="${language.tag}" dir="${language.dir}" data-no-translate ${p.language===language.id?'selected':''}>${language.name}</option>`).join('')}</select><p class="settings-help" id="language-instructions">Choose a language, then select Apply preferences. Your game will stay at the same point.</p><p class="settings-help" id="language-help">${languageHelp}</p><p class="settings-help" id="translation-help">${activeLanguage==='ga'?translateNotice:reviewNotice}</p></div><div class="settings-field"><label for="reading-size">Text size</label><select id="reading-size" name="size">${[[100,'Standard (100%)'],[115,'Larger (115%)'],[130,'Large (130%)'],[150,'Extra large (150%)']].map(([n,label])=>`<option value="${n}" ${p.size===n?'selected':''}>${label}</option>`).join('')}</select></div><div class="settings-field"><label for="reading-contrast">Contrast</label><select id="reading-contrast" name="contrast"><option value="standard" ${p.contrast==='standard'?'selected':''}>Standard</option><option value="high" ${p.contrast==='high'?'selected':''}>High</option></select></div><label class="settings-check"><input type="checkbox" name="spacing" ${p.spacing?'checked':''}>More reading space</label><label class="settings-check"><input type="checkbox" name="motion" ${p.motion?'checked':''}>Reduce motion</label><div id="reading-status" class="settings-help" role="status" aria-live="polite" aria-atomic="true"></div><div class="settings-actions"><button class="primary" type="submit">Apply preferences</button><button class="primary secondary" type="button" data-reading-close>Cancel</button></div><button class="plain-link settings-reset" type="button" data-reading-reset>Reset reading preferences</button></form>`,activeLanguage);}
 function close(){loadGeneration++;modal.close();}
 function open(button){
  if(!dialog)return;
  opener=button;openerId=button?.id||'';dialogLanguage=activeLanguage;
  const language=languageInfo(dialogLanguage);
  dialog.setAttribute?.('lang',language.tag);dialog.setAttribute?.('dir',language.dir);
  dialog.innerHTML=dialogHTML();modal.open();onDialogOpen(dialog);
 }
 function setLanguageQuery(){if(typeof location.href!=='string')return;const url=new URL(location.href);url.searchParams.set('lang',activeLanguage);history.replaceState(null,'',url.pathname+url.search+url.hash);}
 function commit(next){
  // Re-render only presentation. The app continues to own every session object.
  const hash=globalThis.location?.hash;
  const disclosures=Array.from(main.querySelectorAll?.('details')||[],element=>element.open);
  const languageChanged=activeLanguage!==next.language;
  preferences.save(next);activeLanguage=preferences.value.language;initialLoadFailed=false;setLanguageQuery();applyDisplay();close();rerender(false);
  if(globalThis.location?.hash===hash)Array.from(main.querySelectorAll?.('details')||[]).forEach((element,index)=>{if(index<disclosures.length)element.open=disclosures[index];});
  restoreFocus();
  announce(!preferences.available?'Preferences apply for this visit; browser saving is unavailable.':languageChanged?'Language changed. Your progress is unchanged.':'Reading preferences applied. Your progress is unchanged.');
 }
 function busy(value,message=''){
  const submit=dialog?.querySelector?.('[type="submit"]');
  const status=dialog?.querySelector?.('#reading-status');if(status)status.textContent=translateText(message,dialogLanguage);
  // Disabling the focused button can blur to the page without a focusin event.
  // Keep keyboard events inside the fallback dialog while the download runs.
  if(value&&submit===document.activeElement)dialog?.querySelector?.('.settings-actions [data-reading-close]')?.focus?.({preventScroll:true});
  if(submit)submit.disabled=value;
 }
 function save(value){
  const next={...value,language:normaliseLanguage(value.language)},generation=++loadGeneration;
  if(languageLoaded(next.language)){commit(next);return Promise.resolve(true);}
  busy(true,'Loading the selected language…');
  return loadLanguage(next.language).then(()=>{
   if(generation!==loadGeneration)return false;
   busy(false);commit(next);return true;
  }).catch(()=>{if(generation===loadGeneration)busy(false,loadError);return false;});
 }
 // Native select changes are deliberately inert until the form is submitted.
 dialog?.addEventListener('submit',event=>{event.preventDefault();const form=event.target;save({language:form.elements.language.value,size:Number(form.elements.size.value),contrast:form.elements.contrast.value,spacing:form.elements.spacing.checked,motion:form.elements.motion.checked});});
 dialog?.addEventListener('cancel',()=>{loadGeneration++;});
 document.addEventListener?.('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-reading-open'))open(button);
  else if(button.hasAttribute('data-reading-close'))close();
  else if(button.hasAttribute('data-reading-reset')){save({...defaults,language:activeLanguage});announce('Reading preferences reset.');}
 });
 function decorate(hash){
  const perspective=perspectiveForRoute(hash,siteRole),language=activeLanguage,info=languageInfo(language);
  root?.setAttribute?.('data-perspective',perspective);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',perspective==='garda'?'#284f7e':'#175e61');
  const reference=hash==='about'||hash==='accessibility'||hash.startsWith('rights')||hash.startsWith('evidence');
  const irishReference=language==='ga'&&reference;
  main.setAttribute?.('lang',irishReference?'en-IE':info.tag);
  main.setAttribute?.('dir',irishReference?'ltr':info.dir);
  if(initialLoadFailed)main.innerHTML=`<div class="translation-note"><p>${esc(loadError)} <button class="plain-link" id="language-settings-recovery" data-reading-open>${esc(t('Language & reading'))}</button></p></div>`+main.innerHTML;
  if(language==='ga'){
   if(reference)main.innerHTML=`<div class="translation-note" lang="ga"><p>Tá an rannóg thagartha seo i mBéarla. Tá na cásanna roinnte ar fáil i nGaeilge. <a href="#encounters">Roghnaigh cás</a></p></div>`+main.innerHTML;
   else main.innerHTML=`<div class="translation-note"><p>${esc(t(translateNotice))} <button class="plain-link" id="language-settings-irish-note" data-reading-open>${esc(t('Language & reading'))}</button></p></div>`+translateHTML(main.innerHTML,language);
  }else if(language!=='en')main.innerHTML=translateHTML(main.innerHTML,language);
  main.innerHTML=transformContent(main.innerHTML,hash);
  main.querySelectorAll?.('h1,h2[id]').forEach(h=>h.setAttribute('tabindex','-1'));
  const referenceRoute=hash.split('~')[0];
  const evidenceGroup=referenceRoute.startsWith('evidence/')?document.getElementById?.('source-'+referenceRoute.slice(9))?.closest?.('.evidence-group')?.id:null;
  const currentTopic='#'+(evidenceGroup?'evidence/'+evidenceGroup:referenceRoute);
  main.querySelectorAll?.('.source-topic-nav a,.evidence-nav a').forEach(a=>{
   if(a.getAttribute('href')===currentTopic)a.setAttribute('aria-current','location');
   else a.removeAttribute('aria-current');
  });
  main.querySelectorAll?.('a[target="_blank"]').forEach(a=>{if(!a.querySelector('.sr-only')){const hint=document.createElement('span');hint.className='sr-only';hint.lang=info.tag;hint.dir=info.dir;hint.textContent=' ('+t('opens in a new tab')+')';a.append(hint);}});
  const anchor=document.querySelector('[data-site-switch]');if(anchor){try{const url=new URL(anchor.href);url.searchParams.set('lang',language);anchor.href=url.href;}catch{}anchor.textContent=t(anchor.textContent);}
  const heading=main.querySelector?.('h1')?.textContent?.replace(/\s+/g,' ').trim();
  if(!irishReference&&(heading||language!=='en'))document.title=(heading==='Stopped: Both Sides'?'Stopped: Both Sides — '+t(siteRole==='garda'?'Garda perspective':'Public perspective'):(heading||t('Play both sides'))+' | Stopped: Both Sides');
  onRender(hash);
 }
 applyDisplay();
 // A dialog keeps its rendered language and drafts while the initial pack loads.
 // Closing it does not cancel the saved language; a committed preference wins.
 const requested=preferences.value.language;
 const ready=languageLoaded(requested)?Promise.resolve():loadLanguage(requested).then(()=>{
  if(preferences.value.language===requested){activeLanguage=requested;applyDisplay();}
 }).catch(()=>{if(preferences.value.language===requested){initialLoadFailed=true;announce(loadError);}});
 return {get language(){return activeLanguage;},ready,decorate,announce,open,save};
}
export function accessibilityPage(){return `<div class="content-page"><p class="eyebrow">ACCESSIBILITY & LANGUAGE</p><h1>Learn at your own pace.</h1><p class="page-lead">Use the keyboard, enlarge the text or adjust the reading settings. There is no timer, and changing your display does not reset your game.</p><button class="primary" id="language-settings-page" data-reading-open>Language & reading</button><section class="info-block"><h2>Ways to use this site</h2><ul class="accessibility-list"><li><strong>Keyboard:</strong> Tab and Shift+Tab move between controls. Enter activates links; Enter or Space activates buttons. Use the skip link to reach the main content. Escape closes the reading settings.</li><li><strong>Reading:</strong> Choose larger text, higher contrast or more space. Browser zoom remains available. Reduced motion follows your device preference; you can also enable it here.</li><li><strong>Screen readers:</strong> Pages have landmarks and headings. Choices use native buttons, feedback receives focus and the active role is stated in words. Focus moves to the decision when you switch perspective.</li><li><strong>Your pace:</strong> There are no countdowns, flashing effects, automatic audio or time penalties. You can reconsider an answer, return to an earlier stage or leave and resume in this browser.</li></ul></section><section class="info-block"><h2>Languages across the site</h2><p>Portuguese, Arabic, Polish, Romanian, French, Spanish and Simplified Chinese are available throughout both perspectives: all 14 shared situations and 59 stages, original practice, choices, feedback, recaps, progress, rights, evidence and information pages.</p><p>Open Language & reading in the navigation or footer. Choose a language using its own name, then select Apply preferences. The page language is identified for screen readers. Arabic uses right-to-left text. Your character, answers, stage, role and scores stay in place.</p><p>English remains available. Irish covers the shared game; its reference pages remain in English, and choosing Irish during original practice opens the matching shared situation. Published source titles and authors retain their original form so you can identify the source.</p><p>The translations are working learning resources and still need independent language and legal review. The original English text remains available at any time.</p><p>No translation service receives your game choices. Language and reading preferences are stored in this browser separately from your learning record. If saving is blocked, preferences still work for the current visit.</p></section><section class="info-block"><h2>Standards and current checks</h2><p>The implementation targets <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer">WCAG 2.2 Level AA</a>. It uses high-contrast text, visible focus, labelled controls, generous targets, flexible layouts and semantic HTML. The reading settings use the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" target="_blank" rel="noopener noreferrer">modal dialog pattern</a>.</p><p>Code checks cover game routes, translated content, preference validation, progress preservation and the main colour combinations. These checks do not establish conformance on their own. Manual browser zoom and reflow checks, keyboard and screen-reader testing on real devices, and testing with disabled users remain outstanding. This site has not received an independent accessibility audit.</p></section><section class="info-block"><h2>If something gets in your way</h2><p>You can reset the reading settings without clearing progress. If you report an issue to the project creator, describe the page or situation, the control involved and your browser or assistive technology. You do not need to include personal details about a real Garda encounter.</p><a class="text-button" href="https://samobrienolinger.github.io/SamOBrienOlinger/" target="_blank" rel="noopener noreferrer">Project creator and contact information ↗</a></section><a class="primary" href="#encounters">Choose a situation</a></div>`;}

