import {test,expect} from '@playwright/test';
import {encounters,references,roles} from '../../encounters/catalog.mjs';
import {decodeState} from '../../encounters/engine.mjs';
import {translateText} from '../../locales/translate.mjs';

// Read state only to assert what the UI did. Never manufacture a game/recap URL
// or seed localStorage: every journey starts on the homepage with a fresh context.
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);
const other=role=>role==='public'?'garda':'public';
const ids=['public-witness','public-corruption'];
const activate=async locator=>{await locator.focus();await locator.press('Enter');};

async function settings(page,language,size='100'){
 await activate(page.locator('.header [data-reading-open]'));
 await expect(page.locator('#reading-title')).toBeFocused();
 await page.locator('#reading-language').selectOption(language);
 await page.locator('#reading-size').selectOption(size);
 await activate(page.locator('#reading-form [type="submit"]'));
 await expect(page.locator('#reading-dialog')).not.toBeVisible();
 await expect(page.locator('.header [data-reading-open]')).toBeFocused();
 await expect(page.locator('html')).toHaveAttribute('lang',language==='ga'?'ga':'en-IE');
}

async function fits(page,label){
 const layout=await page.evaluate(()=>({
  width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
  clipped:[...document.querySelectorAll('.knowledge-panel h2,.knowledge-panel h3,.knowledge-panel p,.fuller-picture,.fuller-picture li,.choice,.topic-filter,.scenario,.cast-character')]
   .filter(el=>el.getClientRects().length&&el.scrollWidth>el.clientWidth+2)
   .map(el=>({class:el.className,text:el.textContent.slice(0,70)}))
 }));
 expect(layout.scroll,label+' has no horizontal scroll').toBeLessThanOrEqual(layout.width+2);
 expect(layout.clipped,label+' has no clipped text').toEqual([]);
}

async function knowledge(page,language,{focused=false}={}){
 const state=current(page),view=encounters[state.id].nodes[state.nodeId].views[state.role];
 await expect(page.locator('.story>.encounter-scene')).toHaveAttribute('data-scene-id',state.id+'/'+state.nodeId);
 await expect(page.locator('#knowledge-panel-title')).toHaveText(translateText('Your view of the incident',language));
 await expect(page.locator('.knowledge-panel section')).toHaveCount(3);
 for(const [i,key] of ['know','think','unknown'].entries()){
  await expect(page.locator('.knowledge-panel section p').nth(i)).toHaveText(translateText(view.knowledge[key],language));
 }
 if(focused){
  await expect(page.locator('#knowledge-panel-title')).toBeFocused();
  await expect(page.locator('#page-status')).toHaveText(translateText(state.role==='garda'?'Garda perspective':'Public perspective',language));
  await expect(page.locator('#knowledge-panel-title')).toBeInViewport({ratio:1});
  const bounds=await page.locator('#knowledge-panel-title').boundingBox();
  expect(bounds.y,'changed knowledge begins near the top, not below the choices').toBeLessThan(80);
 }
 const scene=page.locator('.story>.encounter-scene');
 await expect(scene.locator('.scene-cast-names [data-role-tone="public"]>span')).toHaveText(translateText('Public witness',language));
 await expect(scene.locator('.scene-cast-names [data-role-tone="garda"]>span')).toHaveText(translateText('Second Garda',language));
 if(state.nodeId==='witness-evidence')await expect(page.locator('#scene-title')).toHaveText(translateText('Preserving the evidence',language));
 await expect(scene).toHaveAttribute('data-scene-mode',state.nodeId===encounters[state.id].start?'together':'separate');
 if(state.nodeId!==encounters[state.id].start){
  await expect(scene.locator('.scene-location--public')).toHaveCount(1);
  await expect(scene.locator('.scene-location--garda')).toHaveCount(1);
  await expect(scene.locator('.scene-setting')).toHaveText(translateText('Separate reflections',language));
 }
 await fits(page,state.id+'/'+state.nodeId+'/'+state.role);
}

async function openReporting(page,entry,language){
 await page.goto(entry==='public'?'./':'garda/');
 await expect(page.locator('#game-title')).toBeVisible();
 if(language==='ga')await settings(page,language);
 await activate(page.locator(`.perspective-hero a[href="#encounters/${entry}"]`));
 await expect(page.locator('.scenario-library')).not.toHaveAttribute('open','');
 await activate(page.locator('.scenario-library>summary'));
 await activate(page.getByRole('button',{name:translateText('Reporting wrongdoing',language),exact:true}));
 await expect(page.locator('[data-topic="reporting"]')).toBeFocused();
 await expect(page.locator('[data-topic="reporting"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.encounter-card')).toHaveCount(2);
 for(const id of ids)await expect(page.locator(`[data-action="paired-start"][data-id="${id}"]`)).toBeVisible();
}

async function sources(page,view){
 const panel=page.locator('#feedback .source-details');
 await activate(panel.locator('summary'));
 const links=panel.locator('a');
 await expect(links).toHaveCount(view.refs.length);
 for(const [i,id] of view.refs.entries()){
  await expect(links.nth(i)).toHaveAttribute('href',references[id].url);
  await expect(links.nth(i)).toHaveAttribute('target','_blank');
  await expect(links.nth(i)).toHaveAttribute('rel',/noopener/);
 }
 // Inspect destinations only. Do not open or submit real complaint services.
}

async function capture(page,locator,testInfo,name){
 await page.evaluate(()=>document.fonts.ready.then(()=>true));
 await locator.scrollIntoViewIfNeeded();
 await locator.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
 await locator.screenshot({path:testInfo.outputPath(name+'.png'),animations:'disabled'});
}

for(const entry of roles)for(const id of ids)for(const language of ['en','ga'])for(const width of [390,1366]){
 test(`${entry} ${id} ${language} ${width}: complete reporting journey from homepage`,async({page},testInfo)=>{
  test.setTimeout(120000);
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400&&response.url().includes('/stopped-both-sides/'))errors.push(response.status()+' '+response.url());});
  await page.setViewportSize({width,height:width===390?844:768});
  await openReporting(page,entry,language);
  await fits(page,'reporting catalogue');
  await capture(page,page.locator('.scenario-library'),testInfo,'catalogue');
  await activate(page.locator(`[data-action="paired-start"][data-id="${id}"]`));
  await expect(page.locator('#scene-title')).toBeFocused();
  expect(current(page).id).toBe(id);expect(current(page).role).toBe(entry);
  // Deliberately use Daniel: he must remain distinct from the affected Cian.
  if(entry!=='public')await activate(page.locator('[data-action="paired-switch"]'));
  await activate(page.locator('[data-action="paired-characters"]'));
  await activate(page.locator('[data-character="public-5"]'));
  await activate(page.locator('[data-action="paired-character-close"]'));
  if(entry!=='public')await activate(page.locator('[data-action="paired-switch"]'));
  const cast=current(page).cast;
  await expect(page.locator('[data-cast-role="public"] strong')).toHaveText('Daniel');
  if(id==='public-witness')await expect(page.locator('.story-text')).toContainText('Cian');
  let steps=0;
  while(!current(page).complete){
   expect(++steps).toBeLessThanOrEqual(Object.keys(encounters[id].nodes).length);
   const before=current(page),node=encounters[id].nodes[before.nodeId];
   await knowledge(page,language);
   const scene=await page.locator('.story-text').innerText();
   // Switch from the toolbar before answering, including a keyboard path from
   // the knowledge heading to the first choice in the newly selected role.
   await activate(page.locator('[data-action="paired-switch"]'));
   await knowledge(page,language,{focused:true});
   expect(current(page).answers).toEqual(before.answers);expect(current(page).cast).toEqual(cast);
   await expect(page.locator('.story-text')).toHaveText(scene);
   await page.keyboard.press('Tab');await expect(page.locator('[data-action="paired-answer"]').first()).toBeFocused();
   await activate(page.locator('[data-action="paired-switch"]'));
   await knowledge(page,language,{focused:true});
   if(steps===1){
    await page.screenshot({path:testInfo.outputPath('switched-knowledge-viewport.png')});
    await capture(page,page.locator('.decision-context'),testInfo,'decision-context');
    // Exercise review feedback and correction, not only the highest-score route.
    const wrong=node.views[before.role].choices.findIndex(choice=>choice.points===0);
    await activate(page.locator('[data-action="paired-answer"]').nth(wrong));
    await expect(page.locator('#feedback')).toBeFocused();
    await activate(page.locator('[data-action="paired-change"]'));
    await expect(page.locator('#choice-title')).toBeFocused();expect(current(page).answers[before.role]).toBeNull();
   }
   for(const [i,role] of [before.role,other(before.role)].entries()){
    if(i){
     const saved=current(page);
     await activate(page.locator('[data-action="paired-compare"]'));
     await knowledge(page,language,{focused:true});
     expect(current(page).answers).toEqual(saved.answers);expect(current(page).history).toEqual(saved.history);
    }
    const view=node.views[role],correct=view.choices.findIndex(choice=>choice.points===1);
    await activate(page.locator('[data-action="paired-answer"]').nth(correct));
    await expect(page.locator('#feedback')).toBeFocused();expect(current(page).answers[role]).toBe(correct);
    await sources(page,view);
   }
   if(before.nodeId==='witness-evidence')await capture(page,page.locator('.story>.encounter-scene'),testInfo,'separate-evidence-scene');
   if(steps===1){
    const saved=current(page);
    await settings(page,language==='en'?'ga':'en');expect(current(page)).toEqual(saved);
    await settings(page,language);expect(current(page)).toEqual(saved);
    await page.reload();await expect(page.locator('#feedback')).toBeVisible();expect(current(page)).toEqual(saved);
    await activate(page.locator('.topline a').first());
    await activate(page.locator('.session-return a'));await expect(page.locator('#feedback')).toBeVisible();expect(current(page)).toEqual(saved);
   }
   const state=current(page),next=node.views[state.role].choices[state.answers[state.role]].next;
   await activate(page.locator('[data-action="paired-next"]'));
   await expect.poll(()=>current(page)?.nodeId).toBe(next);
   expect(current(page).cast).toEqual(cast);
  }
  const completed=current(page);
  expect(completed.history).toHaveLength(Object.keys(encounters[id].nodes).length);
  for(const role of roles)expect(completed.history.every(step=>step.answers[role]!==null)).toBe(true);
  await expect(page.locator('.fuller-picture .eyebrow')).toHaveText(translateText('THE FULLER PICTURE',language));
  await expect(page.locator('.fuller-picture li')).toHaveCount(5);
  await expect(page.locator('.fuller-picture-note')).toHaveText(translateText('This recap assesses whether you separated fact from inference, preserved evidence and used an appropriate reporting channel. It does not decide whether the conduct was unlawful or corrupt.',language));
  await expect(page.locator('.paired-recap>.summary-item')).toHaveCount(steps);
  await fits(page,'completed recap');
  await capture(page,page.locator('.fuller-picture'),testInfo,'fuller-picture');
  for(const item of await page.locator('.paired-recap>.summary-item').all()){
   await activate(item.locator('.recap-detail>summary'));
   await expect(item.locator('.recap-role .chosen')).toHaveCount(2);
  }
  await capture(page,page.locator('.paired-recap>.summary-item').first(),testInfo,'recap-comparison');
  await page.reload();await expect(page.locator('.fuller-picture')).toBeVisible();expect(current(page)).toEqual(completed);
  await activate(page.locator('.recap-next [data-action="paired-replay-role"]'));
  await expect(page.locator('#scene-title')).toBeFocused();expect(current(page).role).toBe(other(completed.role));
  expect(current(page).cast).toEqual(cast);expect(current(page).history).toEqual([]);
  await page.goBack();await expect(page.locator('.fuller-picture')).toBeVisible();expect(current(page)).toEqual(completed);
  await activate(page.locator('[data-action="paired-switch"]'));
  await expect(page.locator('#main h1')).toBeFocused();expect(current(page).complete).toBe(true);
  await activate(page.locator('[data-action="paired-revisit"]').first());
  await expect(page.locator('#scene-title')).toBeFocused();expect(current(page).nodeId).toBe(encounters[id].start);
  expect(current(page).cast).toEqual(cast);expect(current(page).answers).toEqual({public:null,garda:null});
  await activate(page.locator('.topline a[href="#progress"]'));
  const record=page.locator('.progress-situations>.info-block').filter({has:page.getByRole('heading',{name:translateText(encounters[id].title,language),exact:true})});
  await expect(record.locator('.progress-result>span')).toHaveText([translateText('Completed',language),translateText('Completed',language)]);
  expect(errors).toEqual([]);
 });
}

for(const id of ids)test(`${id}: knowledge and recap reflow with enlarged Irish text`,async({page},testInfo)=>{
 await openReporting(page,'public','ga');
 await settings(page,'ga','150');
 await activate(page.locator(`[data-action="paired-start"][data-id="${id}"]`));
 for(const [width,height] of [[320,568],[568,320],[768,1024],[1366,768]]){
  await page.setViewportSize({width,height});
  for(const role of roles){
   await activate(page.locator('[data-action="paired-switch"]'));
   await knowledge(page,'ga',{focused:true});
  }
 }
 await page.setViewportSize({width:390,height:844});
 await capture(page,page.locator('.decision-context'),testInfo,'large-irish-knowledge');
 while(!current(page).complete){
  await activate(page.locator('[data-action="paired-answer"]').first());
  await activate(page.locator('[data-action="paired-next"]'));
  await expect(page.locator('#feedback')).toHaveCount(0);
 }
 for(const [width,height] of [[320,568],[568,320],[768,1024],[1366,768]]){
  await page.setViewportSize({width,height});await fits(page,'large Irish recap');
 }
 await page.setViewportSize({width:390,height:844});
 await capture(page,page.locator('.fuller-picture'),testInfo,'large-irish-recap');
});
