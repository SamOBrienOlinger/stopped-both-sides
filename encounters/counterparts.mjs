const choice=(text,feedback,review=false,next)=>({text,feedback,review,...(next?{next}:{})});
const pair=(scene,prompt,lesson,choices,refs=[])=>({scene,prompt,lesson,choices,refs});

// Shared scenes are authored in the third person. They stay identical on a role switch.
// Private thoughts are given to the learner, never presented as information Gardaí possess.
export const counterparts={
 'public-street':{
  'street-start':pair('Alex, 24, is walking home after a late shift. A Garda stops beside Alex and asks where Alex is going. No suspected offence or requirement to remain has been explained.',
   'As the Garda, how would you make the status of the enquiry clear?',
   'Explain the purpose and whether the person is free to leave. General enquiries do not create a detention power, and willingness to talk should not be confused with guilt or innocence.',[
    choice('Clarify that this is a voluntary enquiry and explain its purpose.','This helps Alex decide whether to speak without implying an obligation that has not been established.',false,'street-status'),
    choice('Let Alex assume that every question must be answered.','Ambiguity can turn an apparently voluntary conversation into felt compulsion. Clarify the position.',true,'street-voluntary')],['garda:ethics']),
  'street-status':pair('The Garda explains that this is a general enquiry and Alex is not detained. The exercise now asks what could make a different request compulsory.',
   'What must you check before making an identification demand?',
   'Identify the relevant power and whether its actual conditions are met. A uniform or general wish for information is not a substitute.',[
    choice('The specific legal power and facts supporting its use.','You keep a voluntary request separate from a statutory demand.'),
    choice('Whether Alex seems reluctant to help.','Reluctance alone does not supply the conditions of an identification power.',true)],['garda:ethics']),
  'street-voluntary':pair('Alex has answered some questions. The Garda confirms Alex is free to leave and asks whether Alex will attend the station to help with general enquiries.',
   'How should you explain the invitation?',
   'Voluntary attendance should be explained as voluntary. The setting alone does not confer a detention power or remove the person’s ability to seek advice.',[
    choice('Explain the purpose, voluntary status and ability to seek legal advice.','Alex can consider the invitation with a clearer understanding of the position.'),
    choice('Suggest that entering a station means Alex cannot leave.','That treats the building as a detention power. A restriction needs its own lawful basis.',true)],['garda:ethics']),
  'street-details':pair('Separate variation: the Garda says there is reasonable cause to suspect Alex used threatening behaviour under section 6 of the Public Order Act and demands a name and address under section 24. Alex disputes the allegation. Whether the statutory conditions are met matters.',
   'What should you keep separate when explaining this demand?',
   'A lawful identification demand and proof of the alleged conduct are different questions. Explain the power and grounds accurately; do not present compliance as a confession.',[
    choice('Check and explain the statutory basis; distinguish details from admitting the allegation.','This preserves both the legal requirement, where applicable, and Alex’s ability to dispute the allegation.'),
    choice('Treat giving a name as an admission to threatening behaviour.','Accurate identifying details do not establish that the alleged conduct occurred.',true)],['garda:ethics']),
  'street-end':pair('The encounter has ended and Alex has been told they can go. Alex still feels unsettled about the treatment and is considering what to do afterwards.',
   'As the Garda, what supports accountability after the encounter?',
   'Ending contact does not settle a concern about its basis or treatment. Preserve an accurate account and support access to the appropriate information and complaints process.',[
    choice('Record the relevant facts accurately and give clear information if concerns are raised.','This allows later review without predetermining the result.'),
    choice('Say that release rules out a complaint.','A concern about treatment can remain after someone is free to leave.',true)],['garda:ethics'])
 },
 'public-search':{
  'search-start':pair('Niamh, 29, is waiting for a bus. A Garda says they want to search Niamh’s bag. No reason or legal power has yet been explained.',
   'As the Garda, what should come before proceeding?',
   'Identify and assess the actual basis for the proposed search, then explain it. A request for consent and a statutory search are not interchangeable.',[
    choice('Check the grounds and legal power, and explain them to Niamh.','The explanation should describe a basis that exists, not create one after the decision.'),
    choice('Treat opening the bag under pressure as proof that the search is voluntary.','Apparent compliance does not answer whether consent is valid or a statutory basis exists.',true)],['garda:ethics','garda:drugs']),
  'search-power':pair('The Garda gives a reason for suspecting unlawful possession of a controlled drug and invokes section 23. Niamh disputes the suspicion. This scene does not provide enough detail to independently determine whether the asserted grounds are sufficient.',
   'What must you assess beyond naming section 23?',
   'The reasonable-cause requirement and limits of the power must actually be met. Stating a section number does not establish the facts or decide a later challenge.',[
    choice('The quality of the information and whether the statutory conditions are met.','You assess the basis of the decision, rather than relying on the label.'),
    choice('Only whether you have said the name of the Act aloud.','Naming a power does not demonstrate its lawful application.',true)],['garda:model']),
  'search-disagree':pair('The Garda says the search will proceed under section 23. Niamh feels anxious and wants to object. The exercise asks about responding to disagreement; it does not independently establish the disputed search’s lawfulness.',
   'How should you respond to a verbal objection?',
   'Distinguish disagreement from physical obstruction. Keep assessing the legal basis and explain the process without using an objection as a fresh ground for suspicion.',[
    choice('Listen, explain the asserted grounds and distinguish an objection from obstruction.','The person’s objection does not remove your responsibility to act lawfully and respectfully.'),
    choice('Treat any question about the search as an offence in itself.','A question or verbal objection is not automatically obstruction of a lawful search.',true)],['garda:ethics']),
  'search-end':pair('No controlled drug is found in the fictional search. Niamh is told they can leave and wants the justification and treatment assessed.',
   'What should your account allow a reviewer to examine?',
   'The information and legal basis at the time, the conduct of the search and what happened afterwards all matter. The result alone cannot settle lawfulness.',[
    choice('Record the grounds, timing, actions and result accurately.','This supports review of the actual decision and treatment.'),
    choice('Add stronger grounds afterwards because nothing was found.','Retrofitting grounds misrepresents what was known at the time.',true)],['garda:ethics','garda:model'])
 },
 'public-arrest':{
  'arrest-start':pair('Daniel, 32, is told by a Garda that Daniel is under arrest in connection with a shop incident. Daniel believes there has been a mistaken identification. The exercise does not stipulate that the allegation is correct.',
   'What should guide your explanation and reassessment?',
   'Explain the reason for arrest, facilitate legal assistance and assess information that may undermine the identification. Arrest does not establish guilt.',[
    choice('Explain the reason, address the request for advice and check relevant identification information.','You keep the allegation open to examination rather than treating the arrest as proof.'),
    choice('Dismiss a possible identification error because the arrest has already been announced.','An earlier commitment does not make contrary information irrelevant.',true)],['garda:model','garda:nickerson']),
  'arrest-lawyer':pair('At the station, Daniel is asked about the incident before an interview. Daniel privately worries that requesting a solicitor might look guilty. That worry is information for the learner, not a fact the Garda can assume.',
   'How should you explain access to a solicitor?',
   'Facilitate confidential advice and explain the relevant interview safeguards. Asking for a solicitor is the exercise of a right, not an admission.',[
    choice('Explain access to confidential advice and solicitor attendance without adverse insinuations.','Daniel can make an informed choice about legal assistance.',false,'arrest-silence'),
    choice('Suggest that declining advice guarantees an earlier release.','That promise is unsupported and can pressure a person to forgo advice. The next scene offers a chance to reconsider.',true,'arrest-reconsider')],['garda:ethics']),
  'arrest-reconsider':pair('Daniel initially declined advice but now feels unsure before the interview. The question is how to handle a renewed request for a solicitor.',
   'What would you do if Daniel now asks for advice?',
   'Do not treat an earlier refusal as permanently closing access. Respond to the current request and apply the relevant safeguards.',[
    choice('Recognise the renewed request and arrange access under the applicable safeguards.','An earlier decision does not prevent Daniel from asking again.'),
    choice('Say the first refusal is final.','That incorrectly presents access as a one-time offer.',true)],['garda:ethics']),
  'arrest-silence':pair('Daniel is consulting a solicitor privately about silence and any applicable warning. The Garda is not part of that confidential conversation. Each role now reflects on its own responsibilities.',
   'From outside the consultation, what is your responsibility as the Garda?',
   'Respect confidential legal advice and use the applicable cautions and procedures accurately. Do not equate consulting a solicitor or exercising a right with admitting guilt.',[
    choice('Respect the private consultation and ensure any applicable warning and safeguards are addressed.','This supports an informed decision without intruding on legal advice.'),
    choice('Insist on hearing the advice so you can decide whether Daniel should follow it.','Independent confidential advice is not subject to the interviewer’s approval.',true)],['public:dpp','garda:ethics']),
  'arrest-time':pair('Daniel has spent several hours at the station and wants the detention time explained. No specific detention power or extension has been supplied in this exercise.',
   'What must guide your explanation of the time limit?',
   'Use the actual detention power, lawful extensions and applicable time calculation. Do not substitute a universal number or suggest unlimited detention.',[
    choice('Check the applicable authority and record, and explain the calculation and safeguards.','This answers the question for this detention rather than another case.'),
    choice('Use one remembered time limit for every detention.','Different powers and circumstances require their own checks.',true)],['garda:model'])
 },
 'public-custody':{
  'custody-start':pair('Maya, 34, understands everyday English but is struggling with a legal explanation at the station. Maya is worried about agreeing to something without understanding it.',
   'What should you check before treating apparent agreement as understanding?',
   'Everyday conversational English does not establish understanding of legal language. Identify the required interpretation and communication support.',[
    choice('Check understanding and arrange the interpretation support needed.','Support should come before consequential decisions based on apparent agreement.'),
    choice('Rely on nodding or everyday fluency as proof that everything is understood.','Those observations can conceal a need for support.',true)],['garda:ethics']),
  'custody-lawyer':pair('Maya wants a solicitor, does not know one and is worried about the cost. Eligibility and arrangements for legal assistance have not been discussed.',
   'How can you make access understandable?',
   'Explain how to request a solicitor and the relevant assistance arrangements, including eligibility. Do not assume that unfamiliarity or cost concerns mean advice is unwanted.',[
    choice('Explain the available arrangements and how eligibility is assessed.','Maya can ask for advice without having to guess how access works.'),
    choice('Treat not knowing a solicitor as a decision to proceed without one.','Lack of a contact is not a refusal of legal assistance.',true)],['garda:ethics']),
  'custody-health':pair('Maya is due prescribed medication and is beginning to feel unwell. Maya has not yet told custody staff. The learner knows this; the Garda must not be assumed to know undisclosed medical details.',
   'What can you do without guessing a diagnosis or prescription?',
   'Make it possible to raise welfare needs, take concerns seriously and arrange appropriate medical attention. Custody staff should not substitute assumptions for clinical assessment.',[
    choice('Ask about welfare needs, explain how to request help and arrange medical attention when needed.','This creates a route for Maya to disclose the concern and obtain appropriate support.'),
    choice('Assume silence means there can be no health concern until after the interview.','A person may not understand how or when to ask for help.',true)],['garda:ethics']),
  'custody-contact':pair('Maya’s sister is expecting Maya home. Maya wants the sister told that Maya is detained and which station is involved.',
   'What distinction should your explanation make?',
   'Explain the right to have someone informed and the arrangements that apply. This differs from unrestricted personal phone use.',[
    choice('Explain and facilitate notification under the applicable arrangements.','You address the purpose of the request and make the process clear.'),
    choice('Reject all notification because unlimited phone access is not available.','The absence of unrestricted phone use does not answer the separate notification request.',true)],['garda:ethics'])
 },
 'public-young-person':{
  'youth-start':pair('Jamie is 16 and has been arrested and brought to a station. Jamie is embarrassed and is thinking about claiming to be 18. This private thought is not information available to the Garda.',
   'What should you do about age and understanding?',
   'Establish and record age carefully and apply the relevant child safeguards. Appearance or apparent confidence must not replace known information.',[
    choice('Clarify age and understanding and arrange the safeguards that apply to a child.','This keeps the process tied to Jamie’s actual circumstances.'),
    choice('Treat a tall or confident young person as an adult without checking.','Appearance is not a reliable replacement for age information.',true)],['garda:goff','garda:ethics']),
  'youth-adult':pair('An interview with 16-year-old Jamie is planned. A parent has not arrived and no other adult has been arranged. No urgent exception is stated in this exercise.',
   'What must happen before treating the interview as ready to proceed?',
   'Check the Children Act safeguards, the appropriate adult arrangements and legal assistance. Any exception requires its actual conditions and authorisation; it cannot be presumed from convenience.',[
    choice('Arrange the required safeguards and check whether any specific lawful exception actually applies.','The absence of an adult requires attention before the interview, not an assumption that it does not matter.'),
    choice('Proceed because waiting would disrupt the schedule.','Scheduling convenience is not itself a statutory exception.',true)],['garda:ethics']),
  'youth-solicitor':pair('Jamie’s parent has arrived and wants to help. Jamie still wants independent legal advice about the allegation.',
   'How should you treat the request for a solicitor?',
   'A supporting adult and a solicitor have different roles. Adult presence does not replace independent legal advice or remove the relevant interview safeguards.',[
    choice('Address the solicitor request alongside the parent’s supporting role.','Both safeguards have purposes that should remain distinct.'),
    choice('Tell Jamie that a parent’s presence makes a solicitor unnecessary.','That improperly treats support and independent legal advice as interchangeable.',true)],['garda:ethics']),
  'youth-understand':pair('Jamie is asked to sign a written account and notices a sentence that does not express what Jamie meant.',
   'What should you do when Jamie queries the wording?',
   'Make room to read, understand and correct an account, with appropriate support and advice. A signature is not a shortcut around an accuracy concern.',[
    choice('Pause, check the disputed wording and facilitate clarification, correction and advice.','The account should accurately reflect what Jamie means.'),
    choice('Ask for a signature now and promise that any misunderstanding can always be fixed later.','That pressures the child to endorse disputed wording.',true)],['garda:ethics'])
 },
 'public-fair-treatment':{
  'fair-start':pair('Amina, a Black Irish woman, has been questioned while other people nearby were not approached. Amina is free to leave and feels singled out. This brief account does not by itself determine the cause or lawfulness of the encounter.',
   'As the Garda reviewing the contact, what deserves examination?',
   'Take a concern about selection and treatment seriously. Examine the actual grounds and conduct without presuming either that a concern proves discrimination or that no arrest means there is nothing to review.',[
    choice('Review the selection, grounds and treatment and listen to the concern.','You keep accountability open while examining the evidence.'),
    choice('Dismiss the concern because Amina was allowed to leave.','Release does not settle questions about the earlier contact.',true)],['garda:ethics','garda:inar']),
  'fair-record':pair('Amina is now somewhere safe and is making a personal note. Amina does not know the Garda’s name. The Garda separately considers the official record; neither role sees the other’s private notes.',
   'What should your own account preserve?',
   'Record what happened and the basis for decisions accurately under applicable procedures. Separate observations from interpretations and avoid later embellishment.',[
    choice('The relevant times, words, grounds and actions, with uncertainty identified.','A clear factual sequence supports later scrutiny.'),
    choice('An improved explanation that omits uncertainty and inconvenient details.','A polished reconstruction can hide what was actually known.',true)],['garda:ethics','garda:model']),
  'fair-route':pair('Amina finds iReport and Fiosrú and is considering their different purposes. The Garda considers how to respond if asked about a concern.',
   'What information would be accurate and helpful?',
   'Fiosrú deals with complaints about Garda conduct; iReport has a separate racism-reporting purpose. Do not represent one as automatically submitting a report to the other.',[
    choice('Explain the distinct routes and direct the person to the current official information.','Clear signposting supports an informed choice without promising an outcome.'),
    choice('Say using iReport automatically creates a formal Fiosrú complaint.','The two systems do different things; that assurance would be misleading.',true)],['garda:ethics']),
  'fair-deadline':pair('Several months have passed since the encounter. Amina is now considering a formal complaint. The exercise asks both roles about accurate information on timing.',
   'What would you say if asked whether it is too late?',
   'Use Fiosrú’s current rules. The normal limit is 12 months; it may accept a later complaint for a good reason. Do not decide admissibility on its behalf.',[
    choice('Point to the current time-limit information and let Fiosrú assess any delay.','This gives the person a reliable route without making an unsupported determination.'),
    choice('Say that waiting several months automatically removes the ability to complain.','That does not reflect the stated normal limit or the possibility of accepted reasons for delay.',true)],['garda:ethics'])
 },
 'garda-street':{
  'street-start':pair('Alex, 24, stands beside a closed shop looking at a phone and looks away as a patrol Garda approaches. A briefing mentioned thefts but supplied no relevant description. There is no immediate threat or specific link to an offence.',
   'As Alex, what could help you understand the contact?',
   'You can ask the purpose of the enquiry and whether you are free to leave. Looking away or being near a closed shop does not itself establish a legal obligation to stay.',[
    choice('Ask why the Garda is approaching and whether you have to stay.','This seeks clarity about the purpose and status of the encounter.',false,'street-reset'),
    choice('Assume you must account for your whole evening whenever a Garda approaches.','Some questions are voluntary; a particular legal power can change that. Clarify the position.',true,'street-enquiry')],['public:questioning']),
  'street-reset':pair('Alex asks, “Do I have to stay?” The Garda has not identified a power requiring Alex to remain and recognises that the earlier wording sounded compulsory.',
   'What distinction would you want clarified?',
   'Ask about the present legal status rather than treating earlier ambiguous language as a complete answer.',[
    choice('Ask whether this is voluntary and whether you are free to leave now.','This focuses the conversation on a clear answer about the present position.'),
    choice('Assume you are under arrest solely because the earlier wording sounded firm.','The wording needs clarification; it does not by itself establish an arrest.',true)],['public:questioning']),
  'street-enquiry':pair('The Garda says the enquiry is voluntary and Alex is free to leave. Alex declines to discuss the evening and starts walking away. No other fact has changed.',
   'What does declining this voluntary conversation mean?',
   'Declining a voluntary enquiry is different from refusing a valid statutory demand. This scene supplies no new ground for detention.',[
    choice('You can decline this voluntary discussion; a different lawful demand would need its own basis.','You distinguish the current facts from a setting with a legal requirement.'),
    choice('Declining automatically proves that you have something unlawful to hide.','Exercising a choice in a voluntary enquiry is not an admission of wrongdoing.',true)],['public:questioning']),
  'street-information':pair('The shop’s cleaner explains that Alex is waiting to collect a bicycle after a shift. The explanation fits what can be seen. Nothing links Alex to a specific offence.',
   'How should you understand this new information?',
   'An alternative explanation may clarify the encounter. You do not have to prove every detail of your life merely to overcome an unsupported assumption.',[
    choice('Recognise the explanation and ask whether any further lawful requirement applies.','The present status and actual grounds remain the relevant questions.'),
    choice('Assume you must prove every part of the evening before being allowed to leave.','No such general requirement has been established on these facts.',true)],['public:questioning']),
  'street-identity':pair('Compare two versions: Alex is Black Irish in one and White Irish in the other. Age, clothing, location, behaviour and available information are identical. Neither identity comes from a relevant suspect description.',
   'What should remain the same from Alex’s perspective?',
   'Legal standards and entitlement to fair treatment should not shift because of an irrelevant identity cue. This comparison is a learning exercise, not a diagnosis of bias.',[
    choice('The threshold for intervention and entitlement to fair treatment.','The comparison helps identify an unsupported change in standards.'),
    choice('The duty to prove innocence should be greater for the less familiar identity.','Unfamiliarity does not create an individual legal obligation.',true)],['public:inarReport'])
 },
 'garda-description':{
  'description-start':pair('A caller reports a stolen bag and describes “a Black woman in a dark jacket”. Amina fits those broad features among many people nearby. There are no further identifying details or observed acts linking Amina to the theft.',
   'As Amina, what would you want clarified?',
   'Ask why you were selected, what specific information is relevant and whether you are free to leave. A broad description does not itself settle the basis for a compulsory intervention.',[
    choice('Ask what connects you to the report and whether this is a voluntary enquiry.','You seek specific information and a clear account of your status.',false,'description-detail'),
    choice('Assume anyone sharing those broad features must submit to a search.','That treats a broad group description as a complete search power.',true,'description-repair')],['public:questioning']),
  'description-repair':pair('A Garda colleague asks what power would authorise a proposed general search and why particular people were selected. The caller remains available. No new individual grounds have been supplied.',
   'What should you expect the question about legal power to address?',
   'The actual conditions and individual basis for an intervention matter. A proposed sweep does not become justified simply because it treats a whole group alike.',[
    choice('Whether there is a specific, lawful basis for intervening with you.','This keeps attention on individual grounds rather than group membership.'),
    choice('Only whether enough other people are searched at the same time.','A wider unsupported search does not repair the absence of individual grounds.',true)],['public:questioning']),
  'description-detail':pair('The caller adds a yellow jacket panel, a red bicycle and departure towards the river several minutes earlier. Amina has neither the panel nor a bicycle and has remained at the café during that time.',
   'What could you raise about the updated description?',
   'Information that does not fit the suspicion deserves consideration. You can ask for reassessment without taking responsibility for the Garda’s decision.',[
    choice('Point out the details that do not fit and ask whether you are free to leave.','This identifies information relevant to reassessing the contact.'),
    choice('Assume the original suspicion can never be changed once stated.','Relevant new information can change the basis for an intervention.',true)],['public:questioning']),
  'description-power':pair('Separate variation: a different person matches the fuller description, direction and timing, and a reliable witness gives further specific information. In this variation you play that person. Their role label changes only at this explicit scene transition.',
   'What remains reasonable to ask when the information is more specific?',
   'A stronger evidential link and a particular legal power remain separate questions. The person still has rights and can seek an explanation and legal advice.',[
    choice('Ask the reason, the power being used and what is required of you.','A more specific report does not remove the need to understand the proposed action.'),
    choice('Assume a stronger description removes every right to ask questions.','Rights and safeguards remain relevant when an intervention has grounds.',true)],['public:questioning','public:arrest'])
 },
 'garda-search':{
  'search-start':pair('A briefing mentions drug activity near a bus stop. Niamh, 29, waits there with a bag and appears restless. There is no specific information about Niamh, a drug or an exchange. A Garda considers section 23.',
   'As Niamh, what would help you understand a proposed search?',
   'Ask for the reason and power. Presence in an area and apparent restlessness do not replace the need for the statutory conditions to be met.',[
    choice('Ask what specific grounds and legal power apply to you.','This asks for the individual basis of the action.'),
    choice('Assume everybody at this bus stop can automatically be searched for drugs.','A general area description does not create an unlimited search power.',true)],['public:drugs']),
  'search-check':pair('Niamh asks whether opening the bag is optional. No further evidence has emerged. In this version, no statutory or other valid basis for a search has been established.',
   'What distinction matters to your response?',
   'Clarify whether a search is a request for consent or is said to be compulsory under a lawful power. Pressure and apparent compliance do not resolve that distinction.',[
    choice('Ask whether you have a choice and what basis is claimed for any compulsory search.','You seek a clear explanation without treating consent as automatic.'),
    choice('Assume that feeling unable to refuse always makes the search consensual.','Feeling compelled is a reason to examine the basis, not proof of freely given consent.',true)],['public:drugs']),
  'search-specific':pair('Separate fictional variation: a Garda directly hears Niamh offer a packet as cocaine and sees a cash exchange. For this exercise only, those observations are stipulated to be reliable, current and sufficient for section 23. There is no urgent threat.',
   'With a lawful power stipulated in this variation, what remains available to you?',
   'You can ask for an explanation and state an objection. Lack of consent does not by itself prevent a search supported by a lawful power; avoid physical obstruction and seek advice about a real incident.',[
    choice('Ask for the explanation and state your position without physically obstructing.','This preserves the distinction between objecting and obstructing the stipulated lawful search.'),
    choice('Assume withholding consent necessarily cancels every statutory search.','A valid statutory power does not depend on describing the search as consensual.',true)],['public:drugs','public:obstruction']),
  'search-explain':pair('Niamh asks why they were selected and says earlier searches felt humiliating. The stipulated lawful grounds remain. There is no threat or physical obstruction.',
   'How can you raise a concern about treatment?',
   'A lawful basis for a search does not remove the importance of respectful treatment. A verbal question or concern is different from physical obstruction.',[
    choice('Explain the concern and ask how the search will be carried out respectfully.','You can raise treatment separately from the disagreement about the search.'),
    choice('Assume the existence of a legal power excuses any humiliating treatment.','Authority to search does not remove the separate requirement for appropriate treatment.',true)],['public:inarReport']),
  'search-result':pair('The search finds no controlled drug. It is finished and no other detention basis has arisen. A Garda colleague suggests that finding nothing automatically proves the search was unlawful.',
   'What should guide your assessment afterwards?',
   'Consider the grounds at the time and the conduct of the search. An empty result neither proves unlawful action nor closes off a legitimate concern.',[
    choice('Keep a factual account of the grounds, timing and treatment for advice or review.','This supplies information relevant to assessing the encounter.'),
    choice('Use the empty result alone as a complete legal judgment.','The result does not replace examination of the original basis and conduct.',true)],['public:drugs','public:fiosru'])
 },
 'garda-communication':{
  'communication-start':pair('A Garda asks Maya, 34, a general question about a local report. Maya looks down, takes time to answer and asks for repetition. No specific evidence links Maya to an offence. A colleague calls the behaviour evasive.',
   'As Maya, what can help you take part on clearer terms?',
   'You can ask for a question to be repeated or explained and for your status to be clarified. Communication style is not an admission of wrongdoing.',[
    choice('Ask for one clear question at a time and whether you need to stay.','This identifies the support and status you need.',false,'communication-clarify'),
    choice('Assume you must answer at any pace to avoid losing your rights.','Needing time or clarification does not remove your rights.',true,'communication-repair')],['public:questioning']),
  'communication-repair':pair('As the questions speed up, Maya becomes quieter. No new information about an offence has emerged and there is no urgent safety threat.',
   'What could you ask for now?',
   'A request for time or clearer communication is legitimate. It does not make the person responsible for another person’s unsupported interpretation.',[
    choice('Ask the Garda to slow down and explain the purpose and status of the questions.','This makes a concrete communication need clear.'),
    choice('Assume becoming quiet supplies a new legal power to detain you.','Silence in this scene has not created an individual basis for coercive action.',true)],['public:questioning']),
  'communication-clarify':pair('Maya says, “I am autistic. Please ask one question at a time.” The conversation is voluntary. Maya asks whether it is necessary to continue. No specific grounds for a coercive intervention have emerged.',
   'What can you decide in this voluntary conversation?',
   'You can ask for communication support and clarify whether to continue. Disclosing a support need does not make the conversation compulsory.',[
    choice('Ask for the adjustment and decide whether to continue after clarifying that you are free to leave.','The communication request and voluntary status can both be respected.'),
    choice('Assume that disclosing autism obliges you to answer every question.','That disclosure does not create an obligation to continue a voluntary enquiry.',true)],['public:questioning']),
  'communication-review':pair('The encounter has ended. The Garda reviews communication with a supervisor. Maya separately reflects on the experience and what would have helped; the exercise does not place Maya inside the private Garda debrief.',
   'What could a useful account of your experience identify?',
   'Describe the actual questions, pace, explanations and support needs. Avoid treating one person’s communication as representing every autistic person.',[
    choice('Which explanations and adjustments helped or were missing.','Specific observations can inform meaningful learning or a concern raised later.'),
    choice('A rule that all autistic people communicate in exactly the same way.','Support should respond to individuals, not substitute a new stereotype.',true)],['public:inarReport'])
 },
 'garda-young-person':{
  'young-start':pair('Jamie, a tall Black Irish 16-year-old, waits for a bus with two friends. The Garda knows Jamie’s age. There is no reported threatening conduct or link to an offence. A colleague assumes Jamie is an adult and proposes searching the group.',
   'As Jamie, which facts would you want kept in view?',
   'Your actual age and the individual grounds matter. Height or being with friends does not itself create a search power.',[
    choice('Your age, the reason for the contact and whether any legal requirement applies.','These are relevant facts and questions about the present encounter.'),
    choice('Assume height removes the relevance of being 16.','Appearance does not change the known age.',true)],['public:questioning']),
  'young-contact':pair('Jamie says the group has been questioned several times at the same bus stop. Jamie sounds frustrated but not threatening. There is still no specific evidence of an offence.',
   'How can you understand the concern you are raising?',
   'Frustration about repeated contact is not an admission of guilt. You can ask for the purpose and status of this encounter and consider support afterwards.',[
    choice('Explain the repeated experience and ask why this contact is happening.','This identifies the concern while seeking a clear explanation.'),
    choice('Assume sounding frustrated automatically supplies grounds for a search.','The stated facts do not turn frustration into a search power.',true)],['public:questioning','public:inarReport']),
  'young-review':pair('Compare the same facts with Jamie as a White Irish 16-year-old. Age, clothes, friends, words and behaviour remain unchanged. No identity cue comes from a relevant suspect description.',
   'What should be consistent for either version of Jamie?',
   'The legal threshold, recognition of actual age and entitlement to fair treatment remain relevant in both versions.',[
    choice('The same legal standard and age-appropriate treatment.','The comparison tests a change in reasoning while keeping relevant facts fixed.'),
    choice('Different duties to prove innocence depending on identity.','Identity alone does not create that duty.',true)],['public:inarReport'])
 },
 'garda-colleague':{
  'colleague-start':pair('Patrick, 35, an Irish Traveller, unloads tools for a scheduled repair. A Garda colleague recognises the surname and mentions past trouble with the family. No information connects Patrick or these tools to an offence.',
   'As Patrick, what would help clarify the proposed intervention?',
   'Ask about the individual reason and legal basis. You do not bear responsibility for proving the conduct of an entire family or community.',[
    choice('Ask what current information relates to you and whether the proposed search is compulsory.','This focuses on the individual situation.',false,'colleague-specific'),
    choice('Assume a family reputation is automatically a search power.','A group association does not establish individual grounds.',true,'colleague-pressure')],['public:questioning']),
  'colleague-pressure':pair('One Garda says questioning the proposed search undermines the team. No new facts are supplied. Patrick asks whether the search is compulsory.',
   'What matters to your question, regardless of the disagreement between Gardaí?',
   'The relevant issue is the actual legal basis and requirements. Rank or team agreement cannot replace the conditions of a power.',[
    choice('Ask for a clear explanation of the power and what is required of you.','This seeks clarity without treating agreement between officers as the legal test.'),
    choice('Assume the search must be lawful if both Gardaí eventually agree.','Agreement alone does not establish legal authority.',true)],['public:questioning']),
  'colleague-specific':pair('The past incident involved someone else several years ago. A customer confirms Patrick’s scheduled repair. No current offence is linked to Patrick, although a Garda remains uneasy.',
   'What can you reasonably ask about the continued contact?',
   'Current individual facts matter. Lingering unease does not shift responsibility onto you to disprove an inherited group allegation.',[
    choice('Ask whether you are free to continue the repair and what present grounds remain.','The question focuses on the situation now.'),
    choice('Assume you must prove that every relative is law-abiding before leaving.','The family as a whole is not the legal test for this contact.',true)],['public:questioning']),
  'colleague-review':pair('The encounter has ended. Gardaí consider a team debrief. Patrick separately considers whether and how to share the experience; this does not mean Patrick has joined or consented to identifiable use in training.',
   'What would support an informed choice about follow-up?',
   'You can seek support or complaint information and decide whether to contribute to learning. A public-facing example need not expose your identity or family.',[
    choice('Keep your own factual account and consider the available support, complaint or voluntary feedback routes.','You can choose a route without committing to an outcome or public disclosure.'),
    choice('Assume any educational purpose allows publication of your family’s details.','Training purposes do not erase privacy or the need for appropriate handling of information.',true)],['public:fiosru','public:inarReport'])
 },
 'garda-new-evidence':{
  'update-start':pair('For this exercise, the original search basis concerning Daniel, 32, was lawful. Before the search begins, its source corrects a key identification error and that basis falls away. No separate ground or urgent threat arises.',
   'As Daniel, what could you ask about the correction?',
   'A proposed action should be reassessed when material information changes. Announcing a search does not itself supply a continuing legal basis.',[
    choice('Ask whether the corrected information means the search will stop and you are free to leave.','This asks for the practical effect of the reassessment.',false,'update-explain'),
    choice('Assume the search must finish simply because it was announced.','The current basis matters, including the correction received before the search.',true,'update-repair')],['public:questioning']),
  'update-repair':pair('A Garda colleague points out that the correction arrived before the search. The situation is stable and the proposed action can still be stopped.',
   'What remains relevant to your status?',
   'The correction needs consideration while it can still affect the decision. The desire to appear consistent does not establish legal authority.',[
    choice('Ask for the updated decision and whether any present requirement to remain exists.','This seeks a clear answer based on the corrected information.'),
    choice('Assume avoiding embarrassment is a valid substitute for search grounds.','Appearance does not provide the missing legal basis.',true)],['public:questioning']),
  'update-explain':pair('The Garda decides not to proceed. Daniel asks why the search was announced in the first place.',
   'Which explanation would address the change most clearly?',
   'An explanation should distinguish the original information, its correction and the current status. It need not settle every possible legal issue.',[
    choice('What was corrected, why the search will not proceed and whether you are free to leave.','These points make the change understandable.'),
    choice('A claim that cancellation automatically rules out any concern about the encounter.','Stopping the action does not predetermine every question about the earlier contact.',true)],['public:fiosru']),
  'update-record':pair('Later the Garda records the encounter. Daniel may separately make a personal note. The initial information and the correction were both relevant; no search actually took place.',
   'What should your own note keep clear?',
   'Distinguish what was proposed from what happened, and record the timing of the correction as accurately as possible.',[
    choice('The initial explanation, correction, timing and fact that the search did not proceed.','A factual sequence can help later advice or review.'),
    choice('Describe an empty search result even though no search took place.','A cancelled search and a completed search with no find are different events.',true)],['public:fiosru'])
 },
 'garda-supervision':{
  'supervision-start':pair('A fictional review uses synthetic data: Group A has 60 searches and 12 finds; Group B has 15 searches and 3 finds. Both rates are 20%. Exposure, deployment, individual grounds and treatment are unknown. The roles are a supervising sergeant and a member of the public acting as a community reviewer.',
   'As the community reviewer, what can you conclude from this table?',
   'Equal find rates do not establish fairness, and different counts do not settle the cause of every decision. Identify missing information before making a stronger claim.',[
    choice('Ask about selection, individual grounds, deployment and treatment.','These questions identify what the table leaves unresolved.'),
    choice('Treat the percentages alone as proof that every encounter was fair.','The searched sample and the conduct of encounters need separate examination.',true)]),
  'supervision-deployment':pair('The review finds more patrol time in one area and a focus on search numbers as “success”. The records do not distinguish residents, people present and people connected to incidents by reliable evidence.',
   'What should you ask the review to examine?',
   'Community experience, deployment, selection and treatment can reveal different parts of the picture. No single denominator resolves every question.',[
    choice('How patrol priorities and incentives shape selection, alongside grounds and treatment.','This includes organisational decisions as well as individual encounters.'),
    choice('Only whether increasing the search target increases the number of finds.','Volume does not establish lawful or fair decisions.',true)]),
  'supervision-training':pair('A team completes the learning game and improves its quiz answers. Someone proposes announcing that bias in actual Garda searches has been reduced. Both the sergeant and community reviewer see this same proposed claim.',
   'What should you ask before accepting the claim?',
   'A learning score measures performance in the exercise. It does not establish changed conduct, reduced discrimination or a better public experience.',[
    choice('What real-world outcomes were measured beyond quiz performance.','This distinguishes a useful learning result from a claim about practice.'),
    choice('Accept a higher quiz score as proof that real-world bias has ended.','The evidence does not support that conclusion.',true)]),
  'supervision-plan':pair('The group considers follow-up learning, supervisory review and evaluation. The aim is better decisions and public experience. No operational incident data is collected in this game.',
   'What would give community input a useful role?',
   'Agree what improvement means and how grounds, treatment and experience will be assessed with appropriate safeguards. Completion counts alone are insufficient.',[
    choice('Help define outcomes and participate in appropriately supported, independent evaluation.','This connects community experience with a reviewable plan.'),
    choice('Publish identifiable incidents inside the game without agreeing how they should be handled.','The prototype is not an operational data collection system.',true)])
 }
};
