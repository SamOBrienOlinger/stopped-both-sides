import {gardaAtlas} from './garda-atlas.mjs?v=garda-baseball-20261114';

// One production image source for all nine Garda characters, in every context.
// The public-character atlas is untouched. Garda text and crests are never mirrored.
export function gardaArtwork(character){
 const match=/^garda-([1-9])$/.exec(character?.id||'');
 if(!match)return null;
 const {width,height,frame,foot,cells}=gardaAtlas;
 const [left,top,right,bottom,centre,feet]=cells[Number(match[1])-1];
 return {
  src:new URL('../assets/characters/garda-baseball-2026.webp?v=garda-baseball-20261114',import.meta.url).href,
  width,height,
  style:`left:${-(centre-frame/2)/frame*100}%;top:${-(feet-foot)/frame*100}%;width:${width/frame*100}%;height:${height/frame*100}%;clip-path:inset(${top/height*100}% ${(width-right)/width*100}% ${(height-bottom)/height*100}% ${left/width*100}%)`
 };
}
