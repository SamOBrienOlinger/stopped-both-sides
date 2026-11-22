import {encounters,roles} from './catalog.mjs?v=colleague-witness-20261122';
import {topicGroups} from './presentation.mjs?v=colleague-witness-20261122';

const playTopics=[{id:'all',title:'All topics'},...topicGroups];

export function topicsForPlay(mode,role){
 if(mode!=='practice')return playTopics;
 return playTopics.filter(topic=>topic.id==='all'||topic.encounters.some(id=>encounters[id].origin===role));
}

function availableTopic(mode,role,topic){
 return topicsForPlay(mode,role).some(item=>item.id===topic)?topic:'all';
}

export function playHash(mode,role,topic='all',browse=true){
 const section=mode==='practice'?'practice':'encounters';
 const selectedTopic=availableTopic(mode,role,topic);
 return `#${section}/${role}${browse||selectedTopic!=='all'?'/'+selectedTopic:''}`;
}

export function playLocation(hash,siteRole='public'){
 const [section,role=siteRole,topic='all',...extra]=hash.replace(/^#/,'').split('/');
 if(!['encounters','practice'].includes(section)||!roles.includes(role)||extra.length||
    !playTopics.some(item=>item.id===topic))return null;
 const mode=section==='practice'?'practice':'shared';
 return {mode,role,topic:availableTopic(mode,role,topic),browse:hash.split('/').length===3};
}

export function topicForSituation(id){
 return topicGroups.find(topic=>topic.encounters.includes(id))?.id||'all';
}
