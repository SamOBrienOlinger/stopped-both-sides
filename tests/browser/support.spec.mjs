import {test,expect} from '@playwright/test';
import {openNavigation} from './navigation.mjs';
import {startEncounter,currentStage,answer,continueEncounter,stateHash} from '../../encounters/engine.mjs?v=scene-review-1';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=support-resources-1';

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
 await expect(section.locator('h2')).toHaveText(translateText(title,language==='ga'?'en':language));
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
 if(language==='ga')await expect(page.locator('#main')).toHaveAttribute('lang','en-IE');
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
