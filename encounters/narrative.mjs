import {characterFor} from './characters.mjs';

// The catalogue keeps stable teaching text and translation keys. Resolve its
// story identity against the saved cast only when displaying a running game.
export function storyIdentity(encounter){
 const match=encounter.people.public.match(/^([^,]+),\s*(\d+)$/);
 return match?{name:match[1],age:Number(match[2])}:null;
}
export function characterContext(encounter,stage,role){
 if(stage.people?.[role])return stage.people[role];
 const identity=role==='public'&&storyIdentity(encounter);
 return identity?`${identity.age} years old`:encounter.people[role];
}
export function personalizeText(text,encounter,cast){
 const identity=storyIdentity(encounter),selected=characterFor('public',cast.public);
 if(!identity||!selected||identity.name===selected.name)return text;
 const pattern=new RegExp(`(^|[^\\p{L}\\p{N}_])${identity.name}(?=$|[^\\p{L}\\p{N}_])`,'gu');
 return text.replace(pattern,(_,prefix)=>prefix+selected.name);
}
// Applied after translation, to trusted app HTML. Never rewrite selected cast
// names, picker labels, source publications, URLs, IDs, or saved route tokens.
export function personalizeHTML(html,encounter,cast){
 const stack=[];let skip=false;
 const replace=text=>personalizeText(text,encounter,cast);
 return html.split(/(<[^>]*>)/g).map(part=>{
  if(!part.startsWith('<'))return skip?part:replace(part);
  if(/^<\//.test(part)){skip=stack.pop()??false;return part;}
  if(/^<!/.test(part))return part;
  const preserve=skip||/\bdata-no-translate\b|\bdata-character=/.test(part);
  if(!/^<(?:br|hr|img|input|meta|link|wbr|source)\b/i.test(part)&&!part.endsWith('/>')){stack.push(skip);skip=preserve;}
  return preserve?part:part.replace(/((?:aria-label|title)=")([^"]*)"/g,(_,attribute,value)=>attribute+replace(value)+'"');
 }).join('');
}
