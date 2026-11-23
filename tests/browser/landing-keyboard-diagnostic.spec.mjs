import {test,expect} from '@playwright/test';

// Diagnostic only. The checkout/runtime and feature tests remain exact 23be546.
// CSS controls are applied before opening and reinstalled after navigation.
// One explicit scroll control changes only the pre-Tab viewport position.
// Native focus, keys and geometry are observed; no Tab interception or focus
// redirection is installed. The first Street Tab and the Gender Tab must reach Start.
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{
  const street=()=>document.querySelector('.scenario-library [data-situation-topic="street"]');
  const ground=()=>document.querySelector('.topic-disclosure [data-ground="gender"]');
  const identify=element=>{
   const topic=street(),gender=ground();
   return element?{documentHasFocus:document.hasFocus(),tag:element.tagName,id:element.id,
    action:element.dataset?.action||'',dataId:element.dataset?.id||'',tabIndex:element.tabIndex,
    isStreetSummary:element===topic?.querySelector(':scope > summary'),
    isFirstStreetAction:element===topic?.querySelector('[data-action="paired-start"][data-id="public-street"]'),
    isGenderSummary:element===gender?.querySelector(':scope > summary'),
    isFirstGenderAction:element===gender?.querySelector('[data-action="paired-start"][data-id="discrimination-gender"]'),
    outerHTML:element.outerHTML?.slice(0,240)||''}:null;
  };
  const rect=element=>{
   if(!element)return null;
   const b=element.getBoundingClientRect();
   return {x:b.x,y:b.y,top:b.top,right:b.right,bottom:b.bottom,left:b.left,width:b.width,height:b.height};
  };
  window.__nativeKeyboardEvidence={focusins:[],keyEvents:[],summaryClicks:[],tabs:[],groundTab:null,stage:'setup'};
  window.__nativeKeyboardSample=(kind='street')=>{
   const panel=kind==='ground'?ground():street(),summary=panel?.querySelector(':scope > summary'),
    action=panel?.querySelector(kind==='ground'?'[data-action="paired-start"][data-id="discrimination-gender"]':'[data-action="paired-start"][data-id="public-street"]'),
    wrapper=summary?.querySelector('.catalogue-summary-content');
   const actionStyle=action?getComputedStyle(action):null,actionRect=rect(action);
   const point=actionRect?{x:actionRect.left+actionRect.width/2,y:actionRect.top+actionRect.height/2}:null;
   const hit=point?document.elementFromPoint(point.x,point.y):null;
   const clippingAncestors=[];
   for(let ancestor=action?.parentElement;ancestor;ancestor=ancestor.parentElement){
    const style=getComputedStyle(ancestor);
    if(ancestor.inert||ancestor.hidden||ancestor.matches('details')||style.overflowX!=='visible'||style.overflowY!=='visible'||style.contain!=='none'){
     clippingAncestors.push({tag:ancestor.tagName,className:ancestor.className,inert:ancestor.inert,hidden:ancestor.hidden,
      open:ancestor.matches('details')?ancestor.open:null,display:style.display,visibility:style.visibility,
      overflowX:style.overflowX,overflowY:style.overflowY,contain:style.contain,clipPath:style.clipPath,rect:rect(ancestor)});
    }
   }
   return {focus:identify(document.activeElement),scrollX,scrollY,
    viewport:{x:0,y:0,top:0,right:innerWidth,bottom:innerHeight,left:0,width:innerWidth,height:innerHeight},
    summary:rect(summary),firstStart:rect(action),panel:rect(panel),
    summaryDisplay:summary?getComputedStyle(summary).display:null,
    wrapperDisplay:wrapper?getComputedStyle(wrapper).display:null,
    actionState:action?{display:actionStyle.display,visibility:actionStyle.visibility,opacity:actionStyle.opacity,
     pointerEvents:actionStyle.pointerEvents,disabled:action.disabled,hidden:action.hidden,
     inert:action.inert,inertAncestor:!!action.closest('[inert]'),tabIndex:action.tabIndex,
     tabIndexAttribute:action.getAttribute('tabindex'),ariaDisabled:action.getAttribute('aria-disabled'),
     clientRectCount:action.getClientRects().length,point,hit:identify(hit),hitIsAction:hit===action||action.contains(hit),
     intersectsViewport:actionRect.bottom>0&&actionRect.top<innerHeight&&actionRect.right>0&&actionRect.left<innerWidth,
     clippingAncestors}:null,
    summaryTabIndexAttribute:summary?.getAttribute('tabindex')??null};
  };
  for(const type of ['keydown','keyup'])document.addEventListener(type,event=>{
   if(event.key!=='Tab')return;
   const report=window.__nativeKeyboardEvidence;
   const record={type,stage:report.stage,trusted:event.isTrusted,key:event.key,shift:event.shiftKey,
    defaultPreventedAtCapture:event.defaultPrevented,target:identify(event.target),activeAtCapture:identify(document.activeElement)};
   report.keyEvents.push(record);
   // A zero-delay task observes the completed native dispatch/default action;
   // it does not cancel, retarget, or wait before the next trusted input.
   setTimeout(()=>{record.defaultPreventedAfterDispatch=event.defaultPrevented;record.activeAfterDispatch=identify(document.activeElement);},0);
  },{capture:true,passive:true});
  document.addEventListener('focusin',event=>{
   window.__nativeKeyboardEvidence.focusins.push({stage:window.__nativeKeyboardEvidence.stage,
    trusted:event.isTrusted,target:identify(event.target),relatedTarget:identify(event.relatedTarget),
    active:identify(document.activeElement)});
  },true);
 });
});

// Observe the first painted result of an actual summary activation. Checking
// only its eventual open attribute would also pass an animated height clip.
async function recordCatalogueToggle(panel){
 await panel.evaluate(element=>{
  const summary=element.querySelector(':scope > summary');
  window.__catalogueToggle=new Promise(resolve=>{
   summary.addEventListener('click',event=>{
    const click={trusted:event.isTrusted,detail:event.detail,clientX:event.clientX,clientY:event.clientY,
     targetTag:event.target.tagName,targetClass:event.target.getAttribute('class')||'',
     targetIsSummary:event.target===summary,targetIsTitle:event.target.matches('[data-card-heading],strong'),
     panelClass:element.className,topic:element.dataset.situationTopic||'',ground:element.dataset.ground||'',
     openAtDispatch:element.open};
    window.__nativeKeyboardEvidence.summaryClicks.push(click);
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
     else resolve({trusted:event.isTrusted,prevented:event.defaultPrevented,click,samples});
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
 return record;
}

const contents='#main summary>.catalogue-summary-content{display:contents!important}';
const streetSummary='#main .scenario-library [data-situation-topic="street"] > summary';
const variants=[
 {id:'current',css:''},
 {id:'wrapper-contents',css:contents},
 {id:'current-scroll-plus-113',css:'',scrollBeforeTab:113},
 {id:'current-street-summary-tall',css:streetSummary+'{min-block-size:75.781px!important}'},
 {id:'contents-street-summary-short',css:contents+streetSummary+'{block-size:56.766px!important}'},
 {id:'contents-title-inline-block',css:contents+'#main summary>.catalogue-summary-content>strong{display:inline-block!important}'},
 {id:'current-wrapper-pointer-events-none',css:'#main summary>.catalogue-summary-content{pointer-events:none!important}',requireSummaryTarget:true},
 {id:'current-summary-padding-click',css:'',paddingClick:true,requireSummaryTarget:true}
];
async function applyVariant(page,variant){
 await page.locator('.scenario-library,.topic-disclosure').first().waitFor({state:'attached'});
 await page.addStyleTag({content:variant.css||'/* unchanged catalogue wrapper styles */'});
}

for(const variant of variants)for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: ${variant.id} native catalogue keyboard geometry`,async({page},testInfo)=>{
  const evidence={project:testInfo.project.name,role,variant:variant.id,street:null,landing:null};
  let stage='street';
  try{
  await page.setViewportSize({width:390,height:844});
  await page.goto(entry+'?lang=en#encounters/'+role);
  await page.evaluate(()=>document.fonts.ready);
  await applyVariant(page,variant);
  const library=page.locator('.scenario-library'),librarySummary=library.locator(':scope > summary');
  await recordCatalogueToggle(library);await librarySummary.click();
  await expectNativeToggle(page,true);
  const street=library.locator('[data-situation-topic="street"]'),summary=street.locator(':scope > summary');
  await recordCatalogueToggle(street);
  await summary.click(variant.paddingClick?{position:{x:20,y:5}}:{});
  const initialStreetToggle=await expectNativeToggle(page,true);
  if(variant.requireSummaryTarget)expect(initialStreetToggle.click,
   'the hit-target control must activate the actual SUMMARY without changing its geometry').toMatchObject({targetTag:'SUMMARY',targetIsSummary:true});

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
  if(variant.scrollBeforeTab)await page.evaluate(delta=>scrollBy({top:delta,behavior:'instant'}),variant.scrollBeforeTab);
  for(let index=1;index<=4;index++){
   await page.evaluate(index=>{
    const report=window.__nativeKeyboardEvidence;
    report.stage='Street Tab '+index;
    report.tabs.push({index,before:window.__nativeKeyboardSample('street')});
   },index);
   await page.keyboard.press('Tab');
   await page.evaluate(()=>{
    window.__nativeKeyboardEvidence.tabs.at(-1).after=window.__nativeKeyboardSample('street');
   });
  }
  evidence.street=await page.evaluate(async()=>{await new Promise(resolve=>setTimeout(resolve,0));return window.__nativeKeyboardEvidence;});
  expect(evidence.street.tabs).toHaveLength(4);
  expect(evidence.street.tabs[0].after.focus,
   'the FIRST real Tab from Street summary must focus its first Start action').toMatchObject({
    documentHasFocus:true,isFirstStreetAction:true,tag:'BUTTON',action:'paired-start',dataId:'public-street'
   });
  const start=street.locator('[data-action="paired-start"][data-id="public-street"]');
  await start.click();
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible();

  // The landing browser exposes the same action cards through two more
  // native layers. None may leave an immediately available Start clipped.
  stage='landing';
  await page.goto(entry+'?lang=en#play');
  await applyVariant(page,variant);
  const topics=page.locator('.topic-disclosure');
  await recordCatalogueToggle(topics);await topics.locator(':scope > summary').click();
  await expectNativeToggle(page,true);
  const discrimination=topics.locator('[data-situation-topic="discrimination"]');
  await recordCatalogueToggle(discrimination);await discrimination.locator(':scope > summary').click();
  await expectNativeToggle(page,true);
  const ground=discrimination.locator('[data-ground="gender"]');
  await recordCatalogueToggle(ground);await ground.locator(':scope > summary').click();
  await expectNativeToggle(page,true);
  await ground.locator(':scope > summary').focus();
  await page.evaluate(()=>{
   window.__nativeKeyboardEvidence.stage='Gender Tab 1';
   window.__nativeKeyboardEvidence.groundTab={before:window.__nativeKeyboardSample('ground')};
  });
  await page.keyboard.press('Tab');
  await page.evaluate(()=>{
   window.__nativeKeyboardEvidence.groundTab.after=window.__nativeKeyboardSample('ground');
  });
  evidence.landing=await page.evaluate(async()=>{await new Promise(resolve=>setTimeout(resolve,0));return window.__nativeKeyboardEvidence;});
  const groundStart=ground.locator('[data-action="paired-start"][data-id="discrimination-gender"]');
  await expect(groundStart).toBeFocused();
  await groundStart.click();
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('[data-action="paired-answer"]').first()).toBeVisible();
  }finally{
   if(!evidence[stage])evidence[stage]=await page.evaluate(()=>window.__nativeKeyboardEvidence).catch(()=>null);
   console.log('NATIVE_KEYBOARD_FOCUS '+JSON.stringify(evidence));
   await testInfo.attach('native-keyboard-focus.json',{
    body:Buffer.from(JSON.stringify(evidence,null,2)),contentType:'application/json'
   });
  }
 });
}
