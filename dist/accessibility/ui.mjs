import {decodeState} from '../encounters/engine.mjs';
import {createPreferences,defaults} from './preferences.mjs';
import {translateText,translateHTML,escapeHTML as esc} from '../locales/translate.mjs';
const translateNotice='Working translation: independent Irish-language and legal review is still needed. You can return to English at any time.';
export function perspectiveForRoute(hash,siteRole='public'){
 const route=hash.replace(/^#/, '').split('~')[0];
 if(route.startsWith('encounter/'))return decodeState(route.slice(10))?.role||siteRole;
 if(route==='encounters/public')return 'public';
 if(route==='encounters/garda')return 'garda';
 return siteRole;
}
export function createReadingTools({main,rerender,siteRole='public'}){
 let storage;try{storage=globalThis.localStorage;}catch{}
 const preferences=createPreferences(storage,globalThis.location?.search||'',siteRole);
 const root=document.documentElement,dialog=document.querySelector('#reading-dialog'),live=document.querySelector('#page-status');
 let opener=null;
 const shell=['.header nav','.skip','.footer'].map(selector=>{const el=document.querySelector(selector);return el?{el,html:el.innerHTML}:null;}).filter(Boolean);
 const t=text=>translateText(text,preferences.value.language);
 function announce(message){if(live){live.textContent='';queueMicrotask(()=>{live.textContent=t(message);});}}
 function applyDisplay(){
  const p=preferences.value;
  if(root){root.lang=p.language==='ga'?'ga':'en-IE';root.style.setProperty('--reading-size',p.size+'%');root.classList.toggle('contrast-high',p.contrast==='high');root.classList.toggle('reading-spacious',p.spacing);root.classList.toggle('motion-reduce',p.motion);}
  for(const {el,html} of shell)el.innerHTML=translateHTML(html,p.language);
  document.querySelector('.header nav')?.setAttribute('aria-label',t('Main navigation'));
  document.querySelectorAll('[data-reading-open]').forEach(button=>button.textContent=t('Language & reading')+' · English / Gaeilge');
 }
 function dialogHTML(){const p=preferences.value;return translateHTML(`<form class="settings-content" id="reading-form"><div class="settings-heading"><h2 id="reading-title" tabindex="-1">Language & reading</h2><button class="dialog-close" type="button" data-reading-close aria-label="Close settings">×</button></div><p id="reading-intro" class="settings-help">Your language and reading preferences are saved in this browser. Applying them keeps your answers, role and scores.</p><div class="settings-field"><label for="reading-language">Language</label><select id="reading-language" name="language" aria-describedby="language-help translation-help"><option value="en" lang="en" data-no-translate ${p.language==='en'?'selected':''}>English</option><option value="ga" lang="ga" data-no-translate ${p.language==='ga'?'selected':''}>Gaeilge</option></select><p class="settings-help" id="language-help">Irish covers all 14 shared situations, choices, explanations and progress. Source publications and the separate reference sections remain in English.</p><p class="settings-help" id="translation-help">${translateNotice}</p></div><div class="settings-field"><label for="reading-size">Text size</label><select id="reading-size" name="size">${[[100,'Standard (100%)'],[115,'Larger (115%)'],[130,'Large (130%)'],[150,'Extra large (150%)']].map(([n,label])=>`<option value="${n}" ${p.size===n?'selected':''}>${label}</option>`).join('')}</select></div><div class="settings-field"><label for="reading-contrast">Contrast</label><select id="reading-contrast" name="contrast"><option value="standard" ${p.contrast==='standard'?'selected':''}>Standard</option><option value="high" ${p.contrast==='high'?'selected':''}>High</option></select></div><label class="settings-check"><input type="checkbox" name="spacing" ${p.spacing?'checked':''}>More reading space</label><label class="settings-check"><input type="checkbox" name="motion" ${p.motion?'checked':''}>Reduce motion</label><div class="settings-actions"><button class="primary" type="submit">Apply preferences</button><button class="primary secondary" type="button" data-reading-close>Cancel</button></div><button class="plain-link settings-reset" type="button" data-reading-reset>Reset reading preferences</button></form>`,p.language);}
 function close(){dialog?.close();if(opener?.isConnected)opener.focus();else document.querySelector('[data-reading-open]')?.focus();}
 function open(button){if(!dialog)return;opener=button;dialog.innerHTML=dialogHTML();dialog.showModal();dialog.querySelector('#reading-title')?.focus();}
 function setLanguageQuery(){if(typeof location.href!=='string')return;const url=new URL(location.href);url.searchParams.set('lang',preferences.value.language);history.replaceState(null,'',url.pathname+url.search+url.hash);}
 function save(next){preferences.save(next);setLanguageQuery();applyDisplay();close();rerender(false);document.querySelector('[data-reading-open]')?.focus();announce(preferences.available?'Reading preferences applied. Your progress is unchanged.':'Preferences apply for this visit; browser saving is unavailable.');}
 // Native dialog supplies modal focus containment, Escape and inert background. No custom keyboard trap.
 dialog?.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();else document.querySelector('[data-reading-open]')?.focus();});
 dialog?.addEventListener('submit',event=>{event.preventDefault();const form=event.target;save({language:form.elements.language.value,size:Number(form.elements.size.value),contrast:form.elements.contrast.value,spacing:form.elements.spacing.checked,motion:form.elements.motion.checked});});
 document.addEventListener?.('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-reading-open'))open(button);
  else if(button.hasAttribute('data-reading-close'))close();
  else if(button.hasAttribute('data-reading-reset')){save({...defaults,language:preferences.value.language});announce('Reading preferences reset.');}
 });
 function decorate(hash){
  const perspective=perspectiveForRoute(hash,siteRole);
  root?.setAttribute?.('data-perspective',perspective);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',perspective==='garda'?'#284f7e':'#175e61');
  const language=preferences.value.language;
  const reference=hash==='about'||hash==='accessibility'||hash==='rights'||hash.startsWith('evidence');
  main.setAttribute?.('lang',reference?'en-IE':language==='ga'?'ga':'en-IE');
  if(language==='ga'){
   if(reference)main.innerHTML=`<div class="translation-note" lang="ga"><p>Tá an rannóg thagartha seo i mBéarla. Tá na cásanna roinnte ar fáil i nGaeilge. <a href="#encounters">Roghnaigh cás</a></p></div>`+main.innerHTML;
   else main.innerHTML=`<div class="translation-note"><p>${esc(t(translateNotice))} <button class="plain-link" data-reading-open>${esc(t('Language & reading'))}</button></p></div>`+translateHTML(main.innerHTML,language);
  }
  main.querySelectorAll?.('h1,h2[id]').forEach(h=>h.setAttribute('tabindex','-1'));
  main.querySelectorAll?.('a[target="_blank"]').forEach(a=>{if(!a.querySelector('.sr-only')){const hint=document.createElement('span');hint.className='sr-only';hint.lang=language==='ga'?'ga':'en';hint.textContent=' ('+t('opens in a new tab')+')';a.append(hint);}});
  const anchor=document.querySelector('[data-site-switch]');if(anchor){try{const url=new URL(anchor.href);url.searchParams.set('lang',language);anchor.href=url.href;}catch{}anchor.textContent=t(anchor.textContent);}
  const heading=main.querySelector?.('h1')?.textContent?.replace(/\s+/g,' ').trim();
  if(!reference&&(heading||language==='ga'))document.title=(heading==='Stopped: Both Sides'?'Stopped: Both Sides — '+t(siteRole==='garda'?'Garda perspective':'Public perspective'):(heading||t('Play both sides'))+' | Stopped: Both Sides');
 }
 applyDisplay();
 return {get language(){return preferences.value.language;},decorate,announce,open,save};
}
export function accessibilityPage(){return `<div class="content-page"><p class="eyebrow">ACCESSIBILITY & LANGUAGE</p><h1>Learn at your own pace.</h1><p class="page-lead">Use the keyboard, enlarge the text or adjust the reading settings. There is no timer, and changing your display does not reset your game.</p><button class="primary" data-reading-open>Language & reading</button><section class="info-block"><h2>Ways to use this site</h2><ul class="accessibility-list"><li><strong>Keyboard:</strong> Tab and Shift+Tab move between controls. Enter activates links; Enter or Space activates buttons. Use the skip link to reach the main content. Escape closes the reading settings.</li><li><strong>Reading:</strong> Choose larger text, higher contrast or more space. Browser zoom remains available. Reduced motion follows your device preference; you can also enable it here.</li><li><strong>Screen readers:</strong> Pages have landmarks and headings. Choices use native buttons, feedback receives focus and the active role is stated in words. Focus moves to the decision when you switch perspective.</li><li><strong>Your pace:</strong> There are no countdowns, flashing effects, automatic audio or time penalties. You can reconsider an answer, return to an earlier stage or leave and resume in this browser.</li></ul></section><section class="info-block"><h2>English and Gaeilge</h2><p>The shared game includes all 14 situations and 59 stages in both languages: scenes, both roles’ choices, feedback, recaps and progress. Change language using Language & reading. Your answers, current stage and scores stay in place. When you switch between sites, the chosen language travels with your progress.</p><p>The Irish text is a working translation awaiting independent Irish-language and legal review. You can switch back to the English reference at any point. Source publication titles, the evidence library and other reference pages remain in English and are marked accordingly. The original single-role practice is available in English; choosing Irish during that practice opens the matching shared situation at the same stage.</p><p>No translation service receives your game choices. Language and reading preferences are stored in this browser separately from your learning record. If saving is blocked, preferences still work for the current visit.</p></section><section class="info-block"><h2>Standards and current checks</h2><p>The implementation targets <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer">WCAG 2.2 Level AA</a>. It uses high-contrast text, visible focus, labelled controls, generous targets, flexible layouts and semantic HTML. The reading settings use the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" target="_blank" rel="noopener noreferrer">modal dialog pattern</a>.</p><p>Code checks cover game routes, translated content, preference validation, progress preservation and the main colour combinations. These checks do not establish conformance on their own. Manual browser zoom and reflow checks, keyboard and screen-reader testing on real devices, and testing with disabled users remain outstanding. This site has not received an independent accessibility audit.</p></section><section class="info-block"><h2>If something gets in your way</h2><p>You can reset the reading settings without clearing progress. If you report an issue to the project creator, describe the page or situation, the control involved and your browser or assistive technology. You do not need to include personal details about a real Garda encounter.</p><a class="text-button" href="https://samobrienolinger.github.io/SamOBrienOlinger/" target="_blank" rel="noopener noreferrer">Project creator and contact information ↗</a></section><a class="primary" href="#encounters">Choose a situation</a></div>`;}
