import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {scenarios,sources} from '../data.mjs';
import {startSession,currentNode,choose,advance,previous,recap,remainingSteps} from '../engine.mjs';
let allPaths=0;
for(const scenario of scenarios){
 test(`${scenario.title}: every possible choice path reaches a sourced recap`,()=>{
  const reached=new Set();let paths=0;
  function walk(state){
   assert.ok(state.history.length<12,'Unexpected cycle or excessively long route');
   if(state.complete){paths++;assert.equal(recap(state).length,state.history.length);assert.equal(currentNode(state),null);assert.equal(advance(state),state);return;}
   const node=currentNode(state);assert.ok(node);reached.add(state.nodeId);
   assert.ok(node.title&&node.story&&node.prompt&&node.lesson&&node.phrase);
   assert.ok(node.sources.length);for(const ref of node.sources)assert.ok(sources[ref],`Missing source ${ref}`);
   assert.ok(node.choices.length>=2);assert.ok(node.choices.some(c=>!c.review),'No reasonable response');
   const remaining=remainingSteps(state);assert.ok(remaining.min>=1&&remaining.max>=remaining.min);
   node.choices.forEach((c,i)=>{assert.ok(c.feedback&&c.text);const selected=choose(state,i);assert.equal(selected.selected,i);assert.equal(choose(selected,(i+1)%node.choices.length),selected,'Double selection should be ignored');const next=advance(selected);assert.equal(next.history.length,state.history.length+1);assert.equal(next.nodeId,c.next);walk(next);});
  }
  walk(startSession(scenario.id));assert.equal(reached.size,Object.keys(scenario.nodes).length,'Unreachable decision');allPaths+=paths;console.log(`${scenario.id}: ${paths} complete paths, ${reached.size} decisions`);
 });
}
test('Revisiting a decision discards the later branch and rebuilds the recap',()=>{
 let s=advance(choose(startSession('street'),0));assert.equal(s.nodeId,'street-voluntary');s=advance(choose(s,0));s=previous(s);assert.equal(s.nodeId,'street-voluntary');s=previous(s);assert.equal(s.nodeId,'street-start');assert.equal(s.history.length,0);s=advance(choose(s,1));assert.equal(s.nodeId,'street-status');assert.equal(recap(s).length,1);assert.equal(recap(s)[0].choice.text,scenarios[0].nodes['street-start'].choices[1].text);
});
test('Invalid actions, replay and independent sessions are handled',()=>{
 const original=startSession('arrest');assert.equal(advance(original),original);assert.equal(choose(original,-1),original);assert.equal(choose(original,9),original);assert.equal(choose(original,NaN),original);assert.equal(previous(original),original);const selected=choose(original,1);assert.equal(original.selected,null);assert.equal(selected.selected,1);assert.deepEqual(startSession('arrest'),original);assert.throws(()=>startSession('missing'));
});
test('Sources have explicit external HTTPS URLs and descriptions',()=>{
 for(const [id,s] of Object.entries(sources)){assert.ok(s.title&&s.note,id);assert.equal(new URL(s.url).protocol,'https:');}
});
test('Static entrypoint, local imports, fonts and icon are available',()=>{
 const base=new URL('../',import.meta.url);const html=readFileSync(new URL('index.html',base),'utf8');
 for(const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))assert.ok(existsSync(new URL(match[1],base)),`Missing ${match[1]}`);
 for(const file of ['app.mjs','engine.mjs']){const s=readFileSync(new URL(file,base),'utf8');for(const m of s.matchAll(/from ['"](\.\/[^'"]+)['"]/g))assert.ok(existsSync(new URL(m[1],base)),`Missing ${m[1]}`);}
 const css=readFileSync(new URL('styles.css',base),'utf8');for(const m of css.matchAll(/url\(['"]?(\.\/[^)'" ]+)['"]?\)/g))assert.ok(existsSync(new URL(m[1],base)),`Missing font ${m[1]}`);
 assert.ok(html.includes('lang="en-IE"'));assert.ok(html.includes('name="viewport"'));assert.ok(html.includes('<noscript>'));assert.ok(css.includes('prefers-reduced-motion'));
});
