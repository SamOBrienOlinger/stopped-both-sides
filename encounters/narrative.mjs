import {characterFor} from './characters.mjs?v=final-touches-20261125';
import {fixedStoryCharacter} from './story-cast.mjs?v=role-cast-20261126b';

// The catalogue keeps stable teaching text and translation keys. Resolve its
// story identity against the saved cast only when displaying a running game.
export function storyIdentity(encounter){
 const match=encounter.people.public.match(/^([\p{L}'’-]+)(?:,\s*(\d+))?$/u);
 return match?{name:match[1],age:match[2]?Number(match[2]):null}:null;
}
export function characterContext(encounter,stage,role){
 if(stage.people?.[role])return stage.people[role];
 const identity=role==='public'?storyIdentity(encounter):null;
 if(!identity)return encounter.people[role];
 return identity.age===null?'':`${identity.age} years old`;
}
export function personalizeText(text,encounter,cast,nodeId=encounter.start){
 const identity=storyIdentity(encounter),selected=characterFor('public',cast.public);
 if(!identity||!selected||identity.name===selected.name||fixedStoryCharacter(encounter.id,'public',nodeId))return text;
 // Latin name boundaries also work when Chinese or Arabic text touches a name.
 const pattern=new RegExp(`(^|[^\\p{Script=Latin}\\p{N}_])${identity.name}(?=$|[^\\p{Script=Latin}\\p{N}_])`,'gu');
 return text.replace(pattern,(_,prefix)=>prefix+selected.name);
}
// Applied after translation, to trusted app HTML. Never rewrite selected cast
// names, picker labels, source publications, URLs, IDs, or saved route tokens.
export function personalizeHTML(html,encounter,cast,nodeId=encounter.start){
 const stack=[];let skip=false,currentNode=nodeId;
 const replace=text=>personalizeText(text,encounter,cast,currentNode);
 return html.split(/(<[^>]*>)/g).map(part=>{
  if(!part.startsWith('<'))return skip?part:replace(part);
  if(/^<\//.test(part)){const parent=stack.pop();skip=parent?.skip??false;currentNode=parent?.nodeId??nodeId;return part;}
  if(/^<!/.test(part))return part;
  const preserve=skip||/\bdata-no-translate\b|\bdata-character=/.test(part);
  // Recaps contain several stages, each of which can have a different fixed
  // story identity. Scope its text and accessible labels to that decision.
  const declaredNode=part.match(/\bdata-narrative-node="([^"]+)"/)?.[1];
  const contextNode=encounter.nodes?.[declaredNode]?declaredNode:currentNode;
  if(!/^<(?:br|hr|img|input|meta|link|wbr|source)\b/i.test(part)&&!part.endsWith('/>')){stack.push({skip,nodeId:currentNode});skip=preserve;currentNode=contextNode;}
  return preserve?part:part.replace(/((?:aria-label|title)=")([^"]*)"/g,(_,attribute,value)=>attribute+replace(value)+'"');
 }).join('');
}

