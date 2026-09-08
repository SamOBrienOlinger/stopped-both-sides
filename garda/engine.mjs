import {hasOwn} from '../compatibility.mjs';
import {scenarioById} from './data.mjs';
export function startSession(id){const s=hasOwn(scenarioById,id)?scenarioById[id]:null;if(!s)throw new Error('Unknown scenario');return {scenarioId:id,nodeId:s.start,history:[],selected:null,complete:false};}
export function currentNode(state){return state&&!state.complete?scenarioById[state.scenarioId].nodes[state.nodeId]:null;}
export function choose(state,index){const node=currentNode(state);if(!node||state.selected!==null||!Number.isInteger(index)||!node.choices[index])return state;return {...state,selected:index};}
export function advance(state){const node=currentNode(state);if(!node||state.selected===null)return state;const choice=node.choices[state.selected];return {...state,nodeId:choice.next,history:[...state.history,{nodeId:state.nodeId,choiceIndex:state.selected}],selected:null,complete:choice.next==='end'};}
export function previous(state){if(!state||!state.history.length)return state;const history=state.history.slice();const last=history.pop();return {...state,nodeId:last.nodeId,history,selected:null,complete:false};}
export function recap(state){if(!state)return [];const s=scenarioById[state.scenarioId];return state.history.map(h=>({node:s.nodes[h.nodeId],choice:s.nodes[h.nodeId].choices[h.choiceIndex]}));}
export function remainingSteps(state){if(!state||state.complete)return {min:0,max:0};const s=scenarioById[state.scenarioId];function walk(id,seen=new Set()){if(id==='end')return {min:0,max:0};if(seen.has(id))throw new Error('Cyclic scenario');const next=new Set(seen).add(id);const branches=s.nodes[id].choices.map(c=>walk(c.next,next));return {min:1+Math.min(...branches.map(v=>v.min)),max:1+Math.max(...branches.map(v=>v.max))};}return walk(state.nodeId);}
