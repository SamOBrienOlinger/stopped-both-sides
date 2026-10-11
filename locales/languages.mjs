// Language names are deliberately written in their own language and script.
export const languages=Object.freeze([
 {id:'en',tag:'en-IE',name:'English',dir:'ltr'},
 {id:'ga',tag:'ga',name:'Gaeilge',dir:'ltr'},
 {id:'pt',tag:'pt',name:'Português',dir:'ltr'},
 {id:'ar',tag:'ar',name:'العربية',dir:'rtl'},
 {id:'pl',tag:'pl',name:'Polski',dir:'ltr'},
 {id:'ro',tag:'ro',name:'Română',dir:'ltr'},
 {id:'fr',tag:'fr',name:'Français',dir:'ltr'},
 {id:'es',tag:'es',name:'Español',dir:'ltr'},
 {id:'zh-Hans',tag:'zh-Hans',name:'中文（简体）',dir:'ltr'}
].map(Object.freeze));
export const supportedLanguages=Object.freeze(languages.map(language=>language.id));
export function languageInfo(id){return languages.find(language=>language.id===id)||languages[0];}
export function normaliseLanguage(id){
 const aliases={'en-IE':'en','pt-PT':'pt','zh':'zh-Hans','zh-CN':'zh-Hans','zh-SG':'zh-Hans','cmn':'zh-Hans'};
 const value=aliases[id]||id;
 return supportedLanguages.includes(value)?value:'en';
}
