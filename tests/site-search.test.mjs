import test from 'node:test';
import assert from 'node:assert/strict';
import {searchSite} from '../search/site-search.mjs';
import {loadLanguage} from '../locales/translate.mjs?v=contributors-expanded-20261122';

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
