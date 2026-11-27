import {createHash} from 'node:crypto';
import {encounters,roles} from '../../encounters/catalog.mjs';
import {characters} from '../../encounters/characters.mjs';
import {startEncounter,answer,continueEncounter,switchRole} from '../../encounters/engine.mjs';
import {renderScene,renderScenePreview} from '../../encounters/scenes.mjs';

// Enumerate requested casts before deduplication: an invisible saved portrait
// can reserve a supporting character, so deduplicating the two lead IDs loses
// real compositions. Signatures describe every painted layer and its CSS crop.
function reachable(id){
 const queue=[startEncounter(id)],seen=new Map();
 while(queue.length){
  const state=queue.shift();
  if(state.complete||seen.has(state.nodeId))continue;
  seen.set(state.nodeId,state);
  for(const role of roles)for(let i=0;i<encounters[id].nodes[state.nodeId].views[role].choices.length;i++){
   queue.push(continueEncounter(answer(switchRole(state,role),i)));
  }
 }
 if(seen.size!==Object.keys(encounters[id].nodes).length)throw Error('Unreachable scene grounding stage: '+id);
 return [...seen.values()];
}

function tree(html){
 const root={tag:'root',attrs:{},children:[]},stack=[root];
 const voids=new Set(['img','br','hr','input','meta','link']);
 for(const match of html.matchAll(/<(\/)?([a-z][a-z0-9-]*)\b([^>]*)>/g)){
  const [,close,tag,attributes]=match;
  if(close){while(stack.length>1){if(stack.pop().tag===tag)break;}}
  else{
   const node={tag,attrs:Object.fromEntries([...attributes.matchAll(/([\w:-]+)="([^"]*)"/g)].map(value=>[value[1],value[2]])),children:[]};
   stack.at(-1).children.push(node);if(!voids.has(tag))stack.push(node);
  }
 }
 return root;
}
const descendants=(node,predicate)=>node.children.flatMap(child=>[...(predicate(child)?[child]:[]),...descendants(child,predicate)]);
const hasClass=(node,name)=>(node.attrs.class||'').split(/\s+/).includes(name);
const asset=src=>src?new URL(src).pathname.split('/assets/').at(-1):null;
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,16);

export function sceneDescription(html,surface){
 const root=tree(html),scene=descendants(root,node=>hasClass(node,'encounter-scene'))[0];
 return {surface,mode:scene?.attrs['data-scene-mode']||'preview',locations:descendants(root,node=>hasClass(node,'scene-location')).map(location=>({
  place:location.attrs['data-scene-place'],classes:location.attrs.class,
  background:asset(location.children.find(node=>hasClass(node,'scene-backdrop'))?.attrs.src),
  actors:location.children.filter(node=>hasClass(node,'scene-actor')).map(actor=>{
   const image=descendants(actor,node=>node.tag==='img')[0];
   return {role:actor.attrs['data-scene-role'],anchor:actor.attrs.style,source:asset(image.attrs.src),crop:image.attrs.style,badge:actor.children.some(node=>hasClass(node,'scene-person-number'))};
  }),
  props:location.children.filter(node=>hasClass(node,'scene-story-prop')||hasClass(node,'scene-exchange-object')).map(prop=>({
   kind:prop.attrs['data-story-prop']||prop.attrs['data-scene-object'],owner:prop.attrs['data-prop-owner']||prop.attrs['data-held-by'],source:asset(prop.attrs.src),style:prop.attrs.style
  }))
 }))};
}

let matrix;
export function buildSceneGroundingMatrix(){
 if(matrix)return matrix;
 const stages=Object.keys(encounters).flatMap(reachable);
 const pairs=characters.public.flatMap(person=>characters.garda.map(officer=>({public:person.id,garda:officer.id})));
 const cases=[],bySignature=new Map(),stageInputs=[],previewInputs=[];
 function add(state,surface){
  const html=surface==='preview'?renderScenePreview(state.id,{cast:state.cast,authored:state.authored}):renderScene(state,{compact:surface==='compact'});
  const description=sceneDescription(html,surface),signature=hash(description);
  if(!bySignature.has(signature)){
   const structure=hash({...description,locations:description.locations.map(location=>({...location,actors:location.actors.map(({source,crop,...actor})=>actor)}))});
   const item={index:cases.length,signature,structure,surface,state,description,inputCount:0};
   bySignature.set(signature,item);cases.push(item);
  }
  const item=bySignature.get(signature);item.inputCount++;return item.index;
 }
 for(const [stageIndex,base] of stages.entries())for(const [pairIndex,requested] of pairs.entries())for(const authored of [false,true]){
  const normalized=startEncounter(base.id,'public',{cast:requested,authored});
  const state={...base,cast:normalized.cast,authored};
  stageInputs.push([stageIndex,pairIndex,Number(authored),add(state,'stage'),add(state,'compact')]);
  if(base.nodeId===encounters[base.id].start)previewInputs.push([stageIndex,pairIndex,Number(authored),add(state,'preview')]);
 }
 matrix={stages,pairs,cases,stageInputs,previewInputs};
 return matrix;
}

// Every structural layout plus every source/crop in its smallest and largest
// actor frame. This includes Jo's wheels, Nia's dedicated art, Rory's wide
// speaking pose, child/comparison art and reserved supporting portraits.
export function representativeScenes(cases){
 const chosen=new Map(),structures=new Set(),extremes=new Map();
 for(const item of cases){
  if(!structures.has(item.structure)){structures.add(item.structure);chosen.set(item.index,item);}
  for(const location of item.description.locations)for(const actor of location.actors){
   const key=actor.source+'|'+actor.crop;
   const width=Number(actor.anchor.match(/--scene-width:([\d.]+)%/)?.[1]);
   const entry=extremes.get(key)||{};
   if(!entry.min||width<entry.min.width)entry.min={item,width};
   if(!entry.max||width>entry.max.width)entry.max={item,width};
   extremes.set(key,entry);
  }
 }
 for(const {min,max} of extremes.values())for(const value of [min,max])chosen.set(value.item.index,value.item);
 return [...chosen.values()].sort((a,b)=>a.index-b.index);
}

export function groundingCoverage(data){
 const surfaces=Object.fromEntries(['stage','compact','preview'].map(surface=>[surface,data.cases.filter(item=>item.surface===surface).length]));
 return {
  note:'Each input is [stage index, requested pair index, authored 0/1, full case index, compact case index]; preview inputs end with the preview case index. Dedupe includes supporting cast, pose, props and CSS anchors.',
  stageCount:data.stages.length,requestedPairCount:data.pairs.length,authoredModes:[false,true],
  logicalRenderCount:data.stageInputs.length*2+data.previewInputs.length,distinctCompositionCount:data.cases.length,surfaces,
  stages:data.stages.map(state=>state.id+'/'+state.nodeId),requestedPairs:data.pairs,
  cases:data.cases.map(({index,signature,structure,surface,state,inputCount})=>({index,signature,structure,surface,id:state.id,node:state.nodeId,normalizedCast:state.cast,authored:state.authored,inputCount})),
  stageInputs:data.stageInputs,previewInputs:data.previewInputs
 };
}

// Executed in the browser with the production DOM and decoded production
// images. No production anchor table participates in these measurements.
export function measureSceneGrounding(elements,{surfaces,landing=false}={}){
 const SIZE=512,PAD=64,ALPHA=100,CSS_EDGE=.5,SOURCE_EDGE=2;
 const cache=window.__sceneGroundingAlpha||(window.__sceneGroundingAlpha=new Map());
 const errors=[],measurements=[];
 const rect=element=>{
  const box=element.getBoundingClientRect();
  return {left:box.left,top:box.top,right:box.right,bottom:box.bottom,width:box.width,height:box.height};
 };
 const overlap=(a,b)=>({left:Math.max(a.left,b.left),right:Math.min(a.right,b.right),top:Math.max(a.top,b.top),bottom:Math.min(a.bottom,b.bottom)});
 const outside=(inner,outer,tolerance=CSS_EDGE)=>inner.left<outer.left-tolerance||inner.right>outer.right+tolerance||inner.top<outer.top-tolerance||inner.bottom>outer.bottom+tolerance;
 const sourceName=image=>new URL(image.currentSrc||image.src).pathname.split('/assets/').at(-1);
 const rounded=value=>Math.round(value*1000000)/1000000;
 function position(value,axis){
  if(value==='left'||value==='top')return 0;if(value==='right'||value==='bottom')return 1;if(value==='center')return .5;
  if(value?.endsWith('%'))return parseFloat(value)/100;
  if(value==='0px'||value==='0')return 0;
  throw Error('Unsupported '+axis+' object-position: '+value);
 }
 function imagePaint(image){
  if(!image.complete||!image.naturalWidth)throw Error('Image is not decoded: '+image.src);
  const box=rect(image),style=getComputedStyle(image),fit=style.objectFit;
  const width=image.naturalWidth,height=image.naturalHeight;
  let paintWidth=box.width,paintHeight=box.height;
  if(fit==='cover'||fit==='contain'||fit==='scale-down'){
   let scale=(fit==='cover'?Math.max:Math.min)(box.width/width,box.height/height);
   if(fit==='scale-down')scale=Math.min(1,scale);
   paintWidth=width*scale;paintHeight=height*scale;
  }else if(fit==='none'){paintWidth=width;paintHeight=height;}
  const parts=style.objectPosition.trim().split(/\s+/);
  const x=position(parts[0],'horizontal'),y=position(parts[1]||'50%','vertical');
  return {left:box.left+(box.width-paintWidth)*x,top:box.top+(box.height-paintHeight)*y,width:paintWidth,height:paintHeight,right:box.left+(box.width-paintWidth)*x+paintWidth,bottom:box.top+(box.height-paintHeight)*y+paintHeight,box,style};
 }
 function cropInsets(value,box){
  if(value==='none')return [0,0,0,0];
  const match=value.match(/^inset\(([^)]+)\)$/);
  if(!match||match[1].includes('round'))throw Error('Unsupported character crop: '+value);
  const tokens=match[1].trim().split(/\s+/);
  const four=tokens.length===1?[tokens[0],tokens[0],tokens[0],tokens[0]]:tokens.length===2?[tokens[0],tokens[1],tokens[0],tokens[1]]:tokens.length===3?[tokens[0],tokens[1],tokens[2],tokens[1]]:tokens;
  if(four.length!==4)throw Error('Invalid character crop: '+value);
  return four.map((token,index)=>token.endsWith('%')?parseFloat(token)/100:parseFloat(token)/(index%2?box.width:box.height));
 }
 function contactPartitions(image,source){
  const character=image.closest('.scene-actor')?.dataset.sceneCharacter;
  const gesture=source.match(/^scenes\/public-gestures\/public-(\d+)\.webp$/);
  const publicId=gesture?'public-'+gesture[1]:character;
  const figure=Boolean(character)||image.matches('.hero-public,.hero-garda,.panel-public,.panel-garda');
  if(source==='scenes/story/red-bicycle.webp')return {figure:false,cuts:[0,226/452,1]};
  // Independently measured FRAME regions, after the production atlas crop.
  // A higher wheel or cane-adjacent boot must not disappear merely because
  // another contact is lower elsewhere in the same transparent image.
  if(publicId==='public-6')return {figure:true,cuts:[0,.36,.67,1]};
  if(publicId==='public-9'){
   const listening=gesture&&parseFloat(image.style.top)<=-200;
   const cuts=gesture?(listening?[107/320,159/320]:[94/320,155/320]):[92/320,160/320];
   return {figure:true,cuts:[0,...cuts,1]};
  }
  if(source==='characters/story-alex-comparison-20261126.webp')return {figure:true,cuts:[0,87/320,.5,234/320,1]};
  if(gesture){
   // Reviewed inter-boot seams in the 320px-wide gesture strips. Row order is
   // speak/right, speak/left, listen/right, listen/left. A central frame split
   // can otherwise let the nearer boot hide the higher, farther boot's sole.
   const seams={1:[152,168,166,154],2:[147,173,159,161],3:[148,172,161,159],4:[146,174,155,165],5:[150,170,160,160],7:[151,169,163,157],8:[148,172,159,161]};
   const row=Math.round(-parseFloat(image.style.top)/100),seam=seams[gesture[1]]?.[row];
   if(!Number.isFinite(seam))throw Error('Unreviewed gesture ground-contact regions: '+source+' row '+row);
   return {figure:true,cuts:[0,seam/320,1]};
  }
  return {figure,cuts:figure?[0,.5,1]:[0,1]};
 }
 function silhouette(image,frame){
  const paint=imagePaint(image),box=paint.box;
  const source=sourceName(image),partitions=contactPartitions(image,source);
  // A source/crop may appear in a narrow hero image with object-fit:cover or in
  // a square atlas frame. Include normalized placement, not absolute page size.
  const geometry=[(paint.left-frame.left)/frame.width,(paint.top-frame.top)/frame.height,paint.width/frame.width,paint.height/frame.height,(box.left-frame.left)/frame.width,(box.top-frame.top)/frame.height,box.width/frame.width,box.height/frame.height].map(value=>Math.round(value*10000)/10000);
  // Include measured normalized geometry even for fill images: responsive CSS
  // can move or scale an image without changing its inline atlas crop. Reusing
  // that earlier mask would hide the very composition change being measured.
  const key=(image.currentSrc||image.src)+'|'+image.getAttribute('style')+'|'+paint.style.clipPath+'|'+geometry.join(',')+'|'+partitions.cuts.join(',');
  if(!cache.has(key)){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=SIZE+2*PAD;
   const context=canvas.getContext('2d',{willReadFrequently:true});
   const [left,top,width,height,boxLeft,boxTop,boxWidth,boxHeight]=geometry;
   const [ct,cr,cb,cl]=cropInsets(paint.style.clipPath,box);
   if(paint.style.clipPath!=='none'){
    context.beginPath();context.rect(PAD+(boxLeft+boxWidth*cl)*SIZE,PAD+(boxTop+boxHeight*ct)*SIZE,boxWidth*(1-cl-cr)*SIZE,boxHeight*(1-ct-cb)*SIZE);context.clip();
   }
   context.drawImage(image,PAD+left*SIZE,PAD+top*SIZE,width*SIZE,height*SIZE);
   const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
   let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
   const rows=Array.from({length:SIZE},()=>[]),bottoms=new Int16Array(SIZE);bottoms.fill(-1);
   for(let y=-PAD;y<SIZE+PAD;y++){
    let run=-1;
    for(let x=-PAD;x<SIZE+PAD;x++){
     const ink=pixels[((y+PAD)*canvas.width+x+PAD)*4+3]>ALPHA;
     if(ink){minX=Math.min(minX,x);maxX=Math.max(maxX,x+1);minY=Math.min(minY,y);maxY=Math.max(maxY,y+1);}
     if(y>=0&&y<SIZE&&x>=0&&x<SIZE){
      if(ink){bottoms[x]=y+1;if(run<0)run=x;}
      if(run>=0&&(!ink||x===SIZE-1)){rows[y].push([run,ink?x+1:x]);run=-1;}
     }
    }
   }
   if(!Number.isFinite(minX))throw Error('Empty painted silhouette');
   const contacts=[],contactRegions=[];
   // The bicycle tyres have independent source baselines: the left ends at
   // y295/301, the right at299/301. Measuring only the globally lowest3px
   // would discard the left tyre and miss a crossing of the garden-wall edge.
   const zones=partitions.cuts.slice(0,-1).map((start,index)=>[start*SIZE,partitions.cuts[index+1]*SIZE]);
   for(const [start,end] of zones){
    let bottom=-1;
    for(let x=Math.ceil(start);x<end;x++)bottom=Math.max(bottom,bottoms[x]);
    if(bottom<0||(partitions.figure&&bottom<SIZE*.85))throw Error('Missing opaque sole or wheel in a reviewed ground-contact region');
    const first=contacts.length;
    for(let x=Math.ceil(start);x<end;x++)if(bottoms[x]>=bottom-3)contacts.push([(x+.5)/SIZE,bottoms[x]/SIZE]);
    contactRegions.push({from:start/SIZE,to:end/SIZE,bottom:bottom/SIZE,pixels:contacts.length-first});
   }
   if(!contacts.length)throw Error('No opaque ground contacts in the character frame');
   cache.set(key,{key,source,bounds:{left:minX/SIZE,top:minY/SIZE,right:maxX/SIZE,bottom:maxY/SIZE},rows,contacts,contactRegions});
  }
  const alpha=cache.get(key),bounds=alpha.bounds;
  return {alpha,frame,ink:{left:frame.left+bounds.left*frame.width,top:frame.top+bounds.top*frame.height,right:frame.left+bounds.right*frame.width,bottom:frame.top+bounds.bottom*frame.height},contacts:alpha.contacts.map(([x,y])=>[frame.left+x*frame.width,frame.top+y*frame.height]),paint};
 }
 function contains(point,polygon){
  const [x,y]=point;let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
   const [xi,yi]=polygon[i],[xj,yj]=polygon[j];
   if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
  }
  return inside;
 }
 function segmentDistance(point,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy);
 }
 function polygonDistance(point,polygon,scaleX=1,scaleY=1){
  const p=[point[0]*scaleX,point[1]*scaleY];
  return Math.min(...polygon.map((a,index)=>segmentDistance(p,[a[0]*scaleX,a[1]*scaleY],[polygon[(index+1)%polygon.length][0]*scaleX,polygon[(index+1)%polygon.length][1]*scaleY])));
 }
 function onGround(person,background,surface){
  // GPO preview markup declares its 480w derivative; its reviewed original is
  // 1600 × 900, the same source used by the hero. Derivative selection must not
  // enlarge the ground-boundary uncertainty.
  const originalWidth=landing?1600:Number(background.image.getAttribute('width'))||background.image.naturalWidth;
  const originalHeight=landing?900:Number(background.image.getAttribute('height'))||background.image.naturalHeight;
  let bad=null;
  const mapped=person.contacts.map(([x,y])=>[(x-background.paint.left)/background.paint.width,(y-background.paint.top)/background.paint.height]);
  for(const point of mapped){
   const floor=surface.polygons.some(polygon=>contains(point,polygon)||polygonDistance(point,polygon,originalWidth,originalHeight)<=SOURCE_EDGE);
   const obstacle=(surface.obstacles||[]).some(polygon=>contains(point,polygon)&&polygonDistance(point,polygon,originalWidth,originalHeight)>SOURCE_EDGE);
   if(!floor||obstacle){bad={point:point.map(rounded),reason:obstacle?'fixed obstacle footprint':'outside clear ground'};break;}
  }
  return {bad,contacts:mapped.length,span:[Math.min(...mapped.map(point=>point[0])),Math.max(...mapped.map(point=>point[0]))].map(rounded),foot:Math.max(...mapped.map(point=>point[1]))};
 }
 function inkRuns(person,y){
  const row=Math.floor((y-person.frame.top)/person.frame.height*SIZE);
  if(row<0||row>=SIZE)return [];
  return person.alpha.rows[row].map(([left,right])=>[person.frame.left+left/SIZE*person.frame.width,person.frame.left+right/SIZE*person.frame.width]);
 }
 function paintedIntersection(a,b){
  const common=overlap(a.ink,b.ink);if(common.right-common.left<=CSS_EDGE||common.bottom-common.top<=CSS_EDGE)return null;
  const step=Math.min(a.frame.height,b.frame.height)/SIZE;
  let area=0,height=0,maxWidth=0;
  for(let y=common.top+step/2;y<common.bottom;y+=step){
   let width=0;
   for(const ar of inkRuns(a,y))for(const br of inkRuns(b,y))width+=Math.max(0,Math.min(ar[1],br[1])-Math.max(ar[0],br[0]));
   if(width>CSS_EDGE){height+=step;area+=width*step;maxWidth=Math.max(maxWidth,width);}
  }
  return height>CSS_EDGE?{area:rounded(area),height:rounded(height),maxWidth:rounded(maxWidth)}:null;
 }
 function polygonTouchesInk(polygon,person,tolerance=0){
  const left=Math.min(...polygon.map(point=>point[0]))-tolerance,right=Math.max(...polygon.map(point=>point[0]))+tolerance;
  const top=Math.max(person.ink.top,Math.min(...polygon.map(point=>point[1]))-tolerance),bottom=Math.min(person.ink.bottom,Math.max(...polygon.map(point=>point[1]))+tolerance);
  const step=person.frame.height/SIZE;
  for(let y=top+step/2;y<=bottom;y+=step)for(const run of inkRuns(person,y)){
   for(let x=Math.max(left,run[0])+step/2;x<=Math.min(right,run[1]);x+=step){
    if(contains([x,y],polygon)||(tolerance&&polygonDistance([x,y],polygon)<=tolerance))return true;
   }
  }
  return false;
 }
 function elementQuad(element){
  const style=getComputedStyle(element),box=rect(element),width=parseFloat(style.width),height=parseFloat(style.height);
  const matrix=new DOMMatrix(style.transform==='none'?undefined:style.transform);
  const [ox,oy]=style.transformOrigin.split(/\s+/).map(parseFloat);
  const points=[[0,0],[width,0],[width,height],[0,height]].map(([x,y])=>{const p=matrix.transformPoint({x:x-ox,y:y-oy});return [p.x+ox,p.y+oy];});
  const minX=Math.min(...points.map(point=>point[0])),minY=Math.min(...points.map(point=>point[1]));
  return points.map(([x,y])=>[box.left+x-minX,box.top+y-minY]);
 }
 for(const element of elements){
  const wrapper=element.closest('[data-ground-case]');
  const id=wrapper?.dataset.groundCase||element.closest('[data-scene-id]')?.dataset.sceneId||element.className;
  const place=landing?'gpo-city':element.dataset.scenePlace;
  const context={case:id,place};
  const problem=(issue,details={})=>errors.push({...context,issue,...details});
  try{
   const surface=surfaces[place];if(!surface)throw Error('No independently reviewed ground polygon for '+place);
   const hero=landing&&element.matches('.poster-hero');
   const backgroundImage=element.querySelector(landing?(hero?'.scene-backdrop img':'.panel-backdrop'):'.scene-backdrop');
   const background={image:backgroundImage,paint:imagePaint(backgroundImage)};
   const bounds=hero?rect(element.querySelector('.scene-backdrop')):rect(element);
   if(bounds.width<30||bounds.height<20)problem('scene has no usable rendered area',{bounds});
   if(outside(bounds,background.paint,1))problem('background leaves an unpainted band');
   const actorElements=[...element.querySelectorAll(landing?(hero?'.hero-characters>img':'.panel-public,.panel-garda'):'.scene-actor')];
   const people=[];
   for(const actor of actorElements){
    const role=landing?actor.className:actor.dataset.sceneRole;
    try{
     const image=landing?actor:actor.querySelector('.scene-sprite img');
     const frame=landing?rect(actor):rect(actor.querySelector('.scene-sprite'));
     const person={...silhouette(image,frame),role,character:actor.dataset.sceneCharacter};
     people.push(person);
     const samplingX=frame.width/SIZE,samplingY=frame.height/SIZE;
     if(outside(person.ink,bounds,Math.max(CSS_EDGE,samplingX,samplingY)))problem('painted character is clipped by the scene',{role,source:person.alpha.source,ink:person.ink,bounds});
     if(outside(person.ink,frame,Math.max(CSS_EDGE,samplingX,samplingY)))problem(landing?'image crop cuts opaque artwork':'sprite frame crops opaque artwork',{role,source:person.alpha.source,ink:person.alpha.bounds});
     if(!landing&&Math.abs(frame.width/frame.height-1)>.002)problem('character frame changes proportions',{role,ratio:frame.width/frame.height});
     const imageBox=person.paint.box;
     if(!landing&&Math.abs(imageBox.width/imageBox.height/(image.naturalWidth/image.naturalHeight)-1)>.005)problem('source image is stretched',{role,source:person.alpha.source});
     const ground=onGround(person,background,surface);person.ground=ground;
     if(ground.bad)problem('opaque sole or wheel is not on clear ground',{role,source:person.alpha.source,...ground.bad});
     const badge=landing?null:actor.querySelector('.scene-person-number');
     if(badge){person.badge=rect(badge);if(outside(person.badge,bounds))problem('participant badge is clipped',{role});}
     if(!landing){
      const shadow=getComputedStyle(actor,'::before');
      if(shadow.content!=='none'&&shadow.display!=='none'){
       const pixels=value=>value.endsWith('%')?parseFloat(value)/100*frame.height:parseFloat(value);
       const shadowY=rect(actor).bottom-pixels(shadow.bottom)-pixels(shadow.height)/2;
       const drift=Math.abs(person.ink.bottom-shadowY);
       if(!Number.isFinite(drift)||drift>1.5)problem('contact shadow is detached from the opaque soles or wheels',{role,source:person.alpha.source,drift:rounded(drift)});
      }
     }
    }catch(error){problem('character measurement failed',{role,error:error.message});}
   }
   for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){
    const collision=paintedIntersection(people[i],people[j]);
    if(collision)problem('painted characters overlap',{roles:[people[i].role,people[j].role],...collision});
    for(const [badgeOwner,other] of [[people[i],people[j]],[people[j],people[i]]])if(badgeOwner.badge){
     const b=badgeOwner.badge,quad=[[b.left,b.top],[b.right,b.top],[b.right,b.bottom],[b.left,b.bottom]];
     if(polygonTouchesInk(quad,other))problem('participant badge covers another character',{roles:[badgeOwner.role,other.role]});
    }
   }
   for(const prop of element.querySelectorAll('.scene-story-prop')){
    const kind=prop.dataset.storyProp,owner=people.find(person=>person.role===prop.dataset.propOwner);
    try{
     if(!owner)throw Error('Missing prop owner');
     const painted=silhouette(prop,rect(prop));
     if(outside(painted.ink,bounds))problem('story prop is clipped',{kind});
     if(kind==='phone'){
      if(!paintedIntersection(painted,owner))problem('held story prop does not contact its owner',{kind,owner:owner.role});
     }else{
      const ground=onGround(painted,background,surface);
      if(ground.bad)problem('floor prop is not on clear ground',{kind,...ground.bad});
      const drift=Math.abs(painted.ink.bottom-owner.ink.bottom);
      if(drift>2)problem('floor prop does not share its owner’s foot baseline',{kind,owner:owner.role,drift:rounded(drift)});
     }
    }catch(error){problem('story prop measurement failed',{kind,error:error.message});}
   }
   for(const prop of element.querySelectorAll('.scene-exchange-object')){
    const kind=prop.dataset.sceneObject,owner=people.find(person=>person.role===prop.dataset.heldBy);
    try{
     if(!owner)throw Error('Missing held-object owner');
     const shape=prop.querySelector('i'),quad=elementQuad(shape);
     if(outside(rect(shape),bounds))problem('held object is clipped',{kind});
     // One CSS pixel permits the anti-aliased edge between a hand and object;
     // no proportion-of-frame padding is used to invent a distant contact.
     if(!polygonTouchesInk(quad,owner,1))problem('held object does not contact its owner’s painted hand',{kind,owner:owner.role});
     for(const other of people)if(other!==owner&&polygonTouchesInk(quad,other))problem('held object covers another character',{kind,owner:owner.role,other:other.role});
    }catch(error){problem('held object measurement failed',{kind,error:error.message});}
   }
   measurements.push({...context,width:bounds.width,height:bounds.height,source:sourceName(backgroundImage),
    crop:[(bounds.left-background.paint.left)/background.paint.width,(bounds.top-background.paint.top)/background.paint.height,bounds.width/background.paint.width,bounds.height/background.paint.height].map(rounded),
    actors:people.map(person=>({role:person.role,source:person.alpha.source,character:person.character,
     frame:[(person.frame.left-bounds.left)/bounds.width,(person.frame.top-bounds.top)/bounds.height,person.frame.width/bounds.width,person.frame.height/bounds.height].map(rounded),
     ink:[(person.ink.left-bounds.left)/bounds.width,(person.ink.top-bounds.top)/bounds.height,(person.ink.right-person.ink.left)/bounds.width,(person.ink.bottom-person.ink.top)/bounds.height].map(rounded),
     contactSpan:person.ground?.span,contactRegions:person.alpha.contactRegions,foot:rounded(person.ground?.foot),artKey:person.alpha.key
    }))});
  }catch(error){problem('scene measurement failed',{error:error.message});}
 }
 return {errors,measurements,alphaCacheEntries:cache.size};
}
