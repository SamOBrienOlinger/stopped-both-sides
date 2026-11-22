import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {encounters,roles,sites} from '../encounters/catalog.mjs?v=colleague-witness-20261122';
import {decodeState,switchRole,stateHash,startEncounter,answer,continueEncounter} from '../encounters/engine.mjs?v=colleague-witness-20261122';
import {unpackProgress,progressTotals,progressStorageKey} from '../encounters/progress.mjs?v=colleague-witness-20261122';
import {storyIdentity} from '../encounters/narrative.mjs';
import {siteRole,siteBase} from './site-fixture.mjs';
const {scenarios}=await import(new URL('data.mjs',siteBase));
const situationCount=Object.keys(encounters).length;
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
const assertLoaded=()=>assert.doesNotMatch(main.innerHTML,/The resource could not load/);
function route(hash){location.hash=hash;callbacks.hashchange();assertLoaded();}
function action(name,extra={}){const n=assignments;callbacks.click({target:{closest(){return {dataset:{action:name,...extra}};}}});if(assignments!==n)callbacks.hashchange();assertLoaded();}
function openCharacterPicker(role){callbacks['scene-character-change']({target:{dataset:{sceneLabelRole:role},closest(){return null;}}});assertLoaded();}
const state=()=>decodeState(location.hash.slice(11).split('~')[0]);

test('About keeps information and privacy in a closed native disclosure, with PABI available separately',()=>{
 route('#about');
 const disclosure=main.innerHTML.match(/<details\b([^>]*\bprivacy-disclosure[^>]*)><summary>Information and privacy<\/summary>([\s\S]*?)<\/details>/);
 assert.ok(disclosure,'The privacy information must remain available through a native disclosure');
 assert.doesNotMatch(disclosure[1],/\bopen(?:\s|=|$)/);
 assert.match(disclosure[2],/saved in this browser/);
 assert.match(disclosure[2],/Hosting providers may keep standard access logs|hosting provider may keep standard access logs/);
 assert.match(main.innerHTML,/Read the PABI report \(PDF\)/);
 assert.match(main.innerHTML,/PABI project and multilingual summaries/);
 assert.match(main.innerHTML,/it does not evaluate this resource/);
});

test('PABI can be found in each perspective’s reference page alongside the existing INAR report',()=>{
 route(siteRole==='garda'?'#evidence/pabi':'#rights/complaints');
 assert.match(main.innerHTML,/Experiences of Policing amongst Brazilians and People of African Descent in Ireland/);
 assert.match(main.innerHTML,/Policing_of_Africans_and_Brazilians_in_Ireland_Mar25\.pdf/);
 assert.match(main.innerHTML,/Policing and Racial Discrimination in Ireland/);
 if(siteRole==='garda'){
  assert.match(main.innerHTML,/<details[^>]*id="source-pabi"[^>]*open/);
  assert.match(main.innerHTML,/survey was small and self-selecting/);
 }else assert.match(main.innerHTML,/https:\/\/inar\.ie\/pabi-project\//);
});

test('Both roles can start every situation; the shared facts and role controls remain present',()=>{
 route('#play');
 const titles={public:'Explore the public perspective',garda:'Explore the Garda perspective'};
 for(const role of roles){
  const href=new URL('#encounters/'+role,sites.public).href;
  const opening=`<a class="primary perspective-card-link" data-role-tone="${role}" href="${href}">`;
  const link=main.innerHTML.split(opening)[1]?.split('</a>')[0];
  assert.ok(link,'the '+role+' role link uses the public-root encounter URL');
  assert.ok(link.endsWith(`<span>${titles[role]}</span>`));
 }
 for(const role of roles){route('#encounters/'+role);assert.equal((main.innerHTML.match(/data-action="paired-start"/g)||[]).length,situationCount);
  const rolePicker=main.innerHTML.match(/<div class="role-picker"[^>]*>([\s\S]*?)<\/div>/)[1];
  for(const choice of roles){
   const link=rolePicker.match(new RegExp('href="#encounters/'+choice+'"[^>]*>([\\s\\S]*?)</a>'))[1];
   assert.match(link,new RegExp('/'+choice+'-perspective\\.webp"'));
   assert.match(link,/alt=""/);
  }
  for(const e of Object.values(encounters)){
   action('paired-start',{id:e.id,role});assert.equal(state().role,role);assert.equal(state().nodeId,e.start);
   assert.equal((main.innerHTML.match(/data-action="paired-switch"/g)||[]).length,1);
   const before=state();action('paired-switch');assert.equal(state().nodeId,before.nodeId);assert.deepEqual(state().history,before.history);
  }
 }
});
test('The resume card describes the public role in the youth situation',()=>{
 action('paired-start',{id:'public-young-person',role:'public'});const saved=state();
 route('#encounters/garda');
 assert.ok(!main.innerHTML.includes(stateHash(saved)));
 route('#encounters/public/young');
 assert.match(main.innerHTML,/You are a member of the public, age 16/);
 assert.match(main.innerHTML,/>Resume your situation<\/a>/);
 assert.doesNotMatch(main.innerHTML,/[←→]/);
 assert.ok(main.innerHTML.includes(stateHash(saved)));
});
test('The recommended start keeps the chosen role and avatar without requiring customisation',()=>{
 for(const role of roles){
  route('#encounters/'+role);
  assert.doesNotMatch(main.innerHTML,/data-action="paired-character-select"/);
  action('paired-quick-start',{id:role+'-street',role});
  assert.equal(state().id,role+'-street');assert.equal(state().role,role);
  const cast=state().cast;assert.ok(cast[role].startsWith(role+'-'));
  action('paired-answer',{index:'0'});action('paired-next');
  assert.equal(state().history.length,1);assert.deepEqual(state().cast,cast);
 }
});
test('A selected answer, both scores and the exact stage survive switches, source visits and transferred links',()=>{
 action('paired-start',{id:'public-search',role:'public'});action('paired-answer',{index:'0'});assert.equal(focused.at(-1),'feedback');
 action('paired-switch');action('paired-answer',{index:'1'});const before=state();
 assert.deepEqual(before.answers,{public:0,garda:1});
 const link=new URL(siteLink.href),destination=new URL(sites[siteRole==='public'?'garda':'public']);assert.equal(link.origin,destination.origin);assert.equal(link.pathname,destination.pathname);
 const [resource,progressToken]=link.hash.slice(1).split('~');assert.ok(['rights','evidence'].includes(resource));const carried=decodeState(unpackProgress(progressToken).last);
 assert.equal(carried.nodeId,before.nodeId);assert.deepEqual(carried.answers,before.answers);
 assert.equal(progressTotals(unpackProgress(progressToken),'public').points>=1,true);
 route(siteRole==='garda'?'#evidence':'#rights');route(stateHash(before));assert.deepEqual(state(),before);assert.match(main.innerHTML,/YOUR LEARNING POINT/);
 route((siteRole==='garda'?'#evidence':'#rights')+'~'+progressToken);assert.match(main.innerHTML,/session-return/);route(stateHash(carried));assert.equal(state().nodeId,before.nodeId);assert.deepEqual(state().answers,before.answers);assert.equal(location.hash.includes('~'),false,'Transfer is merged and removed from the active URL');
 action('paired-switch');assert.equal(state().answers[state().role],state().role==='public'?0:1);
});
test('Chosen characters remain editable without replacing the opposing character or route',()=>{
 route('#encounters/public');action('paired-setup-characters');assert.equal((main.innerHTML.match(/data-action="paired-character-select"/g)||[]).length,9);
 action('paired-character-select',{role:'public',character:'public-6'});
 action('paired-start',{id:'public-search',role:'public'});assert.equal(state().cast.public,'public-6');
 action('paired-answer',{index:'0'});const before=state();
 openCharacterPicker('public');assert.match(main.innerHTML,/id="character-picker-title"[^>]*>Change character/);
 assert.doesNotMatch(main.innerHTML,/Switch sides to play as the other character/);
 action('paired-character-choose',{character:'public-9'});assert.equal(state().cast.public,'public-9');assert.equal(state().cast.garda,before.cast.garda);
 assert.deepEqual(state().answers,before.answers);assert.deepEqual(state().history,before.history);
 assert.match(main.innerHTML,/data-character-id="public-9"/);action('paired-character-close');
 openCharacterPicker('garda');action('paired-character-choose',{character:'garda-8'});assert.equal(state().role,'public');
 assert.deepEqual(state().cast,{public:'public-9',garda:'garda-8'});assert.deepEqual(state().answers,before.answers);
 const link=new URL(siteLink.href),carried=decodeState(unpackProgress(link.hash.split('~')[1]).last);route((siteRole==='garda'?'#evidence':'#rights')+'~'+link.hash.split('~')[1]);route(stateHash(carried));assert.deepEqual(state().cast,{public:'public-9',garda:'garda-8'});
});
test('Every shared situation reaches a scored two-role recap and can revisit or replay either role',()=>{
 for(const e of Object.values(encounters)){
  action('paired-start',{id:e.id,role:'public'});let steps=0;
  while(!state().complete){
   assert.ok(++steps<12);
   for(const role of roles){if(state().role!==role)action('paired-switch');const view=e.nodes[state().nodeId].views[role];action('paired-answer',{index:String(view.choices.findIndex(c=>c.points===1))});}
   action('paired-next');
  }
  assert.match(main.innerHTML,/YOUR LEARNING RECAP/);assert.match(main.innerHTML,/Best completed route/);assert.equal(state().history.length,steps);
  action('paired-switch');assert.ok(state().complete);assert.match(main.innerHTML,/data-action="paired-switch"/);
  const completed=state();action('paired-replay-role',{role:'public'});assert.deepEqual(state().cast,completed.cast);route(stateHash(completed));
  action('paired-revisit',{index:'0'});assert.equal(state().nodeId,e.start);assert.equal(state().history.length,0);
 }
 route('#progress');assert.ok(main.innerHTML.includes(`${situationCount} <span>/ ${situationCount} situations completed`));assert.match(main.innerHTML,/Best completed:/);
});
test('Original mode transfers a live selection into the same stage and records its score',()=>{
 const e=scenarios[0];route('#play');action('start',{id:e.id});action('choose',{index:'1'});
 assert.match(main.innerHTML,/data-action="paired-transfer"/);assert.match(main.innerHTML,/Individual practice/);
 assert.doesNotMatch(main.innerHTML,/Fictional situation · Republic of Ireland/);
 action('paired-transfer');assert.equal(state().id,siteRole+'-'+e.id);assert.equal(state().nodeId,e.start);assert.equal(state().answers[siteRole],1);assert.notEqual(state().role,siteRole);
});
test('Original practice can change character while carrying its stage and answer into shared play',()=>{
 const e=scenarios[0];route('#play');action('start',{id:e.id});action('choose',{index:'1'});
 assert.match(main.innerHTML,/data-scene-label-role=/);
 openCharacterPicker(siteRole);assert.equal(state().role,siteRole);assert.equal(state().answers[siteRole],1);
 assert.match(main.innerHTML,/id="character-picker-title"[^>]*>Change character/);action('paired-character-choose',{character:siteRole+'-7'});
 assert.equal(state().cast[siteRole],siteRole+'-7');assert.equal(state().answers[siteRole],1);
});
test('Unknown routes and corrupted progress show a recovery view while saved records remain available',()=>{
 const before=memory.get(siteStorageKey);
 for(const hash of ['#encounters/nope','#encounter/broken','#encounter/evil~broken','#progress~broken']){route(hash);assert.match(main.innerHTML,/Unable to open this situation/);}
 assert.equal(memory.get(siteStorageKey),before);
});
test('Clearing requires the in-page confirmation and resets the local record and resume point',()=>{
 route('#progress');assert.ok(memory.has(siteStorageKey));action('paired-clear');assert.match(main.innerHTML,/Clear this site’s saved progress/);assert.ok(memory.has(siteStorageKey));
 action('paired-clear-cancel');assert.ok(memory.has(siteStorageKey));action('paired-clear');action('paired-clear-confirm');assert.equal(memory.has(siteStorageKey),false);assert.ok(main.innerHTML.includes(`0 <span>/ ${situationCount} situations completed`));
});


test('Every stage and every choice render the selected cast and preserve the next-stage contract',()=>{
 let stages=0,choices=0;
 for(const e of Object.values(encounters)){
  const pending=[startEncounter(e.id,'public',{cast:{public:'public-2',garda:'garda-5'}})],seen=new Set();
  while(pending.length){
   const base=pending.shift();if(base.complete||seen.has(base.nodeId))continue;seen.add(base.nodeId);stages++;
   const node=e.nodes[base.nodeId],identity=storyIdentity(e);
   for(const role of roles)for(const [index,choice] of node.views[role].choices.entries()){
    const active=switchRole(base,role);route(stateHash(active));action('paired-character-close');
    assert.match(main.innerHTML,/data-character-id="public-2"/);assert.match(main.innerHTML,/data-character-id="garda-5"/);
    assert.doesNotMatch(main.innerHTML,/Garda involved in the encounter/);
    assert.match(main.innerHTML,/<img class="tap-icon"[^>]+alt="" aria-hidden="true"[^>]*> Back to situations/);
    assert.doesNotMatch(main.innerHTML,/[←→]/);
    const story=main.innerHTML.match(/<p class="story-text">([\s\S]*?)<\/p>/)[1];
    if(identity&&node.scene.includes(identity.name)){assert.ok(story.includes('Noor'));assert.ok(!story.includes(identity.name));}
    action('paired-answer',{index:String(index)});choices++;
    assert.equal(state().answers[role],index);assert.match(main.innerHTML,/id="feedback"/);
    assert.match(main.innerHTML,/target="_blank" rel="noopener noreferrer">[^<]+ <img class="tap-icon"/);
    assert.doesNotMatch(main.innerHTML,/[←→↗]/);
    const before=state();action('paired-switch');assert.deepEqual(state().answers,before.answers);action('paired-switch');assert.deepEqual(state(),before);
    action('paired-next');assert.equal(state().nodeId,choice.next);assert.equal(state().complete,choice.next==='end');assert.deepEqual(state().cast,base.cast);
    assert.equal(state().history.at(-1).continuedAs,role);assert.equal(state().history.at(-1).answers[role],index);
    assert.match(main.innerHTML,state().complete?/YOUR LEARNING RECAP/:/class="story-text"/);
    pending.push(continueEncounter(answer(active,index)));
   }
  }
  assert.equal(seen.size,Object.keys(e.nodes).length);
 }
 assert.equal(stages,99);assert.equal(choices,455);
});


test('Original practice uses its pictured character in every named scene and completed recap',()=>{
 for(const original of scenarios){
  route('#play');action('start',{id:original.id});
  assert.match(main.innerHTML,/<img class="tap-icon"[^>]+alt="" aria-hidden="true"[^>]*> Back to practice/);
  assert.doesNotMatch(main.innerHTML,/[←→]/);
  const encounter=encounters[siteRole+'-'+original.id],identity=storyIdentity(encounter);
  const selected=main.innerHTML.match(/data-cast-role="public"[\s\S]*?<strong data-no-translate>([^<]+)<\/strong>/)[1];
  let count=0;
  while(main.innerHTML.includes('class="story-text"')){
   assert.ok(++count<12);
   assert.doesNotMatch(main.innerHTML,/Garda involved in the encounter/);
   const story=main.innerHTML.match(/<p class="story-text">([\s\S]*?)<\/p>/)[1];
   if(identity&&selected!==identity.name)assert.ok(!story.includes(identity.name));
   action('choose',{index:'0'});action('next');
  }
  assert.match(main.innerHTML,/RECAP/);assert.ok(main.innerHTML.includes(selected));
  assert.match(main.innerHTML,/data-action="paired-transfer"/);
 }
});

test('Home topic shortcuts open the matching catalogue for each starting role',()=>{
 const topics={street:3,search:3,custody:2,young:2,fairness:4,discrimination:20};
 route('#play');
 for(const topic of Object.keys(topics))assert.ok(main.innerHTML.includes(`#encounters/${siteRole}/${topic}`));
 for(const role of roles)for(const [topic,count] of Object.entries(topics)){
  route(`#encounters/${role}/${topic}`);
  assert.match(main.innerHTML,/simple-setup topic-selected/);
  assert.match(main.innerHTML,/class="scenario-library" open/);
  assert.equal((main.innerHTML.match(/data-action="paired-start"/g)||[]).length,count);
  action('paired-topic',{topic:'all'});
  assert.equal((main.innerHTML.match(/data-action="paired-start"/g)||[]).length,situationCount);
 }
 route('#encounters/public/unknown');assert.match(main.innerHTML,/Unable to open/);
 route('#encounters/public/street/extra');assert.match(main.innerHTML,/Unable to open/);
 route('#encounters/public');assert.equal((main.innerHTML.match(/data-action="paired-start"/g)||[]).length,situationCount);
});
test('The interactive stage trail revisits the correct scene and retains the cast and role',()=>{
 for(const role of roles){
  action('paired-start',{id:'public-street',role});
  action('paired-answer',{index:'0'});action('paired-next');
  const before=state();
  assert.match(main.innerHTML,/class="route-dot is-visited" data-action="paired-revisit" data-index="0"/);
  assert.match(main.innerHTML,/aria-current="step"/);
  action('paired-revisit',{index:'0'});
  assert.equal(state().nodeId,encounters['public-street'].start);
  assert.equal(state().history.length,0);
  assert.equal(state().role,role);assert.deepEqual(state().cast,before.cast);
 }
});

test('Both situation browsers group every situation once and keep topics closed until requested',()=>{
 const expected={street:3,search:3,custody:2,young:2,fairness:4,discrimination:20};
 for(const hash of ['#play','#encounters/'+siteRole+'/all']){
  route(hash);
  const groups=[...main.innerHTML.matchAll(/<details class="situation-topic" data-situation-topic="([^"]+)" ([^>]*)>([\s\S]*?)<\/details>/g)];
  assert.deepEqual(groups.map(match=>match[1]),Object.keys(expected));
  for(const [,topic,attributes,content] of groups){
   assert.doesNotMatch(attributes,/\bopen\b/);
   const ids=[...content.matchAll(/data-action="paired-start" data-id="([^"]+)"/g)].map(match=>match[1]);
   assert.equal(ids.length,expected[topic],topic);
   for(const id of ids)assert.ok(encounters[id],id+' is playable');
   assert.ok(ids.every(id=>topic==='discrimination'?id.startsWith('discrimination-'):!id.startsWith('discrimination-')));
  }
  const all=[...main.innerHTML.matchAll(/data-action="paired-start" data-id="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(all).size,situationCount);
  assert.match(main.innerHTML,/data-action="paired-topic" data-topic="all"/);
 }
});

test('All topics collapses all groups, selected-topic routes open their group, and practice retains only its own situations',()=>{
 route('#play');action('paired-topic',{topic:'all'});
 assert.equal(location.hash,'#encounters/'+siteRole+'/all');
 assert.equal((main.innerHTML.match(/data-situation-topic="[^"]+" open/g)||[]).length,0);
 for(const topic of ['search','discrimination']){
  action('paired-topic',{topic});
  assert.match(main.innerHTML,new RegExp('data-situation-topic="'+topic+'" open'));
  assert.equal((main.innerHTML.match(/class="situation-topic"/g)||[]).length,1);
  action('paired-topic',{topic:'all'});
  assert.equal((main.innerHTML.match(/class="situation-topic"/g)||[]).length,6);
  assert.doesNotMatch(main.innerHTML,/data-situation-topic="[^"]+" open/);
 }
 route('#practice/'+siteRole+'/all');action('paired-topic',{topic:'all'});
 assert.doesNotMatch(main.innerHTML,/data-situation-topic="[^"]+" open/);
 const ids=[...main.innerHTML.matchAll(/data-action="start" data-id="([^"]+)"/g)].map(match=>match[1]);
 assert.deepEqual(ids.sort(),scenarios.map(s=>s.id).sort());
 assert.doesNotMatch(main.innerHTML,/data-situation-topic="discrimination"/);
});
