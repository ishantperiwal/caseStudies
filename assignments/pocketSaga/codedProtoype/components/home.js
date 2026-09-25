/* Home tab: featured title, resume points, recently watched and suggestions.
   Watch history is the same list Discover's carousel uses. */
(() => {
  const { node, Action, Artwork, PhoneFrame, SeparatedMeta, Icon } = PocketSaga;
  const kindOf = item => item.mediaType === 'series' ? 'series' : 'movie';
  // handlers.navigationArea: a shared bottom navigation (tab shell); handlers.community: open a community in-app.
  function HomePage(data, handlers = {}) {
    let page;
    const announce = node('div', 'discover-toast');
    announce.setAttribute('role', 'status');
    let toastTimer;
    const toast = text => { announce.textContent = text; announce.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => announce.classList.remove('is-visible'), 2200); };
    const later = label => () => toast(`${label} will be connected later.`);
    const openCommunity = community => handlers.community ? handlers.community(community) : location.href = `discover.html#community:${community.id}`;

    const featured = data.featured;
    const hero = node('section', 'home-hero', [
      Artwork(featured.artwork, 'home-hero-artwork', `${featured.title} artwork`),
      node('div', 'home-hero-shade'),
      node('div', 'home-hero-copy', [
        node('h2', 'home-hero-title', featured.title),
        SeparatedMeta(featured.tags.join(' · '), 'home-hero-tags', 'p'),
        node('div', 'home-hero-actions', [
          Action({ label: `Play ${featured.title}`, icon: 'play', className: 'home-hero-action home-play tap-feedback', children: 'Play', onClick: later('Playback') }),
          Action({ label: `Add ${featured.title} to My List`, icon: 'plus', className: 'home-hero-action home-list glass-surface tap-feedback', children: 'My List', onClick: later('My List') })
        ])
      ])
    ]);
    PocketSagaMedia.apply(hero, featured.artwork);

    const shelf = (heading, className, children) => node('section', `home-shelf ${className}`, [node('h2', 'home-shelf-heading', heading), children]);
    const continueCard = entry => {
      const card = Action({ label: `Continue ${entry.media.title}, ${entry.detail}`, className: 'home-continue-card tap-feedback', children: [
        node('span', 'home-continue-cover', [Artwork(entry.media.artwork, 'home-continue-artwork'), node('span', 'home-continue-play glass-surface', Icon('play'))]),
        node('span', 'home-progress', node('span', 'home-progress-value')),
        node('span', 'home-item-title', entry.media.title),
        SeparatedMeta(entry.detail, 'home-item-meta')
      ], onClick: later('Playback') });
      card.querySelector('.home-progress-value').style.width = `${Math.round(entry.progress * 100)}%`;
      card.dataset.kind = kindOf(entry.media);
      return card;
    };
    const prompts = data.continueWatching.filter(entry => entry.prompt).map(entry => {
      const prompt = Action({ label: `${entry.prompt.label} ${entry.prompt.action}`, className: 'home-community-prompt glass-surface tap-feedback', children: [
        Icon('messages-square'),
        node('span', 'home-prompt-copy', [node('span', 'home-prompt-label', entry.prompt.label), node('span', 'home-prompt-action', entry.prompt.action)]),
        Icon('chevron-down')
      ], onClick: () => openCommunity(entry.prompt.community) });
      prompt.dataset.kind = kindOf(entry.media);
      return prompt;
    });
    const continueShelf = shelf('Continue watching', 'home-continue', [node('div', 'home-continue-grid', data.continueWatching.map(continueCard)), ...prompts]);

    const poster = (item, caption, className) => {
      const card = Action({ label: `${item.title}, ${caption}`, className: `home-poster ${className} tap-feedback`, children: [
        Artwork(item.artwork, 'home-poster-artwork'),
        node('span', 'home-item-title', item.title),
        SeparatedMeta(caption, 'home-item-meta')
      ], onClick: later(item.title) });
      card.dataset.kind = kindOf(item);
      return card;
    };
    const recentShelf = shelf('Recently watched', 'home-recent', node('div', 'home-rail', data.history.map(item => poster(item, item.watchedLabel, 'home-poster-recent'))));
    const suggestionShelf = shelf(data.suggestions.heading, 'home-suggestions', node('div', 'home-suggestion-grid', data.suggestions.items.map(item => poster(item, item.subtitle, 'home-poster-suggestion'))));
    const shelves = [continueShelf, recentShelf, suggestionShelf];

    // All / TV shows / Movies narrow every shelf; a shelf with nothing left hides.
    const filters = [['All', null], ['TV shows', 'series'], ['Movies', 'movie']];
    let active = 'All', selection;
    const track = node('div', 'discover-tabs-track', [
      ...filters.map(([label, kind]) => Action({ label, className: `discover-tab glass-choice tap-feedback${label === active ? ' is-selected' : ''}`, children: node('span', 'discover-tab-label', label), onClick: event => select(label, kind, event.currentTarget) })),
      Action({ label: 'Categories', icon: 'chevron-down', className: 'discover-tab home-categories glass-choice tap-feedback', children: node('span', 'discover-tab-label', 'Categories'), onClick: later('Categories') })
    ]);
    const filterButtons = [...track.children];
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.getAttribute('aria-label') === active)));
    const filterRow = node('div', 'discover-tabs home-filters', track);
    filterRow.setAttribute('aria-label', 'Filter home');
    function select(label, kind, button) {
      active = label;
      filterButtons.forEach(item => { const on = item === button; item.classList.toggle('is-selected', on); if (item.hasAttribute('aria-pressed')) item.setAttribute('aria-pressed', String(on)); });
      selection.move(button);
      for (const section of shelves) {
        const items = [...section.querySelectorAll('[data-kind]')];
        items.forEach(item => { item.hidden = Boolean(kind) && item.dataset.kind !== kind; });
        section.hidden = items.every(item => item.hidden);
      }
    }

    const scroller = node('div', 'feed-scroll home-scroll', [filterRow, hero, ...shelves]);
    scroller.setAttribute('aria-label', 'Home');
    scroller.tabIndex = 0;
    page = PhoneFrame({ device: data.device, background: featured.artwork, content: scroller });
    page.classList.add('home-page');
    const baseTint = node('div', 'discover-base-tint');
    baseTint.setAttribute('aria-hidden', 'true');
    page.querySelector('.phone-screen').prepend(baseTint);
    const header = node('header', 'page-navigation home-navigation', [
      node('h1', '', `For ${data.viewer.name}`),
      node('div', 'home-utilities', [
        Action({ label: 'Cast to screen', icon: 'cast', className: 'round-action', children: '', onClick: later('Casting') }),
        Action({ label: 'Search movies and shows', icon: 'search', className: 'round-action', children: '', onClick: later('Search') })
      ])
    ]);
    const navigation = handlers.navigationArea || PocketSagaDiscover.BottomNavigation((action, detail) => {
      if (detail.destination === 'Community') location.href = 'discover.html';
      else if (!['Home', 'Profile'].includes(detail.destination)) toast(`${detail.destination} will be connected later.`);
    }, data.viewer, 'Home');
    page.querySelector('.phone-screen').append(header, ...(handlers.navigationArea ? [] : [navigation]), announce);
    selection = PocketSagaMotion.selectionHighlight(track, filterButtons.slice(0, filters.length));

    // The featured title's atmosphere fades as the hero leaves, revealing the feed base.
    const atmosphere = page.querySelector('.atmosphere');
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(1, scroller.scrollTop / (hero.offsetTop + hero.offsetHeight || 480));
      atmosphere.style.opacity = String(1 - progress * progress * (3 - 2 * progress));
      baseTint.style.opacity = String(progress * progress);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    scroller.addEventListener('scroll', schedule, { passive: true });
    update();
    const stopAutoHide = PocketSagaMotion.autoHideNavigation({ scroller, navigation });
    return { element: page, toast, destroy() { stopAutoHide(); selection.destroy(); clearTimeout(toastTimer); cancelAnimationFrame(frame); scroller.removeEventListener('scroll', schedule); } };
  }
  window.PocketSagaHome = { HomePage, mount(target, data) { const view = HomePage(data); return PocketSaga.mountPage(target, view.element, () => view.destroy); } };
})();
