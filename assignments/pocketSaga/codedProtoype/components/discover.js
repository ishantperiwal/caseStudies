(() => {
  const { node, Action, Artwork, AmbientArtwork, PhoneFrame, PostCard, SaveButton, Avatar, Icon, SeparatedMeta } = PocketSaga;
  function GroupRow(group, onJoin, recommended = false, onOpen = () => {}) {
    const button = Action({ label: group.joined ? `Joined ${group.name}` : `Join ${group.name}`, icon: group.joined ? 'check' : 'users', className: 'group-join tap-feedback', children: group.joined ? 'Joined' : recommended ? 'Join' : group.members, onClick: () => {
      group.joined = !group.joined;
      button.replaceChildren(Icon(group.joined ? 'check' : 'users'), group.joined ? 'Joined' : 'Join');
      button.setAttribute('aria-label', group.joined ? `Joined ${group.name}` : `Join ${group.name}`);
      button.setAttribute('aria-pressed', String(group.joined));
      onJoin(group);
    } });
    button.setAttribute('aria-pressed', String(group.joined));
    const count = Math.max(0, group.activeMemberCount || 0);
    const activity = node('span', 'group-activity', [Icon('users'), `${count.toLocaleString()} online`, Icon('chevron-down')]);
    activity.setAttribute('aria-label', `${count.toLocaleString()} ${count === 1 ? 'member' : 'members'} online now`);
    const row = node('div', 'discover-group-row glass-surface', [Artwork(group.artwork, 'discover-group-artwork', `${group.name} artwork`), node('div', 'discover-group-copy', [node('span', 'group-name', group.name), node('span', 'group-eyebrow', `${group.members} members`)]), group.joined && !recommended ? activity : button]);
    row.tabIndex = 0;
    row.setAttribute('role', 'link');
    row.setAttribute('aria-label', `Open ${group.name}`);
    row.dataset.groupId = group.id;
    let pressStart = null;
    const releasePress = () => { pressStart = null; row.classList.remove('is-pressed'); };
    row.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button')) return;
      event.stopPropagation();
      pressStart = { x: event.clientX, y: event.clientY };
      row.classList.add('is-pressed');
    });
    row.addEventListener('pointermove', event => {
      if (pressStart && Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > 8) releasePress();
    });
    for (const event of ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture', 'blur']) row.addEventListener(event, releasePress);

    row.addEventListener('click', event => {
      if (event.target.closest('button')) return;
      event.stopPropagation();
      row.focus({ preventScroll: true });
      onOpen(group);
    });
    row.addEventListener('keydown', event => {
      if (event.target !== row || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation(); onOpen(group);
    });
    return row;
  }
  function BottomNavigation(emit, viewer, selected = 'Community') {
    const nav = node('nav', 'bottom-navigation glass-surface', [['Home','house','Home'],['Community','messages-square','Community'],['Profile','user-round','Profile']].map(([label, icon, destination]) => {
      const button = Action({ label, className: `bottom-destination glass-choice${destination === selected ? ' is-selected' : ''}`, children: [label === 'Profile' ? Avatar(viewer) : Icon(icon), node('span', '', label)], onClick: () => emit('navigate', { destination }) });
      button.dataset.destination = destination;
      if (destination === selected) button.setAttribute('aria-current', 'page');
      return button;
    }));
    nav.setAttribute('aria-label', 'Main navigation');
    return node('div', 'bottom-navigation-area', nav);
  }
  function DiscoverPage(data, handlers = {}) {
    let page, deck, feedTransition, activeTab = 'For you';
    // Keep the current Saved list stable while its save buttons toggle; refresh on the next visit.
    let savedTabPosts = null;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const localPosts = [];
    const ownPosts = (data.yourPosts || []);
    const emit = (action, detail = {}) => {
      handlers[action]?.(detail);
      page.dispatchEvent(new CustomEvent('discover-action', { bubbles: true, detail: { action, ...detail } }));
    };
    const announce = node('div', 'discover-toast');
    announce.setAttribute('role', 'status');
    let toastTimer;
    const toast = text => { announce.textContent = text; announce.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => announce.classList.remove('is-visible'), 2200); };
    const list = node('section', 'discover-post-list post-list');
    list.id = 'discover-feed';
    const renderPost = post => {
      const group = data.groups.find(group => group.id === post.group);
      const card = PostCard(post, post.context, (action, detail) => {
        if (action === 'like') {
          post.liked = !post.liked;
          const button = card.querySelector('.like-action');
          button.replaceChildren(Icon('heart'), String(post.likes + (post.liked ? 1 : 0)));
          button.setAttribute('aria-pressed', String(post.liked));
          PocketSagaMotion.animateLike(button, post.liked);
          button.setAttribute('aria-label', `${post.likes + (post.liked ? 1 : 0)} likes`);
        } else if (!['open-post', 'comments'].includes(action)) toast('This action will be connected later.');
        emit(action, detail);
      });
      card.classList.add('discover-post');
      const artwork = post.artwork || group?.artwork;
      if (artwork) {
        PocketSagaMedia.apply(card, artwork);
        const ambience = node('div', 'discover-post-atmosphere', [AmbientArtwork(artwork, 'discover-post-artwork'), node('div', 'discover-post-veil')]);
        ambience.setAttribute('aria-hidden', 'true');
        card.prepend(ambience);
      }
      card.querySelector('.post-copy').after(card.querySelector('.author-meta'));
      if (group && !group.joined) card.prepend(GroupRow(group, group => {
        emit('membership', { group });
        // Membership applies to every visible post from this community.
        for (const row of list.querySelectorAll('.discover-group-row')) {
          if (row.dataset.groupId !== group.id) continue;
          if (reducedMotion.matches) row.remove();
          else {
            gsap.set(row, { height: row.offsetHeight, overflow: 'hidden' });
            gsap.to(row, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, marginBottom: -12, duration: .3, ease: 'power2.inOut', onComplete: () => row.remove() });
          }
        }
      }, true, group => emit('community', { group })));
      const context = SeparatedMeta([
        group ? Action({ label: `Open ${group.name}`, icon: 'users', className: 'discover-community-link', children: node('span', 'discover-community-label', group.name), onClick: () => emit('community', { group }) }) : node('span', '', 'Your thoughts'),
        group ? group.context : post.context
      ], 'discover-post-context', 'div');
      card.querySelector('.post-copy').prepend(context);
      return card;
    };
    function renderFeed() {
      if (activeTab === 'Your groups') {
        const groupCard = (group, recommended = false) => node('article', 'discover-group-card glass-surface', GroupRow(group, updated => {
          emit('membership', { group: updated });
          renderFeed();
        }, recommended, group => emit('community', { group })));
        const joined = data.groups.filter(group => group.joined);
        const recommended = data.groups.filter(group => !group.joined);
        list.replaceChildren(
          ...joined.map(group => groupCard(group)),
          ...(recommended.length ? [node('section', 'recommended-groups', [
            node('h2', 'recommended-groups-title', 'Recommended groups'),
            ...recommended.map(group => groupCard(group, true))
          ])] : [])
        );
      }
      else {
        if (activeTab === 'Saved' && savedTabPosts === null) savedTabPosts = PocketSagaData.savedPosts();
        const posts = activeTab === 'Saved' ? savedTabPosts : activeTab === 'Your posts' ? [...localPosts, ...ownPosts] : [...localPosts, ...data.posts];
        list.replaceChildren(...(posts.length ? posts.map(renderPost) : [node('p', 'empty-feed', activeTab === 'Saved' ? 'Save posts to revisit them here.' : 'Your thoughts belong here. Write about something you’ve watched.')]));
        if (activeTab === 'For you') window.PocketSagaTranslationDemo?.insertDiscover(list, data, renderPost);
      }
    }
    function compose(item = null, source = null) {
      emit('create-post', { media: item, source });
    }
    const onPublished = event => {
      localPosts.unshift(event.detail.post);
      renderFeed();
      toast('Posted to this preview');
    };
    const artworkLayers = new Map();
    deck = PocketSagaDeck.CardDeck(data.history, data.viewer, { variant: new URLSearchParams(location.search).get('carousel') === 'a' ? 'stack' : 'slide', onCompose: compose, onProgress: ({ from, to, progress }) => {
      for (const [id, image] of artworkLayers) {
        const weight = from.id === to.id ? Number(id === from.id) : id === from.id ? 1 - progress : id === to.id ? progress : 0;
        image.style.opacity = String(.58 * weight);
      }
      const fromLift = PocketSagaMedia.get(from.artwork).pageLift;
      const toLift = PocketSagaMedia.get(to.artwork).pageLift;
      page?.querySelector('.atmosphere')?.style.setProperty('--atmosphere-light-overlay', String(fromLift + (toLift - fromLift) * progress));
      const fromVeil = PocketSagaMedia.get(from.artwork).pageVeil;
      const toVeil = PocketSagaMedia.get(to.artwork).pageVeil;
      page?.querySelector('.atmosphere')?.style.setProperty('--atmosphere-veil-opacity', String(fromVeil + (toVeil - fromVeil) * progress));
    } });
    const filterRows = [];
    function selectFilter(label) {
      if (activeTab === label) return;
      const tabOrder = ['For you', 'Your posts', 'Your groups', 'Saved'];
      const direction = Math.sign(tabOrder.indexOf(label) - tabOrder.indexOf(activeTab));
      if (activeTab === 'Saved') savedTabPosts = null;
      activeTab = label;
      for (const { row, buttons, selection } of filterRows) {
        buttons.forEach(button => {
          const selected = button.getAttribute('aria-label') === activeTab;
          button.classList.toggle('is-selected', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
        const selectedButton = buttons.find(button => button.getAttribute('aria-label') === activeTab);
        selection.move(selectedButton);
        const target = Math.max(0, selectedButton.offsetLeft - (row.clientWidth - selectedButton.offsetWidth) / 2);
        row.scrollTo({ left: target, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }
      const swapFeed = () => {
        if (scroller.classList.contains('has-docked-tabs')) {
          const scale = scroller.getBoundingClientRect().height / scroller.clientHeight || 1;
          const target = scroller.scrollTop + (tabAnchor.getBoundingClientRect().top - headingSlot.getBoundingClientRect().top) / scale - 6;
          scroller.scrollTo({ top: Math.max(0, target), behavior: 'instant' });
        }
        renderFeed();
      };
      feedTransition?.kill();
      if (reducedMotion.matches) { swapFeed(); gsap.set(list, { x: 0, opacity: 1, filter: 'blur(0px)' }); list.inert = false; return; }
      list.inert = true;
      feedTransition = gsap.timeline({ onComplete: () => { list.inert = false; } })
        .to(list, { x: -20 * direction, opacity: 0, filter: 'blur(4px)', duration: .18, ease: 'power2.in' })
        .call(swapFeed)
        .set(list, { x: 24 * direction })
        .to(list, { x: 0, opacity: 1, filter: 'blur(0px)', duration: .34, ease: 'power2.out' });
    }
    function createFilters(fixed = false) {
      const track = node('div', 'discover-tabs-track', ['For you', 'Your posts', 'Your groups', 'Saved'].map(label => Action({
        label, icon: { 'For you': 'sparkles', 'Your posts': 'square-pen', 'Your groups': 'users', 'Saved': 'bookmark' }[label], className: `discover-tab glass-choice tap-feedback${label === activeTab ? ' is-selected' : ''}`,
        children: node('span', 'discover-tab-label', label),
        onClick: () => selectFilter(label)
      })));
      const row = node('div', `discover-tabs${fixed ? ' discover-tabs-fixed' : ''}`, track);
      row.setAttribute('aria-label', 'Group feed tabs');
      const buttons = [...track.children];
      buttons.forEach(button => {
        button.setAttribute('aria-pressed', String(button.getAttribute('aria-label') === activeTab));
        button.setAttribute('aria-controls', list.id);
      });
      if (fixed) { row.inert = true; row.setAttribute('aria-hidden', 'true'); }
      filterRows.push({ row, buttons, selection: PocketSagaMotion.selectionHighlight(track, buttons) });
      return row;
    }
    const tabs = createFilters();
    const fixedTabs = createFilters(true);
    const tabAnchor = node('div', 'discover-tabs-anchor', tabs);
    const scroller = node('div','feed-scroll discover-scroll',[deck.element,tabAnchor,list]);
    scroller.setAttribute('aria-label','Group discovery feed'); scroller.tabIndex = 0;
    page = PhoneFrame({ device: data.device, background: data.history[0].artwork, content: scroller });
    page.classList.add('discover-page');
    page.addEventListener('draft-published', onPublished);
    const baseTint = node('div', 'discover-base-tint');
    baseTint.setAttribute('aria-hidden', 'true');
    page.querySelector('.phone-screen').prepend(baseTint);
    const atmosphere = page.querySelector('.atmosphere');
    PocketSagaMedia.apply(atmosphere, data.history[0].artwork);
    data.history.forEach((item, index) => {
      const image = index === 0 ? atmosphere.querySelector('.atmosphere-image') : AmbientArtwork(item.artwork, 'atmosphere-image');
      image.style.opacity = index === 0 ? '.58' : '0';
      if (index) atmosphere.insertBefore(image, atmosphere.querySelector('.atmosphere-veil'));
      artworkLayers.set(item.id, image);
    });
    let atmosphereFrame = 0;
    const updateAtmosphere = () => {
      atmosphereFrame = 0;
      const distance = Math.max(0, scroller.scrollTop / (deck.element.offsetHeight || 324));
      const progress = Math.min(1, distance);
      // Fade the whole ambience layer so carousel image crossfades stay independent.
      atmosphere.style.opacity = String(1 - progress * progress * (3 - 2 * progress));
      const baseProgress = Math.min(1, Math.max(0, (distance - 1) / .5));
      baseTint.style.opacity = String(baseProgress * baseProgress * (3 - 2 * baseProgress));
    };
    const scheduleAtmosphere = () => {
      if (!atmosphereFrame) atmosphereFrame = requestAnimationFrame(updateAtmosphere);
    };
    scroller.addEventListener('scroll', scheduleAtmosphere, { passive: true });
    updateAtmosphere();
    const greeting = node('h1', 'discover-greeting', `Hi, ${data.viewer.name}`);
    const headingSlot = node('div', 'discover-heading-slot', [greeting, fixedTabs]);
    const notificationCount = PocketSagaNotifications.unreadCount();
    const badge = node('span', 'notification-count', notificationCount ? String(notificationCount) : '');
    badge.hidden = notificationCount === 0;
    const header = node('header','page-navigation discover-navigation',[headingSlot,node('div','discover-utilities',[Action({label:notificationCount ? `Notifications, ${notificationCount} unread` : 'Notifications',icon:'bell',className:'round-action',children:badge,onClick:()=>emit('notifications')}),Action({label:'Create a post',icon:'square-pen',className:'round-action discover-write',children:'',onClick:()=>compose()})])]);
    page.querySelector('.phone-screen').append(header, BottomNavigation((action,detail)=>{ emit(action,detail); if(handlers.navigate)return; if(detail.destination==='Home')location.href='home.html'; else if(!['Community', 'Profile'].includes(detail.destination))toast(`${detail.destination} will be connected later.`); }, data.viewer), announce);
    const undockTabs = PocketSagaMotion.dockTabs({ scroller, anchor: tabAnchor, tabs, fixedTabs, slot: headingSlot, greeting, utilities: header.querySelector('.discover-utilities'), headerManaged: true });
    const stopCarouselCollapse = PocketSagaMotion.collapseCarousel({ scroller, carousel: deck.element, anchor: tabAnchor, slot: headingSlot, tabs: [tabs, fixedTabs], headerElements: [greeting, header.querySelector('.discover-utilities')], onCollapse: progress => deck.setCollapseProgress(progress) });
    const stopAutoHide = PocketSagaMotion.autoHideNavigation({ scroller, navigation: page.querySelector('.bottom-navigation-area') });
    renderFeed();
    return { element: page, toast, destroy() { page.removeEventListener('draft-published', onPublished); stopAutoHide(); stopCarouselCollapse(); undockTabs(); deck.destroy(); filterRows.forEach(({ selection }) => selection.destroy()); feedTransition?.kill(); clearTimeout(toastTimer); cancelAnimationFrame(atmosphereFrame); scroller.removeEventListener('scroll', scheduleAtmosphere); gsap.killTweensOf(page.querySelectorAll('.atmosphere-image')); } };
  }
  window.PocketSagaDiscover = { GroupRow, BottomNavigation, DiscoverPage, mount(target,data,handlers) { const view = DiscoverPage(data,handlers); return PocketSaga.mountPage(target,view.element,()=>view.destroy); } };
})();
