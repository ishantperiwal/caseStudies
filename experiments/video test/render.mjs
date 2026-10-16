// Renders a scene page (default zapp-motion.html) to an MP4, frame by frame, plus a PNG of the last frame.
// The live prototype iframes run on a virtual clock (timers, rAF, CSS transitions, Lottie)
// so every frame is exact regardless of how slow the capture is.
//   npm install && npm run render            -> zapp-account-showcase.mp4
//   npm run render:construct                 -> zapp-construct.mp4 + zapp-construct.png
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import ffmpeg from "ffmpeg-static";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const FPS = +(process.env.FPS || 60);
const PAGE = process.argv[2] || "zapp-motion.html";
const OUT = path.join(HERE, process.argv[3] || "zapp-account-showcase.mp4");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Tiny static server so the iframes are same-origin with the composition.
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml",
    ".png": "image/png", ".webp": "image/webp", ".css": "text/css", ".gif": "image/gif" };
const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
}).listen(0);
const PORT = server.address().port;

// Injected into every frame. The top page is driven by seek(t); each prototype iframe gets
// a local clock = clamp(top.__vt - data-start, 0, data-freeze - data-start).
const CLOCK_SHIM = () => {
    if (window === window.top) { window.__vt = 0; return; }
    let t = 0, id = 1, rafs = [];
    const timers = new Map(), seen = new WeakMap(), base = Date.now();
    performance.now = () => t;
    Date.now = () => base + t;
    window.setTimeout = (fn, d = 0, ...a) => { const i = id++; timers.set(i, { fn, a, at: t + Math.max(0, +d || 0) }); return i; };
    window.setInterval = (fn, d = 0, ...a) => { const e = Math.max(1, +d || 0), i = id++; timers.set(i, { fn, a, at: t + e, every: e }); return i; };
    window.clearTimeout = window.clearInterval = i => timers.delete(i);
    window.requestAnimationFrame = fn => { const i = id++; rafs.push([i, fn]); return i; };
    window.cancelAnimationFrame = i => { rafs = rafs.filter(r => r[0] !== i); };
    window.__tick = () => {
        const fe = window.frameElement, ds = fe ? fe.dataset : {};
        const start = (+ds.start || 0) * 1000;
        let target = Math.max(0, window.top.__vt - start);
        if (ds.freeze) target = Math.min(target, +ds.freeze * 1000 - start);
        if (target < t) return;
        for (;;) {
            let next = null, nid = null;
            for (const [i, tm] of timers) if (tm.at <= target && (!next || tm.at < next.at)) { next = tm; nid = i; }
            if (!next) break;
            t = next.at;
            if (next.every) next.at += next.every; else timers.delete(nid);
            try { typeof next.fn === "function" ? next.fn(...next.a) : (0, eval)(next.fn); } catch (e) { console.error(e); }
        }
        t = target;
        const cbs = rafs; rafs = [];
        for (const [, fn] of cbs) { try { fn(t); } catch (e) { console.error(e); } }
        for (const a of document.getAnimations()) {
            if (!seen.has(a)) seen.set(a, t);
            a.pause();
            a.currentTime = t - seen.get(a);
        }
    };
};

const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ["--hide-scrollbars", "--force-color-profile=srgb", "--disable-web-security"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument(CLOCK_SHIM);
page.on("pageerror", e => console.error("pageerror:", e.message));

await page.goto(`http://localhost:${PORT}/experiments/video%20test/${PAGE}?render`, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => window.READY !== false);
const duration = await page.evaluate(() => window.DURATION);
const total = Math.round(duration * FPS);

const enc = spawn(ffmpeg, [
    "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT,
], { stdio: ["pipe", "inherit", "inherit"] });

for (let f = 0; f < total; f++) {
    const t = f / FPS;
    await page.evaluate(t => { window.__vt = t * 1000; window.seek(t); }, t);
    for (const fr of page.frames()) {
        if (fr === page.mainFrame()) continue;
        await fr.evaluate(() => window.__tick && window.__tick()).catch(() => {});
    }
    // Let messages (balance reveal) and layout settle, then tick once more at the same time.
    await new Promise(r => setTimeout(r, 0));
    for (const fr of page.frames()) if (fr !== page.mainFrame()) await fr.evaluate(() => window.__tick && window.__tick()).catch(() => {});
    const png = await page.screenshot({ type: "png", optimizeForSpeed: true });
    if (f === total - 1) fs.writeFileSync(OUT.replace(/\.mp4$/, ".png"), png);
    if (!enc.stdin.write(png)) await new Promise(r => enc.stdin.once("drain", r));
    if (f % FPS === 0) process.stdout.write(`\r${t.toFixed(1)}s / ${duration}s`);
}
enc.stdin.end();
await new Promise(r => enc.on("close", r));
await browser.close();
server.close();
console.log(`\nWrote ${OUT}`);
