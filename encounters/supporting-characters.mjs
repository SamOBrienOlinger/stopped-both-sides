// Dedicated story participants stay separate from the nine selectable public
// avatars. Both sprites share a transparent atlas and the same foot baseline.
const src=new URL('../assets/characters/discrimination-support-20261122.png',import.meta.url).href;
const artwork=(left,crop)=>({src,width:1774,height:887,
 style:`left:${left}%;top:0%;width:200%;height:100%;clip-path:inset(${crop})`});
export const supportingCharacters={
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
