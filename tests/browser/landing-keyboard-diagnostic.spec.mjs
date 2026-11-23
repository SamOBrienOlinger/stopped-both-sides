import {test,expect} from '@playwright/test';

// Diagnostic only. The checkout/runtime and feature tests remain exact 23be546.
// CSS controls are applied before opening and reinstalled after navigation.
// Native focus and geometry are observed; no Tab handler or focus redirection
// is installed. The first Street Tab and the Gender Tab must reach Start.
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
  window.__nativeKeyboardEvidence={focusins:[],tabs:[],groundTab:null,stage:'setup'};
  window.__nativeKeyboardSample=(kind='street')=>{
   const panel=kind==='ground'?ground():street(),summary=panel?.querySelector(':scope > summary'),
    action=panel?.querySelector(kind==='ground'?'[data-action="paired-start"][data-id="discrimination-gender"]':'[data-action="paired-start"][data-id="public-street"]'),
    wrapper=summary?.querySelector('.catalogue-summary-content');
   return {focus:identify(document.activeElement),scrollX,scrollY,
    viewport:{x:0,y:0,top:0,right:innerWidth,bottom:innerHeight,left:0,width:innerWidth,height:innerHeight},
    summary:rect(summary),firstStart:rect(action),panel:rect(panel),
    summaryDisplay:summary?getComputedStyle(summary).display:null,
    wrapperDisplay:wrapper?getComputedStyle(wrapper).display:null,
    summaryTabIndexAttribute:summary?.getAttribute('tabindex')??null};
  };
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

const flexChildren=`
 #main summary>.catalogue-summary-content>strong{flex:1 1 0%!important;min-inline-size:0!important}
 #main summary>.catalogue-summary-content>:is(.learning-icon,.situation-topic-count,.landing-disclosure-caret){flex-shrink:0!important}
 #main .situation-topic-trigger>.catalogue-summary-content>.topic-preview{flex:0 0 100%!important;padding-inline-start:calc(clamp(28px,7vw,40px) + clamp(6px,1.5vw,.75rem))!important}
`;
const variants=[
 {id:'current',css:''},
 {id:'wrapper-contents',css:'#main summary>.catalogue-summary-content{display:contents!important}'},
 {id:'wrapper-inline-grid',css:'#main summary>.catalogue-summary-content{display:inline-grid!important;inline-size:100%!important;vertical-align:top!important}'},
 {id:'wrapper-flex',css:'#main summary>.catalogue-summary-content{display:flex!important;flex-wrap:wrap!important;inline-size:100%!important}'+flexChildren},
 {id:'wrapper-inline-flex',css:'#main summary>.catalogue-summary-content{display:inline-flex!important;flex-wrap:wrap!important;inline-size:100%!important;vertical-align:top!important}'+flexChildren},
 {id:'summary-list-item',css:'#main summary:is(.situation-topic-trigger,.discrimination-ground-trigger){display:list-item!important}'},
 {id:'summary-tabindex-zero',css:'',explicitTabindex:true}
];
async function applyVariant(page,variant){
 await page.locator('.scenario-library,.topic-disclosure').first().waitFor({state:'attached'});
 await page.addStyleTag({content:variant.css||'/* unchanged catalogue wrapper styles */'});
 if(variant.explicitTabindex)await page.locator('summary.situation-topic-trigger,summary.discrimination-ground-trigger').evaluateAll(elements=>{
  for(const element of elements)element.setAttribute('tabindex','0');
 });
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
  evidence.street=await page.evaluate(()=>window.__nativeKeyboardEvidence);
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
  evidence.landing=await page.evaluate(()=>window.__nativeKeyboardEvidence);
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
