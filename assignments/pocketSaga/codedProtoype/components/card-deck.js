/* Reusable looping deck: one previous peek, active card, and a replenished right stack. */
(() => {
  const { node, Artwork, Composer, ProgressiveBlur, SeparatedMeta } = PocketSaga;
  function CardDeck(items, viewer, { onChange = () => {}, onCompose = () => {}, onProgress = () => {}, variant = 'stack' } = {}) {
    const root = node('section', 'card-deck');
    const sliding = variant === 'slide';
    root.dataset.variant = sliding ? 'slide' : 'stack';
    root.tabIndex = 0;
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', 'Recently watched. Swipe, scroll horizontally, or use left and right arrow keys.');
    const live = node('span', 'deck-announcement');
    live.setAttribute('aria-live', 'polite');
    const stage = node('div', 'deck-stage');
    const reflections = node('div', 'deck-reflections');
    reflections.setAttribute('aria-hidden', 'true');
    root.append(reflections, stage, live);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0, cards = [], gesture = null, wheelGesture = null, wheelTimer = 0, animation = null, blockedClick = false;
    let collapseProgress = 0, sideSpread = 0, spreadTween = null, lastCollapseTime = 0;
    let paintedProgress = 0, paintedDrift = 0;
    const modulo = n => (n % items.length + items.length) % items.length;
    const width = () => stage.clientWidth - 64;
    const activeX = () => sliding ? 32 : 24;
    const pose = slot => {
      const w = width();
      if (sliding) {
        const scale = slot === 0 ? 1 : .94;
        // Keep the smaller side cards symmetric, with 28px of clear space.
        return { x: activeX() + slot * (w * .97 + 28) + (1 - scale) * w / 2, y: 0, scale, opacity: 1 };
      }
      if (slot <= -2) return { x: -w - 40, y: 0, scale: 1, opacity: 0 };
      if (slot === -1) return { x: -w, y: 0, scale: 1, opacity: 1 };
      if (slot === 0) return { x: 24, y: 0, scale: 1, opacity: 1 };
      return { x: 24 + slot * 19 + w * slot * .055, y: 0, scale: 1 - slot * .055, opacity: slot > 2 ? 0 : 1 - slot * .16 };
    };
    function paint(progress = 0, drift = 0, notifyProgress = true) {
      paintedProgress = progress;
      paintedDrift = drift;
      for (const card of cards) {
        const a = pose(card.slot), b = pose(card.slot - Math.sign(progress));
        const t = Math.abs(progress), value = {};
        for (const key of Object.keys(a)) value[key] = a[key] + (b[key] - a[key]) * t;
        value.x += drift;
        if (sliding && (collapseProgress || sideSpread)) {
          // The parent hero shrinks around its center on vertical scroll. Counter
          // that inward pull, then send the side cards farther offscreen. The
          // separate spread can finish settling after the hero reaches full size.
          // Deriving the offset from the interpolated pose keeps horizontal swipes smooth.
          const rootScale = 1 - .4 * collapseProgress;
          const offsetFromCenter = value.x + value.scale * width() / 2 - stage.clientWidth / 2;
          value.x += offsetFromCenter * ((1 + .22 * sideSpread) / rootScale - 1);
        }
        // On a reverse swipe, the previous card returns over the departing card.
        card.el.style.zIndex = String(progress < 0 && card.slot === -1 ? 7 : card.slot === 0 ? 6 : card.slot < 0 ? 5 + card.slot : 4 - card.slot);
        gsap.set(card.el, value);
        // An opacity below 1 on the copy wrapper creates a backdrop root and
        // prevents the composer from blurring the artwork until settling.
        // Fade each child instead, keeping the composer's ancestors opaque.
        const focus = card.slot === 0 ? 1 - t : card.slot === Math.sign(progress) ? t : 0;
        const dimForSlot = slot => slot === 0 ? 0 : sliding ? .34 : slot > 0 ? .42 : .22;
        const dimFrom = dimForSlot(card.slot), dimTo = dimForSlot(card.slot - Math.sign(progress));
        gsap.set(card.dim, { opacity: dimFrom + (dimTo - dimFrom) * t });
        card.el.style.setProperty('--deck-shadow-opacity', String(.22 + .26 * focus));
        gsap.set([...card.copy.children, ...(card.watchedTag ? [card.watchedTag] : [])], { opacity: focus });
        // Clear the outgoing reflection early in a leftward slide. Driving it
        // from gesture progress also restores it smoothly if the swipe cancels.
        const reflectionFocus = card.slot === 0 && progress > 0
          ? Math.pow(Math.max(0, 1 - t / .7), 2)
          : focus;
        gsap.set(card.reflection, { x: value.x, y: (value.scale - 1) * 150, scale: value.scale, opacity: reflectionFocus * .28 });
      }
      if (notifyProgress) onProgress({ from: items[index], to: items[modulo(index + Math.sign(progress))], progress: Math.abs(progress) });
    }
    function createCard(slot) {
      const item = items[modulo(index + slot)];
      const copy = node('div', 'watch-card-copy', [SeparatedMeta(item.subtitle, 'watch-subtitle', 'p'), node('h2', 'watch-title', item.title), Composer(viewer, 'Write your thoughts…', () => onCompose(item, el))]);
      const watchedTag = item.watchedLabel ? node('span', 'watch-timing', item.watchedLabel) : null;
      const dim = node('div', 'watch-inactive-shade');
      dim.setAttribute('aria-hidden', 'true');
      const artwork = Artwork(item.artwork, 'watch-artwork');
      const surface = node('div', 'watch-card-surface', [artwork, node('div', 'watch-artwork-blur', ProgressiveBlur('bottom')), node('div', 'watch-shade'), watchedTag, copy, dim]);
      const el = node('article', 'watch-card glass-surface', surface);
      PocketSagaMedia.apply(el, item.artwork);
      el.setAttribute('aria-label', `Write a post about ${item.title}`);
      el.setAttribute('role', 'link');
      el.style.cursor = 'pointer';
      el.addEventListener('keydown', event => {
        if (event.target !== el || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        if (!animation?.isActive()) onCompose(item, el);
      });
      const reflection = node('div', 'watch-reflection', node('div', 'watch-reflection-plane', Artwork(item.artwork, 'watch-reflection-artwork')));
      PocketSagaMedia.apply(reflection, item.artwork);
      reflections.append(reflection);
      stage.append(el);
      return { el, copy, watchedTag, reflection, dim, artwork, slot };
    }
    function syncSelection() {
      for (const card of cards) {
        const active = card.slot === 0;
        card.el.tabIndex = active ? 0 : -1;
        card.el.inert = !active;
        card.el.setAttribute('aria-hidden', String(!active));
        card.el.style.pointerEvents = active ? 'auto' : 'none';
      }
      root.dataset.activeIndex = String(index);
      live.textContent = `${items[index].title}, ${index + 1} of ${items.length}`;
      paint();
    }
    function advance(direction) {
      index = modulo(index + direction);
      // Preserve the visible surfaces and their backdrop layers when settling.
      // Rebuilding them here caused a fresh composite and a sudden edge halo.
      for (const card of cards) card.slot -= direction;
      cards = cards.filter(card => {
        if (card.slot >= -2 && card.slot <= 3) return true;
        card.el.remove();
        card.reflection.remove();
        return false;
      });
      cards.push(createCard(direction > 0 ? 3 : -2));
      syncSelection();
    }
    function settle(direction, from = 0, velocity = 0) {
      animation?.kill();
      const state = { progress: from, drift: 0 };
      const finish = () => {
        if (direction) { advance(direction); onChange(items[index]); }
        else paint();
        animation = null;
      };
      if (reduced.matches) { finish(); return; }
      // Continue the release momentum immediately; spring only the horizontal position.
      const speed = Math.min(2.5, Math.max(0, -velocity * direction));
      const travel = direction ? Math.max(.18, .22 + .16 * Math.abs(direction - from) - speed * .04) : .3;
      const overshoot = direction ? -direction * (4 + speed * 3) : 0;
      animation = gsap.timeline({ onUpdate: () => paint(state.progress, state.drift), onComplete: finish })
        .to(state, { progress: direction, drift: overshoot, duration: travel, ease: 'power3.out' });
      if (direction) animation.to(state, { drift: 0, duration: .26, ease: 'sine.inOut' });
    }
    const local = event => {
      const rect = stage.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * stage.clientWidth / rect.width, y: event.clientY, scale: stage.clientWidth / rect.width };
    };
    root.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.isPrimary === false || animation?.isActive() || event.target.closest('input,textarea')) return;
      clearTimeout(wheelTimer);
      if (wheelGesture) { finishWheel(); return; }
      const point = local(event);
      const now = performance.now();
      gesture = { id: event.pointerId, ...point, startX: event.clientX, time: now, samples: [{ x: event.clientX, time: now }], progress: 0, axis: null };
      blockedClick = false;
    });
    root.addEventListener('pointermove', event => {
      if (!gesture || event.pointerId !== gesture.id) return;
      const dx = event.clientX - gesture.startX, dy = event.clientY - gesture.y;
      if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 7) {
        gesture.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (gesture.axis === 'x') root.setPointerCapture(event.pointerId);
      }
      if (gesture.axis) blockedClick = true;
      if (gesture.axis !== 'x') return;
      if (event.cancelable) event.preventDefault();
      const now = performance.now();
      gesture.samples.push({ x: event.clientX, time: now });
      while (gesture.samples.length > 2 && gesture.samples[0].time < now - 100) gesture.samples.shift();
      gesture.progress = Math.max(-1, Math.min(1, -dx * gesture.scale / (sliding ? width() * .97 + 28 : width() * .8)));
      paint(gesture.progress);
    });
    function release(event) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const drag = gesture; gesture = null;
      if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
      if (drag.axis !== 'x') return;
      const fast = Math.abs(drag.progress) > .08 && performance.now() - drag.time < 240;
      const direction = event.type === 'pointerup' && (Math.abs(drag.progress) > .22 || fast) ? Math.sign(drag.progress) : 0;
      const first = drag.samples[0], last = drag.samples.at(-1);
      const velocity = performance.now() - last.time < 100 ? (last.x - first.x) * drag.scale / Math.max(16, last.time - first.time) : 0;
      settle(direction, drag.progress, velocity);
    }
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);
    root.addEventListener('lostpointercapture', event => {
      // iOS implicitly captures to the touched child. Transferring capture to
      // the deck must not cancel the swipe when that child's loss bubbles up.
      if (event.target === root && !root.hasPointerCapture(event.pointerId)) release(event);
    });
    root.addEventListener('click', event => {
      if (!blockedClick) return;
      blockedClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    root.addEventListener('click', event => {
      if (blockedClick) { blockedClick = false; return; }
      if (event.target.closest('button') || animation?.isActive()) return;
      const x = local(event).x;
      if (x < activeX()) settle(-1);
      else if (x > width() + activeX()) settle(1);
      else {
        const active = cards.find(card => card.slot === 0);
        if (active?.el.contains(event.target)) onCompose(items[index], active.el);
      }
    });
    const finishWheel = () => {
      wheelTimer = 0;
      if (!wheelGesture) return;
      const progress = wheelGesture.progress;
      wheelGesture = null;
      settle(Math.abs(progress) >= .12 ? Math.sign(progress) : 0, progress);
    };
    const onWheel = event => {
      const rawDelta = Math.abs(event.deltaX) > 1 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      const horizontal = rawDelta && (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY));
      if (!horizontal) return;
      event.preventDefault();
      event.stopPropagation();
      if (gesture || animation?.isActive()) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1;
      const travel = sliding ? width() * .97 + 28 : width() * .8;
      if (!wheelGesture) wheelGesture = { progress: 0 };
      wheelGesture.progress = Math.max(-.96, Math.min(.96, wheelGesture.progress + rawDelta * unit / travel));
      paint(wheelGesture.progress);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(finishWheel, 140);
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    root.addEventListener('keydown', event => {
      if (event.target !== root || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      if (!animation?.isActive()) settle(event.key === 'ArrowRight' ? 1 : -1);
    });
    cards = [-2, -1, 0, 1, 2, 3].map(createCard);
    syncSelection();
    const observer = new ResizeObserver(() => { if (!gesture && !animation?.isActive()) paint(); });
    observer.observe(stage);
    return {
      element: root,
      setCollapseProgress(progress) {
        const next = Math.max(0, Math.min(1, progress));
        if (next === collapseProgress) return;
        const previous = collapseProgress;
        const now = performance.now();
        const expandingSpeed = next < previous && lastCollapseTime
          ? (previous - next) / Math.max(16, now - lastCollapseTime)
          : 0;
        lastCollapseTime = now;
        collapseProgress = next;
        spreadTween?.kill();
        spreadTween = null;
        if (sliding && !reduced.matches && next === 0 && previous > 0) {
          // Keep a little outward travel at the fully visible pose. A fast
          // return carries more momentum, then crosses the resting position
          // once before settling; a slow return is almost imperceptible.
          sideSpread = Math.min(.34, Math.max(previous, expandingSpeed * 105));
          const spread = { value: sideSpread };
          spreadTween = gsap.timeline({
            onUpdate: () => { sideSpread = spread.value; paint(paintedProgress, paintedDrift, false); },
            onComplete: () => { sideSpread = 0; spreadTween = null; paint(paintedProgress, paintedDrift, false); }
          }).to(spread, { value: -Math.min(.1, sideSpread * .32), duration: .26, ease: 'power2.out' })
            .to(spread, { value: 0, duration: .32, ease: 'back.out(1.2)' });
        } else {
          sideSpread = next;
        }
        paint(paintedProgress, paintedDrift, false);
      },
      destroy() { animation?.kill(); spreadTween?.kill(); clearTimeout(wheelTimer); root.removeEventListener('wheel', onWheel); observer.disconnect(); }
    };
  }
  window.PocketSagaDeck = { CardDeck };
})();
