import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../dist/accessibility/styles.css',import.meta.url),'utf8');
function luminance(hex){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb.reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const values=[luminance(a),luminance(b)].sort((a,b)=>a-b);return (values[1]+.05)/(values[0]+.05);}
test('The implemented core text, focus, control-border and progress colours meet their contrast targets',()=>{
 for(const [label,a,b,minimum] of [
  ['body','#203941','#ffffff',4.5],['muted on pale','#455e66','#edf6f5',4.5],['primary buttons','#ffffff','#175e61',4.5],['links on pale','#175e61','#edf6f5',4.5],['story label','#b2e3df','#203941',4.5],['disabled choices','#4b616a','#f3f6f6',4.5],['choice border','#6d8c94','#ffffff',3],['focus','#8d2c49','#ffffff',3],['high contrast button','#ffffff','#00464b',7],['high contrast text','#203d45','#e4f2f0',7]
 ]){assert.ok(css.includes(a)||a==='#ffffff',a+' should be used in the stylesheet');assert.ok(contrast(a,b)>=minimum,`${label}: ${contrast(a,b).toFixed(2)} below ${minimum}`);}
});

test('Both perspective palettes retain readable text and controls in standard and high contrast modes',()=>{
 const palettes=readFileSync(new URL('../dist/accessibility/perspectives.css',import.meta.url),'utf8');
 for(const role of ['public','garda'])for(const high of [false,true]){
  const marker=`[data-perspective="${role}"]${high?'.contrast-high':''}{`;
  const block=palettes.split(marker)[1]?.split('}')[0];assert.ok(block,marker);
  const vars=Object.fromEntries([...block.matchAll(/--([\w-]+):([^;\n]+)/g)].map(m=>[m[1],m[2].trim()]));
  for(const [a,b,minimum] of [['deep','#ffffff',high?7:4.5],['deep','pale',high?7:4.5],['ink','page',high?7:4.5],['muted','pale',high?7:4.5],['story-text','story',high?7:4.5],['story-label','story',high?7:4.5],['control','#ffffff',3],['control','pale',3],['teal','#dce8e9',3]]){
   const ratio=contrast(vars[a],vars[b]||b);assert.ok(ratio>=minimum,`${role} ${high?'high':'standard'} ${a}/${b}: ${ratio.toFixed(2)} below ${minimum}`);
  }
 }
});
