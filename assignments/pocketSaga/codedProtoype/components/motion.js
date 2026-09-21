/* Shared app-bar transitions. Scroll position always remains user-controlled. */
(() => {
  function scrollHeader({ scroller, navigation, titleTrigger, actionTrigger, title, actionSlot, duration = .18 }) {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const states = new Map();
    let frame = 0;
    const reveal = (element, visible, immediate) => {
      if (states.get(element) === visible) return;
      states.set(element, visible);
      element.inert = !visible;
      element.setAttribute('aria-hidden', String(!visible));
      gsap.to(element, { opacity: visible ? 1 : 0, duration: immediate || reducedMotion.matches ? 0 : duration, ease: 'power1.out', overwrite: true });
    };
    const update = (immediate = false) => {
      frame = 0;
      // Compare rendered geometry so the scaled phone and browser zoom agree.
      const boundary = navigation.getBoundingClientRect().bottom;
      reveal(title, titleTrigger.getBoundingClientRect().bottom <= boundary, immediate);
      const pastPosts = actionTrigger.getBoundingClientRect().bottom <= boundary;
      reveal(actionSlot, pastPosts, immediate);
      actionTrigger.inert = pastPosts;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => update()); };
    scroller.addEventListener('scroll', schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    [scroller, navigation, titleTrigger, actionTrigger, scroller.firstElementChild].forEach(element => resize.observe(element));
    update(true);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      scroller.removeEventListener('scroll', schedule);
      gsap.killTweensOf([title, actionSlot]);
    };
  }
  function selectionHighlight(container, buttons) {
    const marker = document.createElement('span');
    marker.className = 'selection-highlight glass-choice is-selected';
    marker.setAttribute('aria-hidden', 'true');
    container.prepend(marker);
    container.classList.add('animated-selection');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let selected = buttons.find(button => button.classList.contains('is-selected')) || buttons[0];
    const move = (button = selected, immediate = false) => {
      selected = button;
      gsap.to(marker, {
        x: button.offsetLeft, y: button.offsetTop,
        width: button.offsetWidth, height: button.offsetHeight,
        duration: immediate || reduced.matches ? 0 : .46,
        ease: 'power3.inOut', overwrite: true
      });
    };
    const observer = new ResizeObserver(() => move(selected, true));
    observer.observe(container);
    buttons.forEach(button => observer.observe(button));
    move(selected, true);
    return { move, destroy() { observer.disconnect(); gsap.killTweensOf(marker); marker.remove(); } };
  }
  function dockTabs({ scroller, anchor, tabs, slot, greeting, utilities, headerManaged = false }) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let docked = false, frame = 0;
    // At the top, use native scroll composition so the pills share elastic
    // overscroll. Lift the same row above the mask only during collapse.
    const update = () => {
      frame = 0;
      if (!scroller.isConnected || !scroller.clientHeight) return;
      const scale = scroller.getBoundingClientRect().height / scroller.clientHeight || 1;
      const offset = (anchor.getBoundingClientRect().top - slot.getBoundingClientRect().top) / scale - 6;
      const floating = scroller.scrollTop > 0;
      if (floating) {
        if (tabs.parentElement !== slot) { tabs.classList.add('is-floating'); slot.append(tabs); }
        gsap.set(tabs, { y: Math.max(0, offset), width: anchor.clientWidth, opacity: 1 });
      } else if (tabs.parentElement !== anchor) {
        tabs.classList.remove('is-floating'); anchor.append(tabs);
        gsap.set(tabs, { clearProps: 'transform,width,opacity' });
      }
      const next = floating && offset <= 0;
      if (next === docked) return;
      docked = next;
      tabs.classList.toggle('is-docked', docked);
      if (!headerManaged) {
        greeting.inert = docked;
        greeting.setAttribute('aria-hidden', String(docked));
        if (utilities) {
          utilities.inert = docked;
          utilities.setAttribute('aria-hidden', String(docked));
          gsap.to(utilities, { autoAlpha: docked ? 0 : 1, duration: reduced.matches ? 0 : .18, overwrite: true });
        }
        gsap.to(greeting, { opacity: docked ? 0 : 1, duration: reduced.matches ? 0 : .18, overwrite: true });
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    scroller.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    [scroller, anchor, slot].forEach(element => observer.observe(element));
    schedule();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); scroller.removeEventListener('scroll', schedule);
      gsap.killTweensOf([tabs, greeting, utilities].filter(Boolean));
      tabs.classList.remove('is-floating', 'is-docked'); anchor.append(tabs);
      gsap.set(tabs, { clearProps: 'transform,width,opacity' });
    };
  }
  function collapseCarousel({ scroller, carousel, anchor, slot, tabs, headerElements = [] }) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, timer = 0, pressed = false, touching = false, snapping = null, destroyed = false;
    const ease = CustomEase.create('carouselScrollSnap', '0.6,0,0.25,1');
    const distance = () => {
      const scale = scroller.getBoundingClientRect().height / scroller.clientHeight || 1;
      return Math.max(1, scroller.scrollTop + (anchor.getBoundingClientRect().top - slot.getBoundingClientRect().top) / scale + 2);
    };
    const paint = () => {
      frame = 0;
      if (!scroller.isConnected || !scroller.clientHeight) return;
      const travel = distance(), top = Math.max(0, scroller.scrollTop);
      const progress = Math.min(1, top / travel);
      // Counteract natural translation; the hero recedes in place while the
      // feed moves up through its reserved layout space.
      gsap.set(carousel, { y: Math.min(top, travel), scale: reduced.matches ? 1 : 1 - .4 * progress, opacity: Math.pow(1 - progress, 2), transformOrigin: 'center top' });
      carousel.inert = progress >= .85;
      carousel.setAttribute('aria-hidden', String(progress >= .85));
      gsap.set(headerElements, { autoAlpha: Math.pow(1 - progress, 2) });
      for (const element of headerElements) {
        element.inert = progress >= .85;
        element.setAttribute('aria-hidden', String(progress >= .85));
      }
      const feed = scroller.querySelector('.discover-post-list');
      if (feed) {
        const scale = scroller.getBoundingClientRect().height / scroller.clientHeight || 1;
        const feedTop = top + (feed.getBoundingClientRect().top - scroller.getBoundingClientRect().top) / scale;
        const bottomPadding = parseFloat(getComputedStyle(scroller).paddingBottom) || 0;
        // Short feeds stop exactly when the hero finishes collapsing. Natural
        // content height still allows longer feeds to scroll beyond that point.
        scroller.style.setProperty('--discover-feed-min-height', `${Math.max(0, Math.round(scroller.clientHeight + travel - feedTop - bottomPadding))}px`);
      }
    };
    const scrollTo = target => {
      snapping?.kill();
      snapping = null;
      clearTimeout(timer);
      paint();
      if (reduced.matches) { scroller.scrollTop = target; paint(); return; }
      snapping = gsap.to(scroller, { scrollTop: target, duration: .4, ease, onUpdate: paint, onComplete: () => { snapping = null; paint(); } });
    };
    const openFeed = event => {
      if (event.target.closest('.discover-tab')) scrollTo(distance());
    };
    tabs?.addEventListener('click', openFeed);
    const settle = () => {
      clearTimeout(timer);
      if (destroyed || pressed || snapping || !scroller.isConnected || !scroller.clientHeight || scroller.closest('[inert]')) return;
      const end = distance(), top = scroller.scrollTop;
      if (top <= 1 || top >= end - 1) return;
      const target = top / end >= .35 ? end : 0;
      scrollTo(target);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
      clearTimeout(timer);
      if (!pressed && !snapping) timer = setTimeout(settle, 160);
    };
    const interrupt = () => { snapping?.kill(); snapping = null; clearTimeout(timer); };
    // Trackpad momentum can send a final wheel event without producing a
    // scroll event. Re-arm settling here too, or that event cancels the snap
    // and leaves the intro stranded halfway through its collapse.
    const input = () => { interrupt(); schedule(); };
    const down = () => { pressed = true; interrupt(); };
    const up = () => { if (!pressed || touching) return; pressed = false; clearTimeout(timer); timer = setTimeout(settle, 160); };
    const touchStart = () => { touching = true; down(); };
    const touchEnd = event => { if (!event.touches.length) { touching = false; up(); } };
    scroller.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchend', touchEnd, { passive: true });
    window.addEventListener('touchcancel', touchEnd, { passive: true });
    scroller.addEventListener('scroll', schedule, { passive: true });
    scroller.addEventListener('scrollend', schedule, { passive: true });
    scroller.addEventListener('pointerdown', down, { passive: true });
    scroller.addEventListener('wheel', input, { passive: true });
    scroller.addEventListener('keydown', input);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    const observer = new ResizeObserver(() => { if (!frame) frame = requestAnimationFrame(paint); });
    observer.observe(scroller);
    frame = requestAnimationFrame(paint);
    return () => {
      scroller.removeEventListener('touchstart', touchStart); window.removeEventListener('touchend', touchEnd); window.removeEventListener('touchcancel', touchEnd);
      destroyed = true; interrupt(); cancelAnimationFrame(frame); observer.disconnect();
      tabs?.removeEventListener('click', openFeed);
      scroller.removeEventListener('scroll', schedule); scroller.removeEventListener('pointerdown', down);
      scroller.removeEventListener('scrollend', schedule);
      scroller.removeEventListener('wheel', input); scroller.removeEventListener('keydown', input);
      window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      gsap.set(carousel, { clearProps: 'transform,opacity' }); carousel.inert = false; carousel.removeAttribute('aria-hidden');
      gsap.set(headerElements, { clearProps: 'opacity,visibility' });
      for (const element of headerElements) { element.inert = false; element.removeAttribute('aria-hidden'); }
      scroller.style.removeProperty('--discover-feed-min-height');
    };
  }
  function autoHideNavigation({ scroller, navigation }) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let previous = 0, direction = 0, travel = 0, hidden = false, frame = 0;
    const setHidden = next => {
      if (hidden === next) return;
      hidden = next;
      navigation.inert = hidden;
      navigation.setAttribute('aria-hidden', String(hidden));
      gsap.to(navigation, { yPercent: hidden ? 100 : 0, autoAlpha: hidden ? 0 : 1, duration: reduced.matches ? 0 : .3, ease: 'power2.out', overwrite: true });
    };
    const update = () => {
      frame = 0;
      const top = Math.max(0, Math.min(scroller.scrollTop, Math.max(0, scroller.scrollHeight - scroller.clientHeight)));
      const delta = top - previous;
      previous = top;
      if (top <= 20) { travel = 0; direction = 0; setHidden(false); return; }
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      travel = nextDirection === direction ? travel + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      if (direction > 0 && travel >= 20) setHidden(true);
      else if (direction < 0 && travel >= 8) setHidden(false);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    scroller.addEventListener('scroll', schedule, { passive: true });
    return () => { cancelAnimationFrame(frame); scroller.removeEventListener('scroll', schedule); gsap.killTweensOf(navigation); };
  }
  window.PocketSagaMotion = { scrollHeader, selectionHighlight, dockTabs, collapseCarousel, autoHideNavigation };
})();
