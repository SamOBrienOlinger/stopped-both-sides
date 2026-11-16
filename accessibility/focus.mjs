export function focusControl(element) {
 if(!element)return false;
 element.focus?.({preventScroll:true});
 const box=element.getBoundingClientRect?.();
 if(!box)return true;
 const header=document.querySelector('.header')?.getBoundingClientRect?.();
 const top=Math.max(header?.bottom||0,0)+12;
 if(box.top<top||box.bottom>window.innerHeight-12){
  window.scrollBy?.({top:box.top-top,behavior:'instant'});
 }
 return true;
}
