import {encounters,roles,roleLabels} from './catalog.mjs';
import {characterFor} from './characters.mjs';

// Explicit art direction for every decision. Illustrations never decide the law,
// scoring, identity cues or facts; those remain in the scenario's written account.
const scene=(place,speaker,prop=null,mode='together',otherPlace=place)=>({place,speaker,prop,mode,otherPlace});
export const sceneDirections={
 'public-street':{
  'street-start':scene('street','garda'),
  'street-status':scene('street','public'),
  'street-voluntary':scene('street','garda','forms'),
  'street-details':scene('street','garda','notebook'),
  'street-end':scene('square',null,'notebook','separate','station')
 },
 'public-search':{
  'search-start':scene('bus-stop','garda','bag'),
  'search-power':scene('bus-stop','garda','forms'),
  'search-disagree':scene('bus-stop','public','bag'),
  'search-end':scene('bus-stop',null,'notebook','separate','station')
 },
 'public-arrest':{
  'arrest-start':scene('street','garda'),
  'arrest-lawyer':scene('station','public','forms'),
  'arrest-reconsider':scene('station','public','phone'),
  'arrest-silence':scene('advice-room',null,'forms','private','station'),
  'arrest-time':scene('station','garda','notebook')
 },
 'public-custody':{
  'custody-start':scene('station','garda','forms'),
  'custody-lawyer':scene('station','public','phone'),
  'custody-health':scene('station',null),
  'custody-contact':scene('station','public','phone')
 },
 'public-young-person':{
  'youth-start':scene('station',null),
  'youth-adult':scene('station','garda','phone'),
  'youth-solicitor':scene('station','public','forms'),
  'youth-understand':scene('station','public','notebook')
 },
 'public-fair-treatment':{
  'fair-start':scene('square','public'),
  'fair-record':scene('advice-room',null,'notebook','separate','station'),
  'fair-route':scene('advice-room',null,'laptop','separate','station'),
  'fair-deadline':scene('advice-room',null,'forms','separate','station')
 },
 'garda-street':{
  'street-start':scene('street',null,'phone'),
  'street-reset':scene('street','public'),
  'street-enquiry':scene('street','garda'),
  'street-information':scene('street',null,'notebook'),
  'street-identity':scene('street',null,'forms','comparison')
 },
 'garda-description':{
  'description-start':scene('square',null,'phone'),
  'description-repair':scene('square',null,'forms'),
  'description-detail':scene('square',null,'notebook'),
  'description-power':scene('street','garda','forms')
 },
 'garda-search':{
  'search-start':scene('bus-stop',null,'bag'),
  'search-check':scene('bus-stop','public','bag'),
  'search-specific':scene('bus-stop',null,'forms'),
  'search-explain':scene('bus-stop','public','notebook'),
  'search-result':scene('bus-stop','garda','bag')
 },
 'garda-communication':{
  'communication-start':scene('square','garda'),
  'communication-repair':scene('square',null),
  'communication-clarify':scene('square','public'),
  'communication-review':scene('advice-room',null,'notebook','separate','meeting-room')
 },
 'garda-young-person':{
  'young-start':scene('bus-stop',null),
  'young-contact':scene('bus-stop','public'),
  'young-review':scene('bus-stop',null,'forms','comparison')
 },
 'garda-colleague':{
  'colleague-start':scene('street',null,'toolbox'),
  'colleague-pressure':scene('street','public','toolbox'),
  'colleague-specific':scene('street',null,'forms'),
  'colleague-review':scene('advice-room',null,'notebook','separate','meeting-room')
 },
 'garda-new-evidence':{
  'update-start':scene('street',null,'phone'),
  'update-repair':scene('street',null,'forms'),
  'update-explain':scene('street','garda'),
  'update-record':scene('advice-room',null,'notebook','separate','station')
 },
 'garda-supervision':{
  'supervision-start':scene('meeting-room',null,'laptop'),
  'supervision-deployment':scene('meeting-room','garda','forms'),
  'supervision-training':scene('meeting-room','public','laptop'),
  'supervision-plan':scene('meeting-room','garda','notebook')
 }
};

export const sceneAssets=['listening','speaking','reflecting','props','street','bus-stop','station','advice-room','meeting-room','square'];
const asset=name=>new URL(`../assets/scenes/${name}.webp`,import.meta.url).href;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const props={bag:0,notebook:1,phone:2,forms:3,toolbox:4,laptop:5};
const places={'street':'On the street','bus-stop':'At the bus stop',station:'At the station','advice-room':'Time to reflect','meeting-room':'Reviewing the encounter',square:'In the community'};

export function sceneModel(state,{step=null}={}){
 const last=step||(state.complete?state.history.at(-1):null);
 const nodeId=last?.nodeId||state.nodeId,stage=encounters[state.id]?.nodes[nodeId];
 const direction=sceneDirections[state.id]?.[nodeId];
 if(!stage||!direction)throw Error(`Missing illustration: ${state.id}/${nodeId}`);
 const role=last?.continuedAs||state.role,answers=last?.answers||state.answers;
 const choice=answers[role]===null?null:stage.views[role].choices[answers[role]];
 const separate=['separate','private'].includes(direction.mode);
 const speaker=choice&&!separate?role:direction.speaker;
 const poses=Object.fromEntries(roles.map(r=>[r,separate?'reflecting':speaker===r?'speaking':speaker?'listening':'reflecting']));
 // An answer changes the moment, without inventing another person's reaction.
 if(choice&&separate)poses[role]='listening';
 if(choice&&!separate&&direction.speaker===role)poses[role]='reflecting';
 return {...direction,nodeId,stage,choice,role,poses,separate,phase:choice?'response':'decision',
  label:direction.mode==='private'?'Private advice · separate perspectives':separate?'Separate reflections':direction.mode==='comparison'?'Same facts · compare the written scenarios':places[direction.place]};
}

export function renderScene(state,options={}){
 const m=sceneModel(state,options),compact=!!options.compact;
 const background=(place,side='')=>`<div class="scene-location ${side}" aria-hidden="true"><img src="${asset(place)}" alt="" width="680" height="380" decoding="async" ${compact?'loading="lazy"':''}></div>`;
 const actors=roles.map(role=>{
  const c=characterFor(role,state.cast[role]);
  return `<div class="scene-actor scene-actor--${role}" data-scene-character="${c.id}" data-scene-role="${role}" data-pose="${m.poses[role]}" aria-hidden="true"><div class="scene-sprite">${['listening','speaking','reflecting'].map(pose=>`<img class="scene-pose ${pose===m.poses[role]?'is-visible':''}" src="${asset(pose)}" width="1774" height="887" alt="" decoding="async" ${compact?'loading="lazy"':''} style="left:-${c.column*100}%;top:-${c.row*100}%">`).join('')}</div></div>`;
 }).join('');
 const propIndex=props[m.prop];
 const prop=propIndex===undefined?'':`<span class="scene-prop" aria-hidden="true"><img src="${asset('props')}" width="1536" height="1024" alt="" decoding="async" ${compact?'loading="lazy"':''} style="left:-${propIndex%3*100}%;top:-${Math.floor(propIndex/3)*100}%"></span>`;
 const names=roles.map(role=>`<span data-role-tone="${role}"><strong><span>Avatar:</span> <span data-no-translate>${esc(characterFor(role,state.cast[role]).name)}</span></strong><span>${roleLabels[role]}</span></span>`).join('');
 return `<figure class="encounter-scene ${compact?'encounter-scene--compact':''}" data-scene-id="${esc(state.id+'/'+m.nodeId)}" data-scene-phase="${m.phase}" data-scene-mode="${m.mode}"><div class="scene-stage ${m.separate?'scene-stage--separate':''}" role="img" aria-label="${esc(m.stage.title)}">${background(m.place,m.separate?'scene-location--public':'')}${m.separate?background(m.otherPlace,'scene-location--garda'):''}${actors}${prop}${m.separate?'<span class="scene-divider" aria-hidden="true"></span>':''}<span class="scene-setting">${esc(m.label)}</span></div><figcaption><div class="scene-cast-names">${names}</div></figcaption></figure>`;
}
