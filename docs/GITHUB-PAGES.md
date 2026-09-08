# One repository, two perspectives

Both games are consolidated in [SamOBrienOlinger/stopped-both-sides](https://github.com/SamOBrienOlinger/stopped-both-sides). The repository has been created. GitHub Pages publication is not yet verified; the addresses below are the configured destinations, not a claim of successful deployment.

| Experience | Intended Pages address |
| --- | --- |
| Member of the public — Public perspective | `https://samobrienolinger.github.io/stopped-both-sides/` |
| Garda — Garda perspective | `https://samobrienolinger.github.io/stopped-both-sides/garda/` |

Only **one GitHub repository** is required: `SamOBrienOlinger/stopped-both-sides`. No separate Garda repository is needed.

## First publication

1. Use the existing public `SamOBrienOlinger/stopped-both-sides` repository and its `main` branch. No additional repository is needed.
2. Select **Settings → Pages → Build and deployment → Source → GitHub Actions** in that repository.
3. Keep the complete project on `main`, including `dist/`, `tests/`, `scripts/`, `package.json` and `.github/workflows/pages.yml`, together with source and font licences. The private-preview configuration is excluded from the GitHub upload; GitHub Pages uses only the workflow and `dist/` artifact.
4. Open **Actions → Deploy GitHub Pages** and wait for verification and publication to succeed. If source was uploaded before Pages was enabled, choose **Run workflow** on `main`.
5. Verify the main address and `/garda/`, then switch sides during a situation. The scene, both answers, scores and selected language should arrive on the other side. Test reloading the copied address and loading the locally hosted fonts.

One workflow checks both games before publishing the complete `dist/` directory. Pull requests run checks without publishing. Pushes and manual runs on `main` deploy through the `github-pages` environment. No personal token or application secret is needed in the workflow.

Official instructions: [configure the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [use a custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Source layout and local use

The public page is `dist/index.html`; the Garda page is `dist/garda/index.html`. Both import one copy of the shared encounter engine, scoring, translations, reading controls, role palettes and fonts. Shared scenarios import original public and Garda content directly, so there are no generated snapshots or changes to synchronise between repositories.

Run `npm run check` and `npm test` from the root. Tests cover both original games, shared routes, each application's integration, source integrity, progress transfer and deployment paths. There is no installation or compilation step.

Serve `dist/` with a static HTTP server. At `http://localhost:8000/`, the Garda page is `http://localhost:8000/garda/`. `dist/site.mjs` resolves both addresses relative to its deployed location, so the same files work under a Pages project path, a custom domain or a local server. Views use hash navigation and need no server-side rewrites.

## Progress and existing previews

Both entrypoints share one origin. Progress, resume points and reading preferences retain separate keys for each side, so clearing one side's record does not clear the other's. Switching perspective inside a game preserves the record; the header switch carries and merges it between entrypoints. The selected language also travels in the link.

Progress saved on the existing `samobo.chatgpt.site` domains does not move automatically to Pages because browsers isolate storage by origin. To carry a record after publication, copy an old site's switch link and replace only the destination origin/path with the matching address above, preserving its query and entire fragment. The receiving game validates and merges it. Other reading settings can be chosen again.

This consolidation has not been published over either existing Sites preview. After Pages publication is verified, portfolio and former-preview links can be updated. Design acknowledgements remain in the README, outside the deployed `dist/` directory.
