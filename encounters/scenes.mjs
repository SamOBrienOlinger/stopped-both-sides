import {storyCharacter,fixedStoryCharacter} from './story-cast.mjs?v=casting-logos-20261127';
import {originalSceneDetails} from './original-scene-props.mjs?v=casting-logos-20261127';
import {renderGroupAction} from './group-staging.mjs?v=responsive-fixes-20261127';
import {sceneActorLayout,sceneAnchorStyle,checkSceneArtwork} from './scene-layout.mjs?v=situation-locations-20261122';
import {backgroundImage,interiorBackground} from './backgrounds.mjs?v=gpo-flags-20261125';
import {encounters,roles,roleLabels} from './catalog.mjs?v=site-repairs-20261125';
import {characterFor,defaultCast} from './characters.mjs?v=casting-logos-20261127';
import {sceneCharacterArtwork} from './scene-artwork.mjs?v=responsive-fixes-20261127';
import {discriminationEncounters} from './discrimination.mjs?v=site-repairs-20261125';
import {situationParticipants,participantLayout} from './situation-cast.mjs?v=casting-logos-20261127';

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
  'street-start':scene('closed-shop',null),
  'street-reset':scene('closed-shop','public'),
  'street-enquiry':scene('closed-shop','garda'),
  'street-information':scene('closed-shop',null),
  'street-identity':scene('closed-shop',null,'comparison')
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

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const places={'street':'On the street','bus-stop':'At the bus stop',station:'At the station','advice-room':'Time to reflect','meeting-room':'Reviewing the encounter',square:'In the community','football-ground':'Outside the football ground','bicycle-workshop':'At the bicycle repair workshop','exhibition-entrance':'At the exhibition entrance','community-fair':'At the community fair','food-festival':'At the food festival entrance','community-hall':'At the community hall','closed-shop':'Outside the closed shop','flat-entrance':'Outside the flats'};
export const sceneAssets=Object.keys(places);

function stageImageSizes(compact,outdoorSplit=false){
 if(compact)return 'auto, (max-width: 38rem) calc(100vw - 3rem), 35rem';
 // Outdoor split panels stack on phones. Portrait indoor panels crop a
 // full-width source horizontally to preserve its height behind the cast.
 if(outdoorSplit)return '(max-width: 41.25rem) calc(100vw - 3rem), (max-width: 71rem) calc(50vw - 1.5rem), 34rem';
 return '(max-width: 71rem) calc(100vw - 3rem), 68rem';
}

function backdrop(place,art,{sizes,lazy}){
 const image=art||interiorBackground(place);
 const responsive=image.srcset?` srcset="${image.srcset}" sizes="${sizes}"`:'';
 return `<img class="scene-backdrop" src="${image.src}"${responsive} alt="" width="${image.width}" height="${image.height}" decoding="async"${lazy?' loading="lazy"':''}>`;
}

function sceneActor(role,id,anchor,lazy,{key=role,number=null,character=characterFor(role,id)}={}){
 const art=sceneCharacterArtwork(character);
 const responsive=art.srcset?` srcset="${art.srcset}" sizes="${lazy?'auto, ':''}(max-width: 71rem) ${anchor.width}vw, ${anchor.width*.68}rem"`:'';
 return `<div class="scene-actor scene-actor--${role}" data-scene-character="${id}" data-scene-role="${key}" style="${sceneAnchorStyle(anchor)}${anchor.layer?'z-index:'+anchor.layer+';':''}" aria-hidden="true"><div class="scene-sprite"><img src="${art.src}"${responsive} width="${art.width}" height="${art.height}" alt="" decoding="async"${lazy?' loading="lazy"':''} style="${art.style}"></div>${number?'<span class="scene-person-number">'+number+'</span>':''}</div>`;
}

function locationArt(place,art,actors,{className,sizes,lazy}){
 const artwork=art?` ${art.group?'data-group-art':'data-approved-art'}="${art.name}"`:'';
 return `<div class="scene-location ${className}" data-scene-place="${place}" data-location-label="${esc(places[place])}"${artwork} aria-hidden="true">${backdrop(place,art,{sizes,lazy})}${actors}</div>`;
}

export function renderScenePreview(id,{cast=defaultCast(),authored=false}={}){
 const nodeId=encounters[id].start,{place}=sceneDirections[id][nodeId];
 const state={id,nodeId,cast,authored},participants=situationParticipants(id,cast);
 const art=backgroundImage(place,{group:!!participants});
 checkSceneArtwork(place,art?.name||null);
 let actors;
 if(participants){
  actors=participants.map((participant,index)=>sceneActor(participant.role,participant.characterId,participantLayout(place,participants,index),true,{key:participant.key,character:participant.character})).join('')+renderGroupAction(id,nodeId,participants,place);
 }else{
  const people=Object.fromEntries(roles.map(role=>[role,storyCharacter(state,role)]));
  const details=originalSceneDetails(id,nodeId,place,people,{reservedCast:state.cast});
  actors=roles.map(role=>sceneActor(role,people[role].id,details.anchors[role]||sceneActorLayout(place,role),true,{character:people[role]})).join('')+supportingActors(details,true);
 }
 return locationArt(place,art,actors,{
  className:'situation-image',sizes:'auto, (max-width: 36rem) 100vw, 36rem',lazy:true
 });
}

function supportingActors(details,lazy){
 return details.supporting.map(({role,key,character,anchor})=>sceneActor(role,character.id,anchor,lazy,{key,character})).join('')+details.props;
}

function renderSituationScene(state,m,compact){
 const participants=situationParticipants(state.id,state.cast,{nodeId:m.nodeId});
 if(!participants)return null;
 const art=backgroundImage(m.place,{group:true});
 checkSceneArtwork(m.place,art?.name||null);
 const actors=participants.map((participant,index)=>sceneActor(participant.role,participant.characterId,participantLayout(m.place,participants,index),compact,participant)).join('')+renderGroupAction(state.id,m.nodeId,participants,m.place);
 const image=locationArt(m.place,art,actors,{className:'scene-location--group',sizes:stageImageSizes(compact),lazy:compact});
 const cards=participants.map(participant=>{
  const {key,role,label,character,number,playable}=participant;
  const badge='<span class="scene-roster-number" aria-hidden="true">'+number+'</span>';
  if(!playable){
   const name=character.id==='support-race-adult'?'<span>'+esc(character.name)+'</span>':'<bdi data-no-translate>'+esc(character.name)+'</bdi>';
   return '<div class="scene-supporting-person" data-scene-participant="'+key+'" data-character-id="'+character.id+'">'+badge+'<div><strong>'+esc(label)+'</strong><span>'+(key==='child'||character.labelOnly||character.name===label?'':name+' · ')+'<span>Supporting character</span></span></div></div>';
  }
  const witness=encounters[state.id].kind==='colleague-witness';
  const purpose=witness?'<span class="sr-only">Character information</span> ':'';
  const description=witness?(role==='public'?'You witness the Garda’s behaviour towards the affected person. You are not the person being targeted.':'You witness a colleague’s discriminatory behaviour. You are not the Garda whose conduct is being challenged.'):(role==='public'?'You are the person affected in this situation. The other people are identified separately in the scene.':'You are the Garda responding to the situation. The other people are identified separately in the scene.');
  return '<button type="button" class="scene-character-label" data-role-tone="'+role+'" data-scene-participant="'+key+'" data-scene-label-role="'+role+'" data-scene-character-id="'+character.id+'" data-scene-profile-role="'+esc(label)+'" data-scene-profile-description="'+esc(description)+'" aria-haspopup="dialog" aria-controls="scene-character-dialog">'+badge+'<span class="scene-playable-person">'+purpose+'<strong><span'+(character.descriptive?'':' data-no-translate')+'>'+esc(character.name)+'</span></strong><span class="scene-character-role">'+esc(label)+'</span></span><span class="scene-character-info" aria-hidden="true">i</span></button>';
 }).join('');
 return '<figure class="encounter-scene '+(compact?'encounter-scene--compact':'')+'" data-caption-anchors data-cast-layout="group" data-scene-id="'+esc(state.id+'/'+m.nodeId)+'" data-scene-phase="'+m.phase+'" data-scene-mode="'+m.mode+'">'+(m.label?'<div class="scene-setting">'+esc(m.label)+'</div>':'')+'<div class="scene-stage"><figure class="scene-panel">'+image+'<figcaption class="scene-participant-list">'+cards+'</figcaption></figure></div></figure>';
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
 const situationScene=renderSituationScene(state,m,compact);
 if(situationScene)return situationScene;
 const outdoorSplit=m.separate&&!!(backgroundImage(m.place)||backgroundImage(m.otherPlace));
 const location=(place,members,side='')=>{
  const art=backgroundImage(place);
  checkSceneArtwork(place,art?.name||null);
  const people=Object.fromEntries(members.map(role=>[role,storyCharacter(state,role,m.nodeId)]));
  const details=originalSceneDetails(state.id,m.nodeId,place,people,{members,reservedCast:state.cast});
  const anchors=Object.fromEntries(members.map(role=>[role,details.anchors[role]||sceneActorLayout(place,role,{solo:members.length===1,wide:outdoorSplit})]));
  const names=members.map(role=>{
   const character=people[role];
   const fixed=fixedStoryCharacter(state.id,role,m.nodeId,state.authored);
   const witness=encounters[state.id].kind==='colleague-witness';
   const roleLabel=witness||state.id==='garda-supervision'&&role==='garda'?encounters[state.id].people[role]:roleLabels[role];
   // Native names include translated visible witness labels. Keep existing
   // profile labels for the original situations.
   const accessibleLabel=witness?'':' aria-label="About '+esc(character.name)+', '+esc(roleLabel)+'"';
   const purpose=witness?'<span class="sr-only">Character information</span> ':'';
   return '<button type="button" class="scene-character-label" data-role-tone="'+role+'" data-scene-label-role="'+role+'" data-scene-character-id="'+esc(character.id)+'"'+(fixed?' data-story-fixed':'')+(state.id==='garda-supervision'&&role==='garda'?' data-scene-profile-role="'+esc(roleLabel)+'"':'')+' style="'+sceneAnchorStyle(anchors[role])+'" aria-haspopup="dialog" aria-controls="scene-character-dialog"'+accessibleLabel+'>'+purpose+'<strong><span'+(character.descriptive?'':' data-no-translate')+'>'+esc(character.name)+'</span></strong><span class="scene-character-role">'+esc(roleLabel)+'</span><span class="scene-character-info" aria-hidden="true">i</span></button>';
  }).join('');
  const actors=members.map(role=>{
   const character=people[role];
   return sceneActor(role,character.id,anchors[role],compact,{character});
  }).join('')+supportingActors(details,compact);
  const image=locationArt(place,art,actors,{
   className:(members.length===1?'scene-location--solo ':'')+side,
   sizes:stageImageSizes(compact,outdoorSplit),lazy:compact
  });
  return '<figure class="scene-panel">'+image+'<figcaption class="scene-cast-names" data-scene-label-track data-label-layout="stacked">'+names+'</figcaption></figure>';
 };
 const panels=m.separate?location(m.place,['public'],'scene-location--public')+location(m.otherPlace,['garda'],'scene-location--garda'):location(m.place,roles);
 return '<figure class="encounter-scene '+(compact?'encounter-scene--compact':'')+'" data-caption-anchors data-scene-id="'+esc(state.id+'/'+m.nodeId)+'" data-scene-phase="'+m.phase+'" data-scene-mode="'+m.mode+'">'+(m.label?'<div class="scene-setting">'+esc(m.label)+'</div>':'')+'<div class="scene-stage '+(m.separate?'scene-stage--separate':'')+' '+(outdoorSplit?'scene-stage--outdoor-split':'')+'">'+panels+'</div></figure>';
}
