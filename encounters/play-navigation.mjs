import {roles} from './catalog.mjs?v=shop-theft-20261115';
import {topicGroups} from './presentation.mjs';

export const playTopics=[{id:'all',title:'All topics'},...topicGroups];

export function playHash(mode,role,topic='all',browse=true){
 const section=mode==='practice'?'practice':'encounters';
 return `#${section}/${role}${browse||topic!=='all'?'/'+topic:''}`;
}

export function playLocation(hash,siteRole='public'){
 const [section,role=siteRole,topic='all',...extra]=hash.replace(/^#/,'').split('/');
 if(!['encounters','practice'].includes(section)||!roles.includes(role)||extra.length||
    !playTopics.some(item=>item.id===topic))return null;
 return {mode:section==='practice'?'practice':'shared',role,topic,browse:hash.split('/').length===3};
}

export function topicForSituation(id){
 return topicGroups.find(topic=>topic.encounters.includes(id))?.id||'all';
}
