function headerOcclusion() {
 const header=document.querySelector('.header');
 const position=header&&globalThis.getComputedStyle?.(header)?.position;
 // A header in normal flow scrolls away rather than covering the content.
 return header&&(!position||position==='sticky'||position==='-webkit-sticky'||position==='fixed')
  ?Math.max(header.getBoundingClientRect?.()?.bottom||0,0):0;
}

export function focusControl(element) {
 if(!element)return false;
 element.focus?.({preventScroll:true});
 const box=element.getBoundingClientRect?.();
 if(!box)return true;
 const top=headerOcclusion()+12;
 if(box.top<top||box.bottom>window.innerHeight-12){
  window.scrollBy?.({top:box.top-top,behavior:'instant'});
 }
 return true;
}

// A new page starts at the document top. The header stays in normal
// flow, so scrolling a later heading is not a substitute for exposing it all.
export function focusPageStart(main,{focus=true}={}) {
 if(!main)return false;
 if(focus)(main.querySelector?.('h1')||main).focus?.({preventScroll:true});
 window.scrollTo?.({top:0,left:0,behavior:'instant'});
 return true;
}

// Returning to a card must restore its context as well as its action. When
// enlarged text makes those too far apart, focus the visible heading instead;
// the next native Tab then reaches the card's action in document order.
export function focusContext(control,context) {
 if(!control)return false;
 const heading=context?.querySelector?.(':scope > h1,:scope > h2,:scope > h3');
 if(!heading)return focusControl(control);
 const top=headerOcclusion()+12,bottom=window.innerHeight-12,available=bottom-top;
 const selection=()=>{
  const bounds=context?.getBoundingClientRect?.();
  const action=control.getBoundingClientRect?.(),title=heading.getBoundingClientRect?.();
  if(!bounds||!action||!title)return null;
  if(bounds.height<=available)return {target:control,range:bounds};
  const span={top:Math.min(title.top,action.top),bottom:Math.max(title.bottom,action.bottom)};
  return span.bottom-span.top<=available?{target:control,range:span}:{target:heading,range:title};
 };
 const focus=target=>{
  if(target===heading&&!heading.hasAttribute?.('tabindex')){
    heading.setAttribute?.('tabindex','-1');
    heading.addEventListener?.('blur',()=>{
     if(heading.getAttribute?.('tabindex')==='-1')heading.removeAttribute?.('tabindex');
    },{once:true});
  }
  target.focus?.({preventScroll:true});
 };
 let chosen=selection();
 if(!chosen)return focusControl(control);
 focus(chosen.target);
 // Focus settles owned heading transforms synchronously. Recheck both the
 // fit and the coordinates so the formerly moving title cannot be clipped.
 const settled=selection();
 if(!settled)return true;
 if(settled.target!==chosen.target)focus(settled.target);
 chosen=selection()||settled;
 const {target,range}=chosen;
 const delta=target===heading||range.top<top?range.top-top:
  range.bottom>bottom?range.bottom-bottom:0;
 if(delta)window.scrollBy?.({top:delta,behavior:'instant'});
 return true;
}
