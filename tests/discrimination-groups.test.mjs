import test from 'node:test';
import assert from 'node:assert/strict';
import {topicGroups} from '../encounters/presentation.mjs?v=situation-locations-20261122';
import {encounters} from '../encounters/catalog.mjs?v=situation-locations-20261122';
import {discriminationGrounds} from '../encounters/visuals.mjs?v=situation-locations-20261122';
import {loadLanguage,translateHTML,translateText} from '../locales/translate.mjs?v=situation-locations-20261122';

const grounds=['gender','civil-status','family-status','sexual-orientation','age','religious-belief','traveller-community','race','disability','housing-assistance'];
const topic=topicGroups.find(group=>group.id==='discrimination');
const cards=group=>group.encounters.map(id=>`<button data-id="${id}">${id}</button>`).join('');
const render=openGround=>discriminationGrounds(topic,cards,{openGround});

test('Every IHREC ground contains only its original situation and colleague variation, with no duplicates',()=>{
 const groups=[...render().matchAll(/<details class="discrimination-ground" data-ground="([^"]+)" ([^>]*)>([\s\S]*?)<\/details>/g)];
 assert.deepEqual(groups.map(match=>match[1]),grounds);
 const assigned=[];
 for(const [,ground,attributes,content] of groups){
  assert.doesNotMatch(attributes,/\bopen\b/);
  assert.ok(content.includes(`<strong>${encounters['discrimination-'+ground].title}</strong>`));
  const ids=[...content.matchAll(/data-id="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(ids,['discrimination-'+ground,'discrimination-colleague-'+ground]);
  assert.ok(ids.every(id=>encounters[id].ground===ground));
  assigned.push(...ids);
 }
 assert.equal(new Set(assigned).size,20);
 assert.deepEqual(assigned,topic.encounters);
});

test('Returning to a situation reopens just its ground, while an ordinary list stays collapsed',()=>{
 for(const ground of grounds){
  const html=render(ground);
  assert.equal((html.match(/data-ground="[^"]+" open/g)||[]).length,1);
  assert.ok(html.includes(`data-ground="${ground}" open`));
 }
 assert.doesNotMatch(render(),/data-ground="[^"]+" open/);
});

test('Ground headings translate independently of the English scenarios and retain stable navigation identifiers',async()=>{
 for(const language of ['ga','ar','pl']){
  await loadLanguage(language);
  const html=translateHTML(render(),language);
  for(const ground of grounds){
   assert.ok(html.includes(`data-ground="${ground}"`));
   assert.ok(html.includes(`<strong>${translateText(encounters['discrimination-'+ground].title,language)}</strong>`));
   assert.ok(html.includes(`data-id="discrimination-colleague-${ground}"`));
  }
 }
});
