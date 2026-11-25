import {test,expect} from '@playwright/test';
import {openNavigation} from './navigation.mjs';
import {startEncounter,currentStage,answer,continueEncounter,stateHash} from '../../encounters/engine.mjs?v=site-repairs-20261125';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=site-repairs-20261125';
import {preferencesStorageKey} from '../../accessibility/preferences.mjs';

await Promise.all(['ar','fr'].map(loadLanguage));
const title='Advice, complaints and policing oversight';
const destinations=[
 'https://www.fiosru.ie/complaints/submit-a-complaint/',
 'https://www.pcsaireland.ie/about-us/what-we-do/',
 'https://www.flac.ie/help/'
];

for(const {language,width,large} of [
 {language:'en',width:1280,large:false},
 {language:'en',width:320,large:false},
 {language:'ar',width:390,large:true},
 {language:'fr',width:390,large:true},
 {language:'ga',width:390,large:false}
])test(`Support services: ${language}, ${width}px${large?', enlarged reading':''}`,async({page},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width,height:900});
 await page.goto('./?lang='+language+'#rights/support');
 const section=page.locator('#rights-support');
 await expect(section).toBeFocused();
 await expect(section.locator('h2')).toHaveText(translateText(title,language));
 await expect(section.locator('.support-card')).toHaveCount(3);
 await expect(page.locator('.source-topic-nav a[href="#rights/support"]')).toHaveAttribute('aria-current','location');
 expect(await section.locator('.support-link').evaluateAll(links=>links.map(link=>link.href))).toEqual(destinations);
 if(large){
  await openNavigation(page);await page.locator('#language-settings-trigger').click();
  await page.locator('#reading-size').selectOption('150');
  await page.locator('#reading-contrast').selectOption('high');
  await page.locator('[name="spacing"]').check();
  await page.locator('[name="motion"]').check();
  await page.locator('#reading-form [type="submit"]').click();
  await expect(page.locator('#reading-dialog')).not.toBeVisible();
 }
 if(language==='ar')await expect(section.locator('h3').first()).toHaveCSS('direction','ltr');
 if(language==='ga')await expect(page.locator('#main')).toHaveAttribute('lang','ga');
 const logos=section.locator('.support-organisation img');
 await expect.poll(()=>logos.evaluateAll(images=>images.map(image=>{
  const {width,height}=image.getBoundingClientRect();
  return {
   file:new URL(image.src).pathname.split('/').at(-1),
   local:new URL(image.src).origin===location.origin,
   fits:image.complete&&width>0&&height>0&&width<=image.parentElement.clientWidth+1&&
    Math.abs(width-height*image.naturalWidth/image.naturalHeight)<1,
   alt:image.getAttribute('alt')
  };
 }))).toEqual(['fiosru.png','pcsa.png','flac.png'].map(file=>({file,local:true,fits:true,alt:''})));
 const layout=await section.evaluate(section=>({
  width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
  clipped:[...section.querySelectorAll('p,h2,h3,a')].filter(element=>element.scrollWidth>element.clientWidth+2).map(element=>element.textContent),
  links:[...section.querySelectorAll('a')].map(link=>({height:link.getBoundingClientRect().height,target:link.target,rel:link.rel}))
 }));
 expect(layout.scroll).toBeLessThanOrEqual(layout.width+2);expect(layout.clipped).toEqual([]);
 for(const link of layout.links){expect(link.height).toBeGreaterThanOrEqual(44);expect(link.target).toBe('_blank');expect(link.rel).toContain('noopener');}
 await section.screenshot({path:testInfo.outputPath(`support-${language}-${width}.png`)});
 expect(errors).toEqual([]);
});

for(const entry of ['public','garda'])test(`${entry}: footer and completed recap reach support with the selected language`,async({page})=>{
 const path=entry==='garda'?'garda/':'./';
 await page.goto(path+'?lang=fr');
 await page.locator('.footer a[href*="#rights/support"]').click();
 await expect(page.locator('#rights-support')).toBeFocused();
 await expect(page.locator('#support-heading')).toHaveText(translateText(title,'fr'));
 let state=startEncounter('public-fair-treatment',entry);
 for(let step=0;step<15&&!state.complete;step++){
  const index=currentStage(state).views[state.role].choices.findIndex(choice=>choice.points===1);
  state=continueEncounter(answer(state,index));
 }
 expect(state.complete).toBe(true);
 await page.goto(path+'?lang=fr'+stateHash(state));
 await expect(page.locator('.paired-recap')).toBeVisible();
 await expect(page.locator('.support-recap')).toContainText(translateText('Need information or support after a real encounter?','fr'));
 await page.locator('.support-recap a').click();
 await expect(page.locator('#rights-support')).toBeFocused();
 await expect(page.locator('#support-heading')).toHaveText(translateText(title,'fr'));
});

for(const source of ['query','saved'])test(`garda: pending initial language from ${source} survives a footer handoff`,async({page})=>{
 const keys={garda:preferencesStorageKey('garda'),public:preferencesStorageKey('public')};
 const saved={
  [keys.garda]:JSON.stringify({language:source==='saved'?'fr':'es',size:100,contrast:'standard',spacing:false,motion:false}),
  [keys.public]:JSON.stringify({language:'en',size:100,contrast:'standard',spacing:false,motion:false})
 };
 await page.addInitScript(records=>{
  for(const [key,value] of Object.entries(records))if(localStorage.getItem(key)===null)localStorage.setItem(key,value);
 },saved);
 let release,held=false,sourceRequestFinished;
 const sourceRequestDone=new Promise(resolve=>{sourceRequestFinished=resolve;});
 const holdFirstPack=async route=>{
  if(held){await route.continue();return;}
  held=true;
  await new Promise(resolve=>{release=resolve;});
  // Following the footer cancels this old document's pending request. The
  // destination must obtain its own pack, without waiting for this one.
  try{await route.continue();}catch{}finally{sourceRequestFinished();}
 };
 await page.route('**/fr-content.mjs*',holdFirstPack);
 try{
  await page.goto('garda/'+(source==='query'?'?lang=fr':''),{waitUntil:'commit'});
  await expect.poll(()=>held).toBe(true);
  await expect(page.locator('#main .initial')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang','en-IE');
  const footer=page.locator('.footer [data-support-crosslink]');
  const target=new URL(await footer.getAttribute('href'),page.url());
  expect(target.searchParams.get('lang')).toBe('fr');
  expect(target.hash).toBe('#rights/support');
  const siteLink=new URL(await page.locator('[data-site-switch]').getAttribute('href'),page.url());
  expect(siteLink.searchParams.get('lang')).toBe('fr');
  await footer.click();
  await expect(page).toHaveURL(target.href);
  await expect(page.locator('#rights-support')).toBeFocused();
  await expect(page.locator('#support-heading')).toHaveText(translateText(title,'fr'));
  await expect(page.locator('html')).toHaveAttribute('lang','fr');
  expect(await page.evaluate(keys=>Object.fromEntries(Object.values(keys).map(key=>[key,localStorage.getItem(key)])),keys)).toEqual(saved);
 }finally{
  if(release){release();await sourceRequestDone;}
  await page.unroute('**/fr-content.mjs*',holdFirstPack);
 }
});
