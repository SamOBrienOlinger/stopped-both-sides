import {sites} from '../site.mjs';

const assets = new URL('../assets/', import.meta.url);
const gpo = width => new URL(`dublin-approved/gpo-city-${width}.webp?v=gpo-no-flag-lamps-20261126`, assets).href;
const figures = {
  public: new URL('characters/poster-alex.webp?v=final-touches-20261125', assets).href,
  garda: new URL('characters/poster-aisling.webp', assets).href,
  publicBack: new URL('characters/poster-alex-back.webp', assets).href,
  gardaBack: new URL('characters/poster-aisling-back.webp', assets).href
};
const roles = ['public', 'garda'];
const labels = {public: 'Public perspective', garda: 'Garda perspective'};
const roleHref = role => new URL(`#encounters/${role}`, sites.public).href;

function figure(role, className, hero = false) {
  return `<img class="${className}" src="${figures[role]}" alt="" decoding="async"
    ${hero ? 'data-poster-reveal' : 'loading="lazy"'}>`;
}

function panel(role) {
  return `<a class="perspective-card" href="${roleHref(role)}">
    <span class="perspective-scene perspective-scene--${role}" aria-hidden="true">
      <img class="panel-backdrop" src="${gpo(480)}" width="480" height="270" alt="" loading="lazy">
      ${figure(role === 'garda' ? 'publicBack' : 'public', 'panel-public')}
      ${figure(role === 'public' ? 'gardaBack' : 'garda', 'panel-garda')}
    </span>
    <span class="perspective-label">${labels[role]}</span>
  </a>`;
}

function step(number, title, body) {
  return `<li class="learning-card"><h3><span class="step-number" aria-hidden="true">${number}</span>
    <span>${title}</span></h3>${body}</li>`;
}

export function renderPosterLanding({siteRole, perspectiveIcon}) {
  const choose = roles.map(role => `<div class="role-picker__item">
    <span class="avatar">${figure(role, 'avatar-image')}</span><span>${role === 'public' ? 'Public' : 'Garda'}</span>
  </div>`).join('');
  const story = `<figure class="story-preview"><div class="story-preview__scene" aria-hidden="true">
    <img class="panel-backdrop" src="${gpo(480)}" width="480" height="270" alt="" loading="lazy">
    ${figure('public', 'panel-public')}${figure('garda', 'panel-garda')}</div>
    <figcaption>“Can I have a word?”</figcaption></figure>`;
  const choices = `<p id="poster-example-label" class="example-label">Example responses</p>
    <ul class="response-picker" aria-labelledby="poster-example-label">
    <li><b aria-hidden="true">A</b><span>Explain your whole evening straight away.</span></li>
    <li><b aria-hidden="true">B</b><span>Ask why you are being stopped and whether you are free to leave.</span></li></ul>`;
  const compare = `<div class="compare-illustration" aria-hidden="true">${roles.map(role =>
    `<span class="compare-bubble">${perspectiveIcon(role)}</span>`).join('')}</div>
    <p class="compare-caption">See the same situation from both sides.</p>`;

  return `<article class="reference-landing sbs-poster" aria-labelledby="paired-title">
    <section class="poster-hero" aria-labelledby="paired-title">
      <picture class="scene-backdrop" aria-hidden="true">
        <img src="${gpo(960)}" srcset="${gpo(480)} 480w, ${gpo(960)} 960w, ${gpo(1600)} 1600w"
          sizes="(min-width: 75rem) 72rem, 100vw" width="1600" height="900" fetchpriority="high" alt="">
      </picture>
      <header class="poster-brand">
        <p class="brand-eyebrow"><img src="${new URL('brand/profiles-hexagon.webp', assets).href}" alt="" width="56" height="56"></p>
        <h1 id="paired-title" lang="en-IE" dir="ltr" data-no-translate data-poster-reveal>Stopped: Both Sides</h1>
        <p class="brand-subtitle" id="perspectives-title" data-poster-reveal>One situation. Two perspectives.</p>
      </header>
      <div class="hero-characters" role="img" aria-label="Alex and Garda Aisling outside the GPO on O’Connell Street, Dublin.">
        ${figure('public', 'hero-public', true)}${figure('garda', 'hero-garda', true)}
      </div>
      <div class="hero-question">
        <span>What will you do?</span>
      </div>
    </section>
    <section class="poster-overview" aria-labelledby="overview-title">
      <div class="poster-overview__text">
        <h2 id="overview-title">Interactive learning about rights, choices and perspectives.</h2>
        <p class="poster-lead landing-deck" data-poster-reveal>Explore realistic situations, choose how to respond, and see how the same encounter can be experienced differently by members of the public and Gardaí.</p>
      </div>
      <div class="perspective-grid">${roles.map(panel).join('')}</div>
    </section>
    <section class="poster-learning" aria-label="Four steps of the learning experience" id="learning-flow">
      <ol class="learning-steps" role="list">
        ${step(1, 'Choose a perspective', `<div class="role-picker">${choose}</div>`)}
        ${step(2, 'Read the situation', story)}
        ${step(3, 'Choose a response', choices)}
        ${step(4, 'Compare perspectives', compare)}
      </ol>
    </section>
  </article>
  <div class="sbs-poster poster-perspective-section">
      <nav class="poster-landing-actions landing-role-actions" data-poster-reveal aria-label="Start learning with a role">
        ${roles.map(role => `<a class="poster-landing-action perspective-card-link" data-role-tone="${role}" href="${roleHref(role)}">
          ${perspectiveIcon(role)}<span>${role === 'public' ? 'Explore the public perspective' : 'Explore the Garda perspective'}</span></a>`).join('')}
      </nav>
  </div>`;
}
