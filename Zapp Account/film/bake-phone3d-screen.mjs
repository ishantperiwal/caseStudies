// Bakes the 3D phone's screen for the three.js version (phones / touch) from the live .z3d-ui:
//   screen-home@3x.webp      the whole screen, waves left out (they're drawn live on top)
//   screen-home-fg@3x.webp   the wave strip (y 156-246) with only what sits over the waves, transparent elsewhere
// Run with the repo root served on :5182:  node "Zapp Account/film/bake-phone3d-screen.mjs" "Zapp Account/case study assets/zapp-3d"
import { chromium } from "../../motion-studio/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";
const out = process.argv[2] || ".";
const SC = 3, STRIP = { y: 156, h: 90 };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: SC });   // < 1024px: no page zoom
await page.goto("http://localhost:5182/Zapp%20Account/zapp-account-a4-case-study.html?phone3d=css", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.evaluate(() => {
  const scr = document.querySelector('[data-phone3d="hero"] .dv-screen'), glass = scr.parentElement;
  const wrap = document.createElement("div");
  wrap.className = "phone3d"; wrap.id = "bake";
  wrap.style.cssText = "position:fixed;left:0;top:0;width:360px;height:780px;z-index:2147483647;background:#fff;visibility:visible";
  const g = document.createElement("div"); g.className = "dv-glass"; g.style.cssText = "left:0;top:0;transform:none";
  wrap.appendChild(g);
  scr.style.borderRadius = "0";
  g.appendChild(scr);
  g.appendChild(glass.querySelector(".dv-island")).style.transform = "none";
  g.appendChild(glass.querySelector(".dv-home")).style.transform = "none";
  scr.querySelector(".waves").style.visibility = "hidden";
  document.body.appendChild(wrap);
});
await page.waitForTimeout(500);
const webp = (png, q) => page.evaluate(async ([b64, q]) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  c.getContext("2d").drawImage(img, 0, 0);
  return c.toDataURL("image/webp", q).split(",")[1];
}, [png.toString("base64"), q]);
const base = await page.locator("#bake").screenshot();
fs.writeFileSync(path.join(out, "screen-home@3x.webp"), Buffer.from(await webp(base, 0.92), "base64"));
// foreground: only the balance, Add Money and Auto-Load, on transparent
await page.evaluate(() => {
  const st = document.createElement("style"); st.textContent = "html::before,html::after,body::before,body::after{display:none!important;background:none!important}html,body{background:transparent!important}"; document.head.appendChild(st);
  document.documentElement.style.background = document.body.style.background = "transparent";
  document.querySelectorAll("body > *:not(#bake)").forEach((e) => (e.style.visibility = "hidden"));
  const bake = document.getElementById("bake"); bake.style.background = "transparent";
  bake.querySelector(".dv-screen").style.background = "transparent";
  bake.querySelectorAll(".z3d-ui > *, .dv-island, .dv-home").forEach((e) => (e.style.visibility = "hidden"));
  bake.querySelectorAll(".amount, .add-money, .auto-load").forEach((e) => (e.style.visibility = "visible"));
});
await page.waitForTimeout(300);
const fg = await page.screenshot({ omitBackground: true, clip: { x: 0, y: STRIP.y, width: 360, height: STRIP.h } });
fs.writeFileSync(path.join(out, "screen-home-fg@3x.webp"), Buffer.from(await webp(fg, 0.95), "base64"));
await browser.close();
