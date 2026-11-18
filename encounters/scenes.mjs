import {sceneActorLayout,sceneAnchorStyle,checkSceneArtwork} from './scene-layout.mjs?v=dublin-accuracy-1';
import {backgroundImage} from './backgrounds.mjs?v=quayside-lamps-1';
import {encounters,roles,roleLabels} from './catalog.mjs?v=community-group-1';
import {characterFor,defaultCast} from './characters.mjs?v=garda-neutral-1';
import {sceneCharacterArtwork} from './scene-artwork.mjs?v=garda-neutral-1';
import {discriminationEncounters} from './discrimination.mjs?v=discrimination-1';

// Keep objects in the written account: loose overlays cannot reliably match a
// hand, surface or perspective across every character and location.
// Selected characters share a setting only while the written encounter places
// them together. Later notes and confidential advice use independent panels.
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
 },
 ...Object.fromEntries(Object.values(discriminationEncounters).map(({id,place,nodes})=>[
  id,Object.fromEntries(Object.keys(nodes).map(node=>[node,scene(place,null)]))
 ]))
};

export const sceneAssets=['street','bus-stop','station','advice-room','meeting-room','square'];
// Only exterior artwork changes. The station and private rooms retain their art.
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const places={'street':'On the street','bus-stop':'At the bus stop',station:'At the station','advice-room':'Time to reflect','meeting-room':'Reviewing the encounter',square:'In the community'};

function backdrop(place,art,{sizes,lazy}){
 const image=art||{src:new URL(`../assets/scenes/${place}.webp?v=irish-streetlights-1`,import.meta.url).href,width:680,height:380};
 const responsive=image.srcset?` srcset="${image.srcset}" sizes="${sizes}"`:'';
 return `<img class="scene-backdrop" src="${image.src}"${responsive} alt="" width="${image.width}" height="${image.height}" decoding="async"${lazy?' loading="lazy"':''}>`;
}

function sceneActor(role,id,anchor,lazy){
 const art=sceneCharacterArtwork(characterFor(role,id));
 return `<div class="scene-actor scene-actor--${role}" data-scene-character="${id}" data-scene-role="${role}" style="${sceneAnchorStyle(anchor)}" aria-hidden="true"><div class="scene-sprite"><img src="${art.src}" width="${art.width}" height="${art.height}" alt="" decoding="async"${lazy?' loading="lazy"':''} style="${art.style}"></div></div>`;
}

function locationArt(place,art,actors,{className,sizes,lazy}){
 const approved=art?` data-approved-art="${art.name}"`:'';
 return `<div class="scene-location ${className}" data-scene-place="${place}"${approved} aria-hidden="true">${backdrop(place,art,{sizes,lazy})}${actors}</div>`;
}

export function renderScenePreview(id){
 const {place}=sceneDirections[id][encounters[id].start];
 const art=backgroundImage(place),cast=defaultCast();
 checkSceneArtwork(place,art?.name||null);
 const actors=roles.map(role=>sceneActor(role,cast[role],sceneActorLayout(place,role),true)).join('');
 return locationArt(place,art,actors,{
  className:'situation-image',sizes:'auto, (max-width: 36rem) 100vw, 36rem',lazy:true
 });
}

export function sceneModel(state,{step=null}={}){
 const last=step||(state.complete?state.history.at(-1):null);
 const nodeId=last?.nodeId||state.nodeId,stage=encounters[state.id]?.nodes[nodeId];
 const direction=sceneDirections[state.id]?.[nodeId];
 if(!stage||!direction)throw Error(`Missing illustration: ${state.id}/${nodeId}`);
 const role=last?.continuedAs||state.role,answers=last?.answers||state.answers;
 const choice=answers[role]===null?null:stage.views[role].choices[answers[role]];
 const separate=['separate','private'].includes(direction.mode);
 return {...direction,nodeId,stage,choice,role,separate,phase:choice?'response':'decision',
  label:direction.mode==='private'?'Private advice · separate perspectives':separate?'':direction.mode==='comparison'?'Same facts · compare the written scenarios':places[direction.place]};
}

export function renderScene(state,options={}){
 const m=sceneModel(state,options),compact=!!options.compact;
 const outdoorSplit=m.separate&&!!(backgroundImage(m.place)||backgroundImage(m.otherPlace));
 const location=(place,members,side='')=>{
  const art=backgroundImage(place);
  checkSceneArtwork(place,art?.name||null);
  const anchors=Object.fromEntries(members.map(role=>[role,sceneActorLayout(place,role,{solo:members.length===1,wide:outdoorSplit})]));
  const names=members.map(role=>{
   const character=characterFor(role,state.cast[role]);
   return '<button type="button" class="scene-character-label" data-role-tone="'+role+'" data-scene-label-role="'+role+'" data-scene-character-id="'+esc(character.id)+'" style="'+sceneAnchorStyle(anchors[role])+'" aria-haspopup="dialog" aria-controls="scene-character-dialog" aria-label="About '+esc(character.name)+', '+esc(roleLabels[role])+'"><strong><span data-no-translate>'+esc(character.name)+'</span></strong><span class="scene-character-role">'+esc(roleLabels[role])+'</span><span class="scene-character-info" aria-hidden="true">i</span></button>';
  }).join('');
  const actors=members.map(role=>sceneActor(role,state.cast[role],anchors[role],compact)).join('');
  const image=locationArt(place,art,actors,{
   className:(members.length===1?'scene-location--solo ':'')+side,
   sizes:'(max-width: 660px) calc(100vw - 3rem), 640px',lazy:compact
  });
  return '<figure class="scene-panel">'+image+'<figcaption class="scene-cast-names" data-scene-label-track data-label-layout="stacked">'+names+'</figcaption></figure>';
 };
 const panels=m.separate?location(m.place,['public'],'scene-location--public')+location(m.otherPlace,['garda'],'scene-location--garda'):location(m.place,roles);
 return '<figure class="encounter-scene '+(compact?'encounter-scene--compact':'')+'" data-caption-anchors data-scene-id="'+esc(state.id+'/'+m.nodeId)+'" data-scene-phase="'+m.phase+'" data-scene-mode="'+m.mode+'">'+(m.label?'<div class="scene-setting">'+esc(m.label)+'</div>':'')+'<div class="scene-stage '+(m.separate?'scene-stage--separate':'')+' '+(outdoorSplit?'scene-stage--outdoor-split':'')+'">'+panels+'</div></figure>';
}
