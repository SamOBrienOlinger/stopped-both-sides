import test from 'node:test';
import assert from 'node:assert/strict';
import {learningAbout} from '../learning/about.mjs';
import {messages} from '../locales/messages.mjs';
import {languages} from '../locales/languages.mjs';
import {loadLanguage,translateHTML,translateText} from '../locales/translate.mjs?v=pedagogy-1';

test('About learning content has complete translations while retaining identifiable source metadata',async()=>{
 const html=learningAbout();
 // Publication titles/authors are intentionally English. Everything else in
 // this shared section must be registered, not silently left untranslated.
 const prose=html.replace(/<(a|div)\b[^>]*\bdata-no-translate[^>]*>[\s\S]*?<\/\1>/g,'');
 const strings=[...new Set(prose.split(/<[^>]*>/).map(value=>value.trim()).filter(value=>/\p{L}/u.test(value)))];
 for(const source of strings)assert.ok(messages.includes(source),`Unregistered About text: ${source}`);
 const sourceLinks=[...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);
 assert.ok(sourceLinks.every(url=>url.startsWith('https://')),'Reference links must not activate the application hash router');
 for(const {id} of languages.filter(language=>!['en','ga'].includes(language.id))){
  await loadLanguage(id);
  for(const source of strings){
   // The acronym and French minute labels legitimately match English.
   const sameWording=source==='DOI'||(id==='fr'&&/^\d+ minutes$/.test(source));
   if(!sameWording)assert.notEqual(translateText(source,id),source,`${id}: untranslated About text: ${source}`);
  }
  const translated=translateHTML(html,id);
  assert.deepEqual([...translated.matchAll(/href="([^"]+)"/g)].map(match=>match[1]),sourceLinks);
  assert.ok(translated.includes('A meta-analysis of the cognitive and motivational effects of serious games.'));
  assert.match(translated,/lang="en-IE" dir="ltr" data-no-translate/);
 }
});
