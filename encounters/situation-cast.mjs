import {characters,characterFor,charactersForSituation,castForSituation} from './characters.mjs?v=casting-logos-20261127';
import {supportingCharacters} from './supporting-characters.mjs?v=responsive-fixes-20261127';
import {stageGroup,groupMark} from './group-staging.mjs?v=responsive-fixes-20261127';
import {sceneGroupLayout} from './scene-layout.mjs?v=situation-locations-20261122';

// These are author-selected portraits for fictional roles, not assumptions
// about a real person's identity, beliefs, disability or civil status.
const women=['public-4','public-7','public-2','public-6','public-10'];
const men=['public-5','public-8','public-1','public-9'];
const older=['public-9','public-3','public-6'];
const adults=characters.public.map(character=>character.id);
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
  const officers=charactersForSituation(id,'garda').map(character=>character.id);
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
  if(ground==='family-status')supports.push(part('organiser','public','Course organiser'),only('opening',part('steward','public','Steward who asks the Garda to help',['support-ticket-steward'])));
  if(ground==='sexual-orientation'){
   const partners=women.includes(cast.public)?women:men.includes(cast.public)?men:['public-3','public-9'];
   supports.push(part('partner','public','Their partner',partners),part('steward','public','Gate steward',['support-ticket-steward']));
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
   supports.push(part('steward','public','Ticket steward',['support-ticket-steward']));
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
 const roster=[...(colleague?supporting:[playable[0],...supporting]),...(colleague?playable:[playable[1]])];
 return stageGroup(id,nodeId,roster.map((participant,index)=>({...participant,number:index+1})));
}

export function participantLayout(place,participants,index){
 const {scale=1}=participants[index];
 const position=groupMark(place,sceneGroupLayout(place,participants.length,index),participants[index]);
 // Keep the child's smaller scale at the same foot baseline as their parent.
 // Wheelchairs already occupy a full calibrated sprite and are not miniaturised.
 return {...position,width:position.width*scale,labelSpace:100};
}
