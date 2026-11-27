import {sites} from '../site.mjs';
import {gpo,figure,renderPosterHero} from './poster-hero.mjs?v=casting-logos-20261127';

const roles = ['public', 'garda'];
const labels = {public: 'Public perspective', garda: 'Garda perspective'};
const roleHref = role => new URL(`#encounters/${role}`, sites.public).href;

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

function step(number, title, description, body) {
  return `<li class="learning-card"><h3><span class="step-number" aria-hidden="true">${number}</span>
    <span>${title}</span></h3><p class="learning-step-copy">${description}</p><div class="learning-step-visual">${body}</div></li>`;
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
    ${renderPosterHero()}
    <section class="poster-overview" aria-labelledby="overview-title">
      <div class="poster-overview__text">
        <h2 id="overview-title">Interactive learning about rights, choices and perspectives.</h2>
        <p class="poster-lead landing-deck" data-poster-reveal>Explore realistic situations, choose how to respond, and see how the same encounter can be experienced differently by members of the public and Gardaí.</p>
      </div>
      <div class="perspective-grid">${roles.map(panel).join('')}</div>
    </section>
  </article>
  <div class="sbs-poster poster-guide-section">
    <section class="poster-learning how-to-play" aria-labelledby="how-to-title" id="learning-flow">
      <details class="how-to-disclosure" open>
        <summary class="how-to-disclosure-trigger landing-disclosure-trigger"><h2 id="how-to-title">How it works<span class="landing-disclosure-caret" aria-hidden="true"></span></h2></summary>
        <ol class="learning-steps" role="list">
          ${step(1, 'Choose a perspective', 'Start as a member of the public or a Garda.', `<div class="role-picker">${choose}</div>`)}
          ${step(2, 'Understand the situation you are in', 'Interact with a member of the public and/or with a Garda.', story)}
          ${step(3, 'Choose a response', 'Try what you would say or do.', choices)}
          ${step(4, 'Learn why it matters', 'Get an explanation, then try the other side.', compare)}
        </ol>
      </details>
    </section>
  </div>`;
}

export function renderPosterPerspectiveActions({perspectiveIcon}) {
  return `<div class="sbs-poster poster-perspective-section">
      <nav class="poster-landing-actions landing-role-actions" data-poster-reveal aria-label="Start learning with a role">
        ${roles.map(role => `<a class="poster-landing-action perspective-card-link" data-role-tone="${role}" href="${roleHref(role)}">
          ${perspectiveIcon(role)}<span>${role === 'public' ? 'Explore the public perspective' : 'Explore the Garda perspective'}</span></a>`).join('')}
      </nav>
  </div>`;
}
