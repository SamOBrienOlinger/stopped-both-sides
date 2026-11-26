import {mkdir,writeFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';

const output='audit-results/ios';
const url='http://127.0.0.1:4173/stopped-both-sides/';
const report={target:'8047391c7921768c139d5a1443761983b481dce0',device:process.env.IOS_UDID,cases:[]};
let session;
async function request(path,body,method=body===undefined?'GET':'POST'){
  const response=await fetch('http://127.0.0.1:4723'+path,{method,headers:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(path==='/session'?240000:45000)});
  const {value}=await response.json();
  if(!response.ok||value?.error)throw Error(path+' '+String(value?.message||response.status).slice(0,1200));
  return value;
}
const command=(path,body)=>request('/session/'+session+path,body);
const evaluate=(script,...args)=>command('/execute/sync',{script,args});
const visibleKeyboard=()=>evaluate('mobile: isKeyboardShown');
async function screenshot(file){const data=await command('/screenshot');await writeFile(output+'/'+file,Buffer.from(data,'base64'));}
async function until(read){
  let last;
  for(let n=0;n<20;n++){last=await read();if(last)return last;await delay(300);}
  throw Error('Timed out waiting for expected UI state');
}
async function tapNativeField(c){
  const webContext=await command('/appium/context');
  await command('/appium/context',{name:'NATIVE_APP'});
  try{
    for(const type of ['SearchField','TextField']){
      const fields=await command('/elements',{using:'-ios class chain',value:'**/XCUIElementTypeWebView/**/XCUIElementType'+type});
      if(fields.length!==1)continue;
      const id=fields[0]['element-6066-11e4-a52e-4f735466cecf'];
      c.nativeField={type};
      await command('/element/'+id+'/click',{});
      return;
    }
    c.nativeTree=(await command('/source')).slice(0,25000);
    throw Error('The native Safari web view did not expose an unambiguous search field');
  }finally{await command('/appium/context',{name:webContext});}
}
async function measure(){
  return evaluate(`const el=document.querySelector('#site-search-input'), d=document.querySelector('#site-search-dialog');
    const box=e=>e?e.getBoundingClientRect().toJSON():null, field=box(el),dialog=box(d);
    const v=visualViewport, x=field?field.left+field.width/2:0, y=field?field.top+field.height/2:0;
    const hits=(x,y)=>Boolean(el&&el.contains(document.elementFromPoint(x,y)));
    return {field,dialog,height:v.height,width:v.width,offsetY:v.offsetTop,offsetX:v.offsetLeft,scale:v.scale,
      rootSize:getComputedStyle(document.documentElement).fontSize,language:document.documentElement.lang,
      landscape:matchMedia('(orientation:landscape)').matches,focus:Boolean(el&&el===document.activeElement),
      value:el?.value,results:d?.querySelectorAll('.site-search-result').length,scrollTop:d?.scrollTop,
      clippedByDialog:Boolean(field&&(x<dialog.left||x>dialog.right||y<dialog.top||y>dialog.bottom)),
      directHit:hits(x,y),offsetHit:hits(x-v.offsetLeft,y-v.offsetTop)};`);
}
async function sample(){
  const sample=await measure();
  sample.keyboard=await visibleKeyboard();
  return sample;
}
async function runCase(c){
  const {role,lang,orientation}=c;
  const path=url+(role==='garda'?'garda/':'')+'?lang='+lang+'&audit='+orientation+'#play';
  c.stage='orientation';
  await command('/appium/device/orientation',{orientation});
  c.reportedOrientation=await command('/appium/device/orientation');
  if(c.reportedOrientation!==orientation)throw Error('Requested orientation was not applied');
  c.stage='seed';
  await evaluate("localStorage.setItem('garda-encounter-reading-v1:'+arguments[0], JSON.stringify({language:arguments[1],size:150,spacing:true,motion:true}))",role,lang);
  await command('/url',{url:path});
  c.stage='readiness';
  await until(()=>evaluate("return location.href===arguments[0] && document.readyState==='complete' && document.querySelector('.header.navigation-ready')!==null && !document.querySelector('#main .initial') && getComputedStyle(document.documentElement).fontSize==='24px' && document.documentElement.lang===arguments[1] && document.querySelector('#site-search-trigger')!==null",path,lang==='en'?'en-IE':lang));
  await delay(400);
  c.before=await sample();
  if(c.before.keyboard)throw Error('Keyboard was already visible at baseline');
  if(c.before.landscape!==(orientation==='LANDSCAPE'))throw Error('Page viewport did not reflect requested orientation');
  // Open the application's Search UI, then tap its native accessibility element.
  // Never convert document coordinates into simulator screen coordinates.
  c.stage='open search';
  await evaluate("const menu=document.querySelector('[data-nav-toggle]');if(menu.offsetWidth && menu.getAttribute('aria-expanded')==='false')menu.click();document.querySelector('#site-search-trigger').click();");
  await until(()=>evaluate("return document.querySelector('#site-search-dialog')?.open===true"));
  await delay(350);
  c.stage='native keyboard';
  if(!await visibleKeyboard())await tapNativeField(c);
  await until(visibleKeyboard);
  await delay(1200);
  c.opened=await sample();
  c.stage='type';
  const input=await command('/element',{using:'css selector',value:'#site-search-input'});
  await command('/element/'+input['element-6066-11e4-a52e-4f735466cecf']+'/value',{text:'Garda'});
  await delay(1200);
  c.typed=await sample();
  await screenshot(role+'-'+lang+'-'+orientation+'.png');
  if(c.typed.value!=='Garda'||!c.typed.results)throw Error('Search did not produce results for the native text entry');
  const eligible=[c.opened,c.typed].filter(s=>s.keyboard===true && s.focus && c.before.height-s.height>50);
  if(!eligible.length)throw Error('No settled sample with focused input, keyboard visible and contracted visual viewport');
  const unequalCoordinates=eligible.some(s=>!s.directHit&&!s.offsetHit&&!s.clippedByDialog);
  if(eligible.some(s=>s.clippedByDialog))c.result='confirmed-clipping';
  else if(eligible.length<2||unequalCoordinates)c.result='inconclusive';
  else c.result='visible-in-sampled-configuration';
}
const save=()=>writeFile(output+'/result.json',JSON.stringify(report,null,2));
await mkdir(output,{recursive:true});
try{
  const result=await request('/session',{capabilities:{alwaysMatch:{platformName:'iOS',browserName:'safari',
    'appium:automationName':'XCUITest','appium:udid':report.device,'appium:deviceName':'iPhone Simulator',
    'appium:connectHardwareKeyboard':false,'appium:forceSimulatorSoftwareKeyboardPresence':true,
    'appium:nativeWebTap':true,'appium:autoAcceptAlerts':true,'appium:safariInitialUrl':url,
    'appium:wdaLaunchTimeout':150000,'appium:newCommandTimeout':90}}});
  session=result.sessionId;
  // Establish this origin once before writing each case's reading preferences.
  await command('/url',{url:url+'privacy.html'});
  await until(()=>evaluate("return location.pathname.endsWith('/privacy.html') && document.readyState==='complete'"));
  report.capabilities=result.capabilities;
  await save();
  for(const orientation of ['LANDSCAPE','PORTRAIT'])for(const lang of ['en','ar'])for(const role of ['public','garda']){
    const c={role,lang,orientation};
    report.cases.push(c);
    try{await runCase(c);}catch(error){
      c.result='inconclusive';c.error=error.message;
      c.atFailure=await sample().catch(e=>({error:e.message}));
      await screenshot(role+'-'+lang+'-'+orientation+'-inconclusive.png').catch(()=>{});
    }
    await save();
    console.log(JSON.stringify(c));
  }
  if(report.cases.some(c=>c.result!=='visible-in-sampled-configuration'))process.exitCode=1;
}catch(error){
  report.setupError=error.message;await save();console.error(error);process.exitCode=1;
}finally{
  if(session)await request('/session/'+session,undefined,'DELETE').catch(console.error);
}
