import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const cwd=new URL('../',import.meta.url);
const all=readdirSync(new URL('../tests/',import.meta.url)).filter(file=>file.endsWith('.test.mjs')).sort().map(file=>'tests/'+file);
// Shared graph, storage, asset and original-mode suites run once. Run the
// common application integration suite against each entrypoint in isolation.
for(const [role,files] of [['public',all],['garda',['tests/accessibility.test.mjs','tests/encounter-routes.test.mjs']]]){
 console.log(`Checking the ${role} entrypoint`);
 const result=spawnSync(process.execPath,['--test',...files],{cwd,env:{...process.env,GAME_ROLE:role},stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
}
