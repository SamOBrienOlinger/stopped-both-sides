import {test,expect} from '@playwright/test';
import {encounters,roles} from '../../encounters/catalog.mjs';
import {characters} from '../../encounters/characters.mjs';
import {startEncounter,answer,continueEncounter,switchRole,stateHash} from '../../encounters/engine.mjs';

// Reach every node through the real engine, rather than fabricating history.
function reachable(id){
 const queue=[startEncounter(id)],seen=new Map();
 while(queue.length){
  const state=queue.shift();if(state.complete||seen.has(state.nodeId))continue;
  seen.set(state.nodeId,state);
  for(const role of roles)for(let i=0;i<encounters[id].nodes[state.nodeId].views[role].choices.length;i++){
   queue.push(continueEncounter(answer(switchRole(state,role),i)));
  }
 }
 if(seen.size!==Object.keys(encounters[id].nodes).length)throw Error('Unreachable caption test stage: '+id);
 return [...seen.values()];
}
const cases=Object.keys(encounters).flatMap(reachable);
const pairs=characters.public.flatMap(p=>characters.garda.map(g=>({public:p.id,garda:g.id})));
const basePath='/stopped-both-sides/';

// Measure rectangles independently of the anchor values being tested.
function geometry(){
 const errors=[],panels=[...document.querySelectorAll('#main .scene-panel')];
 let labels=0,maxError=0;
 const intersects=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5;
 for(const panel of panels){
  const location=panel.querySelector('.scene-location'),bounds=location.getBoundingClientRect();
  const captions=[...panel.querySelectorAll('[data-scene-label-role]')],boxes=[];
  for(const label of captions){
   const role=label.dataset.sceneLabelRole,actor=location.querySelector('[data-scene-role="'+role+'"]');
   const box=label.getBoundingClientRect(),frame=actor?.getBoundingClientRect();labels++;boxes.push(box);
   const context={scene:panel.closest('[data-scene-id]').dataset.sceneId,character:actor?.dataset.sceneCharacter,role};
   if(!frame){errors.push({...context,issue:'missing actor'});continue;}
   const drift=Math.abs(box.left+box.width/2-frame.left-frame.width/2);maxError=Math.max(maxError,drift);
   if(drift>1)errors.push({...context,issue:'caption drift',drift});
   if(box.top<bounds.bottom-.5||box.left<bounds.left-.5||box.right>bounds.right+.5)errors.push({...context,issue:'caption outside its panel'});
   if(label.scrollWidth>label.clientWidth+1||label.scrollHeight>label.clientHeight+1)errors.push({...context,issue:'caption text overflow'});
   if(label.closest('[aria-hidden="true"]'))errors.push({...context,issue:'caption hidden from assistive technology'});
   if(frame.left<bounds.left-.1||frame.right>bounds.right+.1||frame.top<bounds.top-.1||frame.bottom>bounds.bottom+.1)errors.push({...context,issue:'actor outside panel'});
  }
  if(boxes.some((a,i)=>boxes.slice(i+1).some(b=>intersects(a,b))))errors.push({issue:'overlapping captions',scene:panel.closest('[data-scene-id]').dataset.sceneId});
 }
 return {errors:errors.slice(0,20),labels,panels:panels.length,maxError};
}
async function settle(page){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
}
async function aligned(page){
 await expect.poll(async()=>{await settle(page);return (await page.evaluate(geometry)).errors;}).toEqual([]);
 const result=await page.evaluate(geometry);expect(result.labels).toBeGreaterThan(0);return result;
}

// All 59 real stage models x all 81 casts, on both CSS entry points at both widths.
for(const path of ['./','garda/'])for(const width of [390,1366]){
 test(`${path} ${width}px: every stage and all 81 character pairings keep names anchored`,async({page},info)=>{
  test.setTimeout(300000);
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width,height:900});
  await page.goto(path+'?lang=en'+stateHash({...cases[0],role:path==='garda/'?'garda':'public'}));
  await expect(page.locator('.paired-scene-lead>.encounter-scene[data-caption-anchors]')).toBeVisible();
  const sceneWidth=await page.locator('.paired-scene-lead>.encounter-scene').evaluate(e=>e.getBoundingClientRect().width);
  await page.evaluate(async root=>{window.captionRenderer=await import(root+'encounters/scenes.mjs?v=garda-baseball-20261114');},basePath);
  let rendered=0,maxError=0;
  for(const item of cases){
   const state={...item,role:path==='garda/'?'garda':'public'};
   await page.evaluate(({state,pairs,sceneWidth})=>{
    const root=document.querySelector('#main');
    root.innerHTML=pairs.map(cast=>'<div style="width:'+sceneWidth+'px;max-width:100%;margin:0 auto">'+window.captionRenderer.renderScene({...state,cast})+'</div>').join('');
    root.querySelectorAll('img').forEach(i=>i.loading='eager');
   },{state,pairs,sceneWidth});
   await expect.poll(()=>page.locator('#main img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
   const result=await aligned(page);expect(result.labels).toBe(162);maxError=Math.max(maxError,result.maxError);rendered+=pairs.length;
  }
  expect(cases).toHaveLength(59);expect(pairs).toHaveLength(81);expect(rendered).toBe(4779);
  await info.attach('caption-matrix.json',{body:JSON.stringify({browser:info.project.name,path,width,stages:cases.length,pairings:pairs.length,rendered,maxCentreErrorCssPx:maxError,mode:'real renderer with site CSS; not 4779 end-to-end gameplay sessions'},null,2),contentType:'application/json'});
 });
}

// Actual full app routes: every stage, enlarged/translated/RTL text and all breakpoints.
// A completed DOM and explicitly loaded scene images are the meaningful readiness
// criteria here. WebKit can leave the window 'load' event pending on a long sequence
// of image-heavy navigations even when the playable scene is ready.
async function openCaptionScene(page,url){
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 const scene=page.locator('.paired-scene-lead>.encounter-scene[data-caption-anchors]');
 await expect(scene).toBeVisible();
 await expect.poll(()=>scene.locator('img').evaluateAll(images=>
  images.length>0&&images.every(image=>image.complete&&image.naturalWidth>0)
 ),{message:'Active scene and character images must load'}).toBe(true);
}

// Keep every one of the 59 reachable stages, every original language/cast and
// every viewport. Divide the long WebKit sequence into independently reported
// tests so a stalled navigation cannot exhaust the time budget for all stages.
const stageBatchSize=12;
for(const path of ['./','garda/']){
 for(let start=0;start<cases.length;start+=stageBatchSize){
  const end=Math.min(start+stageBatchSize,cases.length);
  test(`${path} stages ${start+1}-${end}: rotation, 200% text, RTL and recaps`,async({page})=>{
   test.setTimeout(180000);
   await page.emulateMedia({reducedMotion:'reduce'});
   for(let i=start;i<end;i++){
    const state={...cases[i],role:path==='garda/'?'garda':'public',cast:pairs[(i*17)%pairs.length]};
    await openCaptionScene(page,path+'?lang='+(i%3===0?'ar':i%3===1?'ga':'en')+stateHash(state));
    for(const [width,height] of [[320,900],[568,320],[768,1024],[1366,768]]){
     await page.setViewportSize({width,height});
     await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
     await aligned(page);
    }
   }
  });
 }
 test(`${path} nine languages and long labels across all breakpoints`,async({page})=>{
  test.setTimeout(180000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ga','pt','ar','pl','ro','fr','es','zh-Hans']){
   await openCaptionScene(page,path+'?lang='+lang+stateHash({...cases[0],cast:{public:'public-3',garda:'garda-9'}}));
   await page.evaluate(()=>{
    document.documentElement.style.setProperty('--reading-size','200%');
    document.documentElement.classList.add('contrast-high','reading-spacious');
    document.querySelectorAll('.scene-character-label [data-no-translate]').forEach(e=>e.textContent='Alexandria O’Brien-McDonnell-Smythe');
   });
   for(const width of [320,375,390,430,660,768,1024,1366,1920]){
    await page.setViewportSize({width,height:900});
    await aligned(page);
   }
  }
 });
}

for(const path of ['./','garda/'])test(`${path} original Robin/Charlie report and separate panels have aligned captions`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [id,node] of [['public-street','street-start'],['public-search','search-start'],['public-fair-treatment','fair-start'],['public-arrest','arrest-silence'],['public-street','street-end']]){
  const state={...cases.find(s=>s.id===id&&s.nodeId===node),cast:{public:'public-3',garda:'garda-9'}};
  for(const width of [390,1366]){
   await page.setViewportSize({width,height:900});await page.goto(path+'?lang=en'+stateHash(state));
   const scene=page.locator('.paired-scene-lead>.encounter-scene');await scene.scrollIntoViewIfNeeded();
   await expect.poll(()=>scene.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
   await aligned(page);await scene.screenshot({path:info.outputPath(node+'-'+width+'.png')});
  }
 }
});

test('caption fallback remains readable without the enhancement script',async({page})=>{
 await page.route('**/encounters/scene-labels.mjs*',route=>route.abort());
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:900});
 await page.goto('./?lang=ar'+stateHash({...cases[0],cast:{public:'public-3',garda:'garda-9'}}));
 await expect(page.locator('.paired-scene-lead>.encounter-scene')).toBeVisible();
 await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
 await aligned(page);
});

test('button shine stays inside its control during hover, focus and reduced motion',async({page})=>{
 for(const path of ['./','garda/'])for(const width of [320,390,1366]){
  await page.setViewportSize({width,height:900});await page.goto(path+'?lang=ga#play');
  const buttons=page.locator('.perspective-hero-button');await expect(buttons).toHaveCount(2);
  await page.evaluate(()=>{document.documentElement.style.setProperty('--reading-size','200%');return document.fonts.ready;});
  for(const reduce of ['no-preference','reduce']){
   await page.emulateMedia({reducedMotion:reduce});
   for(const button of await buttons.all()){
    await button.hover();await button.focus();
    const overflow=await button.evaluate(e=>({x:e.scrollWidth-e.clientWidth,y:e.scrollHeight-e.clientHeight}));
    expect(overflow.x).toBeLessThanOrEqual(1);expect(overflow.y).toBeLessThanOrEqual(1);
   }
  }
 }
});


// A representative Sam/Charlie encounter: button positions are independently
// checked by aligned() at every width; activation must not change game state.
for(const path of ['./','garda/'])test(path+' character buttons open profiles and return keyboard focus',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const role=path==='garda/'?'garda':'public';
 const state=startEncounter('public-street',role,{cast:{public:'public-8',garda:'garda-9'}});
 await page.goto(path+'?lang=ar'+stateHash(state));
 const scene=page.locator('.paired-scene-lead>.encounter-scene[data-caption-anchors]');
 await expect(scene).toBeVisible();
 const originalUrl=page.url();
 for(const width of [320,390,768,1366]){
  await page.setViewportSize({width,height:900});
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
  await aligned(page);
  for(const [role,name] of [['public','Sam'],['garda','Charlie']]){
   const button=scene.locator('button[data-scene-label-role="'+role+'"]');
   await expect(button).toHaveAttribute('aria-haspopup','dialog');
   await expect(button).toHaveAttribute('aria-controls','scene-character-dialog');
   await button.click();
   const dialog=page.locator('#scene-character-dialog');
   await expect(dialog).toBeVisible();
   await expect(dialog).toHaveAttribute('data-role-tone',role);
   await expect(dialog.getByRole('heading',{name,exact:true})).toBeVisible();
   await expect(dialog.locator('.scene-profile-role')).toHaveText(role==='public'?'Member of the public':'Garda');
   await expect(dialog.locator('.scene-profile-body')).toContainText('fictional encounter');
   await expect(dialog.locator('.scene-profile-portrait img')).toHaveJSProperty('complete',true);
   if(role==='public')await page.keyboard.press('Escape');
   else await dialog.getByRole('button',{name:'Close character details'}).click();
   await expect(dialog).toBeHidden();
   await expect(button).toBeFocused();
  }
 }
 expect(page.url()).toBe(originalUrl);
 await expect(scene.locator('button.scene-character-label')).toHaveCount(2);
});
