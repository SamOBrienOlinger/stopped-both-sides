import {encounters} from './catalog.mjs?v=scene-review-1';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Decorative visualisations mirror existing text; they never score the learner.
export function learningIcon(kind){
 const paths={
  "read": "<path d=\"M4 6h7a5 5 0 0 1 5 5v16a7 7 0 0 0-6-3H4zM28 6h-7a5 5 0 0 0-5 5v16a7 7 0 0 1 6-3h6zM8 11h4M8 16h4M20 11h4M20 16h4\"/>",
  "choose": "<circle cx=\"7\" cy=\"8\" r=\"3\"/><path d=\"m5 8 1.5 1.5L9 6M14 8h13M14 16h13M14 24h13\"/><circle cx=\"7\" cy=\"16\" r=\"2\"/><circle cx=\"7\" cy=\"24\" r=\"2\"/>",
  "reflect": "<path d=\"M11 22v-2a9 9 0 1 1 10 0v2zM12 26h8M14 29h4M16 3V1M5 7 3 5M27 7l2-2M3 16H1M29 16h2\"/>",
  "street": "<path d=\"M4 4h17a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H11l-6 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z\"/><path d=\"M26 11h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2v4l-6-4h-6M7 9h12M7 14h8\"/>",
  "search": "<circle cx=\"13\" cy=\"13\" r=\"9\"/><path d=\"m20 20 9 9\"/>",
  "bag": "<path d=\"M5 10h22l-2 19H7zM11 10V7a5 5 0 0 1 10 0v3\"/><circle cx=\"15\" cy=\"19\" r=\"4\"/><path d=\"m18 22 4 4\"/>",
  "custody": "<rect x=\"5\" y=\"13\" width=\"22\" height=\"16\" rx=\"3\"/><path d=\"M10 13V8a6 6 0 0 1 12 0v5\"/><circle cx=\"16\" cy=\"20\" r=\"2\"/><path d=\"M16 22v3\"/>",
  "station": "<path d=\"M3 29h26M5 29V10h22v19M3 10l13-8 13 8M13 29V19h6v10M9 14h2M21 14h2\"/>",
  "young": "<circle cx=\"10\" cy=\"7\" r=\"4\"/><path d=\"M3 26v-9a7 7 0 0 1 14 0v5M7 19v10M13 19v10\"/><circle cx=\"24\" cy=\"15\" r=\"3\"/><path d=\"M19 29v-5a5 5 0 0 1 10 0v5M22 26v3M26 26v3M17 21l3 2\"/>",
  "fairness": "<path d=\"M16 3v25M10 29h12M4 9h24M7 9 2 20h10L7 9ZM25 9l-5 11h10L25 9Z\"/><path d=\"M2 20a5 4 0 0 0 10 0M20 20a5 4 0 0 0 10 0\"/><circle cx=\"16\" cy=\"8\" r=\"2\"/>",
  "observation": "<path d=\"M2 16s5-10 14-10 14 10 14 10-5 10-14 10S2 16 2 16Z\"/><circle cx=\"16\" cy=\"16\" r=\"5\"/>",
  "description": "<rect x=\"2\" y=\"5\" width=\"28\" height=\"22\" rx=\"3\"/><circle cx=\"10\" cy=\"13\" r=\"3\"/><path d=\"M5 22a5 5 0 0 1 10 0M20 11h5M20 16h5M20 21h3\"/>",
  "colleagues": "<circle cx=\"8\" cy=\"8\" r=\"4\"/><circle cx=\"24\" cy=\"8\" r=\"4\"/><path d=\"M2 27v-6a6 6 0 0 1 10-4M30 27v-6a6 6 0 0 0-10-4M13 19h6M16 16l3 3-3 3M19 25h-6M16 22l-3 3 3 3\"/>",
  "evidence": "<path d=\"M18 29H5V3h15l7 7v7M20 3v7h7M9 10h6M9 15h8M9 20h5\"/><circle cx=\"23\" cy=\"23\" r=\"5\"/><path d=\"m27 27 4 4\"/>",
  "supervision": "<path d=\"M3 3v26h26M8 22v-6M14 22V9M20 13V5\"/><circle cx=\"23\" cy=\"19\" r=\"5\"/><path d=\"m27 23 4 4\"/>"
};
 return `<svg class="learning-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[kind]||paths.reflect}</svg>`;
}

const scenarioSymbols={
 'public-street':'street','public-search':'bag','public-arrest':'custody','public-custody':'station',
 'public-young-person':'young','public-fair-treatment':'fairness',
 'garda-street':'observation','garda-description':'description','garda-search':'search',
 'garda-communication':'street','garda-young-person':'young','garda-colleague':'colleagues',
 'garda-new-evidence':'evidence','garda-supervision':'supervision'
};
export const scenarioIcon=id=>learningIcon(scenarioSymbols[id]||'read');

export function routeTrail(state){
 if(state.complete)return '';
 const e=encounters[state.id];
 return `<nav class="route-navigation" aria-label="Review each decision"><ol class="route-trail">${state.history.map((step,i)=>`<li><button class="route-dot is-visited" data-action="paired-revisit" data-index="${i}" title="${esc(e.nodes[step.nodeId].title)}" aria-label="${esc(e.nodes[step.nodeId].title)}"><span aria-hidden="true">${i+1}</span></button></li>`).join('')}<li><span class="route-dot is-current" aria-current="step"><span class="sr-only">${esc(e.nodes[state.nodeId].title)}</span><span aria-hidden="true">${state.history.length+1}</span></span></li></ol></nav>`;
}
export function decisionGuide(answered){
 return `<ol class="decision-guide" aria-label="How it works"><li>${learningIcon('read')}<span>Read a situation</span></li><li ${!answered?'aria-current="step"':''}>${learningIcon('choose')}<span>Choose a response</span></li><li ${answered?'aria-current="step"':''}>${learningIcon('reflect')}<span>Learn why it matters</span></li></ol>`;
}
export function topicExplorer(groups,role){
 return `<section class="topic-explorer" aria-labelledby="topic-explorer-title"><div class="section-heading"><h2 id="topic-explorer-title">Browse all 14 situations</h2><p>Choose any situation. Each one can be played from both sides.</p></div><div class="topic-grid">${groups.map(t=>`<a class="topic-card" href="#encounters/${role}/${t.id}">${learningIcon(t.id)}<strong>${t.title}</strong><span class="topic-card-count" aria-hidden="true">→</span><span class="topic-preview">${esc(encounters[t.encounters[0]].title)}</span></a>`).join('')}</div></section>`;
}
export function completionMap(completed,total){
 return `<div class="completion-map" aria-hidden="true">${Array.from({length:total},(_,i)=>`<span class="completion-cell ${i<completed?'is-complete':''}">${i<completed?'✓':'○'}</span>`).join('')}</div>`;
}
