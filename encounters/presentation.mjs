import {encounters,roles} from './catalog.mjs';

// Explicit teaching transitions: these are variations, not consequences of a choice.
export const variations={
 'public-street/street-details':{label:'New variation',detail:'The facts have changed. Read this separate version before choosing a response.'},
 'garda-description/description-power':{label:'New variation',detail:'A different person is involved. Read the new description and information below.'},
 'garda-search/search-specific':{label:'New variation',detail:'The facts have changed. Read this separate version before choosing a response.'},
 'garda-street/street-identity':{label:'Compare two versions',detail:'The identity changes; the other stated facts stay the same.'},
 'garda-young-person/young-review':{label:'Compare two versions',detail:'The identity changes; the other stated facts stay the same.'}
};
export const variationFor=(id,nodeId)=>variations[id+'/'+nodeId]||null;

// Include either perspective's routes; switching role can change the remaining path.
export function remainingDecisions(state){
 const encounter=encounters[state.id],memo=new Map();
 function visit(id){
  if(id==='end')return {min:0,max:0};
  if(memo.has(id))return memo.get(id);
  const next=[...new Set(roles.flatMap(role=>encounter.nodes[id].views[role].choices.map(c=>c.next)))].map(visit);
  const result={min:1+Math.min(...next.map(n=>n.min)),max:1+Math.max(...next.map(n=>n.max))};
  memo.set(id,result);return result;
 }
 return visit(state.nodeId);
}
export function learningStatus(progress,id,role){
 const record=progress.records[id+'/'+role];
 return record?.best?'Completed':record&&Object.keys(record.decisions).length?'In progress':'Not started';
}

const reportingPicture={
 eyebrow:'THE FULLER PICTURE',
 title:'Neither person had all the information.',
 introduction:'Good decisions depended on:',
 steps:['Accurate observation','Safety','Preserve evidence','Speak up','Independent review'],
 note:'This recap assesses whether you separated fact from inference, preserved evidence and used an appropriate reporting channel. It does not decide whether the conduct was unlawful or corrupt.'
};
export const fullerPictureFor=id=>['public-witness','public-corruption'].includes(id)?reportingPicture:null;

export const topicGroups=[
 {id:'street',title:'Street stops',encounters:['public-street','garda-street','garda-description']},
 {id:'search',title:'Searches',encounters:['public-search','garda-search','garda-new-evidence']},
 {id:'custody',title:'Arrest and custody',encounters:['public-arrest','public-custody']},
 {id:'young',title:'Young people',encounters:['public-young-person','garda-young-person']},
 {id:'reporting',title:'Reporting wrongdoing',encounters:['public-witness','public-corruption']},
 {id:'fairness',title:'Fair treatment',encounters:['public-fair-treatment','garda-communication','garda-colleague','garda-supervision']}
];
