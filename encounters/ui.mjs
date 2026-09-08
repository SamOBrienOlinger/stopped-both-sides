import {encounters,roles,roleLabels,sites,references,stageCount} from './catalog.mjs';
import {startEncounter,currentStage,switchRole,otherRole,answer,continueEncounter,revisit,changeAnswer,decodeState,stateHash,fromOriginal} from './engine.mjs';
import {createProgressStore,recordProgress,runScores,progressTotals,packProgress,unpackProgress,mergeProgress} from './progress.mjs';
import {characters,characterFor,createCast,changeCharacter,createCharacterPreferences} from './characters.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const resultText=r=>r?`${r[0]} / ${r[1]} · ${Math.round(r[0]/r[1]*100)}%`:'No completed route yet';
const sourceLinks=ids=>`<details class="source-details"><summary>Read the sources for this decision</summary><ul lang="en-IE" data-no-translate>${ids.map(id=>{const s=references[id];return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></li>`;}).join('')}</ul></details>`;
const scoreExplanation='<p class="score-explanation">1 point for a choice that supports an appropriate resolution on these facts; 0 when the reasoning needs review. This measures learning, not personal bias or responsibility for someone else’s conduct.</p>';

export function createEncounterMode({siteRole,main,rerender,getOriginalSession,resetOriginalSession,announce=()=>{}}){
 let browserStorage;try{browserStorage=globalThis.localStorage;}catch{}
 const store=createProgressStore(browserStorage,siteRole);
 const characterPreferences=createCharacterPreferences(browserStorage),legacyCasts=new Map();
 let state=null,clearPending=false,characterPickerOpen=false,setupCharacterOpen=false;
 const handles=hash=>hash==='encounters'||hash.startsWith('encounters/')||hash.startsWith('encounter/')||hash==='progress'||hash.startsWith('progress~')||hash.startsWith('encounters~');
 function saveState(next){state=next;store.save(recordProgress(store.value,state));}
 function navigate(next,replace=false,focus=true){
  const hash=typeof next==='string'?next:stateHash(next);
  if(typeof next!=='string')saveState(next);
  if(replace){history.replaceState(null,'',hash);rerender(focus);}
  else if(location.hash===hash)rerender();else location.hash=hash;
 }
 function scoreStrip(s,compact=false){
  const scores=runScores(s);
  return `<div class="role-scores ${compact?'compact':''}" aria-label="Scores on this route">${roles.map(role=>`<div class="role-score ${s.role===role?'active':''}" data-role-tone="${role}"><span>${roleLabels[role]}</span><strong>${scores[role].points} / ${scores[role].answered} <small>points</small></strong><span>${scores[role].answered?`${scores[role].answered} decision${scores[role].answered===1?'':'s'} answered`:'No answers yet'}</span></div>`).join('')}</div>`;
 }
 function characterImage(role,id){
  const c=characterFor(role,id),src=new URL('../assets/characters/cast.webp',import.meta.url).href;
  return `<span class="character-image" aria-hidden="true"><img src="${src}" width="1774" height="887" alt="" decoding="async" style="left:-${c.column*100}%;top:-${c.row*100}%"></span>`;
 }
 function castDisplay(s){
  return `<div class="encounter-cast" aria-label="Characters in this situation">${[s.role,otherRole(s.role)].map(role=>`<div class="cast-character ${role===s.role?'is-you':''}" data-character-id="${s.cast[role]}" data-cast-role="${role}" data-role-tone="${role}">${characterImage(role,s.cast[role])}<div><span class="cast-label">${role===s.role?'You':'Other side'}</span><strong data-no-translate>${esc(characterFor(role,s.cast[role]).name)}</strong></div></div>`).join('')}</div>`;
 }
 function characterPicker(role,selected,inGame=false){
  return `<section class="character-picker" id="character-picker" aria-labelledby="character-picker-title" data-role-tone="${role}"><div class="character-picker-heading"><div><h2 id="character-picker-title" tabindex="-1">${inGame?'Change your character':'Choose your character'}</h2><p>${inGame?'Your stage, answers and scores stay in place.':'Choose how you appear in the game. Each situation keeps its own names and facts.'}</p></div>${inGame?'<button class="primary secondary" data-action="paired-character-close">Done</button>':''}</div><div class="character-options" role="group" aria-label="Available characters">${characters[role].map(c=>`<button class="character-option" data-action="${inGame?'paired-character-choose':'paired-character-select'}" data-role="${role}" data-character="${c.id}" aria-pressed="${selected===c.id}" aria-label="Choose character: ${c.name}">${characterImage(role,c.id)}<strong data-no-translate>${esc(c.name)}</strong><span class="character-selected">${selected===c.id?'✓ <span>Selected</span>':'<span>Choose</span>'}</span></button>`).join('')}</div><p class="character-help">${inGame?'Switch sides to play as the other character. You can change that character too.':'The other character is chosen at random when you start. Both characters stay with the situation until you change them.'}</p></section>`;
 }
 function focusCharacterPicker(){document.querySelector('#character-picker-title')?.focus({preventScroll:true});document.querySelector('#character-picker')?.scrollIntoView({block:'nearest',behavior:'instant'});}
 function legacyState(original,targetRole=siteRole){
  const key=siteRole+'-'+original.scenarioId;
  if(!legacyCasts.has(key))legacyCasts.set(key,createCast(siteRole,characterPreferences.value[siteRole]));
  return fromOriginal(original,siteRole,targetRole,legacyCasts.get(key));
 }
 function roleBar(s){
  return `<section class="perspective-bar play-toolbar" aria-label="Current perspective"><div><span class="eyebrow">${s.role==='garda'?'Garda perspective':'Public perspective'}</span><span>Same situation · ${s.complete?'recap':`stage ${s.history.length+1}`}</span></div><div class="character-actions"><button class="primary secondary" data-action="paired-characters" aria-expanded="${characterPickerOpen}" aria-controls="character-picker">Change character</button><button class="primary secondary perspective-toggle" data-action="paired-switch">Switch to ${s.role==='garda'?'the public':'the Garda'} perspective <span aria-hidden="true">⇄</span></button></div></section>${characterPickerOpen?characterPicker(s.role,s.cast[s.role],true):'<div id="character-picker" hidden></div>'}${castDisplay(s)}`;
 }
 function selection(role=siteRole){
  const first=encounters[role+'-street'],selected=characterPreferences.value[role];
  const goal=role==='public'?'Practise asking why you have been stopped and whether you are free to leave.':'Practise separating what you observed from what you assumed.';
  return `<section class="paired-picker simple-setup"><p class="eyebrow">START PLAYING</p><h1>Try your first situation.</h1><p class="page-lead">Read what happens, choose a response, then find out why it matters.</p><div class="role-picker" role="group" aria-label="Starting role">${roles.map(r=>`<a class="primary ${role===r?'':'secondary'}" href="#encounters/${r}" data-role-tone="${r}" ${role===r?'aria-current="true"':''}>${r==='public'?'Member of the public':'Member of An Garda Síochána'}</a>`).join('')}</div><div class="start-panel"><div class="setup-character" data-role-tone="${role}">${characterImage(role,selected)}<div><span class="cast-label">Your character</span><strong data-no-translate>${esc(characterFor(role,selected).name)}</strong><button class="text-button" data-action="paired-setup-characters" aria-expanded="${setupCharacterOpen}" aria-controls="setup-characters">Choose a different character</button></div></div>${setupCharacterOpen?`<div id="setup-characters">${characterPicker(role,selected)}<button class="primary secondary" data-action="paired-setup-done">Done</button></div>`:'<div id="setup-characters" hidden></div>'}<section class="recommended-situation" aria-labelledby="first-situation-title"><p class="eyebrow">START HERE</p><h2 id="first-situation-title">${esc(first.title)}</h2><p>${goal}</p><button class="primary" data-action="paired-quick-start" data-id="${first.id}" data-role="${role}">Start this situation</button><p class="small-note">No timer. You can change character or switch sides while you play.</p></section></div><details class="scenario-library"><summary>Browse all 14 situations</summary><p>Choose any situation. Each one can be played from both sides.</p><div class="paired-catalog">${Object.values(encounters).map(e=>`<article class="scenario encounter-card"><p class="eyebrow">${e.origin==='public'?'RIGHTS & RESPONSIBILITIES':'BIAS & DECISION-MAKING'}</p><h2>${esc(e.title)}</h2><p>${esc(e.description)}</p><button class="primary secondary" data-action="paired-start" data-id="${e.id}" data-role="${role}" aria-label="Play as ${role==='public'?'the member of the public':'the Garda'}: ${esc(e.title)}">Play this situation</button></article>`).join('')}</div></details>${resumeLink()}</section>`;
 }
 function resumeLink(){
  const saved=store.value.last&&decodeState(store.value.last);
  return saved?`<div class="info-block session-return"><span><strong>${saved.complete?'Last recap':'Continue your situation'}:</strong> ${esc(encounters[saved.id].title)} · ${roleLabels[saved.role]}</span><a class="text-button" href="${stateHash(saved)}">${saved.complete?'Open recap':'Resume play'} →</a></div>`:'';
 }
 function introduction(){
  return `<section class="home-intro clear-intro" aria-labelledby="game-title"><p class="eyebrow">LEARN THROUGH EVERYDAY SITUATIONS</p><h1 id="game-title" lang="en-IE" data-no-translate>Stopped: Both Sides</h1><p class="lead purpose-lead">Know your rights. Understand fair decisions.</p><p>Practise what to say and do in encounters with An Garda Síochána. Learn about rights, responsibilities and bias by trying the same situation from either side.</p><p class="small-note">An interactive learning game for the public and Gardaí.</p></section>`;
 }
 function landing(){
  const heroes=roles.map(role=>{
   const image=new URL(`../assets/heroes/${role}-960.webp`,import.meta.url).href;
   const srcset=[480,960,1600].map(width=>`${new URL(`../assets/heroes/${role}-${width}.webp`,import.meta.url).href} ${width}w`).join(', ');
   return `<div class="perspective-entry"><div class="perspective-hero" data-role-tone="${role}"><img src="${image}" srcset="${srcset}" sizes="(min-width: 1280px) 598px, (min-width: 900px) calc((100vw - 84px) / 2), calc(100vw - 56px)" width="1672" height="941" alt="" decoding="async"><a class="primary perspective-hero-button" href="#encounters/${role}">${role==='public'?'Public perspective':'Garda perspective'}</a></div><p>${role==='public'?'You are stopped. Learn what you can ask and what you may need to do.':'You make the stop. Check your reasons, assumptions and responsibilities.'}</p></div>`;
  }).join('');
  return `${resumeLink()}<section class="paired-entry paired-entry-visual" aria-labelledby="paired-title"><div><h2 id="paired-title">Which side will you try first?</h2><p>You can switch sides at any stage.</p></div><div class="perspective-heroes">${heroes}</div></section><section class="how-to-play" aria-labelledby="how-to-title"><h2 id="how-to-title">How it works</h2><ol><li><strong>Read a situation</strong><span>A short, fictional encounter with Gardaí.</span></li><li><strong>Choose a response</strong><span>Try what you would say or do.</span></li><li><strong>Learn why it matters</strong><span>Get an explanation, then try the other side.</span></li></ol><p class="small-note">No sign-up. No timer. You can try again.</p></section>`;
 }
 function playHelp(){
  return `<details class="play-help"><summary>Scores, sources and help</summary>${scoreStrip(state,true)}<p>One point means the response supports an appropriate resolution. Your rights never depend on your score.</p><p>Your avatar represents your role. The scene keeps its own names and facts.</p><p>Switch sides to compare the same moment. Your active answer decides what happens at the next step.</p><p>Read the explanation after each choice. Its source links show where the information comes from.</p>${storageNote()}<a class="text-button" href="#progress">My scores & progress</a></details>`;
 }
 function game(){
  if(state.complete)return recap();
  const e=encounters[state.id],stage=currentStage(state),view=stage.views[state.role],selected=state.answers[state.role],choice=selected===null?null:view.choices[selected];
  return `<div class="topline"><a href="#encounters/${state.role}" class="text-button">← All shared situations</a><a href="#progress" class="text-button">My progress</a></div>${roleBar(state)}<div class="game-grid paired-game"><section class="story" aria-labelledby="scene-title"><p class="eyebrow">${esc(e.title)} · SHARED SCENE</p><h1 id="scene-title">${esc(stage.title)}</h1><p class="story-text">${esc(stage.scene)}</p></section><section aria-labelledby="choice-title"><div class="prompt"><p class="eyebrow">YOUR TURN</p><h2 id="choice-title" tabindex="-1">${esc(view.prompt)}</h2><p>${choice?'Your answer is recorded for this role.':'Choose what you would say or do. You can try another answer.'}</p></div><div class="choices">${view.choices.map((c,i)=>`<button class="choice ${selected===i?'selected':''}" data-action="paired-answer" data-index="${i}" aria-pressed="${selected===i}" ${choice?'disabled':''}><span class="choice-letter" aria-hidden="true">${String.fromCharCode(65+i)}</span><span>${esc(c.text)}${selected===i?'<span class="choice-selected">Selected</span>':''}</span></button>`).join('')}</div>${choice?`<section class="feedback ${choice.review?'revisit':''}" id="feedback" tabindex="-1" aria-labelledby="feedback-title"><p class="eyebrow">${choice.points?'1 LEARNING POINT':'0 POINTS · AN OPPORTUNITY TO REVIEW'}</p><h2 id="feedback-title">${choice.review?'Consider this before continuing.':'This supports an appropriate response.'}</h2><p>${esc(choice.feedback)}</p><div class="lesson"><strong>Why this matters</strong><p>${esc(view.lesson)}</p></div><div class="paired-feedback-actions"><button class="primary" data-action="paired-next">${choice.next==='end'?'See what you learned':'Next step'}</button><button class="text-button" data-action="paired-change">Try another answer</button></div>${sourceLinks(view.refs)}</section>`:''}</section></div>${state.history.length?'<div class="paired-stage-footer"><button class="text-button" data-action="paired-back">← Revisit the previous stage</button></div>':''}${playHelp()}`;
 }
 function recap(){
  const e=encounters[state.id],scores=runScores(state);
  return `<div class="topline"><a href="#encounters/${state.role}" class="text-button">← All shared situations</a><a href="#progress" class="text-button">Saved progress</a></div>${roleBar(state)}<div class="summary-heading"><p class="eyebrow">YOUR SCORES & REFLECTION RECAP</p><h1>One situation.<br>What did each side reveal?</h1><p>${esc(e.title)} · ${state.history.length} stages on this route.</p></div>${scoreStrip(state)}<div class="role-results">${roles.map(role=>{const saved=store.value.records[state.id+'/'+role];return `<section class="info-block" data-role-tone="${role}"><h2>${roleLabels[role]}</h2><p>${scores[role].complete?'Route completed in this role.':`${scores[role].answered} of ${state.history.length} stages answered in this role. Answer each stage to complete this role’s route.`}</p><p><strong>Best completed route:</strong> ${resultText(saved?.best)}</p><button class="primary secondary" data-action="paired-replay-role" data-role="${role}">Replay as ${role==='garda'?'the Garda':'the member of the public'}</button></section>`;}).join('')}</div><ol class="summary-list paired-recap">${state.history.map((step,i)=>{
   const stage=e.nodes[step.nodeId];return `<li class="summary-item"><h2>${i+1}. ${esc(stage.title)}</h2><p>${esc(stage.scene)}</p><div class="recap-comparison">${roles.map(role=>{const index=step.answers[role],v=stage.views[role],c=index===null?null:v.choices[index];return `<section class="recap-role ${state.role===role?'active':''}" data-role-tone="${role}"><h3>${roleLabels[role]}${step.continuedAs===role?' · continued this stage':''}</h3>${c?`<p class="chosen">${esc(c.text)}</p><strong>${c.points} / 1 point</strong><p>${esc(c.feedback)}</p>`:'<p>You did not answer this stage in this role.</p>'}<p>${esc(v.lesson)}</p>${sourceLinks(v.refs)}</section>`;}).join('')}</div><button class="text-button" data-action="paired-revisit" data-index="${i}">Replay from this stage as ${state.role==='garda'?'the Garda':'the member of the public'}</button></li>`;
  }).join('')}</ol>${scoreExplanation}<div class="paired-stage-footer"><a class="primary secondary" href="#progress">View all progress</a></div>${storageNote()}`;
 }
 function storageNote(){return `<p class="storage-note">${store.available?'Progress is saved in this browser. Use the site-switch button to carry it to the companion site.':'Browser saving is unavailable. Your progress is kept for this visit; the site-switch button can still carry it across.'}</p>`;}
 function progress(){
  return `<div class="content-page progress-page"><p class="eyebrow">YOUR LEARNING RECORD</p><h1>Scores & progress</h1><p class="page-lead">Build progress separately as a member of the public and as a Garda. Revisit a choice to improve your understanding; the same stage can earn only one saved point per role.</p>${resumeLink()}<div class="role-results">${roles.map(role=>{const t=progressTotals(store.value,role);return `<section class="info-block" data-role-tone="${role}"><h2>${roleLabels[role]}</h2><p class="progress-number">${t.points} <span>/ ${stageCount} learning points</span></p><progress max="${stageCount}" value="${t.points}" aria-label="${roleLabels[role]} saved learning points">${t.points}/${stageCount}</progress><p>${t.answered} stages explored · ${t.completed} of ${Object.keys(encounters).length} situations completed in this role.</p><a class="primary secondary" href="#encounters/${role}">Play as ${role==='garda'?'a Garda':'a member of the public'}</a></section>`;}).join('')}</div>${scoreExplanation}<section class="info-block"><h2>How your score works</h2><p>Each stage awards 1 point for a response that supports an appropriate resolution according to its explanation and sources, or 0 for a response that needs review. More than one choice can earn a point. There are no deductions for taking time or switching roles.</p><p>The current route shows points out of the decisions you answered. A completed role score requires an answer in that role at every stage on the route. Best completed results use percentages because different routes can have different lengths.</p><p>Your saved learning points count your best result at each unique stage, so repeating a stage cannot inflate the total. Improving an answer from 0 to 1 updates your progress.</p><p>A score is not a measure of a person’s bias, a professional qualification or a prediction of a real encounter. Rights remain the same regardless of a score.</p></section><div class="progress-situations">${Object.values(encounters).map(e=>`<section class="info-block"><h2>${esc(e.title)}</h2><p class="small-note">${e.origin==='public'?'Rights & responsibilities':'Bias & decision-making'}</p>${roles.map(role=>{const r=store.value.records[e.id+'/'+role];return `<div class="progress-result" data-role-tone="${role}"><strong>${roleLabels[role]}</strong><span>Latest completed: ${resultText(r?.last)}</span><span>Best completed: ${resultText(r?.best)}</span><button class="text-button" data-action="paired-start" data-id="${e.id}" data-role="${role}" aria-label="Play this role: ${esc(e.title)} — ${roleLabels[role]}">Play this role</button></div>`;}).join('')}</section>`).join('')}</div><section class="info-block"><h2>Manage your progress</h2>${storageNote()}<p>Only fictional game choices and scores are saved locally. There is no account or upload. When you use the site-switch button, the game carries this progress in the link’s fragment and merges it with progress already saved on the other site. Copying that link can share the included learning record. Separate browsers and devices do not automatically sync.</p>${clearPending?'<p>Clear the scores and resume point saved on this site in this browser? The companion site and previously copied links may still hold their own copy.</p><button class="primary" data-action="paired-clear-confirm">Clear this site’s saved progress</button> <button class="primary secondary" data-action="paired-clear-cancel">Keep progress</button>':'<button class="text-button" data-action="paired-clear">Clear this site’s saved progress</button>'}</section></div>`;
 }
 function view(hash){
  const [route,carried,...extra]=hash.split('~');
  if(extra.length)return missing();
  if(carried){const imported=unpackProgress(carried);if(!imported)return missing('The progress in this link could not be read.');store.save(mergeProgress(store.value,imported));history.replaceState(null,'','#'+route);}
  if(route==='progress')return progress();
  if(route==='encounters'||route.startsWith('encounters/')){const role=route.split('/')[1]||siteRole;return roles.includes(role)?selection(role):missing();}
  const decoded=decodeState(route.slice('encounter/'.length));
  if(!decoded)return missing('This situation link is incomplete or from an unsupported version. Your saved scores are still available.');
  saveState(decoded);return game();
 }
 function missing(message='This page was not found.'){return `<div class="content-page"><h1>Unable to open this situation</h1><p>${esc(message)}</p><a class="primary" href="#encounters">Choose a situation</a> <a class="primary secondary" href="#progress">Saved progress</a></div>`;}
 function legacyBar(original){
  const s=legacyState(original);store.save(recordProgress(store.value,s));
  return `<section class="legacy-perspective"><div><strong>Explore this same situation from both sides.</strong><span>Keep this stage and your earlier choices.</span></div><button class="primary secondary" data-action="paired-transfer">Switch to ${siteRole==='public'?'the Garda':'the public'} perspective ⇄</button><button class="primary secondary" data-action="paired-character-transfer">Change character</button></section>${castDisplay(s)}${scoreStrip(s,true)}<p class="small-note"><a href="#progress">Scores & saved progress</a> · 1 point for an appropriate response; 0 when reasoning needs review.</p>`;
 }
 function updateSiteLink(hash){
  const anchor=document.querySelector('[data-site-switch]');if(!anchor)return;
  const targetRole=otherRole(siteRole),original=getOriginalSession();
  const route=hash.split('~')[0];let transfer=null;
  if(route.startsWith('encounter/'))transfer=decodeState(route.slice(10));
  else if(route.startsWith('scenario/')&&original)transfer=legacyState(original);
  else if(state)transfer=state;
  else if(store.value.last)transfer=decodeState(store.value.last);
  const dest=transfer?stateHash(switchRole(transfer,targetRole)):'#encounters/'+targetRole;
  anchor.href=sites[targetRole]+dest+'~'+packProgress(store.value);
  anchor.textContent=siteRole==='public'?'Switch to the Garda site ⇄':'Switch to the public rights site ⇄';
 }
 function handleClick(event){
  const button=event.target.closest('button[data-action]');if(!button||!button.dataset.action.startsWith('paired-'))return false;
  const action=button.dataset.action,role=button.dataset.role||siteRole;
  if(action==='paired-start'||action==='paired-quick-start'){characterPickerOpen=false;setupCharacterOpen=false;navigate(startEncounter(button.dataset.id,role,{characterId:characterPreferences.value[role]}));return true;}
  if(action==='paired-transfer'){characterPickerOpen=false;navigate(legacyState(getOriginalSession(),otherRole(siteRole)));return true;}
  if(action==='paired-character-transfer'){characterPickerOpen=true;navigate(legacyState(getOriginalSession()),true,false);focusCharacterPicker();return true;}
  if(action==='paired-setup-characters'){setupCharacterOpen=!setupCharacterOpen;rerender(false);if(setupCharacterOpen)focusCharacterPicker();else document.querySelector('[data-action="paired-setup-characters"]')?.focus({preventScroll:true});return true;}
  if(action==='paired-setup-done'){setupCharacterOpen=false;rerender(false);document.querySelector('[data-action="paired-setup-characters"]')?.focus({preventScroll:true});return true;}
  if(action==='paired-character-select'){characterPreferences.choose(role,button.dataset.character);rerender(false);document.querySelector('[data-character="'+characterPreferences.value[role]+'"]')?.focus({preventScroll:true});announce('Character selected.');return true;}
  if(action==='paired-clear'){clearPending=true;rerender(false);document.querySelector('[data-action="paired-clear-confirm"]')?.focus();return true;}
  if(action==='paired-clear-cancel'){clearPending=false;rerender(false);document.querySelector('[data-action="paired-clear"]')?.focus();return true;}
  if(action==='paired-clear-confirm'){store.clear();state=null;resetOriginalSession?.();clearPending=false;rerender(false);document.querySelector('[data-action="paired-clear"]')?.focus();announce('Your saved progress on this site has been cleared.');return true;}
  if(!state)return true;
  if(action==='paired-characters'){characterPickerOpen=!characterPickerOpen;rerender(false);if(characterPickerOpen)focusCharacterPicker();else document.querySelector('[data-action="paired-characters"]')?.focus({preventScroll:true});return true;}
  if(action==='paired-character-close'){characterPickerOpen=false;rerender(false);document.querySelector('[data-action="paired-characters"]')?.focus({preventScroll:true});return true;}
  if(action==='paired-character-choose'){const next=changeCharacter(state,button.dataset.character);if(next!==state){characterPreferences.choose(state.role,button.dataset.character);navigate(next,true,false);}document.querySelector('[data-character="'+state.cast[state.role]+'"]')?.focus({preventScroll:true});announce('Character changed. Your progress is unchanged.');return true;}
  if(action==='paired-switch'){characterPickerOpen=false;navigate(switchRole(state),true,false);const target=document.querySelector(state.complete?'h1':'#choice-title');target?.focus({preventScroll:true});target?.scrollIntoView({block:'nearest',behavior:'instant'});announce(state.role==='garda'?'Garda perspective':'Public perspective');}
  else if(action==='paired-answer'){
   const next=answer(state,Number(button.dataset.index));if(next===state)return true;navigate(next,true,false);
   const feedback=document.querySelector('#feedback');feedback?.focus({preventScroll:true});feedback?.scrollIntoView({block:'nearest',behavior:'instant'});
  }
  else if(action==='paired-next'){const next=continueEncounter(state);if(next!==state){characterPickerOpen=false;navigate(next);}}
  else if(action==='paired-back')navigate(revisit(state));
  else if(action==='paired-revisit')navigate(revisit(state,Number(button.dataset.index)));
  else if(action==='paired-change'){navigate(changeAnswer(state),true,false);document.querySelector('#choice-title')?.focus();}
  else if(action==='paired-replay-role'){characterPickerOpen=false;navigate(startEncounter(state.id,role,{characterId:state.cast[role]}));}
  return true;
 }
 return {handles,view,introduction,landing,legacyBar,updateSiteLink,handleClick,transferOriginal:(original,focus=true)=>navigate(legacyState(original),true,focus)};
}
