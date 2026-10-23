// Shared About-page content. The existing reading tools translate complete text
// nodes; publication metadata deliberately retains its original language.
const external = (url, label) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const study = (number, label, doi) => `<a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer" lang="en-IE" dir="ltr" data-no-translate>${label} [${number}]</a>`;

const goals = [
 ['01', 'Explore rights and support', 'Identify what needs clarification and find relevant Irish information sources.'],
 ['02', 'Examine the evidence', 'Separate what the situation states from assumptions about intention, guilt or risk.'],
 ['03', 'Compare perspectives', 'Consider what each person knows, what concerns them and how their responsibilities differ.'],
 ['04', 'Reflect and apply', 'Explain your decision, respond to new information and practise using a principle in another situation.']
];

const examples = [
 {
  title:'Practise decisions in context',
  scene:'“A hunch on the street” asks you to examine observed behaviour and its interpretation.',
  activity:'Separate the scene into “What I know” and “What I am assuming”. Suggest another explanation and identify what you would need to check.',
  evidence:'A meta-analysis found learning benefits from educational games. Benefits associated with group work, repeated sessions and additional instruction support a wider teaching activity; they do not prove that any one feature causes improvement.',
  sources:study(1,'Wouters et al. (2013)','10.1037/a0031311')
 },
 {
  title:'Learn through explanations',
  scene:'“When the facts change” introduces a correction before a proposed search begins.',
  activity:'Explain the basis of the initial decision, identify what the new information changes and write a revised decision.',
  evidence:'In two experiments using written material, explanatory feedback helped learners answer new inference questions. This supports explaining why an answer is appropriate, while leaving this game’s effects to be tested.',
  sources:study(2,'Butler, Godbole & Marsh (2013)','10.1037/a0031026')
 },
 {
  title:'Compare perspectives and check assumptions',
  scene:'You can switch roles while keeping the shared situation and each role’s answers.',
  activity:'Identify what each person knows, what remains unknown and a question that would check an assumption. Compare their powers and responsibilities as well as their concerns.',
  evidence:'Perspective-taking improved particular measures of interracial evaluation and interaction in Todd and colleagues’ experiments. Eyal and colleagues found that imagining another viewpoint did not consistently improve accuracy; asking and listening helped. These studies assess different outcomes, and changing an avatar is not evidence of lasting bias reduction.',
  sources:study(3,'Todd et al. (2011)','10.1037/a0022308')+' · '+study(4,'Eyal, Steffel & Epley (2018)','10.1037/pspa0000115')
 },
 {
  title:'Reflect on your decisions',
  scene:'The recap brings together your choices, explanations and sources.',
  activity:'Discuss what influenced your first choice, which assumption became clearer, what changed when you switched roles, which rights remained the same and what principle you would carry into another situation.',
  evidence:'A meta-analysis of 61 studies found benefits from after-action reviews, or debriefs. Effectiveness depended on the design and context. Reviewing actual decisions gives reflection a concrete starting point.',
  sources:study(5,'Keiser & Arthur (2021)','10.1037/apl0000821')
 },
 {
  title:'Recall and apply a principle',
  scene:'Replay a situation or explore a related one, such as moving from “A hunch on the street” to “Matches the description”.',
  activity:'Before reopening the feedback, explain what information would justify a decision. Apply the principle to an unfamiliar case; return later to see what you remember.',
  evidence:'Four experiments found better retention and transfer after retrieval practice than repeated study of written material. Repeatedly clicking a familiar answer does not independently show understanding. A return session after a week or two is a proposed pilot choice, not a tested optimum for this game.',
  sources:study(6,'Butler (2010)','10.1037/a0019902')
 },
 {
  title:'Communicate clearly and respectfully',
  scene:'“When behaviour is misread” examines interpretations of slow responses, looking down and requests for repetition.',
  activity:'Draft an explanation that states the purpose of an exchange, gives the person an opportunity to speak and checks understanding. Identify when more information or support is needed.',
  evidence:'A randomised US study of an intensive five-day procedural-justice programme, including scenarios and roleplay, found improved observed conduct but no significant improvement in residents’ overall assessments of police legitimacy. The whole programme was evaluated; its results cannot be attributed to roleplay alone or to a brief game.',
  sources:study(7,'Weisburd et al. (2022)','10.1073/pnas.2118780119')
 }
];

const stages = [
 ['5 minutes','Orient','Introduce one learning question and collect an initial response to a short vignette.'],
 ['8 minutes','Explore','Play a selected situation and note the reasons for key choices.'],
 ['8 minutes','Compare','Examine the other role’s information, concerns, powers and responsibilities.'],
 ['7 minutes','Examine','Read the explanations and inspect one or two supporting sources.'],
 ['10 minutes','Reflect','Use the recap to discuss assumptions, revised decisions and communication.'],
 ['7 minutes','Apply','Explain a response to an unfamiliar vignette addressing the same principle.']
];

const outcomes = [
 ['Identify rights and sources of support','Recognise what needs clarification and locate an appropriate Irish source.','Explain a short case response and cite a relevant source.'],
 ['Distinguish observation from assumption','Separate supplied facts from interpretations about intention, guilt or risk.','Annotate a new vignette with facts, inferences and missing information.'],
 ['Explain a decision using evidence','Connect a proposed response to relevant facts and principles.','Give a brief written or spoken justification.'],
 ['Compare perspectives accurately','Describe differences in knowledge, concerns, powers and responsibilities.','Compare both roles without assuming equal authority or blame.'],
 ['Revise a judgement','Identify new information that matters and explain its effect on a proposed action.','Reconsider a staged case after an additional fact is introduced.'],
 ['Recognise unsupported generalisations','Identify when identity, reputation, appearance or colleague confidence replaces relevant individual information.','Explain an assumption and formulate a question to check it.'],
 ['Communicate clearly and respectfully','Explain the situation, acknowledge uncertainty and check understanding.','Offer a short dialogue, written response or facilitated roleplay.'],
 ['Evaluate learning and fairness claims','Explain why a game score or limited statistics cannot establish broader effects.','Interpret fictional results and identify what evidence is still needed.']
];

const references = [
 ['Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013).','A meta-analysis of the cognitive and motivational effects of serious games.','Journal of Educational Psychology, 105(2), 249–265.','10.1037/a0031311','https://consensus.app/papers/a-metaanalysis-of-the-cognitive-and-motivational-effects-wouters-nimwegen/5629de92b02e5af8b30fdb4dfa985a19/','https://research.tue.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri/'],
 ['Butler, A. C., Godbole, N., & Marsh, E. J. (2013).','Explanation Feedback Is Better Than Correct Answer Feedback for Promoting Transfer of Learning.','Journal of Educational Psychology, 105(2), 290–298.','10.1037/a0031026','https://consensus.app/papers/explanation-feedback-is-better-than-correct-answer-butler-godbole/779248c1c5ec5f9c929ef2d41155e9b6/','https://profiles.wustl.edu/en/publications/explanation-feedback-is-better-than-correct-answer-feedback-for-p/'],
 ['Todd, A. R., Bodenhausen, G. V., Richeson, J. A., & Galinsky, A. D. (2011).','Perspective taking combats automatic expressions of racial bias.','Journal of Personality and Social Psychology, 100(6), 1027–1042.','10.1037/a0022308','https://consensus.app/papers/perspective-taking-combats-automatic-expressions-of-todd-bodenhausen/876fb609f43f5b50b0b74cd260617679/','https://groups.psych.northwestern.edu/spcl/documents/JPSP_inpressTodd.pdf'],
 ['Eyal, T., Steffel, M., & Epley, N. (2018).','Perspective Mistaking: Accurately Understanding the Mind of Another Requires Getting Perspective, Not Taking Perspective.','Journal of Personality and Social Psychology, 114(4), 547–571.','10.1037/pspa0000115','https://consensus.app/papers/perspective-mistaking-accurately-understanding-the-mind-eyal-steffel/6f2031106e785ee9b3748a702bbb0a24/','https://www.nicholasepley.com/publications'],
 ['Keiser, N. L., & Arthur, W., Jr. (2021; online 2020).','A meta-analysis of the effectiveness of the after-action review (or debrief) and factors that influence its effectiveness.','Journal of Applied Psychology, 106(7), 1007–1032.','10.1037/apl0000821','https://consensus.app/papers/a-metaanalysis-of-the-effectiveness-of-the-afteraction-keiser-arthur/1cb95961ce3759b98291f0e1875847d0/','https://pubmed.ncbi.nlm.nih.gov/32852990/'],
 ['Butler, A. C. (2010).','Repeated testing produces superior transfer of learning relative to repeated studying.','Journal of Experimental Psychology: Learning, Memory, and Cognition, 36(5), 1118–1133.','10.1037/a0019902','https://consensus.app/papers/repeated-testing-produces-superior-transfer-of-learning-butler/a2891bb1b6dc5e3c93866dfd06291350/','https://pubmed.ncbi.nlm.nih.gov/20804289/'],
 ['Weisburd, D., Telep, C. W., Vovak, H., Zastrow, T., Braga, A. A., & Turchan, B. (2022).','Reforming the police through procedural justice training: A multicity randomized trial at crime hot spots.','Proceedings of the National Academy of Sciences, 119(14), e2118780119.','10.1073/pnas.2118780119','https://consensus.app/papers/reforming-the-police-through-procedural-justice-training-weisburd-telep/53c62e9c40d35d41997321b8432aa996/','https://crimejusticelab.org/wp-content/uploads/2022/04/Procedural-Justice-Police.pdf'],
 ['Hilliard, L. J., Buckingham, M. H., Geldhof, G. J., et al. (2018).','Perspective taking and decision-making in educational game play: A mixed-methods study.','Applied Developmental Science, 22(1), 1–13.','10.1080/10888691.2016.1204918','https://consensus.app/papers/perspective-taking-and-decisionmaking-in-educational-hilliard-buckingham/5d99c756eccb5453859eeb661504defe/','https://sites.bc.edu/devtech/wp-content/uploads/sites/181/2018/02/gameplay.pdf']
];

function panel(number, title, subtitle, content) {
 return `<details class="learning-panel"><summary><span class="learning-panel-number" aria-hidden="true">${number}</span><span class="learning-panel-label"><span class="learning-panel-title">${title}</span><span class="learning-panel-subtitle">${subtitle}</span></span><span class="learning-toggle" aria-hidden="true"></span></summary><div class="learning-panel-body">${content}</div></details>`;
}

export function learningAbout() {
 return `<section class="learning-section" aria-labelledby="learning-heading">
  <div class="learning-intro"><p class="eyebrow">EDUCATIONAL APPROACH</p><h2 id="learning-heading">Learning through choices</h2><p class="learning-lead">Practise decisions. Understand the reasons.</p><p>Explore rights, responsibilities and Garda decision-making through fictional encounters. Make a choice, read the explanation, compare perspectives and reconsider your response.</p><p class="learning-status"><strong>Research-informed educational prototype</strong><span>These are intended learning outcomes. The learning effects of this particular resource remain to be evaluated.</span></p></div>
  <div class="learning-goals">${goals.map(([number,title,description])=>`<div class="learning-goal"><span class="learning-goal-number" aria-hidden="true">${number}</span><h3>${title}</h3><p>${description}</p></div>`).join('')}</div>
  <div class="learning-cycle"><h3>In the game</h3><p>Read a situation, choose a response, explore the explanation and continue. You can switch perspectives, try another answer and revisit the decisions in your recap.</p></div>
  <div class="learning-context"><div><h3>Different perspectives, different responsibilities</h3><p>Considering both sides does not imply equal powers, equal responsibility or equal blame. A member of the public is not responsible for another person’s misconduct. Rights never depend on a game score.</p></div><div><h3>Using the game for learning</h3><p>The game provides choices, explanations, sources and replay. The workshops, learner-written reflections and assessments below are suggested ways to use it.</p></div></div>
  <div class="learning-panels">
   ${panel('01','Research and teaching examples','Six ways to connect play with learning',`
    <p>These situations and features already exist in the game. The accompanying exercises are optional activities for independent reflection or facilitated learning.</p>
    <div class="learning-examples">${examples.map(example=>`<article class="learning-example"><h3>${example.title}</h3><p class="learning-scene">${example.scene}</p><h4>Try this</h4><p>${example.activity}</p><div class="learning-evidence"><h4>Research connection</h4><p>${example.evidence}</p><p class="learning-citations">${example.sources}</p></div></article>`).join('')}</div>
    <h3>Related educational projects</h3>
    <p>PLUS, a Bournemouth University and Dorset Police project, uses simulated stop-and-search situations and roleplay. Its official description is a useful design comparator; it does not by itself establish measured effectiveness.</p><p>${external('https://www.bournemouth.ac.uk/research/projects/plus-project-serious-games-police-training','Explore the PLUS project')}</p>
    <p>In a study of Quandary with 131 middle-school students, qualitative responses showed greater depth, while short-term quantitative measures did not show gains in perspective-taking, empathy or helping behaviour. Findings from another game, age group or policing jurisdiction cannot establish this resource’s effectiveness.</p><p class="learning-citations">${study(8,'Hilliard et al. (2018)','10.1080/10888691.2016.1204918')}</p>
   `)}
   ${panel('02','An optional 45-minute workshop','Orient, explore, compare, examine, reflect, apply',`
    <p>Suggested timings for a pilot session using selected situations, discussion and an unfamiliar case. This is an illustrative plan, not an established optimal duration.</p>
    <ol class="learning-stages">${stages.map(([time,title,description])=>`<li><span class="learning-time">${time}</span><div><h3>${title}</h3><p>${description}</p></div></li>`).join('')}</ol>
    <h3>Facilitate thoughtful discussion</h3><ul class="learning-principles">
     <li>Choose a specific learning objective. Ask for reasons before feedback and for a revised explanation afterwards.</li>
     <li>Distinguish shared facts, information known only to one role and what remains unknown. Invite questions about whether the source supports an explanation.</li>
     <li>Offer discussion, writing, observation or individual work. Use the language and reading controls. Participation should not require disclosure of personal encounters.</li>
     <li>Use fictional or appropriately anonymised examples and make room for disagreement supported by law and evidence. This activity should not be used as a staff appraisal.</li>
    </ul>
    <h3>Ground the learning in Irish sources</h3><p>The published Garda Decision Making Model connects gathering information, considering options, justifying choices and reviewing action with human rights and ethics. This educational interpretation does not imply official approval.</p><p>${external('https://www.garda.ie/en/about-us/publications/policy-documents/garda-decision-making-model.pdf','Read the Garda Decision Making Model (PDF)')}</p>
    <p>The INAR/ICCL community and rights report combines desk research with participatory workshops and other engagement. It offers a reference point for proposed community input and independent legal review; it does not establish that this game has been co-designed or endorsed.</p><p>${external('https://inar.ie/wp-content/uploads/2024/04/1.-POLICING-AND-RACIAL-DISCRIMINATION-1.pdf','Read the community and rights report (PDF)')}</p>
   `)}
   ${panel('03','Intended learning outcomes','Eight objectives and ways to demonstrate them',`
    <p>These are assessment targets for selected situations and associated reflection activities. The website records choices and scores; written explanations, observed communication and independent assessments require an accompanying activity.</p>
    <ol class="learning-outcomes">${outcomes.map(([title,description,assessment])=>`<li><h3>${title}</h3><p>${description}</p><p class="learning-assessment"><strong>Possible assessment</strong><span>${assessment}</span></p></li>`).join('')}</ol>
    <p class="learning-note">“What the numbers leave out” provides a data-literacy example using clearly labelled synthetic stop-and-search data. Learners examine what statistics and better quiz answers can establish about fairness or bias. No real incident records are used.</p>
   `)}
   ${panel('04','Evaluating the learning','Understanding, transfer and retention',`
    <p>A proposed evaluation would examine whether learners can explain and apply relevant principles in unfamiliar fictional encounters, and whether those improvements last.</p>
    <h3>Assess reasoning over time</h3><p>Use a short baseline task, a different but comparable case immediately afterwards and a delayed follow-up. Ask learners to explain their answers. A rubric could assess relevant facts, assumptions, rights, uncertainty, justification and appropriate revision. Assessors could score responses without knowing whether they came before or after the activity.</p>
    <h3>Make a meaningful comparison</h3><p>Where feasible, compare the game with reading material containing the same information and similar learning time. Random allocation could strengthen the comparison. A later study could examine role-switching separately. Report public and Garda learners’ results separately where the sample permits.</p>
    <h3>Keep different outcomes distinct</h3><dl class="learning-levels">
     <div><dt>Participation and usability</dt><dd>Completion, clear instructions, navigation and access barriers.</dd></div>
     <div><dt>Learning</dt><dd>Better explanations and decisions on independently assessed cases.</dd></div>
     <div><dt>Retention and transfer</dt><dd>Application to unfamiliar cases after a delay.</dd></div>
     <div><dt>Attitudes or empathy</dt><dd>Appropriate measures designed for those constructs, interpreted cautiously.</dd></div>
     <div><dt>Practice and community experience</dt><dd>Separate, appropriately governed evaluation involving observed conduct and people’s experiences.</dd></div>
    </dl><p>Collect feedback on unclear wording, misleading assumptions and accessibility. Community review should help assess how situations represent relevant concerns and experiences.</p>
    <p class="learning-note">The points system supports learning progress. It has not been validated as a measure of personal bias, professional competence or real-world conduct.</p>
   `)}
   ${panel('05','Research references','Eight studies, with original sources and Consensus records',`
    <p>Studies were identified through Consensus and checked against original papers or publisher, author and university records. This focused review was completed on 23 October 2026. Full text was not available or reviewed for every study; some findings were checked through primary abstracts and bibliographic records.</p>
    <ol class="learning-references" role="list">${references.map(([authors,title,journal,doi,consensus,primary],index)=>`<li><span class="learning-reference-number" dir="ltr">${index+1}</span><div class="learning-reference-entry"><div lang="en-IE" dir="ltr" data-no-translate><p>${authors}</p><h3>${title}</h3><p>${journal}</p></div><div class="learning-reference-links">${external('https://doi.org/'+doi,'DOI')} ${external(consensus,'Consensus record')} ${external(primary,'Original source')}</div></div></li>`).join('')}</ol>
    <p>This review complements the scenario evidence library and the separate content-review record.</p><p>${external('https://github.com/SamOBrienOlinger/stopped-both-sides/blob/main/README.md#educational-approach-methodology-and-learning-outcomes','Read the full educational methodology in the README')}</p>
   `)}
  </div>
 </section>`;
}
