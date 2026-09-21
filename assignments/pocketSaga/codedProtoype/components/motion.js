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
  window.PocketSagaMotion = { scrollHeader };
})();
