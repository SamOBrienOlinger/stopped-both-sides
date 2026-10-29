import {encounters,roles,roleLabels} from './catalog.mjs?v=scene-review-1';
import {characterFor,characterArtwork} from './characters.mjs?v=scene-art-2';

// Keep objects in the written account: loose overlays cannot reliably match a
// hand, surface or perspective across every character and location.
// Locations provide context. Framed, neutral portraits identify the chosen
// characters without staging gestures, distress or knowledge the text does not give.
const scene=(place,speaker,mode='together',otherPlace=place)=>({place,speaker,mode,otherPlace});
export const sceneDirections={
 'public-street':{
  'street-start':scene('street','garda'),
  'street-status':scene('street','public'),
  'street-voluntary':scene('street','garda'),
  'street-details':scene('street','garda'),
  'street-end':scene('square',null,'separate','station')
 },
 'public-search':{
  'search-start':scene('bus-stop','garda'),
  'search-power':scene('bus-stop','garda'),
  'search-disagree':scene('bus-stop','public'),
  'search-end':scene('bus-stop',null,'separate','station')
 },
 'public-arrest':{
  'arrest-start':scene('street','garda'),
  'arrest-lawyer':scene('station','public'),
  'arrest-reconsider':scene('station','public'),
  'arrest-silence':scene('advice-room',null,'private','station'),
  'arrest-time':scene('station','garda')
 },
 'public-custody':{
  'custody-start':scene('station','garda'),
  'custody-lawyer':scene('station','public'),
  'custody-health':scene('station',null),
  'custody-contact':scene('station','public')
 },
 'public-young-person':{
  'youth-start':scene('station',null),
  'youth-adult':scene('station','garda'),
  'youth-solicitor':scene('station','public'),
  'youth-understand':scene('station','public')
 },
 'public-fair-treatment':{
  'fair-start':scene('square','public'),
  'fair-record':scene('advice-room',null,'separate','station'),
  'fair-route':scene('advice-room',null,'separate','station'),
  'fair-deadline':scene('advice-room',null,'separate','station')
 },
 'garda-street':{
  'street-start':scene('street',null),
  'street-reset':scene('street','public'),
  'street-enquiry':scene('street','garda'),
  'street-information':scene('street',null),
  'street-identity':scene('street',null,'comparison')
 },
 'garda-description':{
  'description-start':scene('square',null),
  'description-repair':scene('square',null),
  'description-detail':scene('square',null),
  'description-power':scene('street','garda')
 },
 'garda-search':{
  'search-start':scene('bus-stop',null),
  'search-check':scene('bus-stop','public'),
  'search-specific':scene('bus-stop',null),
  'search-explain':scene('bus-stop','public'),
  'search-result':scene('bus-stop','garda')
 },
 'garda-communication':{
  'communication-start':scene('square','garda'),
  'communication-repair':scene('square',null),
  'communication-clarify':scene('square','public'),
  'communication-review':scene('advice-room',null,'separate','meeting-room')
 },
 'garda-young-person':{
  'young-start':scene('bus-stop',null),
  'young-contact':scene('bus-stop','public'),
  'young-review':scene('bus-stop',null,'comparison')
 },
 'garda-colleague':{
  'colleague-start':scene('street',null),
  'colleague-pressure':scene('street','public'),
  'colleague-specific':scene('street',null),
  'colleague-review':scene('advice-room',null,'separate','meeting-room')
 },
 'garda-new-evidence':{
  'update-start':scene('street',null),
  'update-repair':scene('street',null),
  'update-explain':scene('street','garda'),
  'update-record':scene('advice-room',null,'separate','station')
 },
 'garda-supervision':{
  'supervision-start':scene('meeting-room',null),
  'supervision-deployment':scene('meeting-room','garda'),
  'supervision-training':scene('meeting-room','public'),
  'supervision-plan':scene('meeting-room','garda')
 }
};

export const sceneAssets=['street','bus-stop','station','advice-room','meeting-room','square'];
const asset=name=>new URL(`../assets/scenes/${name}.webp?v=irish-art-1`,import.meta.url).href;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const places={'street':'On the street','bus-stop':'At the bus stop',station:'At the station','advice-room':'Time to reflect','meeting-room':'Reviewing the encounter',square:'In the community'};

export function sceneModel(state,{step=null}={}){
 const last=step||(state.complete?state.history.at(-1):null);
 const nodeId=last?.nodeId||state.nodeId,stage=encounters[state.id]?.nodes[nodeId];
 const direction=sceneDirections[state.id]?.[nodeId];
 if(!stage||!direction)throw Error(`Missing illustration: ${state.id}/${nodeId}`);
 const role=last?.continuedAs||state.role,answers=last?.answers||state.answers;
 const choice=answers[role]===null?null:stage.views[role].choices[answers[role]];
 const separate=['separate','private'].includes(direction.mode);
 return {...direction,nodeId,stage,choice,role,separate,phase:choice?'response':'decision',
  label:direction.mode==='private'?'Private advice · separate perspectives':separate?'Separate reflections':direction.mode==='comparison'?'Same facts · compare the written scenarios':places[direction.place]};
}

export function renderScene(state,options={}){
 const m=sceneModel(state,options),compact=!!options.compact;
 const background=(place,side='')=>`<div class="scene-location ${side}" aria-hidden="true"><img src="${asset(place)}" alt="" width="680" height="380" decoding="async" ${compact?'loading="lazy"':''}></div>`;
 const actors=roles.map(role=>{
  const c=characterFor(role,state.cast[role]);
  const art=characterArtwork(c,'portrait');
  return `<div class="scene-actor scene-actor--${role}" data-scene-character="${c.id}" data-scene-role="${role}" aria-hidden="true"><div class="scene-sprite"><img src="${art.src}" width="${art.width}" height="${art.height}" alt="" decoding="async" ${compact?'loading="lazy"':''} style="${art.style}"></div></div>`;
 }).join('');
 const names=roles.map(role=>`<span data-role-tone="${role}"><strong><span data-no-translate>${esc(characterFor(role,state.cast[role]).name)}</span></strong><span>${roleLabels[role]}</span></span>`).join('');
 return `<figure class="encounter-scene ${compact?'encounter-scene--compact':''}" data-scene-id="${esc(state.id+'/'+m.nodeId)}" data-scene-phase="${m.phase}" data-scene-mode="${m.mode}"><div class="scene-setting">${esc(m.label)}</div><div class="scene-stage ${m.separate?'scene-stage--separate':''}" aria-hidden="true"><div class="scene-settings">${background(m.place,m.separate?'scene-location--public':'')}${m.separate?background(m.otherPlace,'scene-location--garda'):''}</div><div class="scene-portraits">${actors}</div></div><figcaption><div class="scene-cast-names">${names}</div></figcaption></figure>`;
}
