import test from 'node:test';
import assert from 'node:assert/strict';
import {messages} from '../locales/messages.mjs';
import {languages,normaliseLanguage,languageInfo} from '../locales/languages.mjs';
import {loadLanguage,translateText,translateHTML,escapeHTML} from '../locales/translate.mjs?v=site-languages-1';
import {createPreferences,defaults,LANGUAGE_KEY,preferencesStorageKey} from '../accessibility/preferences.mjs';
import {encounters,roles} from '../encounters/catalog.mjs';
import {startEncounter,answer,continueEncounter,switchRole,stateHash,decodeState} from '../encounters/engine.mjs';
import {personalizeText,storyIdentity} from '../encounters/narrative.mjs';
import {progressStorageKey} from '../encounters/progress.mjs';
import {siteRole,siteBase} from './site-fixture.mjs';

const added=languages.filter(language=>!['en','ga'].includes(language.id));
const ids=messages.map((_,index)=>'m'+String(index).padStart(4,'0'));
const tokens=text=>(text.match(/\{\w+\}/g)||[]).sort();
for(const {id} of added){
 const {default:pack}=await import(`../locales/${id}-content.mjs`);
 await loadLanguage(id);
 test(`${id}: the complete catalogue has every message and preserves interpolation tokens`,()=>{
  assert.deepEqual(Object.keys(pack).sort(),[...ids].sort());
  for(const [index,source] of messages.entries()){
   const value=pack[ids[index]];
   assert.equal(typeof value,'string',ids[index]);assert.ok(value.trim(),ids[index]);
   assert.deepEqual(tokens(value),tokens(source),`${id}/${ids[index]} must preserve dynamic values`);
   assert.doesNotMatch(value,/[<>]/,`${id}/${ids[index]} is plain text, not markup`);
  }
 });
 test(`${id}: all 59 shared stages and both roles have translated learning content`,()=>{
  let stages=0,choices=0;
  for(const encounter of Object.values(encounters))for(const node of Object.values(encounter.nodes)){
   stages++;
   const text=[node.scene,...roles.flatMap(role=>{const view=node.views[role];choices+=view.choices.length;return [view.prompt,view.lesson,...view.choices.flatMap(choice=>[choice.text,choice.feedback])];})];
   for(const source of text){assert.ok(messages.includes(source),source);assert.notEqual(translateText(source,id),source,`${id}: ${source}`);}
  }
  assert.equal(stages,59);assert.equal(choices,295);
 });
 test(`${id}: text and accessible descriptions translate without changing routes or control semantics`,()=>{
  const original='<section aria-labelledby="title"><h1 id="title">Scores &amp; progress</h1><button data-action="paired-start" data-id="garda-street" data-role="garda" aria-pressed="false" aria-label="Play this situation: A hunch on the street">Play this situation</button><input id="answer" name="answer" value="a&amp;b" placeholder="Choose a response"><img src="scene.webp" alt="On the street" title="Your character"><div role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="2" aria-valuetext="2 completed; 3 remaining"></div><a href="https://example.org/?a=1&amp;b=2" target="_blank" lang="en-IE" data-no-translate>Published source</a></section>';
  const out=translateHTML(original,id);
  for(const attribute of ['aria-labelledby="title"','data-action="paired-start"','data-id="garda-street"','data-role="garda"','aria-pressed="false"','name="answer"','value="a&amp;b"','src="scene.webp"','role="progressbar"','aria-valuemin="0"','aria-valuemax="5"','aria-valuenow="2"','href="https://example.org/?a=1&amp;b=2"','target="_blank"'])assert.ok(out.includes(attribute),attribute);
  for(const untranslated of ['>Scores &amp; progress<','placeholder="Choose a response"','alt="On the street"','title="Your character"','aria-valuetext="2 completed; 3 remaining"'])assert.ok(!out.includes(untranslated),untranslated);
  assert.ok(out.includes('aria-label="'+escapeHTML(translateText('Play this situation: A hunch on the street',id))+'"'));
  assert.match(out,/>Published source<\/a>/);
  assert.equal(translateHTML('<p>&lt;script&gt;&amp;"</p>',id),'<p>&lt;script&gt;&amp;&quot;</p>');
  assert.ok(!translateText('You explored 3 decisions with Noor. There are 2 points to revisit below.',id).includes('{'));
  assert.ok(translateText('You explored 3 decisions with Noor. There are 2 points to revisit below.',id).includes('Noor'));
  assert.notEqual(translateText('· European contexts',id),'· European contexts');
  assert.equal(translateText('/ 14 situations completed',id),'/ 14 '+translateText('Completed',id));
  const review='A selected review of 27 academic publications, alongside Irish law, professional guidance and community research. Each source explains how it informed the game.';
  assert.notEqual(translateText(review,id),review);assert.ok(translateText(review,id).includes('27'));
 });
}

test('Language codes, saved role settings and carried links retain their independent contracts',()=>{
 assert.deepEqual(added.map(x=>x.id),['pt','ar','pl','ro','fr','es','zh-Hans']);
 assert.equal(normaliseLanguage('zh-CN'),'zh-Hans');assert.equal(normaliseLanguage('pt-PT'),'pt');assert.equal(normaliseLanguage('not-a-language'),'en');
 assert.equal(languageInfo('ar').dir,'rtl');assert.equal(languageInfo('zh-Hans').tag,'zh-Hans');
 const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
 createPreferences(storage,'','public').save({...defaults,size:150,language:'fr'});
 assert.equal(createPreferences(storage,'','garda').value.language,'fr');
 createPreferences(storage,'?lang=ar','garda').save({...defaults,language:'ar',contrast:'high'});
 assert.equal(createPreferences(storage,'','public').value.language,'fr');
 assert.equal(createPreferences(storage,'?lang=zh-Hans','public').value.language,'zh-Hans');
 assert.equal(createPreferences(storage,'','public').value.size,150);
 assert.equal(createPreferences(storage,'','garda').value.size,100);
 assert.equal(memory.get(LANGUAGE_KEY),'ar');
 assert.ok(memory.has(preferencesStorageKey('public'))&&memory.has(preferencesStorageKey('garda')));
 const blocked=createPreferences({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});
 blocked.save({...defaults,language:'ar'});assert.equal(blocked.value.language,'ar');assert.equal(blocked.available,false);
});

test('Personalisation preserves names even next to Chinese or Arabic characters',()=>{
 const e=encounters['garda-street'],cast={public:'public-2',garda:'garda-5'};
 assert.equal(storyIdentity(e).name,'Alex');
 assert.equal(personalizeText('此时Alex站在店外。Alexandria is a different word.',e,cast),'此时Noor站在店外。Alexandria is a different word.');
 assert.equal(personalizeText('يسألAlex عن السبب.',e,cast),'يسألNoor عن السبب.');
});

test('Arabic numeric score ratios are directionally isolated without changing their values',()=>{
 const result=translateHTML('<strong>1 / 3 · 33%</strong><p>0 / 1 point</p>','ar');
 assert.ok(result.includes('<bdi dir="ltr">1 / 3 · 33%</bdi>'));
 assert.ok(result.includes('<bdi dir="ltr">0 / 1</bdi>'));
 assert.equal(translateHTML('<strong>1 / 3 · 33%</strong>','en'),'<strong>1 / 3 · 33%</strong>');
});

// This adapter exercises the real application modules and saved-state contract.
// Keyboard, layout, focus and browser loading behaviour have separate browser tests.
const memory=new Map(),callbacks={},dialogCallbacks={},focused=[];
let address=new URL('https://example.test/?lang=en'),assignments=0;
const main={innerHTML:'',attrs:{},setAttribute(k,v){this.attrs[k]=v;},focus(){},scrollIntoView(){},addEventListener(k,v){callbacks[k]=v;}};
const opener={id:'language-settings-trigger',isConnected:true,hasAttribute:k=>k==='data-reading-open',focus(){focused.push('settings');}};
const dialog={open:false,innerHTML:'',addEventListener(k,v){dialogCallbacks[k]=v;},showModal(){this.open=true;},close(){this.open=false;dialogCallbacks.close?.();},querySelector:()=>({focus(){}})};
const siteLink={href:'',textContent:''},live={textContent:''};
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
globalThis.location={get hash(){return address.hash;},set hash(value){address.hash=value;assignments++;},get search(){return address.search;},get href(){return address.href;}};
globalThis.history={replaceState(_state,_title,url){address=new URL(url,address);}};
globalThis.document={title:'',documentElement:{lang:'en-IE',attrs:{},setAttribute(k,v){this.attrs[k]=v;},style:{setProperty(){}},classList:{toggle(){}}},querySelector(q){if(q==='#main')return main;if(q==='#reading-dialog')return dialog;if(q==='[data-reading-open]')return opener;if(q==='[data-site-switch]')return siteLink;if(q==='#page-status')return live;return null;},querySelectorAll(q){return q==='[data-reading-open]'?[opener]:[];},getElementById(id){return id===opener.id?opener:null;},addEventListener(k,v){callbacks['document-'+k]=v;}};
globalThis.window={scrollTo(){},addEventListener(k,v){callbacks[k]=v;}};
await import(new URL('app.mjs',siteBase));
const current=()=>decodeState(location.hash.slice(11).split('~')[0]);
function route(hash){location.hash=hash;callbacks.hashchange();assert.doesNotMatch(main.innerHTML,/class="error"/);}
function action(name,extra={}){const before=assignments;callbacks.click({target:{closest:()=>({dataset:{action:name,...extra}})}});if(assignments!==before)callbacks.hashchange();assert.doesNotMatch(main.innerHTML,/class="error"/);}
function settings(language){
 callbacks['document-click']({target:{closest:()=>opener}});assert.ok(dialog.open);
 assert.equal((dialog.innerHTML.match(/<option value="(?:en|ga|pt|ar|pl|ro|fr|es|zh-Hans)"/g)||[]).length,9);
 dialogCallbacks.submit({preventDefault(){},target:{elements:{language:{value:language},size:{value:'150'},contrast:{value:'high'},spacing:{checked:true},motion:{checked:true}}}});
 assert.equal(dialog.open,false);assert.equal(focused.at(-1),'settings');
}
const storageKey=progressStorageKey(siteRole);
test(`${siteRole}: every new language retains chosen answers, cast, stage, role and stored scores`,()=>{
 route(stateHash(startEncounter('public-search','public',{cast:{public:'public-2',garda:'garda-5'}})));
 action('paired-answer',{index:'0'});action('paired-switch');action('paired-answer',{index:'1'});
 const before=current(),saved=memory.get(storageKey),hash=location.hash;
 for(const language of added){
  settings(language.id);
  assert.deepEqual(current(),before);assert.equal(location.hash,hash);assert.equal(memory.get(storageKey),saved);
  assert.equal(document.documentElement.lang,language.tag);assert.equal(document.documentElement.dir,language.dir);
  assert.equal(main.attrs.lang,language.tag);assert.equal(main.attrs.dir,language.dir);
  assert.equal(new URL(siteLink.href).searchParams.get('lang'),language.id);
  assert.ok(main.innerHTML.includes(escapeHTML(translateText('Your answer is recorded for this role.',language.id))));
 }
 settings('en');assert.deepEqual(current(),before);assert.equal(memory.get(storageKey),saved);
});

for(const language of added)test(`${siteRole}/${language.id}: every scene renders in the selected language with stable character names`,()=>{
 settings(language.id);let count=0;
 for(const e of Object.values(encounters)){
  const queue=[startEncounter(e.id,siteRole,{cast:{public:'public-2',garda:'garda-5'}})],seen=new Set();
  while(queue.length){
   const base=queue.shift();if(base.complete||seen.has(base.nodeId))continue;seen.add(base.nodeId);count++;
   route(stateHash(base));
   const node=e.nodes[base.nodeId],translated=personalizeText(translateText(node.scene,language.id),e,base.cast);
   assert.ok(main.innerHTML.includes(escapeHTML(translated)),`${language.id}/${e.id}/${node.id}`);
   assert.match(main.innerHTML,/data-character-id="public-2"/);assert.match(main.innerHTML,/data-character-id="garda-5"/);
   for(const role of roles)for(let index=0;index<node.views[role].choices.length;index++)queue.push(continueEncounter(answer(switchRole(base,role),index)));
  }
 }
 assert.equal(count,59);
});

test(`${siteRole}: original practice, references and recaps keep their functionality in every new language`,()=>{
 const {id}=Object.values(encounters).find(e=>e.id===siteRole+'-street');
 settings('en');route('#scenario/street');action('choose',{index:'1'});
 const originalHash=location.hash;
 for(const language of added){
  settings(language.id);assert.equal(location.hash,originalHash);
  assert.match(main.innerHTML,/class="choice selected"/);assert.match(main.innerHTML,/id="feedback"/);
  assert.match(main.innerHTML,/data-action="next"/);assert.match(main.innerHTML,/data-action="paired-transfer"/);
 }
 action('next');assert.equal(location.hash,originalHash);assert.doesNotMatch(main.innerHTML,/class="choice selected"/);
 const encounter=encounters[id];let completed=startEncounter(id,siteRole,{cast:{public:'public-2',garda:'garda-5'}});
 while(!completed.complete)completed=continueEncounter(answer(completed,0));
 route(stateHash(completed));
 const recapHash=location.hash,saved=memory.get(storageKey);
 for(const language of added){
  settings(language.id);assert.equal(location.hash,recapHash);assert.deepEqual(current(),completed);assert.equal(memory.get(storageKey),saved);
  assert.match(main.innerHTML,/class="[^"]*\bpaired-recap\b/);
  for(const hash of ['#about','#accessibility',siteRole==='public'?'#rights':'#evidence','#progress']){
   route(hash);assert.equal(main.attrs.lang,language.tag);assert.equal(main.attrs.dir,language.dir);
   assert.doesNotMatch(main.innerHTML,/>Learn at your own pace\.</);
  }
  route(recapHash);assert.deepEqual(current(),completed);
 }
});
