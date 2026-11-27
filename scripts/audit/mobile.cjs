const fs=require('node:fs');
const {chromium,firefox,webkit}=require('playwright');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
const checks={};const errors=[];const details=[];
const profiles=[[320,568,150],[390,844,100],[568,320,150],[844,390,100]];
const checked=(key,ok,detail)=>{(checks[key]??={pass:0,fail:0})[ok?'pass':'fail']++;if(!ok)errors.push({case:current,key,detail})};
let current;
const base='http://127.0.0.1:4191/stopped-both-sides/';
const server=spawn(process.execPath,['tests/browser/server.mjs','--port','4191']);
const run=async()=>{
 await new Promise((res,rej)=>{server.stdout.once('data',res);server.once('error',rej)});
 const engine=process.argv[2]||'chromium';
 const browser=await ({chromium,firefox,webkit}[engine]).launch({...(process.env.TEST_EXECUTABLE?{executablePath:process.env.TEST_EXECUTABLE}:{}),args:engine==='chromium'?['--no-sandbox','--disable-dev-shm-usage']:[]});
 console.log('Browser',engine,browser.version());
 async function ready(p,lang){await p.waitForFunction(lang=>!document.querySelector('#main .initial')&&document.querySelector('.navigation-ready')&&document.documentElement.lang===(lang==='en'?'en-IE':lang),lang,{timeout:6000});await p.evaluate(()=>document.fonts.ready); await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
 for(const role of ['public','garda'])for(const lang of ['en','ar'])for(const [w,h,size] of profiles){
  current=[role,lang,w,h,size].join('/');const url=base+(role==='garda'?'garda/':'')+'?lang='+lang;
  const c=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,deviceScaleFactor:2,isMobile:engine!=='firefox',reducedMotion:'reduce'}),p=await c.newPage();
  await c.addInitScript(({role,lang,size})=>{localStorage.setItem('garda-encounter-reading-v1:'+role,JSON.stringify({language:lang,size,spacing:size>100,motion:true}));},{role,lang,size});
  p.setDefaultTimeout(3500);const exceptions=[];p.on('pageerror',e=>exceptions.push(e.message));
  try{
   await p.goto(url+'#play');await ready(p,lang);
   const menu=p.locator('[data-nav-toggle]');
   const pageGeom=()=>p.evaluate(()=>{const el=document.documentElement,header=document.querySelector('.header'),m=document.querySelector('[data-nav-toggle]'),b=m.getBoundingClientRect(),hit=document.elementFromPoint((b.left+b.right)/2,(b.top+b.bottom)/2),main=document.querySelector('#main>:first-child').getBoundingClientRect();return {headerBottom:header.getBoundingClientRect().bottom,mainY:main.y,mainBottom:main.bottom,menuHit:m.contains(hit),scroll:el.scrollWidth,view:el.clientWidth,y:scrollY,language:el.lang,rootFont:getComputedStyle(el).fontSize,dir:el.dir,toggleVisible:!!b.width};});
   const g=await pageGeom(); checked('Home within viewport',g.scroll<=g.view+1,g);
   await p.locator('footer').scrollIntoViewIfNeeded();await p.reload();await ready(p,lang);await p.waitForTimeout(180);
   const back=await pageGeom();checked('Reload restores home entrance and visible header',back.y<2&&back.mainY>=back.headerBottom-1&&back.mainY<h&&(!back.toggleVisible||back.menuHit),back);
   if(await menu.isVisible()) {await menu.tap();await p.waitForFunction(()=>document.querySelector('[data-nav-toggle]').getAttribute('aria-expanded')==='true'); const m=await p.evaluate(()=>{const menu=document.querySelector('#main-navigation'),header=document.querySelector('.header'),b=menu.getBoundingClientRect(),r=menu.querySelector('a').getBoundingClientRect(),pt=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {navTop:b.top,header:header.getBoundingClientRect().bottom,navBottom:b.bottom,height:innerHeight,firstHit:menu.querySelector('a').contains(pt),inert:document.querySelector('#main').inert};});checked('Menu opens on tap and first link is reachable',m.firstHit&&m.inert&&m.navTop>=m.header-1&&m.navBottom<=h+1,m);await p.keyboard.press('Escape');checked('Escape closes menu and returns focus',await menu.evaluate(el=>el===document.activeElement&&el.getAttribute('aria-expanded')==='false'),{});await menu.tap();}
   await p.locator('#site-search-trigger').click();await p.locator('#site-search-input').waitFor();
   await p.setViewportSize({width:w,height:Math.min(h-40,Math.max(240,Math.round(h*.60)))});
   await p.locator('#site-search-input').fill('Garda'); await p.waitForTimeout(70);
   const search=await p.evaluate(()=>{const dialog=document.querySelector('#site-search-dialog');const b=dialog.getBoundingClientRect(),input=dialog.querySelector('input').getBoundingClientRect();const submit=dialog.querySelector('[type=submit]'); const hit=document.elementFromPoint((input.x+input.right)/2,(input.y+input.bottom)/2);return {dialogTop:b.top,dialogBottom:b.bottom,height:innerHeight,inputTop:input.top,inputBottom:input.bottom,hit:dialog.querySelector('input').contains(hit),focus:document.activeElement===dialog.querySelector('input'),results:dialog.querySelectorAll('.site-search-result').length,client:dialog.clientHeight,scroll:dialog.scrollHeight};});
   checked('Search dialog bounds after viewport contraction',search.dialogTop>=-1&&search.dialogBottom<=search.height+1,search);checked('Focused search input remains visible after contraction',search.focus&&search.hit,search);
   await p.keyboard.press('Enter');checked('Search Enter focuses a result',await p.evaluate(()=>document.activeElement?.matches('.site-search-result')),search);
   await p.keyboard.press('Escape');await p.setViewportSize({width:w,height:h});
   await p.goto(url+'#about');await ready(p,lang);
   const cyc=await p.locator('.learning-goals').evaluate(el=>{const cards=[...el.querySelectorAll('.learning-goal')].map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,r:b.right,b:b.bottom,w:b.width,h:b.height,clipped:[...e.querySelectorAll('h3,p')].some(n=>n.scrollWidth>n.clientWidth+1)}});const rail=el.querySelector('.learning-goal-link--04');return {cards,rail:getComputedStyle(rail,'::before').content,rtl:document.documentElement.dir==='rtl',view:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth};});
   const cs=cyc.cards, stacked=cs[0].y+5<cs[1].y;const path=stacked?cs.every((x,i)=>i===0||x.y>=cs[i-1].b)&&cyc.rail!=='none':Math.abs(cs[0].y-cs[1].y)<2&&cs[2].y>cs[1].y&&Math.abs(cs[2].y-cs[3].y)<2&&(cyc.rtl?cs[0].x>cs[1].x:cs[0].x<cs[1].x);
   checked('Learning cycle ordering and text fit',path&&cs.every(v=>v.x>=-1&&v.r<=w+1&&!v.clipped)&&cyc.scroll<=cyc.view+1,cyc);
   const eid=role==='garda'?'source-ethics':'rights-community';await p.goto(url+(role==='garda'?'#evidence/ethics':'#rights/community'));await ready(p,lang);await p.waitForTimeout(150);
   const deep=await p.locator('#'+eid).evaluate(el=>{const header=document.querySelector('.header').getBoundingClientRect(),b=el.getBoundingClientRect(),group=el.parentElement.closest('details');return {top:b.top,header:header.bottom,height:innerHeight,open:el.open,groupOpen:group?.open??true,focus:document.activeElement.id,scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth};});
   checked('Reference deep link expands and clears header',deep.open&&deep.groupOpen&&deep.top>=deep.header-1&&deep.top<h&&deep.scroll<=deep.view+1,deep);
   await p.reload();await ready(p,lang);await p.waitForTimeout(180); const reload=await p.locator('#'+eid).evaluate(el=>({open:el.open,y:el.getBoundingClientRect().top,header:document.querySelector('.header').getBoundingClientRect().bottom,h:innerHeight}));checked('Reference deep link survives reload',reload.open&&reload.y>=reload.header-1&&reload.y<h,reload);
   checked('No uncaught application exceptions',exceptions.length===0,exceptions);
  }catch(e){errors.push({case:current,key:'scenario aborted',detail:String(e.message).slice(0,950)});}
  finally{await c.close();}
 }
 await browser.close();const summary={engine,checks,errors};if(errors.length)process.exitCode=1;fs.mkdirSync('audit-results',{recursive:true});fs.writeFileSync('audit-results/mobile-'+engine+'-out.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));};
run().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.kill());
