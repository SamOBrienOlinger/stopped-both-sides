import {escapeHTML as esc} from '../locales/translate.mjs?v=learning-language-20261120';
import {encounters, roles, roleLabels} from '../encounters/catalog.mjs?v=learning-language-20261120';
import {decodeState} from '../encounters/engine.mjs?v=learning-language-20261120';
import {topicGroups} from '../encounters/presentation.mjs?v=learning-language-20261120';
import {
 discussionQuestions, evidenceTasks, openingPerspectives, practiceGoals, reviewBackground,
 reviewExamples, reviewQuestions, reviewScene, searchFigures, termFor
} from './play-content.mjs?v=learning-language-20261120';

const topicFor = id => topicGroups.find(topic=>topic.encounters.includes(id));
const reviewOpening = (id,nodeId) => id==='garda-supervision'&&nodeId==='supervision-start';

export function scenarioCopy(id,value){
 const language=encounters[id]?.language;
 const copy=esc(value);
 return language?`<span lang="${language}" dir="ltr" data-no-translate>${copy}</span>`:copy;
}

export function practiceGoal(id){
 return scenarioCopy(id,encounters[id]?.goal||practiceGoals[id]||'');
}

export function situationStory(id,nodeId,story){
 if(!reviewOpening(id,nodeId))return '<p class="story-text">'+scenarioCopy(id,story)+'</p>';
 const rows=searchFigures.map(({group,searches,finds})=>
  '<tr><th scope="row">'+esc(group)+'</th><td>'+searches+'</td><td>'+finds+'</td><td>'+(finds/searches*100)+'%</td></tr>'
 ).join('');
 return '<p class="story-text">'+esc(reviewScene)+'</p>'+
  '<table class="search-figures"><caption>Fictional search records</caption>'+
  '<thead><tr><th scope="col">Group</th><th scope="col">Searches</th><th scope="col">Finds</th><th scope="col">Find rate</th></tr></thead>'+
  '<tbody>'+rows+'</tbody></table>'+
  '<details class="case-disclosure"><summary>Read the meeting background</summary><p class="story-text">'+esc(reviewBackground)+'</p></details>';
}

export function termsInDecision(id){
 const term=termFor(id,topicFor(id)?.id);
 if(!term)return '';
 const [name,definition]=term;
 return '<details class="case-disclosure"><summary>Terms in this decision</summary><dl><dt>'+esc(name)+'</dt><dd>'+esc(definition)+'</dd></dl></details>';
}

export function reviewExploration(id,nodeId){
 if(!reviewOpening(id,nodeId))return '';
 const examples=reviewExamples.map(([label,example,question])=>
  '<details class="case-disclosure" name="review-example"><summary>'+esc(label)+'</summary>'+
  '<p>'+esc(example)+'</p><p>'+esc(question)+'</p></details>'
 ).join('');
 return '<details class="case-disclosure review-exploration"><summary>Explore what else might help</summary>'+
  '<p>Choose one hypothetical detail to consider.</p>'+examples+'</details>';
}

const evidenceOptions = [
 ['seen','Observed'],
 ['told','Reported'],
 ['check','Still to check']
];
const evidenceReasons = {
 seen:'This detail was directly observed.',
 told:'This information was reported by someone.',
 check:'The information in the scene does not settle this question.'
};

export function evidenceCheck(id,nodeId){
 const rows=evidenceTasks[id+'/'+nodeId];
 if(!rows)return '';
 const options=evidenceOptions.map(([key,label])=>'<option value="'+key+'">'+esc(label)+'</option>').join('');
 const fields=rows.map(([statement,expected],index)=>{
  const field='evidence-fact-'+index;
  return '<div class="evidence-check-row" data-expected="'+expected+'">'+
   '<label for="'+field+'">'+esc(statement)+'</label>'+
   '<select id="'+field+'" data-evidence-select aria-describedby="'+field+'-result">'+
    '<option value="">Choose</option>'+options+
   '</select>'+
   '<div class="evidence-check-result" id="'+field+'-result" aria-live="polite">'+
    '<span data-evidence-correct hidden>'+esc(evidenceReasons[expected])+'</span>'+
    '<span data-evidence-hint hidden>Look again at where this information came from.</span>'+
   '</div>'+
  '</div>';
 }).join('');
 return '<details class="case-disclosure evidence-check"><summary>Check the facts</summary><p>How is each detail known?</p>'+fields+'</details>';
}

export function checkEvidenceResponse(event){
 const select=event.target;
 if(!select.matches?.('[data-evidence-select]'))return;
 const row=select.closest('.evidence-check-row');
 const correct=select.value===row.dataset.expected;
 row.querySelector('[data-evidence-correct]').hidden=!correct;
 row.querySelector('[data-evidence-hint]').hidden=!select.value||correct;
}

export function decisionComparison(state,stage,open=false){
 const opening=encounters[state.id].start===stage.id?openingPerspectives[state.id]:null;
 const columns=roles.map(role=>{
  const view=stage.views[role];
  const index=state.answers[role];
  const context=opening?.[role]||view.context;
  return '<section data-role-tone="'+role+'" class="decision-comparison-role">'+
    '<h3>'+esc(roleLabels[role])+'</h3>'+
    (context&&context!==stage.scene?'<p class="comparison-role-context">'+scenarioCopy(state.id,context)+'</p>':'')+
    '<p><strong>This role’s question</strong><br>'+scenarioCopy(state.id,view.prompt)+'</p>'+
    '<p><strong>Your answer</strong><br>'+
    (index===null?'No answer yet':scenarioCopy(state.id,view.choices[index].text))+'</p>'+
   '</section>';
 }).join('');
 return '<details class="case-disclosure decision-comparison" data-decision="'+state.id+'/'+stage.id+'"'+(open?' open':'')+'>'+
  '<summary>Compare this decision</summary>'+
  (opening?'':'<p class="comparison-context">'+scenarioCopy(state.id,stage.scene)+'</p>')+
  '<div class="comparison-roles">'+columns+'</div></details>';
}

export function recapPractice(id,role,answer,mode='shared'){
 const lessonTopic=topicFor(id);
 const candidates=[...(lessonTopic?.encounters||[]),...Object.keys(encounters)];
 const next=encounters[candidates.find(other=>other!==id&&(mode==='shared'||encounters[other].origin===role))];
 const start=mode==='practice'
  ? 'data-action="start" data-id="'+next.originalId+'"'
  : 'data-action="paired-start" data-id="'+next.id+'" data-role="'+role+'"';
 return '<section class="info-block recap-practice" aria-labelledby="apply-learning-title">'+
  '<h2 id="apply-learning-title">Try what you learned</h2>'+
  '<p><strong>Your answer</strong><br>'+scenarioCopy(id,answer)+'</p>'+
  '<p>What new fact would change your response?</p>'+
  '<button class="primary secondary" '+start+'><span>Try a related situation</span><span>'+esc(next.title)+'</span></button>'+
 '</section>';
}

export function discussionLink(id,role){
 return '<a class="text-button" href="#discussion/'+role+'/'+id+'">Explore and discuss this situation</a>';
}

export function discussionGuide(encounter,role){
 const questions=encounter.id==='garda-supervision'?reviewQuestions:discussionQuestions;
 const otherRole=role==='public'?'garda':'public';
 return '<div class="content-page discussion-guide">'+
  '<a class="text-button" href="#encounters/'+role+'/'+topicFor(encounter.id).id+'">Back to situations</a>'+
  '<h1>Explore and discuss this situation</h1>'+
  '<h2>'+esc(encounter.title)+'</h2>'+
  '<p class="small-note">Allow about 15 minutes.</p>'+
  '<p>'+scenarioCopy(encounter.id,encounter.description)+'</p>'+
  '<ol><li>Choose a participant. Other people can follow along as observers.</li>'+
  '<li>Pause after a decision and compare what each person had to consider.</li>'+
  '<li>Discuss these two questions together.<ul>'+questions.map(question=>'<li>'+esc(question)+'</li>').join('')+'</ul></li></ol>'+
  '<div class="action-group"><button class="primary" data-action="paired-start" data-id="'+encounter.id+'" data-role="'+role+'">Explore this situation</button>'+
  '<a class="text-button" href="#discussion/'+otherRole+'/'+encounter.id+'">'+
  (role==='garda'?'Switch to the public perspective':'Switch to the Garda perspective')+'</a></div>'+
  '<p class="small-note"><span>Starting role</span> · <span>'+esc(roleLabels[role])+'</span></p>'+
 '</div>';
}

export function progressSkills(progress){
 const practised=new Set(Object.entries(progress.records)
  .filter(([,record])=>Object.keys(record.decisions).length)
  .map(([key])=>key.split('/')[0]));
 if(!practised.size)return '';
 const compared=progress.saved.some(entry=>{
  if(entry.mode!=='shared')return false;
  const run=decodeState(entry.token);
  return run&&[run.answers,...run.history.map(step=>step.answers)].some(answer=>answer.public!==null&&answer.garda!==null);
 });
 return '<section class="info-block progress-skills"><h2>What you have practised</h2><ul>'+
  [...practised].map(id=>'<li>'+practiceGoal(id)+'</li>').join('')+
  (compared?'<li>Answered from both perspectives at the same decision</li>':'')+
 '</ul></section>';
}
