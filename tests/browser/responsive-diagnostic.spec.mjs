import {test,expect} from '@playwright/test';

// Diagnostic only. Copy beside the regular browser specs and run with the
// existing Playwright config; no product code or production gates are changed.
test.setTimeout(60000);
test.use({viewport:{width:1366,height:768},reducedMotion:'no-preference',trace:'on'});

const variants=[
 {id:'summary-containment',css:'#main details[data-heading-card]{container-type:normal!important} #main details[data-heading-card]>summary{container-type:inline-size!important}',settle:false}
];

async function installRecorder(page){
 await page.addInitScript(()=>{
  const events=[];
  let lastPoint=null;
  const describe=element=>{
   if(!(element instanceof Element))return null;
   const control=element.closest('button[data-action],a,summary');
   return {tag:element.tagName,id:element.id||null,className:element.getAttribute('class'),
    text:element.textContent?.trim().replace(/\s+/g,' ').slice(0,90)||'',
    closestAction:element.closest('[data-action]')?.getAttribute('data-action')||null,
    closestActionId:element.closest('[data-action]')?.getAttribute('data-id')||null,
    control:control?{tag:control.tagName,action:control.getAttribute('data-action'),
     id:control.getAttribute('data-id'),href:control.getAttribute('href'),
     topic:control.closest('[data-situation-topic]')?.getAttribute('data-situation-topic')||null}:null};
  };
  const geometry=element=>{
   if(!element)return null;
   const rect=element.getBoundingClientRect(),style=getComputedStyle(element);
   return {x:rect.x,y:rect.y,width:rect.width,height:rect.height,top:rect.top,bottom:rect.bottom,
    clientHeight:element.clientHeight,scrollHeight:element.scrollHeight,scrollTop:element.scrollTop,
    containerType:style.containerType,overflow:style.overflow,computedHeight:style.height,
    inlineStyle:element.getAttribute('style')};
  };
  const snapshot=(label,event=null,phase=null)=>{
   const street=document.querySelector('.scenario-library .situation-topic[data-situation-topic="street"]');
   const button=document.querySelector('.scenario-library [data-action="start"][data-id="street"]');
   const isPointEvent=event&&['pointerdown','pointerup','click'].includes(event.type)&&Number.isFinite(event.clientX);
   if(isPointEvent)lastPoint={x:event.clientX,y:event.clientY};
   const point=isPointEvent?{x:event.clientX,y:event.clientY}:lastPoint;
   const buttonBox=button?.getBoundingClientRect();
   return {label,time:performance.now(),event:event?.type||null,phase,url:location.href,
    defaultPrevented:event?.defaultPrevented??null,trusted:event?.isTrusted??null,
    pointerType:event?.pointerType||null,buttonNumber:event?.button??null,
    target:describe(event?.target),focused:describe(document.activeElement),
    point,pointSource:isPointEvent?'event':point?'last-pointer':null,
    hitTarget:point?describe(document.elementFromPoint(point.x,point.y)):null,
    buttonCenterHit:buttonBox?describe(document.elementFromPoint(buttonBox.x+buttonBox.width/2,buttonBox.y+buttonBox.height/2)):null,
    scroll:{x:scrollX,y:scrollY,rootTop:document.documentElement.scrollTop,
     maxY:document.documentElement.scrollHeight-innerHeight,viewportHeight:innerHeight},
    street:street?{...geometry(street),open:street.open,state:street.getAttribute('data-disclosure-state'),
     motion:street.getAttribute('data-motion')}:null,
    startButton:geometry(button),
    game:{scene:!!document.querySelector('#scene-title'),choice:!!document.querySelector('#choice-title'),story:!!document.querySelector('.story')}};
  };
  const record=(event,phase)=>{
   if(!(event.target instanceof Element)||!event.target.closest('#main'))return;
   if(events.length<180)events.push(snapshot('native-event',event,phase));
  };
  for(const type of ['pointerdown','pointerup','click','focusin']){
   document.addEventListener(type,event=>record(event,'capture'),true);
   document.addEventListener(type,event=>record(event,'bubble'),false);
  }
  window.__practiceDisclosureDiagnostic={events,snapshot};
 });
}

for(const variant of variants)for(let repetition=1;repetition<=2;repetition++){
 test(`Garda practice disclosure A/B: ${variant.id} run ${repetition}`,async({page},testInfo)=>{
  await installRecorder(page);
  const report={variant:variant.id,repetition,css:variant.css,waitForStreetSettlement:variant.settle,
   milestones:[],pageErrors:[],errors:[],navigationSucceeded:false,gameVisible:false};
  page.on('pageerror',error=>report.pageErrors.push(String(error)));
  const mark=async label=>{
   const state=await page.evaluate(label=>window.__practiceDisclosureDiagnostic?.snapshot(label),label);
   report.milestones.push(state||{label,missingRecorder:true,url:page.url()});
  };
  try{
   await page.goto('garda/#play');
   if(variant.css)await page.addStyleTag({content:variant.css});
   await page.locator('.single-mode summary').click({timeout:15000});
   await page.locator('.single-mode .practice-content a').click({timeout:15000});
   await mark('practice-route-before-street');
   const street=page.locator('.scenario-library .situation-topic').first();
   await street.locator(':scope > summary').click({timeout:15000});
   if(variant.settle){
    await expect(street).toHaveAttribute('open','');
    await expect(street).not.toHaveAttribute('data-disclosure-state',/./,{timeout:10000});
   }
   await mark('before-start-click');
   await page.locator('.scenario-library [data-action="start"]').first().click({timeout:15000});
   await mark('immediately-after-start-click');
   await testInfo.attach('after-start-click',{body:await page.screenshot({fullPage:false,animations:'allow'}),contentType:'image/png'});
   try{await page.waitForURL(/#scenario\/street(?:$|~)/,{timeout:6000});}
   catch(error){report.errors.push({stage:'wait-for-scenario-route',message:String(error)});}
   report.navigationSucceeded=/#scenario\/street(?:$|~)/.test(page.url());
   report.gameVisible=await page.locator('.story').isVisible();
  }catch(error){
   report.errors.push({stage:'flow',message:String(error)});
  }finally{
   try{await mark('final-state');}catch(error){report.errors.push({stage:'final-snapshot',message:String(error)});}
   try{report.events=await page.evaluate(()=>window.__practiceDisclosureDiagnostic?.events||[]);}
   catch(error){report.errors.push({stage:'event-log',message:String(error)});}
   report.finalURL=page.url();
   try{await testInfo.attach('final-state',{body:await page.screenshot({fullPage:false,animations:'allow'}),contentType:'image/png'});}
   catch(error){report.errors.push({stage:'final-screenshot',message:String(error)});}
   await testInfo.attach('disclosure-diagnostic',{body:Buffer.from(JSON.stringify(report,null,2)),contentType:'application/json'});
   console.log(JSON.stringify({variant:variant.id,repetition,navigationSucceeded:report.navigationSucceeded,
    gameVisible:report.gameVisible,finalURL:report.finalURL,eventCount:report.events?.length||0,
    errors:report.errors.map(error=>error.stage),pageErrors:report.pageErrors}));
  }
  expect(report.navigationSucceeded&&report.gameVisible,`See disclosure-diagnostic attachment for ${variant.id} run ${repetition}`).toBe(true);
 });
}
