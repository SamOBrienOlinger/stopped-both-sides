import {communitySourceIds} from './community-resources.mjs?v=site-repairs-20261125';
export const sourceTopics=[
 {id:'street',title:'Street stops and questions',ids:['questioning','publicOrder','iccl'],situation:'public-street'},
 {id:'search',title:'Searches',ids:['drugs','obstruction'],situation:'public-search'},
 {id:'custody',title:'Arrest and custody',ids:['legalAid','arrest','silence','interviews','custody','statements','dpp','eu'],situation:'public-custody'},
 {id:'young',title:'Under 18s',ids:['youth','childInterview','childSolicitor'],situation:'public-young-person'},
 {id:'complaints',title:'Complaints',ids:['fiosru','ireport'],situation:'public-fair-treatment'},
 {id:'community',title:'Community experiences',ids:['inarReport','pabi',...communitySourceIds],situation:'public-fair-treatment'}
];
export const rightsTopics=[{id:'support',title:'Advice &amp; support'},...sourceTopics];
