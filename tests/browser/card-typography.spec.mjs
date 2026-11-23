import {test,expect} from '@playwright/test';
import {startEncounter,answer,continueEncounter,stateHash} from '../../encounters/engine.mjs?v=link-audit-20261123';

const cast={public:'public-2',garda:'garda-5'};
function recapFor(role){
 let state=startEncounter('public-street',role,{cast});
 for(let step=0;step<12&&!state.complete;step++)state=continueEncounter(answer(state,0));
 if(!state.complete)throw new Error('The typography fixture must reach its recap');
 return stateHash(state);
}

async function expectTextFits(page,label){
 const result=await page.locator('#main').evaluate(main=>{
  const root=document.documentElement;
  const ignored='.scene-stage,.character-picker,.scene-profile-shell';
  const visible=element=>element.getClientRects().length&&!element.closest(ignored);
  const text=[...main.querySelectorAll('[data-card-heading],p,li,dd')].filter(visible);
  const clipped=text.filter(element=>element.scrollWidth>element.clientWidth+2)
   .map(element=>({tag:element.tagName,kind:element.className,text:element.textContent.slice(0,90)}));
  const outside=[...main.querySelectorAll('[data-card-heading]')].filter(visible).filter(heading=>{
   const card=heading.closest('[data-heading-card]');
   const title=heading.getBoundingClientRect(),bounds=card.getBoundingClientRect();
   return title.left<bounds.left-2||title.right>bounds.right+2;
  }).map(heading=>heading.textContent.slice(0,90));
  const meta='.eyebrow,.small-note,.support-kind,.support-checked,.catalogue-status,.source-meta,.access-note,.learning-citations,.progress-number,.chosen,.game-note';
  const paragraphs=[...main.querySelectorAll('.info-block p,.learning-section p,.support-card p,.decision-context p,.recap-role p')]
   .filter(element=>visible(element)&&!element.matches(meta));
  const excessiveGaps=paragraphs.flatMap(element=>{
   const next=element.nextElementSibling;
   if(!next?.matches('p')||next.matches(meta)||!visible(next))return [];
   const first=element.getBoundingClientRect(),second=next.getBoundingClientRect();
   const font=Math.max(parseFloat(getComputedStyle(element).fontSize),parseFloat(getComputedStyle(next).fontSize));
   const gap=second.top-first.bottom;
   return gap < -1 || gap>font*1.65+2 ? [{text:element.textContent.slice(0,60),gap,font}] : [];
  });
  return {overflow:root.scrollWidth>root.clientWidth+2,clipped,outside,excessiveGaps};
 });
 expect(result,label+' keeps text inside its card with one readable paragraph gap')
  .toEqual({overflow:false,clipped:[],outside:[],excessiveGaps:[]});
}

for(const [role,path] of [['public','./'],['garda','garda/']]){
 test(role+' card headings and prose reflow consistently across the site',async({page},testInfo)=>{
  test.setTimeout(150000);
  await page.emulateMedia({reducedMotion:'reduce'});
  const routes=[
   {name:'about',hash:'#about',titles:'.info-block > h2,.learning-goal > h3,.learning-panel-title',capture:'.learning-goals'},
   {name:'browse',hash:'#encounters/'+role+'/street',titles:'.scenario > :is(h2,h3)',capture:'.scenario'},
   {name:'sources',hash:role==='public'?'#rights':'#evidence',titles:role==='public'?'.source-card > strong,.support-organisation > h3':'.evidence-title',capture:role==='public'?'.support-card':'.evidence-record'},
   {name:'progress',hash:'#progress',titles:'.role-results .info-block > h2',capture:'.role-results'},
   {name:'encounter',hash:stateHash(startEncounter('public-street',role,{cast})),titles:'.decision-context > h1,.prompt > h2',capture:'.decision-context'},
   {name:'recap',hash:recapFor(role),titles:'.recap-overview h2,.recap-role > h3,.support-recap h2',capture:'.summary-item'}
  ];
  if(role==='public')routes.push({name:'privacy',url:'privacy.html',language:'en',capture:'.notice'});
  const profiles=[
   {language:'en',width:375,size:100},
   {language:'en',width:1366,size:100},
   {language:'en',width:280,size:200},
   {language:'ar',width:375,size:200}
  ];
  let narrowHeading,wideHeading;
  for(const profile of profiles){
   await page.setViewportSize({width:profile.width,height:900});
   for(const route of routes){
    const language=route.language||profile.language;
    await page.goto(route.url?route.url:path+'?lang='+language+route.hash);
    await expect(page.locator('#loading,.error')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('lang',language==='en'?'en-IE':'ar');
    await page.evaluate(async size=>{
     await document.fonts.ready;
     document.documentElement.style.setProperty('--reading-size',size+'%');
     // Geometry checks include nested prose; interaction behavior is covered
     // separately by the keyboard/disclosure tests.
     document.querySelectorAll('#main details').forEach(details=>{details.open=true;});
    },profile.size);
    if(route.titles){
     const headings=page.locator(route.titles);
     expect(await headings.count(),route.name+' contains important card headings').toBeGreaterThan(0);
     for(const heading of await headings.all())await expect(heading).toHaveAttribute('data-card-heading',/^(feature|card|compact)$/);
    }
    await expectTextFits(page,`${role}/${route.name}/${profile.language}/${profile.width}/${profile.size}%`);
    if(route.name==='about'&&profile.size===100){
     const size=await page.locator('.learning-goal > h3').first().evaluate(heading=>parseFloat(getComputedStyle(heading).fontSize));
     if(profile.width===375)narrowHeading=size;else wideHeading=size;
    }
    if(profile.size===100){
     const card=page.locator(route.capture).first();
     await card.scrollIntoViewIfNeeded();
     await page.screenshot({path:testInfo.outputPath(`${role}-${route.name}-${profile.width}.png`)});
    }
   }
  }
  expect(wideHeading,'card headings grow with their available column width').toBeGreaterThan(narrowHeading);
 });
}
