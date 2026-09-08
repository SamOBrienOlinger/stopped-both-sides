import publicData from './original-public.mjs';
import gardaData from './original-garda.mjs';
import {counterparts} from './counterparts.mjs';
export const roles=['public','garda'];
export const roleLabels={public:'Member of the public',garda:'Garda'};
export {sites} from '../site.mjs';
export const references=Object.fromEntries(roles.flatMap(role=>Object.entries((role==='public'?publicData:gardaData).sources).map(([id,s])=>[role+':'+id,s])));
const names={street:'Alex, 24',description:'Amina, 27',search:'Niamh, 29',communication:'Maya, 34','young-person':'Jamie, 16',colleague:'Patrick, 35','new-evidence':'Daniel, 32',supervision:'Community reviewer (member of the public)'};
export const encounters=Object.fromEntries(roles.flatMap(origin=>{
 const data=origin==='public'?publicData:gardaData, opposite=origin==='public'?'garda':'public';
 return data.scenarios.map(s=>{
  const id=origin+'-'+s.id,paired=counterparts[id];
  if(!paired)throw Error('Missing counterpart: '+id);
  const nodes=Object.fromEntries(Object.entries(s.nodes).map(([nodeId,node])=>{
   const p=paired[nodeId];if(!p)throw Error('Missing matched stage: '+id+'/'+nodeId);
   const fallback=node.choices.find(c=>!c.review).next;
   const refs=[...new Set([...node.sources.map(ref=>origin+':'+ref),...p.refs])];
   const original={prompt:node.prompt,lesson:node.lesson,choices:node.choices.map(c=>({...c,points:c.review?0:1})),refs};
   const counterpart={prompt:p.prompt,lesson:p.lesson,choices:p.choices.map(c=>({...c,next:c.next||fallback,points:c.review?0:1})),refs};
   const people=id==='garda-description'&&nodeId==='description-power'?{public:'Person matching the fuller description'}:undefined;
   return [nodeId,{id:nodeId,title:node.title,scene:p.scene,people,views:{[origin]:original,[opposite]:counterpart}}];
  }));
  return [id,{id,origin,originalId:s.id,title:s.title,description:s.description,start:s.start,nodes,people:{public:origin==='public'?s.person:names[s.id],garda:origin==='garda'?s.person:s.id==='custody'?'Garda in the custody team':'Garda involved in the encounter'},minutes:s.minutes}];
 });
}));
export const stageCount=Object.values(encounters).reduce((n,e)=>n+Object.keys(e.nodes).length,0);
