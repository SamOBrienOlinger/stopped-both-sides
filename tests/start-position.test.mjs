import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../accessibility/start-position.js',import.meta.url),'utf8');

function surface(){
 const listeners=new Map();
 return {
  addEventListener(type,callback){
   if(!listeners.has(type))listeners.set(type,new Set());
   listeners.get(type).add(callback);
  },
  removeEventListener(type,callback){listeners.get(type)?.delete(callback);},
  emit(type,properties={}){
   const event={type,target:this,isTrusted:false,...properties};
   for(const callback of [...(listeners.get(type)||[])])callback(event);
  }
 };
}

// Execute the production classic script against a small browser host. These
// tests vary lifecycle/input ordering; browser tests cover real trusted input
// and layout. No controller logic is reimplemented in the fixture.
function browser(type='reload',offset=480,{perspective='public',preferences={},sessionStorage,entryKey}={}){
 const attributes=new Set(type==='reload'?['data-start-position']:[]);
 let pendingOffset=null,initialShell=false;
 const parserObservers=new Set();
 const styleProperties=new Map();
 const root={setAttribute:name=>attributes.add(name),removeAttribute:name=>attributes.delete(name),
  dataset:{perspective},classList:new Set(),style:{setProperty:(key,value)=>styleProperties.set(key,value),
   getPropertyValue:key=>styleProperties.get(key)||''},
  hasAttribute:name=>attributes.has(name),
  getBoundingClientRect(){
   // Native restoration may remain deferred until the first styled layout.
   if(pendingOffset!==null){host.scrollY=pendingOffset;pendingOffset=null;}
   return {top:-host.scrollY,height:4000};
  }};
 let finishFonts;
 const fonts={...surface(),ready:new Promise(resolve=>{finishFonts=resolve;})};
 const document={...surface(),documentElement:root,fonts,scrollingElement:{scrollHeight:4000},readyState:'loading',
  querySelector:selector=>selector==='#main .initial,#loading'&&initialShell?{}:null};
 const frames=new Map(),writes=[];let nextFrame=0;
 const host={...surface(),document,history:{scrollRestoration:type==='reload'?'manual':'auto'},
  localStorage:{getItem:key=>preferences[key]??null},sessionStorage,
  location:{pathname:'/stopped-both-sides/',hash:'#encounter/choices'},
  navigation:entryKey?{currentEntry:{key:entryKey}}:undefined,
  performance:{getEntriesByType:()=>[{type}]},innerHeight:800,scrollX:0,scrollY:offset,
  visualViewport:surface(),
  MutationObserver:class{
   constructor(callback){this.callback=callback;}
   observe(){parserObservers.add(this.callback);}
   disconnect(){parserObservers.delete(this.callback);}
  },
  getComputedStyle:element=>element===root?{scrollPaddingTop:'12px'}:{scrollMarginTop:'8px'},
  requestAnimationFrame:callback=>{frames.set(++nextFrame,callback);return nextFrame;},
  cancelAnimationFrame:id=>frames.delete(id),
  scrollTo({top,left}){
   host.scrollY=top;host.scrollX=left;writes.push({top,left});host.emit('scroll');
  }
 };
 host.window=host;
 runInNewContext(source,host,{filename:'accessibility/start-position.js'});
 return {host,root,document,fonts,finishFonts,writes,controller:host.__stoppedPageStart,
  paint(){const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback();},
  restore(top,{emit=true}={}){host.scrollY=top;if(emit)host.emit('scroll');},
  deferRestore(top){pendingOffset=top;},
  parseInitial(){initialShell=true;for(const callback of [...parserObservers])callback([{type:'childList'}]);},
  anchor(top){return {isConnected:true,getBoundingClientRect:()=>({top:top-host.scrollY})};}
 };
}

test('the initial layout uses the saved display preferences for its own edition',()=>{
 const preferences={'garda-encounter-reading-v1:public':'{"size":150,"contrast":"high","spacing":true,"motion":true}',
  'garda-encounter-reading-v1:garda':'{"size":115,"contrast":"standard","spacing":false,"motion":false}'};
 for(const [perspective,expected] of [['public','150%'],['garda','115%']]){
  const {root}=browser('navigate',0,{perspective,preferences});
  assert.equal(root.style.getPropertyValue('--reading-size'),expected);
  assert.deepEqual([...root.classList],perspective==='public'?['contrast-high','reading-spacious','motion-reduce']:[]);
 }
 for(const value of ['{"size":999}','unreadable',null]){
  const {root}=browser('navigate',0,{preferences:{'garda-encounter-reading-v1:public':value}});
  assert.equal(root.style.getPropertyValue('--reading-size'),'');
 }
});

test('parser readiness corrects a restored offset synchronously before the next frame',()=>{
 const e=browser();e.restore(480,{emit:false});
 assert.equal(e.host.scrollY,480,'the native offset is present before parser readiness');
 e.document.emit('readystatechange');
 assert.equal(e.host.scrollY,0,'the first parsed frame must not wait for animation-frame correction');
});

test('startup claim and parser readiness settle a native offset deferred until styled layout',()=>{
 for(const boundary of ['claim','readystatechange']){
  const e=browser();e.deferRestore(1499);
  assert.equal(e.host.scrollY,0,'the native offset is not yet exposed to script');
  if(boundary==='claim')e.controller.claim(()=>null);
  else e.document.emit('readystatechange');
  // Inspect the first styled layout without advancing animation frames. A
  // controller that checked stale scrollY before layout leaves this concealed.
  assert.equal(Math.abs(e.root.getBoundingClientRect().top),0,boundary+' exposes the opening before the first frame');
  assert.equal(e.host.scrollY,0,boundary+' settles the deferred native offset');
 }
});

test('parser insertions settle late first-layout restoration before another animation frame',()=>{
 const e=browser();e.paint();
 // The early frame can run before body content exists. Later parser chunks
 // establish a scroll range while the document is still loading.
 for(const offset of [1360,1499]){
  e.deferRestore(offset);e.parseInitial();
  assert.equal(Math.abs(e.root.getBoundingClientRect().top),0,
   'the loading shell must already be clear at the next layout read');
  assert.equal(e.host.scrollY,0);
 }
});

test('a native scroll event repairs its offset synchronously before the next frame',()=>{
 const e=browser();e.paint();
 e.restore(640);
 assert.equal(e.host.scrollY,0,'scroll correction must not wait for another animation frame');
});

test('a late native offset is corrected after load and pageshow without repeated settled writes',async()=>{
 const e=browser();e.host.emit('load');e.host.emit('pageshow',{persisted:false});e.paint();
 e.restore(640);e.paint();e.paint();
 assert.equal(e.host.scrollY,0);
 const writes=e.writes.length;
 e.host.visualViewport.emit('resize');e.host.visualViewport.emit('scroll');
 e.finishFonts();await Promise.resolve();e.fonts.emit('loadingdone');e.paint();e.paint();
 assert.equal(e.host.scrollY,0);
 assert.equal(e.writes.length,writes,'settled lifecycle events must not start a scroll loop');
});

test('fresh input before readiness cancels queued work and a later render cannot reclaim scrolling',async()=>{
 for(const type of ['pointerdown','touchstart','wheel','keydown','click']){
  const e=browser();e.restore(240,{emit:false});e.host.emit(type,{isTrusted:true});
  e.controller.claim(()=>null);
  e.parseInitial();
  e.finishFonts();await Promise.resolve();
  e.host.emit('load');e.host.emit('pageshow',{persisted:false});
  e.host.visualViewport.emit('resize');e.paint();e.paint();
  assert.equal(e.host.scrollY,240,type);
  assert.equal(e.host.history.scrollRestoration,'auto',type);
  assert.equal(e.root.hasAttribute('data-start-position'),false,type);
 }
});

test('synthetic activation and the tail of an old touch gesture do not surrender refresh ownership',()=>{
 const e=browser();
 e.host.emit('click');e.host.emit('touchmove',{isTrusted:true});e.host.emit('touchend',{isTrusted:true});
 e.restore(720);e.paint();
 assert.equal(e.host.scrollY,0);
 assert.equal(e.host.history.scrollRestoration,'manual');
});

test('pagehide cancels pending correction and a BFCache return preserves its native position',()=>{
 const e=browser();e.restore(360,{emit:false});e.host.emit('pagehide',{persisted:true});e.paint();
 assert.equal(e.host.scrollY,360,'a departing page must not run its queued correction');
 assert.equal(e.host.history.scrollRestoration,'manual','departure must not undo refresh policy');
 e.restore(520);e.host.emit('pageshow',{persisted:true});e.controller.claim(()=>null);
 e.host.visualViewport.emit('resize');e.paint();
 assert.equal(e.host.scrollY,520);
 assert.equal(e.host.history.scrollRestoration,'auto');
});

test('ordinary navigation and cold Back retain native positioning through app readiness',()=>{
 for(const type of ['navigate','back_forward']){
  const e=browser(type,360);e.controller.claim(()=>null);
  e.host.emit('load');e.host.emit('pageshow',{persisted:false});e.host.visualViewport.emit('resize');e.paint();
  assert.equal(e.host.scrollY,360,type);
  assert.equal(e.host.history.scrollRestoration,'auto',type);
  assert.equal(e.writes.length,0,type);
 }
});

test('only native history traversal reserves its recorded range, independent of browser scroll policy',()=>{
 for(const entryKey of ['opaque-key',undefined]){
  const hints=new Map(),options={entryKey,sessionStorage:{
   getItem:key=>hints.get(key)??null,setItem:(key,value)=>hints.set(key,value),removeItem:key=>hints.delete(key)
  }};
  browser('navigate',500,options).host.emit('pagehide');
  assert.deepEqual([...hints.entries()],[['stopped-history-range:'+(entryKey||'/stopped-both-sides/'),'500']]);
  if(!entryKey)browser('navigate',90,options).host.emit('pagehide');
  const reload=browser('reload',500,options);
  assert.equal(reload.root.style.getPropertyValue('--history-scroll-offset'),'');
  assert.equal(reload.host.scrollY,0);
  const back=browser('back_forward',500,options);
  assert.equal(back.root.style.getPropertyValue('--history-scroll-offset'),'500px');
  assert.equal(back.host.history.scrollRestoration,'auto');
  assert.equal(back.writes.length,0);
  assert.equal(hints.size,entryKey?0:1,'per-entry hints are consumed and the path fallback stays available');
 }
 const blocked={sessionStorage:{getItem(){throw Error('Storage unavailable');}}};
 const back=browser('back_forward',500,blocked);
 back.host.emit('pagehide');
 assert.equal(back.root.style.getPropertyValue('--history-scroll-offset'),'');
 assert.equal(back.host.scrollY,500);
 assert.equal(browser('reload',500,blocked).host.scrollY,0);
});

test('source positioning resolves replacement content and its current layout',()=>{
 const e=browser();let target=e.anchor(1000);
 e.controller.claim(()=>target);e.paint();
 assert.equal(e.host.scrollY,980,'source has both root padding and target margin clearance');
 target.isConnected=false;target=e.anchor(1400);
 e.restore(480);e.host.visualViewport.emit('resize');e.paint();e.paint();
 assert.equal(e.host.scrollY,1380,'a replaced source is resolved after a later restoration');
});

test('a failed application script restores fallback navigation and relinquishes pending positioning',()=>{
 const e=browser();e.host.emit('error',{target:{tagName:'IMG'}});
 assert.equal(e.root.hasAttribute('data-scripted'),true,'image failure does not disable startup');
 e.restore(320,{emit:false});e.host.emit('error',{target:{tagName:'SCRIPT'}});
 e.controller.claim(()=>null);e.host.emit('load');e.paint();
 assert.equal(e.root.hasAttribute('data-scripted'),false);
 assert.equal(e.host.history.scrollRestoration,'auto');
 assert.equal(e.host.scrollY,320);
});
