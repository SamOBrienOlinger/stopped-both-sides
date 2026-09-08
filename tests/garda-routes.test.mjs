import test from 'node:test';
import assert from 'node:assert/strict';
import {scenarios,sources,groups} from '../dist/garda/data.mjs';

// Small DOM adapter: verifies application routing and state integration without a browser.
const callbacks={};
const focused=[];
const main={innerHTML:'',focus(){focused.push('main');},scrollIntoView(){},addEventListener(type,callback){callbacks[type]=callback;}};
const skip={addEventListener(type,callback){callbacks.skip=callback;}};
const nav=['play','evidence','about'].map(value=>({dataset:{nav:value},attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}}));
let currentHash='';
globalThis.location={get hash(){return currentHash;},set hash(value){currentHash=value?(value.startsWith('#')?value:'#'+value):'';}};
globalThis.matchMedia=()=>({matches:true});
globalThis.document={title:'',querySelector(q){if(q==='#main')return main;if(q==='.skip')return skip;if(q==='#feedback'&&main.innerHTML.includes('id="feedback"'))return {focus(){focused.push('feedback');},scrollIntoView(){}};return null;},querySelectorAll(q){return q==='[data-nav]'?nav:[];},getElementById(id){return main.innerHTML.includes(`id="${id}"`)?{focus(){focused.push(id);},scrollIntoView(){}}:null;}};
globalThis.window={scrollTo(){},addEventListener(type,callback){callbacks[type]=callback;}};
await import('../dist/garda/app.mjs');
function route(hash){location.hash=hash;callbacks.hashchange();assert.doesNotMatch(main.innerHTML,/The game could not load/);}
function action(name,extra={}){callbacks.click({target:{closest(){return {dataset:{action:name,...extra}};}}});if(name==='start')callbacks.hashchange();assert.doesNotMatch(main.innerHTML,/The game could not load/);}

test('All main routes and every source/group deep link render their intended content',()=>{
 route('#play');assert.equal((main.innerHTML.match(/data-action="start"/g)||[]).length,scenarios.length);
 route('#about');assert.match(main.innerHTML,/independent prototype/i);
 for(const [id,s] of Object.entries(sources)){route(`#evidence/${id}`);assert.ok(main.innerHTML.includes(`id="source-${id}" tabindex="-1" open`),id);assert.ok(main.innerHTML.includes(s.url),id);assert.equal(focused.at(-1),`source-${id}`);}
 for(const id of Object.keys(groups)){route(`#evidence/group-${id}`);assert.equal(focused.at(-1),`group-${id}`);}
 assert.equal(nav.find(n=>n.dataset.nav==='evidence').attrs['aria-current'],'page');
});

test('Evidence navigation preserves a selected decision and resume follows its branch',()=>{
 route('#play');action('start',{id:'street'});action('choose',{index:'1'});
 assert.match(main.innerHTML,/id="feedback"/);assert.equal(focused.at(-1),'feedback');
 route('#evidence/quinton');assert.match(main.innerHTML,/Return to your situation/);
 route('#scenario/street');assert.match(main.innerHTML,/aria-pressed="true"/);assert.match(main.innerHTML,/id="feedback"/);
 action('next');assert.match(main.innerHTML,/A choice to decline/);assert.doesNotMatch(main.innerHTML,/id="feedback"/);
 action('back');assert.match(main.innerHTML,/What caught your attention/);assert.doesNotMatch(main.innerHTML,/aria-pressed="true"/);
});

test('Every situation can reach a recap in the UI, open sources and replay cleanly',()=>{
 for(const s of scenarios){
  action('start',{id:s.id});let id=s.start;let steps=0;
  while(id!=='end'){
   assert.ok(++steps<12);const n=s.nodes[id],index=n.choices.findIndex(c=>!c.review);
   action('choose',{index:String(index)});assert.match(main.innerHTML,/Evidence behind this explanation/);
   route(`#evidence/${n.sources[0]}`);route(`#scenario/${s.id}`);
   action('next');id=n.choices[index].next;
  }
  assert.match(main.innerHTML,/YOUR REFLECTION RECAP/);
  route('#about');assert.match(main.innerHTML,/Return to your recap/);route(`#scenario/${s.id}`);
  assert.match(main.innerHTML,/YOUR REFLECTION RECAP/);
  action('start',{id:s.id});assert.doesNotMatch(main.innerHTML,/YOUR REFLECTION RECAP/);assert.doesNotMatch(main.innerHTML,/aria-pressed="true"/);
 }
});

test('Malformed, unknown and inherited-object route names show a safe not-found page',()=>{
 for(const path of ['#missing','#scenario/missing','#scenario/__proto__','#scenario/constructor','#evidence/__proto__','#evidence/group-constructor','#evidence/%3Cscript%3E']){route(path);assert.match(main.innerHTML,/This page was not found/);assert.doesNotMatch(main.innerHTML,/<script>/);}
});

test('Skip link focuses the current content without changing the route or selected answer',()=>{
 route('#play');action('start',{id:'street'});action('choose',{index:'1'});
 const content=main.innerHTML,hash=location.hash;let prevented=false;
 callbacks.skip({preventDefault(){prevented=true;}});
 assert.ok(prevented);assert.equal(focused.at(-1),'main');assert.equal(location.hash,hash);assert.equal(main.innerHTML,content);
 route('#main');assert.match(main.innerHTML,/One encounter. Two perspectives./);
});
