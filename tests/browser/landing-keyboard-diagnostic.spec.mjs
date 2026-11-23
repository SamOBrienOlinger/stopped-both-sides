import {test,expect} from '@playwright/test';

// Diagnostic only: the production regression remains unchanged. This copies
// its exact setup through native close/Enter reopen, then records native focus
// traversal without changing layout, motion clocks, focus or keyboard input.
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{
  const identify=element=>{
   const summary=document.querySelector('.scenario-library [data-situation-topic="street"] > summary');
   return element?{documentHasFocus:document.hasFocus(),tag:element.tagName,id:element.id,action:element.dataset?.action||'',
    dataId:element.dataset?.id||'',tabIndex:element.tabIndex,
    isStreetSummary:element===summary,inStreet:!!summary?.parentElement.contains(element),
    outerHTML:element.outerHTML?.slice(0,360)||''}:null;
  };
  window.__nativeKeyboardEvidence={focusins:[],tabs:[],stage:'setup'};
  window.__nativeFocusIdentity=()=>identify(document.activeElement);
  document.addEventListener('focusin',event=>{
   window.__nativeKeyboardEvidence.focusins.push({stage:window.__nativeKeyboardEvidence.stage,
    trusted:event.isTrusted,target:identify(event.target),relatedTarget:identify(event.relatedTarget),
    active:identify(document.activeElement)});
  },true);
 });
});

test.afterEach(async({page},testInfo)=>{
 const evidence=await page.evaluate(()=>window.__nativeKeyboardEvidence).catch(()=>null);
 if(evidence){
  const report={project:testInfo.project.name,title:testInfo.title,...evidence};
  console.log('NATIVE_KEYBOARD_FOCUS '+JSON.stringify(report));
  await testInfo.attach('native-keyboard-focus.json',{
   body:Buffer.from(JSON.stringify(report,null,2)),contentType:'application/json'
  });
 }
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
async function expectNativeToggle(page,open,prevented=false){
 const record=await page.evaluate(()=>window.__catalogueToggle);
 expect(record.trusted,'the disclosure receives a real pointer or keyboard activation').toBe(true);
 expect(record.prevented,'only the explicit scripted control prevents the native toggle').toBe(prevented);
 expect(record.samples).toHaveLength(4);
 for(const sample of record.samples)expect(sample).toMatchObject({
  open,state:null,inlineHeight:'',heightEffect:false,contentFits:true,titleOpacity:'1'
 });
 const heights=record.samples.map(sample=>sample.height);
 expect(Math.max(...heights)-Math.min(...heights),'the catalogue is fully laid out on its first rendered frame').toBeLessThanOrEqual(1);
}

const variants=[
 {id:'current',css:''},
 {id:'all-heading-containment-off',css:'[data-heading-card]{container-type:normal!important}'},
 {id:'scenario-containment-off',css:'.scenario{container-type:normal!important}'},
 {id:'scenario-overflow-visible',css:'.scenario{overflow:visible!important}'},
 {id:'street-summary-block',css:'.scenario-library [data-situation-topic="street"] > summary{display:block!important}'},
 {id:'scripted-street-toggle',css:'',scripted:true}
];

for(const variant of variants)for(const [entry,role] of [['./','public'],['garda/','garda']]){
 test(`${role}: ${variant.id} native catalogue keyboard focus after close and reopen`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  if(variant.scripted)await page.addInitScript(()=>{
   document.addEventListener('click',event=>{
    const summary=event.target.closest?.('.scenario-library [data-situation-topic="street"] > summary');
    if(!summary||event.defaultPrevented||event.button>0)return;
    const control=event.target.closest?.('a,button,input,select,textarea');
    if(control&&summary.contains(control))return;
    event.preventDefault();summary.parentElement.open=!summary.parentElement.open;
   },true);
  });
  await page.goto(entry+'?lang=en#encounters/'+role);
  await page.addStyleTag({content:variant.css||'/* unchanged native catalogue styles */'});
  await page.evaluate(()=>document.fonts.ready);
  const library=page.locator('.scenario-library'),librarySummary=library.locator(':scope > summary');
  await recordCatalogueToggle(library);await librarySummary.click();
  await expectNativeToggle(page,true);
  const street=library.locator('[data-situation-topic="street"]'),summary=street.locator(':scope > summary');
  await recordCatalogueToggle(street);await summary.click();
  await expectNativeToggle(page,true,!!variant.scripted);

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
  await expectNativeToggle(page,false,!!variant.scripted);await expect(summary).toBeFocused();
  await recordCatalogueToggle(street);await summary.press('Enter');
  await expectNativeToggle(page,true,!!variant.scripted);await expect(summary).toBeFocused();
  for(let index=1;index<=4;index++){
   await page.evaluate(index=>{
    const evidence=window.__nativeKeyboardEvidence;
    evidence.stage='Tab '+index;
    evidence.tabs.push({index,before:window.__nativeFocusIdentity()});
   },index);
   await page.keyboard.press('Tab');
   await page.evaluate(()=>{
    window.__nativeKeyboardEvidence.tabs.at(-1).after=window.__nativeFocusIdentity();
   });
  }
  const evidence=await page.evaluate(()=>window.__nativeKeyboardEvidence);
  expect(evidence.tabs).toHaveLength(4);
  expect(evidence.tabs.some(step=>step.after?.action==='paired-start'&&step.after?.dataId==='public-street'),
   'native keyboard traversal reaches the first Street action within four Tab presses').toBe(true);
 });
}
