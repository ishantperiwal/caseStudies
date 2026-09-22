/* Reusable looping deck: one previous peek, active card, and a replenished right stack. */
(() => {
  const { node, Artwork, Composer, ProgressiveBlur, SeparatedMeta } = PocketSaga;
  function CardDeck(items, viewer, { onChange = () => {}, onCompose = () => {}, onProgress = () => {} } = {}) {
    const root = node('section', 'card-deck');
    root.tabIndex = 0;
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', 'Recently watched. Swipe or use left and right arrow keys.');
    const live = node('span', 'deck-announcement');
    live.setAttribute('aria-live', 'polite');
    const stage = node('div', 'deck-stage');
    const reflections = node('div', 'deck-reflections');
    reflections.setAttribute('aria-hidden', 'true');
    root.append(reflections, stage, live);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0, cards = [], gesture = null, animation = null, blockedClick = false;
    const modulo = n => (n % items.length + items.length) % items.length;
    const width = () => stage.clientWidth - 64;
    const pose = slot => {
      const w = width();
      if (slot <= -2) return { x: -w - 40, y: 0, scale: 1, opacity: 0 };
      if (slot === -1) return { x: -w, y: 0, scale: 1, opacity: 1 };
      if (slot === 0) return { x: 24, y: 0, scale: 1, opacity: 1 };
      return { x: 24 + slot * 19 + w * slot * .055, y: 0, scale: 1 - slot * .055, opacity: slot > 2 ? 0 : 1 - slot * .16 };
    };
    function paint(progress = 0, drift = 0) {
      for (const card of cards) {
        const a = pose(card.slot), b = pose(card.slot - Math.sign(progress));
        const t = Math.abs(progress), value = {};
        for (const key of Object.keys(a)) value[key] = a[key] + (b[key] - a[key]) * t;
        value.x += drift;
        // On a reverse swipe, the previous card returns over the departing card.
        card.el.style.zIndex = String(progress < 0 && card.slot === -1 ? 7 : card.slot === 0 ? 6 : card.slot < 0 ? 5 + card.slot : 4 - card.slot);
        gsap.set(card.el, value);
        // An opacity below 1 on the copy wrapper creates a backdrop root and
        // prevents the composer from blurring the artwork until settling.
        // Fade each child instead, keeping the composer's ancestors opaque.
        const focus = card.slot === 0 ? 1 - t : card.slot === Math.sign(progress) ? t : 0;
        gsap.set(card.dim, { opacity: .22 * (1 - focus) });
        gsap.set([...card.copy.children, ...(card.watchedTag ? [card.watchedTag] : [])], { opacity: focus });
        // Clear the outgoing reflection early in a leftward slide. Driving it
        // from gesture progress also restores it smoothly if the swipe cancels.
        const reflectionFocus = card.slot === 0 && progress > 0
          ? Math.pow(Math.max(0, 1 - t / .7), 2)
          : focus;
        gsap.set(card.reflection, { x: value.x, y: (value.scale - 1) * 150, scale: value.scale, opacity: reflectionFocus * .28 });
      }
      onProgress({ from: items[index], to: items[modulo(index + Math.sign(progress))], progress: Math.abs(progress) });
    }
    function createCard(slot) {
      const item = items[modulo(index + slot)];
      const copy = node('div', 'watch-card-copy', [SeparatedMeta(item.subtitle, 'watch-subtitle', 'p'), node('h2', 'watch-title', item.title), Composer(viewer, 'Write your thoughts…', () => onCompose(item, el))]);
      const watchedTag = item.watchedLabel ? node('span', 'watch-timing', item.watchedLabel) : null;
      const dim = node('div', 'watch-inactive-shade');
      dim.setAttribute('aria-hidden', 'true');
      const surface = node('div', 'watch-card-surface', [Artwork(item.artwork, 'watch-artwork'), node('div', 'watch-artwork-blur', ProgressiveBlur('bottom')), node('div', 'watch-shade'), watchedTag, copy, dim]);
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
      return { el, copy, watchedTag, reflection, dim, slot };
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
      if (event.button !== 0 || event.isPrimary === false || animation?.isActive() || event.target.closest('button,textarea')) return;
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
      const now = performance.now();
      gesture.samples.push({ x: event.clientX, time: now });
      while (gesture.samples.length > 2 && gesture.samples[0].time < now - 100) gesture.samples.shift();
      gesture.progress = Math.max(-1, Math.min(1, -dx * gesture.scale / (width() * .8)));
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
    root.addEventListener('lostpointercapture', release);
    root.addEventListener('click', event => {
      if (blockedClick) { blockedClick = false; return; }
      if (event.target.closest('button') || animation?.isActive()) return;
      const x = local(event).x;
      if (x < 24) settle(-1);
      else if (x > width() + 24) settle(1);
      else {
        const active = cards.find(card => card.slot === 0);
        if (active?.el.contains(event.target)) onCompose(items[index], active.el);
      }
    });
    root.addEventListener('keydown', event => {
      if (event.target !== root || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      if (!animation?.isActive()) settle(event.key === 'ArrowRight' ? 1 : -1);
    });
    cards = [-2, -1, 0, 1, 2, 3].map(createCard);
    syncSelection();
    const observer = new ResizeObserver(() => { if (!gesture && !animation?.isActive()) paint(); });
    observer.observe(stage);
    return { element: root, destroy() { animation?.kill(); observer.disconnect(); } };
  }
  window.PocketSagaDeck = { CardDeck };
})();
