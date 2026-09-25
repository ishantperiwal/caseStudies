/* Shared spoiler layouts and disclosure motion. Discover feed remains spoiler-free. */
(() => {
  const { node, Artwork, AmbientArtwork, AuthorMeta, ReactionBar, Action, Icon, SeparatedMeta } = PocketSaga;

  const variants = Object.freeze({
    discover: Object.freeze({ inset: 20, bottomInset: 20, compactHeight: 242, toggleTop: 152, artwork: true }),
    group: Object.freeze({ inset: 16, bottomInset: 16, compactHeight: 154, toggleTop: 70, artwork: false })
  });

  function eyeIcon() {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 14 14');
    icon.setAttribute('class', 'icon spoiler-eye-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.25 7s2-3.75 5.75-3.75S12.75 7 12.75 7 10.75 10.75 7 10.75 1.25 7 1.25 7Z"/><circle cx="7" cy="7" r="1.65"/></g>';
    return icon;
  }

  function groupSuggestion(group) {
    const join = Action({
      label: `Join ${group.name}`,
      className: 'group-join tap-feedback',
      children: [Icon('users'), 'Join']
    });
    join.setAttribute('aria-pressed', 'false');
    join.addEventListener('click', () => {
      const joined = join.getAttribute('aria-pressed') !== 'true';
      join.setAttribute('aria-pressed', String(joined));
      join.setAttribute('aria-label', joined ? `Joined ${group.name}` : `Join ${group.name}`);
      join.replaceChildren(Icon(joined ? 'check' : 'users'), joined ? 'Joined' : 'Join');
    });
    return node('div', 'discover-group-row glass-surface spoiler-card-group-row', [
      Artwork(group.artwork, 'discover-group-artwork', `${group.name} artwork`),
      node('div', 'discover-group-copy', [
        node('span', 'group-name', group.name),
        node('span', 'group-eyebrow', `${group.members} members`)
      ]),
      join
    ]);
  }

  function create({ media, group, scope, watchedThrough, author, time, type, title, body, likes = 0, comments = 0, variant = 'discover' }) {
    const isGroup = variant === 'group';
    const layout = variants[variant] || variants.discover;
    const { inset, bottomInset } = layout;
    const post = { author, time, type, title, body, likes, comments };
    const context = SeparatedMeta([
      node('span', 'spoiler-card-community-context', [Icon('users'), node('span', 'discover-community-label', group.name)]),
      `${media.title} · ${media.mediaType === 'movie' ? 'Movie' : 'TV series'}`
    ], 'discover-post-context', 'div');
    const reactions = ReactionBar(post, () => {});
    const save = Action({ label: 'Save post', icon: 'bookmark', className: 'save-post', children: '' });
    save.setAttribute('aria-pressed', 'false');
    reactions.append(save);
    const sensitive = node('div', 'spoiler-card-sensitive', isGroup ? [
      AuthorMeta(post),
      node('div', 'post-copy', [node('h3', 'post-title', title), node('p', 'post-body', body)]),
      reactions
    ] : [
      groupSuggestion(group),
      node('div', 'post-copy', [context, node('h3', 'post-title', title), node('p', 'post-body', body)]),
      AuthorMeta(post),
      reactions
    ]);
    const toggleLabel = node('span', '', 'View potential spoiler');
    const toggle = node('button', 'spoiler-card-toggle spoiler-card-reveal tap-feedback', [eyeIcon(), toggleLabel]);
    toggle.type = 'button';
    let transitioning = false;
    let disposed = false;
    let activeAnimations = [];
    const cover = node('div', 'spoiler-card-cover', [
      node('div', 'spoiler-card-cover-content', [
        ...(isGroup ? [] : [Artwork(media.artwork, 'spoiler-card-safe-artwork', '')]),
        node('span', 'spoiler-card-safe-label', `${media.title} · ${scope}`)
      ])
    ]);
    const conceal = node('div', 'spoiler-card-conceal', [sensitive, cover]);
    const atmosphere = node('div', 'discover-post-atmosphere', [
      AmbientArtwork(media.artwork, 'discover-post-artwork'),
      node('div', 'discover-post-veil')
    ]);
    atmosphere.setAttribute('aria-hidden', 'true');
    const card = node('article', `spoiler-card ${isGroup ? 'post-card spoiler-card-group' : 'discover-post'}`, [
      ...(isGroup ? [] : [atmosphere]),
      conceal,
      toggle
    ]);
    card.style.setProperty('--spoiler-inset', `${inset}px`);
    card.style.setProperty('--spoiler-bottom-inset', `${bottomInset}px`);
    PocketSagaMedia.apply(card, media.artwork);
    card.dataset.revealed = 'false';
    card.setAttribute('aria-label', `${media.title}, ${scope}. Potential spoiler.`);

    let revealed = false;
    const easing = 'cubic-bezier(.6,0,.25,1)';

    // Measure natural layout in local pixels; the preview transform never enters sizing.
    function geometry() {
      return { height: card.offsetHeight, left: toggle.offsetLeft,
        top: toggle.offsetTop, width: toggle.offsetWidth };
    }

    function settle() {
      delete card.dataset.animating;
      card.style.removeProperty('height');
      for (const property of ['left', 'top', 'width']) toggle.style.removeProperty(property);
    }

    function place(box) {
      card.style.height = `${box.height}px`;
      toggle.style.left = `${box.left}px`;
      toggle.style.top = `${box.top}px`;
      toggle.style.width = `${box.width}px`;
    }

    function setRevealed(value) {
      if (disposed || transitioning || revealed === value) return;
      const first = geometry();
      const scroller = card.closest('.feed-scroll');
      const scrollTop = scroller?.scrollTop || 0;
      const scrollHeight = scroller?.scrollHeight || 0;
      const bottomPadding = scroller ? parseFloat(getComputedStyle(scroller).paddingBottom) : 0;
      // Measuring the compact endpoint must not temporarily clamp the scroll range.
      if (scroller && !value) scroller.style.paddingBottom = `${bottomPadding + first.height}px`;
      revealed = value;
      card.dataset.revealed = String(value);
      cover.setAttribute('aria-hidden', String(value));
      sensitive.inert = !value;
      sensitive.setAttribute('aria-hidden', String(!value));
      toggle.setAttribute('aria-expanded', String(value));
      toggleLabel.textContent = value ? 'Hide spoiler' : 'View potential spoiler';
      card.setAttribute('aria-label', `${media.title}, ${scope}. ${value ? 'Revealed post.' : 'Potential spoiler.'}`);
      const last = geometry();
      const restoreScroll = () => {
        if (!scroller) return;
        if (!value) {
          // At the very end of a feed, retain only the space required to keep its
          // top stationary. Otherwise a shorter document forcibly scrolls upward.
          const reserve = Math.max(0, scrollTop + scroller.clientHeight - (scrollHeight + last.height - first.height));
          scroller.style.paddingBottom = `${bottomPadding + reserve}px`;
        }
        scroller.scrollTop = scrollTop;
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        restoreScroll();
        toggle.focus({ preventScroll: true });
        return;
      }

      transitioning = true;
      card.dataset.animating = 'true';
      place(last);
      const options = { duration: value ? 480 : 380, easing, fill: 'both' };
      const animations = [
        card.animate([{ height: `${first.height}px` }, { height: `${last.height}px` }], options),
        toggle.animate([first, last].map(box => ({
          left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`
        })), options),
        sensitive.animate(value ? [
          { filter: 'blur(11px)', opacity: .68, transform: 'translateY(6px)' },
          { filter: 'blur(0px)', opacity: 1, transform: 'translateY(0)' }
        ] : [
          { filter: 'blur(0px)', opacity: 1, transform: 'translateY(0)' },
          { filter: 'blur(11px)', opacity: .68, transform: 'translateY(6px)' }
        ], options),
        cover.animate(value ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }], options)
      ];
      restoreScroll();
      activeAnimations = animations;
      Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
        animations.forEach(animation => animation.cancel());
        activeAnimations = [];
        if (disposed) return;
        transitioning = false;
        settle();
        toggle.focus({ preventScroll: true });
      });
    }
    toggle.setAttribute('aria-expanded', 'false');
    sensitive.inert = true;
    sensitive.setAttribute('aria-hidden', 'true');
    toggle.addEventListener('click', () => setRevealed(card.dataset.revealed !== 'true'));
    card.disposeSpoiler = () => {
      disposed = true;
      settle();
      activeAnimations.forEach(animation => animation.cancel());
    };
    return card;
  }

  window.PocketSagaSpoiler = { create, variants };
})();
