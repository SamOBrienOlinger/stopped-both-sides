import {test,expect} from '@playwright/test';
import {openNavigation} from './navigation.mjs';
import {expectStaticHeadings} from './static-headings.mjs';
import {startEncounter,answer,continueEncounter} from '../../encounters/engine.mjs?v=nia-public-20261123';
import {emptyProgress,recordProgress,packProgress,progressStorageKey} from '../../encounters/progress.mjs?v=nia-public-20261123';

const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const cast={public:'public-2',garda:'garda-5'};
function resumeBesideRecap(role){
 // Completing a run and starting the same situation again is a supported
 // user path. Both saved cards intentionally retain the same display title.
 let complete=startEncounter('public-street',role==='public'?'garda':'public',{cast});
 for(let step=0;step<12&&!complete.complete;step++)complete=continueEncounter(answer(complete,0));
 if(!complete.complete)throw new Error('The saved-card fixture must reach its recap');
 const progress=recordProgress(emptyProgress(),complete);
 return packProgress(recordProgress(progress,startEncounter('public-street',role,{cast})));
}

for(const [role,path] of [['public','./'],['garda','garda/']]){
 test(role+' landing keeps a resume card and same-title recap immediately readable',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:568});
  await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{
   key:progressStorageKey(role),value:resumeBesideRecap(role)
  });
  await page.goto(path+'?lang=en#play');
  const cards=page.locator('#main .flow-save'),titles=cards.locator('.flow-save-copy > strong');
  await expect(cards).toHaveCount(2);
  await expect(titles).toHaveText(['Stopped on the street','Stopped on the street']);
  await page.evaluate(()=>document.fonts.ready);await frames(page);
  for(const card of await cards.all())expect(await card.evaluate(element=>element.getBoundingClientRect().top-innerHeight),
   'both saved records begin beyond the observer preload margin').toBeGreaterThan(80);
  await expect(cards.locator('[data-heading-pending],[data-heading-motion]')).toHaveCount(0);
  await expectStaticHeadings(titles,'offscreen saved titles');
  for(const card of await cards.all()){
   await card.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
   await expectStaticHeadings(card.locator('.flow-save-copy > strong'),'saved title reached by scrolling');
  }
  await expect(cards.locator('.saved-session-link')).toHaveCount(2);
  expect(await cards.locator('.saved-session-link').evaluateAll(links=>new Set(links.map(link=>link.href)).size)).toBe(2);
  await page.screenshot({path:testInfo.outputPath(role+'-same-title-saved-cards.png')});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await frames(page);
  await cards.last().evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));await frames(page);
  await expectStaticHeadings(titles,'saved titles after returning to the cards');
 });

 test(role+' motion-enabled Home return exposes its focused heading without a second page fade',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:812});
  await page.goto(path+'?lang=en#about');
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.privacy-disclosure > summary').scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>scrollY),'Home is reached from a deeply scrolled page').toBeGreaterThan(812);
  await page.evaluate(()=>{
   window.__homeFocusFrames=null;
   document.addEventListener('focusin',function observeHomeFocus(event){
    if(event.target.id!=='paired-title')return;
    document.removeEventListener('focusin',observeHomeFocus);
    const title=event.target,main=document.querySelector('#main');
    window.__homeFocusFrames=new Promise(resolve=>{
     const samples=[];
     const sample=()=>{
      const titleStyle=getComputedStyle(title),mainStyle=getComputedStyle(main),box=title.getBoundingClientRect();
      samples.push({focused:document.activeElement===title,titleOpacity:titleStyle.opacity,
       titleTransform:titleStyle.transform,titleAnimation:titleStyle.animationName,
       mainOpacity:mainStyle.opacity,mainAnimation:mainStyle.animationName,
       top:box.top,bottom:box.bottom,headerBottom:document.querySelector('.header').getBoundingClientRect().bottom,
       viewportHeight:innerHeight});
      if(samples.length===16)resolve(samples);else requestAnimationFrame(sample);
     };
     // Route focus is assigned before the caller restores scroll. Capture
     // every rendered frame after both synchronous actions have completed.
     requestAnimationFrame(sample);
    });
   });
  });
  await openNavigation(page);
  await page.locator('#main-navigation [data-nav="play"]').focus();
  await page.keyboard.press('Enter');
  const title=page.locator('#paired-title');
  await expect(title).toBeFocused();
  const samples=await page.evaluate(()=>window.__homeFocusFrames);
  expect(samples).toHaveLength(16);
  for(const sample of samples){
   expect(sample).toMatchObject({focused:true,titleOpacity:'1',titleTransform:'none',titleAnimation:'none',
    mainOpacity:'1',mainAnimation:'none'});
   expect(sample.top,'the focused title stays below the sticky navigation').toBeGreaterThanOrEqual(sample.headerBottom-1);
   expect(sample.bottom,'the focused title remains inside the viewport').toBeLessThanOrEqual(sample.viewportHeight);
   expect(Math.abs(sample.top-samples[0].top),'Home focus does not move during its entrance').toBeLessThan(1);
  }
  await expect(title).not.toHaveAttribute('data-landing-reveal');
  await expect(page.locator('#main')).not.toHaveAttribute('data-motion','page');
  // The old page's deep scroll must not suppress the new hero's later lines.
  const laterCopy=page.locator('.landing-instructions .small-note');
  await expect(laterCopy).toHaveAttribute('data-landing-reveal','pending');
  await laterCopy.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
  await expect(laterCopy).toHaveAttribute('data-landing-reveal',/^(active|complete)$/);
  await expect(laterCopy).toHaveAttribute('data-landing-reveal','complete');
  await expect(laterCopy).toHaveCSS('opacity','1');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:testInfo.outputPath(role+'-home-return-readable.png')});
 });
}
