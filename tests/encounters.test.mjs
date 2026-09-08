import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {encounters,roles,references,stageCount} from '../encounters/catalog.mjs';
import {startEncounter,currentStage,switchRole,answer,continueEncounter,revisit,changeAnswer,encodeState,decodeState,fromOriginal} from '../encounters/engine.mjs';
import {emptyProgress,recordProgress,runScores,progressTotals,packProgress,unpackProgress,mergeProgress,createProgressStore,STORAGE_KEY} from '../encounters/progress.mjs';
import publicData from '../encounters/original-public.mjs';
import gardaData from '../encounters/original-garda.mjs';
import * as localData from '../data.mjs';
import * as localGardaData from '../garda/data.mjs';

for(const e of Object.values(encounters)){
 test(`${e.id}: all role/choice routes finish; switching keeps the scene and answers`,()=>{
  const seen=new Set();let paths=0;
  function walk(state){
   assert.ok(state.history.length<12,'Cycle in the shared graph');
   if(state.complete){paths++;return;}
   const stage=currentStage(state);
   if(!seen.has(state.nodeId)){
    seen.add(state.nodeId);assert.ok(stage.scene&&stage.title);
    for(const role of roles){
     const view=stage.views[role];assert.ok(view.prompt&&view.lesson&&view.refs.length);assert.ok(view.choices.some(c=>c.points===1));
     for(const ref of view.refs)assert.ok(references[ref],ref);
     for(const c of view.choices){assert.ok(c.text&&c.feedback);assert.equal(c.points,c.review?0:1);assert.ok(c.next==='end'||Object.hasOwn(e.nodes,c.next));}
    }
    // Every combination can be compared, serialized and switched back without
    // committing a different node or losing an already selected answer.
    stage.views.public.choices.forEach((_,p)=>stage.views.garda.choices.forEach((_,g)=>{
     let compared=answer(switchRole(state,'public'),p);compared=answer(switchRole(compared,'garda'),g);
     assert.equal(currentStage(compared).scene,stage.scene);assert.equal(compared.nodeId,state.nodeId);
     assert.deepEqual(decodeState(encodeState(compared)),compared);
     assert.equal(switchRole(compared,'public').answers.public,p);assert.equal(compared.answers.garda,g);
     assert.deepEqual(compared.history,state.history);
    }));
   }
   for(const role of roles)stage.views[role].choices.forEach((_,i)=>walk(continueEncounter(answer(switchRole(state,role),i))));
  }
  walk(startEncounter(e.id));assert.equal(seen.size,Object.keys(e.nodes).length);
  console.log(`${e.id}: ${paths} mixed-role routes`);
 });
}
test('Every original route can transfer at every stage, including feedback and the recap',()=>{
 for(const [role,data] of [['public',publicData],['garda',gardaData]])for(const e of data.scenarios){
  function walk(original){
   const mapped=fromOriginal(original,role);assert.equal(mapped.id,role+'-'+e.id);assert.equal(mapped.nodeId,original.nodeId);assert.equal(mapped.complete,original.complete);assert.equal(mapped.history.length,original.history.length);assert.equal(mapped.answers[role],original.selected);assert.deepEqual(decodeState(encodeState(mapped)),mapped);
   if(original.complete)return;
   e.nodes[original.nodeId].choices.forEach((c,i)=>{
    const selected={...original,selected:i};assert.equal(fromOriginal(selected,role).answers[role],i);
    walk({...original,nodeId:c.next,history:[...original.history,{nodeId:original.nodeId,choiceIndex:i}],selected:null,complete:c.next==='end'});
   });
  }
  walk({scenarioId:e.id,nodeId:e.start,history:[],selected:null,complete:false});
 }
});
test('Scores are separate, recomputed from choices and cannot grow on a double click or role switch',()=>{
 let s=startEncounter('public-search');s=answer(s,0);const once=s;
 assert.equal(answer(s,1),once);s=answer(switchRole(s,'garda'),1);
 assert.deepEqual(runScores(s),{public:{points:1,answered:1,stages:1,complete:false},garda:{points:0,answered:1,stages:1,complete:false}});
 let p=recordProgress(emptyProgress(),s);for(let i=0;i<20;i++)p=recordProgress(p,switchRole(s));
 assert.equal(progressTotals(p,'public').points,1);assert.equal(progressTotals(p,'garda').points,0);
 s=answer(changeAnswer(s),0);p=recordProgress(p,s);assert.equal(progressTotals(p,'garda').points,1);
 s=continueEncounter(s);s=revisit(s);assert.deepEqual(s.answers,{public:null,garda:null});assert.equal(runScores(s).public.points,0);
 assert.equal(progressTotals(p,'garda').points,1,'Saved best learning survives revisiting');
});
function completed(id='public-search',good=true){
 let s=startEncounter(id);while(!s.complete){for(const role of roles){const choices=currentStage(s).views[role].choices;const i=choices.findIndex(c=>c.points===(good?1:0));s=answer(switchRole(s,role),i);}s=continueEncounter(s);}return s;
}
test('Completed results and improved best scores survive reload, merge and a lower later result',()=>{
 const memory=new Map();const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const low=completed('public-search',false),high=completed();let p=recordProgress(emptyProgress(),low);
 let store=createProgressStore(storage);store.save(p);assert.ok(memory.has(STORAGE_KEY));
 p=recordProgress(store.value,high);store.save(p);
 store=createProgressStore(storage);assert.deepEqual(store.value,p);assert.deepEqual(p.records['public-search/public'].best,[4,4]);
 p=recordProgress(store.value,low);assert.deepEqual(p.records['public-search/public'].best,[4,4]);assert.deepEqual(p.records['public-search/public'].last,[0,4]);
 assert.deepEqual(unpackProgress(packProgress(p)),p);
 const merged=mergeProgress(recordProgress(emptyProgress(),completed('public-custody')),p);
 assert.equal(progressTotals(merged,'public').completed,2);assert.equal(progressTotals(merged,'public').points,8);
 store.clear();assert.equal(memory.has(STORAGE_KEY),false);assert.deepEqual(store.value,emptyProgress());
});
test('Partial opposite-role answers do not receive a completed-route score',()=>{
 let s=startEncounter('public-search');while(!s.complete){s=answer(s,0);s=continueEncounter(s);}
 const p=recordProgress(emptyProgress(),s);assert.ok(p.records['public-search/public'].best);assert.equal(p.records['public-search/garda'],undefined);
 assert.equal(runScores(s).garda.complete,false);
});
test('Broken storage, invalid links and malformed transferred records recover safely',()=>{
 const store=createProgressStore({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}});
 const p=recordProgress(emptyProgress(),answer(startEncounter('public-search'),0));store.save(p);assert.equal(store.available,false);assert.deepEqual(store.value,p);store.clear();
 for(const x of ['',null,'<script>','a'.repeat(6001),btoa('{"v":2}'),btoa('{"v":1,"e":"__proto__","r":"public","p":[],"a":[null,null]}'),btoa('{"v":1,"e":"public-search","r":"public","p":[[null,null,0]],"a":[null,null]}')])assert.equal(decodeState(x),null);
 for(const x of ['<script>',btoa('{"v":1,"rows":[["__proto__",0,[],null,null]],"last":null}'),btoa('{"v":1,"rows":[["public-search",0,[[99,1,1]],null,null]],"last":null}')])assert.equal(unpackProgress(x),null);
});
test('Both shared perspectives read the original content directly and all imports exist',()=>{
 assert.equal(publicData.scenarios,localData.scenarios);assert.equal(publicData.sources,localData.sources);
 assert.equal(gardaData.scenarios,localGardaData.scenarios);assert.equal(gardaData.sources,localGardaData.sources);assert.equal(stageCount,59);
 const base=new URL('../encounters/',import.meta.url);
 for(const file of readdirSync(base).filter(f=>f.endsWith('.mjs'))){const content=readFileSync(new URL(file,base),'utf8');for(const m of content.matchAll(/from ['"](\.\/[^'"]+)['"]/g))assert.doesNotThrow(()=>readFileSync(new URL(m[1],base)));}
});
