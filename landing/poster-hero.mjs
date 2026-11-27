import {syncLandingReveal} from './reveal.mjs';

const assets = new URL('../assets/', import.meta.url);
export const gpo = width => new URL(`dublin-approved/gpo-city-${width}.webp?v=gpo-bus-eleven-20261126`, assets).href;
const figures = {
  public: new URL('characters/poster-alex.webp?v=final-touches-20261125', assets).href,
  garda: new URL('characters/poster-aisling.webp', assets).href,
  publicBack: new URL('characters/poster-alex-back.webp', assets).href,
  gardaBack: new URL('characters/poster-aisling-back.webp', assets).href
};
export function figure(role, className, hero = false) {
  return `<img class="${className}" src="${figures[role]}" alt="" decoding="async"
    ${hero ? 'data-poster-reveal' : 'loading="lazy"'}>`;
}

export function renderPosterHero() {
  return `<section class="poster-hero" aria-labelledby="paired-title">
      <picture class="scene-backdrop" aria-hidden="true">
        <img src="${gpo(960)}" srcset="${gpo(480)} 480w, ${gpo(960)} 960w, ${gpo(1600)} 1600w"
          sizes="(min-width: 75rem) 72rem, 100vw" width="1600" height="900" fetchpriority="high" alt="">
      </picture>
      <header class="poster-brand">
        <p class="brand-eyebrow"><img src="${new URL('brand/profiles-hexagon.webp?v=all-logos-transparent-20261127', assets).href}" alt="" width="56" height="56"></p>
        <h1 id="paired-title" lang="en-IE" dir="ltr" data-no-translate data-poster-reveal>Stopped: Both Sides</h1>
        <p class="brand-subtitle" id="perspectives-title" data-poster-reveal>One situation. Two perspectives.</p>
      </header>
      <div class="hero-characters" role="img" aria-label="Alex and Garda Aisling outside the GPO on O’Connell Street, Dublin.">
        ${figure('public', 'hero-public', true)}${figure('garda', 'hero-garda', true)}
      </div>
      <div class="hero-question">
        <span>What will you do?</span>
      </div>
    </section>`;
}

// On a cold English homepage the actual hero can paint while the game and
// catalog load. Deep links retain the generic loading message.
export async function showEarlyHero() {
  if (!document.querySelector('#main') && document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('readystatechange', resolve, {once: true}));
  }
  const loading = document.querySelector('#main .initial #loading');
  if (!loading) return;
  const requested = new URLSearchParams(location.search).get('lang');
  if (requested !== 'en' && requested !== 'en-IE') {
    const {createPreferences} = await import('../accessibility/preferences.mjs?v=learning-language-20261120');
    let storage;
    try { storage = localStorage; } catch {}
    const preferences = createPreferences(storage, location.search, document.documentElement.dataset.perspective);
    if (preferences.value.language !== 'en') return;
  }
  if (!loading.isConnected || (location.hash && location.hash !== '#play')) return;
  const poster = document.createElement('article');
  poster.className = 'reference-landing sbs-poster';
  poster.setAttribute('aria-labelledby', 'paired-title');
  poster.setAttribute('data-initial-poster', '');
  poster.innerHTML = renderPosterHero();
  loading.parentElement.replaceWith(poster, loading);
  syncLandingReveal(poster.parentElement);
}
