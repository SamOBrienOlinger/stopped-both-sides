import {test,expect} from '@playwright/test';

for(const path of ['./','garda/']){
 test(path+' About points readers to Sam Tim Solutions',async({page})=>{
  await page.goto(path+'#about');
  const note=page.locator('.content-page .contribution-link');
  await expect(note).toHaveText('For more information go to Sam Tim Solutions');
  const link=note.locator('a');
  await expect(link).toHaveText('Sam Tim Solutions');
  await expect(link.locator('strong')).toHaveText('Sam Tim Solutions');
  await expect(link).toHaveAttribute('href','https://samobrienolinger.github.io/SamOBrienOlinger/');
  await expect(link).toHaveAttribute('rel',/noopener noreferrer/);
  await expect(link).toHaveAttribute('target','_blank');
  await expect(page.locator('.content-page')).not.toContainText('Contact the project creator or contribute feedback');
 });
}
