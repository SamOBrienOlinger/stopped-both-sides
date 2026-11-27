import {gardaAtlas} from './garda-atlas.mjs?v=learning-language-20261120';

// Each uniform is exported at the original cell resolution. Preserve the
// measured face and foot anchors when positioning the individual image.
export function gardaArtwork(character){
 const match=/^garda-([1-9])$/.exec(character?.id||'');
 if(!match)return null;
 const {frame,foot,cells}=gardaAtlas;
 const [left,top,right,bottom,centre,feet]=cells[Number(match[1])-1];
 const width=right-left,height=bottom-top;
 return {
  src:new URL('../assets/characters/garda-uniforms/'+character.id+'.webp',import.meta.url).href,
  width,height,
  style:`left:${(left-centre+frame/2)/frame*100}%;top:${(top-feet+foot)/frame*100}%;width:${width/frame*100}%;height:${height/frame*100}%;clip-path:inset(0%)`
 };
}
