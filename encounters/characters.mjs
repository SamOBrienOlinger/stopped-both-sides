import {gardaArtwork} from './garda-artwork.mjs?v=learning-language-20261120';

// Appearance is independent of scenario facts, choices and scoring.
const make=(role,names)=>names.map((name,index)=>({
 id:role+'-'+(index+1),name,column:index%3+(role==='garda'?3:0),row:Math.floor(index/3)
}));
export const characters={
 public:make('public',['Alex','Noor','Robin','Maya','Daniel','Jo','Erin','Hassan','Pat']),
 garda:make('garda',['Garda Sergeant Ciara','Garda Rory','Garda Jamie','Garda Lee','Garda Aisling','Garda Sergeant Kai','Garda Conor','Garda Orla','Garda Sergeant Charlie'])
};
export const characterFor=(role,id)=>characters[role]?.find(character=>character.id===id)||null;
// Character IDs, preferences and the public-character poses stay unchanged.
export function characterArtwork(character,pose='portrait'){
 const updated=gardaArtwork(character);
 if(updated)return updated;
 const {column,row}=character;
 const path=pose==='portrait'?'characters/cast.webp?v=garda-neutral-1':`scenes/${pose}-clean.webp`;
 return {src:new URL('../assets/'+path,import.meta.url).href,
  width:1774,height:887,
  style:`left:-${column*100}%;top:-${row*100}%;width:600%;height:300%`};
}
export const defaultCast=()=>({public:characters.public[0].id,garda:characters.garda[0].id});
export const validCast=cast=>!!cast&&['public','garda'].every(role=>!!characterFor(role,cast[role]));
export function createCast(role,id,random=Math.random){
 if(!['public','garda'].includes(role))throw Error('Unknown character role');
 const other=role==='public'?'garda':'public',sample=random();
 const index=Number.isFinite(sample)&&sample>=0&&sample<1?Math.floor(sample*characters[other].length):0;
 return {[role]:characterFor(role,id)?.id||characters[role][0].id,[other]:characters[other][index].id};
}
export function changeCharacter(state,id,role=state?.role){
 if(!state||!characterFor(role,id)||state.cast[role]===id)return state;
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
