import {publicGestureArtwork} from './group-staging.mjs';
import {characterFor} from './characters.mjs?v=final-touches-20261125';
import {sceneActorLayout} from './scene-layout.mjs?v=situation-locations-20261122';

const position=(x,width,bottom)=>({x,width,bottom,labelSpace:2*Math.min(x,100-x)});
const pair=(publicPosition,gardaPosition)=>({public:publicPosition,garda:gardaPosition});

// Physical coordinates are percentages of the full location. Each pavement has
// its own vanishing point: positions farther back use smaller figures.
const staging={
 'public-street':pair(position(24,28,4),position(51,23,14)),
 'public-arrest':pair(position(33,26,8),position(55,22,17)),
 'garda-new-evidence':pair(position(20,27,4),position(45,25,11)),
 'garda-colleague':pair(position(24,27,5),position(49,23,15)),
 'public-search':pair(position(60,26,6),position(84,24,9)),
 'garda-search':pair(position(52,27,5),position(75,24,12)),
 'garda-young-person':pair(position(41,24,5),position(75,21,14)),
 'garda-description':pair(position(35,26,8),position(62,25,4)),
 'public-fair-treatment':pair(position(39,26,6),position(68,26,3)),
 'garda-communication':pair(position(28,26,8),position(56,26,4)),
 'public-custody':pair(position(29,29,10),position(66,27,14)),
 'public-young-person':pair(position(38,25,18),position(72,27,14))
};

// These people are present in the written encounters. Their portraits stay
// distinct from each playable person and from the other supporting parts.
const castParts={
 colleague:{role:'garda',portraits:['garda-2','garda-8','garda-5']},
 friendA:{role:'public',portraits:['public-7','public-4','public-6']},
 friendB:{role:'public',portraits:['public-1','public-2','public-4']},
 passerby:{role:'public',portraits:['public-2','public-6','public-3']},
 parent:{role:'public',portraits:['public-5','public-4','public-2']},
 customer:{role:'public',portraits:['public-3','public-6','public-9']},
 cleaner:{role:'public',portraits:['public-8','public-5','public-2']}
};
const part=(key,x,width,bottom)=>({key,anchor:position(x,width,bottom)});
const youthGroup=[part('friendA',23,20,3),part('friendB',58,19,13),part('colleague',90.5,16.5,19)];
const caseColleague=part('colleague',66,18,25);
const quayColleague=part('colleague',81,23,2);
// The pavement is deeper on the shop side of the quay. Keep distant passersby off the river wall.
const quayPasserby=part('passerby',19,17,18);
const supportingAt={
 'public-young-person':{'youth-solicitor':[part('parent',18,24,19)]},
 'garda-young-person':{'young-start':youthGroup,'young-contact':youthGroup,'young-review':youthGroup},
 'garda-colleague':{'colleague-start':[caseColleague],'colleague-pressure':[caseColleague],
  'colleague-specific':[caseColleague,part('customer',78,15,37)]},
 'garda-communication':{'communication-start':[quayColleague],'communication-repair':[quayColleague],'communication-clarify':[quayColleague]},
 'garda-description':{'description-start':[quayPasserby],'description-repair':[quayColleague]},
 'public-fair-treatment':{'fair-start':[quayPasserby]},
 'garda-new-evidence':{'update-repair':[caseColleague]},
 'garda-search':{'search-result':[part('colleague',90,18,18)]},
 'garda-street':{'street-information':[part('cleaner',86,20,22)]}
};
const floorProps={
 'public-search':{'search-start':'travel-bag','search-power':'travel-bag','search-disagree':'travel-bag'},
 'garda-search':{'search-start':'travel-bag','search-check':'travel-bag','search-explain':'travel-bag','search-result':'travel-bag'},
 'garda-colleague':{'colleague-start':'toolbox','colleague-pressure':'toolbox','colleague-specific':'toolbox'},
 'garda-description':{'description-power':'red-bicycle'}
};
const objects={
 'travel-bag':{width:0.29,offset:-0.40},toolbox:{width:0.36,offset:-0.44},
 'red-bicycle':{width:0.86,offset:-0.59},phone:{width:0.073,offset:0.27}
};
function storyObject(name,anchor){
 const spec=objects[name];
 const width=anchor.width*spec.width;
 const x=anchor.x+anchor.width*spec.offset;
 // Actor frames are square inside a 16:9 location. The floor is just
 // above the frame bottom. A phone belongs at the hand, above that line.
 const bottom=anchor.bottom+anchor.width*(name==='phone'?0.18:0.025)*16/9;
 const src=new URL('../assets/scenes/story/'+name+'.webp',import.meta.url).href;
 return '<img class="scene-story-prop" data-story-prop="'+name+'" data-prop-owner="public" src="'+src+'" alt="" aria-hidden="true" decoding="async" style="left:'+x.toFixed(2)+'%;bottom:'+bottom.toFixed(2)+'%;width:'+width.toFixed(2)+'%">';
}

export function originalSceneDetails(id,nodeId,place,cast,{members=['public','garda']}={}){
 const empty={anchors:{},supporting:[],props:''};
 if(members.length!==2||id.startsWith('discrimination-'))return empty;
 // The arrest moves indoors. The bicycle first appears with a different
 // person on the residential street, after the initial quayside enquiry.
 const openingPlace={'public-arrest':'street','garda-description':'square'};
 const anchors=nodeId==='description-power'&&id==='garda-description'
  ?pair(position(33,27,7),position(57,21,20))
  :(!openingPlace[id]||openingPlace[id]===place)?staging[id]||{}:{};
 const used=new Set(Object.values(cast).map(c=>c?.modelId||c?.id||c));
 const supporting=(supportingAt[id]?.[nodeId]||[]).map(({key,anchor})=>{
  const {role,portraits}=castParts[key];
  const id=portraits.find(id=>!used.has(id));
  used.add(id);
  const person=characterFor(role,id);
  const art=role==='public'&&publicGestureArtwork(person,'listen',anchor.x>(anchors.public?.x??50));
  return {key,role,anchor,character:art?{...person,sceneArtwork:art}:person};
 });
 let name=floorProps[id]?.[nodeId];
 // This small held item uses Alex's measured hand position. Custom poses
 // retain their own hands rather than acquiring a detached phone.
 if(id==='garda-street'&&nodeId==='street-start'&&[cast.public?.modelId,cast.public?.id,cast.public].includes('public-1'))name='phone';
 const publicPosition=anchors.public||sceneActorLayout(place,'public');
 return {anchors,supporting,props:name?storyObject(name,publicPosition):''};
}
