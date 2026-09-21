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
  function dockTabs({ scroller, anchor, tabs, slot, greeting, utilities }) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let docked = false, frame = 0;
    const update = () => {
      frame = 0;
      if (!scroller.isConnected) return;
      const next = anchor.getBoundingClientRect().top <= slot.getBoundingClientRect().top;
      if (next === docked) return;
      docked = next;
      tabs.classList.toggle('is-docked', docked);
      (docked ? slot : anchor).append(tabs);
      greeting.inert = docked;
      greeting.setAttribute('aria-hidden', String(docked));
      if (utilities) {
        utilities.inert = docked;
        utilities.setAttribute('aria-hidden', String(docked));
        gsap.to(utilities, { autoAlpha: docked ? 0 : 1, duration: reduced.matches ? 0 : .18, overwrite: true });
      }
      gsap.to(greeting, { opacity: docked ? 0 : 1, duration: reduced.matches ? 0 : .18, overwrite: true });
      gsap.fromTo(tabs, { opacity: 0, y: docked ? 4 : 0 }, { opacity: 1, y: 0, duration: reduced.matches ? 0 : .24, ease: 'power2.out', overwrite: true });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    scroller.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    [scroller, anchor, slot].forEach(element => observer.observe(element));
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); scroller.removeEventListener('scroll', schedule); gsap.killTweensOf([tabs, greeting, utilities].filter(Boolean)); };
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
  window.PocketSagaMotion = { scrollHeader, selectionHighlight, dockTabs, autoHideNavigation };
})();
