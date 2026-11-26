// Audit-only: native Safari composition/capture control on an ephemeral Mac.
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {openSync,closeSync} from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {resolve,join,sep,extname} from 'node:path';
import {inflateSync} from 'node:zlib';
import {parseArgs} from 'node:util';
const {values}=parseArgs({options:{output:{type:'string',default:'audit-results/safari-control'}}});
const output=resolve(values.output),root=process.cwd(),base='http://127.0.0.1:4173';
await mkdir(output,{recursive:true});
if(process.platform!=='darwin')throw Error('This comparison requires native macOS Safari');
const report={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),cases:[],notes:[
 'One native Safari WebDriver window, 900x650 outer size, x0/y31.',
 'The static control is served from memory; product files are read only.',
 'No privacy/TCC settings, rendering preferences or product styles are modified.',
 'Normal Safari outside the WebDriver session is not tested.'
]};
const colors=[['red','#ff0000'],['green','#00ff00'],['blue','#0000ff'],['yellow','#ffff00'],['cyan','#00ffff'],['magenta','#ff00ff']];
const control='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Safari static pixel control</title><style>html,body{margin:0;background:white;font-family:Arial}h1{font-size:28px;line-height:48px;margin:0;padding:0 12px;color:black}main{display:grid;grid-template-columns:repeat(3,1fr)}section{height:180px;display:grid;place-items:center;font-size:24px;font-weight:bold;color:black}</style><h1>Safari static pixel control</h1><main id="swatches">'+colors.map(([name,color])=>'<section data-swatch="'+name+'" data-color="'+color+'" style="background:'+color+'">'+name+'</section>').join('')+'</main>';
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,base).pathname);
  if(pathname==='/__audit-control.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(control);return;}
  const relative=pathname.replace(/^\/stopped-both-sides\//,'').replace(/^\//,'');
  let file=resolve(root,relative);
  if(file!==root&&!file.startsWith(root+sep)||relative.split('/').some(p=>p.startsWith('.')))throw Error('outside root');
  if(pathname.endsWith('/'))file=join(file,'index.html');
  const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(bytes);
 }catch{res.writeHead(404).end();}
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4173,'127.0.0.1',resolve);});
const fd=openSync(join(output,'safaridriver.log'),'a');
const service=spawn('/usr/bin/safaridriver',['--port','4444'],{stdio:['ignore',fd,fd]});closeSync(fd);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function command(method,path,payload){
 const response=await fetch('http://127.0.0.1:4444'+path,{method,headers:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload),signal:AbortSignal.timeout(45000)});
 const result=await response.json();if(!response.ok||result.value?.error)throw Error(JSON.stringify(result.value));return result.value;
}
async function until(fn,label,timeout=20000){let last;const start=Date.now();while(Date.now()-start<timeout){try{const value=await fn();if(value)return value;}catch(e){last=e;}await pause(150);}throw Error(label+' timed out '+(last?.message||''));}
let prefix;
const evaluate=(fn,arg)=>command('POST',prefix+'/execute/sync',{script:'return ('+fn.toString()+')(arguments[0]);',args:[arg??null]});
// Decode the screenshot formats produced by Safari/screencapture, without a new dependency.
function png(bytes){
 let at=8,info,palette,data=[];
 while(at+12<=bytes.length){const length=bytes.readUInt32BE(at),type=bytes.toString('ascii',at+4,at+8),chunk=bytes.subarray(at+8,at+8+length);at+=12+length;
  if(type==='IHDR')info={width:chunk.readUInt32BE(0),height:chunk.readUInt32BE(4),depth:chunk[8],type:chunk[9],interlace:chunk[12]};
  if(type==='PLTE')palette=chunk;if(type==='IDAT')data.push(chunk);if(type==='IEND')break;
 }
 if(info.depth!==8||info.interlace!==0||![2,3,6].includes(info.type))throw Error('Unsupported PNG '+JSON.stringify(info));
 const channels=info.type===6?4:info.type===2?3:1,stride=info.width*channels,raw=inflateSync(Buffer.concat(data)),pixels=Buffer.alloc(stride*info.height);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<info.height;y++){const filter=raw[y*(stride+1)],offset=y*stride;for(let x=0;x<stride;x++){
  const value=raw[y*(stride+1)+1+x],a=x>=channels?pixels[offset+x-channels]:0,b=y?pixels[offset-stride+x]:0,c=y&&x>=channels?pixels[offset-stride+x-channels]:0;
  const predictor=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):filter===4?paeth(a,b,c):NaN;
  if(!Number.isFinite(predictor))throw Error('Unknown PNG filter');pixels[offset+x]=(value+predictor)&255;
 }}
 return{...info,pixel(x,y){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=info.width||y>=info.height)return null;const p=(y*info.width+x)*channels;return info.type===3?[...palette.subarray(pixels[p]*3,pixels[p]*3+3)]:[...pixels.subarray(p,p+3)];}};
}
function pixelMetrics(image,geometry,kind){
 const scale=kind==='native'?image.width/geometry.screen.width:kind==='element'?image.width/geometry.target.width:image.width/geometry.inner.width;
 const map=(x,y)=>kind==='native'?[(geometry.window.screenX+x)*scale,(geometry.window.screenY+geometry.window.outerHeight-geometry.inner.height+y)*scale]:kind==='element'?[(x-geometry.target.x)*scale,(y-geometry.target.y)*scale]:[x*scale,y*scale];
 const samples=geometry.swatches.map(s=>{const xy=map(s.x,s.y),rgb=image.pixel(...xy),expected=s.color.slice(1).match(/../g).map(v=>parseInt(v,16));
  return{name:s.name,expected,rgb,point:xy,match:Boolean(rgb&&expected.every((v,i)=>Math.abs(v-rgb[i])<=45))};
 });
 const t=geometry.target,left=Math.max(0,t.x),right=Math.min(geometry.inner.width,t.x+t.width),top=Math.max(0,t.y),bottom=Math.min(geometry.inner.height,t.y+t.height),grid=[];
 for(let y=0;y<12;y++)for(let x=0;x<16;x++){const xy=map(left+(right-left)*(x+.5)/16,top+(bottom-top)*(y+.5)/12),rgb=image.pixel(...xy);if(rgb)grid.push(rgb);}
 return{width:image.width,height:image.height,scale,swatches:samples,swatchMatches:samples.filter(s=>s.match).length,visibleContentSamples:grid.length,uniqueVisibleContentColors:new Set(grid.map(rgb=>rgb.join(','))).size,saturatedVisibleContentSamples:grid.filter(rgb=>Math.max(...rgb)-Math.min(...rgb)>80).length,darkVisibleContentSamples:grid.filter(rgb=>Math.max(...rgb)<130).length};
}
try{
 await until(()=>command('GET','/status'),'Safari driver');
 const session=await command('POST','/session',{capabilities:{alwaysMatch:{browserName:'safari'}}});prefix='/session/'+session.sessionId;report.capabilities=session.capabilities;
 await command('POST',prefix+'/timeouts',{implicit:0,pageLoad:45000,script:30000});
 await command('POST',prefix+'/window/rect',{x:0,y:31,width:900,height:650});
 for(const item of [{name:'static-control',path:'/__audit-control.html',selector:'#swatches'},{name:'actual-home',path:'/stopped-both-sides/?lang=en#play',selector:'.poster-hero'},{name:'actual-about-goals',path:'/stopped-both-sides/?lang=en#about',selector:'.learning-goals'}]){
  const record={...item};report.cases.push(record);
  try{
   await command('POST',prefix+'/url',{url:base+item.path});
   await until(()=>evaluate(selector=>Boolean(document.querySelector(selector)&&document.querySelector('h1')&&(!document.fonts||document.fonts.status==='loaded')&&!document.querySelector('#main .initial,#main .error')),item.selector),'page '+item.name);
   execFileSync('/usr/bin/open',['-a','Safari'],{timeout:10000});await command('POST',prefix+'/window',{handle:await command('GET',prefix+'/window')});
   await command('POST',prefix+'/actions',{actions:[{type:'key',id:'control-keyboard',actions:[{type:'keyDown',value:'\uE00C'},{type:'keyUp',value:'\uE00C'}]}]});
   await evaluate(selector=>document.querySelector(selector).scrollIntoView({block:'center',behavior:'instant'}),item.selector);
   await pause(1800);
   record.geometry=await evaluate(selector=>{
    const target=document.querySelector(selector),r=target.getBoundingClientRect();let opacity=1;const ancestors=[];
    for(let p=target;p;p=p.parentElement){const s=getComputedStyle(p);opacity*=Number(s.opacity);ancestors.push({tag:p.tagName,opacity:s.opacity,visibility:s.visibility,display:s.display,contentVisibility:s.contentVisibility});}
    return{url:location.href,title:document.title,h1:document.querySelector('h1').textContent,focused:document.hasFocus(),opacity,ancestors,inner:{width:innerWidth,height:innerHeight},screen:{width:screen.width,height:screen.height},window:{screenX,screenY,outerWidth,outerHeight},target:{x:r.x,y:r.y,width:r.width,height:r.height},swatches:[...document.querySelectorAll('[data-swatch]')].map(e=>{const b=e.getBoundingClientRect();return{name:e.dataset.swatch,color:e.dataset.color,computed:getComputedStyle(e).backgroundColor,x:b.x+b.width*.23,y:b.y+b.height*.37};})};
   },item.selector);
   record.windowRect=await command('GET',prefix+'/window/rect');record.captures={};
   for(const kind of ['native','root','element']){
    const filename=item.name+'-'+kind+'.png',path=join(output,filename);
    try{
     if(kind==='native')execFileSync('/usr/sbin/screencapture',['-x','-m',path],{timeout:15000,stdio:'pipe'});
     else if(kind==='root')await writeFile(path,Buffer.from(await command('GET',prefix+'/screenshot'),'base64'));
     else{const e=await command('POST',prefix+'/element',{using:'css selector',value:item.selector});await writeFile(path,Buffer.from(await command('GET',prefix+'/element/'+e['element-6066-11e4-a52e-4f735466cecf']+'/screenshot'),'base64'));}
     const bytes=await readFile(path);record.captures[kind]={file:filename,bytes:bytes.length};
     try{record.captures[kind].pixels=pixelMetrics(png(bytes),record.geometry,kind);}catch(error){record.captures[kind].pixelError=error.message;}
    }catch(error){record.captures[kind]={error:error.message,stderr:error.stderr?.toString()};}
   }
   record.status='completed';
  }catch(error){record.status='failed';record.error=error.stack||error.message;}
  console.log(JSON.stringify({case:record.name,status:record.status,captures:Object.fromEntries(Object.entries(record.captures||{}).map(([name,c])=>[name,{error:c.error,pixelError:c.pixelError,swatchMatches:c.pixels?.swatchMatches,uniqueVisibleContentColors:c.pixels?.uniqueVisibleContentColors}]))}));
 }
}catch(error){report.fatal=error.stack||error.message;console.error(report.fatal);}
finally{
 try{if(prefix)await command('DELETE',prefix);}catch{}service.kill();await new Promise(resolve=>server.close(resolve));
 const control=report.cases.find(c=>c.name==='static-control');
 report.summary={cases:report.cases.length,completed:report.cases.filter(c=>c.status==='completed').length,staticNativeSwatches:control?.captures?.native?.pixels?.swatchMatches??null,staticRootSwatches:control?.captures?.root?.pixels?.swatchMatches??null,staticElementSwatches:control?.captures?.element?.pixels?.swatchMatches??null};
 await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({version:report.capabilities?.browserVersion,...report.summary}));
 if(report.fatal||report.summary.completed!==3)process.exitCode=1;
}
