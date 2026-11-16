export const practiceGoals = {
 'public-street': 'Asking why you have been stopped',
 'public-search': 'Asking what a search is based on',
 'public-arrest': 'Asking about the arrest and a possible mistake',
 'public-custody': 'Checking that an explanation is understood',
 'public-young-person': 'Making age and support needs clear',
 'public-fair-treatment': 'Recording what happened and finding support',
 'garda-street': 'Separating observations from assumptions',
 'garda-description': 'Checking how specific a description is',
 'garda-search': 'Checking the facts behind a proposed search',
 'garda-communication': 'Checking understanding before judging behaviour',
 'garda-young-person': 'Keeping age and the stated facts in view',
 'garda-colleague': 'Questioning assumptions about a family',
 'garda-new-evidence': 'Reassessing a decision when the facts change',
 'garda-supervision': 'Identifying what search figures leave out'
};

const definitions = {
 street: ['Observation', 'Something you saw or heard yourself.'],
 search: ['Grounds for a search', 'The information used to explain why this particular search is proposed.'],
 custody: ['In custody', 'In this situation, being held at a Garda station.'],
 young: ['Support needs', 'Help someone may need to understand what is happening and take part.'],
 fairness: ['An account of an encounter', 'A description of what happened from one person’s point of view.'],
 supervision: ['Find rate', 'The share of searches in which something was found.']
};
export const termFor = (id,topic) => definitions[id==='garda-supervision'?'supervision':topic];

export const evidenceTasks = {
 'public-search/search-start': [
  ['Niamh is at a bus stop with a bag.', 'seen'],
  ['A search is planned, according to the Garda.', 'told'],
  ['Why this bag is being singled out for a search.', 'check']
 ],
 'garda-description/description-start': [
  ['Amina is wearing a dark jacket.', 'seen'],
  ['A caller says a bag was stolen.', 'told'],
  ['Whether Amina is the person the caller saw.', 'check']
 ],
 'garda-search/search-start': [
  ['Niamh is waiting with a bag.', 'seen'],
  ['The briefing mentions drug activity near the bus stop.', 'told'],
  ['Whether there is information connecting Niamh to drugs.', 'check']
 ]
};

// These are the facts shown to each role in the opening decision. Later
// decisions use the role-specific scene and question from the scenario.
export const openingPerspectives = {
 'public-street': {
  public:'You have been asked where you are going. You have not been told why you were stopped.',
  garda:'You asked where the person is going. You have not explained a suspected offence or a requirement to stay.'
 },
 'public-search': {
  public:'You have been asked to let the Garda search your bag. You have not heard a reason.',
  garda:'You have proposed a search. You have yet to explain the reason or power you are relying on.'
 },
 'public-arrest': {
  public:'You have been told you are under arrest for a nearby shop theft. You believe there has been a mistake.',
  garda:'You have told the person they are under arrest. Their concern about mistaken identity needs to be heard.'
 },
 'public-young-person': {
  public:'You know you are 16 and are thinking about saying you are 18.',
  garda:'You know the young person is at the station. Their age and understanding need to be checked.'
 },
 'garda-supervision': {
  public:'You brought the residents’ concerns to the sergeant and have been shown the search summary.',
  garda:'You shared the search summary with the community reviewer. It gives finds and totals for each group.'
 }
};

export const reviewScene = 'A community reviewer meets the supervising Garda sergeant after residents say they felt singled out during searches.';
export const reviewBackground = 'At a local community meeting, several residents said they felt singled out when Gardaí stopped and searched them.\n\nThe group asked one of its members to bring their concerns to the supervising Garda sergeant. At a follow-up meeting, the sergeant shares a summary of recent searches so they can decide together what to look into.\n\nIn this review, Gardaí found something in 12 of 60 searches in Group A and 3 of 15 in Group B. That’s one in five searches in both groups.\n\nThe reviewers want to know who Gardaí encountered, why they searched people and how those people were treated.';
export const searchFigures = [
 {group:'Group A', searches:60, finds:12},
 {group:'Group B', searches:15, finds:3}
];
export const reviewExamples = [
 ['Patrol time', 'Suppose one area received twice as much patrol time.', 'How might that affect who Gardaí encountered?'],
 ['People encountered', 'Suppose Gardaí encountered 120 people in Group A and 60 in Group B.', 'What could the reviewers compare with the number of searches?'],
 ['Recorded reasons', 'Suppose the records give a specific reason for some searches and only a short label for others.', 'What would that tell them about why particular people were searched?']
];

export const discussionQuestions = [
 'What did each person know when they made their decision?',
 'What would you ask or look into next?'
];
export const reviewQuestions = [
 'What do the two find rates tell you, and what else would you need to know?',
 'What should the sergeant and community reviewer look into together?'
];
