import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLayout,paragraphChunks} from '../accessibility/layout.mjs';

test('Long prose gains shorter paragraphs without losing words or changing meaning',()=>{
 const text='The resource has no account form, analytics or complaint collection. Fictional choices, scores and a resume point are saved in this browser. The resource-site link carries this learning record to the companion site in the link. You can review or clear local records under Scores & progress. Separate browsers do not automatically sync. Hosting providers may keep standard access logs; external sources have their own privacy arrangements.';
 const chunks=paragraphChunks(text);
 assert.ok(chunks.length>1);
 assert.equal(chunks.join(' '),text);
 assert.ok(chunks.every(p=>p.length<300));
});
test('Sentence boundaries respect multilingual punctuation and leave short text alone',()=>{
 for(const [language,sentence] of [['fr','Les décisions doivent être fondées sur des faits. '],['ar','يمكنك قراءة الموقف ومراجعة المعلومات قبل اختيار إجابتك. '],['zh-Hans','你可以阅读情况并思考自己的选择。']]){
  const text=sentence.repeat(18).trim(),chunks=paragraphChunks(text,language);
  assert.ok(chunks.length>1,language);
  assert.equal(chunks.join('').replace(/\s/g,''),text.replace(/\s/g,''));
 }
 assert.deepEqual(paragraphChunks('A short sentence. Another short sentence.'),['A short sentence. Another short sentence.']);
});
test('A long unsplittable sentence and browsers without sentence segmentation preserve the text',()=>{
 const text='This is one statement with no sentence break '.repeat(12);
 assert.deepEqual(paragraphChunks(text),[text]);
 const segmenter=Intl.Segmenter;
 try{Intl.Segmenter=undefined;assert.deepEqual(paragraphChunks(text),[text]);}
 finally{Intl.Segmenter=segmenter;}
});

test('Authored paragraph breaks take priority over automatic sentence grouping',()=>{
 const paragraphs=[
  'The local meeting brought together several people who had questions about recent decisions in the area.',
  'A representative brings the questions to the next meeting. The two participants discuss which records might help answer them.',
  'The available summary gives a few totals. They agree to consider the context of the decisions when reviewing the results.',
  'The next step is to agree what to check.'
 ];
 assert.deepEqual(paragraphChunks(paragraphs.join('\n\n')),paragraphs);
 assert.deepEqual(paragraphChunks(paragraphs.join('\r\n  \r\n')),paragraphs);
});

test('Late header resizing preserves reading position while keeping active controls clear',t=>{
 const names=['document','matchMedia','ResizeObserver','requestAnimationFrame','addEventListener'];
 const originals=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 t.after(()=>{for(const [name,descriptor] of originals){
  if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];
 }});
 const classes=()=>({add(){},toggle(){},contains(){return false;}});
 const values=new Map([['--navigation-height','80px']]);
 const root={lang:'en',classList:classes(),style:{getPropertyValue:name=>values.get(name)||'',setProperty:(name,value)=>values.set(name,value)}};
 const menuLabel={},menuCurrent={};
 const toggle={setAttribute(){},addEventListener(){},querySelector:selector=>selector==='[data-menu-label]'?menuLabel:menuCurrent};
 const nav={hidden:true,setAttribute(){},removeAttribute(){},querySelector(){return null;}};
 let height=80,resize;
 const frames=[],scrolls=[];
 const header={classList:classes(),addEventListener(){},getBoundingClientRect:()=>({height,bottom:height}),querySelector:selector=>selector==='nav'?nav:toggle};
 const main={querySelectorAll(){return [];},addEventListener(){},contains:element=>element?.inMain===true};
 const doc={documentElement:root,activeElement:null,querySelector:selector=>selector==='.header'?header:null,addEventListener(){},body:{children:[]}};
 Object.assign(globalThis,{
  document:doc,
  matchMedia:query=>({matches:query.includes('max-width'),addEventListener(){}}),
  ResizeObserver:class{constructor(callback){resize=callback;}observe(){}},
  requestAnimationFrame:callback=>frames.push(callback),
  addEventListener(){}
 });
 const target=interactive=>({inMain:true,interactive,
  matches(){return this.interactive;},
  getBoundingClientRect:()=>({top:90,bottom:130}),
  scrollIntoView:options=>scrolls.push(options)
 });
 const grow=()=>{height+=10;resize();};
 const paint=()=>{while(frames.length)frames.shift()();};
 createLayout({main});

 // Page titles and feedback regions keep route-announcement focus while the
 // user scrolls. A later font swap must not drag that reading position back.
 for(const description of ['page heading','feedback region']){
  doc.activeElement=target(false);grow();paint();
  assert.deepEqual(scrolls,[],description+' does not cause a corrective scroll');
 }
 assert.equal(values.get('--navigation-height'),'100px','the clearance still tracks the actual header');

 const control=target(true);doc.activeElement=control;grow();paint();
 assert.deepEqual(scrolls,[{block:'nearest',behavior:'instant'}],'an active control obscured by the header remains reachable');
 scrolls.length=0;

 grow();doc.activeElement=target(false);paint();
 assert.deepEqual(scrolls,[],'a queued resize does not reclaim focus that has moved');
 const customControl=target(false);customControl.tabIndex=0;
 doc.activeElement=customControl;grow();paint();
 assert.equal(scrolls.length,1,'a keyboard-operable custom control also retains clearance');
 scrolls.length=0;
 grow();customControl.tabIndex=-1;paint();
 assert.deepEqual(scrolls,[],'a target removed from keyboard interaction is rechecked before scrolling');
});
