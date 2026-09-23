/* One editor for selected-media and choose-media entry points. */
(() => {
  const { node, Action, Icon, Artwork, AmbientArtwork, PhoneFrame, SeparatedMeta } = PocketSaga;
  function SearchKeyboard(input) {
    const keyboard = node('div', 'picker-keyboard');
    keyboard.setAttribute('role', 'group');
    keyboard.setAttribute('aria-label', 'On-screen keyboard');
    let shifted = false, symbols = false;
    const edit = value => {
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      const from = value === 'Backspace' && start === end ? Math.max(0, start - 1) : start;
      input.setRangeText(value === 'Backspace' ? '' : value, from, end, 'end');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus({ preventScroll: true });
    };
    const key = (label, action, extra = '') => {
      const button = Action({ label: label === '⌫' ? 'Backspace' : label === '⇧' ? 'Shift' : label, className: `picker-key ${extra}`, children: label, onClick: action });
      button.addEventListener('pointerdown', event => event.preventDefault());
      return button;
    };
    const render = () => {
      const rows = symbols ? ['1234567890', '-/:;()$&@"', '.,?!'] : ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
      keyboard.replaceChildren(...rows.map((row, index) => {
        const letters = [...row].map(letter => key(shifted ? letter.toUpperCase() : letter, () => {
          edit(shifted ? letter.toUpperCase() : letter);
          if (shifted) { shifted = false; render(); }
        }));
        if (index === 2) {
          letters.unshift(key('⇧', () => { shifted = !shifted; render(); }, shifted ? 'is-selected' : ''));
          letters.push(key('⌫', () => edit('Backspace')));
        }
        return node('div', `picker-key-row picker-key-row-${index}`, letters);
      }), node('div', 'picker-key-row', [key(symbols ? 'ABC' : '123', () => { symbols = !symbols; render(); }, 'picker-key-mode'), key('space', () => edit(' '), 'picker-key-space'), key('Search', () => { input.dispatchEvent(new Event('input', { bubbles: true })); input.focus({ preventScroll: true }); }, 'picker-key-search')]));
    };
    render();
    return keyboard;
  }
  function ChoiceSheet(page, { title, choices, selectedId, onSelect, searchable = false, layout = 'list' }) {
    const screen = page.querySelector('.phone-screen');
    const opener = document.activeElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const overlay = node('div', 'create-picker-overlay');
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', title);
    const scrim = node('div', 'create-picker-scrim');
    const results = node('div', `create-picker-results${layout === 'wrap' ? ' create-picker-wrap' : ''}`);
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
      if (keyboard) animation.to(keyboard, { y: 40, opacity: 0, duration: .28, ease: 'power2.inOut' }, 0);
    };
    const mediaSheet = searchable && layout === 'wrap';
    if (mediaSheet) search.inputMode = matchMedia('(max-width: 600px)').matches ? 'search' : 'none';
    const keyboard = mediaSheet ? SearchKeyboard(search) : null;
    overlay.classList.toggle('has-system-keyboard', mediaSheet);
    const searchSurface = mediaSheet ? node('div', 'media-search-surface glass-surface', [Icon('search'), search]) : null;
    const sheet = mediaSheet
      ? node('section', 'media-title-floating', [results, searchSurface])
      : node('section', 'create-picker-sheet glass-surface', [node('div', 'create-picker-handle'), node('header', 'create-picker-header', [node('h2', '', title)]), searchable && search, results]);
    sheet.tabIndex = -1;
    const render = () => {
      const query = search.value.toLowerCase().trim();
      const filtered = choices.filter(item => (!query && layout === 'wrap' ? Boolean(item.watchedLabel) || item.id === selectedId : item.title.toLowerCase().includes(query)));
      if (mediaSheet && !query) filtered.sort((a, b) => Number(b.id === 'dark') - Number(a.id === 'dark'));
      const options = filtered.map(item => {
        const option = Action({ label: item.title, className: 'create-picker-option glass-surface tap-feedback', children: [item.artwork && Artwork(item.artwork, 'create-picker-artwork'), node('span', 'create-picker-copy', [node('span', 'create-picker-name', item.title), item.subtitle && SeparatedMeta(item.subtitle, 'create-picker-subtitle')]), layout !== 'wrap' && item.watchedLabel && node('span', 'create-picker-watched', item.watchedLabel), item.id === selectedId && Icon('check')], onClick: () => { onSelect(item); close(); } });
        option.setAttribute('aria-pressed', String(item.id === selectedId));
        return option;
      });
      if (mediaSheet && options.length) {
        const rows = [];
        const firstCount = options.length % 2 || 2;
        rows.push(node('div', 'create-suggestion-row', options.slice(0, firstCount)));
        for (let i = firstCount; i < options.length; i += 2) rows.push(node('div', 'create-suggestion-row', options.slice(i, i + 2)));
        results.replaceChildren(...rows);
      } else results.replaceChildren(...(options.length ? options : [node('p', 'empty-feed', 'No matching titles.')]));
    };
    search.addEventListener('input', render); render();
    background.forEach(([element]) => { element.inert = true; });
    overlay.append(scrim, sheet);
    if (keyboard) overlay.append(keyboard);
    screen.append(overlay);
    scrim.addEventListener('click', close);
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        const focusable = [...overlay.querySelectorAll('button:not(:disabled),input')];
        if (!focusable.length) { event.preventDefault(); sheet.focus(); return; }
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    (searchable ? search : sheet.querySelector('button') || sheet).focus({ preventScroll: true });
    if (!reduced.matches) animation = gsap.timeline().from(scrim, { opacity: 0, duration: .24 }, 0).from(sheet, { y: 28, opacity: 0, duration: .38, ease: 'power3.out' }, 0);
    if (!reduced.matches && keyboard) animation.from(keyboard, { y: 60, opacity: 0, duration: .38, ease: 'power3.out' }, 0);
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
      mediaButton.replaceChildren(...(media
        ? [Artwork(media.artwork, 'create-media-artwork'), node('span', 'create-media-copy', [node('span', 'create-media-name', media.title), SeparatedMeta(media.selectionLabel || media.scope, 'create-media-subtitle')])]
        : [Icon('screen-play'), node('span', 'create-media-copy', [node('span', 'create-media-name', 'Choose a title'), node('span', 'create-media-subtitle', 'Search movies and series')]), Icon('chevron-down')]));
      mediaButton.classList.toggle('has-selection', Boolean(media));
      clearMediaButton.hidden = !media;
      mediaButton.setAttribute('aria-label', media ? `Change title: ${media.title}` : 'Choose a title');
      groupButton.replaceChildren(Icon('users'), node('span', 'create-destination-copy', [node('span', '', group?.name || 'Choose a community')]), Icon('chevron-down'));
      groupButton.setAttribute('aria-label', group ? `Change community: ${group.name}` : 'Choose a community');
      publish.disabled = submitted || !media || !group || !headline.value.trim();
    };
    const changeMedia = next => {
      media = next;
      if (group && !suggestions().includes(group.id)) group = null;
      const atmosphere = page.querySelector('.atmosphere');
      PocketSagaMedia.apply(atmosphere, media?.artwork);
      const old = [...atmosphere.querySelectorAll('.atmosphere-image')];
      if (media) {
        const image = AmbientArtwork(media.artwork, 'atmosphere-image');
        atmosphere.insertBefore(image, atmosphere.querySelector('.atmosphere-veil'));
        gsap.fromTo(image, { opacity: 0 }, { opacity: .58, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .35 });
      }
      old.forEach(image => gsap.to(image, { opacity: 0, duration: .35, onComplete: () => image.remove() }));
      refresh();
    };
    const openMedia = () => {
      picker?.destroy();
      picker = ChoiceSheet(page, { title: 'Choose a title', choices: data.media.map(item => ({ ...item, subtitle: item.episode != null ? `S${item.season} · Episode ${item.episode}` : item.selectionLabel || item.scope })), selectedId: media?.id, searchable: true, layout: 'wrap', onSelect: changeMedia });
    };
    const openCommunity = () => {
      picker?.destroy();
      const recommended = suggestions();
      const choices = [...data.groups].sort((a,b) => Number(recommended.includes(b.id)) - Number(recommended.includes(a.id))).map(item => ({ ...item, title: item.name, subtitle: `${item.members} members${recommended.includes(item.id) ? ' · Recommended' : ''}` }));
      picker = ChoiceSheet(page, { title: 'Select community', choices, selectedId: group?.id, onSelect: next => { group = next; refresh(); } });
    };
    const mediaButton = Action({ label: 'Choose a title', className: 'create-media-banner glass-surface tap-feedback', children: '', onClick: openMedia });
    const clearMediaButton = Action({ label: 'Remove selected title', icon: 'x', className: 'create-media-clear tap-feedback', children: '', onClick: () => {
      changeMedia(null);
      mediaButton.focus({ preventScroll: true });
    } });
    const mediaSelection = node('div', 'create-media-selection', [mediaButton, clearMediaButton]);
    const groupButton = Action({ label: 'Choose a community', className: 'create-destination glass-surface tap-feedback', children: '', onClick: openCommunity });
    const publish = Action({ label: 'Post', className: 'create-publish glass-choice is-selected tap-feedback', onClick: () => form.requestSubmit() });
    const tools = node('div', 'create-editor-tools', [['Clip', 'clapperboard'], ['Scene', 'image']].map(([label, icon]) => Action({ label, icon, className: 'create-tool glass-surface tap-feedback', onClick: () => {
      if (label === 'Clip' && !media) { openMedia(); return; }
      toast(`${label === 'Clip' ? 'Clip selection' : 'Scene selection'} will be available in a later pass.`);
      emit('enrichment', { kind: label.toLowerCase(), media });
    } })));
    const separator = node('div', 'create-editor-separator');
    separator.setAttribute('aria-hidden', 'true');
    const form = node('form', 'create-writing-surface glass-surface', [headline, separator, body, tools]);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (publish.disabled) return;
      submitted = true; refresh();
      emit('publish', { post: PocketSagaData.publish({ mediaId: media.id, id: `local-${Date.now()}`, group: group.id, context: media.title, artwork: media.artwork, title: headline.value.trim(), body: body.value.trim(), author: data.viewer, time: 'Just now', type: 'Thought', likes: 0, comments: 0 }) });
      toast('Posted to this preview');
    });
    headline.addEventListener('input', () => { headline.style.height = 'auto'; headline.style.height = `${Math.min(160, Math.max(32, headline.scrollHeight))}px`; refresh(); });
    const scroller = node('div', 'feed-scroll create-post-scroll', [mediaSelection, form]);
    scroller.tabIndex = 0; scroller.setAttribute('aria-label', 'New post editor');
    page = PhoneFrame({ device: data.device, background: media?.artwork, content: scroller });
    page.classList.add('create-post-page');
    const header = node('nav', 'page-navigation create-post-navigation', [Action({ label: 'Close new post', icon: 'x', className: 'round-action', children: '', onClick: () => emit('back') }), node('h1', 'screen-navigation-title', 'New post')]);
    page.querySelector('.phone-screen').append(header, node('footer', 'create-publish-bar', [groupButton, publish]), notice);
    refresh();
    return { element: page, destroy() { picker?.destroy(); clearTimeout(toastTimer); gsap.killTweensOf(page.querySelectorAll('.atmosphere-image')); } };
  }
  window.PocketSagaCreatePost = { ChoiceSheet, CreatePostPage, mount(target, data, initialMedia, handlers) {
    const view = CreatePostPage(data, initialMedia, handlers);
    return PocketSaga.mountPage(target, view.element, () => view.destroy);
  } };
})();
