import {encounters,roles,roleLabels} from '../encounters/catalog.mjs?v=scene-review-1';
import {characters} from '../encounters/characters.mjs?v=scene-art-2';
import {startEncounter,answer,continueEncounter,switchRole} from '../encounters/engine.mjs?v=scene-review-1';
import {renderScene,sceneDirections} from '../encounters/scenes.mjs?v=caption-anchors-1';
import {translateHTML,translateText,loadLanguage} from '../locales/translate.mjs?v=uimproved-explore-1';

const pairs=characters.public.flatMap(p=>characters.garda.map(g=>({public:p.id,garda:g.id})));
const firstCast=pairs[0];
export const inventory=[];
const bases=new Map();
for(const [id,e] of Object.entries(encounters)){
 const queue=[startEncounter(id,'public',{cast:firstCast})],seen=new Set();
 while(queue.length){const s=queue.shift();if(s.complete||seen.has(s.nodeId))continue;seen.add(s.nodeId);bases.set(id+'/'+s.nodeId,s);
  const n=e.nodes[s.nodeId];for(const r of roles)for(let c=0;c<n.views[r].choices.length;c++){const next=continueEncounter(answer(switchRole(s,r),c));if(!next.complete)queue.push(next)}
 }
 for(const [nodeId,n]of Object.entries(e.nodes)){
  if(!bases.has(id+'/'+nodeId))throw Error('Unreachable scenario node: '+id+'/'+nodeId);
  if(!sceneDirections[id]?.[nodeId])throw Error('Missing artwork direction: '+id+'/'+nodeId);
  inventory.push({id,nodeId,title:n.title,scene:n.scene,direction:sceneDirections[id][nodeId],choices:Object.fromEntries(roles.map(r=>[r,n.views[r].choices.length]))});
 }
}
export function metadata(){return {inventory,characters,pairs:pairs.length,scenarios:Object.keys(encounters).length,nodes:inventory.length}}
const tick=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
let profile;
export async function configure(p){
 profile=p;await loadLanguage(p.lang||'en');
 const html=document.documentElement;html.lang=p.lang||'en';html.dir=p.lang==='ar'?'rtl':'ltr';
 html.style.fontSize=(p.text||100)+'%';html.classList.toggle('contrast-high',!!p.contrast);html.classList.add('motion-reduce');
 document.querySelector('#main').innerHTML='';await document.fonts.ready;await tick();
}
const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,cx:(r.left+r.right)/2}};
const intersects=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5;
export function variants(node,extended=false){
 const out=[];for(const role of roles){out.push({role,kind:'decision'});if(extended)for(let choice=0;choice<node.choices[role];choice++){out.push({role,kind:'response',choice});out.push({role,kind:'recap',choice})}}
 return out;
}
export async function batch(key,variant,pairIndices=null){
 const base=bases.get(key);if(!base)throw Error('Unknown scene '+key);
 const castPairs=pairIndices?pairIndices.map(i=>pairs[i]):pairs;
 const html=castPairs.map((cast,index)=>{
  let s={...base,cast,role:variant.role,answers:{public:null,garda:null}};let options={};
  if(variant.kind!=='decision')s=answer(s,variant.choice);
  if(variant.kind==='recap'){options={compact:true,step:{nodeId:s.nodeId,answers:{...s.answers},continuedAs:s.role}};s={...s,complete:true,history:[...s.history,options.step]}}
  let art=translateHTML(renderScene(s,options),profile.lang||'en');
  if(profile.longNames){const dom=document.createElement('div');dom.innerHTML=art;for(const label of dom.querySelectorAll('[data-scene-label-role] strong>span'))label.textContent='Alexandra-Mohammed O’Brien-Olinger — long display-name stress';art=dom.innerHTML}
  if(variant.kind==='recap')return `<section class="paired-recap" data-qa-case="${index}"><article class="summary-item">${art}</article></section>`;
  return `<div class="paired-game" data-qa-case="${index}"><aside class="story story--illustrated">${art}</aside><section class="prompt"><h2>${encounters[s.id].nodes[s.nodeId].title}</h2><p>${encounters[s.id].nodes[s.nodeId].views[s.role].prompt}</p></section></div>`;
 }).join('');
 const main=document.querySelector('#main');main.innerHTML=html;
 // This is a renderer sweep with real artwork, not a screenshot-only/stub fixture.
 const imgs=[...main.querySelectorAll('img')];for(const img of imgs)img.loading='eager';
 await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));await tick();
 const output=[];
 for(const [index,item]of [...main.querySelectorAll('[data-qa-case]')].entries()){
  const failures=[],metrics={maxCentreDelta:0,maxVisibleOverflow:0};
  const figure=item.querySelector('[data-caption-anchors]');
  if(!figure){output.push({pair:castPairs[index],failures:['missing_anchored_scene']});continue}
  const actorNodes=[...figure.querySelectorAll('[data-scene-role]')];const labels=[...figure.querySelectorAll('[data-scene-label-role]')];
  if(actorNodes.length!==2||labels.length!==2)failures.push('wrong_actor_or_label_count');
  for(const panel of figure.querySelectorAll('.scene-panel')){
   const pane=panel.querySelector('.scene-location'),pr=rect(pane),panelr=rect(panel);
   const localLabels=[...panel.querySelectorAll('[data-scene-label-role]')];
   for(const actor of panel.querySelectorAll('[data-scene-role]')){
    const role=actor.dataset.sceneRole,ar=rect(actor),label=localLabels.find(l=>l.dataset.sceneLabelRole===role);
    if(!label){failures.push('missing_'+role+'_caption');continue}
    const lr=rect(label),delta=Math.abs(ar.cx-lr.cx);metrics.maxCentreDelta=Math.max(metrics.maxCentreDelta,delta);
    if(delta>2)failures.push('caption_centre_'+role);
    if(lr.top<pr.bottom-.5)failures.push('caption_over_art_'+role);
    if(lr.left<panelr.left-1||lr.right>panelr.right+1)failures.push('caption_outside_panel_'+role);
    if(lr.bottom>panelr.bottom+1)failures.push('caption_below_panel_'+role);
    if(label.closest('[aria-hidden="true"]'))failures.push('caption_hidden_from_at_'+role);
    if(label.scrollWidth>label.clientWidth+1||label.scrollHeight>label.clientHeight+1)failures.push('caption_clipped_'+role);
    const expected=characters[role].find(c=>c.id===castPairs[index][role]);
    if(!profile.longNames&&label.querySelector('strong')?.textContent!==expected.name)failures.push('wrong_name_'+role);
    if(!label.textContent.includes(translateText(roleLabels[role],profile.lang||'en')))failures.push('wrong_role_'+role);
    const overflow=Math.max(0,pr.left-ar.left,ar.right-pr.right,pr.top-ar.top,ar.bottom-pr.bottom);metrics.maxVisibleOverflow=Math.max(metrics.maxVisibleOverflow,overflow);
    if(overflow>1)failures.push('actor_outside_panel_'+role);
    if(ar.width<1||ar.height<1||lr.width<1||lr.height<1)failures.push('zero_size_'+role);
    const sprite=actor.querySelector('img');if(!sprite?.complete||!sprite.naturalWidth)failures.push('missing_sprite_'+role);
   }
   for(let a=0;a<localLabels.length;a++)for(let b=a+1;b<localLabels.length;b++)if(intersects(rect(localLabels[a]),rect(localLabels[b])))failures.push('caption_collision');
   const back=pane.querySelector('.scene-backdrop');if(!back.complete||!back.naturalWidth)failures.push('missing_backdrop');
   if(pane.dataset.approvedArt&&getComputedStyle(back).objectFit!=='contain')failures.push('cropped_approved_background');
  }
  const ir=rect(item);if(ir.left< -1||ir.right>innerWidth+1)failures.push('horizontal_page_overflow');
  output.push({pair:castPairs[index],failures:[...new Set(failures)],metrics});
 }
 return output;
}
export async function visualSample(key,variant,pairIndex){await batch(key,variant,[pairIndex]);return document.querySelector('[data-caption-anchors]').outerHTML}
