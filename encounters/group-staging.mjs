import {sceneGroupLayout} from './scene-layout.mjs?v=situation-locations-20261122';

// These marks are the centres of complete sprite frames, in panel percentages.
// Separate the exchange from its observers without detaching the numbered badge.
const mark=(x,width,bottom)=>({x,width,bottom});
const stationFamily={
 opening:{affected:mark(14.5,27,10),child:mark(29.9,23,10),'acting-garda':mark(51,26.5,14),public:mark(71,21,28),garda:mark(87.5,21.5,25)},
 'follow-up':{affected:mark(14,26,13),child:mark(28.5,22,13),'acting-garda':mark(50,21,28),public:mark(68.5,26,12),garda:mark(87,21,23)}
};
const turnstile={
 // The physical reader is already mounted at x=45% in the stadium artwork.
 opening:{public:mark(33.5,31,13),steward:mark(56,27,15),garda:mark(82,22,26)},
 'follow-up':{public:mark(20,28,15),steward:mark(43,23,20),supervisor:mark(63,27,13),garda:mark(85,21,27)}
};

// Props appear only when the displayed account places them in someone's hands.
const heldObjects={
 'discrimination-race':{opening:['public','ticket']},
 'discrimination-gender':{opening:['public','paper']},
 'discrimination-civil-status':{opening:['public','ticket'],'follow-up':['public','paper']},
 'discrimination-sexual-orientation':{opening:['public','ticket']},
 'discrimination-disability':{opening:['public','paper']},
 'discrimination-colleague-disability':{opening:['affected','paper']},
 'discrimination-colleague-civil-status':{'follow-up':['affected','phone']},
 'discrimination-housing-assistance':{'follow-up':['public','phone']},
 'discrimination-colleague-housing-assistance':{'follow-up':['affected','paper']}
};
const staffRoles={
 gender:'organiser','civil-status':'attendant','family-status':'organiser',
 'sexual-orientation':'steward',age:'organiser','religious-belief':'volunteer',
 'traveller-community':'caretaker',race:'steward',disability:'garda','housing-assistance':'agent'
};
const publicGestures=new URL('../assets/scenes/group-public-gestures.webp',import.meta.url).href;
export function publicGestureArtwork(character,gesture,facingLeft){
 const match=/^public-([1-9])$/.exec(character.id);
 if(!match)return null;
 const column=Number(match[1])-1,row=(gesture==='listen'?2:0)+(facingLeft?1:0);
 return {src:publicGestures,width:2880,height:1280,
  style:`left:${-column*100}%;top:${-row*100}%;width:900%;height:400%;clip-path:inset(${row*25}% ${(8-column)*100/9}% ${(3-row)*25}% ${column*100/9}%)`};
}

// The supporting officer can only be Ciara or Rory: the roster reserves the
// player's officer and picks the first available uniform. Both alternate poses
// retain the approved clothing and read left-to-right on the chest patch.
function speakingOfficer(character){
 const column=['garda-1','garda-2'].indexOf(character.id);
 if(column<0)return null;
 return {src:new URL('../assets/characters/group-speaking-gardai.webp',import.meta.url).href,width:832,height:416,
  style:`left:${-column*100}%;top:0%;width:200%;height:100%;clip-path:inset(0% ${(1-column)*50}% 0% ${column*50}%)`};
}

export function stageGroup(id,nodeId,participants){
 const witness=id.startsWith('discrimination-colleague-'),opening=nodeId==='opening';
 const marks=id==='discrimination-colleague-family-status'?stationFamily[nodeId]:id==='discrimination-race'?turnstile[nodeId]:null;
 const subject=witness?'affected':'public';
 const staff=staffRoles[id.slice('discrimination-'.length)];
 const interlocutor=witness?'acting-garda':participants.some(person=>person.key===staff)?staff:'garda';
 const object=heldObjects[id]?.[nodeId];
 return participants.map(person=>{
  const holds=object?.[0]===person.key;
  const responds=opening?person.key===interlocutor:person.key===subject||person.key==='supervisor'||(witness&&person.key==='public');
  const counterpart=witness&&!opening?'public':interlocutor;
  const foreground=person.key===subject||person.key===counterpart||person.key==='child'||person.key==='partner'||person.key==='companion'||person.key==='supervisor';
  const facingLeft=person.key!==subject&&person.key!=='partner'&&person.key!=='companion';
  const familyParent=id==='discrimination-colleague-family-status'&&person.key==='affected';
  const gesturing=familyParent?opening:holds||responds;
  const art=opening&&person.key==='acting-garda'
   ?speakingOfficer(person.character)
   :publicGestureArtwork(person.character,gesturing?'speak':'listen',facingLeft);
  return {...person,character:art?{...person.character,sceneArtwork:art}:person.character,
   staging:{mark:marks?.[person.key],foreground,object:holds?object[1]:null,gestureHand:Boolean(art)}};
 });
}

export function groupMark(place,base,person){
 const {mark:fixed,foreground}=person.staging;
 if(fixed)return fixed;
 // The bus shelter and quayside already have individual perspective marks.
 // On other sites listening witnesses stand a few steps behind the exchange.
 if(foreground||place==='bus-stop')return base;
 return {...base,width:base.width*.86,bottom:Math.min(29,base.bottom+(place==='square'?3:9))};
}

export function renderGroupAction(id,nodeId,participants,place){
 if(!heldObjects[id]?.[nodeId])return '';
 const holder=participants.find(person=>person.staging?.object);
 if(!holder)return '';
 const type=holder.staging.object;
 const position=groupMark(place,sceneGroupLayout(place,participants.length,participants.indexOf(holder)),holder);
 // The speaking sheet registers all raised grips on the right of the subject.
 // Nia and the dedicated support figures retain their own art and lower grip.
 const handX=holder.staging.gestureHand?79:73,handY=holder.staging.gestureHand?43:67;
 return `<span aria-hidden="true" class="scene-exchange-object" data-held-by="${holder.key}" data-scene-object="${type}" style="--holder-x:${position.x}%;--holder-bottom:${position.bottom}%;--holder-width:${position.width*holder.scale}%;--grip-x:${handX}%;--grip-y:${handY}%"><i></i></span>`;
}
