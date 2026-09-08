import test from 'node:test';
import assert from 'node:assert/strict';
import {siteRole,siteBase} from './site-fixture.mjs';
import {encounters} from '../dist/encounters/catalog.mjs';
import {gaContent,translateHTML,translateText} from '../dist/locales/translate.mjs';
import {defaults,createPreferences,normalisePreferences,PREFERENCES_KEY} from '../dist/accessibility/preferences.mjs';
import {decodeState} from '../dist/encounters/engine.mjs';
import {STORAGE_KEY,progressStorageKey} from '../dist/encounters/progress.mjs';

test('Irish content covers every shared stage and both roles without altering choice order or route identifiers',()=>{
 let stages=0;
 assert.deepEqual(Object.keys(gaContent),Object.keys(encounters));
 for(const e of Object.values(encounters)){
  const ga=gaContent[e.id];assert.ok(ga.title&&ga.description);assert.deepEqual(Object.keys(ga.nodes),Object.keys(e.nodes));
  for(const node of Object.values(e.nodes)){stages++;const translated=ga.nodes[node.id];assert.ok(translated.title&&translated.scene);
   assert.notEqual(translateText(node.scene,'ga'),node.scene);
   for(const role of ['public','garda']){const v=node.views[role],a=translated[role];assert.equal(a.length,2+2*v.choices.length);assert.ok(a.every(s=>typeof s==='string'&&s.trim().length>5));
    for(const s of [v.prompt,v.lesson,...v.choices.flatMap(c=>[c.text,c.feedback])])assert.notEqual(translateText(s,'ga'),s,`${e.id}/${node.id}: ${s}`);
   }
  }
 }
 assert.equal(stages,59);
});
test('Translation preserves routes, semantic attributes, source language and escaped content',()=>{
 const html='<section aria-labelledby="title"><h1 id="title">Scores &amp; progress</h1><button data-action="paired-start" data-id="garda-street" aria-label="Play as the Garda: A hunch on the street">Play as the Garda</button><details><summary>Read the sources for this decision</summary><ul lang="en-IE" data-no-translate><li><a href="https://example.org/?a=1&amp;b=2" target="_blank">A hunch on the street</a></li></ul></details><p>Why this matters</p></section>';
 const out=translateHTML(html,'ga');assert.match(out,/Scóir agus dul chun cinn/);assert.match(out,/data-action="paired-start" data-id="garda-street"/);assert.match(out,/aria-label="Imir mar Gharda: Amhras ar an tsráid"/);assert.match(out,/>A hunch on the street<\/a>/);assert.match(out,/a=1&amp;b=2/);assert.match(out,/>Cén fáth a bhfuil sé seo tábhachtach<\/p>/);assert.equal(translateHTML(html,'en'),html);
 assert.equal(translateHTML('<p>&lt;script&gt;&amp;"</p>','ga'),'<p>&lt;script&gt;&amp;&quot;</p>');
});
test('Invalid reading settings are normalised, blocked storage remains usable, and reading data never overwrites scores',()=>{
 assert.deepEqual(normalisePreferences({language:'javascript:',size:999,contrast:'no',spacing:'true'}),defaults);
 const memory=new Map([[STORAGE_KEY,'keep']]);const store={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 const prefs=createPreferences(store,'?lang=ga');assert.equal(prefs.value.language,'ga');prefs.save({...prefs.value,size:150,contrast:'high',spacing:true,motion:true});assert.equal(memory.get(STORAGE_KEY),'keep');assert.equal(createPreferences(store).value.size,150);
 const blocked=createPreferences({getItem(){throw Error();},setItem(){throw Error();}});blocked.save({...defaults,language:'ga'});assert.equal(blocked.value.language,'ga');assert.equal(blocked.available,false);
});

// Application integration with a small DOM adapter; this is not a browser or assistive-technology audit.
const role=siteRole;
const siteStorageKey=progressStorageKey(role);
const memory=new Map(),callbacks={},dialogCallbacks={},focused=[],classes=new Set();let address=new URL('https://example.test/?lang=en'),assignments=0;
const main={innerHTML:'',attrs:{},setAttribute(k,v){this.attrs[k]=v;},focus(){focused.push('main');},scrollIntoView(){},addEventListener(k,v){callbacks[k]=v;}};
const heading=id=>({focus(){focused.push(id);},scrollIntoView(){}});
const openButton={isConnected:true,hasAttribute:k=>k==='data-reading-open',focus(){focused.push('settings');},textContent:''};
const siteLink={href:'',textContent:''};
const dialog={open:false,innerHTML:'',addEventListener(k,v){dialogCallbacks[k]=v;},showModal(){this.open=true;},close(){this.open=false;dialogCallbacks.close?.();},querySelector:()=>heading('reading-title')};
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
globalThis.location={get hash(){return address.hash;},set hash(v){address.hash=v;assignments++;},get search(){return address.search;},get href(){return address.href;}};
globalThis.history={replaceState(_state,_title,url){address=new URL(url,address);}};
globalThis.document={title:'',documentElement:{lang:'en-IE',attrs:{},setAttribute(k,v){this.attrs[k]=v;},style:{setProperty(){}},classList:{toggle(k,v){if(v)classes.add(k);else classes.delete(k);}}},querySelector(q){if(q==='#main')return main;if(q==='#reading-dialog')return dialog;if(q==='[data-reading-open]')return openButton;if(q==='[data-site-switch]')return siteLink;if(q==='#page-status')return {textContent:''};if(q==='#feedback'||q==='#choice-title'||q==='h1'||q==='[data-action="paired-clear"]'||q==='[data-action="paired-clear-confirm"]')return heading(q);return null;},querySelectorAll(q){return q==='[data-reading-open]'?[openButton]:[];},addEventListener(k,v){callbacks['document-'+k]=v;}};
globalThis.window={scrollTo(){},addEventListener(k,v){callbacks[k]=v;}};
await import(new URL('app.mjs',siteBase));
function route(hash){location.hash=hash;callbacks.hashchange();assert.doesNotMatch(main.innerHTML,/The game could not load/);}
function action(name,extra={}){const n=assignments;callbacks.click({target:{closest:()=>({dataset:{action:name,...extra}})}});if(n!==assignments)callbacks.hashchange();assert.doesNotMatch(main.innerHTML,/The game could not load/);}
function settings(language='ga'){
 callbacks['document-click']({target:{closest:()=>openButton}});assert.ok(dialog.open);assert.match(dialog.innerHTML,/id="reading-language"/);
 dialogCallbacks.submit({preventDefault(){},target:{elements:{language:{value:language},size:{value:'150'},contrast:{value:'high'},spacing:{checked:true},motion:{checked:true}}}});
 assert.equal(dialog.open,false);assert.equal(focused.at(-1),'settings');assert.ok(classes.has('contrast-high'));assert.ok(classes.has('reading-spacious'));
}
const current=()=>decodeState(location.hash.slice(11).split('~')[0]);
test('Applying Irish in a live situation retains both answers, stage, role and saved scores; companion links carry language',()=>{
 route('#encounters/public');assert.equal(document.documentElement.attrs['data-perspective'],'public');action('paired-start',{id:'public-search',role:'public'});action('paired-answer',{index:'0'});assert.equal(focused.at(-1),'#feedback');
 action('paired-switch');assert.equal(document.documentElement.attrs['data-perspective'],'garda');assert.equal(focused.at(-1),'#choice-title');action('paired-answer',{index:'1'});
 const before=current(),saved=memory.get(siteStorageKey);settings('ga');assert.deepEqual(current(),before);assert.equal(memory.get(siteStorageKey),saved);assert.equal(document.documentElement.lang,'ga');assert.equal(main.attrs.lang,'ga');assert.match(main.innerHTML,/Athraigh go dearcadh an phobail/);assert.match(main.innerHTML,/Roghnaithe/);assert.equal(new URL(siteLink.href).searchParams.get('lang'),'ga');
 settings('en');assert.equal(document.documentElement.attrs['data-perspective'],'garda');assert.deepEqual(current(),before);assert.equal(memory.get(siteStorageKey),saved);assert.match(main.innerHTML,/Your answer is recorded/);
});
test('Choosing Irish during original play transfers the exact active choice into the matching shared situation',()=>{
 settings('en');route('#scenario/street');action('choose',{index:'1'});settings('ga');const s=current();assert.equal(s.id,role+'-street');assert.equal(s.role,role);assert.equal(document.documentElement.attrs['data-perspective'],role);assert.equal(s.nodeId,'street-start');assert.equal(s.answers[role],1);assert.match(main.innerHTML,/SCÉAL ROINNTE/);
});
test('Irish reference navigation marks English content and returns without losing the shared state; progress and clear controls translate',()=>{
 const before=current(),hash=location.hash;route(role==='public'?'#rights':'#evidence');assert.equal(main.attrs.lang,'en-IE');assert.match(main.innerHTML,/lang="ga"/);route(hash);assert.equal(document.documentElement.attrs['data-perspective'],before.role);assert.deepEqual(current(),before);route('#progress');assert.match(main.innerHTML,/Scóir agus dul chun cinn/);action('paired-clear');assert.match(main.innerHTML,/Coinnigh dul chun cinn/);assert.equal(focused.at(-1),'[data-action="paired-clear-confirm"]');action('paired-clear-cancel');assert.ok(memory.has(siteStorageKey));route('#accessibility');assert.match(main.innerHTML,/WCAG 2.2 Level AA/);assert.match(main.innerHTML,/Manual browser zoom and reflow checks/);
});
