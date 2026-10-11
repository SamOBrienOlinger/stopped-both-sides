// Full-sentence templates keep dynamic counts and names in the translator's order.
// Values are plain text; HTML escaping is performed only at the rendering boundary.
export const messagePatterns=[
 [/^A selected review of (\d+) academic publications, alongside Irish law, professional guidance and community research\. Each source explains how it informed the game\.$/, 'A selected review of {count} academic publications, alongside Irish law, professional guidance and community research. Each source explains how it informed the game.', ['count']],
 [/^(\d+) years old$/, '{count} years old', ['count']],
 [/^Stage (\d+)$/, 'Stage {count}', ['count']],
 [/^Decision (\d+)$/, 'Decision {count}', ['count']],
 [/^SITUATION (\d+)$/, 'SITUATION {count}', ['count']],
 [/^([\d–]+) decisions remaining, including this one$/, '{count} decisions remaining, including this one', ['count']],
 [/^(\d+) stages explored · (\d+) learning points$/, '{stages} stages explored · {points} learning points', ['stages','points']],
 [/^(.*?) situations completed$/, '{role} situations completed', ['role']],
 [/^Choose character: (.+)$/, 'Choose character: {name}', ['name']],
 [/^(.*?) · SHARED SCENE$/, '{title} · SHARED SCENE', ['title']],
 [/^Same situation · stage (\d+)$/, 'Same situation · stage {count}', ['count']],
 [/^(.*?) · (\d+) stages on this route\.$/, '{title} · {count} stages on this route.', ['title','count']],
 [/^(.*?) · continued this stage$/, '{role} · continued this stage', ['role']],
 [/^(\d+) decisions? answered$/, '{count} decisions answered', ['count']],
 [/^(\d+) of (\d+) stages answered in this role\. Answer each stage to complete this role’s route\.$/, '{answered} of {total} stages answered in this role. Answer each stage to complete this role’s route.', ['answered','total']],
 [/^\/ (\d+) learning points$/, '/ {count} learning points', ['count']],
 [/^(\d+) stages explored · (\d+) of (\d+) situations completed in this role\.$/, '{stages} stages explored · {completed} of {total} situations completed in this role.', ['stages','completed','total']],
 [/^(.*?) saved learning points$/, '{role} saved learning points', ['role']],
 [/^(\d+) \/ 1 point$/, '{count} / 1 point', ['count']],
 [/^(\d+) completed; (\d+) to (\d+) remaining$/, '{completed} completed; {min} to {max} remaining', ['completed','min','max']],
 [/^(\d+) completed; (\d+) remaining$/, '{completed} completed; {remaining} remaining', ['completed','remaining']],
 [/^You chose: (.+)$/, 'You chose: {choice}', ['choice']],
 [/^Your role: (.+)$/, 'Your role: {role}', ['role']],
 [/^Review access: (.+)\.$/, 'Review access: {access}.', ['access']],
 [/^You explored (\d+) decisions with (.+?)\. (.+)$/, 'You explored {count} decisions with {name}. {review}', ['count','name','review']],
 [/^There (?:is|are) (\d+) points? to revisit below\.$/, 'There are {count} points to revisit below.', ['count']],
 [/^You explored (\d+) decisions in the role of (.+?)\. Review the reasoning and choose a question to bring to your next learning discussion\.$/, 'You explored {count} decisions in the role of {role}. Review the reasoning and choose a question to bring to your next learning discussion.', ['count','role']]
];
export function matchMessage(text){
 for(const [pattern,template,parameters] of messagePatterns){const match=text.match(pattern);if(match)return {template,values:Object.fromEntries(parameters.map((name,i)=>[name,match[i+1]]))};}
 return null;
}
export const untranslatedNames=Object.freeze(['Alex','Noor','Robin','Maya','Daniel','Jo','Erin','Sam','Pat','Ciara','Rory','Jamie','Lee','Aisling','Kai','Conor','Orla','Charlie','Niamh','Amina','Patrick','Fiosrú','English','Gaeilge','Português','العربية','Polski','Română','Français','Español','中文（简体）','Stopped: Both Sides','STOPPED:','BOTH SIDES','Sam Tim Solutions']);
