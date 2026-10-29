import {expect} from '@playwright/test';

// Measure real text/media, not scrollWidth: decorative pseudo-elements and
// entrance effects can enlarge a control's scroll area without clipping it.
export async function expectControlsFit(page,label){
 await expect.poll(()=>page.evaluate(()=>{
  const tolerance=2;
  const hidden=element=>{
   for(let current=element;current;current=current.parentElement){
    const style=getComputedStyle(current);
    if(current.hidden||current.inert||current.matches('.sr-only,.visually-hidden')||
      style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse')return true;
    // Closed details can retain layout boxes for their unpainted contents.
    // Only the first summary (and its descendants) remains interactive.
    if(current.matches('details:not([open])')){
     const summary=[...current.children].find(child=>child.tagName==='SUMMARY');
     if(!summary?.contains(element))return true;
    }
   }
   return false;
  };
  const visible=element=>{
   const box=element.getBoundingClientRect();
   return !hidden(element)&&element.getClientRects().length>0&&box.width>0&&box.height>0;
  };
  // Controls behind an open modal are deliberately covered and inactive.
  const scope=[...document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')].find(visible)||document;
  const selector='button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"],a.primary,a.text-button,a.site-switch,a.settings-button,.header a,select';
  const targets=[...scope.querySelectorAll(selector)].filter(visible);
  const controls=[...new Set([...targets,...scope.querySelectorAll('summary')])].filter(visible);
  const describe=element=>({element:element.tagName.toLowerCase()+(element.id?'#'+element.id:''),text:(element.innerText||element.value||element.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,90)});
  const textRects=element=>{
   const result=[],walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
   for(let node=walker.nextNode();node;node=walker.nextNode()){
    const start=node.textContent.search(/\S/);
    if(start<0||hidden(node.parentElement))continue;
    const range=document.createRange();
    range.setStart(node,start);range.setEnd(node,node.textContent.trimEnd().length);
    for(const box of range.getClientRects())if(box.width>0&&box.height>0)result.push({box,parent:node.parentElement});
   }
   return result;
  };
  const clipped=[];
  for(const control of controls){
   // A native select's option popup and text metrics belong to the browser.
   if(control.matches('select,input'))continue;
   // Character artwork intentionally crops a large sprite sheet in its frame.
   const media=[...control.querySelectorAll('img,svg')].filter(element=>visible(element)&&!element.closest('.character-image,.scene-stage'));
   const content=[...textRects(control),...media.map(element=>({box:element.getBoundingClientRect(),parent:element.parentElement}))];
   const axes=new Set();
   for(const {box,parent} of content){
    for(let ancestor=parent;ancestor;ancestor=ancestor.parentElement){
     const bounds=ancestor.getBoundingClientRect(),style=getComputedStyle(ancestor);
     const horizontal=ancestor===control||/^(hidden|clip|auto|scroll)$/.test(style.overflowX);
     const vertical=ancestor===control||/^(hidden|clip|auto|scroll)$/.test(style.overflowY);
     if(horizontal&&(box.left<bounds.left-tolerance||box.right>bounds.right+tolerance))axes.add('horizontal');
     if(vertical&&(box.top<bounds.top-tolerance||box.bottom>bounds.bottom+tolerance))axes.add('vertical');
     if(ancestor===control)break;
    }
   }
   if(axes.size)clipped.push({...describe(control),axes:[...axes]});
  }
  const undersized=targets.flatMap(element=>{
   const box=element.getBoundingClientRect();
   // Small fractional differences can come from CSS transforms/font rounding.
   return box.width<43.5||box.height<43.5?[{...describe(element),width:box.width,height:box.height}]:[];
  });
  const overlaps=[];
  // A compact menu can scroll independently. Its off-screen link boxes still
  // exist, but overflow clipping prevents them covering adjacent controls.
  const paintedBounds=element=>{
   const rect=element.getBoundingClientRect();
   const box={left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom};
   for(let parent=element.parentElement;parent;parent=parent.parentElement){
    const style=getComputedStyle(parent),clip=parent.getBoundingClientRect();
    if(/^(hidden|clip|auto|scroll)$/.test(style.overflowX)){
     box.left=Math.max(box.left,clip.left);box.right=Math.min(box.right,clip.right);
    }
    if(/^(hidden|clip|auto|scroll)$/.test(style.overflowY)){
     box.top=Math.max(box.top,clip.top);box.bottom=Math.min(box.bottom,clip.bottom);
    }
   }
   return box;
  };
  for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){
   const first=targets[i],second=targets[j];
   if(first.contains(second)||second.contains(first))continue;
   const a=paintedBounds(first),b=paintedBounds(second);
   if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>tolerance&&
     Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>tolerance)overlaps.push([describe(first),describe(second)]);
  }
  const misplacedBadges=[];
  for(const choice of [...scope.querySelectorAll('.choice')].filter(visible)){
   const badge=choice.querySelector('.choice-letter');
   const copy=[...choice.children].find(element=>element!==badge);
   if(!badge||!copy||!visible(badge))continue;
   const lines=textRects(copy).filter(({parent})=>!parent.closest('.choice-selected')).map(({box})=>box);
   const firstLine=lines[0];
   if(!firstLine||!lines.some(box=>box.top>firstLine.top+firstLine.height/2))continue;
   const box=badge.getBoundingClientRect();
   // A multiline answer's badge should meet its first line, not its middle.
   if(box.top>firstLine.bottom+tolerance||box.bottom<firstLine.top-tolerance)misplacedBadges.push(describe(choice));
  }
  return {clipped,undersized,overlaps,misplacedBadges};
 }),{message:label+' has readable, separated controls',timeout:2500,intervals:[100,250,500]}).toEqual({clipped:[],undersized:[],overlaps:[],misplacedBadges:[]});
}
