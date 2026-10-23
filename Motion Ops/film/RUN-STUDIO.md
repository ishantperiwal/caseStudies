# Run the studio for Motion Ops

This folder holds the Motion Ops films: `scenes/` (`motion-ops-film`, `motion-ops-final`, `glass-compare`), `notes/` (the editor's
notes and "To check" lists) and `out/` (exports and rendered frames; not in git). The studio itself is
`motion-studio/` at the root of this repo, shared by every case study; its own guide is
[motion-studio/RUN-STUDIO.md](../../motion-studio/RUN-STUDIO.md). Run every command below from the repo root
(`caseStudies-main`).

## First time (once per Mac)
Install [Node.js](https://nodejs.org) 20 or newer and ffmpeg (`brew install ffmpeg`). If `motion-studio/` isn't there yet:
```bash
git clone https://github.com/ishantperiwal/motionStudio.git motion-studio
npm --prefix motion-studio install
npm --prefix motion-studio exec -- playwright install chromium
```

## Every time
1. Start the studio for Motion Ops: in Claude Code, start the `motion-ops-studio` server from `.claude/launch.json`, or run
   ```bash
   PORT=5176 npm --prefix motion-studio run dev -- --project "Motion Ops/film"
   ```
   It prints `Motion Studio → http://localhost:5176/editor/ (project: …/Motion Ops/film)`.
2. Start the notes watcher, so **▶ Send to Claude** works: in a Claude Code session opened in this repo, say
   > Start the notes watcher for Motion Ops.

   Claude runs this in the background (it exits when you press Send, then Claude works the notes and starts it again):
   ```bash
   node motion-studio/tools/wait-for-notes.mjs --project "Motion Ops/film"
   ```
3. Open **http://localhost:5176/editor/** and pick a film at the top.

## Other commands
Every studio command takes the same `--project "Motion Ops/film"`:
```bash
npm --prefix motion-studio run render -- motion-ops-film --frames 0,100 --project "Motion Ops/film"
npm --prefix motion-studio run render -- motion-ops-film --project "Motion Ops/film"
npm --prefix motion-studio run new-scene -- my-new-film --project "Motion Ops/film"
```
Frames go to `out/<film>-frames/`, videos to `out/`, new films to `scenes/`. Check a watcher is running with
`pgrep -fl wait-for-notes` (its command line names the project).
