/* In-phone route stack shared by standalone discovery, community and post previews. */
(() => {
  function attach(page, postData, communityData = window.communityPageData) {
    const { node } = PocketSaga;
    const screen = page.querySelector('.phone-screen');
    const status = screen.querySelector('.status-bar');
    const indicator = screen.querySelector('.home-indicator');
    const viewClass = ['discover-page', 'community-page', 'post-page'].find(name => page.classList.contains(name));
    const feed = node('div', `navigation-feed ${viewClass}`);
    page.classList.remove(viewClass);
    page.classList.add('navigation-shell');
    [...screen.children].filter(child => child !== status).forEach(child => feed.append(child));
    screen.append(feed, node('div', 'navigation-home', indicator));
    const root = { element: feed, path: [], opener: null };
    const routes = new Map([['', root]]);
    let current = root, animation = null, draftSequence = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const historyKey = `pocketsaga-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ease = CustomEase.create('pageNavigation', '0.6,0,0.25,1');
    function routeFor(path) {
      const key = path.join('/');
      if (routes.has(key)) return routes.get(key);
      const token = path.at(-1);
      const kind = token.split(':')[0];
      let element, cleanup, setup;
      if (kind === 'create-post') {
        const selected = createPostData.media.find(item => item.id === token.split(':')[1]) || null;
        const view = PocketSagaCreatePost.CreatePostPage(createPostData, selected);
        element = view.element;
        cleanup = view.destroy;
      } else {
        const data = structuredClone(kind === 'post' ? postData : communityData);
        element = kind === 'post' ? PocketSagaPost.PostPage(data) : PocketSaga.CommunityPage(data);
        cleanup = () => {};
        setup = () => kind === 'post' ? PocketSagaPost.setup(element, data) : PocketSaga.setupCommunity(element);
      }
      element.classList.add('navigation-route', `navigation-${kind}`);
      element.hidden = true;
      element.inert = true;
      screen.append(element);
      gsap.set(element, { xPercent: 100 });
      if (setup) cleanup = setup();
      const route = { element, path, cleanup, opener: null };
      routes.set(key, route);
      return route;
    }
    function show(path, opener) {
      const next = routeFor(path);
      if (next === current) return;
      const previous = current;
      const forward = path.length > previous.path.length;
      current = next;
      if (forward) next.opener = opener || document.activeElement;
      animation?.kill();
      for (const route of routes.values()) {
        const visible = route === previous || route === next;
        route.element.hidden = !visible;
        route.element.inert = true;
        route.element.setAttribute('aria-hidden', String(route !== next));
      }
      next.element.inert = false;
      if (forward) gsap.set(next.element, { xPercent: 100, opacity: 1 });
      next.element.style.zIndex = String(path.length + 1);
      previous.element.style.zIndex = String(previous.path.length + 1);
      const editorTransition = (forward ? next : previous).element.classList.contains('navigation-create-post');
      const duration = reduced.matches ? 0 : editorTransition ? .35 : forward ? .54 : .46;
      const complete = () => {
        if (current !== next) return;
        previous.element.hidden = true;
        next.element.removeAttribute('aria-hidden');
        const focus = !forward && previous.opener?.isConnected ? previous.opener : next.element.querySelector('.feed-scroll');
        focus?.focus({ preventScroll: true });
      };
      animation = gsap.timeline({ onComplete: complete })
        .to(next.element, { xPercent: 0, opacity: 1, duration, ease }, 0)
        .to(previous.element, { xPercent: forward ? -14 : 100, opacity: forward ? .72 : 1, duration, ease }, 0);
    }
    function navigate(kind, sourcePost, media = null, source = null) {
      if (kind === 'community' && !communityData) return;
      if (animation?.isActive()) return;
      if (kind === 'create-post' && !window.PocketSagaCreatePost) return;
      const token = kind === 'create-post' ? `create-post:${media?.id || 'none'}:${Date.now()}-${++draftSequence}` : kind;
      const path = [...current.path, token];
      const opener = sourcePost ? [...current.element.querySelectorAll('.post-card')].find(card => card.dataset.postId === sourcePost.id) : document.activeElement;
      history.pushState({ ...history.state, pocketSagaNavigation: historyKey, pocketSagaRoutes: path }, '', `#${kind}`);
      show(path, source || opener);
    }
    function back() {
      if (!current.path.length) return;
      if (history.state?.pocketSagaNavigation === historyKey) history.back();
      else {
        const path = current.path.slice(0, -1);
        history.replaceState({ ...history.state, pocketSagaRoutes: path }, '', location.pathname + location.search + (path.length ? `#${path.at(-1).split(':')[0]}` : ''));
        show(path);
      }
    }
    const onAction = event => {
      const { action, post, media, source } = event.detail;
      if (['open-post', 'comments'].includes(action)) navigate('post', post);
      else if (action === 'community') navigate('community');
      else if (action === 'create-post') navigate('create-post', null, media, source);
      else if (action === 'publish') { page.dispatchEvent(new CustomEvent('draft-published', { detail: { post } })); back(); }
      else if (action === 'back') back();
    };
    const readPath = () => {
      const saved = history.state?.pocketSagaRoutes;
      if (Array.isArray(saved) && saved.every(kind => typeof kind === 'string' && (['post', 'community'].includes(kind) || (window.PocketSagaCreatePost && /^create-post(?::[a-z0-9_-]+:[0-9-]+)?$/.test(kind))))) return saved;
      const hashes = ['#post', '#community', ...(window.PocketSagaCreatePost ? ['#create-post'] : [])];
      return hashes.includes(location.hash) ? [location.hash.slice(1)] : [];
    };
    const onHistory = () => show(readPath());
    const events = ['discover-action', 'community-action', 'post-action', 'create-post-action'];
    events.forEach(name => page.addEventListener(name, onAction));
    window.addEventListener('popstate', onHistory);
    const initialPath = readPath();
    // Build ancestors too so browser Back can restore each intermediate screen.
    initialPath.forEach((kind, index) => routeFor(initialPath.slice(0, index + 1)));
    if (initialPath.length) show(initialPath);
    const destroy = () => {
      animation?.kill();
      routes.forEach(route => route.cleanup?.());
      events.forEach(name => page.removeEventListener(name, onAction));
      window.removeEventListener('popstate', onHistory);
      page.removeEventListener('preview-unmount', destroy);
    };
    page.addEventListener('preview-unmount', destroy, { once: true });
    return { open: () => navigate('post'), openCommunity: () => navigate('community'), back, destroy };
  }
  window.PocketSagaNavigation = { attach };
})();
