import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,characterFor,createCast,defaultCast,changeCharacter,createCharacterPreferences,CHARACTER_STORAGE_KEY} from '../encounters/characters.mjs?v=nia-public-20261123';
import {startEncounter,answer,switchRole,continueEncounter,revisit,encodeState,decodeState,fromOriginal} from '../encounters/engine.mjs?v=nia-public-20261123';
import {emptyProgress,recordProgress,packProgress,unpackProgress,runScores} from '../encounters/progress.mjs?v=nia-public-20261123';
import {translateText} from '../locales/translate.mjs?v=final-touches-20261125';

test('All 19 characters are distinct; random casting can select every opposing character',()=>{
 assert.equal(characters.public.length,10);assert.equal(characters.garda.length,9);
 const all=Object.values(characters).flat();assert.equal(new Set(all.map(c=>c.id)).size,19);
 assert.ok(characters.garda.every(character=>/^Garda (?:Sergeant )?\S+$/.test(character.name)));
 assert.ok(characters.garda.some(character=>character.name.startsWith('Garda Sergeant ')));
 assert.ok(characters.garda.some(character=>!character.name.startsWith('Garda Sergeant ')));
 assert.ok(characters.public.every(character=>!character.name.startsWith('Garda ')));
 assert.equal(new Set(all.map(c=>[c.column,c.row].join(','))).size,19);
 for(const role of ['public','garda']){
  const other=role==='public'?'garda':'public',id=characters[role][5].id;
  const count=characters[other].length;
  characters[other].forEach((c,i)=>assert.deepEqual(createCast(role,id,()=>i/count),{[role]:id,[other]:c.id}));
  assert.equal(createCast(role,id,()=>0.999999)[other],characters[other].at(-1).id);
 }
});
test('Cast remains stable through answers, stages, switching, revisiting and score transfer',()=>{
 for(const characterId of ['public-6','public-10']){
  let s=startEncounter('public-search','public',{characterId,random:()=>0.8});const cast={...s.cast};
  s=answer(s,0);s=answer(switchRole(s),1);const scores=runScores(s);
  const changed=changeCharacter(s,'garda-9');assert.equal(changed.cast.public,cast.public);assert.equal(changed.cast.garda,'garda-9');
  assert.deepEqual(runScores(changed),scores);assert.deepEqual(changed.answers,s.answers);assert.deepEqual(changed.history,s.history);
  assert.equal(changeCharacter(changed,'public-1'),changed);assert.equal(changeCharacter(changed,'__proto__'),changed);
  s=continueEncounter(changed);assert.deepEqual(s.cast,changed.cast);assert.deepEqual(revisit(s).cast,changed.cast);
  assert.deepEqual(switchRole(s).cast,changed.cast);assert.deepEqual(decodeState(encodeState(s)),s);
  const p=recordProgress(emptyProgress(),s);assert.deepEqual(decodeState(unpackProgress(packProgress(p)).last),s);
  while(!s.complete)s=continueEncounter(answer(s,0));
  const completed=changeCharacter(s,'garda-3');assert.ok(completed.complete);assert.deepEqual(runScores(completed),runScores(s));
  assert.deepEqual(decodeState(encodeState(completed)),completed);
 }
});
test('Nia is appended without changing saved characters, defaults or original-practice transfers',()=>{
 assert.deepEqual(characters.public.slice(0,9).map(({id,name})=>({id,name})),['Alex','Noor','Robin','Maya','Daniel','Jo','Erin','Hassan','Pat'].map((name,index)=>({id:'public-'+(index+1),name})));
 assert.equal(characterFor('public','public-10').name,'Nia');
 assert.equal(characterFor('garda','public-10'),null);
 assert.deepEqual(defaultCast(),{public:'public-1',garda:'garda-1'});
 const old={public:'public-8',garda:'garda-7'};
 const memory=new Map([[CHARACTER_STORAGE_KEY,JSON.stringify(old)],['scores','keep']]);
 const storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
 const preferences=createCharacterPreferences(storage);assert.deepEqual(preferences.value,old);
 preferences.choose('public','public-10');
 const cast={public:'public-10',garda:'garda-7'};
 assert.deepEqual(createCharacterPreferences(storage).value,cast);assert.equal(memory.get('scores'),'keep');
 const original={scenarioId:'search',nodeId:'search-start',history:[],selected:0,complete:false};
 const transferred=fromOriginal(original,'public','garda',cast);
 assert.deepEqual(transferred.cast,cast);assert.equal(transferred.answers.public,0);
 assert.deepEqual(decodeState(encodeState(transferred)),transferred);
});
test('Old links still open deterministically and invalid or cross-role character IDs are rejected',()=>{
 const old={v:1,e:'public-search',r:'public',p:[],a:[0,null]};const token=btoa(JSON.stringify(old));
 const first=decodeState(token);assert.deepEqual(first.cast,defaultCast());assert.deepEqual(decodeState(token),first);assert.equal(first.answers.public,0);
 for(const c of [null,[],['public-1'],['garda-1','public-1'],['__proto__','garda-1'],['public-1','garda-99']])assert.equal(decodeState(btoa(JSON.stringify({...old,v:2,c}))),null);
 const original={scenarioId:'search',nodeId:'search-start',history:[],selected:0,complete:false};
 const cast={public:'public-8',garda:'garda-7'};
 assert.deepEqual(fromOriginal(original,'public','garda',cast).cast,cast);
});
test('Character preferences survive reload without affecting progress and work with blocked storage',()=>{
 const memory=new Map([['scores','keep']]);const storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 const p=createCharacterPreferences(storage);p.choose('public','public-9');p.choose('garda','garda-5');
 assert.deepEqual(createCharacterPreferences(storage).value,{public:'public-9',garda:'garda-5'});assert.equal(memory.get('scores'),'keep');
 p.choose('public','garda-9');assert.equal(p.value.public,'public-9');
 memory.set(CHARACTER_STORAGE_KEY,'{"public":"evil","garda":"garda-1"}');assert.deepEqual(createCharacterPreferences(storage).value,defaultCast());
 const blocked=createCharacterPreferences({getItem(){throw Error();},setItem(){throw Error();}});blocked.choose('garda','garda-9');assert.equal(blocked.value.garda,'garda-9');
});
test('Character controls and status messages translate while chosen names stay intact',()=>{
 for(const text of ['Choose your character','Change character','Available characters','You','Other side','Done','Character selected.','Character changed. Your progress is unchanged.'])assert.notEqual(translateText(text,'ga'),text);
 assert.equal(translateText('Choose character: Noor','ga'),'Roghnaigh carachtar: Noor');
});
