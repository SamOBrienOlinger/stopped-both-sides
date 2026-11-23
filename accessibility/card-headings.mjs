// Deliberately name each card's title. Inline emphasis, character names,
// scores and action labels are not display headings.
const families=[
 ['scenario','.scenario',':scope > h2,:scope > h3','card'],
 ['information','.info-block',':scope > h2,:scope > h3','card'],
 ['information-disclosure','.info-block:is(.privacy-disclosure,.input-disclosure)',':scope > summary > .card-summary-title','card'],
 ['source','.source-card',':scope > strong','compact'],
 ['evidence','.evidence-record',':scope > summary > .evidence-title','compact'],
 ['support','.support-card',':scope > .support-organisation > h3','card'],
 ['support-recap','.support-recap',':scope > div > h2','card'],
 ['recap','.summary-item',':scope > h2,:scope > .recap-overview > div > h2','card'],
 ['recap-aside','.summary-aside',':scope > h2','card'],
 ['recap-role','.recap-role',':scope > h3','compact'],
 ['comparison','.decision-comparison-role',':scope > h3','compact'],
 ['recommended','.recommended-situation',':scope > h2','card'],
 ['saved','.flow-save',':scope > .flow-save-copy > strong','compact'],
 ['topics','.topic-explorer',':scope > .topic-disclosure > summary > h2','card'],
 ['topic','.situation-topic',':scope > summary > strong','compact'],
 ['ground','.discrimination-ground',':scope > summary > strong','compact'],
 ['source-topic','.source-topic',':scope > h2,:scope > .support-heading > h2','card'],
 ['evidence-group','.evidence-group',':scope > h2','card'],
 ['learning-intro','.learning-intro',':scope > h2','feature'],
 ['learning-goal','.learning-goal',':scope > h3','card'],
 ['learning-cycle','.learning-cycle',':scope > h3','compact'],
 ['learning-context','.learning-context',':scope > h3,:scope > div > h3','card'],
 ['learning-example','.learning-example',':scope > h3','card'],
 ['learning-outcome','.learning-outcomes > li',':scope > h3','card'],
 ['learning-stage','.learning-stages > li',':scope > div > h3','compact'],
 ['learning-panel','.learning-panel',':scope > summary .learning-panel-title','compact'],
 ['learning-reference','.learning-references > li',':scope > .learning-reference-entry > div > h3','compact'],
 ['contribution','.contribution-columns > section,.contribution-contributors',':scope > h3','card'],
 ['contribution-organisation','.contribution-organisations > li',':scope > h4','compact'],
 ['how-to','.how-to-play',':scope > .how-to-disclosure > summary > h2','card'],
 ['practice','.single-mode',':scope > summary > h2','card'],
 ['how-step','.how-step',':scope > .how-step-copy > strong','compact'],
 // These headings size fluidly but retain the game's existing state cues.
 ['story','.decision-context,.game-grid > .story',':scope > h1','feature',false],
 ['decision','.decision-choices > .prompt',':scope > h2','card',false],
 ['feedback','.feedback',':scope > h2','card',false],
 ['recap-header','.summary-heading',':scope > h1','feature',false]
];

export function decorateCardHeadings(main){
 if(!main?.querySelectorAll)return;
 // These two authored summaries contain only their translated title. Give
 // the text its own motion surface, preserving the native summary and marker
 // as a stationary, fully visible control. Repeated updates do not rewrap it.
 for(const summary of main.querySelectorAll('.info-block:is(.privacy-disclosure,.input-disclosure) > summary')){
  if(summary.childElementCount||!summary.textContent.trim())continue;
  const title=summary.ownerDocument.createElement('span');
  title.className='card-summary-title';
  while(summary.firstChild)title.append(summary.firstChild);
  summary.append(title);
 }
 for(const [family,selector,title,tier,reveal=true] of families){
  for(const card of main.querySelectorAll(selector)){
   const headings=Array.from(card.querySelectorAll(title));
   if(!headings.length)continue;
   card.setAttribute('data-heading-card',family);
   if(reveal)card.setAttribute('data-heading-entrance','');
   for(const heading of headings)heading.setAttribute('data-card-heading',tier);
  }
 }
}

// A group may own its section title and contain separately observed cards.
// Never animate a nested card's title again through the ancestor.
export function headingsForCard(card){
 return Array.from(card?.querySelectorAll?.('[data-card-heading]')||[])
  .filter(heading=>heading.closest('[data-heading-card]')===card);
}
