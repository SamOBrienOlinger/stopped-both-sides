import {test,expect} from '@playwright/test';

const retired="The next scene is fictional. No choice guarantees an outcome or excuses mistreatment. This resource cannot decide whether a particular stop, search or arrest is lawful.";

test('public original single-role practice omits the retired note but preserves guidance links',async({page})=>{
 await page.goto('./?lang=en#play');
 await page.locator('.single-mode > summary').click();
  await page.locator('.single-mode').getByRole('link',{name:'Browse situations',exact:true}).click();
 await page.locator('.scenario-library .situation-topic>summary').first().click();
  await page.locator('.scenario-library [data-action="start"]').first().click();
 await expect(page).toHaveURL(/#scenario\//);
 await expect(page.locator('#scene-title')).toBeVisible();
 await expect(page.locator('#main')).not.toContainText(retired);
 await expect(page.locator('p.game-note')).toHaveCount(0);
 await expect(page.locator('.topline.game-note a[href="#rights"]')).toBeVisible();
 await page.locator('[data-action="choose"]').first().click();
 await expect(page.locator('#feedback')).toBeVisible();
 await expect(page.locator('#main')).not.toContainText(retired);
 await page.locator('[data-action="next"]').click();
 await expect(page.locator('#main')).not.toContainText(retired);
});
