export function discriminationSpacingErrors(elements,ids){
 const errors=[];
 for(const [index,location] of elements.entries()){
  const id=ids[index];
  if(!id.startsWith('discrimination-'))continue;
  const bounds=location.getBoundingClientRect();
  const people=[...location.querySelectorAll('.scene-actor')].map(actor=>{
   const frame=actor.getBoundingClientRect();
   const badge=actor.querySelector('.scene-person-number')?.getBoundingClientRect();
   if(badge&&(badge.left<bounds.left-.5||badge.right>bounds.right+.5||badge.top<bounds.top-.5||badge.bottom>bounds.bottom+.5)){
    errors.push(id+': clipped badge for '+actor.dataset.sceneRole);
   }
   if(badge&&(badge.bottom>frame.top+.5||Math.abs(badge.left+badge.width/2-frame.left-frame.width/2)>1)){
    errors.push(id+': badge is not above its figure for '+actor.dataset.sceneRole);
   }
   return {
    role:actor.dataset.sceneRole,
    left:Math.min(frame.left,badge?.left??frame.left),
    right:Math.max(frame.right,badge?.right??frame.right)
   };
  }).sort((a,b)=>a.left-b.left);
  for(let i=1;i<people.length;i++){
   const previous=people[i-1],next=people[i];
   const gap=next.left-previous.right;
   if(gap<bounds.width*.01-.5)errors.push(id+': '+previous.role+' and '+next.role+' have '+gap.toFixed(1)+'px of space');
  }
 }
 return errors;
}
