import {characters,characterFor,castForSituation} from './characters.mjs?v=situation-cast-20261122';
import {supportingCharacters} from './supporting-characters.mjs?v=cast-audit-20261122';

// These are author-selected portraits for fictional roles, not assumptions
// about a real person's identity, beliefs, disability or civil status.
const women=['public-4','public-7','public-2','public-6'];
const men=['public-5','public-8','public-1','public-9'];
const older=['public-9','public-3','public-6'];
const adults=characters.public.map(character=>character.id);
const officers=characters.garda.map(character=>character.id);
const part=(key,role,label,portraits=adults,scale=1)=>({key,role,label,portraits,scale});
const only=(stage,participant)=>({...participant,stages:[stage]});
const originalRoles={
 gender:'Woman with a booking',
 'civil-status':'Divorced customer',
 'family-status':'Parent applying for the course',
 'sexual-orientation':'Member of the couple',
 age:'Applicant, 67 years old',
 'religious-belief':'Applicant with no religion',
 'traveller-community':'Traveller resident',
 race:'Irish spectator',
 disability:'Deaf person making a report',
 'housing-assistance':'Applicant receiving HAP'
};
const affected={
 gender:part('affected','public','Woman reporting the bicycle theft',women),
 'civil-status':part('affected','public','Separated person making a report'),
 'family-status':part('affected','public','Parent making a report'),
 'sexual-orientation':part('affected','public','Woman reporting harassment',women),
 age:part('affected','public','Person reporting the theft, 72 years old',older),
 'religious-belief':part('affected','public','Person reporting anti-Muslim abuse'),
 'traveller-community':part('affected','public','Traveller reporting abuse'),
 race:part('affected','public','Black adult being singled out',['support-race-adult']),
 disability:part('affected','public','Deaf adult requesting an ISL interpreter'),
 'housing-assistance':part('affected','public','Applicant receiving HAP')
};
export const isDiscriminationSituation=id=>/^discrimination-(?:colleague-)?[a-z-]+$/.test(id);
export function situationRoleLabel(id,role){
 if(!isDiscriminationSituation(id))return null;
 if(id.startsWith('discrimination-colleague-'))return role==='public'?'Public witness':'Witnessing Garda';
 return role==='public'?originalRoles[id.slice('discrimination-'.length)]:'Responding Garda';
}
export function situationParticipants(id,requestedCast,{nodeId='opening'}={}){
 if(!isDiscriminationSituation(id))return null;
 const colleague=id.startsWith('discrimination-colleague-');
 const ground=id.slice(colleague?'discrimination-colleague-'.length:'discrimination-'.length);
 if(!affected[ground])throw Error('Missing discrimination cast: '+id);
 const cast=castForSituation(id,requestedCast),used=new Set(Object.values(cast));
 const supports=[];
 if(colleague){
  supports.push(affected[ground]);
  if(ground==='gender')supports.push(part('companion','public','Male companion',men));
  if(ground==='sexual-orientation')supports.push(part('partner','public','Her partner',women));
  if(ground==='family-status')supports.push(part('child','public','Child, 7 years old',['support-child'],.85));
  if(ground==='housing-assistance')supports.push(only('opening',part('agent','public','Letting agent')));
  supports.push(part('acting-garda','garda','Garda whose conduct is being challenged',officers));
 }else{
  if(ground==='gender'){
   supports.push(part('organiser','public','Workshop organiser'));
   supports.push(only('opening',part('participant','public','Man offered the booked place',men)));
  }
  if(ground==='civil-status'){
   supports.push(part('companion','public','Second ticket holder'),part('attendant','public','Ticket attendant'));
   supports.push(only('follow-up',part('supervisor','public','Venue supervisor')));
  }
  if(ground==='family-status')supports.push(part('organiser','public','Course organiser'),only('opening',part('steward','public','Steward who asks the Garda to help')));
  if(ground==='sexual-orientation'){
   const partners=women.includes(cast.public)?women:men.includes(cast.public)?men:['public-3','public-9'];
   supports.push(part('partner','public','Their partner',partners),part('steward','public','Gate steward'));
   supports.push(only('opening',part('colleague','public','Event colleague who calls the Garda')),only('follow-up',part('visitor','public','Visitor offering a witness account')));
  }
  if(ground==='age')supports.push(part('organiser','public','Course organiser'));
  if(ground==='religious-belief'){
   supports.push(part('volunteer','public','Booking volunteer'));
   supports.push(only('follow-up',part('organiser','public','Class organiser')));
  }
  if(ground==='traveller-community'){
   supports.push(part('caretaker','public','Centre caretaker'));
   supports.push(only('follow-up',part('manager','public','Centre manager')));
  }
  if(ground==='race'){
   supports.push(part('steward','public','Ticket steward'));
   supports.push(only('follow-up',part('supervisor','public','Club supervisor')));
  }
  if(ground==='disability')supports.push(part('friend','public','Friend accompanying the Deaf person'));
  if(ground==='housing-assistance')supports.push(only('opening',part('agent','public','Letting agent')));
 }
 // Reserve every participant's portrait before filtering by stage. A newcomer
 // must not reuse the face of someone who appeared only in the previous stage.
 const supporting=supports.map(participant=>{
  const characterId=participant.portraits.find(candidate=>!used.has(candidate));
  if(!characterId)throw Error('No distinct portrait for '+id+'/'+participant.key);
  used.add(characterId);
  return {...participant,characterId,character:characterFor(participant.role,characterId)||supportingCharacters[characterId],playable:false};
 }).filter(participant=>!participant.stages||participant.stages.includes(nodeId));
 const playable=['public','garda'].map(role=>({key:role,role,label:situationRoleLabel(id,role),characterId:cast[role],character:characterFor(role,cast[role]),playable:true,scale:1}));
 return [...(colleague?supporting:[playable[0],...supporting]),...(colleague?playable:[playable[1]])].map((participant,index)=>({...participant,number:index+1}));
}

// Feet follow the pavement from the broad foreground to the shelter. The
// adult and the officer are nearest the viewer, with a clear view for both witnesses.
const busStopPositions={
 affected:{x:24,width:23,bottom:3},
 'acting-garda':{x:47,width:21,bottom:7},
 public:{x:68,width:17,bottom:15},
 garda:{x:88,width:16,bottom:17}
};

export function participantLayout(place,participants,index){
 const {key,scale}=participants[index],count=participants.length;
 if(place==='bus-stop'){
  const position=busStopPositions[key];
  return {...position,width:position.width*scale,labelSpace:100};
 }
 if(place==='street'||place==='square'){
  // The street narrows towards the shelter. On the quay, the paving opens
  // out towards the viewer below the river wall on the right.
  const street=place==='street';
  const depth=index/(count-1);
  const left=count<4?16:11,right=street?69:78;
  const interval=(right-left)/(count-1);
  const width=Math.min(28,interval-1)*(street ? 1-.22*depth : .92+.08*depth);
  return {x:left+(right-left)*depth,width:width*scale,bottom:street?3+24*depth:5-4*depth,labelSpace:100};
 }
 const slot=100/count;
 const fartherBack=index%2===1;
 const width=Math.min(28,slot*.82)*(fartherBack ? .88 : 1);
 return {x:(index+.5)*slot,width:width*scale,bottom:fartherBack?12:4,labelSpace:100};
}
