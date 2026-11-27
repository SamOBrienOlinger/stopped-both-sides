import test from 'node:test';
import assert from 'node:assert/strict';
import {searchSite} from '../search/site-search.mjs?v=site-repairs-20261125';
import {loadLanguage} from '../locales/active-language.mjs';

test('Keyword search finds every Discrimination ground, colleague variations and About contributors',()=>{
 const matches=searchSite('discrimination');
 assert.equal(matches.filter(entry=>entry.kind==='situation'&&entry.id.startsWith('discrimination-')).length,20);
 const race=searchSite('racial profiling');
 assert.ok(race.some(entry=>entry.kind==='situation'));
 assert.ok(race.some(entry=>entry.kind==='source'));
 assert.ok(searchSite('AONTAS').some(entry=>entry.kind==='page'&&entry.href==='#about'));
 assert.ok(searchSite('border').some(entry=>entry.kind==='page'&&entry.href==='#about'));
});

test('Keyword search ignores case and accents, requires every word and treats punctuation as text',()=>{
 const ids=query=>searchSite(query).map(entry=>entry.kind+':'+(entry.id||entry.href));
 assert.deepEqual(ids('GARDA SÍOCHÁNA'),ids('garda siochana'));
 assert.deepEqual(ids(''),[]);
 assert.deepEqual(ids('   !!!   '),[]);
 assert.deepEqual(ids('no_such_result_732881'),[]);
 assert.ok(ids('Traveller').length>ids('Traveller housing').length);
 assert.deepEqual(ids('<script>'),ids('script'));
});

test('Search uses translated keywords and each entrypoint’s reference routes',async()=>{
 for(const language of ['ar','fr','zh-Hans'])await loadLanguage(language);
 for(const [language,query] of [['ar','التمييز'],['fr','discrimination'],['zh-Hans','歧视']]){
  assert.equal(searchSite(query,{language}).filter(entry=>entry.kind==='situation'&&entry.id.startsWith('discrimination-')).length,20);
 }
 assert.ok(searchSite('sources').some(entry=>entry.href==='#rights'));
 assert.ok(searchSite('evidence',{siteRole:'garda'}).some(entry=>entry.href==='#evidence'));
});

test('Search finds printed page and citation titles, support services, authors and all single-role practice phrases from both sites',async()=>{
 const {encounters,references}=await import('../encounters/catalog.mjs?v=site-repairs-20261125');
 const {translateText}=await import('../locales/active-language.mjs');
 const {privacyNotices}=await import('../locales/privacy-notice.mjs');
 const {communitySources}=await import('../learning/community-resources.mjs?v=site-repairs-20261125');
 for(const language of ['en','ga','pt','ar','pl','ro','fr','es','zh-Hans']){
  await loadLanguage(language);
  for(const siteRole of ['public','garda']){
   const search=query=>searchSite(query,{language,siteRole});
   assert.equal(search('Stopped: Both Sides')[0].href,'#play');
   assert.equal(search(translateText('One situation. Two perspectives.',language))[0].href,'#play');
   assert.match(search('Privacy & local storage')[0].href,/privacy\.html/);
   if(privacyNotices[language]){
    for(const key of ['title','local','retention','transfer','hosting','external','contact','email','rights']){
     assert.ok(search(privacyNotices[language][key].slice(0,90)).some(entry=>entry.href?.includes('privacy.html')),language+' '+key);
    }
   }
   assert.match(search('Garda Guidance')[0].href,/#evidence$/);
   assert.match(search('Human and Civil Rights')[0].href,/#rights$/);
   for(const name of ['FLAC','PCSA'])assert.match(search(name)[0].href,/#rights\/support\/(advice|oversight)$/);
   assert.ok(search('Nickerson').some(entry=>entry.href===references['garda:nickerson'].url));
   for(const encounter of Object.values(encounters)){
    assert.equal(search(translateText(encounter.title,language))[0].id,encounter.id);
   }
   for(const source of [...Object.values(communitySources),...Object.values(references)]){
    assert.ok(search(source.title).slice(0,20).some(entry=>entry.href===source.url),source.title);
   }
   for(const encounter of Object.values(encounters).filter(e=>e.originalId)){
    for(const stage of Object.values(encounter.nodes)){
     const phrase=stage.views[encounter.origin].phrase;
     if(!phrase)continue;
     const results=search(translateText(phrase,language)).slice(0,20);
     assert.ok(results.some(entry=>entry.id===encounter.id),phrase);
     assert.ok(results.some(entry=>entry.kind==='practice'&&entry.href.endsWith('#scenario/'+encounter.originalId)),phrase);
    }
   }
  }
 }
});
