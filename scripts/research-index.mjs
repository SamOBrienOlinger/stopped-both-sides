import {writeFileSync} from 'node:fs';
import {sources,groups,CHECKED,scenarios} from '../garda/data.mjs';
import {encounters,references} from '../encounters/catalog.mjs';
const root=new URL('../research/',import.meta.url);
let refs=`# Bibliography\n\nReview date: ${CHECKED}. ${Object.keys(sources).length} sources, including ${Object.values(sources).filter(s=>s.kind.startsWith('Academic')).length} academic publications. This is a selected evidence library. Source limitations and design interpretations appear in the site's Evidence & sources section.\n\n`;
for(const [id,label] of Object.entries(groups)){
 refs+=`## ${label}\n\n`;
 for(const [key,s] of Object.entries(sources).filter(([,s])=>s.group===id))refs+=`- **${s.authors} (${s.year}).** [${s.title}](${s.url}). *${s.publication}*. ${s.kind}; ${s.place}. Review access: ${s.access}. Source key: \`${key}\`.\n\n`;
}
writeFileSync(new URL('bibliography.md',root),refs.trimEnd()+'\n');
let map='# Scenario-to-evidence map\n\nAll people, events, dialogue and numerical examples are invented. Sources support concepts and review prompts; they do not supply the fictional facts or endorse the scenarios.\n\n';
for(const s of scenarios){
 map+=`## ${s.title}\n\n| Decision | Concept | Linked sources |\n| --- | --- | --- |\n`;
 for(const [id,n] of Object.entries(s.nodes))map+=`| ${n.title.replaceAll('|','/')} (\`${id}\`) | ${n.concept} | ${n.sources.map(r=>`[${sources[r].short}](${sources[r].url})`).join('; ')} |\n`;
 map+='\n';
}
const reportingConcepts={
 'public-witness':{
  'witness-start':'Safety and careful observation',
  'witness-record':'Fact, inference and uncertainty',
  'witness-evidence':'Preserving original evidence',
  'witness-standing':'Direct-witness complaints',
  'witness-route':'Independent and protected reporting routes',
  'witness-outcome':'Reporting is not a verdict'
 },
 'public-corruption':{
  'envelope-start':'Suspicion is not proof',
  'envelope-route':'Reporting possible corruption without investigating it yourself'
 }
};
map+='## Shared reporting scenarios\n\nThese additions use one shared incident with distinct public-witness and Garda-colleague decisions. The fact, concern and unknown panels are role-specific; the underlying scene is not.\n\n';
for(const [encounterId,concepts] of Object.entries(reportingConcepts)){
 const encounter=encounters[encounterId];
 map+=`### ${encounter.title}\n\n| Decision | Concept | Linked sources |\n| --- | --- | --- |\n`;
 for(const [nodeId,concept] of Object.entries(concepts)){
  const node=encounter.nodes[nodeId],refs=[...new Set(node.views.public.refs)];
  map+=`| ${node.title.replaceAll('|','/')} (\`${nodeId}\`) | ${concept} | ${refs.map(ref=>`[${references[ref].title}](${references[ref].url})`).join('; ')} |\n`;
 }
 map+='\n';
}
map+='## Sources supporting the wider design\n\nThe evidence-page synthesis also cites Carvalho and colleagues, Petersen and colleagues, and FRA’s 2024 report. The About page links the professional framework and the evidence for repeated, supported learning.\n';
writeFileSync(new URL('scenario-evidence-map.md',root),map);
console.log(`Indexed ${Object.keys(sources).length} sources, ${scenarios.reduce((n,s)=>n+Object.keys(s.nodes).length,0)} Garda decisions and ${Object.values(reportingConcepts).reduce((n,nodes)=>n+Object.keys(nodes).length,0)} shared reporting decisions.`);
