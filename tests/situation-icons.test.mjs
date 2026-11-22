import test from 'node:test';
import assert from 'node:assert/strict';
import {encounters} from '../encounters/catalog.mjs?v=pabi-privacy-20261122';
import {topicGroups} from '../encounters/presentation.mjs?v=pabi-privacy-20261122';
import {learningIcon,scenarioIcon,topicExplorer,practiceCards} from '../encounters/visuals.mjs?v=pabi-privacy-20261122';
import publicData from '../encounters/original-public.mjs?v=pabi-privacy-20261122';
import gardaData from '../encounters/original-garda.mjs?v=pabi-privacy-20261122';

test('Every situation uses its topic icon in both browsing and individual practice',()=>{
 const assigned=topicGroups.flatMap(topic=>topic.encounters);
 assert.deepEqual([...assigned].sort(),Object.keys(encounters).sort());
 assert.equal(new Set(assigned).size,assigned.length);
 for(const topic of topicGroups){
  const icon=learningIcon(topic.id);
  assert.notEqual(icon,learningIcon('reflect'),topic.id+' must have an explicit icon');
  for(const id of topic.encounters)assert.equal(scenarioIcon(id),icon,id);
  for(const role of ['public','garda'])assert.ok(topicExplorer([topic],role).includes(icon));
 }
 for(const [role,data] of [['public',publicData],['garda',gardaData]]){
  for(const scenario of data.scenarios){
   assert.ok(practiceCards([scenario],role).includes(scenarioIcon(role+'-'+scenario.id)));
  }
 }
 assert.notEqual(learningIcon('discrimination'),learningIcon('fairness'));
 for(const topic of topicGroups){
  assert.match(learningIcon(topic.id),/viewBox="0 0 32 32"/);
  assert.match(learningIcon(topic.id),/stroke-width="1.7"/);
  assert.match(learningIcon(topic.id),/aria-hidden="true" focusable="false"/);
 }
});
