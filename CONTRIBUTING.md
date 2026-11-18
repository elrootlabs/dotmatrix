# Contributing

Issues and pull requests are welcome. By contributing you agree that your work is licensed under the MIT licence of this repository.

Before you push, run the checks (Node 22 or later, nothing to install):

```sh
node scripts/lint.mjs
node scripts/scan.mjs --history
node --test test/*.mjs
```

To run them on every push: `git config core.hooksPath .githooks`.

Commit with your GitHub no-reply address (GitHub → Settings → Emails), so no personal address enters the history; the scan fails on any other address.

A new art is one file in `src/arts/`, exporting `default function field(x, y, t, p, o, f)` that returns how bright the dot at `(x, y)` is at time `t`, from 0 to 1, and optionally `prepare(t, o)` for work done once per frame. Add it to `src/index.mjs` and `catalog.json`.

Changes are reviewed and may be adjusted before they are merged.
