import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep,extname} from 'node:path';

const root=fileURLToPath(new URL('../../',import.meta.url));
const prefix='/stopped-both-sides/';
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
 '.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.json':'application/json'};
createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith(prefix)){res.writeHead(404).end();return;}
  let file=resolve(root,pathname.slice(prefix.length));
  if(file!==resolve(root)&&!file.startsWith(resolve(root)+sep)){res.writeHead(403).end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(await readFile(file));
 }catch{res.writeHead(404).end();}
}).listen(4173,'127.0.0.1');
