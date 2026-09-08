// Resolve both entrypoints relative to this module so Pages project paths,
// custom domains and local static servers all use the same code.
export function siteAddresses(base=new URL('./',import.meta.url)){
 return {public:new URL('./',base).href,garda:new URL('./garda/',base).href};
}
export const sites=siteAddresses();
