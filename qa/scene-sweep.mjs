import fs from 'node:fs';
import path from 'node:path';
import {createGzip} from 'node:zlib';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium,firefox,webkit} from 'playwright';
import {encounters,roles} from '../encounters/catalog.mjs?v=scene-review-1';
import {characters} from '../encounters/characters.mjs';
import {startEncounter,answer,switchRole,continueEncounter,stateHash,decodeState} from '../encounters/engine.mjs?v=scene-review-1';
import {renderScene,sceneDirections} from '../encounters/scenes.mjs';

const engine=process.env.SWEEP_BROWSER||'chromium';
const shard=Number(process.env.SWEEP_SHARD||0);
const base='http://127.0.0.1:4173/stopped-both-sides/';
const out=path.resolve('sweep-results',engine+'-'+shard);fs.mkdirSync(out,{recursive:true});
const casts=characters.public.flatMap(p=>characters.garda.map(g=>({public:p.id,garda:g.id})));
const configs=[
 {id:'320',width:320},{id:'375',width:375},{id:'390',width:390},
 {id:'landscape568',width:568,height:320},{id:'660',width:660},{id:'768',width:768},
 {id:'1024',width:1024},{id:'1366',width:1366},{id:'1920',width:1920},
 {id:'200pct320',width:320,scale:2},{id:'200pct1366',width:1366,scale:2},
 {id:'arabic320',width:320,lang:'ar',scale:2},{id:'arabic1366',width:1366,lang:'ar'},
 {id:'irish390',width:390,lang:'ga'},{id:'portuguese390',width:390,lang:'pt'},
 {id:'polish390',width:390,lang:'pl'},{id:'romanian390',width:390,lang:'ro'},
 {id:'french390',width:390,lang:'fr'},{id:'spanish390',width:390,lang:'es'},
 {id:'chinese390',width:390,lang:'zh-Hans'},
 {id:'contrast390',width:390,high:true},{id:'longnames320',width:320,long:true,scale:2},
 {id:'noResizeObserver390',width:390,noResize:true},{id:'forcedColours390',width:390,forced:true}
];
const selected=configs.filter((_,i)=>i%4===shard);
const stages=[];const graphIssues=[];let edgeChecks=0,appearanceChecks=0;
for(const [id,e] of Object.entries(encounters)){
 const queue=[startEncounter(id,'public',{cast:casts[0]})],seen=new Map();
 while(queue.length){const s=queue.shift();if(s.complete||seen.has(s.nodeId))continue;seen.set(s.nodeId,s);
  const node=e.nodes[s.nodeId];
  for(const role of roles)for(let i=0;i<node.views[role].choices.length;i++){
   const next=continueEncounter(answer(switchRole(s,role),i));edgeChecks++;
   if(!decodeState(stateHash(next).slice(11)))graphIssues.push({id,node:s.nodeId,role,choice:i,issue:'URL state does not round trip'});
   if(!next.complete)queue.push(next);
  }
 }
 for(const nodeId of Object.keys(e.nodes)){
  if(!seen.has(nodeId)){graphIssues.push({id,nodeId,issue:'unreachable stage'});continue;}
  if(!sceneDirections[id]?.[nodeId])graphIssues.push({id,nodeId,issue:'missing scene direction'});
  stages.push({id,nodeId,title:e.nodes[nodeId].title,scene:e.nodes[nodeId].scene,direction:sceneDirections[id][nodeId],state:seen.get(nodeId)});
 }
}
// Test all answer combinations, including alternate-role answers, against the
// two visually distinct decision/response phases. This is a string-equivalence
// check, not a claim to have browsed every possible history.
for(const stage of stages)for(const cast of casts)for(const role of roles){
 const s={...stage.state,cast,role};
 const p=[null,...encounters[s.id].nodes[s.nodeId].views.public.choices.map((_,i)=>i)];
 const g=[null,...encounters[s.id].nodes[s.nodeId].views.garda.choices.map((_,i)=>i)];
 const normalise=x=>x.replace(/data-scene-phase="[^"]+"/,'data-scene-phase="equivalent"');
 const reference=normalise(renderScene(s));
 for(const pa of p)for(const ga of g){appearanceChecks++;if(normalise(renderScene({...s,answers:{public:pa,garda:ga}}))!==reference)graphIssues.push({id:s.id,nodeId:s.nodeId,cast,role,pa,ga,issue:'answer changes visual composition'});}
}
fs.writeFileSync(path.join(out,'inventory.json'),JSON.stringify({engine,shard,baseCommit:'93e543adb3837c0a31dca053aaaf1e40fb435f36',scenarios:Object.keys(encounters).length,stages:stages.map(({state,...s})=>s),characters,casts,edgeChecks,appearanceChecks,graphIssues,profiles:selected},null,2));
if(graphIssues.length)throw Error('Graph or visual-equivalence failures: '+JSON.stringify(graphIssues.slice(0,5)));
const server=spawn(process.execPath,['tests/browser/server.mjs'],{stdio:['ignore','pipe','pipe']});
for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const browser=await ({chromium,firefox,webkit}[engine]).launch();
const csv=fs.createWriteStream(path.join(out,'cases.csv.gz'));const gzip=createGzip();gzip.pipe(csv);
gzip.write('profile,site,activeRole,phase,scenario,node,public,garda,alignmentPx,geometryIssues,silhouetteOverlapFraction\n');
const issueStream=fs.createWriteStream(path.join(out,'issues.ndjson'));
const summary={engine,browserVersion:browser.version(),shard,profiles:[],cases:0,passedGeometry:0,failedGeometry:0,issueCounts:{},maxAlignment:0,overlapWarnings:0,appearanceChecks,edgeChecks,startedAt:new Date().toISOString(),screenshotCount:0};
const expectedArt={street:'suburban-street','bus-stop':'bus-stop',square:'quayside'};
try{
 for(const cfg of selected){
  const profile={id:cfg.id,cases:0,failed:0,maxAlignment:0};summary.profiles.push(profile);
  for(const site of ['public','garda']){
   const context=await browser.newContext({viewport:{width:cfg.width,height:cfg.height||900},reducedMotion:'reduce',forcedColors:cfg.forced?'active':'none'});
   if(cfg.noResize)await context.addInitScript(()=>{window.ResizeObserver=undefined;});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+(site==='garda'?'garda/':'')+'?lang='+(cfg.lang||'en')+stateHash(stages[0].state));
   await page.waitForSelector('.paired-game');
   await page.evaluate(async({base,cfg})=>{
    const [scenes,engine,chars,translation]=await Promise.all([
     import(base+'encounters/scenes.mjs?v=caption-anchors-1'),import(base+'encounters/engine.mjs?v=scene-review-1'),
     import(base+'encounters/characters.mjs?v=scene-art-2'),import(base+'locales/translate.mjs?v=support-resources-1')]);
    await translation.loadLanguage(cfg.lang||'en');
    const root=document.documentElement;root.style.fontSize=(16*(cfg.scale||1))+'px';
    root.classList.toggle('contrast-high',!!cfg.high);root.dir=cfg.lang==='ar'?'rtl':'ltr';
    document.querySelector('#main').dir=root.dir;
    if(cfg.long)for(const list of Object.values(chars.characters))for(const c of list)c.name+=' Alexandra O’Brien-Olinger Longnametest';
    window.__qa={scenes,engine,chars,translation,maskCache:new Map(),collisionCache:new Map()};
    await document.fonts.ready;
   },{base,cfg});
   for(const activeRole of roles)for(const phase of ['decision','response','recap'])for(const stage of stages){
    const result=await page.evaluate(async({stage,casts,activeRole,phase,lang,expectedArt})=>{
     const qa=window.__qa,host=document.querySelector('.story');
     if(!host)throw Error('Actual game story container missing');
     const samples=casts.map(cast=>{
      let state={...stage.state,cast,role:activeRole};let options={};
      if(phase!=='decision')state=qa.engine.answer(state,0);
      if(phase==='recap'){state=qa.engine.continueEncounter(state);options={compact:true,step:state.history.at(-1)};}
      return {cast,html:qa.translation.translateHTML(qa.scenes.renderScene(state,options),lang)};
     });
     host.innerHTML=samples.map(s=>s.html).join('');
     for(const img of host.querySelectorAll('img'))img.loading='eager';
     await Promise.all([...host.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     const rect=e=>e.getBoundingClientRect(),centre=r=>(r.left+r.right)/2;
     const hidden=e=>!!e.closest('[aria-hidden="true"],[hidden]');
     function mask(actor){
      const key=actor.dataset.sceneCharacter;
      if(qa.maskCache.has(key))return qa.maskCache.get(key);
      const frame=actor.querySelector('.scene-sprite'),img=frame.querySelector('img'),size=80;
      const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      const left=parseFloat(img.style.left)/100*size,top=parseFloat(img.style.top)/100*size;
      const w=parseFloat(img.style.width)/100*size,h=parseFloat(img.style.height)/100*size;
      const inset=(img.style.clipPath.match(/[\d.]+/g)||[]).map(Number);
      if(inset.length===4){ctx.beginPath();ctx.rect(left+w*inset[3]/100,top+h*inset[0]/100,w*(1-(inset[1]+inset[3])/100),h*(1-(inset[0]+inset[2])/100));ctx.clip();}
      ctx.drawImage(img,left,top,w,h);
      const data=ctx.getImageData(0,0,size,size).data,bits=new Uint8Array(size*size);let count=0;
      const flip=getComputedStyle(frame).transform.startsWith('matrix(-1');
      for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(data[(y*size+x)*4+3]>128){bits[y*size+(flip?size-1-x:x)]=1;count++;}
      const m={size,bits,count};qa.maskCache.set(key,m);return m;
     }
     function collision(a,b,pane){
      const ar=rect(a),br=rect(b),pr=rect(pane);
      const key=[a.dataset.sceneCharacter,b.dataset.sceneCharacter,ar.width/pr.width,br.width/pr.width,(br.left-ar.left)/pr.width,(br.top-ar.top)/pr.width].map(v=>typeof v==='number'?v.toFixed(3):v).join('|');
      if(qa.collisionCache.has(key))return qa.collisionCache.get(key);
      const am=mask(a),bm=mask(b);let hit=0;
      for(let y=0;y<am.size;y++)for(let x=0;x<am.size;x++){
       if(!am.bits[y*am.size+x])continue;
       const gx=ar.left+(x+.5)*ar.width/am.size,gy=ar.top+(y+.5)*ar.height/am.size;
       const bx=Math.floor((gx-br.left)/br.width*bm.size),by=Math.floor((gy-br.top)/br.height*bm.size);
       if(bx>=0&&by>=0&&bx<bm.size&&by<bm.size&&bm.bits[by*bm.size+bx])hit++;
      }
      const value=hit/Math.max(1,Math.min(am.count,bm.count));qa.collisionCache.set(key,value);return value;
     }
     return [...host.querySelectorAll(':scope > .encounter-scene')].map((scene,index)=>{
      const issues=[],cast=samples[index].cast;let alignment=0,overlap=0;
      const actors=[...scene.querySelectorAll('[data-scene-role]')],labels=[...scene.querySelectorAll('[data-scene-label-role]')];
      if(actors.length!==2||labels.length!==2)issues.push('actor-or-label-count');
      if(scene.dataset.sceneId!==stage.id+'/'+stage.nodeId)issues.push('wrong-stage');
      for(const actor of actors){
       const role=actor.dataset.sceneRole,pane=actor.closest('.scene-location'),panel=actor.closest('.scene-panel');
       const label=panel?.querySelector('[data-scene-label-role="'+role+'"]');
       if(!label){issues.push('label-in-wrong-panel');continue;}
       if(actor.dataset.sceneCharacter!==cast[role])issues.push('wrong-character');
       const expected=qa.chars.characterFor(role,cast[role]).name;
       if(label.querySelector('strong')?.textContent.trim()!==expected)issues.push('wrong-name');
       const a=rect(actor),l=rect(label),p=rect(pane),t=rect(label.parentElement);
       const delta=Math.abs(centre(a)-centre(l));alignment=Math.max(alignment,delta);
       if(delta>2)issues.push('caption-misaligned');
       if(l.top<p.bottom-.5)issues.push('caption-above-image-floor');
       if(l.left<t.left-1||l.right>t.right+1||l.bottom>t.bottom+1)issues.push('caption-overflow');
       if(label.scrollWidth>label.clientWidth+1||label.scrollHeight>label.clientHeight+1)issues.push('caption-text-clipped');
       if(hidden(label))issues.push('caption-hidden-from-AT');
       if(Math.max(p.left-a.left,a.right-p.right,p.top-a.top,a.bottom-p.bottom)>.1)issues.push('actor-frame-clipped');
       const bg=pane.querySelector('.scene-backdrop');
       if(expectedArt[pane.dataset.scenePlace]&&!bg.currentSrc.includes('/'+expectedArt[pane.dataset.scenePlace]+'-'))issues.push('wrong-background-file');
       for(const img of pane.querySelectorAll('img'))if(!img.complete||!img.naturalWidth)issues.push('image-load-failure');
      }
      for(const pane of scene.querySelectorAll('.scene-location')){
       const pair=[...pane.querySelectorAll('[data-scene-role]')];
       if(pair.length===2)overlap=Math.max(overlap,collision(pair[0],pair[1],pane));
      }
      for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
       const a=rect(labels[i]),b=rect(labels[j]);if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)issues.push('captions-overlap');
      }
      return {cast,alignment,issues:[...new Set(issues)],overlap};
     });
    },{stage,casts,activeRole,phase,lang:cfg.lang||'en',expectedArt});
    if(result.length!==81)throw Error('Expected 81 actual rendered pairings, got '+result.length);
    for(const r of result){
     summary.cases++;profile.cases++;summary.maxAlignment=Math.max(summary.maxAlignment,r.alignment);profile.maxAlignment=Math.max(profile.maxAlignment,r.alignment);
     if(r.issues.length){summary.failedGeometry++;profile.failed++;for(const issue of r.issues)summary.issueCounts[issue]=(summary.issueCounts[issue]||0)+1;
      issueStream.write(JSON.stringify({profile:cfg.id,site,activeRole,phase,id:stage.id,node:stage.nodeId,...r})+'\n');
     }else summary.passedGeometry++;
     if(r.overlap>.01)summary.overlapWarnings++;
     gzip.write([cfg.id,site,activeRole,phase,stage.id,stage.nodeId,r.cast.public,r.cast.garda,r.alignment.toFixed(4),r.issues.join(';'),r.overlap.toFixed(4)].join(',')+'\n');
    }
    // One real rendered example for every stage; do not pretend that screenshots
    // alone are an exhaustive visual/geographical correctness oracle.
    if(cfg.id==='390'&&site==='public'&&activeRole==='public'&&phase==='decision'){
     const scene=page.locator('.story > .encounter-scene').nth(26);
     await scene.screenshot({path:path.join(out,stage.id+'--'+stage.nodeId+'--public3-garda9.png')});summary.screenshotCount++;
    }
    if(result.some(r=>r.issues.length)&&summary.screenshotCount<12){
     await page.locator('.story > .encounter-scene').nth(result.findIndex(r=>r.issues.length)).screenshot({path:path.join(out,'FAIL-'+cfg.id+'-'+stage.id+'-'+stage.nodeId+'-'+phase+'.png')});summary.screenshotCount++;
    }
   }
   if(errors.length){summary.pageErrors=summary.pageErrors||[];summary.pageErrors.push({profile:cfg.id,site,errors});}
   await context.close();
  }
  console.log(JSON.stringify({browser:engine,profile:cfg.id,cases:profile.cases,failed:profile.failed,maxAlignment:profile.maxAlignment}));
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2));
 }
}finally{
 summary.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2));
 gzip.end();issueStream.end();await once(csv,'finish');await browser.close();server.kill();
}
console.log('FINAL '+JSON.stringify(summary));
if(summary.failedGeometry||summary.pageErrors?.length)process.exitCode=1;
