// Measured source-cell boundaries preserve full feet and wheels even where the
// generated atlas does not follow an exact equal-height grid. Crop the source
// image with CSS, then align each complete silhouette to one common floor.
const width=1774,height=887,frame=320,foot=312;
const cells=[[0,0,296,302,160.0,297],[296,0,591,302,444.5,296],[591,0,887,302,736.5,296],[887,0,1183,302,1035.0,296],[1183,0,1478,302,1330.0,296],[1478,0,1774,302,1624.0,296],[0,302,296,591,161.0,585],[296,302,591,591,444.5,584],[591,302,887,591,734.5,591],[887,302,1183,591,1033.5,584],[1183,302,1478,591,1329.5,584],[1478,302,1774,591,1624.0,584],[0,591,296,887,164.5,874],[296,591,591,887,443.5,874],[591,591,887,887,733.5,878],[887,591,1183,887,1034.5,873],[1183,591,1478,887,1330.0,874],[1478,591,1774,887,1624.0,874]];
export function sceneCharacterArtwork(character){
 const [left,top,right,bottom,centre,feet]=cells[character.row*6+character.column];
 return {
  src:new URL('../assets/scenes/contextual-cast.webp?v=context-scenes-1',import.meta.url).href,
  width,height,
  style:`left:${-(centre-frame/2)/frame*100}%;top:${-(feet-foot)/frame*100}%;width:${width/frame*100}%;height:${height/frame*100}%;clip-path:inset(${top/height*100}% ${(width-right)/width*100}% ${(height-bottom)/height*100}% ${left/width*100}%)`
 };
}
