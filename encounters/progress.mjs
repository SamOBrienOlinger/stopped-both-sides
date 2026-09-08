import {encounters,roles} from './catalog.mjs';
import {decodeState,encodeState} from './engine.mjs';
import {hasOwn} from '../compatibility.mjs';
// This validated storage schema contains only JSON values; never requires structuredClone.
const cloneProgress=progress=>JSON.parse(JSON.stringify(progress));
export const STORAGE_KEY='garda-encounter-progress-v1';
export const emptyProgress=()=>({records:{},last:null});
const validIndex=(n,max)=>Number.isInteger(n)&&n>=0&&n<max;
const validResult=r=>Array.isArray(r)&&r.length===2&&Number.isInteger(r[0])&&Number.isInteger(r[1])&&r[1]>0&&r[1]<=20&&r[0]>=0&&r[0]<=r[1];
const better=(a,b)=>!a?b:!b?a:b[0]/b[1]>a[0]/a[1]?b:a;
export function runScores(state){
 const steps=[...state.history,...(state.complete?[]:[{nodeId:state.nodeId,answers:state.answers}])];
 return Object.fromEntries(roles.map(role=>{
  let points=0,answered=0;
  for(const step of steps){const index=step.answers[role];if(index!==null){answered++;points+=encounters[state.id].nodes[step.nodeId].views[role].choices[index].points;}}
  return [role,{points,answered,stages:steps.length,complete:state.complete&&answered===steps.length}];
 }));
}
export function recordProgress(progress,state){
 const next=cloneProgress(progress),encounter=encounters[state.id];
 const steps=[...state.history,...(state.complete?[]:[{nodeId:state.nodeId,answers:state.answers}])];
 const scores=runScores(state);
 for(const role of roles){
  const key=state.id+'/'+role;
  const record=next.records[key]||{decisions:{},best:null,last:null};
  for(const step of steps){
   const index=step.answers[role];if(index===null)continue;
   const point=encounter.nodes[step.nodeId].views[role].choices[index].points;
   record.decisions[step.nodeId]=[point,Math.max(point,record.decisions[step.nodeId]?.[1]||0)];
  }
  if(scores[role].complete){record.last=[scores[role].points,scores[role].answered];record.best=better(record.best,record.last);}
  if(Object.keys(record.decisions).length)next.records[key]=record;
 }
 next.last=encodeState(state);
 return next;
}
export function progressTotals(progress,role){
 const records=Object.entries(progress.records).filter(([key])=>key.endsWith('/'+role));
 return {points:records.reduce((n,[,r])=>n+Object.values(r.decisions).reduce((a,v)=>a+v[1],0),0),answered:records.reduce((n,[,r])=>n+Object.keys(r.decisions).length,0),completed:records.filter(([,r])=>r.best).length};
}
export function packProgress(progress){
 const rows=Object.entries(progress.records).map(([key,r])=>{
  const [id,role]=key.split('/'),ids=Object.keys(encounters[id].nodes);
  return [id,roles.indexOf(role),Object.entries(r.decisions).map(([node,v])=>[ids.indexOf(node),...v]),r.best,r.last];
 });
 return btoa(JSON.stringify({v:1,rows,last:progress.last})).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function unpackProgress(token){
 try{
  if(typeof token!=='string'||token.length>30000||!/^[A-Za-z0-9_-]+$/.test(token))return null;
  const d=JSON.parse(atob(token.replaceAll('-','+').replaceAll('_','/')));
  if(d.v!==1||!Array.isArray(d.rows)||d.rows.length>Object.keys(encounters).length*2)return null;
  const p=emptyProgress();
  for(const row of d.rows){
   if(!Array.isArray(row)||row.length!==5||!hasOwn(encounters,row[0])||![0,1].includes(row[1])||!Array.isArray(row[2]))return null;
   const [id,role,values,best,last]=row,ids=Object.keys(encounters[id].nodes),key=id+'/'+roles[role];
   if(hasOwn(p.records,key)||values.length>ids.length||best!==null&&!validResult(best)||last!==null&&!validResult(last))return null;
   const decisions={};
   for(const v of values){
    if(!Array.isArray(v)||v.length!==3||!validIndex(v[0],ids.length)||![0,1].includes(v[1])||![0,1].includes(v[2])||v[2]<v[1]||hasOwn(decisions,ids[v[0]]))return null;
    decisions[ids[v[0]]]=[v[1],v[2]];
   }
   if(best&&(!last||best[0]/best[1]<last[0]/last[1]||best[1]>ids.length)||last&&last[1]>ids.length)return null;
   p.records[key]={decisions,best,last};
  }
  p.last=d.last===null?null:decodeState(d.last)?d.last:null;
  return p;
 }catch{return null;}
}
export function mergeProgress(a,b){
 const p=cloneProgress(a);
 for(const [key,r] of Object.entries(b.records)){
  const existing=p.records[key]||{decisions:{},best:null,last:null};
  for(const [id,value] of Object.entries(r.decisions))existing.decisions[id]=[value[0],Math.max(value[1],existing.decisions[id]?.[1]||0)];
  existing.best=better(existing.best,r.best);existing.last=r.last||existing.last;p.records[key]=existing;
 }
 p.last=b.last||p.last;
 return p;
}
export const progressStorageKey=(siteRole='')=>STORAGE_KEY+(['public','garda'].includes(siteRole)?':'+siteRole:'');
export function createProgressStore(storage,siteRole=''){
 const key=progressStorageKey(siteRole);
 let value=emptyProgress(),available=true;
 try{const raw=storage?.getItem(key);if(raw)value=unpackProgress(raw)||emptyProgress();if(!storage)available=false;}catch{available=false;}
 return {
  get value(){return value;},get available(){return available;},
  save(next){value=next;try{if(!storage)throw Error('Storage unavailable');storage.setItem(key,packProgress(next));available=true;}catch{available=false;}return value;},
  clear(){value=emptyProgress();try{storage?.removeItem(key);}catch{available=false;}}
 };
}
