import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,createCast,defaultCast,changeCharacter,createCharacterPreferences,CHARACTER_STORAGE_KEY} from '../encounters/characters.mjs';
import {startEncounter,answer,switchRole,continueEncounter,revisit,encodeState,decodeState,fromOriginal} from '../encounters/engine.mjs';
import {emptyProgress,recordProgress,packProgress,unpackProgress,runScores} from '../encounters/progress.mjs';
import {translateText} from '../locales/translate.mjs';

test('All 18 characters are distinct; random casting can select every opposing character',()=>{
 const all=Object.values(characters).flat();assert.equal(new Set(all.map(c=>c.id)).size,18);
 assert.equal(new Set(all.map(c=>[c.column,c.row].join(','))).size,18);
 for(const role of ['public','garda']){
  const other=role==='public'?'garda':'public',id=characters[role][5].id;
  characters[other].forEach((c,i)=>assert.deepEqual(createCast(role,id,()=>i/9),{[role]:id,[other]:c.id}));
  assert.equal(createCast(role,id,()=>0.999999)[other],characters[other][8].id);
 }
});
test('Cast remains stable through answers, stages, switching, revisiting and score transfer',()=>{
 let s=startEncounter('public-search','public',{characterId:'public-6',random:()=>0.8});const cast={...s.cast};
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
