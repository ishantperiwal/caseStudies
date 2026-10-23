# Run the studio for Zapp Account

This folder holds the Zapp Account films: `scenes/` (`zapp-film`, `zapp-account-animatic`), `notes/` (the editor's
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
1. Start the studio for Zapp Account: in Claude Code, start the `zapp-motion-studio` server from `.claude/launch.json`, or run
   ```bash
   PORT=5174 npm --prefix motion-studio run dev -- --project "Zapp Account/film"
   ```
   It prints `Motion Studio → http://localhost:5174/editor/ (project: …/Zapp Account/film)`.
2. Start the notes watcher, so **▶ Send to Claude** works: in a Claude Code session opened in this repo, say
   > Start the notes watcher for Zapp Account.

   Claude runs this in the background (it exits when you press Send, then Claude works the notes and starts it again):
   ```bash
   node motion-studio/tools/wait-for-notes.mjs --project "Zapp Account/film"
   ```
3. Open **http://localhost:5174/editor/** and pick a film at the top.

## Other commands
Every studio command takes the same `--project "Zapp Account/film"`:
```bash
npm --prefix motion-studio run render -- zapp-film --frames 0,100 --project "Zapp Account/film"
npm --prefix motion-studio run render -- zapp-film --project "Zapp Account/film"
npm --prefix motion-studio run new-scene -- my-new-film --project "Zapp Account/film"
```
Frames go to `out/<film>-frames/`, videos to `out/`, new films to `scenes/`. Check a watcher is running with
`pgrep -fl wait-for-notes` (its command line names the project).
