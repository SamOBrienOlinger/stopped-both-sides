// Outdoor group scenes have a clear foreground for the numbered cast.
const names={public:'liffey-bridge',garda:'gpo-city',street:'suburban-street','bus-stop':'bus-stop',square:'quayside'};
export const approvedBackgrounds=Object.freeze({...names});
export function backgroundImage(key,{group=false}={}){
 const footballGround=key==='football-ground';
 const name=footballGround?key:names[key];
 if(!name)return null;
 const groupScene=footballGround||(group&&['street','bus-stop','square'].includes(key));
 const directory=groupScene?'scenes/groups':'dublin-approved';
 const revision=groupScene?'group-spacing-20261122':name==='bus-stop'?'bus-harp-midpoint-20261120':'quayside-lamps-1';
 const url=width=>new URL(`../assets/${directory}/${name}-${width}.webp?v=${revision}`,import.meta.url).href;
 return {name,group:groupScene,src:url(960),srcset:[480,960,1600].map(width=>`${url(width)} ${width}w`).join(', '),width:1600,height:900};
}
