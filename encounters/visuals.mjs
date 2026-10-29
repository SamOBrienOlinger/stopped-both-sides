import {encounters} from './catalog.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Decorative visualisations mirror existing text; they never score the learner.
export function learningIcon(kind){
 const paths={
  read:'<path d="M4 5h6a4 4 0 0 1 4 4v15a5 5 0 0 0-5-3H4zM28 5h-6a4 4 0 0 0-4 4v15a5 5 0 0 1 5-3h5zM8 10h3M8 14h3M21 10h3M21 14h3"/>',
  choose:'<path d="M5 7h15M5 15h9M5 23h9M21 13v13l3-4 4-1z"/><circle cx="25" cy="7" r="3"/>',
  reflect:'<path d="M8 9a10 10 0 0 1 17 4M25 6v7h-7M24 23A10 10 0 0 1 7 19M7 26v-7h7"/><path d="m12 16 3 3 6-6"/>'
 };
 return `<svg class="learning-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[kind]||paths.reflect}</svg>`;
}
export function routeTrail(state){
 if(state.complete)return '';
 const e=encounters[state.id];
 return `<nav class="route-navigation" aria-label="Review each decision"><ol class="route-trail">${state.history.map((step,i)=>`<li><button class="route-dot is-visited" data-action="paired-revisit" data-index="${i}" title="${esc(e.nodes[step.nodeId].title)}" aria-label="${esc(e.nodes[step.nodeId].title)}"><span aria-hidden="true">${i+1}</span></button></li>`).join('')}<li><span class="route-dot is-current" aria-current="step"><span class="sr-only">${esc(e.nodes[state.nodeId].title)}</span><span aria-hidden="true">${state.history.length+1}</span></span></li></ol></nav>`;
}
export function decisionGuide(answered){
 return `<ol class="decision-guide" aria-label="How it works"><li>${learningIcon('read')}<span>Read a situation</span></li><li ${!answered?'aria-current="step"':''}>${learningIcon('choose')}<span>Choose a response</span></li><li ${answered?'aria-current="step"':''}>${learningIcon('reflect')}<span>Learn why it matters</span></li></ol>`;
}
export function topicExplorer(groups,role){
 const icons={street:'read',search:'choose',custody:'reflect',young:'read',fairness:'reflect'};
 return `<section class="topic-explorer" aria-labelledby="topic-explorer-title"><div class="section-heading"><h2 id="topic-explorer-title">Browse all 14 situations</h2><p>Choose any situation. Each one can be played from both sides.</p></div><div class="topic-grid">${groups.map(t=>`<a class="topic-card" href="#encounters/${role}/${t.id}">${learningIcon(icons[t.id])}<strong>${t.title}</strong><span class="topic-card-count" aria-hidden="true">↗</span><span class="topic-preview">${esc(encounters[t.encounters[0]].title)}</span></a>`).join('')}</div></section>`;
}
export function completionMap(completed,total){
 return `<div class="completion-map" aria-hidden="true">${Array.from({length:total},(_,i)=>`<span class="completion-cell ${i<completed?'is-complete':''}">${i<completed?'✓':'○'}</span>`).join('')}</div>`;
}
