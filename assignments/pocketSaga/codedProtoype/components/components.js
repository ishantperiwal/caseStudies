/* Reusable DOM components. No bundler or server required. */
(() => {
  const node = (tag, className, children = []) => {
    const el = document.createElement(tag);
    el.className = className;
    for (const child of [children].flat(Infinity)) if (child != null && child !== false) el.append(child);
    return el;
  };
  function SeparatedMeta(items, className = '', tag = 'span') {
    const parts = [items].flat().flatMap(item => typeof item === 'string' ? item.split('·').map(part => part.trim()).filter(Boolean) : item ? [item] : []);
    const children = [];
    parts.forEach((item, index) => {
      if (index) {
        const separator = node('span', 'meta-separator', '·');
        separator.setAttribute('aria-hidden', 'true');
        children.push(separator);
      }
      children.push(typeof item === 'string' ? node('span', 'meta-item', item) : item);
    });
    return node(tag, `separated-meta ${className}`, children);
  }
  function Icon(name) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 14 14');
    el.setAttribute('class', `icon icon-${name}`);
    el.setAttribute('aria-hidden', 'true');
    // Only locally defined icon markup is inserted; page content uses text nodes.
    el.innerHTML = window.PocketSagaIcons[name] || '';
    return el;
  }
  function Action({ label, icon, className = '', onClick, children }) {
    const button = node('button', `action ${className}`, [icon && Icon(icon), children ?? label]);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    if (/(^|\s)(round-action|sheet-close)(\s|$)/.test(className)) button.classList.add('tap-feedback');
    if (onClick) button.addEventListener('click', onClick);
    return button;
  }
  function Avatar(person, large = false) {
    const el = node('span', `avatar${large ? ' avatar-large' : ''}`);
    el.innerHTML = PocketSagaAvatars.render(person);
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', `${person.name}'s avatar`);
    return el;
  }
  function Artwork(src, className, alt = '') {
    const img = node('img', className);
    img.src = src;
    img.alt = alt;
    return img;
  }
  function ProgressiveBlur(edge) {
    const el = node('div', `progressive-blur progressive-blur-${edge}`);
    el.setAttribute('aria-hidden', 'true');
    const layers = edge === 'top'
      ? [[.5, 0, 45], [1.5, 15, 65], [3, 35, 80], [6, 55, 95], [10, 75, 100]]
      : [[1, 0, 35], [3, 20, 60], [6, 45, 85], [12, 65, 100]];
    layers.forEach(([blur, start, end]) => {
      const layer = node('span', 'blur-layer');
      layer.style.setProperty('--blur', `${blur}px`);
      layer.style.setProperty('--start', `${start}%`);
      layer.style.setProperty('--end', `${end}%`);
      el.append(layer);
    });
    return el;
  }
  function StatusBar(device) {
    const el = node('header', 'status-bar', [node('span', 'status-time', device.time || '9:41'), node('span', 'dynamic-island'), node('span', 'device-status', [Icon('signal'), Icon('wifi'), Icon('battery-full')])]);
    el.setAttribute('aria-label', `Device status, ${device.time || '9:41'}, cellular signal, Wi-Fi, battery full`);
    return el;
  }
  function HomeIndicator() {
    return node('div', 'home-area', [ProgressiveBlur('bottom'), node('span', 'home-indicator')]);
  }
  function AmbientArtwork(src, className) {
    if (!PocketSagaMedia.ambience.enabled) return Artwork(src, className);
    const layer = node('div', `${className} ambient-composite`, [
      Artwork(PocketSagaMedia.ambientSource(src), 'ambient-color-base'),
      Artwork(src, 'ambient-poster-texture')
    ]);
    layer.setAttribute('aria-hidden', 'true');
    const settings = PocketSagaMedia.ambience;
    layer.style.setProperty('--texture-opacity', settings.textureOpacity);
    layer.style.setProperty('--texture-saturation', settings.textureSaturation);
    layer.style.setProperty('--texture-blur', `${settings.textureBlur}px`);
    return layer;
  }
  function AtmosphericBackground(src) {
    const el = node('div', 'atmosphere', [src && AmbientArtwork(src, 'atmosphere-image'), node('div', 'atmosphere-veil')]);
    el.setAttribute('aria-hidden', 'true');
    PocketSagaMedia.apply(el, src);
    return el;
  }
  function PhoneFrame({ device = {}, background, content }) {
    const frame = node('main', 'phone-case', node('div', 'phone-screen', [AtmosphericBackground(background), content, node('div', 'screen-top-blur', ProgressiveBlur('top')), StatusBar(device), HomeIndicator()]));
    frame.setAttribute('aria-label', device.label || 'Phone preview');
    if (device.width) frame.style.setProperty('--phone-width', device.width);
    return frame;
  }
  function CommunityHeader(community, labels, emit) {
    return node('section', 'community-header', [
      node('div', 'community-identity', [community.artwork && Artwork(community.artwork, 'community-artwork'), node('div', 'community-titles', [node('h1', 'community-name', community.name), SeparatedMeta(community.context, 'community-context', 'p')])]),
      node('p', 'community-description', community.description),
      node('div', 'membership-actions', [Action({ label: community.joined ? labels.joined : labels.join, icon: community.joined ? 'check' : null, className: `membership-action${community.joined ? '' : ' membership-join'} tap-feedback`, onClick: () => emit('membership', { community }) }), Action({ label: `${community.members} members`, icon: 'users', className: 'membership-action membership-count tap-feedback', children: [community.members, Icon('chevron-down')], onClick: () => emit('members', { community }) }), Action({ label: 'Community options', icon: 'ellipsis', className: 'round-action', children: '', onClick: () => emit('options', { community }) })])
    ]);
  }
  function Composer(viewer, label, emit) {
    return Action({ label, className: 'composer', children: [Avatar(viewer, true), node('span', 'composer-label', label)], onClick: () => emit('compose', {}) });
  }
  function MessageComposer(viewer, placeholder, className = '') {
    const input = node('textarea', 'message-input');
    input.rows = 1;
    input.placeholder = placeholder;
    input.setAttribute('aria-label', placeholder);
    const send = Action({ label: 'Send', className: 'message-send', children: 'Send' });
    send.type = 'submit';
    send.disabled = true;
    input.addEventListener('input', () => { send.disabled = !input.value.trim(); });
    return node('form', `message-composer ${className}`, [Avatar(viewer, true), input, send]);
  }
  function FeedToolbar(labels, emit) {
    return node('div', 'feed-toolbar', [node('h2', 'feed-heading', labels.posts), Action({ label: labels.sort, icon: 'list-filter', className: 'sort-action', children: '', onClick: () => emit('sort', {}) })]);
  }
  function AuthorMeta(post) {
    return node('div', 'author-meta', [Avatar(post.author), node('div', 'author-details', [node('span', 'author-name', post.author.name), SeparatedMeta([post.time, post.type], 'post-time')])]);
  }
  function MediaAttachment(attachment, post, emit) {
    return node('div', 'media-attachment', [attachment.artwork && Artwork(attachment.artwork, 'attachment-artwork'), node('div', 'attachment-details', [node('p', 'attachment-title', attachment.title), SeparatedMeta(attachment.subtitle, 'attachment-subtitle', 'p')]), Action({ label: attachment.action || 'Open', icon: 'play', className: 'attachment-action', onClick: () => emit('attachment', { post, attachment }) })]);
  }
  function ReactionBar(post, emit) {
    return node('footer', 'reaction-bar', [Action({ label: `${(post.likes ?? 0) + Number(Boolean(post.liked))} likes`, icon: 'heart', className: 'like-action', children: String((post.likes ?? 0) + Number(Boolean(post.liked))), onClick: () => emit('like', { post }) }), Action({ label: `${post.comments ?? 0} comments`, icon: 'message-circle', children: String(post.comments ?? 0), onClick: () => emit('comments', { post }) })]);
  }
  function PostCard(post, context, emit) {
    const el = node('article', 'post-card', [AuthorMeta(post), node('div', 'post-copy', [node('h3', 'post-title', post.title), node('p', 'post-body', post.body)]), post.attachment && MediaAttachment(post.attachment, post, emit), ReactionBar(post, emit)]);
    el.dataset.postId = post.id;
    el.tabIndex = 0;
    el.setAttribute('role', 'link');
    el.setAttribute('aria-label', `Open post: ${post.title}`);
    let pressStart = null;
    const releasePress = () => {
      pressStart = null;
      el.classList.remove('is-pressed');
    };
    el.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button, a, input, textarea') || event.target.closest('[role="link"]') !== el) return;
      pressStart = { x: event.clientX, y: event.clientY };
      el.classList.add('is-pressed');
    });
    el.addEventListener('pointermove', event => {
      if (pressStart && Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > 8) releasePress();
    });
    for (const event of ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture']) el.addEventListener(event, releasePress);
    el.addEventListener('click', event => {
      if (event.target.closest('button, a, input, textarea') || event.target.closest('[role="link"]') !== el || window.getSelection()?.toString()) return;
      emit('open-post', { post });
    });
    el.addEventListener('keydown', event => {
      if (event.target !== el || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      emit('open-post', { post });
    });
    return el;
  }
  function CommunityPage(data, handlers = {}) {
    let page;
    const emit = (action, detail) => {
      handlers[action]?.(detail);
      page.dispatchEvent(new CustomEvent('community-action', { bubbles: true, detail: { action, ...detail } }));
    };
    const labels = { composer: 'Write in this community…', posts: 'Posts', sort: 'Recent first', joined: 'Joined', join: 'Join community', empty: 'No posts yet.', ...data.labels };
    const navigation = node('nav', 'page-navigation', [Action({ label: 'Go back', icon: 'arrow-left', className: 'round-action', children: '', onClick: () => emit('back', {}) }), node('span', 'compact-community-title', data.community.name), node('div', 'navigation-action-slot', Action({ label: labels.sort, icon: 'list-filter', className: 'round-action compact-sort-action', children: '', onClick: () => emit('sort', {}) }))]);
    const intro = node('div', 'community-intro', [CommunityHeader(data.community, labels, emit), Composer(data.viewer, labels.composer, emit)]);
    const toolbar = FeedToolbar(labels, emit);
    const feed = node('div', 'feed-scroll', [intro, toolbar,
      node('section', 'post-list', data.posts.length ? data.posts.map(post => PostCard(post, data.community.context, emit)) : node('p', 'empty-feed', labels.empty))
    ]);
    feed.tabIndex = 0;
    feed.setAttribute('role', 'region');
    feed.setAttribute('aria-label', `${data.community.name} community feed`);
    page = PhoneFrame({ device: data.device, background: data.community.background, content: feed });
    page.classList.add('community-page');
    page.querySelector('.phone-screen').append(navigation);
    for (const key of ['accent', 'text', 'muted', 'body', 'background']) if (data.theme?.[key]) page.style.setProperty(`--${key}`, data.theme[key]);
    return page;
  }
  const mountedPreviews = new WeakMap();
  function mountPage(target, page, setup = () => () => {}) {
    mountedPreviews.get(target)?.();
    const stage = node('div', 'phone-stage', page);
    target.replaceChildren(stage);
    const fit = () => {
      const scale = Math.min(1, Math.max(0, stage.clientWidth - 10) / page.offsetWidth, stage.clientHeight / page.offsetHeight);
      page.style.setProperty('--preview-scale', String(scale));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    observer.observe(page);
    const cleanup = setup(page);
    mountedPreviews.set(target, () => { page.dispatchEvent(new Event('preview-unmount')); observer.disconnect(); cleanup?.(); });
    fit();
    return page;
  }
  function setupCommunity(page) {
    return PocketSagaMotion.scrollHeader({
      scroller: page.querySelector('.feed-scroll'),
      navigation: page.querySelector('.page-navigation'),
      titleTrigger: page.querySelector('.community-name'),
      actionTrigger: page.querySelector('.feed-toolbar'),
      title: page.querySelector('.compact-community-title'),
      actionSlot: page.querySelector('.navigation-action-slot')
    });
  }
  window.PocketSaga = { node, SeparatedMeta, mountPage, CommunityPage, PhoneFrame, StatusBar, HomeIndicator, ProgressiveBlur, AtmosphericBackground, CommunityHeader, Composer, FeedToolbar, PostCard, AuthorMeta, MediaAttachment, ReactionBar, Avatar, Artwork, AmbientArtwork, Action, Icon, MessageComposer,
    setupCommunity,
    mount(target, data, handlers) {
      return mountPage(target, CommunityPage(data, handlers), setupCommunity);
    }
  };
})();
