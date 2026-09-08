export const siteRole=process.env.GAME_ROLE==='garda'?'garda':'public';
export const siteBase=new URL(siteRole==='garda'?'../garda/':'../',import.meta.url);
