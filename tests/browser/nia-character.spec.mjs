import {test,expect} from '@playwright/test';
import {decodeState} from '../../encounters/engine.mjs?v=site-repairs-20261125';
import {openNavigation} from './navigation.mjs';

const imageSource=/\/assets\/characters\/nia-public-20261123\.webp(?:\?|$)/;
const sceneSelector='.paired-scene-lead>.encounter-scene';
const current=page=>decodeState(new URL(page.url()).hash.slice(11).split('~')[0]);

async function niaImage(image){
 await expect(image).toHaveAttribute('src',imageSource);
 await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0&&node.naturalHeight>0)).toBe(true);
}

async function fits(page){
 await expect.poll(()=>page.evaluate(()=>{
  const root=document.documentElement;
  const clipped=[...document.querySelectorAll('.character-option,.setup-character,.cast-character,.scene-character-label,.scene-profile-info')]
   .filter(element=>element.getClientRects().length&&element.scrollWidth>element.clientWidth+2)
   .map(element=>element.className);
  return {pageFits:root.scrollWidth<=root.clientWidth+2,clipped};
 })).toEqual({pageFits:true,clipped:[]});
}

async function niaScene(page){
 const scene=page.locator(sceneSelector),actor=scene.locator('[data-scene-character="public-10"]');
 await expect(actor).toHaveCount(1);
 await niaImage(actor.locator('img'));
 await expect(scene.locator('[data-scene-label-role="public"]')).toContainText('Nia');
 await expect(page.locator('.cast-character[data-cast-role="public"]')).toHaveAttribute('data-character-id','public-10');
 await niaImage(page.locator('.cast-character[data-cast-role="public"] img'));
 await fits(page);
}

for(const [path,entrypoint] of [['./','public'],['garda/','Garda']]){
 test(`${entrypoint} entrypoint: Nia keeps her artwork and identity through selection, reload, stage and companion transfer`,async({page},info)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(path+'?lang=en#encounters/public');

  await openNavigation(page);
  await page.locator('.header [data-reading-open]').click();
  await page.locator('#reading-size').selectOption('150');
  await page.locator('#reading-form [type="submit"]').click();
  await expect(page.locator('html')).toHaveCSS('--reading-size','150%');
  await page.locator('[data-action="paired-setup-characters"]').click();
  await expect(page.locator('.character-option')).toHaveCount(10);
  const choice=page.locator('[data-character="public-10"]');
  await expect(choice).toHaveAccessibleName('Choose character: Nia');
  await niaImage(choice.locator('img'));
  await choice.press('Enter');
  await expect(choice).toHaveAttribute('aria-pressed','true');
  await fits(page);
  await info.attach('nia-character-picker-'+entrypoint,{
   body:await choice.screenshot({animations:'disabled'}),contentType:'image/png'
  });

  await page.reload();
  await expect(page.locator('[data-action="paired-setup-characters"]')).toBeVisible();
  await expect(page.locator('html')).toHaveCSS('--reading-size','150%');
  // Release initial reload ownership before scrolling to the selected choice.
  await page.keyboard.press('Escape');
  await page.locator('[data-action="paired-setup-characters"]').click();
  await expect(choice).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-action="paired-setup-done"]').click();
  await expect(page.locator('.setup-character strong')).toHaveText('Nia');
  await niaImage(page.locator('.setup-character img'));
  await page.locator('[data-action="paired-quick-start"]').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  const initial=current(page);
  expect(initial.cast.public).toBe('public-10');
  await niaScene(page);
  await expect(page.locator('.turn-avatar')).toHaveAttribute('aria-label','Nia, your current Member of the public character');
  await niaImage(page.locator('.turn-avatar img'));

  const label=page.locator(sceneSelector+' [data-scene-label-role="public"]');
  await label.click();
  const profile=page.locator('#scene-character-dialog');
  await expect(profile).toBeVisible();
  await expect(profile.locator('#scene-character-dialog-name')).toHaveText('Nia');
  await expect(profile.locator('.scene-profile-role')).toHaveText('Member of the public');
  await niaImage(profile.locator('.scene-profile-portrait img'));
  await fits(page);
  await page.keyboard.press('Escape');await expect(label).toBeFocused();
  await info.attach('nia-scene-'+entrypoint,{
   body:await page.locator(sceneSelector).screenshot({animations:'disabled'}),contentType:'image/png'
  });

  await page.locator('[data-action="paired-answer"]').first().click();
  await expect(page.locator('#feedback')).toBeVisible();
  await page.locator('[data-action="paired-next"]').click();
  await expect.poll(()=>current(page).history.length).toBe(initial.history.length+1);
  expect(current(page).cast).toEqual(initial.cast);
  await niaScene(page);
  const continued=current(page);
  await page.reload();
  await expect(page.locator('.paired-game')).toBeVisible();
  expect(current(page)).toEqual(continued);
  await page.keyboard.press('Escape');
  await page.locator('.flow-role-bar + [data-action="paired-switch"]').click();
  await expect.poll(()=>current(page).role).toBe('garda');
  expect(current(page).cast).toEqual(initial.cast);
  await niaScene(page);
  const switched=current(page);

  await openNavigation(page);
  await page.locator('[data-site-switch]').click();
  await expect(page.locator('.content-page h1')).toContainText('sources');
  await page.locator('.session-return a').click();
  await expect(page.locator('.paired-game')).toBeVisible();
  expect(current(page)).toEqual(switched);
  await niaScene(page);
  expect(errors).toEqual([]);
 });
}
