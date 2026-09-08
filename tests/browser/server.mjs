import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep,extname} from 'node:path';
import {parseArgs} from 'node:util';

const {values}=parseArgs({options:{host:{type:'string',default:'127.0.0.1'},port:{type:'string',default:'4173'},strictPort:{type:'boolean'}}});

const root=fileURLToPath(new URL('../../',import.meta.url));
const prefix='/stopped-both-sides/';
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
 '.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp','.json':'application/json'};
createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const relative=pathname.startsWith(prefix)?pathname.slice(prefix.length):pathname.slice(1);
  if(relative.split('/').some(part=>part.startsWith('.'))){res.writeHead(403).end();return;}
  let file=resolve(root,relative);
  if(file!==resolve(root)&&!file.startsWith(resolve(root)+sep)){res.writeHead(403).end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(await readFile(file));
 }catch{res.writeHead(404).end();}
}).listen(Number(values.port),values.host,()=>console.log(`Static preview listening on ${values.host}:${values.port}`));
