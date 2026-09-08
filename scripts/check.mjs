import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
let checked=0;
function walk(directory){
 for(const entry of readdirSync(directory,{withFileTypes:true})){
  const file=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
  if(entry.isDirectory()){walk(file);continue;}
  if(!entry.name.endsWith('.mjs'))continue;
  const result=spawnSync(process.execPath,['--check',fileURLToPath(file)],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status||1);
  checked++;
 }
}
walk(new URL('../dist/',import.meta.url));
walk(new URL('./',import.meta.url));
console.log(`Checked ${checked} JavaScript modules across both games and maintenance scripts.`);
