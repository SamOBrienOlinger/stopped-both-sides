import {expect} from '@playwright/test';

export async function openNavigation(page){
 const toggle=page.locator('[data-nav-toggle]');
 if(await toggle.isVisible()&&await toggle.getAttribute('aria-expanded')==='false'){
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
 }
}
