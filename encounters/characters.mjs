import {gardaArtwork} from './garda-artwork.mjs?v=responsive-fixes-20261127';
import {publicArtwork} from './public-artwork.mjs?v=responsive-fixes-20261127';

// Most situations allow any portrait. A stated age or gender must also match
// the public character in the few situations where that person is the target.
const make=(role,names)=>names.map((name,index)=>({
 id:role+'-'+(index+1),name,column:index%3+(role==='garda'?3:0),row:Math.floor(index/3)
}));
export const characters={
 public:make('public',['Alex','Noor','Robin','Maya','Daniel','Jo','Erin','Hassan','Pat','Nia']),
 garda:make('garda',['Garda Sergeant Ciara','Garda Rory','Garda Jamie','Garda Lee','Garda Aisling','Garda Sergeant Kai','Garda Conor','Garda Orla','Garda Sergeant Charlie'])
};
export const characterFor=(role,id)=>characters[role]?.find(character=>character.id===id)||null;
// Dedicated artwork is resolved before the legacy sheets. Existing character
// IDs, preferences and atlas coordinates remain unchanged as the roster grows.
export function characterArtwork(character,pose='portrait'){
 if(character.sceneArtwork)return character.sceneArtwork;
 const updated=publicArtwork(character)||gardaArtwork(character);
 if(updated)return updated;
 const {column,row}=character;
 const path=pose==='portrait'?'characters/cast.webp?v=garda-neutral-1':`scenes/${pose}-clean.webp`;
 return {src:new URL('../assets/'+path,import.meta.url).href,
  width:1774,height:887,
  style:`left:-${column*100}%;top:-${row*100}%;width:600%;height:300%`};
}
export const defaultCast=()=>({public:characters.public[0].id,garda:characters.garda[0].id});
export const validCast=cast=>!!cast&&['public','garda'].every(role=>!!characterFor(role,cast[role]));
const situationPortraits={
 'discrimination-gender':['public-4','public-2','public-6','public-7','public-10'],
 'discrimination-age':['public-9','public-3','public-6']
};
export function charactersForSituation(id,role){
 const allowed=role==='public'?situationPortraits[id]:null;
 return allowed?allowed.map(characterId=>characterFor(role,characterId)):characters[role]||[];
}
export function castForSituation(id,cast){
 return Object.fromEntries(['public','garda'].map(role=>{
  const available=charactersForSituation(id,role);
  return [role,available.find(character=>character.id===cast?.[role])?.id||available[0].id];
 }));
}
export function createCast(role,id,random=Math.random){
 if(!['public','garda'].includes(role))throw Error('Unknown character role');
 const other=role==='public'?'garda':'public',sample=random();
 const index=Number.isFinite(sample)&&sample>=0&&sample<1?Math.floor(sample*characters[other].length):0;
 return {[role]:characterFor(role,id)?.id||characters[role][0].id,[other]:characters[other][index].id};
}
export function changeCharacter(state,id,role=state?.role){
 if(!state||!charactersForSituation(state.id,role).some(character=>character.id===id)||state.cast[role]===id)return state;
 return {...state,cast:{...state.cast,[role]:id}};
}
export const CHARACTER_STORAGE_KEY='stopped-both-sides:characters:v1';
export function createCharacterPreferences(storage){
 let value=defaultCast();
 try{const saved=JSON.parse(storage?.getItem(CHARACTER_STORAGE_KEY)||'null');if(validCast(saved))value={public:saved.public,garda:saved.garda};}catch{}
 return {
  get value(){return value;},
  choose(role,id){if(!characterFor(role,id))return;value={...value,[role]:id};try{storage?.setItem(CHARACTER_STORAGE_KEY,JSON.stringify(value));}catch{}}
 };
}
