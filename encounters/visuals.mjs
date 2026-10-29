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
 const count=state.history.length+(state.complete?0:1);
 return `<div class="route-trail" aria-hidden="true">${Array.from({length:count},(_,i)=>`<span class="route-dot ${i<state.history.length?'is-visited':'is-current'}">${i<state.history.length?'✓':i+1}</span>`).join('')}</div>`;
}
export function completionMap(completed,total){
 return `<div class="completion-map" aria-hidden="true">${Array.from({length:total},(_,i)=>`<span class="completion-cell ${i<completed?'is-complete':''}">${i<completed?'✓':'○'}</span>`).join('')}</div>`;
}
