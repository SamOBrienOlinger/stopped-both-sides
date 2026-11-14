import {expect} from '@playwright/test';

export async function openNavigation(page){
 const toggle=page.locator('[data-nav-toggle]');
 if(await toggle.isVisible()&&await toggle.getAttribute('aria-expanded')==='false'){
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
 }
}

export async function expectSettingsFocusReturn(page,footer=false){
 const toggle=page.locator('[data-nav-toggle]');
 const compact=!footer&&await toggle.isVisible();
 await expect(compact?toggle:page.locator(footer?'#language-settings-footer':'#language-settings-trigger')).toBeFocused();
 if(compact){
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#main-navigation')).toBeHidden();
 }
 await expect(page.locator('#main')).not.toHaveAttribute('inert');
}

export async function openCharacterPicker(page,role){
 const targetRole=role||await page.locator('.cast-character.is-you').getAttribute('data-cast-role');
 const caption=page.locator('button[data-scene-label-role="'+targetRole+'"]').first();
 await caption.click();
 await page.locator('#scene-character-dialog .scene-profile-change').click();
 return caption;
}
