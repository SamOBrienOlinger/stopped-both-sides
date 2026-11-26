// Transparent square sprite frames may overlap while the visible people do not.
// Measure the actually painted alpha inside each production CSS crop so this
// check protects silhouettes, wheels and badges rather than empty atlas padding.
export function discriminationSpacingErrors(elements,ids){
 const errors=[],silhouettes=new Map();
 function silhouette(actor){
  const frame=actor.querySelector('.scene-sprite').getBoundingClientRect();
  const image=actor.querySelector('.scene-sprite img'),box=image.getBoundingClientRect();
  const clip=getComputedStyle(image).clipPath;
  const key=image.src+'|'+image.getAttribute('style');
  if(!silhouettes.has(key)){
   if(!image.complete||!image.naturalWidth)throw Error('Sprite is not loaded');
   const canvas=document.createElement('canvas');canvas.width=canvas.height=320;
   const context=canvas.getContext('2d',{willReadFrequently:true});
   const x=(box.left-frame.left)/frame.width*320,y=(box.top-frame.top)/frame.height*320;
   const width=box.width/frame.width*320,height=box.height/frame.height*320;
   // Dedicated square figures declare a full-frame source rather than an atlas
   // crop. Measure their painted alpha exactly like a zero-inset atlas cell.
   const standalone=(actor.dataset.sceneCharacter.startsWith('story-')||actor.dataset.sceneCharacter==='support-ticket-steward')&&
    image.naturalWidth===image.naturalHeight&&image.style.width==='100%'&&image.style.height==='100%'&&
    parseFloat(image.style.left)===0&&parseFloat(image.style.top)===0;
   const values=clip==='none'&&standalone?[0]:
    clip.match(/inset\(([^)]+)\)/)?.[1].trim().split(/\s+/).map(value=>parseFloat(value)/100);
   if(!values||!values.length||values.length>4)throw Error('Missing measured sprite crop');
   const [top,right=top,bottom=top,left=right]=values;
   context.beginPath();context.rect(x+width*left,y+height*top,width*(1-left-right),height*(1-top-bottom));context.clip();
   context.drawImage(image,x,y,width,height);
   const pixels=context.getImageData(0,0,320,320).data;
   let leftInk=320,rightInk=-1,topInk=320,bottomInk=-1;
   for(let cy=0;cy<320;cy++)for(let cx=0;cx<320;cx++)if(pixels[(cy*320+cx)*4+3]>100){
    leftInk=Math.min(leftInk,cx);rightInk=Math.max(rightInk,cx+1);
    topInk=Math.min(topInk,cy);bottomInk=Math.max(bottomInk,cy+1);
   }
   if(rightInk<0)throw Error('Empty character silhouette');
   silhouettes.set(key,{left:leftInk/320,right:rightInk/320,top:topInk/320,bottom:bottomInk/320});
  }
  const ink=silhouettes.get(key);
  return {left:frame.left+ink.left*frame.width,right:frame.left+ink.right*frame.width,top:frame.top+ink.top*frame.height,bottom:frame.top+ink.bottom*frame.height};
 }
 for(const [index,location] of elements.entries()){
  const id=ids[index];
  if(!id.startsWith('discrimination-'))continue;
  const bounds=location.getBoundingClientRect();
  const people=[...location.querySelectorAll('.scene-actor')].map(actor=>{
   const frame=actor.getBoundingClientRect();
   const badge=actor.querySelector('.scene-person-number')?.getBoundingClientRect();
   let ink;
   try{ink=silhouette(actor);}catch(error){errors.push(id+': '+actor.dataset.sceneRole+' '+error.message);ink=frame;}
   if(ink.left<bounds.left-.5||ink.right>bounds.right+.5||ink.top<bounds.top-.5||ink.bottom>bounds.bottom+.5){
    errors.push(id+': clipped silhouette for '+actor.dataset.sceneRole);
   }
   if(badge&&(badge.left<bounds.left-.5||badge.right>bounds.right+.5||badge.top<bounds.top-.5||badge.bottom>bounds.bottom+.5)){
    errors.push(id+': clipped badge for '+actor.dataset.sceneRole);
   }
   if(badge&&(badge.bottom>frame.top+.5||Math.abs(badge.left+badge.width/2-frame.left-frame.width/2)>1)){
    errors.push(id+': badge is not above its figure for '+actor.dataset.sceneRole);
   }
   return {role:actor.dataset.sceneRole,left:Math.min(ink.left,badge?.left??ink.left),right:Math.max(ink.right,badge?.right??ink.right)};
  }).sort((a,b)=>a.left-b.left);
  for(let i=1;i<people.length;i++){
   const previous=people[i-1],next=people[i];
   const gap=next.left-previous.right;
   if(gap<bounds.width*.01-.5)errors.push(id+': '+previous.role+' and '+next.role+' have '+gap.toFixed(1)+'px of visible space');
  }
 }
 return errors;
}
