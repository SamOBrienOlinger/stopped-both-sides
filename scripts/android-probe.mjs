import {execFileSync} from 'node:child_process';
import {writeFileSync,readFileSync} from 'node:fs';
import {setTimeout as wait} from 'node:timers/promises';
const mode=process.argv[2];
const folder='android-results';
const adb=(...args)=>execFileSync('adb',args,{encoding:'utf8',timeout:18000,maxBuffer:6e6}).trim();
const capture=key=>writeFileSync(folder+'/'+key+'.png',execFileSync('adb',['exec-out','screencap','-p'],{timeout:15000,maxBuffer:15e6}));
const notes=[];
const testPackage=mode==='chrome'?'com.android.chrome':'org.sbs.audit';
function tryWelcome(){
 try{
  adb('shell','uiautomator','dump','/sdcard/sbs-audit.xml');
  const source=adb('shell','cat','/sdcard/sbs-audit.xml');
  writeFileSync(folder+'/browser-onboarding.xml',source);
  const labels=['Use without an account','Accept &amp; continue','Accept and continue','No thanks','Continue without an account','Not now','Skip','Got it','Don’t allow'];
  for(const label of labels){
   const node=(source.match(/<node\b[^>]*>/g)||[]).find(node=>node.includes('text="'+label+'"')||node.includes('content-desc="'+label+'"'));
   const box=node?.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
   if(box){
    const [x,y,r,b]=box.slice(1).map(Number);adb('shell','input','tap',String((x+r)>>1),String((y+b)>>1));return true;
   }
  }
 }catch(e){notes.push('Welcome inspection '+e.message.slice(0,140))}
 return false;
}
async function connect(){
 for(let attempt=0;attempt<10;attempt++){
  if(mode==='chrome'&&attempt<6&&tryWelcome()){await wait(650);continue}
  try{
   const socket=(adb('shell','cat','/proc/net/unix').match(/@(chrome_devtools_remote(?:_\d+)?|webview_devtools_remote_\d+)\s*$/gm)||[]).map(x=>x.trim().slice(1)).find(x=>x.startsWith(mode==='chrome'?'chrome_':'webview_'));
   if(!socket)throw Error('waiting for '+mode+' DevTools socket');
   adb('forward','tcp:9222','localabstract:'+socket);
   const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();
   const tab=tabs.find(x=>x.type==='page'&&x.url.includes('localhost:4173'))||tabs.find(x=>x.type==='page');
   if(!tab?.webSocketDebuggerUrl)throw Error('waiting for web page target');
   const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((yes,no)=>{ws.onopen=yes;ws.onerror=no});
   let id=0;const pending=new Map();
   ws.onmessage=({data})=>{const msg=JSON.parse(data),p=pending.get(msg.id);if(!p)return;pending.delete(msg.id);clearTimeout(p.timer);if(msg.error)p.no(Error(msg.error.message));else p.yes(msg.result)};
   return {ws,send(method,params={}){
    return new Promise((yes,no)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);no(Error('Protocol timeout: '+method))},12000);pending.set(key,{yes,no,timer});ws.send(JSON.stringify({id:key,method,params}))})
   }};
  }catch(e){notes.push(e.message)}
  await wait(500);
 }
 throw Error('Could not establish Android target. '+notes.slice(-5).join(' / '));
}
const report={mode,package:testPackage,build:adb('shell','getprop','ro.build.fingerprint'),android:adb('shell','getprop','ro.build.version.release'),api:adb('shell','getprop','ro.build.version.sdk'),ime:adb('shell','settings','get','secure','default_input_method'),commit:readFileSync('candidate/.git/HEAD','utf8').trim(),cases:[],notes};
try{report.version=adb('shell','dumpsys','package',testPackage).match(/versionName=([^\s]+)/)?.[1]}catch{}
const persist=()=>writeFileSync(folder+'/'+mode+'-results.json',JSON.stringify(report,null,2));
let c;
try{c=await connect()}catch(e){capture(mode+'-bootstrap-failure');notes.push(e.message);persist();console.error(e.message);process.exit(12)}
async function evaluate(expression){const v=await c.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(v.exceptionDetails)throw Error(v.exceptionDetails.exception?.description||v.exceptionDetails.text);return v.result.value}
async function until(expression,timeout=10000){
 const end=Date.now()+timeout;let last;
 do{try{last=await evaluate(expression);if(last)return last}catch{}await wait(120)}while(Date.now()<end);
 throw Error('Timed out waiting for '+expression.slice(0,130)+'; last: '+JSON.stringify(last));
}
async function tap(selector){
 const sel=JSON.stringify(selector);const p=await evaluate('(()=>{const el=document.querySelector('+sel+');if(!el)return null;el.scrollIntoView({block:"nearest"});const b=el.getBoundingClientRect();return b.width&&b.height?{x:b.x+b.width/2,y:b.y+b.height/2}:null})()');
 if(!p)throw Error('Missing tap target '+selector);
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
function inputMethod(){
 const text=adb('shell','dumpsys','input_method');const evidence=text.split('\n').filter(l=>/mInputShown|mIsInputViewShown|mImeWindowVis|mShowRequested/.test(l));
 return {shown:/\bm(?:InputShown|IsInputViewShown)\s*=\s*true\b/.test(text)||/\bmImeWindowVis\s*=\s*0x(?:3|b)\b/i.test(text),evidence:evidence.slice(0,16).map(l=>l.trim())};
}
const measure=`(()=>{const i=document.querySelector('#site-search-input'),d=document.querySelector('#site-search-dialog'),v=visualViewport,b=i?.getBoundingClientRect(),panel=d?.getBoundingClientRect(),x=b?.left+b?.width/2,y=b?.top+b?.height/2;
return {width:innerWidth,height:innerHeight,orientation:screen.orientation.type,vh:v.height,vw:v.width,top:v.offsetTop,left:v.offsetLeft,dir:document.documentElement.dir,lang:document.documentElement.lang,font:getComputedStyle(document.documentElement).fontSize,focus:document.activeElement===i,open:!!d?.open,value:i?.value,count:d?.querySelectorAll('.site-search-result').length,field:b?.toJSON(),dialog:panel?.toJSON(),visible:!!b&&b.top>=v.offsetTop-1&&b.bottom<=v.offsetTop+v.height+1&&b.left>=v.offsetLeft-1&&b.right<=v.offsetLeft+v.width+1,hittable:!!i&&i.contains(document.elementFromPoint(x-v.offsetLeft,y-v.offsetTop))}})()`;
try{
 await c.send('Page.enable');report.userAgent=await evaluate('navigator.userAgent');
 for(const orientation of ['portrait','landscape'])for(const role of ['public','garda'])for(const lang of ['en','ar']){
  const key=[mode,role,lang,orientation].join('-');const record={key,orientation,role,lang};report.cases.push(record);
  try{
   adb('shell','settings','put','system','user_rotation',orientation==='portrait'?'0':'1');
   const base='http://localhost:4173/stopped-both-sides/'+(role==='garda'?'garda/':'')+'?lang='+lang+'#play';
   await c.send('Page.navigate',{url:base});
   await until('location.href==='+JSON.stringify(base)+'&&!!document.querySelector(".navigation-ready")&&document.documentElement.lang==='+JSON.stringify(lang==='en'?'en-IE':'ar'));
   await evaluate('localStorage.setItem('+JSON.stringify('garda-encounter-reading-v1:'+role)+','+JSON.stringify(JSON.stringify({language:lang,size:150,spacing:true,motion:true}))+')');
   await c.send('Page.reload',{ignoreCache:true});
   await until('!!document.querySelector(".navigation-ready") && getComputedStyle(document.documentElement).fontSize==="24px" && screen.orientation.type.startsWith('+JSON.stringify(orientation)+')');
   if(inputMethod().shown){adb('shell','input','keyevent','4');await wait(350)}
   record.before=await evaluate('({vh:visualViewport.height,vw:visualViewport.width,orientation:screen.orientation.type})');
   if(await evaluate('document.querySelector("[data-nav-toggle]")?.getBoundingClientRect().width>0 && document.querySelector("[data-nav-toggle]").getAttribute("aria-expanded")!=="true"'))await tap('[data-nav-toggle]');
   await tap('#site-search-trigger');await until('!!document.querySelector("#site-search-dialog[open] input")');
   await tap('#site-search-input');await wait(700);
   record.ime=inputMethod();
   record.focused=await evaluate(measure);capture(key+'-focused');
   if(!record.ime.shown)throw Error('Android software keyboard did not open');
   adb('shell','input','text','Garda');await until('document.querySelector("#site-search-input")?.value.toLowerCase()==="garda"');
   await wait(350);record.typed=await evaluate(measure);record.imeAfterText=inputMethod();capture(key+'-typed');
   record.pass=record.imeAfterText.shown&&record.before.vh-record.typed.vh>50&&record.typed.focus&&record.typed.visible&&record.typed.hittable&&record.typed.count>0&&record.typed.dir===(lang==='ar'?'rtl':'ltr');
   if(!record.pass)record.error='Viewport, focus, hit target, direction, results or native keyboard assertion failed';
  }catch(e){record.error=e.message;record.pass=false;try{capture(key+'-error');record.last=await evaluate(measure)}catch{}}
  finally{if(inputMethod().shown){adb('shell','input','keyevent','4');await wait(300)}persist();console.log('ANDROID_CASE',JSON.stringify(record))}
 }
}finally{persist();c.ws.close()}
if(report.cases.length!==8||report.cases.some(x=>!x.pass))process.exitCode=1;
