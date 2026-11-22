export function measureLocations(elements){
 return elements.map(location=>{
  const panel=location.getBoundingClientRect();
  const figure=location.closest('[data-scene-id]');
  const preview=location.closest('[data-review-preview]');
  const background=location.querySelector('.scene-backdrop');
  const actors=[...location.querySelectorAll('.scene-actor')].map(actor=>{
   const box=actor.getBoundingClientRect(),sprite=actor.querySelector('.scene-sprite img'),art=sprite.getBoundingClientRect();
   return {
    role:actor.dataset.sceneRole,character:actor.dataset.sceneCharacter,
    x:(box.left+box.width/2-panel.left)/panel.width,
    width:box.width/panel.width,height:box.height/panel.height,
    floor:(panel.bottom-box.bottom)/panel.height,
    overflow:Math.max(panel.left-box.left,box.right-panel.right,panel.top-box.top,box.bottom-panel.bottom),
    distortion:Math.abs(art.width/art.height-sprite.naturalWidth/sprite.naturalHeight),
    cropped:getComputedStyle(sprite).clipPath.startsWith('inset(')
   };
  });
  return {id:preview?.dataset.reviewPreview||figure.dataset.sceneId,preview:!!preview,
   place:location.dataset.scenePlace,asset:new URL(background.currentSrc).pathname.replace(/-\d+\.webp$/,'.webp'),
   panelWidth:panel.width,ratio:panel.width/panel.height,
   group:!!figure?.dataset.castLayout||!!location.dataset.groupArt,
   actors};
 });
}
