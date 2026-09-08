import {encounters, roles} from './catalog.mjs';

export const otherRole = role => role === 'public' ? 'garda' : 'public';
const validRole = role => roles.includes(role);
const answers = () => ({public:null,garda:null});
export function startEncounter(id,role='public') {
  if (!Object.hasOwn(encounters,id) || !validRole(role)) throw new Error('Unknown encounter or role');
  return {id,role,nodeId:encounters[id].start,history:[],answers:answers(),complete:false};
}
export const currentStage = state => state && !state.complete ? encounters[state.id].nodes[state.nodeId] : null;
export function switchRole(state,role=otherRole(state.role)) {
  return validRole(role) ? {...state,role} : state;
}
export function answer(state,index) {
  const stage=currentStage(state);
  if (!stage || state.answers[state.role]!==null || !Number.isInteger(index) || !stage.views[state.role].choices[index]) return state;
  return {...state,answers:{...state.answers,[state.role]:index}};
}
export function continueEncounter(state) {
  const stage=currentStage(state), index=state.answers[state.role];
  if (!stage || index===null) return state;
  const next=stage.views[state.role].choices[index].next;
  return {...state,nodeId:next,complete:next==='end',answers:answers(),history:[...state.history,{nodeId:state.nodeId,answers:{...state.answers},continuedAs:state.role}]};
}
export function revisit(state,index=state.history.length-1) {
  if (!Number.isInteger(index) || index<0 || index>=state.history.length) return state;
  const step=state.history[index];
  return {...state,nodeId:step.nodeId,history:state.history.slice(0,index),answers:answers(),complete:false};
}
export function changeAnswer(state) {
  return state.complete ? state : {...state,answers:{...state.answers,[state.role]:null}};
}
// Only fictional scenario IDs, role IDs and numeric choice indexes enter the URL.
// Rebuild the route from validated decisions rather than trusting submitted node IDs.
export function encodeState(state) {
  const data={v:1,e:state.id,r:state.role,p:state.history.map(h=>[h.answers.public,h.answers.garda,roles.indexOf(h.continuedAs)]),a:[state.answers.public,state.answers.garda]};
  return btoa(JSON.stringify(data)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeState(token) {
  try {
    if (typeof token!=='string'||token.length>6000||!/^[A-Za-z0-9_-]+$/.test(token)) return null;
    const d=JSON.parse(atob(token.replaceAll('-','+').replaceAll('_','/')));
    if (d?.v!==1||!validRole(d.r)||!Array.isArray(d.p)||d.p.length>20||!Array.isArray(d.a)||d.a.length!==2) return null;
    let state=startEncounter(d.e,d.r);
    const apply=(values)=>{
      for (let i=0;i<2;i++) {
        const index=values[i];
        if(index===null) continue;
        const stage=currentStage(state);
        if(!stage||!Number.isInteger(index)||!stage.views[roles[i]].choices[index]) throw Error('Invalid choice');
        state=answer(switchRole(state,roles[i]),index);
      }
    };
    for(const step of d.p) {
      if(!Array.isArray(step)||step.length!==3||![0,1].includes(step[2])||state.complete) return null;
      apply(step);
      state=switchRole(state,roles[step[2]]);
      if(state.answers[state.role]===null) return null;
      state=continueEncounter(state);
    }
    apply(d.a);
    return switchRole(state,d.r);
  } catch {return null;}
}
export const stateHash = state => '#encounter/'+encodeState(state);
export function fromOriginal(original,role,targetRole=otherRole(role)) {
  let state=startEncounter(role+'-'+original.scenarioId,role);
  for(const step of original.history) {
    if(state.nodeId!==step.nodeId) throw Error('The original route has changed');
    state=continueEncounter(answer(state,step.choiceIndex));
  }
  if(state.nodeId!==original.nodeId) throw Error('The current stage has changed');
  if(original.selected!==null&&!state.complete) state=answer(state,original.selected);
  return switchRole(state,targetRole);
}
