import test from 'node:test';
import assert from 'node:assert/strict';
import {supportSection,supportRecap} from '../learning/support.mjs';
import {messages} from '../locales/messages.mjs';
import {languages} from '../locales/languages.mjs';
import {loadLanguage,translateHTML,translateText} from '../locales/translate.mjs?v=support-resources-1';

const links=html=>[...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);
const textNodes=html=>[...new Set(html.replace(/<h3\b[^>]*data-no-translate[^>]*>[\s\S]*?<\/h3>/g,'').split(/<[^>]*>/).map(text=>text.trim().replaceAll('&amp;','&')).filter(text=>/\p{L}/u.test(text)))];

test('Support descriptions and controls translate without changing official destinations or organisation names',async()=>{
 const section=supportSection(),recap=supportRecap(),strings=[...textNodes(section+recap),'Advice & support'];
 const destinations=[
  'https://www.fiosru.ie/complaints/submit-a-complaint/',
  'https://www.pcsaireland.ie/about-us/what-we-do/',
  'https://www.flac.ie/help/'
 ];
 assert.deepEqual(links(section),destinations);
 for(const text of strings)assert.ok(messages.includes(text),`Unregistered support text: ${text}`);
 for(const {id} of languages.filter(language=>!['en','ga'].includes(language.id))){
  await loadLanguage(id);
  for(const text of strings)assert.notEqual(translateText(text,id),text,`${id}: untranslated support text: ${text}`);
  const html=translateHTML(section,id);
  assert.deepEqual(links(html),destinations);
  for(const name of ['Fiosrú','PCSA','FLAC'])assert.ok(html.includes(`data-no-translate>${name}<span>`));
 }
 for(const text of [...textNodes(recap),'Advice & support'])assert.notEqual(translateText(text,'ga'),text,`Untranslated Irish support control: ${text}`);
});

test('Recap support links stay in the project and resolve to the same public section from either entrypoint',()=>{
 for(const base of ['https://samobrienolinger.github.io/stopped-both-sides/','https://example.org/']){
  for(const role of ['public','garda']){
   const href=links(supportRecap(role))[0];
   assert.equal(new URL(href,base+(role==='garda'?'garda/':'')).href,base+'#rights/support');
  }
 }
});
