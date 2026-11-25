import {characterFor,characters,charactersForSituation} from './characters.mjs?v=final-touches-20261125';

const figure=(id,name,asset)=>({
 id,name,sceneArtwork:{
  src:new URL('../assets/characters/'+asset,import.meta.url).href,
  width:512,height:512,style:'left:0;top:0;width:100%;height:100%'
 }
});
const alias=(id,name,modelId)=>({...characterFor('public',modelId),id,name,modelId});

// Authored roles are presentation identities. The player's stored roster IDs and
// decision history remain valid even when the script specifies a different person.
const amina=figure('story-amina','Amina','story-amina.webp');
const jamie=figure('story-jamie','Jamie','story-jamie.webp');
const jamieComparison=figure('story-jamie-comparison','Jamie','story-jamie-comparison.webp');
const differentPerson={...figure('story-other-person','Person matching the fuller description','story-other-person.webp'),descriptive:true};
const niamh=alias('story-niamh','Niamh','public-7');
const patrick=alias('story-patrick','Patrick','public-8');
const authoredPeople=[amina,jamie,jamieComparison,differentPerson,niamh,patrick];

export const storyCharacterById=id=>authoredPeople.find(person=>person.id===id);

const namedPractice={
 'public-street':characterFor('public','public-1'),'garda-street':characterFor('public','public-1'),
 'public-search':niamh,'garda-search':niamh,
 'public-arrest':characterFor('public','public-5'),'garda-new-evidence':characterFor('public','public-5'),
 'public-custody':characterFor('public','public-4'),'garda-communication':characterFor('public','public-4'),
 'garda-colleague':patrick
};

export function fixedStoryCharacter(id,role,nodeId,authored=false){
 if(role!=='public')return null;
 if(id==='garda-description')return nodeId==='description-power'?differentPerson:amina;
 if(id==='public-fair-treatment')return amina;
 if(id==='public-young-person'||id==='garda-young-person')return nodeId==='young-review'?jamieComparison:jamie;
 return authored?namedPractice[id]||null:null;
}

const sergeants=characters.garda.filter(character=>character.name.startsWith('Garda Sergeant '));
export function storyCastOptions(id,role){
 return id==='garda-supervision'&&role==='garda'?sergeants:charactersForSituation(id,role);
}
export function storyCharacter(state,role,nodeId=state.complete?state.history.at(-1)?.nodeId:state.nodeId){
 const fixed=fixedStoryCharacter(state.id,role,nodeId,state.authored);
 if(fixed)return fixed;
 const options=storyCastOptions(state.id,role);
 return options.find(character=>character.id===state.cast[role])||options[0];
}
