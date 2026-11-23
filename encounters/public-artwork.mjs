// Nia is an additional selectable public character, with her own transparent
// source image. The original nine public sprites and their saved IDs stay intact.
// Align the measured soles to the same 97.5% floor used by the existing atlases.
const width=1254,height=1254,frame=1300,centre=627,feet=1222,foot=frame*.975;
export function publicArtwork(character){
 if(character?.id!=='public-10')return null;
 return {
  src:new URL('../assets/characters/nia-public-20261123.png?v=nia-public-20261123',import.meta.url).href,
  width,height,
  style:`left:${-(centre-frame/2)/frame*100}%;top:${-(feet-foot)/frame*100}%;width:${width/frame*100}%;height:${height/frame*100}%;clip-path:inset(0%)`
 };
}
