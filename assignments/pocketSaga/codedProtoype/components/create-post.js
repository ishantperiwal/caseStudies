/* One editor for selected-media and choose-media entry points. */
(() => {
  const { node, Action, Icon, Artwork, AmbientArtwork, PhoneFrame, ProgressiveBlur, SeparatedMeta } = PocketSaga;
  const mediaSubtitle = item => item.episode != null ? `S${item.season} · Episode ${item.episode}` : item.selectionLabel || item.scope;
  const postTypes = [
    { id: 'Thought', title: 'Thought', subtitle: 'A reaction or observation' },
    { id: 'Theory', title: 'Theory', subtitle: 'An interpretation or prediction' },
    { id: 'Question', title: 'Question', subtitle: 'Something to ask fellow viewers' },
    { id: 'Should I watch?', title: 'Should I watch?', subtitle: 'Ask for spoiler-free opinions before watching' },
    { id: 'Review', title: 'Review', subtitle: 'Your considered take on a title' }
  ];
  const choiceContent = item => [item.artwork && Artwork(item.artwork, 'create-picker-artwork'), node('span', 'create-picker-copy', [node('span', 'create-picker-name', item.title), item.subtitle && SeparatedMeta(item.subtitle, 'create-picker-subtitle')])];
  function SearchKeyboard(inputSource, { actionLabel = 'Search', onAction } = {}) {
    const keyboard = node('div', 'picker-keyboard');
    keyboard.setAttribute('role', 'group');
    keyboard.setAttribute('aria-label', 'On-screen keyboard');
    let shifted = false, symbols = false;
    const currentInput = () => typeof inputSource === 'function' ? inputSource() : inputSource;
    const edit = value => {
      const input = currentInput();
      if (!input) return;
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
      }), node('div', 'picker-key-row', [key(symbols ? 'ABC' : '123', () => { symbols = !symbols; render(); }, 'picker-key-mode'), key('space', () => edit(' '), 'picker-key-space'), key(actionLabel, () => {
        const input = currentInput();
        if (onAction) onAction(input);
        else if (input) {
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus({ preventScroll: true });
        }
      }, 'picker-key-search')]));
    };
    render();
    return keyboard;
  }
  function ChoiceSheet(page, { title, choices, selectedId, onSelect, onReveal, searchable = false, layout = 'list', emptyText = 'No matching titles.', accentSelection = false, groupChooser = false }) {
    const screen = page.querySelector('.phone-screen');
    const opener = document.activeElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const overlay = node('div', 'create-picker-overlay');
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', title);
    const scrim = node('div', 'create-picker-scrim');
    const results = node('div', `create-picker-results${layout === 'wrap' ? ' create-picker-wrap' : ''}`);
    const search = node('input', 'create-picker-search');
    search.type = 'search'; search.placeholder = groupChooser ? 'Search your groups' : 'Search movies and series'; search.setAttribute('aria-label', search.placeholder);
    let animation, overflowObserver, closed = false;
    const background = [...screen.children].map(element => [element, element.inert]);
    const restore = () => { overflowObserver?.disconnect(); overlay.remove(); background.forEach(([element, inert]) => { element.inert = inert; }); opener?.focus({ preventScroll: true }); };
    const close = () => {
      if (closed) return;
      closed = true; animation?.kill();
      if (reduced.matches) { restore(); onReveal?.(); return; }
      animation = gsap.timeline({ onComplete: restore })
        .to(sheet, { y: 24, opacity: 0, duration: .28, ease: 'power2.inOut' }, 0)
        .to(scrim, { opacity: 0, duration: .16 }, .12)
        .add(() => onReveal?.(), .08);
      if (keyboard) animation.to(keyboard, { y: 40, opacity: 0, duration: .28, ease: 'power2.inOut' }, 0);
    };
    const floatingSheet = searchable && layout === 'wrap';
    if (floatingSheet) search.inputMode = matchMedia('(max-width: 600px)').matches ? 'search' : 'none';
    const keyboard = floatingSheet ? SearchKeyboard(search) : null;
    overlay.classList.toggle('has-system-keyboard', floatingSheet);
    const searchSurface = floatingSheet ? node('div', 'media-search-surface glass-surface', [Icon('search'), search]) : null;
    // This pill demonstrates the future full group browser; it has no destination in the prototype.
    const moreButton = groupChooser ? Action({ label: 'More groups', className: 'create-picker-more glass-surface tap-feedback', children: '' }) : null;
    const bottomBlur = floatingSheet ? null : ProgressiveBlur('bottom');
    if (bottomBlur) {
      bottomBlur.classList.add('create-picker-bottom-blur');
      bottomBlur.hidden = true;
    }
    const sheet = floatingSheet
      ? node('section', `media-title-floating${groupChooser ? ' group-picker-floating' : ''}`, [results, searchSurface])
      : node('section', 'create-picker-sheet glass-surface', [node('div', 'create-picker-handle'), node('header', 'create-picker-header', [node('h2', '', title)]), searchable && search, results, bottomBlur]);
    sheet.classList.toggle('has-accent-selection', accentSelection);
    sheet.tabIndex = -1;
    const render = () => {
      const query = search.value.toLowerCase().trim();
      const filtered = choices.filter(item => query ? item.title.toLowerCase().includes(query) : groupChooser || !floatingSheet || Boolean(item.watchedLabel) || item.id === selectedId);
      const visible = groupChooser ? filtered.slice(0, 4) : filtered;
      if (floatingSheet && !groupChooser && !query) filtered.sort((a, b) => Number(b.id === 'dark') - Number(a.id === 'dark'));
      const options = visible.map(item => {
        const option = Action({ label: [item.title, item.subtitle].filter(Boolean).join(', '), className: 'create-picker-option glass-surface tap-feedback', children: [...choiceContent(item), layout !== 'wrap' && item.watchedLabel && node('span', 'create-picker-watched', item.watchedLabel), item.id === selectedId && Icon('check')], onClick: () => { onSelect(item); close(); } });
        option.setAttribute('aria-pressed', String(item.id === selectedId));
        return option;
      });
      if (moreButton && filtered.length > 4) {
        const remaining = filtered.length - 4;
        const label = query ? `Show ${remaining} more` : 'Show 35 more';
        moreButton.textContent = label;
        moreButton.setAttribute('aria-label', `${label} groups`);
        options.push(moreButton);
      }
      if (groupChooser && options.length) results.replaceChildren(...options);
      else if (floatingSheet && options.length) {
        const rows = [];
        const firstCount = options.length % 2 || 2;
        rows.push(node('div', 'create-suggestion-row', options.slice(0, firstCount)));
        for (let i = firstCount; i < options.length; i += 2) rows.push(node('div', 'create-suggestion-row', options.slice(i, i + 2)));
        results.replaceChildren(...rows);
      } else results.replaceChildren(...(options.length ? options : [node('p', 'empty-feed', query && groupChooser ? 'No matching groups.' : emptyText)]));
    };
    search.addEventListener('input', render); render();
    background.forEach(([element]) => { element.inert = true; });
    overlay.append(scrim, sheet);
    if (keyboard) overlay.append(keyboard);
    screen.append(overlay);
    if (bottomBlur) {
      const updateOverflow = () => { bottomBlur.hidden = results.scrollHeight <= results.clientHeight + 1; };
      overflowObserver = new ResizeObserver(updateOverflow);
      overflowObserver.observe(results);
      overflowObserver.observe(sheet);
      updateOverflow();
    }
    scrim.addEventListener('click', close);
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        const focusable = [...overlay.querySelectorAll('button:not(:disabled),input')].filter(element => element.getClientRects().length);
        if (!focusable.length) { event.preventDefault(); sheet.focus(); return; }
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    (searchable ? search : sheet.querySelector('button') || sheet).focus({ preventScroll: true });
    if (!reduced.matches) animation = gsap.timeline().from(scrim, { opacity: 0, duration: .24 }, 0).from(sheet, { y: 28, opacity: 0, duration: .38, ease: 'power3.out' }, 0);
    if (!reduced.matches && keyboard) animation.from(keyboard, { y: 60, opacity: 0, duration: .38, ease: 'power3.out' }, 0);
    return { destroy() { animation?.kill(); overflowObserver?.disconnect(); overlay.remove(); background.forEach(([element, inert]) => { element.inert = inert; }); }, get closed() { return closed; } };
  }
  function CreatePostPage(data, initialMedia = null, handlers = {}, initialGroupId = null) {
    let page, picker, toastTimer, selectionMotion, submitted = false;
    let writingField = null;
    let writingKeyboard;
    const closeWritingFocus = () => {
      if (!page?.classList.contains('is-writing-focused')) return;
      if (document.activeElement === headline || document.activeElement === body) document.activeElement.blur();
      page.classList.remove('is-writing-focused');
      writingKeyboard.inert = true;
      writingKeyboard.setAttribute('aria-hidden', 'true');
      writingField = null;
    };
    const updatePulses = new Map();
    let media = data.media.find(item => item.id === initialMedia?.id) || null;
    let group = data.groups.find(item => item.id === initialGroupId && item.mediaId === media?.id) || null;
    let postType = postTypes[0];
    let typeSelection;
    let highlightedTypeId = postType.id;
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
      if (!selectionMotion) mediaButton.replaceChildren(...(media
        ? [Artwork(media.artwork, 'create-media-artwork'), node('span', 'create-media-copy', [node('span', 'create-media-name', media.title), SeparatedMeta(media.selectionLabel || media.scope, 'create-media-subtitle')])]
        : [node('span', 'create-media-copy', [node('span', 'create-media-heading', [node('span', 'create-media-name', 'Choose a title'), Icon('chevron-down')]), node('span', 'create-media-subtitle', 'Search movies and series')])]));
      mediaButton.classList.toggle('has-selection', Boolean(media));
      changeMediaButton.hidden = !media;
      mediaRail.classList.toggle('has-selection', Boolean(media));
      quickChoices.forEach(button => { button.hidden = Boolean(media); });
      if (media) mediaRail.scrollLeft = 0;
      mediaButton.setAttribute('aria-label', media ? `Change title: ${media.title}` : 'Choose a title');
      groupButton.replaceChildren(group?.artwork ? Artwork(group.artwork, 'create-destination-artwork') : Icon('users'), node('span', 'create-destination-copy', [node('span', '', group?.name || 'Choose a group')]), Icon('chevron-down'));
      groupButton.setAttribute('aria-label', group ? `Change group: ${group.name}` : 'Choose a group');
      typeButton.replaceChildren(node('span', '', postType.title), Icon('chevron-down'));
      typeButton.setAttribute('aria-label', `Post type: ${postType.title}`);
      typeOptions.forEach(button => {
        const selected = button.dataset.postType === postType.id;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      if (typeSelection && highlightedTypeId !== postType.id) {
        typeSelection.move(typeOptions.find(button => button.dataset.postType === postType.id), !page.classList.contains('is-writing-focused'));
        highlightedTypeId = postType.id;
      }
      publish.disabled = submitted || !media || !group || !headline.value.trim();
      publish.classList.toggle('tap-feedback', !publish.disabled);
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
    const selectSuggestion = (item, source) => {
      if (selectionMotion) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        changeMedia(item);
        mediaButton.focus({ preventScroll: true });
        return;
      }
      const screen = page.querySelector('.phone-screen');
      const scale = screen.getBoundingClientRect().width / screen.offsetWidth;
      const start = source.getBoundingClientRect();
      const pressedOpacity = getComputedStyle(source, '::before').opacity;
      const sourceFill = getComputedStyle(source).backgroundColor;
      // Lay out the real selected control now, then animate it from the tapped
      // pill's geometry. It stays mounted and opaque through the final frame.
      changeMedia(item);
      const end = mediaSelection.getBoundingClientRect();
      const artwork = mediaButton.querySelector('.create-media-artwork');
      const title = mediaButton.querySelector('.create-media-name');
      const plusIcon = changeMediaButton.querySelector('.icon-plus');
      const changeIcon = changeMediaButton.querySelector('.icon-refresh-cw');
      const finalFill = getComputedStyle(mediaButton).backgroundColor;
      const finalInset = getComputedStyle(mediaButton).paddingLeft;
      const sourceInset = getComputedStyle(source).paddingLeft;
      mediaRail.inert = true;
      mediaButton.classList.add('is-expanding');
      gsap.set(mediaSelection, {
        flexBasis: 'auto', width: start.width / scale,
        x: (start.left - end.left) / scale, y: (start.top - end.top) / scale
      });
      gsap.set(mediaButton, { '--flight-press': pressedOpacity, backgroundColor: sourceFill, paddingLeft: sourceInset });
      gsap.set(artwork, { width: 34, height: 46 });
      // Scale the glyphs without changing their line box on every frame.
      // The final text layout therefore stays stable while the banner grows.
      gsap.set(title, { scaleX: .875, transformOrigin: 'left center' });
      gsap.set(plusIcon, { display: 'block', opacity: 1, scale: 1, rotation: 0 });
      gsap.set(changeIcon, { opacity: 0, scale: .8, filter: 'blur(3px)' });
      selectionMotion = gsap.timeline({ onComplete: () => {
        // Only release geometry overrides; no DOM replacement or opacity handoff.
        gsap.set([mediaSelection, artwork, title, plusIcon, changeIcon], { clearProps: 'all' });
        gsap.set(mediaButton, { clearProps: 'backgroundColor,--flight-press,paddingLeft' });
        mediaButton.classList.remove('is-expanding');
        mediaRail.inert = false;
        selectionMotion = null;
        mediaButton.focus({ preventScroll: true });
      } })
        .to(mediaSelection, { x: 0, y: 0, width: end.width / scale, duration: .42, ease: 'power3.out' }, 0)
        .to(mediaButton, { '--flight-press': 0, backgroundColor: finalFill, duration: .30, ease: 'power2.out' }, 0)
        .to(mediaButton, { paddingLeft: finalInset, duration: .42, ease: 'power3.out' }, 0)
        .to(artwork, { width: 36, height: 50, duration: .32, ease: 'power3.out' }, 0)
        .to(title, { scaleX: 1, duration: .32, ease: 'power3.out' }, 0)
        .to(plusIcon, { opacity: 0, scale: .8, rotation: 45, duration: .18, ease: 'power2.in' }, .08)
        .to(changeIcon, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .22, ease: 'power2.out' }, .14);
    };
    const revealChangedValues = controls => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      controls.forEach((control, index) => {
        control.querySelector('.create-update-sweep')?.remove();
        const light = node('span', 'create-update-sweep');
        light.setAttribute('aria-hidden', 'true');
        light.style.setProperty('--sweep-delay', `${index * 90}ms`);
        light.addEventListener('animationend', () => light.remove(), { once: true });
        control.append(light);
        const target = control === mediaButton ? mediaSelection : control;
        updatePulses.get(target)?.cancel();
        const pulse = target.animate([
          { scale: '1', offset: 0 },
          { scale: '1.012', offset: .36 },
          { scale: '1', offset: 1 }
        ], { duration: 1100, delay: index * 90, easing: 'cubic-bezier(.4,0,.2,1)' });
        updatePulses.set(target, pulse);
        pulse.onfinish = () => { if (updatePulses.get(target) === pulse) updatePulses.delete(target); };
      });
    };
    const openMedia = () => {
      closeWritingFocus();
      picker?.destroy();
      let changedControls = [];
      picker = ChoiceSheet(page, {
        title: 'Choose a title', choices: data.media.map(item => ({ ...item, subtitle: mediaSubtitle(item) })), selectedId: media?.id, searchable: true, layout: 'wrap',
        onSelect: next => {
          const previousMedia = media?.id, previousGroup = group?.id, wasDisabled = publish.disabled;
          changeMedia(next);
          changedControls = [previousMedia !== media?.id && mediaButton, previousGroup !== group?.id && groupButton, wasDisabled !== publish.disabled && publish].filter(Boolean);
        },
        onReveal: () => revealChangedValues(changedControls)
      });
    };
    const openCommunity = () => {
      closeWritingFocus();
      picker?.destroy();
      const recommended = suggestions();
      let recent = [];
      try { recent = JSON.parse(localStorage.getItem('pocketsaga-recent-post-groups') || '[]'); } catch {}
      if (!Array.isArray(recent)) recent = [];
      const rank = item => item.id === group?.id ? 0 : recommended.includes(item.id) ? 1 : recent.includes(item.id) ? 2 : 3;
      const choices = data.groups.filter(item => item.joined || item.id === group?.id).sort((a, b) => {
        const priority = rank(a) - rank(b);
        return priority || (rank(a) === 2 ? recent.indexOf(a.id) - recent.indexOf(b.id) : 0);
      }).map(item => ({ ...item, title: item.name, subtitle: `${item.members} members${recommended.includes(item.id) ? ' · Recommended' : ''}` }));
      let changedControls = [];
      picker = ChoiceSheet(page, { title: 'Select a group', choices, selectedId: group?.id, searchable: true, layout: 'wrap', groupChooser: true, emptyText: 'No groups joined yet.',
        onSelect: next => {
          const previousGroup = group?.id, wasDisabled = publish.disabled;
          group = next;
          try { localStorage.setItem('pocketsaga-recent-post-groups', JSON.stringify([next.id, ...recent.filter(id => id !== next.id)].slice(0, 5))); } catch {}
          refresh();
          changedControls = [previousGroup !== group?.id && groupButton, wasDisabled !== publish.disabled && publish].filter(Boolean);
        },
        onReveal: () => revealChangedValues(changedControls)
      });
    };
    const openPostType = () => {
      closeWritingFocus();
      picker?.destroy();
      let changedControls = [];
      picker = ChoiceSheet(page, {
        title: 'Post type', choices: postTypes, selectedId: postType.id, accentSelection: true,
        onSelect: next => {
          const previousType = postType.id;
          postType = next;
          refresh();
          changedControls = previousType !== postType.id ? [typeButton] : [];
        },
        onReveal: () => revealChangedValues(changedControls)
      });
    };
    const mediaButton = Action({ label: 'Choose a title', className: 'create-media-banner glass-surface tap-feedback', children: '', onClick: openMedia });
    const changeMediaButton = Action({
      label: 'Choose a different title',
      className: 'create-media-change tap-feedback',
      children: [Icon('plus'), Icon('refresh-cw')],
      onClick: openMedia
    });
    const mediaSelection = node('div', 'create-media-selection', [mediaButton, changeMediaButton]);
    const quickChoices = data.media.filter(item => item.watchedLabel).sort((a, b) => Number(b.id === 'dark') - Number(a.id === 'dark')).map(item => Action({
      label: `Select title: ${item.title}`,
      className: 'create-picker-option create-quick-title glass-surface tap-feedback',
      children: [...choiceContent({ ...item, subtitle: mediaSubtitle(item) }), Icon('plus')],
      onClick: event => selectSuggestion(item, event.currentTarget)
    }));
    const mediaRail = node('div', 'create-media-rail', [mediaSelection, ...quickChoices]);
    mediaRail.setAttribute('role', 'group');
    mediaRail.setAttribute('aria-label', 'Choose a title or browse suggestions');
    const groupButton = Action({ label: 'Choose a group', className: 'create-destination dense-neutral-surface glass-surface tap-feedback', children: '', onClick: openCommunity });
    const typeButton = Action({ label: 'Post type: Thought', className: 'create-post-type dense-neutral-surface glass-surface tap-feedback', children: '', onClick: openPostType });
    const typeOptions = postTypes.map(item => {
      const button = Action({ label: item.title, className: `create-post-type-option glass-choice tap-feedback${item.id === postType.id ? ' is-selected' : ''}`, children: node('span', '', item.title), onClick: () => {
        postType = item;
        refresh();
        writingField?.focus({ preventScroll: true });
      } });
      button.dataset.postType = item.id;
      button.setAttribute('aria-pressed', String(item.id === postType.id));
      return button;
    });
    const typeTrack = node('div', 'create-post-type-track', typeOptions);
    const typeRail = node('div', 'create-post-type-rail', typeTrack);
    typeRail.setAttribute('role', 'group');
    typeRail.setAttribute('aria-label', 'Post type');
    const publish = Action({ label: 'Post', className: 'create-publish glass-choice is-selected tap-feedback', onClick: () => form.requestSubmit() });
    const tools = node('div', 'create-editor-tools', [['Add a clip', 'clapperboard', 'clip'], ['Add a shot', 'image', 'scene']].map(([label, icon, kind]) => Action({ label, icon, className: 'create-tool glass-surface tap-feedback', onClick: () => {
      if (kind === 'clip' && !media) { openMedia(); return; }
      toast(`${kind === 'clip' ? 'Clip' : 'Shot'} selection will be available in a later pass.`);
      emit('enrichment', { kind, media });
    } })));
    const separator = node('div', 'create-editor-separator');
    separator.setAttribute('aria-hidden', 'true');
    const form = node('form', 'create-writing-surface glass-surface', [typeButton, typeRail, headline, separator, body, tools]);
    const syncWritingOverflow = () => form.classList.toggle('is-overflowing', form.scrollHeight > form.clientHeight + 1);
    const writingResize = new ResizeObserver(syncWritingOverflow);
    writingResize.observe(form);
    writingResize.observe(headline);
    writingResize.observe(tools);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (publish.disabled) return;
      submitted = true; refresh();
      emit('publish', { post: PocketSagaData.publish({ mediaId: media.id, id: `local-${Date.now()}`, group: group.id, context: media.title, artwork: media.artwork, title: headline.value.trim(), body: body.value.trim(), author: data.viewer, time: 'Just now', type: postType.id, likes: 0, comments: 0 }) });
      toast('Posted to this preview');
    });
    headline.addEventListener('input', () => {
      headline.style.height = 'auto';
      const contentHeight = headline.scrollHeight;
      headline.style.height = `${Math.min(160, Math.max(32, contentHeight))}px`;
      headline.classList.toggle('is-overflowing', contentHeight > 160);
      syncWritingOverflow();
      refresh();
    });
    const scroller = node('div', 'feed-scroll create-post-scroll', [mediaRail, form]);
    scroller.tabIndex = 0; scroller.setAttribute('aria-label', 'New post editor');
    page = PhoneFrame({ device: data.device, background: media?.artwork, content: scroller });
    page.classList.add('create-post-page');
    const header = node('nav', 'page-navigation create-post-navigation', [Action({ label: 'Close new post', icon: 'x', className: 'round-action', children: '', onClick: () => emit('back') }), node('h1', 'screen-navigation-title', 'New post')]);
    const publishBar = node('footer', 'create-publish-bar', [groupButton, publish]);
    writingKeyboard = SearchKeyboard(() => writingField, { actionLabel: 'Done', onAction: closeWritingFocus });
    writingKeyboard.classList.add('create-writing-keyboard');
    writingKeyboard.inert = true;
    writingKeyboard.setAttribute('aria-hidden', 'true');
    const screen = page.querySelector('.phone-screen');
    screen.append(header, publishBar, writingKeyboard, notice);
    typeSelection = PocketSagaMotion.selectionHighlight(typeTrack, typeOptions);
    const focusWriting = event => {
      writingField = event.currentTarget;
      if (page.classList.contains('is-writing-focused')) return;
      page.style.setProperty('--writing-keyboard-height', `${writingKeyboard.offsetHeight}px`);
      writingKeyboard.inert = false;
      writingKeyboard.removeAttribute('aria-hidden');
      page.classList.add('is-writing-focused');
      const selectedType = typeOptions.find(button => button.dataset.postType === postType.id);
      typeRail.scrollLeft = Math.max(0, selectedType.offsetLeft - (typeRail.clientWidth - selectedType.offsetWidth) / 2);
      typeSelection.move(selectedType, true);
    };
    const leaveWriting = () => {
      requestAnimationFrame(() => {
        if (document.activeElement !== headline && document.activeElement !== body && !typeRail.contains(document.activeElement)) closeWritingFocus();
      });
    };
    [headline, body].forEach(field => {
      field.addEventListener('focus', focusWriting);
      field.addEventListener('blur', leaveWriting);
    });
    const dismissOutside = event => {
      if (page.classList.contains('is-writing-focused') && !form.contains(event.target) && !writingKeyboard.contains(event.target)) closeWritingFocus();
    };
    const dismissEscape = event => {
      if (event.key === 'Escape' && page.classList.contains('is-writing-focused')) {
        event.stopPropagation();
        closeWritingFocus();
      }
    };
    screen.addEventListener('pointerdown', dismissOutside, true);
    screen.addEventListener('keydown', dismissEscape);
    refresh();
    return { element: page, destroy() { screen.removeEventListener('pointerdown', dismissOutside, true); screen.removeEventListener('keydown', dismissEscape); writingResize.disconnect(); typeSelection.destroy(); updatePulses.forEach(pulse => pulse.cancel()); updatePulses.clear(); selectionMotion?.kill(); picker?.destroy(); clearTimeout(toastTimer); gsap.killTweensOf(page.querySelectorAll('.atmosphere-image')); } };
  }
  window.PocketSagaCreatePost = { ChoiceSheet, CreatePostPage, mount(target, data, initialMedia, handlers) {
    const view = CreatePostPage(data, initialMedia, handlers);
    return PocketSaga.mountPage(target, view.element, () => view.destroy);
  } };
})();
