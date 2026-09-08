# One repository, two perspectives

Both games are consolidated in [SamOBrienOlinger/stopped-both-sides](https://github.com/SamOBrienOlinger/stopped-both-sides). GitHub Pages publishes the static files directly from the root of `main`.

| Experience | Pages address |
| --- | --- |
| Member of the public — Public perspective | [Public game](https://samobrienolinger.github.io/stopped-both-sides/) |
| Garda — Garda perspective | [Garda game](https://samobrienolinger.github.io/stopped-both-sides/garda/) |

Only one GitHub repository is required. Both perspectives are published together.

## Publishing settings

In the repository's **Settings → Pages → Build and deployment**, keep:

| Setting | Value |
| --- | --- |
| Source | **Deploy from a branch** |
| Branch | **main** |
| Folder | **/(root)** |

The public `index.html` and `.nojekyll` file sit at the repository root. The Garda page is `garda/index.html`. There is no `dist/` folder, dependency installation or compilation step. `.nojekyll` tells GitHub to serve the authored files without Jekyll processing.

Each push to `main` triggers GitHub's built-in **pages build and deployment** workflow. GitHub may still show that publication under Actions; the publishing source remains **Deploy from a branch**. No custom deployment workflow, personal token or application secret is required.

The separate **Check the games** workflow (`.github/workflows/checks.yml`) checks pushes and pull requests. It does **not** gate branch publication, so run these checks before pushing:

```bash
npm run check
npm test
```

After pushing, open **Actions → pages build and deployment** and confirm that the run for the new commit succeeds. Open both addresses above and switch perspectives during a situation. The scene, both answers, scores and selected language should arrive on the other side. The checks workflow should also succeed.

Official instructions: [configure a GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Source layout and local use

Both pages import one copy of the shared encounter engine, scoring, translations, reading controls, perspective palettes and fonts. Shared scenarios import original public and Garda content directly, so there are no generated snapshots or changes to synchronise between repositories.

Serve the repository root:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory .
```

Open `http://localhost:8000/` or `http://localhost:8000/garda/`. `site.mjs` resolves both addresses relative to its deployed location, so the same files work under a Pages project path, a custom domain or a local server. Views use hash navigation and need no server-side rewrites.

Tests cover both original games, shared routes, each application's integration, source integrity, progress transfer and deployment paths. Source files, tests, documentation and font licences remain together in this repository. Design acknowledgements remain in the README and are not displayed in the game interface.

## Progress and existing previews

Both entrypoints share one origin. Progress, resume points and reading preferences retain separate keys for each side, so clearing one side's record does not clear the other's. Switching perspective inside a game preserves the record; the header switch carries and merges it between entrypoints. The selected language also travels in the link.

Progress saved on the existing `samobo.chatgpt.site` domains does not move automatically to Pages because browsers isolate storage by origin. To carry a record, copy an old site's switch link and replace only the destination origin/path with the matching address above, preserving its query and entire fragment. The receiving game validates and merges it. Other reading settings can be chosen again.
