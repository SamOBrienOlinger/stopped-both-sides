export const CHECKED = '7 September 2026';
export const sources = {
 legalAid:{title:'Legal Aid Board · Garda Station Legal Advice Revised Scheme',url:'https://www.legalaidboard.ie/about-the-legal-aid-board/criminal-legal-aid/the-garda-station-legal-advice-revised-scheme/',note:'The current scheme, its coverage and eligibility arrangements.'},
 questioning:{title:'Citizens Information · Questioning and surveillance',url:'https://www.citizensinformation.ie/en/justice/arrests/questioning-and-surveillance/',note:'General enquiries and situations where Gardaí can require information. Indexed guidance checked; direct page access was restricted.'},
 arrest:{title:'Citizens Information · Arrests in Ireland',url:'https://www.citizensinformation.ie/en/justice/arrests/arrests/',note:'Arrest, identification and detention. Read alongside the current legislation and legal advice.'},
 silence:{title:'Citizens Information · Right to silence',url:'https://www.citizensinformation.ie/en/justice/arrests/right-to-silence-in-criminal-cases/',note:'The general right, identification requirements and circumstances where silence can have consequences.'},
 interviews:{title:'Citizens Information · Garda interviews',url:'https://www.citizensinformation.ie/en/justice/arrests/garda-interviews/',note:'Solicitor access and the interview process.'},
 custody:{title:'Citizens Information · Treatment in custody',url:'https://www.citizensinformation.ie/en/justice/arrests/treatment-in-custody/',note:'Information, welfare and treatment at a Garda station.'},
 statements:{title:'Citizens Information · Statements from suspects',url:'https://www.citizensinformation.ie/en/justice/arrests/statements-from-suspects/',note:'Giving, checking and signing statements.'},
 dpp:{title:'DPP · Letters of rights',url:'https://www.dppireland.ie/criminal-justice-system/letters-of-rights/',note:'Official information about legal advice, interpretation, medical care and notification of detention. Detention limits must be checked for the specific power.'},
 eu:{title:'European e-Justice · Investigation rights in Ireland',url:'https://e-justice.europa.eu/topics/your-rights/defendants-criminal-proceedings/2-my-rights-during-investigation-crime/ie_en',note:'Ireland-specific information about arrest, welfare, searches and legal assistance.'},
 drugs:{title:'Misuse of Drugs Act 1977 · Section 23 (revised)',url:'https://revisedacts.lawreform.ie/eli/1977/act/12/section/23/revised/en/html',note:'Reasonable-cause suspicion, warrantless drug searches and related detention powers.'},
 obstruction:{title:'Misuse of Drugs Act 1977 · Section 21 (revised)',url:'https://revisedacts.lawreform.ie/eli/1977/act/12/section/21/revised/en/html',note:'Obstructing the lawful exercise of powers under the Act.'},
 publicOrder:{title:'Public Order Act 1994 · Section 24 (revised)',url:'https://revisedacts.lawreform.ie/eli/1994/act/2/section/24/revised/en/html',note:'Name-and-address demands for specified public-order offences and the consequences of refusal or false details.'},
 youth:{title:'Citizens Information · Child suspects in custody',url:'https://www.citizensinformation.ie/en/justice/children-and-young-offenders/treatment-of-child-suspects-in-garda-custody/',note:'Additional protections for people under 18.'},
 childInterview:{title:'Children Act 2001 · Section 61 (revised)',url:'https://revisedacts.lawreform.ie/eli/2001/act/24/section/61/revised/en/html',note:'Adult presence during a child’s interview, legal assistance and specific exceptions.'},
 childSolicitor:{title:'Children Act 2001 · Section 60 (revised)',url:'https://revisedacts.lawreform.ie/eli/2001/act/24/section/60/revised/en/html',note:'Requests for a solicitor for a child in Garda custody.'},
 fiosru:{title:'Fiosrú · Complaints and frequently asked questions',url:'https://www.fiosru.ie/about-us/faqs/',note:'The current Office of the Police Ombudsman: who can complain, time limits and what information helps.'},
 fiosruForm:{title:'Fiosrú · Make a complaint',url:'https://www.fiosru.ie/complaints/submit-a-complaint/',note:'The official complaints form. Opening it does not submit a complaint.'},
 inarReport:{title:'INAR / ICCL · Policing and Racial Discrimination in Ireland',url:'https://inar.ie/wp-content/uploads/2024/04/1.-POLICING-AND-RACIAL-DISCRIMINATION-1.pdf',note:'Community research and recommendations (PDF, 2024). It informs the game’s approach; it is not an up-to-date statement of every legal power.'},
 inar:{title:'INAR · Racism and policing resources',url:'https://inar.ie/?s=Police',note:'The INAR resource search supplied for this project.'},
 ireport:{title:'INAR · iReport racism reporting system',url:'https://inar.ie/ireport-racism-reporting-system/',note:'Learn about confidential reporting of racism and its purpose. It is separate from a formal Garda-conduct complaint.'},
 iccl:{title:'ICCL · Know Your Rights: Criminal Justice & Garda Powers',url:'https://www.iccl.ie/resources/know-your-rights-criminal-justice-and-garda-powers-2nd-edition-june-2014/',note:'Background guide (2014). Some procedures and organisation names have changed; use current sources alongside it.'}
};
const c=(text,feedback,next,review=false)=>({text,feedback,next,review});
const n=(title,story,prompt,lesson,phrase,refs,choices,quote='')=>({title,story,prompt,lesson,phrase,sources:refs,choices,quote});
export const scenarios = [
 {id:'street',title:'Stopped on the street',person:'Alex, 24',context:'Walking home after a late shift',description:'A Garda asks where you are going. Is this a conversation, or do you have to stay?',icon:'message',minutes:'4–5 minutes',start:'street-start',nodes:{
 'street-start':n('“Can I have a word?”','You are Alex. You are walking home when a Garda stops beside you and asks where you are going. You have not been told you are suspected of an offence.','What would you say first?','A Garda can make enquiries. A request to talk is not automatically a legal obligation to stay or answer; particular powers can change this.','Am I free to leave, or am I being detained?',['questioning','iccl'],[
 c('Explain your whole evening straight away.','You can choose to talk, but first understanding whether the conversation is voluntary helps you make an informed choice.','street-voluntary'),
 c('Ask why you are being stopped and whether you are free to leave.','This asks for the status and purpose of the encounter without assuming that every request is compulsory.','street-status'),
 c('Say that Gardaí are never allowed to ask questions in public.','Gardaí can make general enquiries. The question is whether a particular answer or action is legally required.','street-status',true)
 ]),
 'street-status':n('What changes the situation?','The Garda explains that they are making general enquiries and that you are not detained. You wonder whether this would always be the case.','Which distinction matters?','For certain offences, a lawful demand can require your name and address. Do not assume either that every question is compulsory or that identification is always optional.','Is this a request, or a legal requirement? What power applies?',['questioning','publicOrder'],[
 c('Every question becomes compulsory once a uniformed Garda asks it.','A uniform does not turn every general enquiry into a compulsory question.','street-details',true),
 c('You never need to give identifying details unless you are convicted.','Some powers require identifying details before any charge or conviction.','street-details',true),
 c('The legal power and circumstances determine what is required.','Exactly. The legal basis matters, so ask for it if the position is unclear.','street-details')
 ]),
 'street-voluntary':n('A voluntary conversation','You have answered a few questions. The Garda confirms that you are free to leave, but asks if you will come to the station to help with general enquiries.','What is a useful next step?','Ask whether attendance is voluntary and whether you can leave. Going voluntarily does not itself waive your rights; a later lawful arrest would change the position.','Am I attending voluntarily, and can I leave?',['questioning','iccl'],[
 c('Clarify the purpose and whether attendance is voluntary.','You can make an informed decision about helping and seek legal advice if you are concerned.','street-details'),
 c('Assume that stepping inside a station means you must stay indefinitely.','A station visit is not itself a power of detention. Clarify your status.','street-details',true),
 c('Assume that nothing said voluntarily could ever be used as evidence.','Do not rely on that assumption. Ask for legal advice if the questions could implicate you.','street-details',true)
 ]),
 'street-details':n('Now there is a legal demand','In a different version of the encounter, the Garda says they have reasonable cause to suspect you used threatening behaviour under section 6 of the Public Order Act. They demand your name and address under section 24. You dispute the allegation.','How can you respond to the demand?','When a section 24 demand is lawfully made, refusing or giving false or misleading name-and-address details is an offence. Giving accurate details is not an admission to the alleged conduct.','I will give my details. I dispute the allegation and want legal advice.',['publicOrder'],[
 c('Give a made-up name to keep the situation private.','False or misleading details in response to this lawful demand can create a separate offence.','street-end',true),
 c('Give accurate details and separately ask about the allegation and legal advice.','You can meet the identification requirement while disputing what is alleged.','street-end'),
 c('Refuse your name until the Garda proves the original allegation in court.','The identification duty does not wait for a conviction. The legality of the demand can be challenged through advice.','street-end',true)
 ]),
 'street-end':n('Leaving with clarity','The encounter ends and you are told you can go. You still feel unsettled about how you were treated.','What could you do afterwards?','When safe, note what happened and seek advice if you think your rights were breached. A complaint and a legal challenge are different routes.','Write down the time, place, words used and any witnesses.',['fiosru','eu'],[
 c('Keep a factual note and consider advice or a complaint.','You have preserved information without needing to decide the legal merits yourself.','end'),
 c('Assume that being allowed to leave rules out any complaint.','An encounter can end without arrest and still raise concerns about treatment.','end',true),
 c('Assume that making a complaint automatically proves the stop was unlawful.','A complaint raises concerns for assessment; it does not itself determine lawfulness.','end',true)
 ])}},
 {id:'search',title:'Asked to open your bag',person:'Niamh, 29',context:'Waiting for a bus in town',description:'You are told your bag will be searched. Explore the difference between consent and a legal power.',icon:'bag',minutes:'4–5 minutes',start:'search-start',nodes:{
 'search-start':n('“Open your bag, please.”','You are Niamh. While waiting for a bus, a Garda tells you they want to search your bag. You have not heard a reason or been told what power they are using.','What would help you understand the request?','Ask why the search is proposed and what legal power is being used. Do not assume a search always requires either your consent or a warrant.','What is the reason for the search, and what power are you using?',['eu','drugs'],[
 c('Ask for the grounds and legal power.','This identifies what is being proposed and helps distinguish a request for consent from a statutory search.','search-power'),
 c('Say that every search without a paper warrant is unlawful.','Some legislation allows searches without a warrant if its conditions are satisfied.','search-power',true),
 c('Assume that a request for consent and a statutory search are the same thing.','They are different legal bases. Ask which one applies.','search-power',true)
 ]),
 'search-power':n('A specific search power','The Garda says they suspect you possess a controlled drug unlawfully, gives a reason, and invokes section 23 of the Misuse of Drugs Act 1977. You disagree with the suspicion.','What does that power depend on?','Section 23 requires reasonable cause to suspect unlawful possession of a controlled drug. It permits a warrantless search and detention reasonably necessary for it. A Garda’s assertion alone does not settle whether the grounds are lawful.','I do not agree with the grounds. Please explain them.',['drugs'],[
 c('It can only be used after a judge has found you guilty.','A search power can arise during an investigation, before any conviction.','search-disagree',true),
 c('It requires reasonable-cause suspicion; it is not an unlimited search power.','That is the legal condition to consider. A solicitor can advise on whether it was satisfied.','search-disagree'),
 c('Saying “section 23” removes all limits on the search.','The conditions and limits still apply, even when the section is named.','search-disagree',true)
 ]),
 'search-disagree':n('You disagree with the search','The Garda says the search will proceed under that power. You feel anxious and do not want to agree to something you believe is unfair.','How could you state your position?','Not consenting does not prevent a search supported by a lawful power. Obstructing the lawful exercise of drug-search powers can be an offence. You can state an objection and seek advice afterwards.','I am not consenting, but I will not physically obstruct the search.',['drugs','obstruction'],[
 c('Pull the bag away and physically block the search.','Physical obstruction of a lawful search can have legal consequences. Your objection can be stated without force.','search-end',true),
 c('Say you consent because otherwise you lose the right to ask questions.','You do not have to describe a search as consensual simply to ask what is happening.','search-end',true),
 c('State your objection, avoid physical obstruction and remember the details.','This records your position while leaving the legal dispute to be addressed with advice.','search-end')
 ]),
 'search-end':n('The search is over','Nothing is found in this fictional search and you are told you can leave. You want to understand whether the search was justified.','What should guide that assessment?','Finding nothing does not automatically make a search unlawful. Its legal basis and grounds at the time matter. Seek advice with a factual account of the encounter.','What grounds existed when the search began?',['drugs','eu'],[
 c('The grounds at the time and whether the legal conditions were met.','A factual record will help a solicitor assess the power used and your treatment.','end'),
 c('Every search that finds nothing is automatically unlawful.','The result alone does not answer whether the original grounds met the legal test.','end',true),
 c('A search can never be challenged if a Garda names an Act.','Naming legislation does not prove that its conditions were satisfied.','end',true)
 ])}},
 {id:'arrest',title:'Told you are under arrest',person:'Daniel, 32',context:'Outside a shop after an incident',description:'An allegation, an arrest and questions at the station. Explore when and how to ask for legal advice.',icon:'key',minutes:'5–6 minutes',start:'arrest-start',nodes:{
 'arrest-start':n('“You are under arrest.”','You are Daniel. A Garda tells you that you are being arrested in connection with an incident at a shop. You think they have mistaken you for someone else.','What would you ask?','You are entitled to be told the reason for your arrest. An arrest is not a conviction. Ask for a solicitor and explain concerns about the arrest to them.','What am I being arrested for? I want to speak to a solicitor.',['arrest','dpp'],[
 c('Assume that arrest means you have already been found guilty.','An arrest and a finding of guilt are different stages.','arrest-lawyer',true),
 c('Ask for the reason and request a solicitor without physically resisting.','You can dispute the allegation and use legal assistance to challenge what has happened.','arrest-lawyer'),
 c('Try to pull free because you believe the allegation is wrong.','Physical resistance can make the situation more dangerous. Ask for legal assistance to challenge the arrest.','arrest-lawyer',true)
 ]),
 'arrest-lawyer':n('“Let’s clear this up.”','At the station, a Garda asks you to explain the incident. You want to go home and wonder whether asking for a solicitor will make you look guilty.','What would you do before an interview?','You have a right to confidential legal advice. Request a solicitor before an interview and ask for them to attend it. Exercising that right is not an admission of guilt.','I want to consult a solicitor privately before the interview.',['dpp','interviews'],[
 c('Ask for confidential legal advice and solicitor attendance.','You can discuss the allegation, the evidence and how to approach questions before deciding what to say.','arrest-silence'),
 c('Turn down advice because it guarantees an earlier release.','Declining advice does not guarantee release. You can ask for a solicitor even if you initially declined.','arrest-reconsider',true),
 c('Ask the interviewing Garda to act as your independent lawyer.','The interviewing Garda is not your independent legal adviser. Request a solicitor.','arrest-reconsider',true)
 ]),
 'arrest-reconsider':n('You can ask again','You initially said you did not need legal advice. Before the interview starts, you feel unsure.','Are you stuck with your earlier decision?','You can change your mind and request a solicitor. Make that request clear to the member in charge. Legal advice can help you understand any proposed interview and its safeguards.','I have changed my mind. I want a solicitor.',['interviews','iccl'],[
 c('Yes: once you decline, you cannot ask again.','You can change your mind. Tell the member in charge clearly.','arrest-silence',true),
 c('No: clearly ask for a solicitor now.','Your earlier decision does not stop you requesting legal advice now.','arrest-silence'),
 c('Wait silently and hope someone notices you want advice.','There is no need to rely on someone guessing. Say that you want a solicitor.','arrest-silence',true)
 ]),
 'arrest-silence':n('What about staying silent?','Before the interview, you ask your solicitor about refusing to answer questions. You have seen conflicting advice online.','Which statement is the most accurate?','There is a general right to silence, with exceptions. Required identifying details and specific provisions allowing inferences need separate consideration. Get advice about any warning; silence alone is not a guarantee of no consequences.','Please explain this warning and advise me before I decide whether to answer.',['silence','publicOrder'],[
 c('Silence always prevents a case from proceeding.','A case may still proceed on other evidence, and particular silence provisions can matter.','arrest-time',true),
 c('Being arrested removes the right to silence entirely.','Arrest does not erase the general right. A solicitor can explain the applicable exceptions.','arrest-time',true),
 c('There is a general right, but specific duties and exceptions need legal advice.','This avoids treating either total silence or answering everything as a universal rule.','arrest-time')
 ]),
 'arrest-time':n('How long can this last?','You have been at the station for several hours. A friend once said that everyone has to be released after the same number of hours.','What information should you ask for?','Detention limits depend on the legislation and circumstances, including permitted extensions and excluded periods. Ask which power applies and have your solicitor check the custody record and calculation.','What detention power applies, and how is my detention time being calculated?',['arrest','eu'],[
 c('Ask the member in charge and your solicitor to explain the applicable limit.','You need the rule for this detention, not a number remembered from another situation.','end'),
 c('Assume that one time limit applies to every offence and situation.','Different detention powers have different limits and safeguards.','end',true),
 c('Assume that Gardaí can keep you indefinitely without legal limits.','Detention is subject to legal limits and can be challenged.','end',true)
 ])}},
 {id:'custody',title:'Understanding the station',person:'Maya, 34',context:'In custody and needing language support',description:'You need an interpreter, legal advice and medication. Learn how to ask for support.',icon:'message',minutes:'4–5 minutes',start:'custody-start',nodes:{
 'custody-start':n('The words are unfamiliar','You are Maya. You understand everyday English but are struggling with the legal explanation at the station. You are worried about agreeing to something you do not understand.','What would you ask for?','If needed in Garda custody, interpretation and translation assistance are free. Say what language or communication support you need.','I need an interpreter to understand this and speak with my solicitor.',['dpp'],[
 c('Nod along so that nobody thinks you are being difficult.','Nodding does not solve the lack of understanding. Make your need clear.','custody-lawyer',true),
 c('Ask for an interpreter and explain what you do not understand.','This requests support before you make decisions about the interview or documents.','custody-lawyer'),
 c('Assume that needing an interpreter means you cannot get a solicitor.','Interpretation can support confidential communication with your solicitor.','custody-lawyer',true)
 ]),
 'custody-lawyer':n('Worried about the cost','You want a solicitor but do not know one and worry about paying. You have not yet discussed eligibility for legal assistance.','What is the useful next step?','Ask for a solicitor and for the Garda Station Legal Advice Scheme to be explained. Free assistance has eligibility rules; do not assume it is unavailable or that every private fee is covered.','I want a solicitor. Please explain whether I qualify for free legal assistance.',['legalAid','dpp'],[
 c('Give up on legal advice because you do not know a solicitor.','Tell the member in charge you need one and ask about available assistance.','custody-health',true),
 c('Assume that any private solicitor’s fee is automatically paid by the State.','Ask about eligibility and arrangements instead of assuming every fee is covered.','custody-health',true),
 c('Request a solicitor and ask about the scheme and its conditions.','You can ask for an explanation of the options and cost arrangements.','custody-health')
 ]),
 'custody-health':n('You need your medication','You are due prescribed medication and are starting to feel unwell. You have not told anyone yet.','What would you do?','Tell the member in charge about illness, injury or medication needs and ask for medical attention. They are responsible for welfare in custody.','I feel unwell and need medical attention. I take prescribed medication.',['dpp','eu'],[
 c('Tell the member in charge and request medical help.','This lets staff address the concern and arrange medical attention.','custody-contact'),
 c('Say nothing because medical care must wait until an interview is finished.','Do not assume you have to wait. Raise your health needs when they arise.','custody-contact',true),
 c('Assume medication can be taken without telling custody staff.','Tell staff what you need so treatment can be assessed and managed safely.','custody-contact',true)
 ]),
 'custody-contact':n('Someone is waiting for you','Your sister expects you home. You want her to know which station you are in.','What can you request?','An adult in custody may have another person informed of their detention. Notification is not a general entitlement to unrestricted use of your own phone.','Please let my sister know I am detained and where I am.',['dpp','eu'],[
 c('Demand unlimited access to your own phone as the only way to use the right.','The right to have someone informed is different from unrestricted personal phone use.','end',true),
 c('Ask for your sister to be notified of your detention and location.','This clearly identifies the person and the information you want passed on.','end'),
 c('Assume that only a solicitor is allowed to know where you are.','You can ask for another person to be informed too.','end',true)
 ])}},
 {id:'young-person',title:'You are sixteen',person:'Jamie, 16',context:'Taken to a Garda station',description:'Being under 18 matters. Explore support from a solicitor and a parent, guardian or other adult.',icon:'people',minutes:'4–5 minutes',start:'youth-start',nodes:{
 'youth-start':n('You do not want to worry anyone','You are Jamie, aged 16. You have been arrested and brought to a station. You are embarrassed and think about saying that you are 18.','What should you tell the member in charge?','Being under 18 brings additional safeguards. Give your correct age and ask for your rights to be explained and your parent or guardian to be contacted.','I am sixteen. Please explain my rights and contact my parent or guardian.',['youth','dpp'],[
 c('Say you are 18 to make the encounter less embarrassing.','Your correct age is important to the safeguards and support you should receive.','youth-adult',true),
 c('Say nothing about your age and expect everyone to know.','Make your age clear so the right arrangements can be addressed.','youth-adult',true),
 c('Give your correct age and ask for adult support and a solicitor.','You have identified your age and the help you need.','youth-adult')
 ]),
 'youth-adult':n('An interview is mentioned','A Garda says an interview is planned. Your parent has not arrived and no other adult has been arranged.','What would you ask about?','A detained child is generally interviewed with a parent, guardian or another adult nominated by the member in charge. Section 61 sets specific exceptions; do not assume there are none.','Who will be with me? If you propose an exception, please explain it to my solicitor.',['childInterview'],[
 c('Ask about adult presence and request an explanation of any proposed exception.','This raises the safeguard while recognising that the law contains defined exceptions.','youth-solicitor'),
 c('Assume that the interviewing Garda automatically replaces the supporting adult.','The nominated adult under this rule must not be a Garda.','youth-solicitor',true),
 c('Assume that no child can ever be questioned without a parent, in any circumstances.','The general safeguard matters, but the Act includes specific exceptions and alternative adult arrangements.','youth-solicitor',true)
 ]),
 'youth-solicitor':n('“Your parent can advise you.”','Your parent arrives and wants to help. You still want independent advice about the allegation.','Does adult support replace a solicitor?','A parent or other adult supports the child; they do not replace independent legal advice. A child or relevant adult can request a solicitor under section 60.','I would like a solicitor as well as adult support.',['childSolicitor','childInterview'],[
 c('Yes: a parent’s presence ends the right to request a solicitor.','These are different forms of support. You can ask for legal advice too.','youth-understand',true),
 c('No: ask for a solicitor as well as adult support.','Both needs can be raised with the member in charge.','youth-understand'),
 c('Only children who already know a solicitor can ask for one.','You can request a solicitor without naming a particular firm.','youth-understand',true)
 ]),
 'youth-understand':n('A document you do not understand','Someone asks you to sign a written account. You notice a sentence that does not match what you meant.','What is a useful response?','Do not sign an account as accurate without understanding it. Ask for explanation, corrections and legal advice; a signature is not a shortcut to a promised release.','That is not what I meant. Please explain it and let me speak to my solicitor.',['statements','childInterview'],[
 c('Sign because every document is only an attendance record.','Documents can have different purposes. Find out what this one says before deciding.','end',true),
 c('Sign because it guarantees you will go home immediately.','No such guarantee follows from signing. Get the meaning and your options explained.','end',true),
 c('Point out the sentence and ask for clarification, corrections and advice.','You have raised the accuracy problem before endorsing the account.','end')
 ])}},
 {id:'fair-treatment',title:'“Why was I singled out?”',person:'Amina, 27',context:'Reflecting on a street encounter',description:'You are concerned that racism affected your treatment. Explore evidence, support and complaints.',icon:'notes',minutes:'4–5 minutes',start:'fair-start',nodes:{
 'fair-start':n('An encounter that stays with you','You are Amina, a Black Irish woman. A Garda has questioned you while other people nearby were not approached. You are told you can leave. The experience has made you feel singled out.','What is a useful starting point?','Concerns about racial profiling deserve to be heard. The INAR/ICCL report documents community experiences; this fictional encounter cannot determine whether discrimination or an unlawful act occurred.','My experience matters. I can record what happened and seek support.',['inarReport'],[
 c('Assume that a calm response guarantees fair treatment.','Your behaviour does not control another person’s conduct, and it does not excuse mistreatment.','fair-record',true),
 c('Take your concern seriously while recording facts and seeking support.','This makes space for your experience without claiming the game can decide the legal issue.','fair-record'),
 c('Assume that you lose your rights if you feel upset.','Feeling upset does not remove your rights or justify mistreatment.','fair-record',true)
 ]),
 'fair-record':n('Before the details fade','You are somewhere safe and decide to write down what happened. You do not know the Garda’s name.','What would be useful to record?','Record the time, place, words and actions, witnesses and any identifying details you have. Preserve existing evidence safely. You can complain without knowing the Garda’s name.','Separate what I observed from what I suspect.',['fiosru'],[
 c('A factual account, witness details and any available identifying information.','You do not need a perfect record to raise a concern. Be clear about what you know.','fair-route'),
 c('Nothing, because a missing Garda name makes a complaint impossible.','Fiosrú can try to identify a Garda if a complaint is accepted for investigation.','fair-route',true),
 c('Invent missing details to make the account sound more complete.','Accuracy matters. Mark uncertainty clearly instead of filling gaps with guesses.','fair-route',true)
 ]),
 'fair-route':n('Two reporting routes','You find iReport and Fiosrú online. Both appear relevant to what happened, but they do different things.','Which description is accurate?','Fiosrú handles formal complaints about individual Garda conduct. INAR’s iReport gathers confidential reports of racism. An iReport submission does not automatically lodge a Fiosrú complaint.','Which route fits what I want to report, and what support do I need?',['fiosru','ireport'],[
 c('Reporting to iReport automatically starts a formal Garda-conduct complaint.','The systems are separate. Use Fiosrú’s process if you want to make that formal complaint.','fair-deadline',true),
 c('Fiosrú is simply a new name for the local Garda station.','Fiosrú is the independent Office of the Police Ombudsman and replaced GSOC in April 2025.','fair-deadline',true),
 c('They have different purposes; I can consider either or both.','You can choose the appropriate routes and seek advice about each process.','fair-deadline')
 ]),
 'fair-deadline':n('You are not sure when to act','Several months have passed. You now feel ready to consider a formal complaint.','What should you know about timing?','A Fiosrú complaint normally needs to be made within 12 months. A late complaint may be accepted for good reason. Other legal remedies have their own deadlines.','Check the current process promptly and explain any delay.',['fiosru'],[
 c('Check the process now and seek advice on any delay or other legal deadlines.','You can make an informed decision without assuming that every route has the same time limit.','end'),
 c('Wait indefinitely because complaints never have deadlines.','There is normally a 12-month limit for Fiosrú complaints.','end',true),
 c('Assume a late complaint is automatically impossible in every case.','Fiosrú can consider a good reason for delay. Check with them instead of assuming.','end',true)
 ])}}
];
export const scenarioById = Object.fromEntries(scenarios.map(s=>[s.id,s]));
