import test from 'node:test';
import assert from 'node:assert/strict';
import {encounters,references,roles,stageCount} from '../encounters/catalog.mjs?v=link-audit-20261123';
import {discriminationEncounters} from '../encounters/discrimination.mjs?v=situation-locations-20261122';
import {topicGroups} from '../encounters/presentation.mjs?v=link-audit-20261123';
import {startEncounter,answer,switchRole,continueEncounter,encodeState,decodeState} from '../encounters/engine.mjs?v=nia-public-20261123';
import {emptyProgress,recordProgress,packProgress,unpackProgress} from '../encounters/progress.mjs?v=nia-public-20261123';
import {renderScene} from '../encounters/scenes.mjs?v=nia-public-20261123';
import {storyIdentity,personalizeText} from '../encounters/narrative.mjs?v=nia-public-20261123';
import {learningIcon,scenarioIcon} from '../encounters/visuals.mjs?v=nia-public-20261123';
import {loadLanguage,translateText,translateHTML} from '../locales/translate.mjs?v=final-touches-20261125';
import {languages} from '../locales/languages.mjs';
import {scenarioCopy} from '../learning/play.mjs?v=nia-public-20261123';

const grounds=['gender','civil-status','family-status','sexual-orientation','age','religious-belief','traveller-community','race','disability','housing-assistance'];
const witnessCases=Object.values(encounters).filter(e=>e.kind==='colleague-witness');

test('Every ground retains its original situation and gains exactly one colleague-witness variation',()=>{
 assert.equal(Object.keys(encounters).length,34);
 assert.equal(stageCount,99);
 assert.equal(Object.keys(discriminationEncounters).length,20);
 assert.equal(witnessCases.length,10);
 const topic=topicGroups.find(item=>item.id==='discrimination');
 for(const ground of grounds){
  const original=encounters['discrimination-'+ground];
  const added=encounters['discrimination-colleague-'+ground];
  assert.ok(original);assert.equal(original.kind,undefined);
  assert.equal(added.ground,ground);
  assert.deepEqual(Object.keys(added.nodes),['opening','follow-up']);
  assert.ok(topic.encounters.includes(original.id));
  assert.ok(topic.encounters.includes(added.id));
  assert.equal(scenarioIcon(added.id),learningIcon('discrimination'));
 }
});

test('The illustrated and playable characters are witnesses, separate from the target and the colleague acting discriminatorily',()=>{
 const cast={public:'public-2',garda:'garda-5'};
 for(const e of witnessCases){
  assert.equal(e.people.public,'Public witness');
  assert.equal(e.people.garda,'Witnessing Garda');
  assert.equal(storyIdentity(e),null);
  const scene=renderScene(startEncounter(e.id,'public',{cast}));
  assert.match(scene,/<span class="sr-only">Character information<\/span> <strong><span data-no-translate>Noor<\/span><\/strong><span class="scene-character-role">Public witness<\/span>/);
  assert.match(scene,/Witnessing Garda/);
  for(const node of Object.values(e.nodes)){
   assert.match(node.views.public.context,/witnesses.*someone else/);
   assert.match(node.views.garda.context,/witnesses a colleague/);
   assert.equal(personalizeText(node.scene,e,cast),node.scene);
  }
 }
});

test('Each variation links ethical conduct and the relevant ground; public follow-up links direct-witness complaint guidance',()=>{
 for(const e of witnessCases)for(const node of Object.values(e.nodes))for(const role of roles){
  const refs=node.views[role].refs;
  assert.ok(refs.includes('equality:'+e.ground));
  assert.ok(refs.includes('policing:ethics-speaking-up'));
  for(const id of refs){assert.ok(references[id],id);assert.ok(references[id].url.startsWith('https://'));}
  if(node.id==='follow-up'&&role==='public')assert.ok(refs.includes('policing:witness-complaints'));
 }
 const disability=encounters['discrimination-colleague-disability'];
 for(const node of Object.values(disability.nodes))for(const role of roles)assert.ok(node.views[role].refs.includes('policing:victim-communication'));
 assert.equal(references['policing:victim-communication'].url,'https://revisedacts.lawreform.ie/eli/2017/act/28/section/22/revised/en/html');
 assert.match(references['equality:housing-assistance'].url,/housing-assistance-payment\/housing$/);
});

function completed(id){
 let state=startEncounter(id,'public',{cast:{public:'public-2',garda:'garda-5'}});
 while(!state.complete){
  const scene=encounters[id].nodes[state.nodeId].scene;
  for(const role of roles){
   state=answer(switchRole(state,role),0);
   assert.equal(encounters[id].nodes[state.nodeId].scene,scene);
  }
  state=continueEncounter(state);
  state=decodeState(encodeState(state));
 }
 return state;
}

test('New witness routes retain both answers across role switches and do not replace earlier saved results',()=>{
 let progress=recordProgress(emptyProgress(),completed('discrimination-race'));
 const original=structuredClone(progress.records);
 for(const e of witnessCases){
  const state=completed(e.id);
  assert.equal(state.history.length,2);
  assert.deepEqual(state.cast,{public:'public-2',garda:'garda-5'});
  for(const step of state.history)assert.deepEqual(step.answers,{public:0,garda:0});
  progress=unpackProgress(packProgress(recordProgress(progress,state)));
  for(const [key,value] of Object.entries(original))assert.deepEqual(progress.records[key],value);
  for(const role of roles)assert.deepEqual(progress.records[e.id+'/'+role].best,[2,2]);
 }
});

test('Witness labels translate and the English teaching text stays explicitly identified in other languages',async()=>{
 const e=witnessCases[0],english=scenarioCopy(e.id,e.nodes.opening.scene);
 for(const {id} of languages.filter(language=>language.id!=='en')){
  await loadLanguage(id);
  for(const label of ['Public witness','Witnessing Garda','Witnessing a colleague','Character information'])assert.notEqual(translateText(label,id),label);
  assert.equal(translateHTML(english,id),english);
 }
});
