import {expect,test} from '@playwright/test';
import {startEncounter,stateHash,decodeState} from '../../encounters/engine.mjs?v=nia-public-20261123';
import {loadLanguage,translateText} from '../../locales/translate.mjs?v=poster-landing-20261125';

const contrast=([foreground,background])=>{
 const linear=channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;
 const luminance=colour=>colour.match(/\d+/g).slice(0,3).map(value=>linear(Number(value)/255))
  .reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
 const values=[luminance(foreground),luminance(background)].sort((a,b)=>b-a);
 return (values[0]+.05)/(values[1]+.05);
};

for(const [path,role] of [['./','public'],['garda/','garda']]){
 test(role+' can read the resumed game link in each pointer and focus state',async({page})=>{
  await page.goto(path+'?lang=en'+stateHash(startEncounter('public-search',role)));
  await page.locator('#choice-title').waitFor();
  await page.goto(path+'?lang=en#progress');
  const link=page.getByRole('link',{name:'Resume your situation',exact:true});
  const ratio=async()=>contrast(await link.evaluate(element=>{
   const style=getComputedStyle(element);
   return [style.color,style.backgroundColor];
  }));
  await expect(link).toBeVisible();
  expect(await ratio()).toBeGreaterThanOrEqual(4.5);
  await link.focus();
  expect(await ratio()).toBeGreaterThanOrEqual(4.5);
  await link.hover();
  expect(await ratio()).toBeGreaterThanOrEqual(4.5);
  await page.mouse.down();
  expect(await ratio()).toBeGreaterThanOrEqual(4.5);
  await page.mouse.up();
  await expect(page.locator('#choice-title')).toBeVisible();
 });
}

test('facts and the two perspectives are available without losing the decision',async({page})=>{
 await page.goto('./?lang=en'+stateHash(startEncounter('public-search','public')));
 const facts=page.locator('.evidence-check');
 await facts.locator('summary').press('Enter');
 const first=facts.locator('select').first();
 await first.selectOption('told');
 await expect(facts.getByText('Look again at where this information came from.').first()).toBeVisible();
 await first.selectOption('seen');
 await expect(facts.getByText('This detail was directly observed.')).toBeVisible();

 const compare=page.locator('.decision-comparison');
 await compare.locator('summary').press('Enter');
 await expect(compare.getByRole('heading',{name:'Member of the public'})).toBeVisible();
 await expect(compare.getByRole('heading',{name:'Garda'})).toBeVisible();
 await page.locator('[data-action="paired-answer"]').first().press('Enter');
 await expect(page.locator('#feedback')).toBeFocused();
 await expect(compare.locator('[data-role-tone="public"]')).not.toContainText('No answer yet');
 await expect(compare.locator('[data-role-tone="garda"]')).toContainText('No answer yet');
 await page.getByRole('button',{name:'Compare the other side',exact:true}).click();
 await expect(page.locator('#choice-title')).toBeFocused();
 const state=decodeState(new URL(page.url()).hash.slice(11));
 expect(state.answers).toEqual({public:0,garda:null});
 expect(state.nodeId).toBe('search-start');
});

for(const [mode,url,answer] of [
 ['shared','./?lang=en'+stateHash(startEncounter('garda-supervision','public')),'paired-answer'],
 ['Garda practice','garda/?lang=en#scenario/supervision','choose']
]){
 test(mode+' has the meeting story, the same figures, and optional examples',async({page})=>{
  await page.setViewportSize({width:430,height:932});
  await page.goto(url);
  const figures=page.getByRole('table',{name:'Fictional search records'});
  await expect(figures.getByRole('row',{name:/Group A/})).toHaveText(/Group A\s*60\s*12\s*20%/);
  await expect(figures.getByRole('row',{name:/Group B/})).toHaveText(/Group B\s*15\s*3\s*20%/);
  await page.getByText('Read the meeting background',{exact:true}).click();
  await expect(page.getByText(/At a local community meeting/)).toBeVisible();
  await page.locator('[data-action="'+answer+'"]').first().press('Enter');
  await expect(page.locator('#feedback-title')).toBeVisible();
  const examples=page.locator('.review-exploration');
  await examples.locator(':scope > summary').press('Enter');
  await examples.getByText('Patrol time',{exact:true}).press('Enter');
  await expect(examples.getByText(/received twice as much patrol time/)).toBeVisible();
  await examples.getByText('Recorded reasons',{exact:true}).press('Enter');
  await expect(examples.getByText(/received twice as much patrol time/)).toBeHidden();
  await expect(examples.getByText(/give a specific reason for some searches/)).toBeVisible();
  const glossary=page.getByText('Terms in this decision',{exact:true});
  await glossary.press('Enter');
  await expect(page.getByText('The share of searches in which something was found.',{exact:true})).toBeVisible();
 });
}

test('both recap links return to the same topic, role and scenario card',async({page})=>{
 await page.goto('./?lang=en#encounters/garda/search');
 const searchCard=page.locator('.scenario-library [data-action="paired-start"][data-id="public-search"]');
 await searchCard.click();
 await page.locator('#choice-title').waitFor();
 for(let index=0;index<8;index++){
  const first=page.locator('[data-action="paired-answer"]').first();
  if(!await first.count())break;
  const previous=await page.locator('#scene-title').textContent();
  await first.click();
  await page.locator('[data-action="paired-next"]').click();
  await page.waitForFunction(title=>document.querySelector('#scene-title')?.textContent!==title,previous);
 }
 const another=page.getByRole('link',{name:'Choose another situation',exact:true});
 await expect(another).toHaveCount(2);
 expect(await another.evaluateAll(links=>links.map(link=>link.getAttribute('href'))))
  .toEqual(['#encounters/garda/search','#encounters/garda/search']);
 const followUp=page.getByRole('heading',{name:'Try what you learned',exact:true});
 await expect(followUp).toBeVisible();
 await another.last().press('Enter');
 await expect(searchCard).toBeFocused();
 await page.goto('./?lang=en#progress');
 await expect(page.getByRole('heading',{name:'What you have practised'})).toBeVisible();
 await expect(page.getByText('Asking what a search is based on',{exact:true})).toBeVisible();
});

test('the workshop guide can be opened in Arabic with enlarged text',async({page})=>{
 await loadLanguage('ar');
 await page.setViewportSize({width:320,height:800});
 await page.goto('./?lang=ar#discussion/garda/garda-supervision');
 await expect(page.getByRole('heading',{name:translateText('Explore and discuss this situation','ar'),exact:true})).toBeVisible();
 await expect(page.locator('.discussion-guide')).toContainText(translateText('Allow about 15 minutes.','ar'));
 await expect(page.locator('.discussion-guide')).toContainText(translateText('What should the sergeant and the representative of a local community group look into together?','ar'));
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await page.evaluate(()=>document.documentElement.style.setProperty('--reading-size','200%'));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
 await page.getByRole('button',{name:translateText('Explore this situation','ar'),exact:true}).press('Enter');
 await expect(page.locator('#scene-title')).toBeFocused();
 await expect(page.locator('.search-figures')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
