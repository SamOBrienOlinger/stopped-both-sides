export const siteRole=process.env.GAME_ROLE==='garda'?'garda':'public';
export const siteBase=new URL(siteRole==='garda'?'../dist/garda/':'../dist/',import.meta.url);
