// Measurements from the final 1254x1254 transparent Garda baseball-cap atlas.
// Each source cell: [left, top, right, bottom, face-centre-x, soles-y].
// Values are derived from visible alpha bounds and retain hats, hair and boots.
export const gardaAtlas=Object.freeze({
 width:1254,height:1254,frame:426,foot:415.35,
 cells:Object.freeze([
  [0,0,418,418,231,412],       // Ciara
  [418,0,836,418,627,412],     // Rory
  [836,0,1254,418,1024.5,412],// Jamie
  [0,418,418,836,229.5,820],  // Lee
  [418,418,836,836,628,820],  // Aisling
  [836,418,1254,836,1028.5,820],// Kai
  [0,836,418,1254,230,1237],  // Conor
  [418,836,836,1254,627,1237],// Orla
  [836,836,1254,1254,1025.5,1237]// Charlie
 ])
});
