// CI only: wait for the branch-published revision before testing the live URL.
const {GITHUB_REPOSITORY,GH_TOKEN,PAGES_COMMIT}=process.env;
if(!GITHUB_REPOSITORY||!GH_TOKEN||!/^[0-9a-f]{40}$/.test(PAGES_COMMIT||''))throw Error('Missing Pages verification context');
const url=`https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?head_sha=${PAGES_COMMIT}&per_page=50`;
let published=false;
for(let attempt=0;attempt<60;attempt++){
 const response=await fetch(url,{headers:{Authorization:`Bearer ${GH_TOKEN}`,Accept:'application/vnd.github+json'}});
 if(!response.ok)throw Error(`Unable to verify Pages publication (${response.status})`);
 const data=await response.json();
 const run=data.workflow_runs.find(item=>item.head_branch==='main'&&item.name==='pages build and deployment');
 if(run?.status==='completed'){
  if(run.conclusion!=='success')throw Error(`Pages publication ended with ${run.conclusion}`);
  console.log(`Pages published ${PAGES_COMMIT}; checking the live site.`);published=true;break;
 }
 await new Promise(resolve=>setTimeout(resolve,5000));
}
if(!published)throw Error('Pages did not finish for this revision within five minutes');
