// The ground names and order follow IHREC's protected-grounds page. Each case
// has common facts and separate public and Garda decisions at the same moment.
export const ihrecGroundsUrl='https://www.ihrec.ie/your-rights/protected-grounds';
const rightsUrl='https://www.ihrec.ie/your-rights/';

const view=(prompt,lesson,preferred,review)=>({prompt,lesson,preferred,review});
const stage=(title,scene,publicView,gardaView)=>({title,scene,views:{public:publicView,garda:gardaView}});

const cases=[
 {
  ground:'gender', title:'Gender', place:'square',
  description:'At a bicycle repair workshop, the organiser gives someone else the place you booked after saying the session is for men.',
  goal:'Ask what the booking decision was based on.',
  stages:[
   stage('A confirmed place at the repair stall',
    'A public bike repair workshop is taking place in the square. A woman shows a booking confirmation. The organiser says the advanced session is for men and offers the place to the next man in the queue. A Garda on duty nearby hears the exchange.',
    view('What would you ask the organiser?',
     'A confirmed booking and the words used to refuse it can help explain whether the person’s gender affected access to the workshop.',
     ['Ask how the booking rule applies and whether you can see it in writing.','The booking and the stated reason give you specific facts to refer to if you seek advice.'],
     ['Ask the next participant to prove they deserve the place.','The organiser controls the booking. Ask the organiser to explain the criteria and how they applied them.']),
    view('How would you respond to the exchange?',
     'Hear directly from the person whose booking was refused and establish what the organiser said. Keep the account specific.',
     ['Ask each person what happened and check the booking confirmation.','You gather the organiser’s reason and give the participant a chance to be heard.'],
     ['Use another participant’s account in place of speaking to the person refused.','The person refused can describe their booking and what was said to them. Their account matters.'])),
   stage('The advertised rule',
    'The poster says that anyone with a booking can attend. The organiser says they changed their mind about who should take the advanced session. The participant wants the decision reviewed.',
    view('What could help you ask for a review?',
     'Keep a copy of the advertised rule and the booking. Note when the refusal happened and the words you remember.',
     ['Keep the confirmation and poster, then ask for the decision to be reviewed.','You can give the provider or an adviser the advertised terms and the explanation you received.'],
     ['Delete the booking confirmation once the session starts.','The confirmation is a useful record of your place and the terms you saw when you booked.']),
    view('What would you record about the refusal?',
     'A clear record distinguishes what the Garda heard, what the participant reported and what the poster said. IHREC provides information about the gender ground.',
     ['Record the stated rule and signpost where the participant can get equality information.','You preserve the facts and give the participant a way to explore their options.'],
     ['Record only that people disagreed in the queue.','The booking criteria and the organiser’s words explain why the person raised a concern. Include them in the account.']))
  ]
 },
 {
  ground:'civil-status', title:'Civil status', place:'square',
  description:'A community venue tells a divorced customer that the advertised two-adult booking is only for married couples.',
  goal:'Identify when marital or civil partnership status is part of the decision.',
  stages:[
   stage('Two tickets for the exhibition',
    'Two adults booked the advertised two-person pass for an exhibition. When the ticket attendant asks, one of them says they are divorced. The attendant refuses the pass and says it is for married couples. A Garda at the event is asked to speak to the customers after a disagreement at the desk.',
    view('Which question would clarify your concern?',
     'Civil status includes being divorced, married, single, separated, widowed or in a civil partnership. Check whether the booking decision turned on that status.',
     ['Ask where the marriage requirement is stated for the two-person pass.','This puts the focus on the conditions for the same pass and the reason you were given.'],
     ['Ask whether the exhibition offers cheaper tickets for larger families.','The decision concerns the advertised pass for two adults. Ask about the marriage requirement for that pass.']),
    view('What would you ask about first?',
     'Take an account of any reported disturbance and hear the separate concern about access to the exhibition.',
     ['Ask what happened at the desk and what reason was given for refusing the pass.','You can separate the conduct reported to you from the issue the customers want reviewed.'],
     ['Ask for details of the divorce before hearing what happened at the desk.','The payment, the advertised pass and the attendant’s stated reason are relevant. The private details of the divorce add little to this account.'])),
   stage('The terms on the receipt',
    'The receipt describes the pass as admission for any two adults. A venue supervisor asks the customers for a written account. They want to know what to include.',
    view('What would you write down?',
     'The same two-person pass is the useful comparison. Record the terms, what was asked about your civil status and the reason given for refusing entry.',
     ['Include the receipt and the explanation the attendant gave.','These details help the supervisor or an adviser review the actual booking decision.'],
     ['Send only the price of the pass.','The price helps identify the booking. Include the advertised terms and the reason for refusal too.']),
    view('How would you describe the concern?',
     'An accurate account links the refusal to the words used about civil status and identifies where those words came from.',
     ['Record the customers’ account and that the receipt says “any two adults”.','A reader can distinguish what the customers reported from the wording you checked.'],
     ['Summarise it as a dispute about the ticket price.','The stated condition concerns marriage. Naming that issue makes the account clearer.']))
  ]
 },
 {
  ground:'family-status', title:'Family status', place:'square',
  description:'A parent is turned away from an evening course after the organiser assumes childcare will affect attendance.',
  goal:'Separate attendance requirements from assumptions about parenting.',
  stages:[
   stage('A place on the evening course',
    'At a community learning fair, an adult asks to join a short bookkeeping course and confirms they can attend the listed evenings. After learning the applicant has a child, the organiser says parents of young children are too likely to miss sessions. A steward asks a Garda at the fair to help calm a growing disagreement at the stand.',
    view('How would you explain the issue?',
     'Family status can include being a parent of a child. How a provider checks actual availability matters when it is deciding who can attend.',
     ['Say you can attend the listed sessions and ask which requirement you did not meet.','You focus on the relevant attendance requirement and the reason the organiser gave.'],
     ['Offer details about your child’s school and childcare routine.','You can confirm that you are available. Detailed information about your child is unnecessary for that purpose.']),
    view('What distinction would help you take this account?',
     'The learner can describe the refusal. The organiser can explain any attendance rule and how they applied it.',
     ['Ask what availability was checked and what the organiser said about parents.','You preserve the difference between a practical requirement and an assumption about this person.'],
     ['Assume the applicant could attend fewer sessions because they have a child.','The applicant says they can attend. Ask about the scheduled sessions and how availability was assessed.'])),
   stage('A place is still available',
    'The timetable and attendance rules are the same for all applicants. The organiser confirms a place is still open. The applicant asks for the reason for the refusal in writing.',
    view('What would help when seeking advice?',
     'The timetable, the remaining place and the stated reason provide useful details for someone reviewing the decision.',
     ['Keep the course notice and a dated note of the organiser’s response.','You keep a record of what was available and why you were refused.'],
     ['Wait and rely on your memory of the discussion.','A short note and the course notice give you more detail to work with later.']),
    view('What can you offer as the encounter ends?',
     'Listen to the concern about treatment and explain where the person can get information about family status and access to services.',
     ['Explain where to find IHREC’s guidance and record any conduct relevant to your attendance.','The person can seek information about the course decision while the Garda account stays accurate.'],
     ['Tell the applicant to discuss childcare as the main issue.','The concern is how the provider decided who could attend. Direct the applicant to information about the service decision.']))
  ]
 },
 {
  ground:'sexual-orientation', title:'Sexual orientation', place:'square',
  description:'You and your partner are turned away from an event after the steward learns you are a same-sex couple.',
  goal:'Raise a concern while choosing what personal information to share.',
  stages:[
   stage('A booking for two',
    'Two people arrive at an outdoor food festival with valid paired tickets. The gate steward has admitted other couples. When the two say they are partners, the steward tells them same-sex couples cannot enter together. A colleague calls a Garda because people have started gathering at the gate.',
    view('How could you ask about the decision?',
     'The ticket terms and the steward’s words can help someone assess whether sexual orientation affected access. You can choose what personal information to share.',
     ['Ask for the entry rule and the reason for applying it to your tickets.','This addresses the refusal directly. You can decide whether you prefer to talk away from the queue.'],
     ['Ask the crowd to question the steward on your behalf.','You can ask for a venue supervisor and choose a more private place to explain what happened.']),
    view('How would you take the couple’s account?',
     'People may have good reasons for wanting privacy when describing an incident about sexual orientation. Ask what happened and give them space to speak.',
     ['Offer a quieter place to talk and ask what was said at the gate.','You can hear and record the relevant account without requiring a public discussion of personal details.'],
     ['Ask them to explain their relationship to the queue.','The Garda can speak with the people involved privately and ask about the stated entry rule.'])),
   stage('A witness offers to help',
    'Another visitor says they heard the steward’s explanation and offers to give an account. The couple wants a supervisor to look at the refusal.',
    view('What would help you follow up?',
     'The tickets, a note of the refusal and an account from a willing witness can help with a request for review.',
     ['Keep the tickets and accept the witness’s offer to share contact details privately.','You preserve useful details and let the witness decide what they are willing to share.'],
     ['Post the witness’s contact details in the event group.','The witness offered an account. Agree with them how they want to be contacted.']),
    view('What would you keep clear in your account?',
     'Record who heard the steward’s words and where each detail came from. Treat personal information with care.',
     ['Distinguish the couple’s report, the witness’s account and what you observed.','This supports a fair review and makes it clear which details have been independently checked.'],
     ['Write that everyone at the gate heard the same explanation.','One witness has offered an account. Record what each person actually says they heard.']))
  ]
 },
 {
  ground:'age', title:'Age', place:'square',
  description:'A photography course is advertised for adults. A 67-year-old applicant is told the course has an upper age limit.',
  goal:'Ask for the purpose and evidence behind an age rule.',
  stages:[
   stage('An age limit at the booking desk',
    'A 67-year-old applicant attends a community fair to book a daytime photography course advertised for adults. The organiser says the course only accepts people under 60, citing the need to carry a camera on a short walk. The applicant questions the rule. A Garda on duty nearby is asked to listen after a disagreement.',
    view('What could you ask about the limit?',
     'Age rules can have exceptions or require justification. Ask what the programme needs participants to do and why the age rule was chosen.',
     ['Ask about the actual walking and equipment requirements and why age is used.','This helps you understand the purpose of the rule and whether the provider can check the practical requirements directly.'],
     ['Assume every age limit will have the same legal answer.','The setting, the reason for a rule and how it is applied can affect the assessment. Ask for the particular details.']),
    view('What would you check before describing the refusal?',
     'Ask about the age rule and its stated purpose. Record the provider’s explanation without relying on age as a measure of a person’s abilities.',
     ['Check what the course requires and what the organiser said about age.','You can describe the stated reason and give the applicant a chance to explain their concern.'],
     ['Treat the applicant’s age as evidence that they cannot take part.','The course has practical requirements. Ask about those requirements and the applicant’s ability to meet them.'])),
   stage('The walk is optional',
    'The printed timetable says the short walk is optional and most sessions are indoors. The applicant asks for the age rule in writing.',
    view('Which details would you keep?',
     'The course notice, the age limit and the explanation about the walk help an adviser examine the reason for the rule.',
     ['Keep the timetable and a dated note of the age limit and explanation.','You have a concrete record of both the rule and what the course actually asks of participants.'],
     ['Keep only a photo of the fair entrance.','The course timetable and the organiser’s explanation are more directly connected to the refusal.']),
    view('How would you finish the conversation?',
     'Acknowledge the concern, preserve the two accounts of what the course requires and signpost equality information.',
     ['Record both explanations and point the applicant to guidance about age and services.','You give the applicant a place to learn about the rule and retain the details needed for review.'],
     ['Record “course demands” as the reason without looking at the timetable.','The timetable describes the walk as optional. Record that fact alongside what the organiser told you.']))
  ]
 },
 {
  ground:'religious-belief', source:'religion', title:'Religious belief', place:'square',
  description:'A volunteer refuses your booking for a publicly advertised music class after learning you have no religion.',
  goal:'Check whether religious belief or lack of belief affected access to a service.',
  stages:[
   stage('The music class in the public hall',
    'A volunteer checks bookings at a public hall. The council’s notice advertises a music class open to any adult. The volunteer asks whether a person on the list belongs to a local church. When the person says they have no religion, the volunteer refuses the booking. A Garda helping at a public event outside hears a request for assistance.',
    view('What question would help you explain the refusal?',
     'The religious belief ground includes having no religion. The published entry requirements and what the volunteer said help identify the concern.',
     ['Ask what entry rule applies to a class advertised as open to any adult.','You can compare the advertised conditions with the rule used to turn you away.'],
     ['Try to settle the booking by arguing about religious beliefs.','Ask the organiser to explain the admission decision and the published conditions for the class.']),
    view('How would you ask about the refusal?',
     'Ask what was said and give the person room to decide how much to share about beliefs. Establish who decides admission.',
     ['Ask the volunteer for the entry rule and hear directly from the person refused.','You gather information about the booking decision and show respect for the person’s privacy.'],
     ['Ask the person to describe their beliefs to everyone waiting.','The relevant information is what the volunteer asked and how the answer affected access. A private account may be more appropriate.'])),
   stage('The organiser checks the notice',
    'The organiser confirms that the class was advertised to the general public. The volunteer says they thought the hall booking was for church members. The person wants the incident reviewed.',
    view('What could you give the organiser?',
     'A review can examine the notice, the booking and the reason stated at the door, including whether the volunteer understood the admission rule.',
     ['Share the booking confirmation and note what the volunteer asked and said.','This gives the organiser the information needed to check what happened and how the rule was communicated.'],
     ['Describe only how long you waited at the door.','The wait is part of the timeline. The stated reason for refusing the booking explains the concern.']),
    view('What would a useful record include?',
     'Distinguish what the organiser confirmed from what the volunteer said and what the person reported.',
     ['Record the public notice and attribute each person’s account.','Someone reading the record can see the published condition and the different accounts about how it was applied.'],
     ['Record the admission rule as settled after speaking only to the volunteer.','The organiser is responsible for the published conditions. Check what they say alongside the volunteer’s account.']))
  ]
 },
 {
  ground:'traveller-community', title:'Traveller community', place:'square',
  description:'A caretaker cancels your confirmed room booking after learning you belong to the Traveller community.',
  goal:'Record the actual reason given and challenge assumptions about a community.',
  stages:[
   stage('The booking at the community centre',
    'A Traveller resident has a confirmed room booking for a family gathering at a community centre. The caretaker says the centre will not let rooms to Traveller families and asks the resident to leave. A Garda attends after the caretaker reports an argument at the entrance.',
    view('What would help you put your concern on record?',
     'Membership of the Traveller community is a protected ground. The reason actually given matters when assessing a refusal of a room booking.',
     ['Show the booking confirmation if you wish, and explain the wording used by the caretaker.','You give a specific account of the refusal and what it was based on.'],
     ['Offer details of your extended family to prove the gathering should be allowed.','The booking terms and the stated reason are relevant. Details about relatives are unnecessary to explain them.']),
    view('Where would you start when you arrive?',
     'Assess what is actually happening at the entrance and give the resident a chance to describe the refusal.',
     ['Ask about the reported conduct, the booking and the words used to cancel it.','You can examine the call for Garda attendance and record the concern about treatment.'],
     ['Treat the caretaker’s view of the family as evidence of risk.','Risk assessment needs facts about this encounter. A generalisation about a community gives you no account of the individual’s conduct.'])),
   stage('A second reason is given',
    'The centre manager is asked to review the booking. The caretaker now says the room was double-booked. The confirmation remains on the resident’s phone.',
    view('What would you keep for the review?',
     'Record both explanations, when each was given and whether anyone else heard them. Keep the confirmation.',
     ['Keep the original booking and a dated account of both reasons.','A reviewer can check whether there was a double booking and consider the initial explanation.'],
     ['Keep only the latest explanation.','The timing and wording of each explanation are relevant. Record both while you remember them.']),
    view('How should you handle the two accounts?',
     'New information can be checked and added to the record. The first stated reason remains relevant to the resident’s concern.',
     ['Attribute both explanations and check what the booking record establishes.','You preserve the sequence and distinguish supported facts from claims awaiting review.'],
     ['Replace the resident’s account with the reason given later.','Record the original account and the later explanation separately. A reviewer needs both.']))
  ]
 },
 {
  ground:'race', title:'Race', place:'square',
  description:'You have a valid ticket for a local match. A steward asks only you to prove your nationality before letting you in.',
  goal:'Ask whether the same entry conditions were applied to comparable ticket holders.',
  stages:[
   stage('Extra questions at the match',
    'An Irish spectator shows a valid ticket for a local match. People with the same ticket were admitted after a scan. The steward hears the spectator’s accent, says “you sound foreign” and asks for proof of nationality. A Garda on duty outside approaches when the queue stops moving.',
    view('What would help clarify what is being asked?',
     'Race discrimination can concern colour, nationality, ethnic or national origins. Check the stated entry rule and how it was applied to other ticket holders.',
     ['Ask why nationality is being checked and which entry rule requires it.','You can ask for a clear explanation without giving more personal information than you wish to share.'],
     ['Assume that a ticket alone will explain why the steward asked that question.','The ticket helps establish your booking. The wording and reason for the additional requirement are also important.']),
    view('How would you assess what happened in the queue?',
     'An accent provides no reliable basis for inferring nationality. Ask which ticket rules applied and what was said to this spectator.',
     ['Listen to the spectator and check how adjacent ticket holders were admitted.','You look at comparable ticket holders and record the specific reason given for the extra request.'],
     ['Use the spectator’s accent to decide whether the nationality check made sense.','The relevant facts include the ticket conditions and the steward’s explanation. An accent offers no reliable evidence about eligibility.'])),
   stage('The same ticket, a different check',
    'A supervisor confirms that the only advertised entry check was a ticket scan. The steward says the nationality request was their own decision. The spectator wants the club to follow up.',
    view('How could you set out the concern?',
     'Keep the ticket and write down the additional question, the reason stated and what you saw happen to other ticket holders.',
     ['Give the club a short account with the time, ticket and wording used.','These details let the club or an adviser examine how the entry rule was applied.'],
     ['Tell the club only that the queue stopped.','The queue explains why the Garda came over. Include the additional request and how other tickets were checked.']),
    view('What would you record for review?',
     'Describe the treatment of comparable ticket holders, attribute the steward’s explanation and record the supervisor’s confirmation of the rule.',
     ['Record which facts you checked and the concern the spectator raised.','That record can support follow-up while keeping the evidence and each person’s account clear.'],
     ['Record the additional check as the club’s rule without asking the supervisor.','The supervisor says the club required a ticket scan. Attribute the additional request to the person who made it.']))
  ]
 },
 {
  ground:'disability', title:'Disability', place:'station',
  description:'At a Garda station, a Deaf person wants to report damage to a bicycle and asks for an accessible way to communicate.',
  goal:'Agree a way to communicate directly and check that it works.',
  stages:[
   stage('Taking a report at the station',
    'A Deaf person arrives at a Garda station with a friend to report damage to their bicycle. In the busy reception area, the Garda directs questions to the friend. The person shows a note asking the Garda to write the questions down and speak to them directly.',
    view('How could you clarify what would help you take part?',
     'People use different ways to communicate. You can explain what works for you and choose whether a companion helps.',
     ['Ask the Garda to write the initial questions and let you read back the report.','You have a way to answer directly and check the accuracy of the account.'],
     ['Leave all the questions to your friend even where they did not see what happened.','You can ask for questions in a form you can use. Your friend can help as you wish.']),
    view('How would you start taking the report?',
     'Address the person directly, ask what communication method works and check that the person can understand and contribute.',
     ['Use written questions as requested and check that the arrangement works.','You can hear the report from the person and review the information with them.'],
     ['Continue speaking only to the friend.','The person has asked to communicate directly. Use their preferred method and ask whether they want the friend’s help.'])),
   stage('A longer account needs more support',
    'Writing works for the basic contact details. The person says they would prefer an Irish Sign Language interpreter to give the more detailed account. The Garda considers how to arrange that follow-up.',
    view('What can you ask the Garda to agree with you?',
     'Access needs may change with the complexity of a conversation. Agree a way to be contacted and how you can give and check the fuller report.',
     ['Ask how the follow-up can be arranged and agree a contact method you can use.','You can plan how to give the account and ask questions about the follow-up.'],
     ['Assume the written contact details complete the full report.','The fuller account is still to be taken. Agree how and when you can give it.']),
    view('What should happen before closing the conversation?',
     'Check what support is needed, what arrangements are possible and how to keep the person informed in a way they can use.',
     ['Record the request, check how to arrange support and agree an accessible follow-up.','This keeps the person involved and creates a clear record of the communication needs and next steps.'],
     ['Assume that the method used for contact details will work for every part of the report.','The person has described a different need for the detailed account. Explore the arrangements with them.']))
  ]
 },
 {
  ground:'housing-assistance', source:'housing-assistance-payment/housing', title:'Housing assistance', place:'street',
  description:'A letting agent refuses your booked viewing after learning that you receive the Housing Assistance Payment (HAP).',
  goal:'Distinguish the accommodation concern from the Garda’s response at the property.',
  stages:[
   stage('Turned away from a viewing',
    'A person arrives for a confirmed viewing of a privately rented flat and mentions that they receive the Housing Assistance Payment (HAP). The letting agent says the flat is available but refuses to show it to HAP applicants. A Garda is called after an argument is reported outside the property.',
    view('What would help you find information about the refusal?',
     'The housing assistance ground applies to the provision of accommodation. The viewing confirmation and the agent’s stated reason help identify the issue.',
     ['Ask the agent to confirm the reason and keep your viewing confirmation.','You can give an adviser the booking and the reason you were refused a viewing.'],
     ['Ask the Garda to allocate the flat to you.','The Garda can hear what happened at the property. IHREC can provide information on equality in accommodation and possible next steps.']),
    view('What would you establish when you arrive?',
     'Deal with any immediate safety or conduct issue and hear the account of the viewing refusal. The accommodation decision can be raised through the relevant equality process.',
     ['Ask what happened outside and record the reason the applicant says they were turned away.','You can assess the reported argument and help the applicant find relevant equality information.'],
     ['Tell the agent which applicant must be selected for the tenancy.','The letting decision belongs to the accommodation process. Establish what happened at the property and signpost advice about the refusal.'])),
   stage('The reason arrives in writing',
    'The agent sends a message confirming that the flat is still available and that the agency will only consider people who do not receive HAP. The applicant asks where they can learn about their options.',
    view('What would you take with you when asking for advice?',
     'Keep the message, the advertisement and the booking. IHREC’s housing assistance guidance explains relevant rights and routes for advice.',
     ['Keep a dated copy of the message and ask for information about housing assistance discrimination.','The written reason and the dates help an adviser understand the accommodation concern.'],
     ['Keep only a record that a Garda attended.','The letting agent’s message and viewing details speak directly to why the viewing was refused.']),
    view('How could you explain the next step?',
     'The Garda’s attendance and the accommodation complaint are separate matters. Help the person identify which information and support relates to each.',
     ['Explain what you recorded and point to IHREC’s housing assistance guidance.','The applicant can use the accommodation guidance and knows what the Garda recorded about the encounter.'],
     ['Suggest that the record of Garda attendance itself files an equality complaint.','An equality complaint follows its own process. Point the applicant to guidance on raising the accommodation concern.']))
  ]
 }
];

export const discriminationReferences=Object.fromEntries([
 ...cases.map(({ground,source=ground,title})=>['equality:'+ground,{title:'IHREC · '+title,url:rightsUrl+source}]),
 ['equality:accommodation',{title:'Equal Status Act · Reasonable accommodation',url:'https://revisedacts.lawreform.ie/eli/2000/act/8/section/4/revised/en/html'}]
]);

export const discriminationEncounters=Object.fromEntries(cases.map(({ground,title,description,goal,place,stages})=>{
 const id='discrimination-'+ground;
 const refs=['equality:'+ground,...(ground==='disability'?['equality:accommodation']:[]),'garda:ethics',...(ground==='race'?['garda:pabi']:[])];
 const nodes=Object.fromEntries(stages.map((item,index)=>{
  const nodeId=index===0?'opening':'follow-up';
  const next=index===0?'follow-up':'end';
  const views=Object.fromEntries(Object.entries(item.views).map(([role,{prompt,lesson,preferred,review}])=>{
   const choices=[preferred,review].map(([text,feedback],i)=>({text,feedback,next,review:i===1,points:i===0?1:0}));
   return [role,{prompt,lesson,choices,refs}];
  }));
  return [nodeId,{...item,id:nodeId,views}];
 }));
 return [id,{id,ground,title,description,goal,place,nodes,start:'opening',origin:'shared',language:'en-IE',people:{public:'',garda:''},minutes:'3–4 minutes'}];
}));
