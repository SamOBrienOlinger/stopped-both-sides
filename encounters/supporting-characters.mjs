// Dedicated story participants stay separate from the selectable public
// avatars. Both sprites share a transparent atlas and the same foot baseline.
const src=new URL('../assets/characters/discrimination-support-20261122.webp',import.meta.url).href;
const stewardSrc=size=>new URL('../assets/characters/ticket-steward-'+size+'.webp',import.meta.url).href;
const artwork=(left,crop)=>({src,width:1774,height:887,
 style:`left:${left}%;top:0%;width:200%;height:100%;clip-path:inset(${crop})`});
export const supportingCharacters={
 // Authored staff role: a white adult man with brown hair and a yellow STAFF jacket.
 // This identity and uniform must never be replaced by a selectable public avatar.
 'support-ticket-steward':{
  id:'support-ticket-steward',name:'Ticket steward',role:'public',adult:true,labelOnly:true,
  sceneArtwork:{src:stewardSrc(768),srcset:stewardSrc(384)+' 384w, '+stewardSrc(768)+' 768w',
   width:768,height:768,style:'left:0;top:0;width:100%;height:100%'}
 },
 'support-child':{
  id:'support-child',name:'Child',role:'public',age:7,
  sceneArtwork:artwork(-1.6347237880496054,'0% 50% 0% 0%')
 },
 'support-race-adult':{
  id:'support-race-adult',name:'Adult at the bus stop',role:'public',adult:true,
  props:['backpack'],
  sceneArtwork:artwork(-99.5490417136415,'0% 0% 0% 50%')
 }
};
