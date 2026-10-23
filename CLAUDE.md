# Case studies

Static portfolio site (branch `gh-pages`, published by GitHub Pages). Each case study is a folder of HTML pages.

## Motion films
- `motion-studio/` is the one Motion Studio for this repo: a clone of github.com/ishantperiwal/motionStudio, ignored
  here and pushed separately. Its working agreement is `motion-studio/CLAUDE.md`: read it before any film work.
- Each case study keeps its films in `<case>/film/`: `scenes/`, `notes/` (tracked here) and `out/` (renders, ignored).
  Today: `Zapp Account/film`, `IPL Themification/film`, `Motion Ops/film`; each has a `RUN-STUDIO.md` with its exact commands.
- Start the studio for a case study from `.claude/launch.json` (`zapp-motion-studio` :5174, `ipl-motion-studio` :5175,
  `motion-ops-studio` :5176), or `npm --prefix motion-studio run dev -- --project "<case>/film"`.
- Every studio command takes the same `--project`, the notes watcher included:
  `node motion-studio/tools/wait-for-notes.mjs --project "<case>/film"`,
  `npm --prefix motion-studio run render -- <scene> --frames 0 --project "<case>/film"`.
- New case study: `npm --prefix motion-studio run new-scene -- <id> --project "<case>/film"`, and add a launch entry.
