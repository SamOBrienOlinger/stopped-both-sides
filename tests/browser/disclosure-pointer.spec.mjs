import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
});

// The fixture uses the app's existing disclosure controller and native input.
// A button near the top is exposed before the tall panel finishes opening, so
// a held press deterministically overlaps the original animation deadline.
async function fixture(page){
 await page.setViewportSize({width:390,height:844});
 await page.goto('./?lang=en#about');
 await expect(page.locator('.about-opening')).toBeVisible();
 await page.evaluate(async()=>{
  await document.fonts.ready;
  const section=document.createElement('section');
  section.id='press-fixture';
  section.style.cssText='margin:0 0 24px;';
  section.innerHTML=`<details id="press-panel" style="border:1px solid;padding:0;margin:0;">
   <summary id="press-summary" style="min-height:48px;padding:12px;line-height:24px;">Show actions</summary>
   <div id="press-content" style="padding:8px;">
    <button type="button" id="press-action" style="display:block;width:100%;min-height:44px;margin:0;">Choose this action</button>
    <div aria-hidden="true" style="height:1400px;"></div>
   </div>
  </details>`;
  document.querySelector('#main').prepend(section);
  const outside=document.createElement('button');
  outside.id='press-outside';outside.type='button';outside.textContent='Outside action';
  outside.style.cssText='position:fixed;right:12px;bottom:12px;z-index:1000;min-height:44px;';
  document.querySelector('.footer').append(outside);
  const panel=document.querySelector('#press-panel'),content=document.querySelector('#press-content'),
   summary=document.querySelector('#press-summary');
  const records=[],clicks={inside:0,outside:0},clickRecords=new WeakMap();
  let held=null,frame=0;
  const identity=element=>element?.closest?.('#press-action,#press-summary,#press-outside')?.id||element?.tagName||null;
  const sample=record=>{
   const box=record.element.getBoundingClientRect(),details=panel.getBoundingClientRect();
   return {time:performance.now(),scrollY,top:box.top,left:box.left,width:box.width,height:box.height,
    panelHeight:details.height,state:panel.getAttribute('data-disclosure-state'),open:panel.open,
    inlineHeight:panel.style.height,overflow:panel.style.overflow,anchor:panel.style.overflowAnchor,
    inert:content.inert,expanded:summary.getAttribute('aria-expanded')};
  };
  const eventSample=(event,record)=>({...sample(record),target:identity(event.target),
   hit:identity(document.elementFromPoint(event.clientX,event.clientY)),x:event.clientX,y:event.clientY});
  const draw=()=>{
   if(!held)return;
   held.samples.push(sample(held));frame=requestAnimationFrame(draw);
  };
  document.addEventListener('pointerdown',event=>{
   const element=event.target.closest?.('#press-action,#press-summary,#press-outside');
   if(!element||event.button!==0)return;
   cancelAnimationFrame(frame);
   const record={element,id:element.id,samples:[]};
   record.down=eventSample(event,record);record.samples.push(sample(record));
   records.push(record);held=record;frame=requestAnimationFrame(draw);
  },true);
  document.addEventListener('pointerup',event=>{
   if(!held)return;
   held.up=eventSample(event,held);held.samples.push(sample(held));
   held=null;cancelAnimationFrame(frame);
  },true);
  document.addEventListener('click',event=>{
   const record=records.at(-1);
   if(event.detail&&record?.up&&!record.click){
    record.click=eventSample(event,record);clickRecords.set(event,record);
   }
  },true);
  document.addEventListener('click',event=>{
   const record=clickRecords.get(event);
   if(record)record.afterClick=sample(record);
  });
  document.querySelector('#press-action').addEventListener('click',()=>clicks.inside++);
  outside.addEventListener('click',()=>clicks.outside++);
  window.__disclosurePressReport=()=>({clicks,records:records.map(({element,...record})=>record)});
 });
 return {panel:page.locator('#press-panel'),summary:page.locator('#press-summary'),
  action:page.locator('#press-action'),outside:page.locator('#press-outside')};
}

const report=page=>page.evaluate(()=>window.__disclosurePressReport?.());
const cleanPanel=panel=>panel.evaluate(element=>({open:element.open,
 state:element.getAttribute('data-disclosure-state'),height:element.style.height,
 overflow:element.style.overflow,anchor:element.style.overflowAnchor}));
const openAndSettled={open:true,state:null,height:'',overflow:'',anchor:''};

// Observe the first painted result of an actual summary activation. Checking
// only its eventual open attribute would also pass an animated height clip.
async function recordCatalogueToggle(panel){
 await panel.evaluate(element=>{
  const summary=element.querySelector(':scope > summary');
  window.__catalogueToggle=new Promise(resolve=>{
   summary.addEventListener('click',event=>{
    const samples=[];
    const sample=()=>{
     const box=element.getBoundingClientRect();
     const content=[...element.children].filter(child=>child!==summary);
     const title=summary.querySelector('[data-card-heading]')||summary;
     samples.push({open:element.open,state:element.getAttribute('data-disclosure-state'),
      inlineHeight:element.style.height,height:box.height,
      heightEffect:element.getAnimations().some(animation=>animation.effect.getKeyframes().some(frame=>'height' in frame)),
      contentFits:!element.open||content.every(child=>child.getBoundingClientRect().bottom<=box.bottom+1),
      titleOpacity:getComputedStyle(title).opacity});
     if(samples.length<4)requestAnimationFrame(sample);
     else resolve({trusted:event.isTrusted,prevented:event.defaultPrevented,samples});
    };
    requestAnimationFrame(sample);
   },{once:true});
  });
 });
}
async function expectNativeToggle(page,open){
 const record=await page.evaluate(()=>window.__catalogueToggle);
 expect(record.trusted,'the disclosure receives a real pointer or keyboard activation').toBe(true);
 expect(record.prevented,'the catalogue keeps the summary native toggle action').toBe(false);
 expect(record.samples).toHaveLength(4);
 for(const sample of record.samples)expect(sample).toMatchObject({
  open,state:null,inlineHeight:'',heightEffect:false,contentFits:true,titleOpacity:'1'
 });
 const heights=record.samples.map(sample=>sample.height);
 expect(Math.max(...heights)-Math.min(...heights),'the catalogue is fully laid out on its first rendered frame').toBeLessThanOrEqual(1);
}

function heldSteady(record,id){
 expect(record,'the browser delivered a real pointerdown').toBeDefined();
 expect(record.down.state,'the press begins before expansion settles').toBe('opening');
 expect(record.down.target).toBe(id);expect(record.down.hit).toBe(id);
 expect(record.up.target,'pointerup reaches the originally pressed control').toBe(id);
 expect(record.up.hit,'the control remains under the release point').toBe(id);
 expect(record.click.target,'native click activates the originally pressed control').toBe(id);
 expect(record.up.state,'the panel remains held until activation').toBe('opening');
 expect(record.samples.length).toBeGreaterThan(1);
 for(const key of ['scrollY','top','left','width','height','panelHeight']){
  const values=record.samples.map(sample=>sample[key]);
  expect(Math.max(...values)-Math.min(...values),`${key} stays stable throughout the held press`).toBeLessThanOrEqual(1);
 }
}

test.afterEach(async({page},testInfo)=>{
 const evidence=await report(page).catch(()=>null);
 if(evidence)await testInfo.attach('native-disclosure-presses.json',{
  body:Buffer.from(JSON.stringify(evidence,null,2)),contentType:'application/json'
 });
});

test('an opening disclosure keeps native activation and scroll stable across a held pointer press',async({page})=>{
 const {panel,summary,action}=await fixture(page);
 await summary.click();
 // The only delay is between real pointerdown and pointerup. It exceeds both
 // the 800ms animation and its 5s safety deadline, without delaying activation
 // until the panel has settled or disabling the production motion controller.
 await action.click({delay:5500});
 const evidence=await report(page),record=evidence.records.find(record=>record.id==='press-action');
 heldSteady(record,'press-action');
 expect(record.samples.length,'rendering continues while disclosure time is held').toBeGreaterThan(2);
 expect(record.up.time-record.down.time).toBeGreaterThanOrEqual(5000);
 expect(evidence.clicks.inside,'the native action fires exactly once').toBe(1);
 expect(await cleanPanel(panel)).toEqual(openAndSettled);
});

test('a held summary reverses from its current height and keyboard entry still settles the panel',async({page})=>{
 const {panel,summary,action}=await fixture(page);
 await summary.click();
 // Wait only for an intermediate drawn height, never for completion. The
 // second native pointerdown below must still report the opening state.
 await expect.poll(()=>panel.evaluate(element=>element.getBoundingClientRect().height)).toBeGreaterThan(140);
 await summary.click({delay:80});
 const evidence=await report(page),record=evidence.records.filter(record=>record.id==='press-summary').at(-1);
 heldSteady(record,'press-summary');
 expect(record.afterClick.state,'release must not prematurely finish the reversed animation').toBe('closing');
 expect(record.afterClick.expanded).toBe('false');expect(record.afterClick.inert).toBe(true);
 expect(Math.abs(record.afterClick.panelHeight-record.up.panelHeight)).toBeLessThanOrEqual(1);
 await expect.poll(()=>cleanPanel(panel)).toEqual({...openAndSettled,open:false});
 await summary.press('Enter');
 await page.keyboard.press('Tab');
 await expect(action).toBeFocused();
 expect(await cleanPanel(panel)).toEqual(openAndSettled);
 await expect(page.locator('#press-content')).toHaveJSProperty('inert',false);
});

test('presses outside main also hold expanding panels and release outside a control cannot leave them frozen',async({page})=>{
 const {panel,summary,action,outside}=await fixture(page);
 await summary.click();
 await outside.click({delay:1200});
 let evidence=await report(page);
 heldSteady(evidence.records.find(record=>record.id==='press-outside'),'press-outside');
 expect(evidence.clicks.outside).toBe(1);expect(await cleanPanel(panel)).toEqual(openAndSettled);
 await summary.click();
 await expect.poll(()=>cleanPanel(panel)).toEqual({...openAndSettled,open:false});
 await summary.click();
 await action.hover();
 await page.mouse.down();
 await expect.poll(async()=>{
  const current=await report(page);return current.records.at(-1)?.samples.length||0;
 }).toBeGreaterThan(2);
 await page.mouse.move(1,1);await page.mouse.up();
 evidence=await report(page);
 const released=evidence.records.filter(record=>record.id==='press-action').at(-1);
 expect(released.down.state).toBe('opening');expect(released.up.target).not.toBe('press-action');
 expect(evidence.clicks.inside,'dragging off a control does not manufacture an activation').toBe(0);
 await expect.poll(()=>cleanPanel(panel)).toEqual(openAndSettled);
});

test('navigation cleans up a disclosure removed while its action is pressed',async({page})=>{
 const {summary,action}=await fixture(page);
 await summary.click();await action.hover();await page.mouse.down();
 const evidence=await report(page),pressed=evidence.records.at(-1);
 expect(pressed.id).toBe('press-action');expect(pressed.down.state).toBe('opening');
 await page.evaluate(()=>{
  window.__removedDisclosure=document.querySelector('#press-panel');
  location.hash='#encounters/public';
 });
 await expect(page.locator('.paired-picker')).toBeVisible();
 expect(await page.evaluate(()=>{
  const panel=window.__removedDisclosure;
  return {connected:panel.isConnected,state:panel.getAttribute('data-disclosure-state'),
   motion:panel.getAttribute('data-motion'),height:panel.style.height,
   overflow:panel.style.overflow,anchor:panel.style.overflowAnchor};
 })).toEqual({connected:false,state:null,motion:null,height:'',overflow:'',anchor:''});
 await page.mouse.move(1,1);await page.mouse.up();
 expect((await report(page)).clicks.inside).toBe(0);
 await page.locator('[data-action="paired-quick-start"]').click();
 await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible();
});

for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: catalogue controls open natively while newly exposed headings retain their entrance`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(entry+'?lang=en#encounters/'+role);
  await page.evaluate(()=>document.fonts.ready);
  const library=page.locator('.scenario-library'),librarySummary=library.locator(':scope > summary');
  await recordCatalogueToggle(library);await librarySummary.click();
  await expectNativeToggle(page,true);
  const street=library.locator('[data-situation-topic="street"]'),summary=street.locator(':scope > summary');
  await recordCatalogueToggle(street);await summary.click();
  await expectNativeToggle(page,true);

  // The last real Street card begins below the viewport. Native expansion
  // must register its title for the same later-entry rise/fade as other cards.
  const later=street.locator('.encounter-card').last(),heading=later.locator(':scope > h2');
  expect(await later.evaluate(element=>element.getBoundingClientRect().top>innerHeight+80)).toBe(true);
  await expect(heading).toHaveAttribute('data-heading-pending','');
  await later.evaluate(element=>{
   const heading=element.querySelector(':scope > h2'),action=element.querySelector('button');
   window.__catalogueHeadingEntrances=[];
   heading.addEventListener('animationstart',event=>{
    const cardStyle=getComputedStyle(element),actionStyle=getComputedStyle(action);
    window.__catalogueHeadingEntrances.push({name:event.animationName,
     cardOpacity:cardStyle.opacity,cardTransform:cardStyle.transform,
     actionOpacity:actionStyle.opacity,actionTransform:actionStyle.transform});
   });
  });
  await later.scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(()=>window.__catalogueHeadingEntrances)).toEqual([{
   name:'ui-card-heading-arrive',cardOpacity:'1',cardTransform:'none',actionOpacity:'1',actionTransform:'none'
  }]);
  await expect(heading).not.toHaveAttribute('data-heading-pending');
  await expect(heading).not.toHaveAttribute('data-heading-motion');
  await expect(heading).toHaveCSS('opacity','1');
  await expect(heading).toHaveCSS('transform','none');

  // Keyboard toggles preserve the summary focus and expose actions at once.
  await summary.focus();await recordCatalogueToggle(street);await summary.press('Space');
  await expectNativeToggle(page,false);await expect(summary).toBeFocused();
  await recordCatalogueToggle(street);await summary.press('Enter');
  await expectNativeToggle(page,true);await expect(summary).toBeFocused();
  await page.keyboard.press('Tab');
  const start=street.locator('[data-action="paired-start"][data-id="public-street"]');
  await expect(start).toBeFocused();
  await start.press('Enter');
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible();

  // The landing browser exposes the same action cards through two more
  // native layers. None may leave an immediately available Start clipped.
  await page.goto(entry+'?lang=en#play');
  const topics=page.locator('.topic-disclosure');
  await recordCatalogueToggle(topics);await topics.locator(':scope > summary').click();
  await expectNativeToggle(page,true);
  const discrimination=topics.locator('[data-situation-topic="discrimination"]');
  await recordCatalogueToggle(discrimination);await discrimination.locator(':scope > summary').click();
  await expectNativeToggle(page,true);
  const ground=discrimination.locator('[data-ground="gender"]');
  await recordCatalogueToggle(ground);await ground.locator(':scope > summary').click();
  await expectNativeToggle(page,true);
  await ground.locator('[data-action="paired-start"][data-id="discrimination-gender"]').click();
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible();
 });

 test(`${role}: an immediate shared-situation click after expanding Street stops reaches the choices`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(entry+'?lang=en#encounters/'+role);
  await page.locator('.scenario-library>summary').click();
  await page.getByRole('button',{name:'Young people',exact:true}).click();
  await page.getByRole('button',{name:'All topics',exact:true}).click();
  await page.locator('.scenario-library [data-situation-topic="street"]>summary').click();
  await page.locator('.scenario-library [data-action="paired-start"][data-id="public-street"]').click();
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible();
 });

 test(`${role}: an immediate original-practice click after expanding Street stops reaches the choices`,async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  await page.goto(entry+'?lang=en');
  await page.locator('.single-mode>summary').click();
  await page.locator('.single-mode .practice-content a').click();
  await page.locator('.scenario-library .situation-topic>summary').first().click();
  await page.locator('.scenario-library [data-action="start"]').first().click();
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('[data-action="choose"]').first()).toBeVisible();
 });
}
