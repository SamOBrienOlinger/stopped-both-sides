import fs from 'node:fs';
import crypto from 'node:crypto';
const source=fs.readFileSync('encounters/scenes.mjs','utf8');
const bytes=Buffer.from(source);
const hash=crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
if(hash!=='61a8d60940bd84ff3327ad3724532c0e96955f6d')throw Error('Unexpected renderer; refusing to apply draft');
const marker='export function renderScene(state,options={}){';
if(source.split(marker).length!==2)throw Error('Renderer marker mismatch');
const replace=(file,re,fn)=>{const s=fs.readFileSync(file,'utf8');let n=0;const out=s.replace(re,(...a)=>{n++;return fn(...a)});if(n!==1)throw Error(file+': import count '+n);fs.writeFileSync(file,out)};
fs.writeFileSync('encounters/scenes.mjs',"import {sceneActorLayout,sceneAnchorStyle,checkSceneArtwork} from './scene-layout.mjs?v=caption-anchors-1';\n"+source.split(marker)[0]+fs.readFileSync('qa/draft/renderScene.replacement.mjs','utf8'));
for(const f of ['scene-layout.mjs','scene-labels.css','scene-labels.mjs']){if(fs.existsSync('encounters/'+f))throw Error('Draft already present');fs.copyFileSync('qa/draft/'+f,'encounters/'+f)}
replace('encounters/ui.mjs',/(['"])(\.\/scenes\.mjs)(?:\?[^'"]*)?\1/g,(_,q,p)=>q+p+'?v=caption-anchors-1'+q);
for(const f of ['app.mjs','garda/app.mjs'])replace(f,/(['"])((?:\.\/|\.\.\/)encounters\/ui\.mjs)(?:\?[^'"]*)?\1/g,(_,q,p)=>q+p+'?v=caption-anchors-1'+q);
for(const [f,rel]of [['index.html','./'],['garda/index.html','../']]){replace(f,/<\/head>/g,()=>`<link rel="stylesheet" href="${rel}encounters/scene-labels.css?v=caption-anchors-1">\n<script type="module" src="${rel}encounters/scene-labels.mjs?v=caption-anchors-1"></script>\n</head>`);replace(f,/(src=['"]\.\/app\.mjs)(?:\?[^'"]*)?(['"])/g,(_,p,q)=>p+'?v=caption-anchors-1'+q)}
console.log('Exact draft runtime applied only to this CI working tree. No push or deployment.');
