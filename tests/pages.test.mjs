import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {siteAddresses} from '../site.mjs';
const sites=siteAddresses('https://samobrienolinger.github.io/stopped-both-sides/');
import {startEncounter,answer,switchRole,stateHash,decodeState} from '../encounters/engine.mjs';
import {createProgressStore,emptyProgress,recordProgress,mergeProgress,packProgress,unpackProgress} from '../encounters/progress.mjs';
import {createPreferences} from '../accessibility/preferences.mjs';
import {translateText,translateHTML} from '../locales/translate.mjs';

test('The repository and both entrypoints use the agreed Stopped branding',()=>{
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url)));
 assert.equal(pkg.name,'stopped-both-sides');
 const subtitle='An interactive learning game for the public and Gardaí.';
 for(const path of ['','garda/']){
  const html=readFileSync(new URL('../'+path+'index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../'+path+'app.mjs',import.meta.url),'utf8');
  assert.match(html,/<title>Stopped: Both Sides \| (Public|Garda) perspective<\/title>/);
  assert.ok(html.includes(subtitle));assert.ok(app.includes(subtitle));
  assert.match(app,/<h1 id="game-title" lang="en-IE" data-no-translate>Stopped: Both Sides<\/h1>/);
  assert.doesNotMatch(html+app,/Why are you stopping me\?|Why am I stopping you\?/);
 }
 assert.notEqual(translateText(subtitle,'ga'),subtitle);
 assert.equal(translateHTML('<h1 lang="en-IE" data-no-translate>Stopped: Both Sides</h1>','ga'),'<h1 lang="en-IE" data-no-translate>Stopped: Both Sides</h1>');
});

test('The two Pages paths keep independent progress and preferences while transferring the same situation',()=>{
 const memory=new Map();const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const publicStore=createProgressStore(storage,'public'),gardaStore=createProgressStore(storage,'garda');
 const state=answer(switchRole(answer(startEncounter('public-search'),0),'garda'),1);
 publicStore.save(recordProgress(emptyProgress(),state));
 assert.deepEqual(createProgressStore(storage,'garda').value,emptyProgress());
 const target=new URL(sites.garda);target.searchParams.set('lang','ga');target.hash=stateHash(state)+'~'+packProgress(publicStore.value);
 assert.equal(target.origin,new URL(sites.public).origin);
 assert.equal(target.pathname,'/stopped-both-sides/garda/');
 const [scene,progress]=target.hash.slice(11).split('~');assert.deepEqual(decodeState(scene),state);
 gardaStore.save(mergeProgress(gardaStore.value,unpackProgress(progress)));
 const publicPrefs=createPreferences(storage,'','public');publicPrefs.save({...publicPrefs.value,size:150});
 const gardaPrefs=createPreferences(storage,target.search,'garda');gardaPrefs.save({...gardaPrefs.value,contrast:'high'});
 assert.equal(createPreferences(storage,'','public').value.language,'en');
 assert.equal(createPreferences(storage,'','garda').value.size,100);
 assert.equal(createPreferences(storage,'','garda').value.language,'ga');
 publicStore.clear();
 assert.deepEqual(createProgressStore(storage,'public').value,emptyProgress());
 assert.deepEqual(createProgressStore(storage,'garda').value,recordProgress(emptyProgress(),state));
 assert.equal(createPreferences(storage,'','public').value.size,150);
});

test('HTML, CSS and module assets resolve inside the GitHub Pages project directory',()=>{
 const root=new URL('../',import.meta.url);
 assert.ok(statSync(new URL('.nojekyll',root)).isFile(),'Branch publishing must serve the authored static files');
 const name=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).name;
 const base=new URL(`https://samobrienolinger.github.io/${name}/`);
 let checked=0;
 function walk(directory,relative=''){
  for(const entry of readdirSync(directory,{withFileTypes:true})){
   if(entry.name.startsWith('.')||['node_modules','scripts','tests','docs','research'].includes(entry.name))continue;
   const path=relative+entry.name,file=new URL(path,root);
   assert.equal(entry.isSymbolicLink(),false,'Pages artifacts must not contain symlinks');
   if(entry.isDirectory()){walk(file,path+'/');continue;}
   if(!/\.(html|css|mjs)$/.test(path))continue;
   const content=readFileSync(file,'utf8');
   const expressions=path.endsWith('.html')?[/\b(?:href|src)="([^"\n]+)"/g]:path.endsWith('.css')?[/url\(['"]?([^)'"\s]+)['"]?\)/g]:[/\bfrom\s*['"]([^'"]+)['"]/g,/\bimport\s*['"]([^'"]+)['"]/g];
   for(const expression of expressions)for(const match of content.matchAll(expression)){
    const ref=match[1];if(/^(?:#|https?:|data:|mailto:)/.test(ref))continue;
    const resolved=new URL(ref,new URL(path,base));
    assert.ok(resolved.href.startsWith(base.href),`${path}: ${ref} escapes the project path`);
    let asset=new URL(resolved.pathname.slice(base.pathname.length),root);
    if(statSync(asset).isDirectory())asset=new URL('index.html',asset);
    assert.ok(statSync(asset).isFile(),`${path}: missing ${ref}`);checked++;
   }
  }
 }
 walk(root);assert.ok(checked>20);
});

test('Both entrypoints stay within one deployment on Pages, custom domains and local servers',()=>{
 for(const base of ['https://samobrienolinger.github.io/stopped-both-sides/','https://example.org/','http://localhost:8000/']){
  const addresses=siteAddresses(base);
  assert.equal(addresses.public,base);assert.equal(addresses.garda,base+'garda/');
  for(const [role,path] of [['public','index.html'],['garda','garda/index.html']]){
   const html=readFileSync(new URL('../'+path,import.meta.url),'utf8');
   const fallback=html.match(/data-site-switch href="([^"]+)"/)[1];
   const target=new URL(fallback,addresses[role]);
   assert.equal(new URL('./',target).href,addresses[role==='public'?'garda':'public']);
  }
 }
 const gardaShell=readFileSync(new URL('../garda/index.html',import.meta.url),'utf8');
 assert.match(gardaShell,/\.\.\/accessibility\/perspectives\.css/);
 assert.match(gardaShell,/\.\.\/encounters\/styles\.css/);
 const gardaApp=readFileSync(new URL('../garda/app.mjs',import.meta.url),'utf8');
 assert.match(gardaApp,/from '\.\.\/encounters\/ui\.mjs'/);
});
