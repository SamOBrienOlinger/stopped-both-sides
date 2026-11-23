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

const finishedFlowCSS=`/* Keep the native summary and its content in ordinary inline flow. Titles are
   inline blocks so their existing rise/fade remains transformable. */
#main summary:is(.situation-topic-trigger,.discrimination-ground-trigger) {
 --catalogue-summary-gap:clamp(6px,1.5vw,.75rem);
 --catalogue-count-size:2rem;
 --catalogue-leading-size:0px;
}
#main summary.situation-topic-trigger {
 --catalogue-icon-size:clamp(28px,7vw,40px);
 --catalogue-leading-size:calc(var(--catalogue-icon-size) + var(--catalogue-summary-gap));
}
#main summary > .catalogue-summary-content {display:contents}
#main summary > .catalogue-summary-content > strong {
 display:inline-block;
 inline-size:calc(100% - var(--catalogue-leading-size) - var(--catalogue-count-size) - 1rem - var(--catalogue-summary-gap) - var(--catalogue-summary-gap) - 1px);
 margin:0;
 margin-inline-end:var(--catalogue-summary-gap);
 vertical-align:middle;
}
#main .catalogue-summary-content > .learning-icon {
 display:inline-block;
 inline-size:var(--catalogue-icon-size);
 block-size:var(--catalogue-icon-size);
 margin-inline-end:var(--catalogue-summary-gap);
 vertical-align:middle;
}
#main .catalogue-summary-content > .situation-topic-count {
 display:inline-block;
 inline-size:var(--catalogue-count-size);
 margin-inline-end:var(--catalogue-summary-gap);
 text-align:center;
 vertical-align:middle;
 white-space:nowrap;
}
#main .catalogue-summary-content > .landing-disclosure-caret {
 display:inline-block;
 margin-inline:.125rem;
 vertical-align:middle;
}
#main .catalogue-summary-content > .topic-preview {
 display:block;
 margin-block-start:var(--catalogue-summary-gap);
 margin-inline-start:var(--catalogue-leading-size);
}
@media(max-width:28rem) {
 #main summary.situation-topic-trigger {--catalogue-icon-size:28px}
}
`;
const variants=[
 {id:'current',css:''},
 {id:'wrapper-contents',css:'#main summary>.catalogue-summary-content{display:contents!important}'},
 {id:'finished-flow',css:finishedFlowCSS}
];
async function applyVariant(page,variant){
 await page.locator('.scenario-library,.topic-disclosure').first().waitFor({state:'attached'});
 await page.addStyleTag({content:variant.css||'/* unchanged catalogue wrapper styles */'});
}

// These visual/layout observations run only AFTER the unchanged Street and
// Gender native keyboard/action sequences. They cannot settle those inputs.
async function captureSummary(page,summary,testInfo,name){
 await summary.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const title=summary.locator(':scope > .catalogue-summary-content > strong');
 await expect(title).not.toHaveAttribute('data-heading-pending');
 await expect(title).not.toHaveAttribute('data-heading-motion');
 await expect(title).toHaveCSS('opacity','1');
 await expect(title).toHaveCSS('transform','none');
 // A plain inline strong would lose the rise transform when its grid item
 // blockification disappears. The finished design must keep it transformable.
 await expect(title).toHaveCSS('display','inline-block');
 const geometry=await summary.evaluate(element=>{
  const rect=node=>{const r=node.getBoundingClientRect();return {top:r.top,right:r.right,bottom:r.bottom,left:r.left,width:r.width,height:r.height};};
  const bounds=rect(element),root=document.documentElement;
  const children=[...element.querySelector('.catalogue-summary-content').children].map(child=>({
   kind:child.tagName==='STRONG'?'title':child.classList.contains('learning-icon')?'icon':child.className,
   text:child.textContent?.trim().slice(0,70)||'',rect:rect(child),
   display:getComputedStyle(child).display,opacity:getComputedStyle(child).opacity,
   scrollWidth:child.scrollWidth,clientWidth:child.clientWidth
  }));
  return {direction:getComputedStyle(element).direction,viewport:{width:innerWidth,height:innerHeight},
   scrollX,scrollY,bounds,children,
   outside:children.filter(child=>child.rect.left<bounds.left-2||child.rect.right>bounds.right+2||child.rect.top<bounds.top-2||child.rect.bottom>bounds.bottom+2).map(child=>child.kind),
   clipped:children.filter(child=>child.kind!=='icon'&&child.scrollWidth>child.clientWidth+2).map(child=>child.kind),
   documentOverflow:root.scrollWidth>root.clientWidth+2};
 });
 await testInfo.attach(name+'.json',{body:Buffer.from(JSON.stringify(geometry,null,2)),contentType:'application/json'});
 await page.screenshot({path:testInfo.outputPath(name+'.png')});
 expect(geometry.outside,name+' keeps title, icon, count, caret and preview inside the summary').toEqual([]);
 expect(geometry.clipped,name+' keeps all summary text readable').toEqual([]);
 expect(geometry.documentOverflow,name+' does not create horizontal page overflow').toBe(false);
 return geometry;
}
async function captureFinishedFlow(page,entry,role,variant,testInfo){
 const profiles=[
  {language:'en',width:375,size:100},
  {language:'en',width:1366,size:100},
  {language:'ar',width:375,size:200}
 ];
 const visuals=[];
 for(const profile of profiles){
  await page.setViewportSize({width:profile.width,height:900});
  await page.goto(entry+'?lang='+profile.language+'#play');
  await applyVariant(page,variant);
  await expect(page.locator('html')).toHaveAttribute('lang',profile.language==='en'?'en-IE':'ar');
  if(profile.language==='ar')await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await page.evaluate(async size=>{await document.fonts.ready;document.documentElement.style.setProperty('--reading-size',size+'%');},profile.size);
  const prefix=`${role}-finished-flow-${profile.language}-${profile.width}-${profile.size}`;
  const topics=page.locator('.topic-disclosure');
  await topics.locator(':scope > summary').click();
  const street=topics.locator('[data-situation-topic="street"]');
  const record={...profile,street:await captureSummary(page,street.locator(':scope > summary'),testInfo,prefix+'-street')};
  const discrimination=topics.locator('[data-situation-topic="discrimination"]');
  await discrimination.locator(':scope > summary').click();
  record.discrimination=await captureSummary(page,discrimination.locator(':scope > summary'),testInfo,prefix+'-discrimination');
  const ground=discrimination.locator('[data-ground="gender"]');
  await ground.locator(':scope > summary').click();
  record.gender=await captureSummary(page,ground.locator(':scope > summary'),testInfo,prefix+'-gender');
  visuals.push(record);
 }
 return visuals;
}

for(const variant of variants)for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: ${variant.id} native catalogue keyboard geometry`,async({page},testInfo)=>{
  if(variant.id==='finished-flow')test.setTimeout(150000);
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
  if(variant.id==='finished-flow')evidence.visuals=await captureFinishedFlow(page,entry,role,variant,testInfo);
  }finally{
   if(!evidence[stage])evidence[stage]=await page.evaluate(()=>window.__nativeKeyboardEvidence).catch(()=>null);
   console.log('NATIVE_KEYBOARD_FOCUS '+JSON.stringify(evidence));
   await testInfo.attach('native-keyboard-focus.json',{
    body:Buffer.from(JSON.stringify(evidence,null,2)),contentType:'application/json'
   });
  }
 });
}
