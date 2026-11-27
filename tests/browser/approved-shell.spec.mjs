import {expect, test} from '@playwright/test';

const steps = ['Choose a perspective', 'Understand the situation you are in', 'Choose a response', 'Learn why it matters'];
const actors = {public: 'alex', garda: 'aisling'};

for (const [role, path] of [['public', './'], ['garda', 'garda/']]) {
  test(role + ': poster uses the approved pair, four learning steps and real role links', async ({page}, info) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    for (const [width, height] of [[390, 844], [1536, 1024]]) {
      await page.setViewportSize({width, height});
      await page.goto(path + '?lang=en#play');
      const poster = page.getByRole('article', {name: 'Stopped: Both Sides'});
      const hero = poster.locator('.poster-hero');
      const heading = hero.getByRole('heading', {level: 1, name: 'Stopped: Both Sides'});
      const subtitle = hero.getByText('One situation. Two perspectives.', {exact: true});
      const question = hero.getByText('What will you do?', {exact: true});
      await expect(heading).toBeVisible();
      await expect(subtitle).toBeVisible();
      await expect(question).toBeVisible();
      await expect(hero.getByRole('img', {name: /Alex and Garda Aisling.*GPO/})).toBeVisible();

      if (width === 390) {
        await poster.locator('.perspective-grid').scrollIntoViewIfNeeded();
        for (const label of await poster.locator('.perspective-label').all()) {
          // Fractional image tracks can leave a subpixel caption edge outside
          // WebKit's intersection rectangle. Check the edges and actual text
          // instead of requiring an exactly 1.0 background-area ratio.
          await expect.poll(() => label.evaluate(element => new Promise(resolve => {
            const observer = new IntersectionObserver(([entry]) => {
              observer.disconnect();
              const bounds = entry.boundingClientRect, visible = entry.intersectionRect;
              const edgeLoss = Math.max(visible.left - bounds.left, bounds.right - visible.right,
                visible.top - bounds.top, bounds.bottom - visible.bottom);
              const range = document.createRange();
              range.selectNodeContents(element);
              const text = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0);
              resolve(entry.isIntersecting && edgeLoss <= 1 && text.length > 0 && text.every(rect =>
                rect.left >= visible.left && rect.right <= visible.right &&
                rect.top >= visible.top && rect.bottom <= visible.bottom));
            });
            observer.observe(element);
          })), {message: 'each perspective caption and every word remain in view'}).toBe(true);
        }
      }

      const practice = page.locator('.single-mode');
      if (!await practice.evaluate(details => details.open)) await practice.locator('summary').click();
      for (const [perspective, name] of Object.entries(actors)) {
        const actor = hero.locator('.hero-' + perspective);
        await expect.poll(() => actor.evaluate(image => new URL(image.src).pathname)).toMatch(new RegExp('/assets/characters/poster-' + name + '\\.webp$'));
        await expect(actor).toHaveAttribute('alt', '');
        await expect.poll(() => actor.evaluate(image => image.complete ? image.naturalWidth : 0)).toBeGreaterThanOrEqual(perspective === 'public' ? 800 : 648);
        const hrefPattern = new RegExp('#encounters/' + perspective + '$');
        const panel = poster.locator('.perspective-card').filter({hasText: perspective + ' perspective'});
        await expect(panel).toHaveAttribute('href', hrefPattern);
        await expect(panel.locator('.panel-' + perspective)).toHaveAttribute('src', await actor.getAttribute('src'));
        const other = perspective === 'public' ? 'garda' : 'public';
        const reverseActor = panel.locator('.panel-' + other);
        await expect(reverseActor).toHaveAttribute('src', new RegExp('/characters/poster-' + actors[other] + '-back\\.webp$'));
        await panel.scrollIntoViewIfNeeded();
        await expect.poll(() => reverseActor.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
        const link = practice.locator('.perspective-card-link[data-role-tone="' + perspective + '"]');
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', hrefPattern);
        const logo = link.locator('img.perspective-icon');
        await expect(logo).toHaveAttribute('src', new RegExp('/assets/brand/' + perspective + '-perspective\\.webp(?:\\?.*)?$'));
        await expect(logo).toHaveAttribute('alt', '');
        await expect.poll(() => logo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      }

      const guide = page.locator('.how-to-play');
      await expect(guide.locator('.learning-card h3 > span:last-child')).toHaveText(steps);
      await expect(guide.getByText('Example responses', {exact: true})).toBeVisible();
      const examples = guide.getByRole('list', {name: 'Example responses'});
      await expect(examples.getByRole('listitem')).toHaveCount(2);
      await expect(examples.locator('a, button, [tabindex]')).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      const [titleBox, subtitleBox, left, right, heroBox, crop, cta] = await Promise.all([
        heading, subtitle, hero.locator('.hero-public'), hero.locator('.hero-garda'), hero, hero.locator('.hero-characters'), question
      ].map(element => element.boundingBox()));
      expect(subtitleBox.y, 'subtitle follows the title').toBeGreaterThanOrEqual(titleBox.y + titleBox.height - 1);
      expect(left.x, 'Alex and Aisling appear on opposite sides').toBeLessThan(right.x);
      for (const actor of [left, right]) {
        expect(actor.x).toBeGreaterThanOrEqual(heroBox.x - 1);
        expect(actor.x + actor.width).toBeLessThanOrEqual(heroBox.x + heroBox.width + 1);
        const visibleHeight = Math.min(actor.y + actor.height, crop.y + crop.height) - Math.max(actor.y, crop.y);
        expect(visibleHeight, 'the face and upper body fill the visible scene').toBeGreaterThan(crop.height * 0.65);
      }
      expect(crop.y).toBeGreaterThanOrEqual(subtitleBox.y + subtitleBox.height - 1);
      expect(cta.y).toBeGreaterThan(crop.y + crop.height * 0.8);
      expect(cta.y + cta.height).toBeLessThanOrEqual(heroBox.y + heroBox.height + 1);
      await heading.evaluate(element => element.closest('article').scrollIntoView({block: 'start', behavior: 'instant'}));
      await page.screenshot({path: info.outputPath('approved-landing-' + role + '-' + width + '.png')});

      await page.locator('html').evaluate(element => element.classList.add('contrast-high'));
      for (const decorative of await hero.locator('.scene-backdrop img, .hero-public, .hero-garda').all()) {
        await expect(decorative).toBeHidden();
      }
      await expect(heading).toBeVisible();
      await expect(subtitle).toBeVisible();
      await expect(question).toBeVisible();
      for (const link of await poster.getByRole('link').all()) {
        await expect(link).toBeVisible();
        const target = await link.boundingBox();
        const label = await link.innerText();
        expect(target.width, label + ' target width').toBeGreaterThanOrEqual(44);
        expect(target.height, label + ' target height').toBeGreaterThanOrEqual(44);
      }
      await page.locator('html').evaluate(element => element.classList.remove('contrast-high'));
    }
  });
}
