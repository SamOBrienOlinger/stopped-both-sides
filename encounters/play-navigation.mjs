import {encounters,roles} from './catalog.mjs?v=site-repairs-20261125';
import {topicGroups} from './presentation.mjs?v=site-repairs-20261125';

const playTopics=[{id:'all',title:'All topics'},...topicGroups];

// Custody situations were authored on the public side but include Garda choices.
export function availableInPractice(encounter,role){
 return encounter.origin===role||encounter.origin==='shared'||
  (role==='garda'&&['public-arrest','public-custody'].includes(encounter.id));
}

export function topicsForPlay(mode,role){
 if(mode!=='practice')return playTopics;
 return playTopics.filter(topic=>topic.id==='all'||topic.encounters.some(id=>availableInPractice(encounters[id],role)));
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
