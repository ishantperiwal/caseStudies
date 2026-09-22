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
  function dockTabs({ scroller, anchor, tabs, fixedTabs, slot, greeting, utilities, headerManaged = false }) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let docked = false, frame = 0;
    // Both rows remain in place; switch visibility at their shared position.
    const setVisible = (row, visible) => {
      row.style.visibility = visible ? 'visible' : 'hidden';
      row.inert = !visible;
      row.setAttribute('aria-hidden', String(!visible));
    };
    setVisible(tabs, true);
    setVisible(fixedTabs, false);
    const update = () => {
      frame = 0;
      if (!scroller.isConnected || !scroller.clientHeight) return;
      const scale = scroller.getBoundingClientRect().height / scroller.clientHeight || 1;
      const offset = (anchor.getBoundingClientRect().top - slot.getBoundingClientRect().top) / scale - 6;
      const next = scroller.scrollTop > 0 && offset <= .5;
      if (next === docked) return;
      const from = next ? tabs : fixedTabs, to = next ? fixedTabs : tabs;
      const focusedIndex = [...from.querySelectorAll('.discover-tab')].indexOf(document.activeElement);
      to.scrollLeft = from.scrollLeft;
      docked = next;
      setVisible(tabs, !docked);
      setVisible(fixedTabs, docked);
      fixedTabs.classList.toggle('is-docked', docked);
      scroller.classList.toggle('has-docked-tabs', docked);
      if (focusedIndex >= 0) to.querySelectorAll('.discover-tab')[focusedIndex].focus({ preventScroll: true });
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
      fixedTabs.classList.remove('is-docked');
      scroller.classList.remove('has-docked-tabs');
      setVisible(tabs, true); setVisible(fixedTabs, false);
    };
  }
  function collapseCarousel({ scroller, carousel, anchor, slot, tabs, headerElements = [] }) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, timer = 0, pressed = false, touching = false, snapping = null, destroyed = false;
    const ease = CustomEase.create('carouselScrollSnap', '0.6,0,0.25,1');
    const distance = () => {
      const scale = scroller.getBoundingClientRect().height / scroller.clientHeight || 1;
      return Math.max(1, scroller.scrollTop + (anchor.getBoundingClientRect().top - slot.getBoundingClientRect().top) / scale - 6);
    };
    const paint = () => {
      frame = 0;
      if (!scroller.isConnected || !scroller.clientHeight) return;
      const travel = distance(), top = Math.max(0, scroller.scrollTop);
      const progress = Math.min(1, top / travel);
      // CSS sticky pins the top edge natively; only scale, blur, and fade respond to
      // scroll, so a delayed scroll event cannot briefly pull the hero upward.
      gsap.set(carousel, { scale: reduced.matches ? 1 : 1 - .4 * progress, opacity: Math.pow(1 - progress, 2), filter: reduced.matches || progress === 0 ? 'none' : `blur(${8 * progress}px)`, transformOrigin: 'center top' });
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
    const filterRows = [tabs].flat().filter(Boolean);
    filterRows.forEach(row => row.addEventListener('click', openFeed));
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
      filterRows.forEach(row => row.removeEventListener('click', openFeed));
      scroller.removeEventListener('scroll', schedule); scroller.removeEventListener('pointerdown', down);
      scroller.removeEventListener('scrollend', schedule);
      scroller.removeEventListener('wheel', input); scroller.removeEventListener('keydown', input);
      window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      gsap.set(carousel, { clearProps: 'transform,opacity,filter' }); carousel.inert = false; carousel.removeAttribute('aria-hidden');
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
      // An opacity below 1 on this ancestor isolates the glass from the feed.
      // Keep it opaque throughout the slide so backdrop blur remains active.
      gsap.set(navigation, { opacity: 1, visibility: 'visible' });
      gsap.to(navigation, { yPercent: hidden ? 100 : 0, duration: reduced.matches ? 0 : .3, ease: 'power2.out', overwrite: true,
        onComplete: () => { if (hidden) navigation.style.visibility = 'hidden'; }
      });
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
  const likeAnimations = new WeakMap();
  function animateLike(button, liked) {
    likeAnimations.get(button)?.();
    const icon = button.querySelector('.icon-heart');
    if (!icon || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let particles;
    const timeline = gsap.timeline({ onComplete: () => {
      particles?.remove();
      gsap.set(icon, { clearProps: 'transform,transformOrigin' });
      likeAnimations.delete(button);
    } });
    likeAnimations.set(button, () => {
      timeline.kill(); particles?.remove();
      gsap.set(icon, { clearProps: 'transform,transformOrigin' });
      likeAnimations.delete(button);
    });
    gsap.set(icon, { transformOrigin: '50% 50%' });
    timeline.to(icon, { scale: .72, duration: .09, ease: 'power2.out' })
      .to(icon, { scale: 1, duration: liked ? .6 : .18, ease: liked ? 'elastic.out(1.4, 0.38)' : 'power2.out' });
    if (!liked) return;
    particles = document.createElement('span');
    particles.className = 'like-particles';
    particles.setAttribute('aria-hidden', 'true');
    const rect = icon.getBoundingClientRect(), bounds = button.getBoundingClientRect();
    const scale = bounds.width / button.offsetWidth || 1;
    particles.style.left = `${(rect.left + rect.width / 2 - bounds.left) / scale}px`;
    particles.style.top = `${(rect.top + rect.height / 2 - bounds.top) / scale}px`;
    button.append(particles);
    [-10, -3, 4, 11].forEach((offset, index) => {
      const x = offset + (Math.random() - .5) * 5;
      const rise = 60 + Math.random() * 18;
      const heart = icon.cloneNode(true);
      heart.removeAttribute('style');
      heart.classList.add('like-particle');
      particles.append(heart);
      gsap.set(heart, { x: -6, y: -6, scale: .4, opacity: 0, rotation: x * .5 });
      timeline.to(heart, { opacity: .8, scale: index % 2 ? .8 : 1, duration: .12 }, .1 + index * .035)
        .to(heart, { x, y: -rise, rotation: x, duration: .78, ease: 'power2.out' }, .1 + index * .035)
        .to(heart, { opacity: 0, scale: .35, duration: .32 }, .54 + index * .035);
    });
  }
  const saveAnimations = new WeakMap();
  function animateSave(button, saved) {
    saveAnimations.get(button)?.();
    const icon = button.querySelector('.icon-bookmark');
    if (!icon || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let bubble;
    const timeline = gsap.timeline({ onComplete: () => {
      bubble?.remove();
      gsap.set(icon, { clearProps: 'transform,transformOrigin' });
      saveAnimations.delete(button);
    } });
    saveAnimations.set(button, () => {
      timeline.kill(); bubble?.remove();
      gsap.set(icon, { clearProps: 'transform,transformOrigin' });
      saveAnimations.delete(button);
    });
    gsap.set(icon, { transformOrigin: '50% 50%' });
    timeline.to(icon, { scale: .72, duration: .09, ease: 'power2.out' })
      .to(icon, { scale: 1, duration: saved ? .6 : .18, ease: saved ? 'elastic.out(1.4, 0.38)' : 'power2.out' });
    if (!saved) return;
    bubble = document.createElement('span');
    bubble.className = 'save-feedback';
    bubble.textContent = 'Saved';
    bubble.setAttribute('aria-hidden', 'true');
    button.append(bubble);
    gsap.set(bubble, { y: 8, scale: .8, opacity: 0, rotation: -4, transformOrigin: 'bottom right' });
    timeline.to(bubble, { y: -44, duration: 1.03, ease: 'none' }, .1)
      .to(bubble, { opacity: 1, scale: 1, rotation: 0, duration: .28, ease: 'back.out(1.5)' }, .1)
      .to(bubble, { opacity: 0, scale: .94, duration: .35, ease: 'power1.in' }, .78);
  }
  window.PocketSagaMotion = { scrollHeader, selectionHighlight, dockTabs, collapseCarousel, autoHideNavigation, animateLike, animateSave };
})();
