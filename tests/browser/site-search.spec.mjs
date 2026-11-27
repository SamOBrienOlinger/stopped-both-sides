import {test,expect} from '@playwright/test';
import {openNavigation} from './navigation.mjs';
import {decodeState} from '../../encounters/engine.mjs?v=site-repairs-20261125';

const phoneTest=test.extend({
 hasTouch:true,deviceScaleFactor:2,
 isMobile:async({browserName},use)=>use(browserName!=='firefox')
});

for(const [path,role] of [['./','public'],['garda/','garda']]){
 phoneTest(`${role}: enlarged navigation leaves reading space and Search keeps its focused field visible on resize`,async({page})=>{
  await page.setViewportSize({width:280,height:653});
  await page.goto(path+'?lang=ar#'+(role==='public'?'rights':'evidence'));
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  await page.evaluate(async()=>{
   document.documentElement.style.setProperty('--reading-size','200%');
   await document.fonts.ready;
  });
  await expect.poll(()=>page.locator('.header').evaluate(header=>header.getBoundingClientRect().height/innerHeight)).toBeLessThan(.25);
  await page.setViewportSize({width:568,height:320});
  await page.evaluate(()=>{
   document.documentElement.style.setProperty('--reading-size','150%');
   document.documentElement.classList.add('reading-spacious');
  });
  await openNavigation(page);await page.locator('#site-search-trigger').click();
  const input=page.locator('#site-search-input');
  await expect(input).toBeFocused();
  await page.setViewportSize({width:568,height:240});
  await input.pressSequentially('Garda');
  await expect(page.locator('.site-search-result').first()).toBeAttached();
  await expect.poll(()=>input.evaluate(field=>{
   const box=field.getBoundingClientRect(),dialog=field.closest('dialog').getBoundingClientRect();
   return field===document.activeElement&&box.top>=dialog.top-1&&box.bottom<=dialog.bottom+1&&
    document.elementFromPoint(box.left+box.width/2,box.top+box.height/2)===field;
  })).toBe(true);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.site-search-result').first()).toBeFocused();
 });
 test(`${role}: keyword search opens from the requested navbar position, handles no results and preserves an answered game`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#practice/'+role+'/all');
  const group=page.locator('[data-situation-topic="discrimination"]');
  await expect(group).toBeVisible();
  await expect(group).not.toHaveAttribute('open','');
  await group.locator(':scope>summary').click();
  await expect(group.locator('.discrimination-ground')).toHaveCount(10);
  const ground=group.locator('[data-ground="race"]');
  await ground.locator(':scope>summary').click();
  await ground.locator('[data-id="discrimination-colleague-race"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  expect(decodeState(new URL(page.url()).hash.slice(11)).role).toBe(role);
  await expect(page.locator('[data-return-to-play]').first()).toHaveAttribute('href','#practice/'+role+'/all');
  await page.locator('[data-action="paired-answer"]').first().click();
  const token=new URL(page.url()).hash;
  const storage=await page.evaluate(()=>JSON.stringify(localStorage));
  await openNavigation(page);
  expect(await page.locator('#site-search-trigger').evaluate(button=>({before:button.previousElementSibling.dataset.nav,after:button.nextElementSibling.id}))).toEqual({before:'about',after:'language-settings-trigger'});
  await page.locator('#site-search-trigger').click();
  await expect(page.locator('#site-search-input')).toBeFocused();
  await expect(page.locator('[data-nav-toggle]')).toHaveAttribute('aria-expanded','false');
  await page.locator('#site-search-input').fill('no_result_791882');
  await expect(page.locator('#site-search-status')).toHaveText('No results. Try another keyword.');
  await page.locator('#site-search-input').fill('Traveller');
  await expect(page.locator('.site-search-result')).not.toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-search-dialog')).not.toBeVisible();
  await expect(page.locator('[data-nav-toggle]')).toBeFocused();
  expect(new URL(page.url()).hash).toBe(token);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);
  await openNavigation(page);await page.locator('#site-search-trigger').click();
  await page.locator('#site-search-input').fill('AONTAS');
  await page.locator('.site-search-result[href="#about"]').click();
  await expect(page.locator('.input-disclosure')).toBeVisible();
  await expect(page.locator('#site-search-dialog')).not.toBeVisible();
  await openNavigation(page);await page.locator('#site-search-trigger').click();
  await page.locator('#site-search-input').fill('colleague race');
  await page.locator('[data-search-situation="discrimination-colleague-race"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  expect(decodeState(new URL(page.url()).hash.slice(11)).role).toBe(role);
 });

 test(`${role}: contribution lists and search fit enlarged text, all site languages and narrow or wide screens`,async({page})=>{
  test.setTimeout(150000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','ga','pt','ar','pl','ro','fr','es','zh-Hans']){
   await page.goto(path+'?lang='+lang+'#about');
   const contribution=page.locator('.input-disclosure');
   await contribution.locator(':scope>summary').click();
   await expect(contribution.locator('.contribution-organisations>li')).toHaveCount(9);
   await expect(contribution.locator('.contribution-points>li')).toHaveCount(8);
   await expect(contribution.locator('.contribution-organisations a')).toHaveCount(40);
   await page.evaluate(()=>{document.documentElement.style.setProperty('--reading-size','200%');document.documentElement.classList.add('reading-spacious');});
   for(const width of [280,390,768,1366,2560]){
    await page.setViewportSize({width,height:900});
    await expect.poll(()=>page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,clipped:[...document.querySelectorAll('.contribution-content :is(h3,h4,p,li,a)')].filter(element=>element.scrollWidth>element.clientWidth+2).map(element=>({tag:element.tagName,text:element.textContent.slice(0,80),width:element.clientWidth,scroll:element.scrollWidth}))})),{message:`${role}: contribution list in ${lang} at ${width}px`}).toEqual({overflow:false,clipped:[]});
   }
   await page.setViewportSize({width:390,height:844});
   await expect(page.locator('#main-navigation')).toBeHidden();
   await openNavigation(page);await page.locator('#site-search-trigger').click();
   await page.locator('#site-search-input').fill(lang==='zh-Hans'?'歧视':lang==='ar'?'التمييز':'discrimination');
   await expect(page.locator('.site-search-result')).not.toHaveCount(0);
   for(const [width,height] of [[280,900],[568,320],[1366,900]]){
    await page.setViewportSize({width,height});
    // A single-line search field may scroll its value; its box must fit.
    await expect.poll(()=>page.locator('#site-search-dialog').evaluate(dialog=>{
     const field=dialog.querySelector('input'),box=field.getBoundingClientRect(),bounds=dialog.getBoundingClientRect();
     return {fits:dialog.scrollWidth<=dialog.clientWidth+2&&box.left>=bounds.left&&box.right<=bounds.right,clipped:[...dialog.querySelectorAll('h2,p,button,a')].some(element=>element.scrollWidth>element.clientWidth+2)};
    })).toEqual({fits:true,clipped:false});
   }
   await page.keyboard.press('Escape');
  }
 });
}

for(const role of ['public','garda']){
 test(`${role}: a search activated before startup opens once and works on the privacy notice`,async({page})=>{
  const path=role==='garda'?'garda/':'./';
  await page.setViewportSize({width:1440,height:900});
  let release;
  const hold=new Promise(resolve=>{release=resolve;});
  await page.route(/\/app\.mjs(?:\?|$)/,async route=>{await hold;await route.continue();});
  await page.goto(path+'?lang=fr#play',{waitUntil:'commit'});
  const trigger=page.locator('#site-search-trigger');
  try{
   await trigger.click();
   await expect(page.locator('html')).toHaveAttribute('data-search-pending','');
  }finally{release();}
  const input=page.locator('#site-search-input');
  await expect(input).toBeFocused();
  await input.fill('Privacy & local storage');
  await page.locator('.site-search-result[href*="privacy.html"]').click();
  await expect(page).toHaveURL(new RegExp('privacy\\.html\\?perspective='+role+'&lang=fr'));
  await trigger.click();
  await expect(input).toBeFocused();
  await expect(page.locator('#site-search-dialog')).toHaveAttribute('lang','fr');
  await input.fill('legitimate interest in responding');
  await expect(page.locator('.site-search-result[href*="privacy.html"]')).toBeVisible();
  await input.fill('Am I attending voluntarily, and can I leave?');
  await page.locator('.site-search-result[href*="#scenario/street"]').first().click();
  await expect(page).toHaveURL(/\?lang=fr#scenario\/street$/);
  await expect(page.locator('html')).toHaveAttribute('lang','fr');
 });
}

test('Search exposes all results and opens the matching support card across perspectives',async({page})=>{
 await page.goto('garda/?lang=en#play');
 await openNavigation(page);
 await page.locator('#site-search-trigger').click();
 const input=page.locator('#site-search-input');
 await input.fill('Garda');
 const list=page.locator('#site-search-results');
 await expect(list.locator('li')).toHaveCount(20);
 const more=page.locator('#site-search-more');
 await more.click();
 await expect(list.locator('li')).toHaveCount(40);
 await expect(list.locator('.site-search-result').nth(20)).toBeFocused();
 await input.fill('FLAC');
 await expect(more).toBeHidden();
 await list.locator('a[href*="#rights/support/advice"]').click();
 const card=page.locator('.support-card[data-support="advice"]');
 await expect(card).toBeInViewport();
 await expect(card).toBeFocused();
});

test('The complete privacy notice, links and site search follow all nine languages from both perspectives',async({page})=>{
 test.setTimeout(150000);
 const {privacyNotices}=await import('../../locales/privacy-notice.mjs');
 await page.setViewportSize({width:390,height:844});
 for(const role of ['public','garda'])for(const language of ['en',...Object.keys(privacyNotices)]){
  await page.goto('privacy.html?perspective='+role+'&lang='+language);
  await expect(page.locator('#site-search-trigger')).not.toHaveAttribute('onclick',/./);
  await expect(page.locator('html')).toHaveAttribute('lang',language==='en'?'en-IE':language);
  await expect(page.locator('html')).toHaveAttribute('dir',language==='ar'?'rtl':'ltr');
  const copy=await page.locator('[data-privacy-copy]').evaluateAll(elements=>Object.fromEntries(elements.map(el=>[el.dataset.privacyCopy,el.textContent])));
  expect(Object.keys(copy)).toHaveLength(17);
  const notice=privacyNotices[language];
  if(notice){
   for(const [key,text] of Object.entries(copy))expect(text).toBe(notice[key].replaceAll('[[','').replaceAll(']]',''));
   await expect(page.locator('[data-back-to-top]')).toHaveText(notice.top);
   await expect(page).toHaveTitle(notice.privacy+' | Stopped: Both Sides');
  }
  const fits=await page.evaluate(()=>{
   document.documentElement.style.fontSize='200%';
   const fits=document.documentElement.scrollWidth<=document.documentElement.clientWidth+2;
   document.documentElement.style.removeProperty('font-size');
   return fits;
  });
  expect(fits,role+' '+language+' privacy at 200%').toBe(true);
  const destinations=await page.locator('main a').evaluateAll(links=>links.map(link=>link.href));
  expect(destinations.filter(href=>new URL(href).searchParams.get('lang')===language)).toHaveLength(6);
  expect(destinations).toContain('mailto:samobrienolinger@gmail.com');
  expect(destinations).toContain('https://www.dataprotection.ie/');
  expect(destinations).toContain('https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement');
  await page.locator('#site-search-trigger').click();
  await page.locator('#site-search-input').fill(copy.transfer.slice(0,70));
  await expect(page.locator('.site-search-result[href*="privacy.html"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('[data-privacy-copy="returnLinks"] a').nth(role==='public'?0:1).click();
  await expect(page.locator('html')).toHaveAttribute('data-perspective',role);
  await expect(page).toHaveURL(new RegExp('lang='+language));
  if(notice)await expect(page.locator('[data-privacy-link]')).toHaveText(notice.linkTitle);
 }
});

test('A first click on the loading privacy notice opens search after the requested language is ready',async({page})=>{
 let release;
 const hold=new Promise(resolve=>{release=resolve;});
 await page.route(/\/privacy-search\.mjs(?:\?|$)/,async route=>{await hold;await route.continue();});
 await page.goto('privacy.html?lang=ar&perspective=garda',{waitUntil:'commit'});
 try{
  await page.locator('#site-search-trigger').click();
  await expect(page.locator('html')).toHaveAttribute('data-search-pending','');
 }finally{release();}
 await expect(page.locator('#site-search-input')).toBeFocused();
 await expect(page.locator('#site-search-dialog')).toHaveAttribute('dir','rtl');
 await expect(page.locator('main h1')).toHaveText('تعلّمك ومعلوماتك');
});

test.describe('Privacy without JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('the original English notice and its contact, progress and regulator links remain available',async({page})=>{
  await page.goto('privacy.html?lang=ar&perspective=garda');
  await expect(page.locator('html')).toHaveAttribute('lang','en-IE');
  await expect(page.locator('main h1')).toHaveText('Your learning and your information');
  await expect(page.locator('main h2')).toHaveCount(4);
  await expect(page.locator('main a[href="garda/#progress"]')).toBeVisible();
  await expect(page.locator('main a[href="https://www.dataprotection.ie/"]')).toBeVisible();
 });
});

test('Changing the reading language keeps the rebuilt search button and privacy link usable',async({page})=>{
 await page.goto('?lang=en#play');
 await openNavigation(page);
 await page.locator('#language-settings-trigger').click();
 await page.locator('#reading-language').selectOption('fr');
 await page.locator('#reading-form [type="submit"]').click();
 await expect(page.locator('html')).toHaveAttribute('lang','fr');
 await openNavigation(page);
 await page.locator('#site-search-trigger').click();
 await expect(page.locator('#site-search-input')).toBeFocused();
 await page.locator('#site-search-input').fill('Confidentialité et stockage local');
 await page.locator('.site-search-result[href*="privacy.html"]').click();
 await expect(page.locator('main h1')).toHaveText('Votre apprentissage et vos informations');
});
