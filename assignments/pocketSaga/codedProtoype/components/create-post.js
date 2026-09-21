/* One editor for selected-media and choose-media entry points. */
(() => {
  const { node, Action, Icon, Artwork, PhoneFrame, SeparatedMeta } = PocketSaga;
  function ChoiceSheet(page, { title, choices, selectedId, onSelect, searchable = false, onClear }) {
    const screen = page.querySelector('.phone-screen');
    const opener = document.activeElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const overlay = node('div', 'create-picker-overlay');
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', title);
    const scrim = node('div', 'create-picker-scrim');
    const results = node('div', 'create-picker-results');
    const search = node('input', 'create-picker-search');
    search.type = 'search'; search.placeholder = 'Search movies and series'; search.setAttribute('aria-label', search.placeholder);
    let animation, closed = false;
    const background = [...screen.children].map(element => [element, element.inert]);
    const restore = () => { overlay.remove(); background.forEach(([element, inert]) => { element.inert = inert; }); opener?.focus({ preventScroll: true }); };
    const close = () => {
      if (closed) return;
      closed = true; animation?.kill();
      if (reduced.matches) { restore(); return; }
      animation = gsap.timeline({ onComplete: restore })
        .to(sheet, { y: 24, opacity: 0, duration: .28, ease: 'power2.inOut' }, 0)
        .to(scrim, { opacity: 0, duration: .16 }, .12);
    };
    const sheet = node('section', 'create-picker-sheet glass-surface', [node('div', 'create-picker-handle'), node('header', 'create-picker-header', [node('h2', '', title), Action({ label: 'Close picker', icon: 'x', className: 'sheet-close', children: '', onClick: close })]), searchable && search, results]);
    if (onClear) sheet.append(Action({ label: 'Remove selected title', className: 'create-picker-clear', onClick: () => { onClear(); close(); } }));
    const render = () => {
      const filtered = choices.filter(item => item.title.toLowerCase().includes(search.value.toLowerCase().trim()));
      results.replaceChildren(...(filtered.length ? filtered.map(item => {
        const option = Action({ label: item.title, className: 'create-picker-option glass-surface tap-feedback', children: [item.artwork && Artwork(item.artwork, 'create-picker-artwork'), node('span', 'create-picker-copy', [node('span', 'create-picker-name', item.title), item.subtitle && SeparatedMeta(item.subtitle, 'create-picker-subtitle')]), item.id === selectedId && Icon('check')], onClick: () => { onSelect(item); close(); } });
        option.setAttribute('aria-pressed', String(item.id === selectedId));
        return option;
      }) : [node('p', 'empty-feed', 'No matching titles.')]));
    };
    search.addEventListener('input', render); render();
    background.forEach(([element]) => { element.inert = true; });
    overlay.append(scrim, sheet); screen.append(overlay);
    scrim.addEventListener('click', close);
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        const focusable = [...sheet.querySelectorAll('button:not(:disabled),input')];
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    (searchable ? search : sheet.querySelector('button')).focus({ preventScroll: true });
    if (!reduced.matches) animation = gsap.timeline().from(scrim, { opacity: 0, duration: .24 }, 0).from(sheet, { y: 28, opacity: 0, duration: .38, ease: 'power3.out' }, 0);
    return { destroy() { animation?.kill(); overlay.remove(); background.forEach(([element, inert]) => { element.inert = inert; }); }, get closed() { return closed; } };
  }
  function CreatePostPage(data, initialMedia = null, handlers = {}) {
    let page, picker, toastTimer, submitted = false;
    let media = data.media.find(item => item.id === initialMedia?.id) || null;
    let group = null;
    const emit = (action, detail = {}) => {
      handlers[action]?.(detail);
      page.dispatchEvent(new CustomEvent('create-post-action', { bubbles: true, detail: { action, ...detail } }));
    };
    const headline = node('textarea', 'create-headline');
    headline.rows = 1; headline.maxLength = 180; headline.placeholder = 'Add a headline'; headline.setAttribute('aria-label', 'Post headline');
    const body = node('textarea', 'create-body');
    body.placeholder = 'What’s on your mind?'; body.maxLength = 10000; body.setAttribute('aria-label', 'Post body');
    const notice = node('div', 'create-notice'); notice.setAttribute('role', 'status');
    const toast = message => { notice.textContent = message; notice.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => notice.classList.remove('is-visible'), 2600); };
    const suggestions = () => data.recommendations[media?.id] || [];
    const refresh = () => {
      mediaButton.replaceChildren(media ? Artwork(media.artwork, 'create-media-artwork') : Icon('search'), node('span', 'create-media-copy', [node('span', 'create-media-name', media?.title || 'Choose a title'), SeparatedMeta(media?.scope || 'Search movies and series', 'create-media-subtitle')]), Icon('chevron-down'));
      mediaButton.setAttribute('aria-label', media ? `Change title: ${media.title}` : 'Choose a title');
      groupButton.replaceChildren(Icon('users'), node('span', 'create-destination-copy', [node('span', '', group?.name || 'Select community'), node('span', 'create-destination-hint', group ? `${group.members} members` : media ? `${suggestions().length} ${suggestions().length === 1 ? 'recommendation' : 'recommendations'}` : 'Browse communities')]), Icon('chevron-down'));
      groupButton.setAttribute('aria-label', group ? `Change community: ${group.name}` : 'Select community');
      publish.disabled = submitted || !media || !group || !headline.value.trim();
    };
    const changeMedia = next => {
      media = next;
      if (group && !suggestions().includes(group.id)) group = null;
      const atmosphere = page.querySelector('.atmosphere');
      const old = [...atmosphere.querySelectorAll('.atmosphere-image')];
      if (media) {
        const image = Artwork(media.artwork, 'atmosphere-image');
        atmosphere.insertBefore(image, atmosphere.querySelector('.atmosphere-veil'));
        gsap.fromTo(image, { opacity: 0 }, { opacity: .58, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .35 });
      }
      old.forEach(image => gsap.to(image, { opacity: 0, duration: .35, onComplete: () => image.remove() }));
      refresh();
    };
    const openMedia = () => {
      picker?.destroy();
      picker = ChoiceSheet(page, { title: 'Choose a title', choices: data.media.map(item => ({ ...item, subtitle: item.scope })), selectedId: media?.id, searchable: true, onSelect: changeMedia, onClear: media ? () => changeMedia(null) : null });
    };
    const openCommunity = () => {
      picker?.destroy();
      const recommended = suggestions();
      const choices = [...data.groups].sort((a,b) => Number(recommended.includes(b.id)) - Number(recommended.includes(a.id))).map(item => ({ ...item, title: item.name, subtitle: `${item.members} members${recommended.includes(item.id) ? ' · Recommended' : ''}` }));
      picker = ChoiceSheet(page, { title: 'Select community', choices, selectedId: group?.id, onSelect: next => { group = next; refresh(); } });
    };
    const mediaButton = Action({ label: 'Choose a title', className: 'create-media-banner glass-surface tap-feedback', children: '', onClick: openMedia });
    const groupButton = Action({ label: 'Select community', className: 'create-destination glass-surface tap-feedback', children: '', onClick: openCommunity });
    const publish = Action({ label: 'Post', className: 'create-publish glass-choice is-selected tap-feedback', onClick: () => form.requestSubmit() });
    const tools = node('div', 'create-editor-tools', [['Clip', 'clapperboard'], ['Attach', 'paperclip'], ['Poll', 'chart-no-axes-column-increasing']].map(([label, icon]) => Action({ label, icon, className: 'create-tool glass-surface tap-feedback', onClick: () => {
      if (label === 'Clip' && !media) { openMedia(); return; }
      toast(`${label === 'Clip' ? 'Clip selection' : label === 'Attach' ? 'Attachments' : 'Polls'} will be available in a later pass.`);
      emit('enrichment', { kind: label.toLowerCase(), media });
    } })));
    const separator = node('div', 'create-editor-separator');
    separator.setAttribute('aria-hidden', 'true');
    const form = node('form', 'create-writing-surface glass-surface', [headline, separator, body, tools]);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (publish.disabled) return;
      submitted = true; refresh();
      emit('publish', { post: { id: `local-${Date.now()}`, group: group.id, context: media.title, artwork: media.artwork, artworkBrightness: group.artworkBrightness, title: headline.value.trim(), body: body.value.trim(), author: data.viewer, time: 'Just now', type: 'Thought', likes: 0, comments: 0 } });
      toast('Posted to this preview');
    });
    headline.addEventListener('input', () => { headline.style.height = 'auto'; headline.style.height = `${Math.min(160, Math.max(32, headline.scrollHeight))}px`; refresh(); });
    const scroller = node('div', 'feed-scroll create-post-scroll', [mediaButton, form]);
    scroller.tabIndex = 0; scroller.setAttribute('aria-label', 'New post editor');
    page = PhoneFrame({ device: data.device, background: media?.artwork, content: scroller });
    page.classList.add('create-post-page');
    const header = node('nav', 'page-navigation create-post-navigation', [Action({ label: 'Close new post', icon: 'x', className: 'round-action', children: '', onClick: () => emit('back') }), node('h1', '', 'New post')]);
    page.querySelector('.phone-screen').append(header, node('footer', 'create-publish-bar', [groupButton, publish]), notice);
    refresh();
    return { element: page, destroy() { picker?.destroy(); clearTimeout(toastTimer); gsap.killTweensOf(page.querySelectorAll('.atmosphere-image')); } };
  }
  window.PocketSagaCreatePost = { ChoiceSheet, CreatePostPage, mount(target, data, initialMedia, handlers) {
    const view = CreatePostPage(data, initialMedia, handlers);
    return PocketSaga.mountPage(target, view.element, () => view.destroy);
  } };
})();
