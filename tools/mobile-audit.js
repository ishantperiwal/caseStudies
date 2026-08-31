#!/usr/bin/env node
/**
 * mobile-audit.js — survey a case-study page for the problems in mobile-port-playbook.md
 *
 *   node tools/mobile-audit.js "Lottiemon/lottiemon-case-study.html"
 *   node tools/mobile-audit.js "Zapp Account/zapp-account-a4-case-study.html" --desktop
 *
 * Reports, at phone widths: horizontal overflow and its causes, gutter mismatches between
 * headings and body copy, media that is not centred, containers holding more than one image,
 * fixed-width SVGs, hover-only content, and phone frames whose media does not fill the screen.
 *
 * Finds problems; does not know which ones matter. Read the output, then decide.
 *
 * Requires puppeteer-core and an installed Chrome. No browser download.
 *   npm i puppeteer-core
 */

const fs = require("fs");
const path = require("path");

let puppeteer;
try {
  puppeteer = require("puppeteer-core");
} catch {
  console.error("puppeteer-core not installed.  npm i puppeteer-core");
  process.exit(2);
}

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const desktopMode = args.includes("--desktop");

if (!target) {
  console.error('Usage: node tools/mobile-audit.js "<page.html>" [--desktop]');
  process.exit(2);
}

const abs = path.resolve(target);
if (!fs.existsSync(abs)) {
  console.error("No such file: " + abs);
  process.exit(2);
}

const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error("No Chrome/Edge found. Edit CHROME_CANDIDATES in this file.");
  process.exit(2);
}

const fileUrl = "file:///" + abs.replace(/\\/g, "/").replace(/ /g, "%20");
const VIEWPORTS = desktopMode
  ? [{ name: "desktop", width: 1440, height: 900 }, { name: "laptop", width: 1024, height: 800 }]
  : [{ name: "iphone-se", width: 375, height: 667 },
     { name: "iphone-14", width: 390, height: 844 },
     { name: "pixel-7", width: 412, height: 915 }];

// Collected inside the page. Kept dependency-free and defensive: these documents differ a
// lot, so every selector below is optional.
function audit() {
  const vw = document.documentElement.clientWidth;
  const out = { vw };
  const R = (el) => el.getBoundingClientRect();
  const name = (el) =>
    el.tagName.toLowerCase() +
    (el.className && typeof el.className === "string"
      ? "." + el.className.split(/\s+/).filter(Boolean).slice(0, 3).join(".")
      : "");

  // Slides inside a horizontal scroller are offset on purpose - that is what a carousel
  // is. Detect the scroller by behaviour, not by class name, since these pages build
  // carousels out of .direction-screens / .rebrand-phone-grid with no "carousel" in sight.
  const inScroller = (el) => {
    let n = el.parentElement;
    // Deep enough to reach a track from inside a nested phone mock
    // (slide > placeholder > viewport > device > screen > content).
    for (let i = 0; i < 8 && n; i++, n = n.parentElement) {
      const c = getComputedStyle(n);
      if (/auto|scroll/.test(c.overflowX) && c.flexWrap === "nowrap") return true;
    }
    return false;
  };

  // Artwork anchored to a corner (campaign stickers, background orbs) is meant to be
  // off-centre. pointer-events:none is the reliable tell across these documents, and it
  // does not catch genuine mistakes: the mis-positioned stack in Zapp was interactive.
  const isDecorative = (el) => {
    const c = getComputedStyle(el);
    return c.pointerEvents === "none" || c.filter !== "none";
  };

  // ── Horizontal overflow ────────────────────────────────────────────────────
  out.docScrollW = document.documentElement.scrollWidth;
  out.horizontalOverflow = out.docScrollW > vw + 1;
  const offenders = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = R(el);
    if (r.width < 1 || r.height < 1) return;
    if (r.right > vw + 2) {
      const cs = getComputedStyle(el);
      // Decorative/blurred/absolutely-parked things are usually clipped on purpose.
      const decorative = cs.pointerEvents === "none" || cs.filter !== "none";
      offenders.push({ el: name(el).slice(0, 60), right: Math.round(r.right), over: Math.round(r.right - vw), decorative });
    }
  });
  out.overflowOffenders = offenders
    .sort((a, b) => b.over - a.over)
    .filter((o, i, arr) => arr.findIndex((x) => x.el === o.el) === i)
    .slice(0, 12);

  // ── Content clipped inside a container ────────────────────────────────────
  // The page-overflow check only sees content that widens the DOCUMENT. A row that
  // overflows its own box and is then clipped by an ancestor never moves
  // document.scrollWidth, so the page audits clean while content is cut off and
  // unreachable. This is how a two-phone showcase row in IPL — 536px of content
  // centred in 375px, ~80px sliced off each side — passed every other check.
  //
  // Overflowing a parent is not itself a fault: full-bleed tracks and carousel
  // slides do it on purpose. What matters is whether something a reader can
  // actually SEE ends up outside the viewport with no way to scroll to it. Hover
  // labels parked off-frame at opacity 0 are the common false positive.
  const isVisible = (el, stopAt) => {
    let n = el;
    while (n && n !== stopAt.parentElement) {
      const c = getComputedStyle(n);
      if (c.display === "none" || c.visibility === "hidden" || parseFloat(c.opacity) < 0.05) return false;
      n = n.parentElement;
    }
    return true;
  };

  out.clippedInside = [];
  document.querySelectorAll("main *, section *").forEach((el) => {
    const hidden = el.scrollWidth - el.clientWidth;
    if (hidden <= 2 || el.clientWidth <= 40) return;
    const cs = getComputedStyle(el);
    if (/auto|scroll/.test(cs.overflowX)) return;      // it scrolls: reachable
    if (inScroller(el)) return;                        // a slide in someone else's track
    // A 3D/transform carousel parks its neighbouring slides off-stage on purpose;
    // only the centre one is meant to be read. Same exclusion the media checks use.
    if (el.closest("[class*='carousel']")) return;

    const lost = [...el.querySelectorAll("*")].filter((c) => {
      const cr = R(c);
      if (cr.width < 8 || cr.height < 8) return false;
      if (cr.left >= -1 && cr.right <= vw + 1) return false;   // still on screen
      if (c.closest("[class*='carousel']")) return false;
      // Off-screen but reachable: it lives in a horizontal track the reader can swipe.
      if (inScroller(c)) return false;
      // Blurred orbs and corner stickers bleed past the edge by design.
      if (isDecorative(c)) return false;
      return isVisible(c, el);
    });
    if (!lost.length) return;

    out.clippedInside.push({
      el: name(el).slice(0, 54),
      clientW: el.clientWidth,
      hidden,
      lost: lost.length,
      example: name(lost[0]).slice(0, 40) + " [" + Math.round(R(lost[0]).left) + ".." + Math.round(R(lost[0]).right) + "]",
      kind: cs.overflowX === "visible" || cs.overflowX === "clip"
        ? "clipped by an ancestor" : "explicitly hidden",
    });
  });
  out.clippedInside = out.clippedInside
    .sort((a, b) => b.hidden - a.hidden)
    .filter((o, i, arr) => arr.findIndex((x) => x.el === o.el && x.hidden === o.hidden) === i)
    .slice(0, 10);

  // ── Gutter consistency: where does text actually start? ────────────────────
  const lefts = {};
  const sample = (label, sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const r = R(el);
    if (r.width < 1) return;
    lefts[label] = { left: Math.round(r.left), pl: getComputedStyle(el).paddingLeft, sel };
  };
  sample("heading", ".section-header h2, .section-header h3, main h2");
  sample("bodyCopy", ".card-body-content p, .card-body p, main article p, main section p");
  sample("miniHeading", ".section-mini-heading");
  out.textLeftEdges = lefts;
  const vals = Object.values(lefts).map((v) => v.left);
  out.gutterMismatch = vals.length > 1 ? Math.max(...vals) - Math.min(...vals) : 0;

  // ── Media: centring + phone frames ─────────────────────────────────────────
  const MEDIA = [
    ".legacy-wallet-preview", ".rebrand-phone-placeholder", ".rebrand-phone-grid",
    ".direction-screen-item", ".img-placeholder", ".execution-inline-image",
    ".persona-card-stack", ".execution-journey-inline-screen", ".hero-image-float",
    "main figure", "main picture",
    // Documents without the placeholder framework (Lottiemon) are plain <img>. Without
    // this the scan matches nothing and reports a false all-clear.
    "main img", "main video", "main lottie-player",
  ].join(", ");

  // Anything smaller than this is an icon or a logo, not a figure worth centring.
  const MIN_MEDIA = 80;

  const media = [];
  let inspected = 0;
  document.querySelectorAll(MEDIA).forEach((el) => {
    if (inScroller(el) || isDecorative(el)) return;
    const r = R(el);
    if (r.width < MIN_MEDIA || r.height < MIN_MEDIA) return;
    inspected++;
    if (el.closest("[class*='carousel']")) return;  // transform-positioned by design
    const par = R(el.parentElement);
    const cs = getComputedStyle(el);
    const leftSlack = Math.round(r.left - par.left);
    const rightSlack = Math.round(par.right - r.right);
    if (Math.abs(leftSlack - rightSlack) > 2) {
      media.push({
        el: name(el).slice(0, 46),
        leftSlack, rightSlack,
        position: cs.position,
        transform: cs.transform === "none" ? "none" : "SET",
        marginLeft: cs.marginLeft,
        hint: cs.transform !== "none" ? "transform offset"
            : cs.position === "absolute" ? "still absolute"
            : leftSlack < 0 || rightSlack < 0 ? "wider than parent / negative margin"
            : "margin or indent rule",
      });
    }
  });
  out.notCentred = media.slice(0, 12);
  out.mediaInspected = inspected;

  // Phone frames whose media does not fill the screen area.
  const frames = [];
  document.querySelectorAll(".legacy-wallet-screen").forEach((screen) => {
    const sr = R(screen);
    if (sr.width < 20) return;
    // Only the state currently on screen is laid out; the rest of a stack render at
    // zero height. Measuring those would report every inactive slide as broken.
    const candidates = [...screen.querySelectorAll("img.placeholder-image-layer, img, iframe")]
      .filter((e) => R(e).width > 1 && R(e).height > 1);
    const m = candidates[0];
    if (!m) return;

    // Compare against the box the media is actually positioned in. Phone mocks often
    // nest a content wrapper inside the screen so status-bar and home-indicator chrome
    // can sit outside it; measuring against the outer screen reports that chrome as a
    // 49px shortfall when the media is filling its own box exactly as intended.
    const host = m.offsetParent && screen.contains(m.offsetParent) && m.offsetParent !== screen
      ? m.offsetParent : screen;
    const hr = R(host);
    const mr = R(m);
    if (mr.width < hr.width - 1 || mr.height < hr.height - 1) {
      frames.push({
        kind: m.tagName.toLowerCase(),
        screen: Math.round(hr.width) + "x" + Math.round(hr.height),
        media: Math.round(mr.width) + "x" + Math.round(mr.height),
        position: getComputedStyle(m).position,
        hint: getComputedStyle(m).position !== "absolute"
          ? "not absolutely positioned - see playbook 5.1"
          : "sized short",
      });
    }
  });
  out.framesNotFilled = frames.slice(0, 10);

  // ── Multi-image groups (carousel candidates) ───────────────────────────────
  const groups = new Map();
  document.querySelectorAll(MEDIA).forEach((el) => {
    const r = R(el);
    if (r.width < MIN_MEDIA || r.height < MIN_MEDIA) return;
    if (el.closest("[class*='carousel']") || inScroller(el)) return;
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(r.height);
  });
  out.multiImageGroups = [];
  groups.forEach((heights, el) => {
    if (heights.length < 2) return;
    const cs = getComputedStyle(el);
    out.multiImageGroups.push({
      parent: name(el).slice(0, 44),
      count: heights.length,
      stackedHeight: Math.round(heights.reduce((a, b) => a + b, 0)),
      display: cs.display,
      flexWrap: cs.flexWrap,
      overflowX: cs.overflowX,
      alreadyCarousel: cs.flexWrap === "nowrap" && /auto|scroll/.test(cs.overflowX),
    });
  });

  // ── Fixed-width SVGs ───────────────────────────────────────────────────────
  out.totalSvgs = document.querySelectorAll("svg").length;
  out.fixedWidthSvgs = [];
  document.querySelectorAll("svg[width]").forEach((s) => {
    const r = R(s);
    if (r.width < 40) return;
    const cs = getComputedStyle(s);
    if (r.width > vw + 1 || parseFloat(cs.minWidth) > vw) {
      out.fixedWidthSvgs.push({
        attrWidth: s.getAttribute("width"),
        rendered: Math.round(r.width),
        minWidth: cs.minWidth,
        scrollableParent: (() => {
          let n = s.parentElement;
          for (let i = 0; i < 4 && n; i++, n = n.parentElement)
            if (/auto|scroll/.test(getComputedStyle(n).overflowX)) return name(n).slice(0, 40);
          return null;
        })(),
      });
    }
  });

  // ── Hover-only content ─────────────────────────────────────────────────────
  const hov = document.querySelectorAll("[data-highlight-active='true']");
  out.hoverOnlyHighlights = {
    count: hov.length,
    withText: [...hov].filter((e) => (e.dataset.highlightText || "").trim()).length,
    note: "hover never fires on touch - surface as captions or accept the loss",
  };

  // ── Desktop choreography still running ─────────────────────────────────────
  out.floatingElements = [...document.querySelectorAll("[class*='floating'], [class*='float']")]
    .filter((e) => {
      const c = getComputedStyle(e);
      if (c.display === "none" || R(e).width <= 20) return false;
      // Only out-of-flow things are "floating" in the sense that breaks a phone layout.
      // Marker classes on a container (.has-floating-preview) and in-flow decoration
      // (.hero-image-float, which is just an animation hook) are not.
      return c.position === "absolute" || c.position === "fixed" || c.float !== "none";
    })
    .map((e) => name(e).slice(0, 44)).slice(0, 8);

  return out;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: "new",
    // Without this, file:// fetches (Lottie JSON, iframes) silently fail and you will
    // chase a phantom broken image. See playbook 6.
    args: ["--allow-file-access-from-files"],
  });

  console.log("\nAuditing: " + target);
  console.log("Chrome:   " + chrome);

  let anyProblem = false;

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ ...vp, isMobile: !desktopMode, hasTouch: !desktopMode });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));

    await page.goto(fileUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2500));

    // Accordion pages hide most content behind collapsed sections; open them one at a
    // time so everything gets laid out at least once. Harmless where absent.
    await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const secs = [...document.querySelectorAll(".stack-section")];
      for (const s of secs) {
        const h = s.querySelector(".section-header");
        if (h && !s.classList.contains("is-expanded")) { h.click(); await sleep(700); }
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    const r = await page.evaluate(audit);

    console.log("\n" + "=".repeat(66));
    console.log(vp.name + "  (" + vp.width + "px)");
    console.log("=".repeat(66));
    // Coverage first: "no issues" means nothing unless you know what was looked at.
    console.log("  scope inspected: " + r.mediaInspected + " media element(s), " +
                Object.keys(r.textLeftEdges).length + " text block(s), " +
                r.totalSvgs + " svg(s)");
    if (r.mediaInspected === 0)
      console.log("  WARN  no media matched - this page may not use the expected idioms; " +
                  "a clean result here proves nothing");

    const problem = (cond, label, body) => {
      if (!cond) { console.log("  ok    " + label); return; }
      anyProblem = true;
      console.log("  ISSUE " + label);
      if (body) body();
    };

    problem(r.horizontalOverflow, "horizontal page overflow (scrollW " + r.docScrollW + " vs " + r.vw + ")", () => {
      r.overflowOffenders.forEach((o) =>
        console.log("          +" + String(o.over).padStart(4) + "px  " + o.el + (o.decorative ? "   [decorative]" : "")));
    });

    problem(r.clippedInside.length > 0, "content clipped inside a container (" + r.clippedInside.length + ")", () => {
      r.clippedInside.forEach((c) => {
        console.log("          " + c.el.padEnd(54) + " box=" + String(c.clientW).padStart(4) +
                    "  hidden=" + String(c.hidden).padStart(4) + "px  (" + c.kind + ")");
        console.log("            " + c.lost + " visible element(s) off-screen, e.g. " + c.example);
      });
    });

    problem(r.gutterMismatch > 2, "gutter mismatch: " + r.gutterMismatch + "px between text blocks", () => {
      Object.entries(r.textLeftEdges).forEach(([k, v]) =>
        console.log("          " + k.padEnd(12) + " left=" + String(v.left).padStart(4) + "  padding-left=" + v.pl));
    });

    problem(r.notCentred.length > 0, "media not centred (" + r.notCentred.length + ")", () => {
      r.notCentred.forEach((m) =>
        console.log("          " + m.el.padEnd(46) + " L=" + String(m.leftSlack).padStart(5) +
                    " R=" + String(m.rightSlack).padStart(5) + "  -> " + m.hint));
    });

    problem(r.framesNotFilled.length > 0, "phone frames whose media does not fill (" + r.framesNotFilled.length + ")", () => {
      r.framesNotFilled.forEach((f) =>
        console.log("          " + f.kind.padEnd(7) + " screen=" + f.screen.padEnd(10) +
                    " media=" + f.media.padEnd(10) + " pos=" + f.position + "  -> " + f.hint));
    });

    const stackable = r.multiImageGroups.filter((g) => !g.alreadyCarousel);
    problem(stackable.length > 0, "multi-image groups stacked vertically (" + stackable.length + ")", () => {
      stackable.forEach((g) =>
        console.log("          " + g.parent.padEnd(44) + " n=" + g.count +
                    "  stacked=" + g.stackedHeight + "px  (" + g.display + "/" + g.flexWrap + ")"));
      const total = stackable.reduce((a, g) => a + g.stackedHeight, 0);
      console.log("          total stacked height: " + total + "px");
    });

    const clipped = r.fixedWidthSvgs.filter((s) => !s.scrollableParent);
    problem(clipped.length > 0, "oversized SVGs that will clip (" + clipped.length + ")", () => {
      clipped.forEach((s) =>
        console.log("          attr=" + String(s.attrWidth).padEnd(6) + " rendered=" + String(s.rendered).padEnd(6) +
                    " min-width=" + String(s.minWidth).padEnd(9) + " NOT scrollable"));
    });
    const scrollableSvgs = r.fixedWidthSvgs.filter((s) => s.scrollableParent);
    if (scrollableSvgs.length)
      console.log("  info  " + scrollableSvgs.length + " oversized SVG(s) scroll horizontally (accepted - playbook 4.4)");

    if (!desktopMode) {
      if (r.hoverOnlyHighlights.withText > 0)
        console.log("  info  " + r.hoverOnlyHighlights.withText + " hover-only highlight(s) carry text - " +
                    "unreachable on touch unless surfaced as captions (playbook 4.5)");
      problem(r.floatingElements.length > 0, "floating elements still visible (" + r.floatingElements.length + ")", () => {
        r.floatingElements.forEach((e) => console.log("          " + e));
      });
    }

    if (errors.length) { anyProblem = true; console.log("  ISSUE page errors:"); errors.slice(0, 3).forEach((e) => console.log("          " + e)); }

    await page.close();
  }

  await browser.close();
  console.log("\n" + (anyProblem
    ? "Issues found. Read them against mobile-port-playbook.md section 4 before changing anything."
    : "No issues detected at these widths. Still look at screenshots - see playbook section 6."));
  console.log();
})().catch((e) => { console.error(e); process.exit(1); });
