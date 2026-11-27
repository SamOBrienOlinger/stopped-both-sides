import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {gzipSync} from 'node:zlib';

const root=process.cwd(),prefix='/stopped-both-sides/';
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp','.json':'application/json'};
const cache=new Map();
async function cached(file){
 if(!cache.has(file)){
  const raw=await readFile(file),compressible=/\.(html|mjs|js|css|svg|ttf|json)$/.test(file);
  cache.set(file,{raw,gzip:compressible?gzipSync(raw,{level:6}):null});
 }
 return cache.get(file);
}
export async function startServer(port=4181){
 const server=createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),relative=pathname.startsWith(prefix)?pathname.slice(prefix.length):pathname.slice(1);
   if(relative.split('/').some(part=>part.startsWith('.'))){res.writeHead(403).end();return;}
   let file=resolve(root,relative);
   if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
   if((await stat(file)).isDirectory())file=resolve(file,'index.html');
   const body=await cached(file),gzip=body.gzip&&/\bgzip\b/.test(req.headers['accept-encoding']||''),bytes=gzip?body.gzip:body.raw;
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','Vary':'Accept-Encoding','Content-Length':bytes.length,...(gzip?{'Content-Encoding':'gzip'}:{})});res.end(bytes);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 return server;
}
