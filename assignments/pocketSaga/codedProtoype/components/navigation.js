/* In-phone route stack shared by standalone discovery, community and post previews. */
(() => {
  // Shared interaction types and route assignments. Tune activity motion here
  // so every screen using it enters and returns with the same behavior.
  const transitions = {
    activity: {
      duration: .4,
      easing: '0.6,0,0.25,1',
      foreground: { xPercent: 100, scale: .88, opacity: 1, borderRadius: 48, filter: 'blur(0px)' },
      backdrop: { xPercent: 0, scale: .92, opacity: .8, borderRadius: 40, filter: 'blur(5px)' }
    }
  };
  const routeTransitions = { 'create-post': 'activity', post: 'activity', community: 'activity', notifications: 'activity' };
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
    let current = root, animation = null, draftSequence = 0, closeNotifications = null;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const historyKey = `pocketsaga-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ease = CustomEase.create('pageNavigation', '0.6,0,0.25,1');
    const activityEase = CustomEase.create('activityNavigation', transitions.activity.easing);
    function routeFor(path) {
      const key = path.join('/');
      if (routes.has(key)) return routes.get(key);
      const token = path.at(-1);
      const kind = token.split(':')[0];
      let element, cleanup, setup;
      if (kind === 'notifications') {
        element = PocketSagaNotifications.Page();
        cleanup = () => {};
      } else if (kind === 'create-post') {
        const selected = createPostData.media.find(item => item.id === token.split(':')[1]) || null;
        const view = PocketSagaCreatePost.CreatePostPage(createPostData, selected);
        element = view.element;
        cleanup = view.destroy;
      } else {
        const id = token.split(':')[1];
        const data = kind === 'post' ? PocketSagaData.post(id || postData.post.id) : PocketSagaData.community(id || communityData.community.id);
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
      const route = { element, path, cleanup, opener: null, transition: routeTransitions[kind] || 'slide' };
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
      if (forward) gsap.set(next.element, { xPercent: 100, scale: 1, opacity: 1, clearProps: 'borderRadius,transformOrigin,filter' });
      next.element.style.zIndex = String(path.length + 1);
      previous.element.style.zIndex = String(previous.path.length + 1);
      const activityTransition = (forward ? next : previous).transition === 'activity';
      const duration = reduced.matches ? 0 : activityTransition ? transitions.activity.duration : forward ? .54 : .46;
      const complete = () => {
        if (current !== next) return;
        previous.element.hidden = true;
        gsap.set(next.element, { scale: 1, clearProps: 'borderRadius,transformOrigin,filter' });
        next.element.removeAttribute('aria-hidden');
        // Retained feeds keep their scroll position while reflecting detail edits.
        for (const card of next.element.querySelectorAll('.post-card')) {
          if (!PocketSagaData.hasPost(card.dataset.postId)) continue;
          const post = PocketSagaData.post(card.dataset.postId).post;
          const like = card.querySelector('.like-action');
          if (like) {
            like.replaceChildren(PocketSaga.Icon('heart'), String(post.likes));
            like.setAttribute('aria-label', `${post.likes} likes`);
            like.setAttribute('aria-pressed', String(Boolean(post.liked)));
          }
          const comment = card.querySelector('.reaction-bar button:not(.like-action)');
          if (comment) {
            comment.replaceChildren(PocketSaga.Icon('message-circle'), String(post.commentCount));
            comment.setAttribute('aria-label', `${post.commentCount} comments`);
          }
        }
        const focus = !forward && previous.opener?.isConnected ? previous.opener : next.element.querySelector('.feed-scroll');
        focus?.focus({ preventScroll: true });
      };
      if (activityTransition) {
        const { foreground, backdrop } = transitions.activity;
        // Treat the incoming route as an activity above the retained screen. Keep
        // the backdrop pose cached so Back can reverse the same movement.
        gsap.set((forward ? next : previous).element, { transformOrigin: 'right center' });
        if (forward) {
          // GSAP mutates vars (set adds duration: 0). Never pass the shared
          // pose itself, or subsequent Back tweens inherit that zero duration.
          gsap.set(next.element, { ...foreground });
          gsap.set(previous.element, { transformOrigin: 'center center' });
        }
        animation = gsap.timeline({ onComplete: complete, defaults: { duration, ease: activityEase } })
          .to(next.element, { xPercent: 0, scale: 1, opacity: 1, borderRadius: 0, filter: 'blur(0px)' }, 0)
          .to(previous.element, { ...(forward ? backdrop : foreground) }, 0);
        return;
      }
      animation = gsap.timeline({ onComplete: complete })
        .to(next.element, { xPercent: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration, ease }, 0)
        .to(previous.element, { xPercent: forward ? -14 : 100, opacity: forward ? .72 : 1, duration, ease }, 0);
    }
    function navigate(kind, sourcePost, media = null, source = null) {
      if (kind === 'community' && !communityData) return;
      if (animation?.isActive()) return;
      if (kind === 'create-post' && !window.PocketSagaCreatePost) return;
      const id = sourcePost?.id || (kind === 'post' ? postData.post.id : communityData?.community.id);
      const token = kind === 'notifications' ? 'notifications' : kind === 'create-post' ? `create-post:${media?.id || 'none'}:${Date.now()}-${++draftSequence}` : `${kind}:${id}`;
      const path = [...current.path, token];
      // Reopening a record gets fresh store data; ancestors stay mounted for Back.
      const stale = routes.get(path.join('/'));
      if (stale) { stale.cleanup?.(); stale.element.remove(); routes.delete(path.join('/')); }
      const opener = sourcePost ? [...current.element.querySelectorAll('.post-card')].find(card => card.dataset.postId === sourcePost.id) : document.activeElement;
      history.pushState({ ...history.state, pocketSagaNavigation: historyKey, pocketSagaRoutes: path }, '', `#${token}`);
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
      const { action, post, media, source, group, community } = event.detail;
      if (['open-post', 'comments'].includes(action)) navigate('post', post);
      else if (action === 'notifications') {
        closeNotifications?.();
        closeNotifications = PocketSagaNotifications.OpenUnread(screen, { onPost: post => navigate('post', post), onHistory: () => navigate('notifications') });
      }
      else if (action === 'community') navigate('community', group || community);
      else if (action === 'create-post') navigate('create-post', null, media, source);
      else if (action === 'publish') {
        page.dispatchEvent(new CustomEvent('draft-published', { detail: { post } }));
        // Replace the editor with the post, retaining its parent for Back.
        const draftRoute = current;
        current = routeFor(current.path.slice(0, -1));
        draftRoute.element.hidden = true;
        const path = [...current.path, `post:${post.id}`];
        history.replaceState({ ...history.state, pocketSagaNavigation: historyKey, pocketSagaRoutes: path }, '', `#post:${post.id}`);
        show(path, draftRoute.opener);
      }
      else if (action === 'back') back();
    };
    const validToken = token => {
      if (typeof token !== 'string') return false;
      const [kind, id] = token.split(':');
      if (kind === 'notifications') return Boolean(window.PocketSagaNotifications);
      if (kind === 'post') return !id || PocketSagaData.hasPost(id);
      if (kind === 'community') return !id || PocketSagaData.hasCommunity(id);
      return Boolean(window.PocketSagaCreatePost) && /^create-post(?::[a-z0-9_-]+:[0-9-]+)?$/.test(token);
    };
    const readPath = () => {
      const saved = history.state?.pocketSagaRoutes;
      if (Array.isArray(saved)) {
        const path = [];
        for (const token of saved) { if (!validToken(token)) break; path.push(token); }
        return path;
      }
      const token = location.hash.slice(1);
      return validToken(token) ? [token] : [];
    };
    const onHistory = () => { closeNotifications?.(); show(readPath()); };
    const events = ['notifications-action', 'discover-action', 'community-action', 'post-action', 'create-post-action'];
    events.forEach(name => page.addEventListener(name, onAction));
    window.addEventListener('popstate', onHistory);
    const initialPath = readPath();
    // Build ancestors too so browser Back can restore each intermediate screen.
    initialPath.forEach((kind, index) => routeFor(initialPath.slice(0, index + 1)));
    if (initialPath.length) show(initialPath);
    const destroy = () => {
      animation?.kill();
      closeNotifications?.();
      routes.forEach(route => route.cleanup?.());
      events.forEach(name => page.removeEventListener(name, onAction));
      window.removeEventListener('popstate', onHistory);
      page.removeEventListener('preview-unmount', destroy);
    };
    page.addEventListener('preview-unmount', destroy, { once: true });
    return { open: () => navigate('post'), openCommunity: () => navigate('community'), back, destroy };
  }
  window.PocketSagaNavigation = { attach, transitions, routeTransitions };
})();
