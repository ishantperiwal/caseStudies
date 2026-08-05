document.documentElement.classList.add("js");

const chapters = Array.from(document.querySelectorAll(".chapter"));
const currentTitle = document.querySelector("#chapter-current");
const currentNumber = document.querySelector("#chapter-number");
const previousButton = document.querySelector("#previous-chapter");
const nextButton = document.querySelector("#next-chapter");
const themeButton = document.querySelector("#theme-toggle");
const presentButton = document.querySelector("#present-button");
const markerButton = document.querySelector("#marker-toggle");
const markerCanvas = document.querySelector("#presentation-marker");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const briefChapter = document.querySelector("#brief");
const propositionChapter = document.querySelector("#proposition");
const adoptionChapter = document.querySelector("#adoption-strategy");
const contextChapter = document.querySelector("#context");
const entryPointsChapter = document.querySelector("#entry-points");
let activeIndex = 0;
let adoptionStep = 0;
let contextStep = 0;
let entryPointStep = 0;
let entryPointRotations = [];
let entryTimeline = null;
let entryTimelineTween = null;
let entryHealTimer = 0;
const scriptMode = new URLSearchParams(window.location.search).get("script") === "true";
let speakerPanel = null;
let speakerIntent = null;
let speakerCopy = null;
let speakerBeat = null;
let speakerTiming = null;

function getSpeakerStep(chapter) {
  if (chapter === briefChapter) return chapter.classList.contains("is-brief-revealed") ? 1 : 0;
  if (chapter === propositionChapter) return chapter.classList.contains("is-proposition-revealed") ? 1 : 0;
  if (chapter === adoptionChapter) return adoptionStep;
  if (chapter === contextChapter) return contextStep;
  if (chapter === entryPointsChapter) return entryPointStep;
  return 0;
}

function formatSpeakerTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function getSpeakerProgress(chapterId, step) {
  const scriptData = window.ZAPP_SPEAKER_SCRIPT;
  let elapsed = 0;
  let beatIndex = 0;
  let activeBeat = 0;
  Object.entries(scriptData?.chapters || {}).forEach(([id, beats]) => {
    beats.forEach((beat, index) => {
      beatIndex += 1;
      if (id === chapterId && index === step) activeBeat = beatIndex;
      if (activeBeat === 0) elapsed += beat.seconds;
    });
  });
  const beatCount = Object.values(scriptData?.chapters || {}).reduce((total, beats) => total + beats.length, 0);
  return { elapsed, activeBeat, beatCount };
}

function updateSpeakerPanel() {
  if (!speakerPanel) return;
  const chapter = chapters[activeIndex];
  const step = getSpeakerStep(chapter);
  const note = window.ZAPP_SPEAKER_SCRIPT?.chapters?.[chapter.id]?.[step];
  if (!note) {
    speakerIntent.textContent = "No rehearsal note is available for this beat yet.";
    speakerCopy.textContent = "";
    return;
  }
  const progress = getSpeakerProgress(chapter.id, step);
  speakerBeat.textContent = `Beat ${progress.activeBeat} of ${progress.beatCount}`;
  speakerTiming.textContent = `${formatSpeakerTime(note.seconds)} target · ${formatSpeakerTime(progress.elapsed)} elapsed`;
  speakerIntent.textContent = note.intent;
  speakerCopy.textContent = note.script;
  speakerCopy.scrollTop = 0;
}

function initSpeakerPanel() {
  if (!scriptMode || !window.ZAPP_SPEAKER_SCRIPT) return;
  document.documentElement.classList.add("script-mode");
  speakerPanel = document.createElement("aside");
  speakerPanel.className = "speaker-panel";
  speakerPanel.setAttribute("aria-label", "Speaker script");
  speakerPanel.innerHTML = `
    <div class="speaker-panel__header">
      <div><strong>Speaker script</strong><span class="speaker-panel__beat"></span></div>
      <button type="button" class="speaker-panel__toggle" aria-expanded="true" aria-label="Collapse speaker script">Hide</button>
    </div>
    <div class="speaker-panel__content">
      <div class="speaker-panel__timing"></div>
      <section class="speaker-panel__intent"><span>Intent</span><p></p></section>
      <div class="speaker-panel__copy" tabindex="0"></div>
    </div>`;
  document.body.appendChild(speakerPanel);
  speakerIntent = speakerPanel.querySelector(".speaker-panel__intent p");
  speakerCopy = speakerPanel.querySelector(".speaker-panel__copy");
  speakerBeat = speakerPanel.querySelector(".speaker-panel__beat");
  speakerTiming = speakerPanel.querySelector(".speaker-panel__timing");
  speakerPanel.querySelector(".speaker-panel__toggle").addEventListener("click", (event) => {
    const collapsed = speakerPanel.classList.toggle("is-collapsed");
    event.currentTarget.textContent = collapsed ? "Show" : "Hide";
    event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
    event.currentTarget.setAttribute("aria-label", `${collapsed ? "Expand" : "Collapse"} speaker script`);
  });
  updateSpeakerPanel();
}

function setBriefReveal(isRevealed) {
  briefChapter?.classList.toggle("is-brief-revealed", isRevealed);
  updateSpeakerPanel();
}

function setPropositionReveal(isRevealed) {
  propositionChapter?.classList.toggle("is-proposition-revealed", isRevealed);
  updateSpeakerPanel();
}

function setAdoptionStep(step) {
  adoptionStep = Math.max(0, Math.min(5, step));
  adoptionChapter?.setAttribute("data-adoption-step", String(adoptionStep));
  updateSpeakerPanel();
}

function setContextStep(step) {
  contextStep = Math.max(0, Math.min(2, step));
  contextChapter?.setAttribute("data-context-step", String(contextStep));
  updateSpeakerPanel();
}

function setEntryPointStep(step) {
  entryPointStep = Math.max(0, Math.min(18, step));
  entryPointsChapter?.setAttribute("data-entry-step", String(entryPointStep));
  syncEntryFullPrototype(entryPointStep);
  if (entryTimeline) {
    const label = `step${entryPointStep}`;
    entryTimelineTween?.kill();
    if (chapters[activeIndex] === entryPointsChapter) {
      entryTimelineTween = entryTimeline.tweenTo(label, {
        ease: "none",
        overwrite: true,
        onComplete: restoreEntryTimelinePosition
      });
    } else {
      entryTimeline.pause(entryTimeline.labels[label]);
    }
    // Rapid stepping kills tweens mid-flight; assert the playhead once stepping settles.
    window.clearTimeout(entryHealTimer);
    entryHealTimer = window.setTimeout(restoreEntryTimelinePosition, 900);
  }
  if (chapters[activeIndex] === entryPointsChapter && entryPointStep === 0) startEntryPointRotations();
  if (entryPointStep > 0) stopEntryPointRotations();
  updateSpeakerPanel();
}

function advancePresentation() {
  if (chapters[activeIndex] === briefChapter && !briefChapter.classList.contains("is-brief-revealed")) {
    setBriefReveal(true);
    return;
  }
  if (chapters[activeIndex] === propositionChapter && !propositionChapter.classList.contains("is-proposition-revealed")) {
    setPropositionReveal(true);
    return;
  }
  if (chapters[activeIndex] === adoptionChapter && adoptionStep < 5) {
    setAdoptionStep(adoptionStep + 1);
    return;
  }
  if (chapters[activeIndex] === contextChapter && contextStep < 2) {
    setContextStep(contextStep + 1);
    return;
  }
  if (chapters[activeIndex] === entryPointsChapter && entryPointStep < 18) {
    setEntryPointStep(entryPointStep + 1);
    return;
  }
  scrollToChapter(activeIndex + 1);
}

function retreatPresentation() {
  if (chapters[activeIndex] === adoptionChapter && adoptionStep > 0) {
    setAdoptionStep(adoptionStep - 1);
    return;
  }
  if (chapters[activeIndex] === contextChapter && contextStep > 0) {
    setContextStep(contextStep - 1);
    return;
  }
  if (chapters[activeIndex] === entryPointsChapter && entryPointStep > 0) {
    setEntryPointStep(entryPointStep - 1);
    return;
  }
  if (chapters[activeIndex] === briefChapter && briefChapter.classList.contains("is-brief-revealed")) {
    setBriefReveal(false);
    return;
  }
  if (chapters[activeIndex] === propositionChapter && propositionChapter.classList.contains("is-proposition-revealed")) {
    setPropositionReveal(false);
    return;
  }
  scrollToChapter(activeIndex - 1);
}

function scrollToChapter(index) {
  const safeIndex = Math.max(0, Math.min(chapters.length - 1, index));
  chapters[safeIndex].scrollIntoView({
    behavior: reduceMotion.matches ? "auto" : "smooth",
    block: "start"
  });
  chapters[safeIndex].focus({ preventScroll: true });
}

function updateChapter(index) {
  activeIndex = index;
  const chapter = chapters[index];
  if (chapter !== briefChapter) setBriefReveal(false);
  if (chapter !== propositionChapter) setPropositionReveal(false);
  if (chapter !== adoptionChapter) setAdoptionStep(0);
  if (chapter !== contextChapter) setContextStep(0);
  if (chapter !== entryPointsChapter) setEntryPointStep(0);
  if (chapter === entryPointsChapter && entryPointStep === 0 && entryPointRotations.length === 0) startEntryPointRotations();
  if (chapter !== entryPointsChapter) stopEntryPointRotations();
  if (chapter === entryPointsChapter) restoreEntryTimelinePosition();
  currentTitle.textContent = chapter.dataset.title;
  currentNumber.textContent = String(index + 1);
  previousButton.disabled = index === 0;
  nextButton.disabled = index === chapters.length - 1;
  updateSpeakerPanel();
}

const chapterObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  const index = chapters.indexOf(visible.target);
  if (index >= 0) updateChapter(index);
}, { threshold: [0.34, 0.55, 0.72] });

chapters.forEach((chapter) => chapterObserver.observe(chapter));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((section) => revealObserver.observe(section));

function visibleHeight(rect) {
  return Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
}

// A fast scroll can deliver an IntersectionObserver batch with nothing intersecting,
// so the observers alone can miss a chapter entirely. These recover from that.
function restoreEntryTimelinePosition() {
  if (!entryTimeline) return;
  if (entryTimelineTween?.isActive()) {
    window.clearTimeout(entryHealTimer);
    entryHealTimer = window.setTimeout(restoreEntryTimelinePosition, 300);
    return;
  }
  const target = entryTimeline.labels[`step${entryPointStep}`];
  if (typeof target !== "number") return;
  if (Math.abs(entryTimeline.time() - target) > 0.001) entryTimeline.pause(target);
}

function healRevealSections() {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (visibleHeight(rect) > Math.min(rect.height, window.innerHeight) * 0.18) {
      section.classList.add("is-visible");
    }
  });
}

function reconcileScrollState() {
  healRevealSections();
  let dominantIndex = -1;
  let dominantVisible = 0;
  chapters.forEach((chapter, index) => {
    const visible = visibleHeight(chapter.getBoundingClientRect());
    if (visible > dominantVisible) {
      dominantVisible = visible;
      dominantIndex = index;
    }
  });
  if (dominantIndex < 0 || dominantVisible < window.innerHeight * 0.5) return;
  if (dominantIndex !== activeIndex) {
    updateChapter(dominantIndex);
    return;
  }
  if (chapters[dominantIndex] === entryPointsChapter) restoreEntryTimelinePosition();
}

if ("onscrollend" in window) {
  window.addEventListener("scrollend", reconcileScrollState);
} else {
  let scrollSettleTimer = 0;
  window.addEventListener("scroll", () => {
    window.clearTimeout(scrollSettleTimer);
    scrollSettleTimer = window.setTimeout(reconcileScrollState, 160);
  }, { passive: true });
}

window.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });
window.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
window.addEventListener("mousedown", (event) => {
  if (event.button === 1) event.preventDefault();
}, { passive: false });

function lockEmbeddedScroll(frame) {
  try {
    const frameDocument = frame.contentDocument;
    if (!frameDocument) return;
    frameDocument.documentElement.style.overflow = "hidden";
    if (frameDocument.body) frameDocument.body.style.overflow = "hidden";
    frameDocument.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });
    frameDocument.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
  } catch {
    // Cross-origin frames cannot be controlled from the presentation shell.
  }
}

document.querySelectorAll("iframe").forEach((frame) => {
  frame.addEventListener("load", () => lockEmbeddedScroll(frame));
  if (frame.contentDocument?.readyState === "complete") lockEmbeddedScroll(frame);
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "m") {
    event.preventDefault();
    setMarkerMode(!document.body.classList.contains("is-marker-mode"));
    return;
  }
  if (event.key === "Escape" && document.body.classList.contains("is-marker-mode")) {
    event.preventDefault();
    setMarkerMode(false);
    return;
  }
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  if (event.key === " ") {
    event.preventDefault();
    return;
  }
  if (["ArrowRight", "ArrowDown", "PageDown"].includes(event.key)) {
    event.preventDefault();
    advancePresentation();
  }
  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    retreatPresentation();
  }
  if (event.key === "Home") {
    event.preventDefault();
    scrollToChapter(0);
  }
  if (event.key === "End") {
    event.preventDefault();
    scrollToChapter(chapters.length - 1);
  }
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  themeButton.setAttribute("aria-pressed", String(isDark));
  themeButton.textContent = isDark ? "Light theme" : "Dark theme";
  localStorage.setItem("zapp-presentation-theme", theme);
}

const savedTheme = localStorage.getItem("zapp-presentation-theme");
setTheme(savedTheme || "light");

themeButton.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

presentButton.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      presentButton.textContent = "Exit full screen";
    } else {
      await document.exitFullscreen();
    }
  } catch {
    presentButton.textContent = "Full screen unavailable";
    presentButton.disabled = true;
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) presentButton.textContent = "Present";
});

const markerContext = markerCanvas.getContext("2d");
const markerStrokes = [];
let activeMarkerStroke = null;
let markerFrame = null;
const markerHoldDuration = 900;
const markerFadeDuration = 1200;

function setMarkerMode(isActive) {
  document.body.classList.toggle("is-marker-mode", isActive);
  markerButton.setAttribute("aria-pressed", String(isActive));
  markerButton.textContent = isActive ? "Marker on" : "Marker";
  if (!isActive && activeMarkerStroke) finishMarkerStroke();
}

function resizeMarkerCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  markerCanvas.width = Math.round(window.innerWidth * pixelRatio);
  markerCanvas.height = Math.round(window.innerHeight * pixelRatio);
  markerCanvas.style.width = `${window.innerWidth}px`;
  markerCanvas.style.height = `${window.innerHeight}px`;
  markerContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  renderMarkerStrokes(performance.now());
}

function markerPoint(event) {
  return { x: event.clientX, y: event.clientY };
}

function markerColor() {
  return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#1d5bd6";
}

function beginMarkerStroke(event) {
  if (event.button !== 0) return;
  event.preventDefault();
  activeMarkerStroke = {
    points: [markerPoint(event)],
    color: markerColor(),
    endedAt: null
  };
  markerStrokes.push(activeMarkerStroke);
  markerCanvas.setPointerCapture(event.pointerId);
  requestMarkerFrame();
}

function extendMarkerStroke(event) {
  if (!activeMarkerStroke) return;
  event.preventDefault();
  const point = markerPoint(event);
  const previous = activeMarkerStroke.points.at(-1);
  if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) >= 1.5) {
    activeMarkerStroke.points.push(point);
  }
  requestMarkerFrame();
}

function finishMarkerStroke(event) {
  if (!activeMarkerStroke) return;
  if (event?.pointerId !== undefined && markerCanvas.hasPointerCapture(event.pointerId)) {
    markerCanvas.releasePointerCapture(event.pointerId);
  }
  activeMarkerStroke.endedAt = performance.now();
  activeMarkerStroke = null;
  requestMarkerFrame();
}

function strokeOpacity(stroke, now) {
  if (stroke.endedAt === null) return 1;
  const fadeProgress = (now - stroke.endedAt - markerHoldDuration) / markerFadeDuration;
  return 1 - Math.max(0, Math.min(1, fadeProgress));
}

function drawMarkerStroke(stroke, opacity) {
  if (stroke.points.length === 0 || opacity <= 0) return;
  markerContext.save();
  markerContext.globalAlpha = opacity;
  markerContext.strokeStyle = stroke.color;
  markerContext.fillStyle = stroke.color;
  markerContext.lineWidth = 5;
  markerContext.lineCap = "round";
  markerContext.lineJoin = "round";
  markerContext.beginPath();
  markerContext.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let index = 1; index < stroke.points.length; index += 1) {
    const point = stroke.points[index];
    const previous = stroke.points[index - 1];
    const midpointX = (previous.x + point.x) / 2;
    const midpointY = (previous.y + point.y) / 2;
    markerContext.quadraticCurveTo(previous.x, previous.y, midpointX, midpointY);
  }
  if (stroke.points.length === 1) {
    markerContext.arc(stroke.points[0].x, stroke.points[0].y, 2.5, 0, Math.PI * 2);
    markerContext.fill();
  } else {
    markerContext.lineTo(stroke.points.at(-1).x, stroke.points.at(-1).y);
    markerContext.stroke();
  }
  markerContext.restore();
}

function renderMarkerStrokes(now) {
  markerContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let index = markerStrokes.length - 1; index >= 0; index -= 1) {
    const stroke = markerStrokes[index];
    const opacity = strokeOpacity(stroke, now);
    if (stroke.endedAt !== null && opacity <= 0) {
      markerStrokes.splice(index, 1);
      continue;
    }
    drawMarkerStroke(stroke, opacity);
  }
  markerFrame = null;
  if (activeMarkerStroke || markerStrokes.some((stroke) => stroke.endedAt !== null)) requestMarkerFrame();
}

function requestMarkerFrame() {
  if (markerFrame === null) markerFrame = requestAnimationFrame(renderMarkerStrokes);
}

markerButton.addEventListener("click", () => {
  setMarkerMode(!document.body.classList.contains("is-marker-mode"));
  markerButton.blur();
});
markerCanvas.addEventListener("pointerdown", beginMarkerStroke);
markerCanvas.addEventListener("pointermove", extendMarkerStroke);
markerCanvas.addEventListener("pointerup", finishMarkerStroke);
markerCanvas.addEventListener("pointercancel", finishMarkerStroke);
window.addEventListener("resize", resizeMarkerCanvas);
resizeMarkerCanvas();

const onboardingFrame = document.querySelector("#onboarding-prototype");
const onboardingLayer = onboardingFrame.closest(".prototype-layer");
onboardingFrame.addEventListener("load", () => onboardingLayer.classList.add("is-loaded"));

const entryFullFrame = document.querySelector("#entry-full-prototype");
const entryFullLayer = entryFullFrame.closest(".prototype-layer");
const entryFullMessageOrigin = window.location.origin === "null" ? "*" : window.location.origin;

function syncEntryFullPrototype(step) {
  if (!entryFullFrame?.contentWindow) return;
  const section = step >= 17 ? "actions" : step >= 12 ? "balance" : null;
  entryFullFrame.contentWindow.postMessage({ type: "zapp-home:focus-section", section }, entryFullMessageOrigin);
  entryFullFrame.contentWindow.postMessage(
    { type: "zapp-home:set-nudge-cycle", enabled: step >= 17 },
    entryFullMessageOrigin
  );
  if (step === 12) {
    window.setTimeout(() => {
      entryFullFrame.contentWindow?.postMessage({ type: "zapp-home:balance-reveal" }, entryFullMessageOrigin);
    }, reduceMotion.matches ? 0 : 180);
  }
}

entryFullFrame.addEventListener("load", () => {
  entryFullLayer.classList.add("is-loaded");
  syncEntryFullPrototype(entryPointStep);
});

function initEntryTimeline() {
  if (!window.gsap || !window.CustomEase || !entryPointsChapter) return;

  const compactEntryViewport = window.matchMedia("(min-width: 901px) and (max-height: 900px)").matches;
  const onboardingRestY = compactEntryViewport ? 34 : 16;
  const onboardingShowcaseScale = compactEntryViewport ? 1.02 : 1.1;
  const onboardingKycY = compactEntryViewport ? -610 : -640;
  const onboardingKycScale = compactEntryViewport ? 0.9 : 0.94;

  window.gsap.registerPlugin(window.CustomEase);
  window.CustomEase.create("entryEase", "0.1,0.1,0.55,1");
  window.CustomEase.create("repositionEase", "0.6,0,0.2,1");
  window.CustomEase.create("exitEase", "0.65,0,0.9,0.9");
  window.CustomEase.create("pressReturnEase", "0.1,0.1,0.3,1");
  document.documentElement.classList.add("gsap-ready");

  const outerLabel = entryPointsChapter.querySelector(".entry-points-copy > .slide-section-label");
  const entryCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--entry");
  const onboardingCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--onboarding");
  const limitedOverviewCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--limited-overview");
  const limitedCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--limited");
  const lockedFocusCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--locked-focus");
  const familiarityCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--familiarity");
  const cashpointsCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--cashpoints");
  const balanceCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--balance");
  const addMoneyCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--add-money");
  const autoloadCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--autoload");
  const nudgesCopy = entryPointsChapter.querySelector(".entry-onboarding-copy-state--nudges");
  const addMoneyContext = addMoneyCopy.querySelector(".entry-beat-context");
  const autoloadContext = autoloadCopy.querySelector(".entry-beat-context");
  const nudgesContext = nudgesCopy.querySelector(".entry-beat-context");
  const addMoneyMetric = addMoneyCopy.querySelector(".entry-beat-metric");
  const autoloadMetric = autoloadCopy.querySelector(".entry-beat-metric");
  const nudgesMetric = nudgesCopy.querySelector(".entry-beat-metric");
  const entryMocks = entryPointsChapter.querySelector(".entry-points-visual");
  const kycInterlude = entryPointsChapter.querySelector(".entry-kyc-interlude");
  const onboardingStage = entryPointsChapter.querySelector(".entry-onboarding-stage");
  const onboardingVisual = entryPointsChapter.querySelector(".entry-onboarding-visual");
  const primaryAccount = onboardingVisual.querySelector(".entry-primary-account");
  const limitedComparison = onboardingVisual.querySelector(".entry-limited-comparison");
  const payzappHome = onboardingVisual.querySelector(".entry-payzapp-home");
  const inspirationHeading = onboardingVisual.querySelector(".entry-inspiration-heading");
  const accountLabels = onboardingVisual.querySelectorAll(".entry-account-label");
  const prototypeLayer = onboardingVisual.querySelector(".entry-onboarding-layer");
  const fullLayer = onboardingVisual.querySelector(".entry-full-layer");
  const touch = onboardingVisual.querySelector(".entry-cta-touch");
  const touchPulse = touch.querySelector("span");

  window.gsap.set(entryCopy, { autoAlpha: 1, y: 0 });
  window.gsap.set(entryMocks, { autoAlpha: 1, y: 0 });
  window.gsap.set(onboardingCopy, { autoAlpha: 0, y: 34 });
  window.gsap.set(limitedOverviewCopy, { autoAlpha: 0, y: 34 });
  window.gsap.set(limitedCopy, { autoAlpha: 0, y: 34 });
  window.gsap.set(lockedFocusCopy, { autoAlpha: 0, y: 34 });
  window.gsap.set(familiarityCopy, { autoAlpha: 0, y: 34 });
  window.gsap.set([cashpointsCopy, balanceCopy, addMoneyCopy, autoloadCopy, nudgesCopy], { autoAlpha: 0, y: 34 });
  window.gsap.set([addMoneyMetric, autoloadMetric, nudgesMetric], { autoAlpha: 0, y: 28 });
  window.gsap.set(kycInterlude, { autoAlpha: 0, y: 420 });
  window.gsap.set(onboardingVisual, { autoAlpha: 0, y: 34, xPercent: 0, scale: 1 });
  window.gsap.set(primaryAccount, { xPercent: -50, yPercent: -50, x: 0, scale: 1 });
  window.gsap.set(limitedComparison, { autoAlpha: 0, xPercent: -50, yPercent: -50, x: 0, scale: 0.9 });
  window.gsap.set(payzappHome, { autoAlpha: 0, xPercent: -50, yPercent: -50, x: -760, scale: 0.78 });
  window.gsap.set(onboardingStage, { "--entry-crop-opacity": 0 });
  window.gsap.set(inspirationHeading, { autoAlpha: 0, xPercent: -50, yPercent: 0, y: 14 });
  window.gsap.set(accountLabels, { autoAlpha: 0, y: 12 });
  window.gsap.set(outerLabel, { autoAlpha: 1, y: 0 });
  window.gsap.set(prototypeLayer, { autoAlpha: 1 });
  window.gsap.set(fullLayer, { autoAlpha: 0 });
  window.gsap.set(touch, { autoAlpha: 0, y: 150, scale: 0.82 });
  window.gsap.set(touchPulse, { autoAlpha: 0, scale: 0.7 });

  entryTimeline = window.gsap.timeline({ paused: true, defaults: { ease: "entryEase" } });
  entryTimeline.addLabel("step0", 0)
    .to([entryCopy, entryMocks], { autoAlpha: 0, y: -28, duration: 0.46, ease: "exitEase" }, 0)
    .to([onboardingCopy, onboardingVisual], { autoAlpha: 1, y: onboardingRestY, duration: 0.46 }, ">")
    .addLabel("step1")
    .to(onboardingCopy, { autoAlpha: 0, y: -34, duration: 0.46 })
    .to(outerLabel, { autoAlpha: 0, y: -16, duration: 0.42 }, "<")
    .to(onboardingVisual, { xPercent: -48, scale: onboardingShowcaseScale, duration: 0.56, ease: "repositionEase" }, "<")
    .addLabel("step2")
    .to(onboardingVisual, { autoAlpha: 0.42, y: onboardingKycY, scale: onboardingKycScale, duration: 0.68, ease: "repositionEase" })
    .to(kycInterlude, { autoAlpha: 1, y: 0, duration: 0.68, ease: "repositionEase" }, "<")
    .addLabel("step3")
    .to(kycInterlude, { autoAlpha: 0, y: 420, duration: 0.64, ease: "repositionEase" })
    .to(onboardingVisual, { autoAlpha: 1, xPercent: -48, y: onboardingRestY, scale: onboardingShowcaseScale, duration: 0.64, ease: "repositionEase" }, "<")
    .addLabel("step4")
    .to(touch, { autoAlpha: 1, y: 0, scale: 1, duration: 0.52 })
    .to(touch, { scale: 0.72, duration: 0.18, ease: "exitEase" })
    .to(primaryAccount, { scale: 0.94, duration: 0.18, ease: "exitEase" }, "<")
    .set(touchPulse, { autoAlpha: 0.82, scale: 0.7 }, "<")
    .to(touchPulse, { autoAlpha: 0, scale: 2.4, duration: 0.35 }, "<")
    .to(touch, { scale: 1, duration: 0.28, ease: "pressReturnEase" })
    .to(primaryAccount, { scale: 1.02, duration: 0.32, ease: "pressReturnEase" }, "<")
    .to(touch, { autoAlpha: 0, duration: 0.16 })
    .to(prototypeLayer, { autoAlpha: 0, duration: 0.36 }, "<")
    .to(fullLayer, { autoAlpha: 1, duration: 0.42 }, ">")
    .addLabel("step5")
    .to(onboardingVisual, { xPercent: -12, y: 0, scale: 1, duration: 0.58, ease: "repositionEase" })
    .to(primaryAccount, { x: 180, scale: 0.9, duration: 0.58, ease: "repositionEase" }, "<")
    .to(limitedComparison, { autoAlpha: 1, x: -180, scale: 0.9, duration: 0.58, ease: "repositionEase" }, "<")
    .to(accountLabels, { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.08, ease: "entryEase" }, "<")
    .to(limitedOverviewCopy, { autoAlpha: 1, y: 0, duration: 0.46, ease: "entryEase" }, "<0.12")
    .addLabel("step6")
    .to(onboardingVisual, { xPercent: 0, duration: 0.68, ease: "repositionEase" })
    .to(primaryAccount, { autoAlpha: 0.18, x: 280, scale: 0.42, duration: 0.68, ease: "repositionEase" }, "<")
    .to(limitedComparison, { autoAlpha: 1, x: -78, y: -60, scale: 1.38, duration: 0.68, ease: "repositionEase" }, "<")
    .to(onboardingStage, { "--entry-crop-opacity": 1, duration: 0.52, ease: "entryEase" }, "<")
    .to(accountLabels, { autoAlpha: 0, y: 8, duration: 0.34, ease: "exitEase" }, "<")
    .to(limitedOverviewCopy, { autoAlpha: 0, y: -28, duration: 0.42, ease: "exitEase" }, "<")
    .to(limitedCopy, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, ">-0.08")
    .addLabel("step7")
    .to(limitedCopy, { autoAlpha: 0, y: -28, duration: 0.42, ease: "exitEase" })
    .to(lockedFocusCopy, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, ">-0.08")
    .addLabel("step8")
    .addLabel("trioEnter")
    .to(lockedFocusCopy, { autoAlpha: 0, y: -28, duration: 0.42, ease: "exitEase" }, "trioEnter")
    .to(onboardingVisual, { xPercent: -36, duration: 0.68, ease: "repositionEase" }, "trioEnter")
    .to(primaryAccount, { autoAlpha: 1, x: 345, y: 50, scale: 0.82, duration: 0.68, ease: "repositionEase" }, "trioEnter")
    .to(limitedComparison, { autoAlpha: 1, x: 0, y: 50, scale: 0.82, duration: 0.68, ease: "repositionEase" }, "trioEnter")
    .to(payzappHome, { autoAlpha: 1, x: -345, y: 50, scale: 0.82, duration: 0.68, ease: "repositionEase" }, "trioEnter")
    .to(onboardingStage, { "--entry-crop-opacity": 0, duration: 0.46, ease: "repositionEase" }, "trioEnter+=0.22")
    .to(accountLabels, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.06, ease: "entryEase" }, "trioEnter+=0.24")
    .to(inspirationHeading, { autoAlpha: 1, y: 0, duration: 0.46, ease: "entryEase" }, "trioEnter+=0.24")
    .addLabel("step9")
    .addLabel("familiarityEnter")
    .to(inspirationHeading, { autoAlpha: 0, y: -14, duration: 0.36, ease: "exitEase" }, "familiarityEnter")
    .to(onboardingVisual, { xPercent: -6, duration: 0.68, ease: "repositionEase" }, "familiarityEnter")
    .to(limitedComparison, { autoAlpha: 0, y: 50, scale: 0.72, duration: 0.68, ease: "repositionEase" }, "familiarityEnter")
    .to(primaryAccount, { autoAlpha: 1, x: 180, y: 30, scale: 0.98, duration: 0.68, ease: "repositionEase" }, "familiarityEnter")
    .to(payzappHome, { autoAlpha: 1, x: -180, y: 30, scale: 0.98, duration: 0.68, ease: "repositionEase" }, "familiarityEnter")
    .to(familiarityCopy, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, "familiarityEnter+=0.22")
    .addLabel("step10")
    .addLabel("fullDetailEnter")
    .to(familiarityCopy, { autoAlpha: 0, y: -28, duration: 0.42, ease: "exitEase" }, "fullDetailEnter")
    .to(onboardingVisual, { xPercent: 0, duration: 0.68, ease: "repositionEase" }, "fullDetailEnter")
    .to(payzappHome, { autoAlpha: 0, x: -260, scale: 0.84, duration: 0.68, ease: "repositionEase" }, "fullDetailEnter")
    .to(limitedComparison, { autoAlpha: 0, duration: 0.36, ease: "exitEase" }, "fullDetailEnter")
    .to(accountLabels, { autoAlpha: 0, y: 8, duration: 0.34, ease: "exitEase" }, "fullDetailEnter")
    .to(primaryAccount, { autoAlpha: 1, x: 80, y: 180, scale: 1.45, duration: 0.68, ease: "repositionEase" }, "fullDetailEnter")
    .to(onboardingStage, { "--entry-crop-opacity": 1, duration: 0.52, ease: "entryEase" }, "fullDetailEnter+=0.12")
    .to(cashpointsCopy, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, "fullDetailEnter+=0.28")
    .addLabel("step11")
    .to(cashpointsCopy, { autoAlpha: 0, y: -28, duration: 0.42, ease: "exitEase" })
    .to(balanceCopy, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, ">-0.08")
    .addLabel("step12")
    .to(balanceCopy, { autoAlpha: 0, y: -28, duration: 0.42, ease: "exitEase" })
    .to(addMoneyCopy, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, ">-0.08")
    .addLabel("step13")
    .to(addMoneyContext, { y: -24, duration: 0.48, ease: "repositionEase" })
    .to(addMoneyMetric, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, "<0.1")
    .addLabel("step14")
    .to(addMoneyCopy, { autoAlpha: 0, y: -28, duration: 0.42, ease: "exitEase" })
    .to(primaryAccount, { y: 135, duration: 0.68, ease: "repositionEase" }, "<")
    .to(autoloadCopy, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, ">-0.08")
    .addLabel("step15")
    .to(autoloadContext, { y: -24, duration: 0.48, ease: "repositionEase" })
    .to(autoloadMetric, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, "<0.1")
    .addLabel("step16")
    .to(autoloadCopy, { autoAlpha: 0, y: -28, duration: 0.42, ease: "exitEase" })
    .to(primaryAccount, { y: 22, duration: 0.68, ease: "repositionEase" }, "<")
    .to(nudgesCopy, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, ">-0.08")
    .addLabel("step17")
    .to(nudgesContext, { y: -24, duration: 0.48, ease: "repositionEase" })
    .to(nudgesMetric, { autoAlpha: 1, y: 0, duration: 0.48, ease: "entryEase" }, "<0.1")
    .addLabel("step18");
}

initEntryTimeline();

const entryPointOptions = Array.from(document.querySelectorAll(".entry-point-option"));

function showEntryPointScreen(option, src, alt) {
  const screenLayers = Array.from(option.querySelectorAll(".device-screen > img"));
  const activeLayer = Number(option.dataset.activeLayer || 0);
  const currentScreen = screenLayers[activeLayer];
  const nextScreenIndex = activeLayer === 0 ? 1 : 0;
  const nextScreen = screenLayers[nextScreenIndex];
  const requestedUrl = new URL(src, window.location.href).href;
  if (currentScreen.src === requestedUrl) return;
  nextScreen.src = src;
  nextScreen.alt = alt;
  nextScreen.style.opacity = "0";
  window.requestAnimationFrame(() => {
    currentScreen.style.opacity = "0";
    nextScreen.style.opacity = "1";
  });
  option.dataset.activeLayer = String(nextScreenIndex);
}

function stopEntryPointRotations() {
  entryPointRotations.forEach((rotation) => window.clearInterval(rotation));
  entryPointRotations = [];
}

function startEntryPointRotations() {
  stopEntryPointRotations();
  entryPointOptions.forEach((option) => {
    const screens = option.dataset.entryScreens.split("|");
    showEntryPointScreen(option, screens[0], option.dataset.entryAlt);
    if (screens.length < 2) return;
    let screenIndex = 0;
    const rotation = window.setInterval(() => {
      screenIndex = (screenIndex + 1) % screens.length;
      showEntryPointScreen(option, screens[screenIndex], option.dataset.entryAlt);
    }, 2800);
    entryPointRotations.push(rotation);
  });
}

initSpeakerPanel();
