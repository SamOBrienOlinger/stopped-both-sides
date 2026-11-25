// Every situation uses a clear foreground for its separately rendered cast.
// Homepage heroes retain their approved illustrations with background people.
const names={public:'liffey-bridge',garda:'gpo-city',street:'suburban-street','bus-stop':'bus-stop',square:'quayside'};
const situationLocations=new Set(['bicycle-workshop','exhibition-entrance','community-fair','food-festival','community-hall','closed-shop','flat-entrance']);
export const approvedBackgrounds=Object.freeze({...names});
function responsiveBackground(directory,name,revision){
 const url=width=>new URL(`../assets/${directory}/${name}-${width}.webp?v=${revision}`,import.meta.url).href;
 return {src:url(960),srcset:[480,960,1600].map(width=>`${url(width)} ${width}w`).join(', '),width:1600,height:900};
}
export function interiorBackground(place){
 if(place==='station')return responsiveBackground('scenes','station','public-enquiry-20261125');
 return {src:new URL(`../assets/scenes/${place}.webp?v=irish-streetlights-1`,import.meta.url).href,width:place==='meeting-room'?678:679,height:380};
}
export function backgroundImage(key,{group=false}={}){
 const situationLocation=situationLocations.has(key);
 const footballGround=key==='football-ground';
 const name=situationLocation||footballGround?key:names[key];
 if(!name)return null;
 const sharedExterior=['street','bus-stop','square'].includes(key);
 const groupScene=footballGround||(group&&(situationLocation||sharedExterior));
 const directory=situationLocation?'scenes/locations':footballGround||sharedExterior?'scenes/groups':'dublin-approved';
 const revision=situationLocation||key==='bus-stop'?'situation-locations-20261122':footballGround||sharedExterior?'group-spacing-20261122':'quayside-lamps-1';
 return {name,group:groupScene,...responsiveBackground(directory,name,revision)};
}
