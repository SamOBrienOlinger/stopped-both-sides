// CI only: verify the served client files before testing the live URL.
// Branch Pages jobs can report an older head_sha while deploying the new tree.
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const {TEST_BASE_URL,PAGES_COMMIT}=process.env;
if(!TEST_BASE_URL||!/^[0-9a-f]{40}$/.test(PAGES_COMMIT||''))throw Error('Missing Pages verification context');
const root=fileURLToPath(new URL('../../',import.meta.url));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(path=>
 path&&!/^(?:\.|tests\/|scripts\/|docs\/|research\/|node_modules\/)/.test(path)&&
 /\.(?:html?|css|m?js|json|webp|png|jpe?g|svg|ico|woff2?|ttf|otf)$/i.test(path)
).sort((a,b)=>Number(b.endsWith('.html'))-Number(a.endsWith('.html'))||a.localeCompare(b));
if(!files.includes('index.html')||!files.includes('garda/index.html'))throw Error('Both Pages entrypoints must be verified');
const expected=await Promise.all(files.map(async path=>({path,hash:digest(await readFile(new URL(path,new URL('../../',import.meta.url))))})));
const deadline=Date.now()+300000;
let published=false;
console.log(`Checking ${expected.length} published client files against checkout ${PAGES_COMMIT}.`);
while(Date.now()<deadline){
 const mismatches=[];
 for(let offset=0;offset<expected.length;offset+=8){
  const results=await Promise.all(expected.slice(offset,offset+8).map(async file=>{
   try{
    const url=new URL(file.path.split('/').map(encodeURIComponent).join('/'),TEST_BASE_URL);
    url.searchParams.set('pages-check',PAGES_COMMIT);
    const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok)return `${file.path}: HTTP ${response.status}`;
    return digest(Buffer.from(await response.arrayBuffer()))===file.hash?null:`${file.path}: content differs`;
   }catch{return `${file.path}: not available yet`;}
  }));
  mismatches.push(...results.filter(Boolean));
  if(mismatches.length)break;
 }
 if(!mismatches.length){published=true;console.log('Both entrypoints and every checked client asset match; starting live browser checks.');break;}
 console.log(`Waiting for Pages: ${mismatches.slice(0,3).join('; ')}`);
 await new Promise(resolve=>setTimeout(resolve,5000));
}
if(!published)throw Error('Published client files did not match this revision within five minutes');
