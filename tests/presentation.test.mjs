import test from 'node:test';
import assert from 'node:assert/strict';
import {encounters,roles} from '../encounters/catalog.mjs';
import {startEncounter,answer,continueEncounter,switchRole} from '../encounters/engine.mjs';
import {remainingDecisions,variations,topicGroups,learningStatus} from '../encounters/presentation.mjs';
import {recordProgress,emptyProgress} from '../encounters/progress.mjs';
import {translateText} from '../locales/translate.mjs';

test('Remaining-decision ranges bound every possible continuation, including perspective changes',()=>{
 for(const e of Object.values(encounters)){
  function walk(state){
   if(state.complete){assert.deepEqual(remainingDecisions(state),{min:0,max:0});return [0];}
   const range=remainingDecisions(state),lengths=[];
   for(const role of roles)for(let i=0;i<e.nodes[state.nodeId].views[role].choices.length;i++){
    lengths.push(...walk(continueEncounter(answer(switchRole(state,role),i))).map(n=>n+1));
   }
   assert.equal(range.min,Math.min(...lengths));assert.equal(range.max,Math.max(...lengths));return lengths;
  }
  walk(startEncounter(e.id));
 }
});
test('All scenario topics cover the catalogue exactly once and every explicit variation has a translated notice',()=>{
 assert.deepEqual(topicGroups.flatMap(t=>t.encounters).sort(),Object.keys(encounters).sort());
 for(const [key,v] of Object.entries(variations)){
  const [id,node]=key.split('/');assert.ok(encounters[id].nodes[node]);
  assert.notEqual(translateText(v.label,'ga'),v.label);assert.notEqual(translateText(v.detail,'ga'),v.detail);
 }
});
test('A partial role is in progress even with full points; completion requires its entire route',()=>{
 let s=answer(startEncounter('public-search'),0),progress=recordProgress(emptyProgress(),s);
 assert.equal(learningStatus(progress,s.id,'public'),'In progress');assert.equal(learningStatus(progress,s.id,'garda'),'Not started');
 while(!s.complete){if(s.answers.public===null)s=answer(s,0);s=continueEncounter(s);progress=recordProgress(progress,s);}
 assert.equal(learningStatus(progress,s.id,'public'),'Completed');assert.equal(learningStatus(progress,s.id,'garda'),'Not started');
});
