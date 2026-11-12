import {gardaAtlas} from './garda-atlas.mjs?v=garda-uniforms-20261112';

// The same calm figure follows each Garda through selection, play and recap.
// A separate atlas leaves the public characters and saved cast IDs unchanged.
export function gardaArtwork(character){
 const match=/^garda-([1-9])$/.exec(character?.id);
 if(!match)return null;
 const {width,height,frame,foot,cells}=gardaAtlas;
 const [left,top,right,bottom,centre,feet]=cells[Number(match[1])-1];
 return {
  src:new URL('../assets/characters/garda-uniforms-2026.webp',import.meta.url).href,
  width,height,
  style:`left:${-(centre-frame/2)/frame*100}%;top:${-(feet-foot)/frame*100}%;width:${width/frame*100}%;height:${height/frame*100}%;clip-path:inset(${top/height*100}% ${(width-right)/width*100}% ${(height-bottom)/height*100}% ${left/width*100}%)`
 };
}
