import {writeFileSync} from 'node:fs';
import {sources,groups,scenarios} from '../garda/data.mjs?v=site-repairs-20261125';
import {encounters,references} from '../encounters/catalog.mjs?v=site-repairs-20261125';
import {colleagueDiscriminationReferences} from '../encounters/colleague-discrimination.mjs?v=situation-locations-20261122';
const root=new URL('../research/',import.meta.url);
let refs=`# Bibliography\n\n${Object.keys(sources).length+Object.keys(colleagueDiscriminationReferences).length} sources, including ${Object.values(sources).filter(s=>s.kind.startsWith('Academic')).length} academic publications. This is a selected evidence library. Source limitations and design interpretations appear in the site's Evidence & sources section.\n\n`;
for(const [id,label] of Object.entries(groups)){
 refs+=`## ${label}\n\n`;
 for(const [key,s] of Object.entries(sources).filter(([,s])=>s.group===id))refs+=`- **${s.authors} (${s.year}).** [${s.title}](${s.url}). *${s.publication}*. ${s.kind}; ${s.place}. Review access: ${s.access}. Source key: \`${key}\`.\n\n`;
}
refs+='## Additional sources for colleague-witness situations\n\nThese sources support Garda ethical commitments, public direct-witness complaint information and communication with crime victims. They are linked from the relevant decisions.\n\n';
for(const source of Object.values(colleagueDiscriminationReferences))refs+=`- [${source.title}](${source.url}).\n\n`;
writeFileSync(new URL('bibliography.md',root),refs.trimEnd()+'\n');
let map='# Scenario-to-evidence map\n\nAll people, events, dialogue and numerical examples are invented. Sources support concepts and review prompts; they do not supply the fictional facts or endorse the scenarios.\n\n';
for(const s of scenarios){
 map+=`## ${s.title}\n\n| Decision | Concept | Linked sources |\n| --- | --- | --- |\n`;
 for(const [id,n] of Object.entries(s.nodes))map+=`| ${n.title.replaceAll('|','/')} (\`${id}\`) | ${n.concept} | ${n.sources.map(r=>`[${sources[r].short}](${sources[r].url})`).join('; ')} |\n`;
 map+='\n';
}
map+='## PABI across shared situations\n\nPABI supplies community-experience research alongside the legal, ethical and statistical sources. It does not determine the legality of the fictional encounters, establish national prevalence or evaluate this resource.\n\n| Situation | Decisions linking PABI |\n| --- | --- |\n';
for(const encounter of Object.values(encounters)){
 const decisions=Object.values(encounter.nodes).filter(node=>Object.values(node.views).some(view=>view.refs.some(ref=>['public:pabi','garda:pabi'].includes(ref))));
 if(decisions.length)map+=`| ${encounter.title} (\`${encounter.id}\`) | ${decisions.map(node=>node.title).join('; ')} |\n`;
}
map+='\n';
map+='## Witnessing discriminatory colleague behaviour\n\nEach ground has an additional two-stage situation. Both playable characters are witnesses; the affected person and the Garda whose behaviour is challenged are separate people. Garda reporting responsibilities and public witness complaint routes remain distinct. Housing assistance is specific to accommodation.\n\n| Situation | Decision | Witness perspectives and supporting sources |\n| --- | --- | --- |\n';
for(const encounter of Object.values(encounters).filter(item=>item.kind==='colleague-witness'))for(const node of Object.values(encounter.nodes)){
 const linked=[...new Set(Object.values(node.views).flatMap(view=>view.refs))];
 map+=`| ${encounter.title} (\`${encounter.id}\`) | ${node.title} | ${linked.map(id=>`[${references[id].title}](${references[id].url})`).join('; ')} |\n`;
}
map+='\n';
map+='## Sources supporting the wider design\n\nThe evidence-page synthesis also cites Carvalho and colleagues, Petersen and colleagues, and FRA’s 2024 report. The About page links the professional framework and the evidence for repeated, supported learning.\n';
writeFileSync(new URL('scenario-evidence-map.md',root),map);
console.log(`Indexed ${Object.keys(sources).length+Object.keys(colleagueDiscriminationReferences).length} sources and ${scenarios.reduce((n,s)=>n+Object.keys(s.nodes).length,0)} decisions.`);
