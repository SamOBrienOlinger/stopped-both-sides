import {expect} from '@playwright/test';

// A child can be opaque yet still fade or rise with a parent. Observe both
// the title and its ancestors across rendered frames, without waiting for a
// formerly hidden heading or an entrance animation to settle first.
export async function expectStaticHeadings(headings,label){
 expect(await headings.count(),label+' exists').toBeGreaterThan(0);
 const issues=await headings.evaluateAll(async elements=>{
  const issues=[];
  for(let frame=0;frame<12;frame++){
   for(const heading of elements){
    if(!heading.getClientRects().length)continue;
    const title=heading.textContent.trim().slice(0,90);
    for(let element=heading;element;element=element.parentElement){
     const style=getComputedStyle(element);
     const moving=element.getAnimations().filter(animation=>!['finished','idle'].includes(animation.playState))
      .some(animation=>animation.effect?.getKeyframes().some(keyframe=>
       ['opacity','transform','translate','scale','rotate'].some(property=>property in keyframe)));
     if(style.opacity!=='1'||style.transform!=='none'||moving||
      (element===heading&&(element.hasAttribute('data-heading-pending')||element.hasAttribute('data-heading-motion')))){
      issues.push({frame,title,element:element.id||element.className||element.tagName,
       opacity:style.opacity,transform:style.transform,moving});
     }
    }
   }
   await new Promise(requestAnimationFrame);
  }
  return issues;
 });
 expect(issues,label+' is immediately visible and has no heading or ancestor fade/rise').toEqual([]);
}
