import {encounters} from '../encounters/catalog.mjs';
import {gaContent} from './ga-content.mjs';
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=value=>value.replace(/&(amp|lt|gt|quot|apos|#39);/g,(_,s)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",'#39':"'"}[s]));
const dictionary=new Map();
for(const e of Object.values(encounters)){
 const ga=gaContent[e.id];dictionary.set(e.title,ga.title);dictionary.set(e.description,ga.description);
 for(const node of Object.values(e.nodes)){
  const translated=ga.nodes[node.id];dictionary.set(node.title,translated.title);dictionary.set(node.scene,translated.scene);
  for(const role of ['public','garda']){
   const v=node.views[role],a=translated[role];dictionary.set(v.prompt,a[0]);dictionary.set(v.lesson,a[1]);
   v.choices.forEach((c,i)=>{dictionary.set(c.text,a[2+i*2]);dictionary.set(c.feedback,a[3+i*2]);});
  }
 }
}
const ui={
 'Selected':'Roghnaithe','Play':'Baile','Play both sides':'An dá thaobh','Progress':'Dul chun cinn','Rights & sources':'Cearta agus foinsí','Evidence & sources':'Fianaise agus foinsí','About':'Eolas','Accessibility':'Inrochtaineacht',
 'Skip to the game':'Léim chuig an ábhar','Main navigation':'Príomhloingseoireacht','Language & reading':'Teanga agus léamh','Close settings':'Dún na socruithe','Language':'Teanga','Text size':'Méid an téacs','Standard (100%)':'Caighdeánach (100%)','Larger (115%)':'Níos mó (115%)','Large (130%)':'Mór (130%)','Extra large (150%)':'An-mhór (150%)','Contrast':'Codarsnacht','Standard':'Caighdeánach','High':'Ard','More reading space':'Níos mó spáis don léamh','Reduce motion':'Laghdaigh gluaiseacht','Apply preferences':'Cuir socruithe i bhfeidhm','Cancel':'Cealaigh','Reset reading preferences':'Athshocraigh socruithe léitheoireachta',
 'Your language and reading preferences are saved in this browser. Applying them keeps your answers, role and scores.':'Sábháiltear do theanga agus socruithe léitheoireachta sa bhrabhsálaí seo. Coinnítear do fhreagraí, do ról agus do scóir nuair a chuirtear i bhfeidhm iad.',
 'Irish covers all 14 shared situations, choices, explanations and progress. Source publications and the separate reference sections remain in English.':'Tá na 14 chás roinnte, roghanna, míniúcháin agus dul chun cinn ar fáil i nGaeilge. Fanann foilseacháin fhoinseacha agus na rannóga tagartha ar leith i mBéarla.',
 'Working translation: independent Irish-language and legal review is still needed. You can return to English at any time.':'Aistriúchán oibre: tá athbhreithniú neamhspleách Gaeilge agus dlí fós ag teastáil. Is féidir filleadh ar Bhéarla am ar bith.',
 'Reading preferences applied. Your progress is unchanged.':'Socruithe léitheoireachta curtha i bhfeidhm. Tá do dhul chun cinn mar a bhí.','Reading preferences reset.':'Socruithe léitheoireachta athshocraithe.','Preferences apply for this visit; browser saving is unavailable.':'Baineann na socruithe leis an gcuairt seo; níl sábháil sa bhrabhsálaí ar fáil.',
 'An interactive learning game for the public and Gardaí.':'Cluiche foghlama idirghníomhach don phobal agus do na Gardaí.',
 'Public perspective':'Dearcadh an phobail','Garda perspective':'Dearcadh an Gharda',
 'REPUBLIC OF IRELAND · PUBLIC PERSPECTIVE':'POBLACHT NA hÉIREANN · DEARCADH AN PHOBAIL','REPUBLIC OF IRELAND · GARDA PERSPECTIVE':'POBLACHT NA hÉIREANN · DEARCADH AN GHARDA',
 'REPUBLIC OF IRELAND · LEARN THROUGH CHOICES':'POBLACHT NA hÉIREANN · FOGHLAIM TRÍ ROGHANNA',
 'Practise what you can ask and what you may need to do when Gardaí stop, question, search or arrest you. Explore the same encounter from either side.':'Cleachtaigh cad is féidir leat a iarraidh agus cad a d’fhéadfadh a bheith de dhualgas ort nuair a stopann, ceistíonn, cuardaíonn nó gabhann Gardaí thú. Scrúdaigh an teagmháil chéanna ón dá thaobh.',
 'Practise checking assumptions, evidence and legal grounds when deciding to stop or search someone. See how the same encounter is experienced from either side.':'Cleachtaigh toimhdí, fianaise agus forais dhlíthiúla a sheiceáil nuair a chinneann tú duine a stopadh nó a chuardach. Féach ar an teagmháil chéanna ón dá thaobh.',
 '14 shared situations':'14 chás roinnte','No timer':'Gan teorainn ama','No sign-up':'Gan chlárú',
 'Take your time. You can revisit any choice. Your score reflects learning in the game; your rights never depend on it.':'Tóg do chuid ama. Is féidir filleadh ar aon rogha. Léiríonn do scór foghlaim sa chluiche; ní bhraitheann do chearta air riamh.',
 'Individual practice · original English scenarios':'Cleachtadh aonair · cásanna bunaidh i mBéarla',
 'These original English scenarios focus on one role. The shared situations above include both perspectives and are available in English and Irish.':'Díríonn na cásanna bunaidh Béarla seo ar ról amháin. Tá an dá thaobh sna cásanna roinnte thuas, i mBéarla agus i nGaeilge.',
 'PLAY BOTH SIDES':'IMIR AN DÁ THAOBH','One encounter. Two perspectives.':'Teagmháil amháin. Dhá dhearcadh.','Start as either character, switch sides at any stage and build your learning score.':'Tosaigh mar cheachtar carachtar, athraigh taobh ag aon chéim agus forbair do scór foghlama.',
 'Start as a member of the public':'Tosaigh mar dhuine den phobal','Start as a Garda':'Tosaigh mar Gharda','My scores & progress':'Mo scóir agus mo dhul chun cinn','Continue your situation':'Lean le do chás','Last recap':'An t-athbhreithniú deireanach','Open recap':'Oscail an t-athbhreithniú','Resume play':'Lean den imirt',
 'ONE SITUATION · TWO PERSPECTIVES':'CÁS AMHÁIN · DHÁ DHEARCADH','Which role will you start with?':'Cén ról a roghnóidh tú ar dtús?','Choose a role, then a situation. Switch sides at any stage to explore the same moment with different choices and responsibilities.':'Roghnaigh ról, ansin cás. Athraigh taobh ag aon chéim chun an nóiméad céanna a scrúdú le roghanna agus freagrachtaí éagsúla.','Starting role':'Ról tosaigh','Member of the public':'Duine den phobal','Member of An Garda Síochána':'Comhalta den Gharda Síochána','Garda':'Garda',
 'View your saved scores & progress':'Féach ar do scóir agus dul chun cinn sábháilte','RIGHTS & RESPONSIBILITIES':'CEARTA AGUS FREAGRACHTAÍ','BIAS & DECISION-MAKING':'CLAONADH AGUS CINNTEOIREACHT','Rights & responsibilities':'Cearta agus freagrachtaí','Bias & decision-making':'Claonadh agus cinnteoireacht','Play as the member of the public':'Imir mar dhuine den phobal','Play as the Garda':'Imir mar Gharda',
 'Garda involved in the encounter':'Garda sa teagmháil','Garda in the custody team':'Garda san fhoireann choimeádta','Patrol Garda':'Garda patróil','Responding Garda':'Garda atá ag freagairt','Community Garda':'Garda pobail','Youth-facing Garda':'Garda ag obair le daoine óga','Garda working with a colleague':'Garda ag obair le comhghleacaí','Community reviewer (member of the public)':'Athbhreithneoir pobail (duine den phobal)','Supervising sergeant':'Sáirsint maoirseachta','Person matching the fuller description':'Duine a mheaitseálann an cur síos iomlán',
 'Current perspective':'Dearcadh reatha','PLAYING AS A GARDA':'AG IMIRT MAR GHARDA','PLAYING AS A MEMBER OF THE PUBLIC':'AG IMIRT MAR DHUINE DEN PHOBAL','Garda perspective':'Dearcadh an Gharda','Public perspective':'Dearcadh an phobail','MEMBER OF THE PUBLIC PERSPECTIVE':'DEARCADH AN DUINE DEN PHOBAL','GARDA PERSPECTIVE':'DEARCADH AN GHARDA',
 'Switch to the public perspective':'Athraigh go dearcadh an phobail','Switch to the Garda perspective':'Athraigh go dearcadh an Gharda','Switch to the Garda site':'Athraigh go suíomh an Gharda','Switch to the public rights site':'Athraigh go suíomh chearta an phobail',
 'Scores on this route':'Scóir ar an mbealach seo','points':'pointe','No answers yet':'Gan fhreagra fós','← All shared situations':'← Gach cás roinnte','My progress':'Mo dhul chun cinn',
 'These facts stay the same when you switch roles. Private thoughts and separate debriefs are identified in the scene.':'Fanann na fíricí seo mar an gcéanna nuair a athraíonn tú ról. Aithnítear smaointe príobháideacha agus comhráite athbhreithnithe ar leith sa scéal.',
 'Your answer is recorded for this role.':'Tá do fhreagra taifeadta don ról seo.','Choose a response and see how it addresses the situation.':'Roghnaigh freagra agus féach conas a phléann sé leis an gcás.','1 LEARNING POINT':'1 PHOINTE FOGHLAMA','0 POINTS · AN OPPORTUNITY TO REVIEW':'0 POINTE · DEIS ATHMHACHNAIMH','Consider this before continuing.':'Meas é seo sula leanann tú ar aghaidh.','This supports an appropriate response.':'Tacaíonn sé seo le freagra cuí.','Why this matters':'Cén fáth a bhfuil sé seo tábhachtach','Read the sources for this decision':'Léigh foinsí an chinnidh seo','opens in a new tab':'osclaítear i gcluaisín nua',
 'Try the public perspective':'Bain triail as dearcadh an phobail','Try the Garda perspective':'Bain triail as dearcadh an Gharda','Review the public perspective':'Athbhreithnigh dearcadh an phobail','Review the Garda perspective':'Athbhreithnigh dearcadh an Gharda','See your scores & recap':'Féach ar do scóir agus athbhreithniú','Continue as the Garda':'Lean ar aghaidh mar Gharda','Continue as the member of the public':'Lean ar aghaidh mar dhuine den phobal','Reconsider this answer':'Déan athmhachnamh ar an bhfreagra seo','← Revisit the previous stage':'← Fill ar an gcéim roimhe',
 'Switching compares responses to the same moment. Continue follows the active role’s selected route; the other answer is kept for reflection. The next scene is fictional and does not predict anyone’s conduct.':'Cuireann athrú róil freagraí ar an nóiméad céanna i gcomparáid. Leanann “Lean ar aghaidh” bealach roghnaithe an róil ghníomhaigh; coinnítear an freagra eile don mhachnamh. Tá an chéad scéal eile ficseanúil agus ní thuarann sé iompar duine ar bith.',
 '1 point for a choice that supports an appropriate resolution on these facts; 0 when the reasoning needs review. This measures learning, not personal bias or responsibility for someone else’s conduct.':'1 phointe do rogha a thacaíonn le réiteach cuí ar na fíricí seo; 0 nuair is gá an réasúnaíocht a athmheas. Tomhaiseann sé foghlaim, ní claonadh pearsanta ná freagracht as iompar duine eile.',
 'Progress is saved in this browser. Use the site-switch button to carry it to the companion site.':'Sábháiltear dul chun cinn sa bhrabhsálaí seo. Úsáid an cnaipe athraithe suímh chun é a thabhairt chuig an suíomh eile.',
 'Browser saving is unavailable. Your progress is kept for this visit; the site-switch button can still carry it across.':'Níl sábháil sa bhrabhsálaí ar fáil. Coinnítear dul chun cinn don chuairt seo; is féidir leis an gcnaipe athraithe suímh é a iompar fós.',
 'Saved progress':'Dul chun cinn sábháilte','YOUR SCORES & REFLECTION RECAP':'DO SCÓIR AGUS ATHBHREITHNIÚ','One situation.':'Cás amháin.','What did each side reveal?':'Cad a léirigh gach taobh?','Route completed in this role.':'Bealach críochnaithe sa ról seo.','Best completed route:':'An bealach críochnaithe is fearr:','No completed route yet':'Gan bhealach críochnaithe fós','Replay as the Garda':'Imir arís mar Gharda','Replay as the member of the public':'Imir arís mar dhuine den phobal','You did not answer this stage in this role.':'Níor fhreagair tú an chéim seo sa ról seo.','Replay from this stage as the Garda':'Imir arís ón gcéim seo mar Gharda','Replay from this stage as the member of the public':'Imir arís ón gcéim seo mar dhuine den phobal','Switch recap perspective':'Athraigh dearcadh an athbhreithnithe','View all progress':'Féach ar an dul chun cinn ar fad',
 'YOUR LEARNING RECORD':'DO THAIFEAD FOGHLAMA','Scores & progress':'Scóir agus dul chun cinn','Build progress separately as a member of the public and as a Garda. Revisit a choice to improve your understanding; the same stage can earn only one saved point per role.':'Forbair dul chun cinn ar leith mar dhuine den phobal agus mar Gharda. Fill ar rogha chun do thuiscint a fheabhsú; ní féidir ach pointe sábháilte amháin a fháil ag an gcéim chéanna i ngach ról.',
 'Play as a Garda':'Imir mar Gharda','Play as a member of the public':'Imir mar dhuine den phobal','How your score works':'Conas a oibríonn do scór',
 'Each stage awards 1 point for a response that supports an appropriate resolution according to its explanation and sources, or 0 for a response that needs review. More than one choice can earn a point. There are no deductions for taking time or switching roles.':'Tugann gach céim 1 phointe d’fhreagra a thacaíonn le réiteach cuí de réir an mhínithe agus na bhfoinsí, nó 0 d’fhreagra le hathmheas. Is féidir le níos mó ná rogha amháin pointe a fháil. Ní bhaintear pointí as am a ghlacadh ná ról a athrú.',
 'The current route shows points out of the decisions you answered. A completed role score requires an answer in that role at every stage on the route. Best completed results use percentages because different routes can have different lengths.':'Taispeánann an bealach reatha pointí as na cinntí a d’fhreagair tú. Teastaíonn freagra sa ról ag gach céim chun scór róil críochnaithe a fháil. Úsáidtear céatadáin do na torthaí is fearr mar go mbíonn faid éagsúla ag bealaí.',
 'Your saved learning points count your best result at each unique stage, so repeating a stage cannot inflate the total. Improving an answer from 0 to 1 updates your progress.':'Áirítear an toradh is fearr ag gach céim ar leith sna pointí sábháilte; ní ardaíonn athdhéanamh céime an t-iomlán. Nuashonraíonn feabhsú freagra ó 0 go 1 do dhul chun cinn.',
 'A score is not a measure of a person’s bias, a professional qualification or a prediction of a real encounter. Rights remain the same regardless of a score.':'Ní tomhas ar chlaonadh duine, cáilíocht ghairmiúil ná tuar fíortheagmhála é scór. Fanann cearta mar an gcéanna beag beann ar scór.',
 'Play this role':'Imir an ról seo','Manage your progress':'Bainistigh do dhul chun cinn',
 'Only fictional game choices and scores are saved locally. There is no account or upload. When you use the site-switch button, the game carries this progress in the link’s fragment and merges it with progress already saved on the other site. Copying that link can share the included learning record. Separate browsers and devices do not automatically sync.':'Ní shábháiltear go háitiúil ach roghanna agus scóir fhicseanúla. Níl cuntas ná uaslódáil ann. Iompraíonn an cnaipe athraithe suímh an dul chun cinn i mblúire an naisc agus cumascann é le dul chun cinn ar an suíomh eile. Is féidir le cóipeáil an naisc an taifead foghlama sin a roinnt. Ní shioncronaíonn brabhsálaithe ná gléasanna ar leith go huathoibríoch.',
 'Clear the scores and resume point saved on this site in this browser? The companion site and previously copied links may still hold their own copy.':'An nglanfar na scóir agus an pointe atosaithe ar an suíomh seo sa bhrabhsálaí seo? D’fhéadfadh cóip a bheith ar an suíomh eile agus i naisc a cóipeáladh roimhe.',
 'Clear this site’s saved progress':'Glan dul chun cinn sábháilte an tsuímh seo','Keep progress':'Coinnigh dul chun cinn','Your saved progress on this site has been cleared.':'Glanadh do dhul chun cinn sábháilte ar an suíomh seo.',
 'Unable to open this situation':'Ní féidir an cás seo a oscailt','This page was not found.':'Níor aimsíodh an leathanach seo.','The progress in this link could not be read.':'Níorbh fhéidir an dul chun cinn sa nasc seo a léamh.','This situation link is incomplete or from an unsupported version. Your saved scores are still available.':'Tá an nasc neamhiomlán nó ó leagan nach dtacaítear leis. Tá do scóir sábháilte ar fáil fós.','Choose a situation':'Roghnaigh cás',
 'Independent educational prototype · Republic of Ireland':'Fréamhshamhail oideachais neamhspleách · Poblacht na hÉireann',
 'General information, not legal advice. Not endorsed by INAR, ICCL or An Garda Síochána. © 2026 Sam O’Brien-Olinger.':'Eolas ginearálta, ní comhairle dlí. Gan formhuiniú ó INAR, ICCL ná ón nGarda Síochána. © 2026 Sam O’Brien-Olinger.',
 'Reflective learning, not operational guidance. Independent; not endorsed by An Garda Síochána, INAR or ICCL. © 2026 Sam O’Brien-Olinger.':'Foghlaim mhachnamhach, ní treoir oibríochtúil. Neamhspleách; gan formhuiniú ón nGarda Síochána, INAR ná ICCL. © 2026 Sam O’Brien-Olinger.'
};
Object.entries(ui).forEach(([a,b])=>dictionary.set(a,b));
export function translateText(text,lang='en'){
 if(lang!=='ga')return text;
 const s=String(text).trim();if(dictionary.has(s))return dictionary.get(s);
 let m;
 if((m=s.match(/^(.*?)(\s+[⇄→↗])$/)))return translateText(m[1],lang)+m[2];
 if((m=s.match(/^(.*):$/))&&dictionary.has(m[1]))return translateText(m[1],lang)+':';
 if((m=s.match(/^(\d+)\. (.+)$/)))return m[1]+'. '+translateText(m[2],lang);
 if((m=s.match(/^(.*) · SHARED SCENE$/)))return translateText(m[1],lang)+' · SCÉAL ROINNTE';
 if((m=s.match(/^Same situation · (stage (\d+)|recap)$/)))return 'An cás céanna · '+(m[2]?'céim '+m[2]:'athbhreithniú');
 if((m=s.match(/^(.*) · (\d+) stages on this route\.$/)))return translateText(m[1],lang)+' · '+m[2]+' céim ar an mbealach seo.';
 if((m=s.match(/^(.*) · continued this stage$/)))return translateText(m[1],lang)+' · lean ar aghaidh ag an gcéim seo';
 if((m=s.match(/^(\d+) decisions? answered$/)))return m[1]+' cinneadh freagartha';
 if((m=s.match(/^(\d+) of (\d+) stages answered in this role\. Answer each stage to complete this role’s route\.$/)))return `${m[1]} as ${m[2]} céim freagartha sa ról seo. Freagair gach céim chun bealach an róil a chríochnú.`;
 if((m=s.match(/^\/ (\d+) learning points$/)))return '/ '+m[1]+' pointe foghlama';
 if((m=s.match(/^(\d+) stages explored · (\d+) of (\d+) situations completed in this role\.$/)))return `${m[1]} céim scrúdaithe · ${m[2]} as ${m[3]} chás críochnaithe sa ról seo.`;
 if((m=s.match(/^(Latest completed|Best completed): (.*)$/)))return (m[1]==='Latest completed'?'An ceann críochnaithe is déanaí':'An ceann críochnaithe is fearr')+': '+translateText(m[2],lang);
 if((m=s.match(/^(.*) saved learning points$/)))return translateText(m[1],lang)+' — pointí foghlama sábháilte';
 if((m=s.match(/^(\d+) \/ 1 point$/)))return m[1]+' / 1 phointe';
 if(s.includes(' — '))return s.split(' — ').map(x=>translateText(x,lang)).join(' — ');
 if((m=s.match(/^(Play as the member of the public|Play as the Garda|Play this role): (.+)$/)))return translateText(m[1],lang)+': '+translateText(m[2],lang);
 if(s.includes(' · '))return s.split(' · ').map(x=>translateText(x,lang)).join(' · ');
 return text;
}
// Translate trusted app templates only. Identifiers, route tokens, links and source publications are preserved.
export function translateHTML(html,lang='en'){
 if(lang!=='ga')return html;
 const stack=[];let skip=false;
 return html.split(/(<[^>]*>)/g).map(part=>{
  if(!part.startsWith('<'))return skip?part:part.replace(/^(\s*)([\s\S]*?)(\s*)$/,(_,a,b,c)=>a+escapeHTML(translateText(decode(b),lang))+c);
  if(/^<\//.test(part)){skip=stack.pop()??false;return part;}
  if(/^<!/.test(part))return part;
  const preserve=skip||/\bdata-no-translate\b/.test(part);
  if(!/^<(?:br|hr|img|input|meta|link|wbr|source)\b/i.test(part)&&!part.endsWith('/>')){stack.push(skip);skip=preserve;}
  return preserve?part:part.replace(/((?:aria-label|title)=")([^"]*)"/g,(_,a,b)=>a+escapeHTML(translateText(decode(b),lang))+'"');
 }).join('');
}
export {gaContent};
