import {storyCharacter,fixedStoryCharacter,storyCastOptions} from './story-cast.mjs?v=casting-logos-20261127';
import {renderPosterLanding,renderPosterPerspectiveActions} from '../landing/poster-landing.mjs?v=casting-logos-20261127';
import {hasOwn} from '../compatibility.mjs';
import {focusControl,focusContext} from '../accessibility/focus.mjs?v=responsive-fixes-20261127';
import {
 checkEvidenceResponse, decisionComparison, discussionGuide, discussionLink, evidenceCheck,
 practiceGoal, progressSkills, recapPractice, reviewExploration, situationStory, termsInDecision
} from '../learning/play.mjs?v=casting-logos-20261127';
import {supportRecap} from '../learning/support.mjs?v=rights-topics-20261126';
import {learningIcon,scenarioIcon,routeTrail,completionMap,practiceCards,topicExplorer,situationTopics,discriminationGrounds} from './visuals.mjs?v=casting-logos-20261127';
import {encounters,roles,roleLabels,sites,references} from './catalog.mjs?v=site-repairs-20261125';
import {startEncounter,currentStage,switchRole,otherRole,answer,continueEncounter,revisit,changeAnswer,decodeState,encodeState,stateHash,fromOriginal} from './engine.mjs?v=casting-logos-20261127';
import {createProgressStore,recordProgress,runScores,progressTotals,packProgress,unpackProgress,mergeProgress,practiceState} from './progress.mjs?v=casting-logos-20261127';
import {characters,characterFor,characterArtwork,createCast,changeCharacter,createCharacterPreferences} from './characters.mjs?v=casting-logos-20261127';
import {renderScene,renderScenePreview} from './scenes.mjs?v=casting-logos-20261127';
import {situationRoleLabel} from './situation-cast.mjs?v=casting-logos-20261127';
import {characterContext,personalizeHTML} from './narrative.mjs?v=casting-logos-20261127';
import {variationFor,learningStatus,remainingDecisions,topicGroups} from './presentation.mjs?v=site-repairs-20261125';
import {playHash,playLocation,topicsForPlay,topicForSituation,availableInPractice} from './play-navigation.mjs?v=site-repairs-20261125';
import {ihrecGroundsUrl} from './discrimination.mjs?v=site-repairs-20261125';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const resultText=r=>r?`${r[0]} / ${r[1]} · ${Math.round(r[0]/r[1]*100)}%`:'No completed route yet';
const sourceLinks=ids=>`<details class="source-details"><summary>Read the sources for this decision</summary><ul lang="en-IE" data-no-translate>${ids.map(id=>{const s=references[id];return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></li>`;}).join('')}</ul></details>`;
const decisionNumber=number=>`<span class="decision-number"><span>Decision</span> ${number}</span>`;
function decisionPosition(number,{min,max}){
 const range=min===max?min:`${min}–${max}`;
 return `${decisionNumber(number)} <span>· <bdi>${range}</bdi> <span>${max===1?'decision left':'decisions left'}</span></span>`;
}
const scoreExplanation='<p class="score-explanation">1 point for a choice that supports an appropriate resolution on these facts; 0 when the reasoning needs review. This measures learning, not personal bias or responsibility for someone else’s conduct.</p>';

function perspectiveIcon(){
 const src=new URL('../assets/brand/profiles-hexagon.webp?v=all-logos-transparent-20261127',import.meta.url).href;
 return `<img class="perspective-icon" src="${src}" width="512" height="512" alt="" decoding="async">`;
}

export function createEncounterMode({siteRole,main,rerender,practiceScenarios=[],getOriginalSession,resetOriginalSession,getLanguage=()=> 'en',announce=()=>{}}){
 let browserStorage;try{browserStorage=globalThis.localStorage;}catch{}
 const store=createProgressStore(browserStorage,siteRole);
 const characterPreferences=createCharacterPreferences(browserStorage),legacyCasts=new Map();
 let state=null,clearPending=false,clearChoice=null,characterPickerTarget=null,setupCharacterOpen=false;
 let sharedReturn='',practiceReturn='',reopenedPractice=false,returnFocus=null;
 const handles=hash=>/^(encounters|encounter|practice|progress|discussion)(?:$|[~/])/.test(hash);
 const defaultList=(mode,id,role)=>playHash(mode,role,topicForSituation(id));
 function siteHref(role,hash){
  if(role===siteRole)return hash;
  const url=new URL(sites[role]);
  url.searchParams.set('lang',getLanguage());
  url.hash=hash+'~'+packProgress(store.value);
  return url.href;
 }
 function listHref(mode,role,topic='all',browse=true){
  const hash=playHash(mode,role,topic,browse);
  return mode==='practice'?siteHref(role,hash):hash;
 }
 function saveState(next,opened=false){
  state=next;
  store.save(recordProgress(store.value,state,{returnTo:sharedReturn,opened}));
 }
 function navigate(next,replace=false,focus=true){
  const hash=typeof next==='string'?next:stateHash(next);
  if(typeof next!=='string')saveState(next,Boolean(state?.complete&&next.complete));
  if(replace){history.replaceState(null,'',hash);rerender(focus);}
  else if(location.hash===hash)rerender();else location.hash=hash;
 }
 function startSituation(id,role=siteRole){
  if(!hasOwn(encounters,id)||!roles.includes(role))return false;
  const list=playLocation(location.hash,siteRole);
  sharedReturn=list?playHash(list.mode,list.role,list.topic):defaultList('shared',id,role);
  characterPickerTarget=null;setupCharacterOpen=false;
  navigate(startEncounter(id,role,{characterId:characterPreferences.value[role]}));
  return true;
 }
 function returnLink(label,mode='shared',original=getOriginalSession(),secondary=false){
  const role=mode==='shared'?state.role:siteRole;
  const id=mode==='shared'?state.id:siteRole+'-'+original.scenarioId;
  const href=(mode==='shared'?sharedReturn:practiceReturn)||defaultList(mode,id,role);
  const list=playLocation(href,role);
  const target=list?listHref(list.mode,list.role,list.topic):href;
  const cardId=list?.mode==='practice'&&encounters[id].origin===role?(encounters[id].originalId||id):id;
  return `<a class="${label?`primary${secondary?' secondary':''}`:'text-button'}" data-return-to-play="${esc(cardId)}" href="${esc(target)}">${label||`← Back to browsing situations`}</a>`;
 }
 function focusReturnedList(){
  const returned=returnFocus;
  returnFocus=null;
  if(!returned)return false;
  const action=[...(main.querySelectorAll?.('.scenario-library button[data-id]')||[])]
   .find(button=>button.dataset.id===returned);
  return action?focusContext(action,action.closest?.('.scenario')):
   focusControl(main.querySelector?.('#situations-title'));
 }
 function scoreStrip(s,compact=false){
  const scores=runScores(s);
  return `<div class="role-scores ${compact?'compact':''}" aria-label="Scores on this route">${roles.map(role=>`<div class="role-score ${s.role===role?'active':''}" data-role-tone="${role}"><span>${roleLabels[role]}</span><strong>${scores[role].points} / ${scores[role].answered} <small>points</small></strong><span>${scores[role].answered?`${scores[role].answered} decision${scores[role].answered===1?'':'s'} answered`:'No answers yet'}</span></div>`).join('')}</div>`;
 }
 function characterImage(role,id,character=characterFor(role,id)){
  const art=characterArtwork(character);
  return `<span class="character-image" aria-hidden="true"><img src="${art.src}" width="${art.width}" height="${art.height}" alt="" decoding="async" style="${art.style}"></span>`;
 }
 function castDisplay(s){
  const e=encounters[s.id],stage=s.complete?e.nodes[s.history.at(-1).nodeId]:currentStage(s);
  const cards=[s.role,otherRole(s.role)].map(role=>{
   const person=storyCharacter(s,role,stage.id);
   const context=situationRoleLabel(s.id,role)||characterContext(e,stage,role);
   const scripted=fixedStoryCharacter(s.id,role,stage.id,s.authored)||s.id==='garda-supervision'&&role==='garda';
   const label=scripted?roleLabels[role]:role===s.role?'Your character':'Other character';
   return `<div class="cast-character ${role===s.role?'is-you':''}" data-character-id="${person.id}" data-cast-role="${role}" data-role-tone="${role}">${characterImage(role,person.id,person)}<div><span class="cast-label">${label}</span><strong${person.descriptive?'':' data-no-translate'}>${esc(person.name)}</strong>${context&&context!==person.name?`<span class="scenario-person">${esc(context)}</span>`:''}</div></div>`;
  });
  return `<div class="encounter-cast" aria-label="Characters in this situation">${cards.join('')}</div>`;
 }
 function characterPicker(role,selected,inGame=false){
  const avatar=inGame&&characterPickerTarget?.avatar;
  if(avatar)selected=state.cast[role];
  const available=inGame?storyCastOptions(state?.id,role):characters[role];
 const requirement=state?.id==='garda-supervision'&&role==='garda'&&inGame?'<p class="scene-cast-requirement">Supervising sergeant</p>':available.length<characters[role].length?`<p class="scene-cast-requirement">${esc('These characters match the details of this situation.')}</p>`:'';
  return `<section class="character-picker" id="character-picker" aria-labelledby="character-picker-title" data-role-tone="${role}"><div class="character-picker-heading"><div><h2 id="character-picker-title" tabindex="-1">${avatar?'Change your avatar':inGame?'Change character':'Choose your character'}</h2><p>${inGame?'Your stage, answers and scores stay in place.':'Choose your character. Their name and picture will follow the situation.'}</p></div>${inGame?'<button class="primary secondary" data-action="paired-character-close">Done</button>':''}</div>${requirement}<div class="character-options" role="group" aria-label="Available characters">${available.map(c=>`<button class="character-option" data-action="${inGame?'paired-character-choose':'paired-character-select'}" data-role="${role}" data-character="${c.id}" aria-pressed="${selected===c.id}" aria-label="Choose character: ${c.name}">${characterImage(role,c.id)}<strong data-no-translate>${esc(c.name)}</strong><span class="character-selected">${selected===c.id?'✓ <span>Selected</span>':'<span>Choose</span>'}</span></button>`).join('')}</div>${inGame?'':'<p class="character-help">The other character is chosen at random when you start. Both characters stay with the situation until you change them.</p>'}</section>`;
 }
 function focusCharacterPicker(){focusControl(document.querySelector('#character-picker-title'));}
 function openCharacterPicker(event,avatar=false){
  const button=event.target,role=avatar?button.dataset.role:button.dataset?.sceneLabelRole,route=location.hash.slice(1);
  const original=route.startsWith('scenario/')?getOriginalSession():null;
  if(button.hasAttribute?.('data-story-fixed')||!roles.includes(role)||(!original&&(!route.startsWith('encounter/')||!state)))return;
  characterPickerTarget={role,avatar,sceneId:button.closest('.encounter-scene')?.dataset.sceneId};
  if(original){sharedReturn=practiceReturn;navigate(legacyState(original),true,false);}
  else rerender(false);
  focusCharacterPicker();
 }
 function closeCharacterPicker(){
  if(!characterPickerTarget)return;
  const {role,sceneId,avatar}=characterPickerTarget;
  characterPickerTarget=null;rerender(false);
  if(avatar){focusControl(document.querySelector('[data-action="paired-avatar-change"]'));return;}
  const captions=[...document.querySelectorAll('[data-scene-label-role="'+role+'"]')];
  const trigger=captions.find(button=>button.closest('.encounter-scene')?.dataset.sceneId===sceneId)||captions[0];
  focusControl(trigger);
 }
 main.addEventListener('scene-character-change',openCharacterPicker);
 main.addEventListener('change',checkEvidenceResponse);
 function legacyState(original,targetRole=siteRole){
  const key=siteRole+'-'+original.scenarioId;
  if(!legacyCasts.has(key)){
   const saved=store.value.saved.find(entry=>entry.mode==='practice'&&entry.id===key);
   const previous=decodeState(saved?.token||store.value.last);
   legacyCasts.set(key,previous?.id===key?previous.cast:createCast(siteRole,characterPreferences.value[siteRole]));
  }
  return {...fromOriginal(original,siteRole,targetRole,legacyCasts.get(key)),authored:true};
 }
 function turnAvatar(s){
  if(s.complete)return {credit:'',portrait:'',control:''};
  const learner=characterFor(s.role,s.cast[s.role]);
  const subject=storyCharacter(s,s.role);
  const differs=learner.id!==subject.id;
  const credit=differs?`<span id="turn-avatar-credit"><span>Your avatar</span> · <bdi data-no-translate>${esc(learner.name)}</bdi></span>`:'';
  const accessible=differs?'aria-labelledby="turn-avatar-credit"':`aria-label="${esc(learner.name)}, your current ${esc(roleLabels[s.role])} character"`;
  const portrait=`<span class="turn-avatar" role="img" ${accessible} data-role="${s.role}" data-character-id="${learner.id}">${characterImage(s.role,learner.id,learner)}</span>`;
  const control=fixedStoryCharacter(s.id,s.role,s.nodeId,s.authored)?`<button class="text-button learner-avatar-change" type="button" data-action="paired-avatar-change" data-role="${s.role}" aria-expanded="${!!characterPickerTarget?.avatar}">Change your avatar</button>`:'';
  return {credit,portrait,control};
 }
 function roleBar(s){
  const targetRole=otherRole(s.role);
  const playing=s.role==='garda'?'Exploring the Garda perspective':'Exploring the public perspective';
  const switchLabel=targetRole==='garda'?'Switch to the Garda perspective':'Switch to the public perspective';
  const {credit,portrait,control}=turnAvatar(s);
  return `<div class="flow-role-controls"><div class="flow-role-bar">
   <div class="perspective-status">
    ${perspectiveIcon(s.role)}
    <div><strong>${playing}</strong><span>${s.complete?'Learning recap':decisionPosition(s.history.length+1,remainingDecisions(s))}</span>${credit}${control}</div>
    ${portrait}
   </div>
  </div>
   <button class="text-button perspective-toggle role-switch-button" data-action="paired-switch">${perspectiveIcon(targetRole)}<span>${switchLabel}</span></button>
  </div>`;
 }
 function scenePanel(s,legacy=false){
  const open=main.querySelector?.('details.scene-explorer')?.open??true;
  return `<details class="scene-explorer" ${open||characterPickerTarget?'open':''}>
   <summary>Scene and characters</summary>
   ${characterPickerTarget?characterPicker(characterPickerTarget.role,storyCharacter(s,characterPickerTarget.role).id,true):''}
   ${castDisplay(s)}
   <div class="${legacy?'legacy-illustration':'paired-scene-lead'}">${renderScene(s,{compact:legacy})}</div>
  </details>`;
 }
 function modeOptions(mode,role,topic){
  const modes=[
   ['shared','Explore both perspectives','Switch roles to explore the same moment from both sides.'],
   ['practice','Practise one role at a time','Make choices in one role and review what you learned.']
  ];
  return `<nav class="play-modes" aria-label="Ways to explore">${modes.map(([id,title,description])=>
   `<a href="${esc(listHref(id,role,topic))}" ${mode===id?'aria-current="page"':''}><strong>${title}</strong><span>${description}</span></a>`
  ).join('')}</nav>`;
 }
 function situationCards(list,role,heading='h2'){
  return `<div class="paired-catalog">${list.map(e=>`<article class="scenario encounter-card">
       <div class="catalogue-visual" aria-hidden="true">${scenarioIcon(e.id)}</div>
       ${e.kind==='colleague-witness'?'<p class="eyebrow situation-kind">Witnessing a colleague</p>':''}
       <${heading}>${esc(e.title)}</${heading}>
       ${renderScenePreview(e.id,{cast:characterPreferences.value})}
       <p>${esc(e.description)}</p>
       <p class="scenario-goal">${practiceGoal(e.id)}</p>
       
       <p class="catalogue-status">${roles.map(r=>`<span><span>${r==='public'?'Public':'Garda'}</span>: <span>${learningStatus(store.value,e.id,r)}</span></span>`).join('')}</p>
       <button class="primary secondary" data-action="paired-start" data-id="${e.id}" data-role="${role}" aria-label="Explore this situation: ${esc(e.title)} — ${roleLabels[role]}">Explore this situation</button>
      </article>`).join('')}</div>`;
 }
 function topicCards(topic,role,heading='h2'){
  const cards=group=>situationCards(group.encounters.map(id=>encounters[id]),role,heading);
  return topic.id==='discrimination'
   ?discriminationGrounds(topic,cards,{openGround:encounters[returnFocus]?.ground})
   :cards(topic);
 }
 function selection({mode,role,topic,browse}){
  const first=encounters[role+'-street'],selected=characterPreferences.value[role];
  const saved=store.value.saved.filter(entry=>{
   const startingRole=playLocation(entry.returnTo,entry.role)?.role||entry.role;
   return entry.mode===mode&&startingRole===role&&(topic==='all'||topicForSituation(entry.id)===topic);
  });
  const returning=saved.some(entry=>!entry.complete);
  const goal=role==='public'?'Practise asking why you have been stopped and whether you are free to leave.':'Practise separating what you observed from what you assumed.';
  const selectedTopic=topicGroups.find(group=>group.id===topic);
  const practice=mode==='practice';
  const localPractice=practice&&role===siteRole;
  const groups=topicGroups.filter(group=>(!selectedTopic||group.id===topic)&&(!practice||group.encounters.some(id=>availableInPractice(encounters[id],role))))
   .map(group=>practice?{...group,encounters:group.encounters.filter(id=>availableInPractice(encounters[id],role))}:group);
  const openTopic=selectedTopic?.id||topicForSituation(practice&&returnFocus&&!encounters[returnFocus]?role+'-'+returnFocus:returnFocus)||'';
  const heading=selectedTopic?.title||(practice?'Practise one role at a time':returning?'Choose your next situation.':'Try your first situation.');
  return `<section class="paired-picker simple-setup ${selectedTopic?'topic-selected':''}">
   <h1>${heading}</h1>
   <div class="setup-role"><strong>${perspectiveIcon(role)}<span>${role==='public'?'Public perspective':'Garda perspective'}</span></strong>
    <details><summary>Change starting role</summary><div class="role-picker" role="group" aria-label="Starting role">
     ${roles.map(r=>`<a class="primary ${role===r?'':'secondary'}" href="${esc(listHref(mode,r,topic,browse))}" data-role-tone="${r}" ${role===r?'aria-current="true"':''}>${perspectiveIcon(r)}<span>${r==='public'?'Member of the public':'Member of An Garda Síochána'}</span><span class="role-status">${role===r?'Selected':'Choose'}</span></a>`).join('')}
    </div></details>
   </div>
   ${topic==='discrimination'?`<div class="info-block discrimination-intro"><p>Housing assistance applies to accommodation. The rules for other grounds depend on the setting.</p><a class="text-button" href="${ihrecGroundsUrl}" target="_blank" rel="noopener noreferrer"><span>Read IHREC’s protected grounds</span> ↗</a></div>`:''}
   ${modeOptions(mode,role,topic)}
   ${resumeLink(saved)}
   ${!practice&&!browse?`<div class="start-panel">
    <section class="recommended-situation" aria-labelledby="first-situation-title"><h2 id="first-situation-title">${esc(first.title)}</h2><p>${goal}</p>
     <button class="primary" data-action="paired-quick-start" data-id="${first.id}" data-role="${role}">Start this situation</button>
     
    </section>
    <div class="setup-character" data-role-tone="${role}">${characterImage(role,selected)}<div><span class="cast-label">Your character</span><strong data-no-translate>${esc(characterFor(role,selected).name)}</strong><button class="text-button" data-action="paired-setup-characters" aria-expanded="${setupCharacterOpen}" aria-controls="setup-characters">Choose a different character</button></div></div>
    ${setupCharacterOpen?`<div id="setup-characters"><div class="picker-done"><button class="primary secondary" data-action="paired-setup-done">Done</button></div>${characterPicker(role,selected)}</div>`:'<div id="setup-characters" hidden></div>'}
   </div>`:''}
   ${practice&&!localPractice?`<a class="primary" href="${esc(listHref(mode,role,topic))}">Browse situations</a>`:`
    <details class="scenario-library" ${practice||browse?'open':''}>
     <summary id="situations-title">Browse all situations</summary>
     <div class="topic-filters" role="group" aria-label="Situation topics">${topicsForPlay(mode,role).map(t=>`<button class="topic-filter" data-action="paired-topic" data-topic="${t.id}" aria-pressed="${topic===t.id}">${t.title}</button>`).join('')}</div>
     <div class="situation-topics">${practice?situationTopics(groups,group=>{
       if(group.id==='discrimination')return topicCards(group,role);
       const originals=practiceCards(practiceScenarios.filter(s=>group.encounters.includes(role+'-'+s.id)),role);
       const counterparts=group.encounters.filter(id=>encounters[id].origin!==role&&encounters[id].origin!=='shared');
       return originals+(counterparts.length?situationCards(counterparts.map(id=>encounters[id]),role):'');
      },{openTopic}):`
      ${situationTopics(groups,group=>topicCards(group,role),{openTopic})}`}</div>
    </details>`}
  </section>`;
 }
 function savedCard(entry,primary=true){
  const game=decodeState(entry.token),encounter=encounters[entry.id];
  const description=entry.id==='public-young-person'&&entry.role==='public'
   ?'You are a member of the public, age 16':encounter.title;
  const href=entry.mode==='practice'
   ?siteHref(entry.role,`#scenario/${encounter.originalId}/${entry.token}`)
   :`#encounter/${entry.token}`;
  return `<div class="info-block ${primary?'session-return':'saved-recap'} flow-save" data-save-mode="${entry.mode}">
   <div class="flow-save-copy">
    <strong>${encounter.kind==='colleague-witness'?esc(encounter.title):esc(description)}</strong>
    <span><span>${roleLabels[entry.role]}</span> · <span>${entry.mode==='practice'?'Practise one role at a time':'Explore both perspectives'}</span>${entry.complete?'':` · ${decisionNumber(game.history.length+1)}`}</span>
   </div>
   <a class="${primary?'text-button':'primary secondary'} saved-session-link" href="${esc(href)}">${entry.complete?'Open recap':'Resume your situation'}</a>
  </div>`;
 }
 function resumeLink(entries=store.value.saved){
  const unfinished=entries.find(entry=>!entry.complete);
  const completed=entries.find(entry=>entry.complete);
  return (unfinished?savedCard(unfinished):'')+(completed?savedCard(completed,!unfinished):'');
 }
 function homeActions(){
  const first=encounters[siteRole+'-street'];
  const unfinished=store.value.saved.find(entry=>!entry.complete);
  return `<div class="home-play">
   ${unfinished?savedCard(unfinished):`<div class="home-start">
    <button class="primary" data-action="paired-quick-start" data-id="${first.id}" data-role="${siteRole}" aria-describedby="home-start-role"><span>Start:</span><span>${esc(first.title)}</span></button>
    <span class="home-start-role" id="home-start-role"><span>${siteRole==='garda'?'Garda perspective':'Public perspective'}</span> · <span>${esc(first.minutes)}</span></span>
   </div>`}
  </div>`;
 }
 function introduction({secondary=false}={}){
  const logo=new URL('../assets/brand/profiles-hexagon.webp?v=all-logos-transparent-20261127',import.meta.url).href;
  const title=secondary?'<h2 id="game-title" lang="en-IE" data-no-translate>Stopped: Both Sides</h2>':'<h1 id="game-title" lang="en-IE" data-no-translate>Stopped: Both Sides</h1>';
  return `<section class="home-intro clear-intro brand-intro" aria-labelledby="game-title"><img class="brand-profiles" src="${logo}" width="512" height="512" alt=""><div>${title}<p>An interactive learning resource for the public and Gardaí.</p></div></section>`;
 }
 function aboutIntroduction({eyebrow='',taglineLines=[]}={}){
  const heading=eyebrow&&taglineLines.length
   ?'<div class="about-heading-block"><p class="eyebrow">'+esc(eyebrow)+'</p><h2 class="about-tagline">'+taglineLines.map(esc).join('<br>')+'</h2></div>'
   :'';
  return `<section class="about-opening" aria-label="About Stopped: Both Sides">${introduction()}${heading}<div class="info-block landing-overview about-overview"><p>Stopped: Both Sides explores human and civil rights and police powers through everyday encounters involving questioning, searches, arrest, young people and racism.</p><p>It helps the public understand their human and civil rights and access support, while encouraging Gardaí to reflect on evidence, bias and respectful communication.</p><p>Exploring both perspectives invites learners to question assumptions, while recognising Gardaí’s particular responsibility to exercise their powers fairly.</p></div></section>`;
 }
 function perspectiveChoice(){
  return renderPosterLanding({siteRole,perspectiveIcon});
 }
 function landing(){
  const completed=store.value.saved.find(entry=>entry.complete);
  return `${perspectiveChoice()}
   <section class="home-progress" aria-labelledby="home-progress-title">
    <details class="home-progress-disclosure">
     <summary class="landing-disclosure-trigger"><h2 id="home-progress-title">My progress<span class="landing-disclosure-caret" aria-hidden="true"></span></h2></summary>
     <div class="home-progress-content">
      ${homeActions()}
      ${completed?savedCard(completed,false):''}
     </div>
    </details>
   </section>
   ${topicExplorer(topicGroups,siteRole,group=>topicCards(group,siteRole,'h3'))}
   <div class="practice-panel">
   <details class="single-mode practice-shortcut">
    <summary class="landing-disclosure-trigger"><h2>Practise one role at a time<span class="landing-disclosure-caret" aria-hidden="true"></span></h2></summary>
    <div class="practice-content"><p>Make choices in one role and review what you learned.</p>${renderPosterPerspectiveActions({perspectiveIcon})}<a class="primary secondary" href="${listHref('practice',siteRole)}">Browse situations</a></div>
   </details>
   </div>`;
 }
 function playHelp(){
  return `<details class="play-help"><summary>Scores, sources and help</summary>${scoreStrip(state,true)}<p>One point means the response supports an appropriate resolution. Your human and civil rights never depend on your score.</p><p>${fixedStoryCharacter(state.id,'public',state.nodeId,state.authored)||state.id==='garda-supervision'?'Your avatar represents your role. The scene keeps its own names and facts.':'Your chosen characters stay with the situation. Changing a character updates their name and picture throughout the story.'}</p><p>Switch sides to compare the same moment. Your active answer decides what happens at the next step.</p><p>Read the explanation after each choice. Its source links show where the information comes from.</p>${storageNote()}<a class="text-button" href="#progress">My scores & progress</a></details>`;
 }
 function game(){
  if(state.complete)return recap();
  const encounter=encounters[state.id],stage=currentStage(state),view=stage.views[state.role];
  const selected=state.answers[state.role],choice=selected===null?null:view.choices[selected];
  const variation=variationFor(encounter.id,stage.id);
  const previousComparison=main.querySelector?.('.decision-comparison');
  const comparisonOpen=previousComparison?.dataset.decision===encounter.id+'/'+stage.id&&previousComparison.open;
  return `<div class="topline flow-topline">${returnLink()}<a href="#progress" class="text-button">My progress</a></div>
   <div class="game-grid paired-game flow-game">
    <section class="decision-context" aria-labelledby="scene-title">
     <p class="eyebrow">${esc(encounter.title)} · SHARED SCENE</p>
     ${variation?`<div class="variation-notice"><strong>${variation.label}</strong><p>${variation.detail}</p></div>`:''}
     <h1 id="scene-title">${esc(stage.title)}</h1>
     ${situationStory(encounter.id,stage.id,stage.scene)}
    </section>
    <section class="decision-choices" aria-labelledby="choice-title">
     ${roleBar(state)}
     ${encounter.kind==='colleague-witness'?`<p class="witness-role-context">${esc(view.context)}</p>`:''}
     <div class="prompt">
      <h2 id="choice-title" tabindex="-1">${esc(view.prompt)}</h2>
      ${choice?'<p>Your answer is recorded for this role.</p>':''}
     </div>
     ${evidenceCheck(encounter.id,stage.id)}
     <div class="choices">${view.choices.map((option,i)=>`<button class="choice ${selected===i?'selected':''}" data-action="paired-answer" data-index="${i}" aria-pressed="${selected===i}" ${choice?'disabled':''}><span class="choice-letter" aria-hidden="true">${String.fromCharCode(65+i)}</span><span>${esc(option.text)}${selected===i?'<span class="choice-selected">Selected</span>':''}</span></button>`).join('')}</div>
     ${choice?`<section class="feedback ${choice.review?'revisit':''}" id="feedback" tabindex="-1" aria-labelledby="feedback-title">
      <p class="eyebrow">YOUR LEARNING POINT</p>
      <h2 id="feedback-title" class="feedback-takeaway">${esc(choice.feedback)}</h2>
      <div class="flow-feedback-actions">
       <button class="primary" data-action="paired-next">${choice.next==='end'?'View recap':'Next decision'}</button>
       <div class="flow-secondary-actions"><button class="text-button" data-action="paired-compare">Compare the other side</button><button class="text-button" data-action="paired-change">Try another answer</button></div>
       
      </div>
      ${view.phrase?`<div class="phrase"><span>${state.role==='garda'?'A QUESTION TO CARRY FORWARD':encounter.originalId==='fair-treatment'?'SOMETHING TO REMEMBER':'WORDS YOU COULD USE'}</span>${esc(view.phrase)}</div>`:''}
      <details class="lesson"><summary>Why this matters</summary><p>${esc(view.lesson)}</p></details>
      ${sourceLinks(view.refs)}
     </section>`:''}
     ${choice?reviewExploration(encounter.id,stage.id):''}
     ${termsInDecision(encounter.id)}
    </section>
   </div>
   ${decisionComparison(state,stage,comparisonOpen)}
   ${state.history.length?`<div class="paired-stage-footer">${routeTrail(state)}<button class="text-button" data-action="paired-back">← Revisit the previous stage</button></div>`:''}
   ${scenePanel(state)}
   ${playHelp()}`;
 }
 function recap(){
  const e=encounters[state.id],scores=runScores(state),other=otherRole(state.role);
  const last=state.history.at(-1);
  const lastAnswer=e.nodes[last.nodeId].views[last.continuedAs].choices[last.answers[last.continuedAs]].text;
  const highlights=[...new Set([0,Math.floor((state.history.length-1)/2),state.history.length-1])].map(i=>e.nodes[state.history[i].nodeId].views[state.role].lesson);
  return `<div class="topline flow-topline">${returnLink()}<a href="#progress" class="text-button">Saved progress</a></div>${roleBar(state)}${characterPickerTarget?characterPicker(characterPickerTarget.role,storyCharacter(state,characterPickerTarget.role).id,true):''}<div class="summary-heading"><p class="eyebrow">YOUR LEARNING RECAP</p><h1>One situation.<br>What did each side reveal?</h1><p>${esc(e.title)} · ${state.history.length} stages on this route.</p><div class="flow-recap-actions">${returnLink('Choose another situation')}</div></div><details class="scene-explorer recap-characters"><summary>Characters in this situation</summary>${castDisplay(state)}</details><section class="recap-takeaways info-block"><h2>What to take with you</h2><ul>${highlights.map(lesson=>`<li>${esc(lesson)}</li>`).join('')}</ul><div class="recap-next"><button class="primary" data-action="paired-replay-role" data-role="${other}">${other==='garda'?'Try the Garda perspective':'Try the public perspective'}</button>${returnLink('Choose another situation','shared',null,true)}</div></section>${recapPractice(e.id,state.role,lastAnswer)}${supportRecap(siteRole)}<details class="recap-scores"><summary>Scores and role completion</summary>${scoreStrip(state)}<div class="role-results">${roles.map(role=>{const saved=store.value.records[state.id+'/'+role];return `<section class="info-block" data-role-tone="${role}"><h2>${roleLabels[role]}</h2><p>${scores[role].complete?'Route completed in this role.':`${scores[role].answered} of ${state.history.length} stages answered in this role. Answer each stage to complete this role’s route.`}</p><p><strong>Best completed route:</strong> ${resultText(saved?.best)}</p><button class="text-button" data-action="paired-replay-role" data-role="${role}">Explore the ${role==='garda'?'Garda':'public'} perspective</button></section>`;}).join('')}</div>${scoreExplanation}</details><h2 class="recap-review-title">Review each decision</h2><ol class="summary-list paired-recap">${state.history.map((step,i)=>{
   const stage=e.nodes[step.nodeId],variation=variationFor(e.id,stage.id);return `<li class="summary-item" data-narrative-node="${step.nodeId}"><div class="recap-overview">${renderScene(state,{step,compact:true})}<div>${variation?`<p class="eyebrow">${variation.label}</p>`:''}<h2>${i+1}. ${esc(stage.title)}</h2><p>${esc(stage.views[state.role].lesson)}</p></div></div><details class="recap-detail"><summary>Compare answers and sources</summary><p>${esc(stage.scene)}</p><div class="recap-comparison">${roles.map(role=>{const index=step.answers[role],v=stage.views[role],c=index===null?null:v.choices[index];return `<section class="recap-role ${state.role===role?'active':''}" data-role-tone="${role}"><h3>${roleLabels[role]}${step.continuedAs===role?' · continued this stage':''}</h3>${c?`<p class="chosen">${esc(c.text)}</p><p>${esc(c.feedback)}</p>`:'<p>You did not answer this stage in this role.</p>'}<p>${esc(v.lesson)}</p>${sourceLinks(v.refs)}</section>`;}).join('')}</div></details><button class="text-button" data-action="paired-revisit" data-index="${i}">Revisit this decision from the ${state.role==='garda'?'Garda':'public'} perspective</button></li>`;
  }).join('')}</ol><details class="facilitator-note"><summary>Discuss this situation together</summary>${discussionLink(e.id,state.role)}</details><div class="paired-stage-footer"><a class="primary secondary" href="#progress">View all progress</a></div>${storageNote()}`;
 }
 function storageNote(){return store.available?'':'<p class="storage-note">Browser saving is unavailable. Your progress is kept for this visit.</p>';}
 function savedList(complete){
  const entries=store.value.saved.filter(entry=>entry.complete===complete);
  if(!entries.length)return '';
  return `<section class="saved-situations"><details class="progress-disclosure"><summary><h2>${complete?'Completed recaps':'Unfinished situations'}</h2></summary><div class="progress-disclosure-body">${entries.map(entry=>savedCard(entry,!complete)).join('')}</div></details></section>`;
 }
 function clearProgressActions(){
  if(clearChoice)return `<div role="group" aria-labelledby="progress-confirm-question">
   <h3 id="progress-confirm-question" tabindex="-1">${clearChoice==='clear'?'Are you sure you want to clear this site’s saved progress?':'Are you sure you want to keep your saved progress?'}</h3>
   ${clearChoice==='clear'?'<p>This will remove the scores and resume point saved on this site in this browser.</p>':''}
   <div class="action-group"><button class="primary" data-action="paired-clear-yes">Yes</button><button class="primary secondary" data-action="paired-clear-no">No</button></div>
  </div>`;
  return '<p>Clear the scores and resume point saved on this site in this browser? The companion site and previously copied links may still hold their own copy.</p><div class="action-group"><button class="primary" data-action="paired-clear-confirm">Clear this site’s saved progress</button><button class="primary secondary" data-action="paired-clear-cancel">Keep progress</button></div>';
 }
 function progress(){
  const list=Object.values(encounters),groups=['In progress','Completed','Not started'];
  const status=e=>roles.every(r=>learningStatus(store.value,e.id,r)==='Completed')?'Completed':roles.some(r=>learningStatus(store.value,e.id,r)!=='Not started')?'In progress':'Not started';
  return `<div class="content-page progress-page"><p class="eyebrow">YOUR LEARNING RECORD</p><h1>Scores & progress</h1><div class="progress-score-help"><details class="score-mechanics"><summary>How your score works</summary><p>Each stage awards 1 point for a response that supports an appropriate resolution according to its explanation and sources, or 0 for a response that needs review. More than one choice can earn a point. There are no deductions for taking time or switching roles.</p><p>The current route shows points out of the decisions you answered. A completed role score requires an answer in that role at every stage on the route. Best completed results use percentages because different routes can have different lengths.</p><p>Your saved learning points count your best result at each unique stage, so repeating a stage cannot inflate the total. Improving an answer from 0 to 1 updates your progress.</p><p>A score is not a measure of a person’s bias, a professional qualification or a prediction of a real encounter. Human and civil rights remain the same regardless of a score.</p></details></div>${storageNote()}${savedList(false)}${savedList(true)}${progressSkills(store.value)}<div class="role-results">${roles.map(role=>{const t=progressTotals(store.value,role);return `<section class="info-block" data-role-tone="${role}"><details class="progress-disclosure"><summary><h2>${roleLabels[role]}</h2></summary><div class="progress-disclosure-body">${completionMap(t.completed,list.length)}<p class="progress-number">${t.completed} <span>/ ${list.length} situations completed</span></p><progress max="${list.length}" value="${t.completed}" aria-label="${roleLabels[role]} situations completed">${t.completed}/${list.length}</progress><details class="points-detail"><summary>View scores</summary><p>${t.answered} stages explored · ${t.points} learning points</p></details><a class="primary secondary" href="#encounters/${role}">Explore the ${role==='garda'?'Garda':'public'} perspective</a></div></details></section>`;}).join('')}</div>${groups.map(group=>{const items=list.filter(e=>status(e)===group);return items.length?`<section class="progress-group"><details class="progress-disclosure"><summary><h2>${group}</h2></summary><div class="progress-disclosure-body">${group==='Completed'?'<p>Both perspectives completed.</p>':''}<div class="progress-situations">${items.map(e=>`<section class="info-block"><h3>${esc(e.title)}</h3>${roles.map(role=>{const r=store.value.records[e.id+'/'+role];return `<div class="progress-result" data-role-tone="${role}"><strong>${roleLabels[role]}</strong><span>${learningStatus(store.value,e.id,role)}</span>${r?.best?`<details><summary>View scores</summary><p>Latest completed: ${resultText(r.last)}</p><p>Best completed: ${resultText(r.best)}</p></details>`:''}<button class="text-button" data-action="paired-start" data-id="${e.id}" data-role="${role}" aria-label="Explore this perspective: ${esc(e.title)} — ${roleLabels[role]}">Explore this perspective</button></div>`;}).join('')}</section>`).join('')}</div></div></details></section>`:'';}).join('')}<section class="info-block"><details class="progress-disclosure"${clearPending?' open':''}><summary><h2>Manage your progress</h2></summary><div class="progress-disclosure-body">${storageNote()}<p>Only fictional learning choices and scores are saved locally. There is no account or upload. When you use the resource-site link, the resource carries this progress in the link’s fragment and merges it with progress already saved on the other site. Copying that link can share the included learning record. Separate browsers and devices do not automatically sync.</p>${clearPending?clearProgressActions():'<button class="text-button" data-action="paired-clear">Clear this site’s saved progress</button>'}</div></details></section></div>`;
 }
 function view(hash){
  const [route,carried,...extra]=hash.split('~');
  if(extra.length)return missing();
  if(carried){const imported=unpackProgress(carried);if(!imported)return missing('The progress in this link could not be read.');store.save(mergeProgress(store.value,imported));history.replaceState(null,'','#'+route);}
  if(route==='progress')return progress();
  if(route.startsWith('discussion/')){
   const [,role,id,...extraParts]=route.split('/');
   return !extraParts.length&&roles.includes(role)&&hasOwn(encounters,id)
    ?discussionGuide(encounters[id],role):missing();
  }
  const list=playLocation(route,siteRole);
  if(list)return selection(list);
  if(!route.startsWith('encounter/'))return missing();
  const decoded=decodeState(route.slice('encounter/'.length));
  if(!decoded)return missing('This situation link is incomplete or from an unsupported version. Your saved scores are still available.');
  const saved=store.value.saved.find(entry=>entry.mode==='shared'&&entry.token===route.slice('encounter/'.length));
  sharedReturn=saved?.returnTo||defaultList('shared',decoded.id,decoded.role);
  saveState(decoded,true);return game();
 }
 function missing(message='This page was not found.'){return `<div class="content-page"><h1>Unable to open this situation</h1><p>${esc(message)}</p><div class="action-group"><a class="primary" href="#encounters">Choose a situation</a><a class="primary secondary" href="#progress">Saved progress</a></div></div>`;}
 function legacyBar(original,remaining){
  const s=legacyState(original),{credit,portrait,control}=turnAvatar(s);
  if(!original.complete)reopenedPractice=false;
  store.save(recordProgress(store.value,s,{mode:'practice',returnTo:practiceReturn,opened:reopenedPractice}));
  return `<div class="flow-role-bar legacy-perspective">
   <div class="perspective-status">${perspectiveIcon(siteRole)}<div><strong>${siteRole==='garda'?'Exploring the Garda perspective':'Exploring the public perspective'}</strong><span>${original.complete?'Learning recap':decisionPosition(original.history.length+1,remaining)}</span>${credit}${control}</div>${credit||control?portrait:''}</div>
   <button class="text-button perspective-toggle" data-action="paired-transfer">Open the two-role version</button>
  </div>`;
 }
 function beginPractice(id){
  const list=playLocation(location.hash,siteRole);
  practiceReturn=list?.mode==='practice'&&list.role===siteRole
   ?playHash(list.mode,list.role,list.topic):defaultList('practice',siteRole+'-'+id,siteRole);
  reopenedPractice=false;
 }
 function restorePractice(id,token){
  const key=siteRole+'-'+id;
  const entries=store.value.saved.filter(entry=>entry.mode==='practice'&&entry.id===key);
  const entry=token?entries.find(item=>item.token===token):entries.find(item=>!item.complete)||entries[0];
  const saved=practiceState(token||entry?.token);
  if(!saved||saved.id!==key)return null;
  practiceReturn=entry?.returnTo||defaultList('practice',key,siteRole);
  legacyCasts.set(key,saved.cast);
  reopenedPractice=saved.complete;
  if(token&&!saved.complete)history.replaceState(null,'','#scenario/'+id);
  return {
   scenarioId:id,nodeId:saved.nodeId,selected:saved.answers[siteRole],complete:saved.complete,
   history:saved.history.map(step=>({nodeId:step.nodeId,choiceIndex:step.answers[siteRole]}))
  };
 }
 function practiceSession(hash,current,start){
  const [id,token,...extra]=hash.slice(9).split('/');
  if(!hasOwn(encounters,siteRole+'-'+id)||extra.length)return null;
  if(token)return restorePractice(id,token);
  if(current?.scenarioId===id)return current;
  const saved=restorePractice(id);
  if(saved)return saved;
  beginPractice(id);
  return start(id);
 }
 function transferOriginal(original,focus=true,role=siteRole,replace=true){
  sharedReturn=practiceReturn||defaultList('practice',siteRole+'-'+original.scenarioId,siteRole);
  navigate(legacyState(original,role),replace,focus);
 }
 function personalize(html,hash){
  const route=hash.split('~')[0];
  const s=route.startsWith('encounter/')?decodeState(route.slice(10)):route.startsWith('scenario/')&&getOriginalSession()?.scenarioId===route.slice(9)?legacyState(getOriginalSession()):null;
  return s&&!s.authored?personalizeHTML(html,encounters[s.id],s.cast,s.complete?s.history.at(-1)?.nodeId:s.nodeId):html;
 }
 function updateSiteLink(){
  const anchor=document.querySelector('[data-site-switch]');if(!anchor)return;
  const targetRole=otherRole(siteRole);
  anchor.href=sites[targetRole]+(targetRole==='garda'?'#evidence':'#rights')+'~'+packProgress(store.value);
 }
 function referenceRoute(hash){
  const [route,carried,...extra]=hash.split('~');
  if(!(['rights','evidence'].includes(route)||route.startsWith('scenario/'))||!carried||extra.length)return hash;
  const imported=unpackProgress(carried);
  if(!imported)return 'encounter/invalid';
  store.save(mergeProgress(store.value,imported));history.replaceState(null,'','#'+route);
  return route;
 }
 function handleClick(event){
  const back=event.target.closest('a[data-return-to-play]');
  if(back&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey)returnFocus=back.dataset.returnToPlay;
  const button=event.target.closest('button[data-action]');if(!button||!button.dataset.action.startsWith('paired-'))return false;
  const action=button.dataset.action,role=button.dataset.role||siteRole;
  if(action==='paired-topic'){
   const list=playLocation(location.hash,siteRole)||{mode:'shared',role};
   const topic=list&&topicsForPlay(list.mode,list.role).find(item=>item.id===button.dataset.topic);
   if(topic){
    if(topic.id==='all')returnFocus=null;
    history.replaceState(null,'',playHash(list.mode,list.role,topic.id));
    rerender(false);
    document.querySelector('[data-topic="'+topic.id+'"]')?.focus({preventScroll:true});
   }
   return true;
  }
  if(action==='paired-landing-character'){characterPreferences.choose(role,button.dataset.character);setupCharacterOpen=false;navigate('encounters/'+role);return true;}
  if(action==='paired-start'||action==='paired-quick-start'){
   return startSituation(button.dataset.id,role);
  }
  if(action==='paired-avatar-change'){openCharacterPicker({target:button},true);return true;}
  if(action==='paired-transfer'){characterPickerTarget=null;transferOriginal(getOriginalSession(),true,otherRole(siteRole),false);return true;}
  if(action==='paired-setup-characters'){setupCharacterOpen=!setupCharacterOpen;rerender(false);if(setupCharacterOpen)focusCharacterPicker();else document.querySelector('[data-action="paired-setup-characters"]')?.focus({preventScroll:true});return true;}
  if(action==='paired-setup-done'){setupCharacterOpen=false;rerender(false);document.querySelector('[data-action="paired-setup-characters"]')?.focus({preventScroll:true});return true;}
  if(action==='paired-character-select'){characterPreferences.choose(role,button.dataset.character);rerender(false);document.querySelector('[data-character="'+characterPreferences.value[role]+'"]')?.focus({preventScroll:true});announce('Character selected.');return true;}
  if(action==='paired-clear'){clearPending=true;clearChoice=null;rerender(false);document.querySelector('[data-action="paired-clear-confirm"]')?.focus();return true;}
  if(action==='paired-clear-confirm'||action==='paired-clear-cancel'){
   clearChoice=action==='paired-clear-confirm'?'clear':'keep';rerender(false);
   document.querySelector('#progress-confirm-question')?.focus();return true;
  }
  if(action==='paired-clear-no'){
   const target=clearChoice==='clear'?'paired-clear-confirm':'paired-clear-cancel';
   clearChoice=null;rerender(false);document.querySelector('[data-action="'+target+'"]')?.focus();return true;
  }
  if(action==='paired-clear-yes'){
   if(!clearChoice)return true;
   const clearing=clearChoice==='clear';
   if(clearing){store.clear();state=null;legacyCasts.clear();resetOriginalSession?.();}
   clearPending=false;clearChoice=null;rerender(false);document.querySelector('[data-action="paired-clear"]')?.focus();
   announce(clearing?'Your saved progress on this site has been cleared.':'Your saved progress has been kept.');return true;
  }
  if(!state)return true;
  if(action==='paired-character-close'){closeCharacterPicker();return true;}
  if(action==='paired-character-choose'){
   const target=characterPickerTarget?.role;
   if(!target||(!characterPickerTarget.avatar&&fixedStoryCharacter(state.id,target,state.nodeId,state.authored))||!storyCastOptions(state.id,target).some(person=>person.id===button.dataset.character))return true;
   const next=changeCharacter(state,button.dataset.character,target);
   if(next!==state){
    characterPreferences.choose(target,button.dataset.character);
    if(next.authored){
     legacyCasts.set(next.id,next.cast);
     const saved=store.value.saved.map(entry=>{
      if(entry.mode!=='practice'||entry.id!==next.id||entry.complete)return entry;
      const practice=practiceState(entry.token);
      return practice?{...entry,token:encodeState({...practice,cast:{...practice.cast,[target]:next.cast[target]}})}:entry;
     });
     store.save({...store.value,saved});
    }
    navigate(next,true,false);
   }
   document.querySelector('[data-character="'+state.cast[target]+'"]')?.focus({preventScroll:true});
   announce('Character changed. Your progress is unchanged.');return true;
  }
  if(action==='paired-switch'||action==='paired-compare'){
   characterPickerTarget=null;navigate(switchRole(state),true,false);
   focusControl(document.querySelector(state.complete?'main h1':'#choice-title'));
   announce(state.role==='garda'?'Garda perspective':'Public perspective');
  }
  else if(action==='paired-answer'){
   const next=answer(state,Number(button.dataset.index));if(next===state)return true;navigate(next,true,false);
   focusControl(document.querySelector('#feedback'));
  }
  else if(action==='paired-next'){const next=continueEncounter(state);if(next!==state){characterPickerTarget=null;navigate(next);}}
  else if(action==='paired-back')navigate(revisit(state));
  else if(action==='paired-revisit')navigate(revisit(state,Number(button.dataset.index)));
  else if(action==='paired-change'){navigate(changeAnswer(state),true,false);focusControl(document.querySelector('#choice-title'));}
  else if(action==='paired-replay-role'){characterPickerTarget=null;navigate(startEncounter(state.id,role,{cast:state.cast,authored:state.authored}));}
  return true;
 }
 return {handles,view,startSituation,personalize,introduction,aboutIntroduction,perspectiveChoice,landing,resumeLink,referenceRoute,legacyBar,beginPractice,practiceSession,returnLink,focusReturnedList,legacyPanel:original=>scenePanel(legacyState(original),true),legacyScene:(original,index)=>{const s=legacyState(original);return renderScene(s,{step:s.history[index],compact:true});},updateSiteLink,handleClick,transferOriginal};
}

