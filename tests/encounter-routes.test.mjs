import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {encounters,roles,sites} from '../dist/encounters/catalog.mjs';
import {decodeState,switchRole,stateHash} from '../dist/encounters/engine.mjs';
import {unpackProgress,progressTotals,progressStorageKey} from '../dist/encounters/progress.mjs';
import {siteRole,siteBase} from './site-fixture.mjs';
const {scenarios}=await import(new URL('data.mjs',siteBase));
const siteStorageKey=progressStorageKey(siteRole);
const callbacks={},focused=[],memory=new Map();let currentHash='',assignments=0;
const main={innerHTML:'',focus(){focused.push('main');},scrollIntoView(){},addEventListener(type,fn){callbacks[type]=fn;}};
const siteLink={href:'',textContent:''};const nav=['play','encounters','rights','evidence','about'].map(value=>({dataset:{nav:value},attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}}));
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
globalThis.location={get hash(){return currentHash;},set hash(value){currentHash=value?(value.startsWith('#')?value:'#'+value):'';assignments++;}};
globalThis.history={replaceState(_state,_title,url){currentHash=url;}};
globalThis.matchMedia=()=>({matches:true});
globalThis.document={title:'',querySelector(q){if(q==='#main')return main;if(q==='[data-site-switch]')return siteLink;if(q==='.skip')return {addEventListener(type,fn){callbacks.skip=fn;}};if(q==='#feedback'&&main.innerHTML.includes('id="feedback"'))return {focus(){focused.push('feedback');},scrollIntoView(){}};return null;},querySelectorAll(q){return q==='[data-nav]'?nav:[];},getElementById(id){return main.innerHTML.includes(`id="${id}"`)?{focus(){focused.push(id);},scrollIntoView(){}}:null;}};
globalThis.window={scrollTo(){},addEventListener(type,fn){callbacks[type]=fn;}};
await import(new URL('app.mjs',siteBase));
const assertLoaded=()=>assert.doesNotMatch(main.innerHTML,/The game could not load/);
function route(hash){location.hash=hash;callbacks.hashchange();assertLoaded();}
function action(name,extra={}){const n=assignments;callbacks.click({target:{closest(){return {dataset:{action:name,...extra}};}}});if(assignments!==n)callbacks.hashchange();assertLoaded();}
const state=()=>decodeState(location.hash.slice(11).split('~')[0]);

test('Both roles can start every situation; the shared facts and role controls remain present',()=>{
 route('#play');assert.match(main.innerHTML,/Start as a member of the public/);assert.match(main.innerHTML,/Start as a Garda/);
 for(const role of roles){route('#encounters/'+role);assert.equal((main.innerHTML.match(/data-action="paired-start"/g)||[]).length,14);
  for(const e of Object.values(encounters)){
   action('paired-start',{id:e.id,role});assert.equal(state().role,role);assert.equal(state().nodeId,e.start);
   assert.equal((main.innerHTML.match(/data-action="paired-switch"/g)||[]).length,2);
   const before=state();action('paired-switch');assert.equal(state().nodeId,before.nodeId);assert.deepEqual(state().history,before.history);
  }
 }
});
test('A selected answer, both scores and the exact stage survive switches, source visits and transferred links',()=>{
 action('paired-start',{id:'public-search',role:'public'});action('paired-answer',{index:'0'});assert.equal(focused.at(-1),'feedback');
 action('paired-switch');action('paired-answer',{index:'1'});const before=state();
 assert.deepEqual(before.answers,{public:0,garda:1});
 const link=new URL(siteLink.href),destination=new URL(sites[siteRole==='public'?'garda':'public']);assert.equal(link.origin,destination.origin);assert.equal(link.pathname,destination.pathname);
 const [saved,progressToken]=link.hash.slice(11).split('~');const carried=decodeState(saved);
 assert.equal(carried.nodeId,before.nodeId);assert.deepEqual(carried.answers,before.answers);
 assert.equal(progressTotals(unpackProgress(progressToken),'public').points>=1,true);
 route(siteRole==='garda'?'#evidence':'#rights');route(stateHash(before));assert.deepEqual(state(),before);assert.match(main.innerHTML,/0 POINTS/);
 route(link.hash);assert.equal(state().nodeId,before.nodeId);assert.deepEqual(state().answers,before.answers);assert.equal(location.hash.includes('~'),false,'Transfer is merged and removed from the active URL');
 action('paired-switch');assert.equal(state().answers[state().role],state().role==='public'?0:1);
});
test('Every shared situation reaches a scored two-role recap and can revisit or replay either role',()=>{
 for(const e of Object.values(encounters)){
  action('paired-start',{id:e.id,role:'public'});let steps=0;
  while(!state().complete){
   assert.ok(++steps<12);
   for(const role of roles){if(state().role!==role)action('paired-switch');const view=e.nodes[state().nodeId].views[role];action('paired-answer',{index:String(view.choices.findIndex(c=>c.points===1))});}
   action('paired-next');
  }
  assert.match(main.innerHTML,/YOUR SCORES & REFLECTION RECAP/);assert.match(main.innerHTML,/Best completed route/);assert.equal(state().history.length,steps);
  action('paired-switch');assert.ok(state().complete);assert.match(main.innerHTML,/Switch recap perspective/);
  action('paired-revisit',{index:'0'});assert.equal(state().nodeId,e.start);assert.equal(state().history.length,0);
 }
 route('#progress');assert.match(main.innerHTML,/14 of 14 situations completed/);assert.match(main.innerHTML,/Best completed:/);
});
test('Original mode transfers a live selection into the same stage and records its score',()=>{
 const e=scenarios[0];route('#play');action('start',{id:e.id});action('choose',{index:'1'});
 assert.match(main.innerHTML,/data-action="paired-transfer"/);assert.match(main.innerHTML,/Scores & saved progress/);
 action('paired-transfer');assert.equal(state().id,siteRole+'-'+e.id);assert.equal(state().nodeId,e.start);assert.equal(state().answers[siteRole],1);assert.notEqual(state().role,siteRole);
});
test('Unknown routes and corrupted progress show a recovery view while saved records remain available',()=>{
 const before=memory.get(siteStorageKey);
 for(const hash of ['#encounters/nope','#encounter/broken','#encounter/evil~broken','#progress~broken']){route(hash);assert.match(main.innerHTML,/Unable to open this situation/);}
 assert.equal(memory.get(siteStorageKey),before);
});
test('Clearing requires the in-page confirmation and resets the local record and resume point',()=>{
 route('#progress');assert.ok(memory.has(siteStorageKey));action('paired-clear');assert.match(main.innerHTML,/Clear this site’s saved progress/);assert.ok(memory.has(siteStorageKey));
 action('paired-clear-cancel');assert.ok(memory.has(siteStorageKey));action('paired-clear');action('paired-clear-confirm');assert.equal(memory.has(siteStorageKey),false);assert.match(main.innerHTML,/0 of 14 situations completed/);
});
