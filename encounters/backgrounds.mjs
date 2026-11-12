// Approved artwork only. The images are decorative and do not change scenario facts.
// Keep full compositions: background people must not be cropped or mirrored.
const names={public:'liffey-bridge',garda:'gpo-city',street:'suburban-street','bus-stop':'bus-stop',square:'quayside'};
export const approvedBackgrounds=Object.freeze({...names});
export function backgroundImage(key){
 const name=names[key];
 if(!name)return null;
 const url=width=>new URL(`../assets/dublin-approved/${name}-${width}.webp?v=approved-dublin-2`,import.meta.url).href;
 return {name,src:url(960),srcset:[480,960,1600].map(width=>`${url(width)} ${width}w`).join(', '),width:1600,height:900};
}
