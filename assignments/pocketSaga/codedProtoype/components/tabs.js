/* Main tab shell: Home and Community (Discover) live in one phone with a single
   bottom navigation, so switching tabs animates in place instead of loading a page.
   Tab order sets direction: moving to a tab on the right slides both screens left. */
(() => {
  const { node } = PocketSaga;
  const order = ['Home', 'Community'];
  const files = { Home: 'home.html', Community: 'discover.html' };
  const titles = { Home: 'PocketSaga · Home preview', Community: 'PocketSaga · Discover preview' };
  function mount(target, initial = 'Community') {
    let active = initial, animation = null, navSelection = null;
    const panels = {};
    const entryBlur = {};
    const views = {};
    const select = destination => {
      if (destination === 'Profile') return;
      if (!order.includes(destination)) { views[active].toast(`${destination} will be connected later.`); return; }
      if (destination === active) return;
      const direction = Math.sign(order.indexOf(destination) - order.indexOf(active));
      const outgoing = panels[active], incoming = panels[destination];
      const blur = entryBlur[destination];
      active = destination;
      buttons.forEach(button => {
        const on = button.dataset.destination === destination;
        button.classList.toggle('is-selected', on);
        if (on) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      });
      navSelection?.move(buttons.find(button => button.dataset.destination === destination));
      history.replaceState(history.state, '', files[destination]);
      document.title = titles[destination];
      animation?.progress(1).kill();
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Blur a transparent layer over the destination, never its parent. This
      // lets its glass surfaces stay composed while the incoming image sharpens.
      if (!reducedMotion) gsap.set(blur, { autoAlpha: 1 });
      incoming.hidden = false;
      incoming.inert = false;
      outgoing.inert = true;
      // Keep the destination fully composed beneath the departing panel. Parent
      // opacity/filter would isolate all of its backdrop-filter descendants and
      // make their glass activate together when those properties are cleared.
      outgoing.style.zIndex = '2';
      incoming.style.zIndex = '1';
      const settle = () => {
        outgoing.hidden = true;
        outgoing.style.removeProperty('z-index');
        incoming.style.removeProperty('z-index');
        gsap.set(outgoing, { clearProps: 'transform,opacity,filter' });
        gsap.set(incoming, { x: 0 });
        gsap.set(blur, { clearProps: 'opacity,visibility' });
      };
      if (reducedMotion) { settle(); return; }
      animation = gsap.timeline({ onComplete: settle })
        .fromTo(outgoing, { x: 0, opacity: 1, filter: 'blur(0px)' }, { x: -40 * direction, opacity: 0, filter: 'blur(6px)', duration: .26, ease: 'power2.in' }, 0)
        .fromTo(incoming, { x: 56 * direction }, { x: 0, duration: .42, ease: 'power3.out' }, .06)
        .to(blur, { autoAlpha: 0, duration: .42, ease: 'power1.inOut' }, .06);
    };

    const discover = PocketSagaDiscover.DiscoverPage(discoverPageData, { navigate: ({ destination }) => select(destination) });
    const page = discover.element;
    const screen = page.querySelector('.phone-screen');
    const navigationArea = screen.querySelector('.bottom-navigation-area');
    // Discover's content becomes the Community panel; the status bar and navigation stay shared.
    panels.Community = node('div', 'tab-panel discover-page', [...screen.children].filter(child => !child.matches('.status-bar, .bottom-navigation-area')));
    page.classList.remove('discover-page');
    views.Community = discover;

    const home = PocketSagaHome.HomePage(homePageData, { navigationArea, community: group => panels.Home.dispatchEvent(new CustomEvent('discover-action', { bubbles: true, detail: { action: 'community', group } })) });
    const homeScreen = home.element.querySelector('.phone-screen');
    homeScreen.querySelector('.home-indicator')?.remove();
    panels.Home = node('div', 'tab-panel home-page', [...homeScreen.children].filter(child => !child.matches('.status-bar')));
    views.Home = home;

    for (const name of order) {
      entryBlur[name] = node('div', 'tab-entry-blur');
      entryBlur[name].setAttribute('aria-hidden', 'true');
      panels[name].append(entryBlur[name]);
    }

    screen.prepend(panels.Home, panels.Community);
    for (const name of order) { panels[name].hidden = name !== active; panels[name].inert = name !== active; }

    const nav = navigationArea.querySelector('.bottom-navigation');
    const buttons = [...nav.querySelectorAll('.bottom-destination')];
    buttons.forEach(button => {
      const on = button.dataset.destination === active;
      button.classList.toggle('is-selected', on);
      if (on) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    document.title = titles[active];

    PocketSaga.mountPage(target, page, () => {
      navSelection = PocketSagaMotion.selectionHighlight(nav, buttons);
      return () => { navSelection.destroy(); animation?.kill(); discover.destroy(); home.destroy(); };
    });
    PocketSagaNavigation.attach(page, postPageData);
    return page;
  }
  window.PocketSagaTabs = { mount };
})();
