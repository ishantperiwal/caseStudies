(() => {
  const layers = [...document.querySelectorAll('.wallpaper')];
  const wallpapers = [...window.pocketSagaData.media.filter((item, index, items) => items.findIndex(other => other.artwork === item.artwork) === index).map(item => ({ title: item.title, artwork: item.artwork }))];
  const treatment = window.PocketSagaMedia;
  layers.forEach(element => {
    element.innerHTML = '<img class="ambient-color-base" alt=""><img class="ambient-poster-texture" alt="">';
    element.style.setProperty('--texture-opacity', treatment.ambience.textureOpacity);
    element.style.setProperty('--texture-saturation', treatment.ambience.textureSaturation);
    element.style.setProperty('--texture-blur', `${treatment.ambience.textureBlur}px`);
  });
  let current = 0, layer = 0, view = 'material', step = 4, materialStep = 4, gradientOnly = false;
  const descriptions = [
    'The original artwork supplies the atmosphere.',
    '28px blur removes competing detail.',
    'Lower saturation and brightness soften the texture.',
    'A muted palette carries the color; artwork becomes a 22% texture.',
    '58% atmosphere over off-black, with extra darkening for bright artwork.'
  ];
  const materialDescriptions = [
    'Neutral fill · 4% white',
    'Fill variants · neutral mint 4% · dense neutral 76% · highlight mint 14% · medium mint 10% · strong mint 25%',
    'Directional wash and backdrop blur · medium mint adds a localized reflection',
    '1px directional rim · medium mint adds a brighter edge and inset depth',
    'Press a sample · compression and a soft light response'
  ];
  function renderStage() {
    document.querySelector('#specimens').dataset.materialStep = String(materialStep);
    document.querySelector('#material-description').textContent = materialDescriptions[materialStep] || 'Select a step';
    document.querySelectorAll('button[data-material-step]').forEach(button => button.setAttribute('aria-pressed', String(Boolean(button.closest('.steps').dataset.started) && Number(button.dataset.materialStep) === materialStep)));
    document.body.dataset.view = view;
    document.body.dataset.step = String(step);
    document.body.dataset.gradientOnly = String(view === 'background' && step === 3 && gradientOnly);
    document.querySelector('#step-description').textContent = descriptions[step] || 'Select a step';
    document.querySelectorAll('button[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Boolean(button.closest('.steps').dataset.started) && Number(button.dataset.step) === step)));
    const paletteButton = document.querySelector('button[data-step="3"]');
    paletteButton.setAttribute('aria-description', gradientOnly && step === 3 ? 'Showing the extracted gradient only. Command-click again to restore the poster texture.' : 'Command-click to show the extracted gradient without the poster texture.');
    paletteButton.title = gradientOnly && step === 3 ? 'Command-click to restore the full Palette view' : 'Command-click to view only the extracted gradient';
    layers.forEach((element, index) => element.style.opacity = (view === 'material' || view === 'background') && index === layer && wallpapers[current].artwork && (view !== 'background' || step >= 0) ? (view !== 'background' || step === 4 ? '.58' : '1') : '0');
  }
  function show(index) {
    current = (index + wallpapers.length) % wallpapers.length;
    const item = wallpapers[current];
    const next = 1 - layer;
    if (item.artwork) {
      layers[next].querySelector('.ambient-color-base').src = treatment.ambientSource(item.artwork);
      layers[next].querySelector('.ambient-poster-texture').src = item.artwork;
      treatment.apply(layers[next], item.artwork);
    }
    layers[next].style.opacity = item.artwork ? '.58' : '0';
    const preview = document.querySelector('#preview-image');
    preview.hidden = !item.artwork;
    if (item.artwork) { preview.src = item.artwork; preview.alt = `${item.title} artwork`; }
    else { preview.removeAttribute('src'); preview.alt = ''; }
    layers[layer].style.opacity = '0';
    layer = next;
    document.querySelector('#wallpaper-count').textContent = `${current + 1}×${wallpapers.length}`;
    renderStage();
  }
  function shape(value) {
    document.querySelector('#specimens').dataset.shape = value;
    document.querySelectorAll('.shape-controls button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.shape === value)));
  }
  document.querySelector('#previous').addEventListener('click', () => show(current - 1));
  document.querySelector('#next').addEventListener('click', () => show(current + 1));
  document.querySelectorAll('.shape-controls button').forEach(button => button.addEventListener('click', () => shape(button.dataset.shape)));
  const viewTrigger = document.querySelector('#view');
  const viewMenu = document.querySelector('#view-menu');
  const iconGrid = document.querySelector('#iconography-grid');
  const statusIndicators = new Set(['signal', 'wifi', 'battery-full']);
  const iconEntries = Object.entries(window.PocketSagaIcons).filter(([name]) => !statusIndicators.has(name)).sort(([a], [b]) => a.localeCompare(b));
  const iconLabels = { 'chart-no-axes-column-increasing': 'Activity chart', 'message-circle': 'Comment', 'messages-square': 'Community', 'refresh-cw': 'Refresh', 'share-2': 'Share', 'square-pen': 'New post', 'user-round': 'Profile', x: 'Close' };
  document.querySelector('#iconography-count').textContent = `${iconEntries.length} icons`;
  for (const [name, markup] of iconEntries) {
    const figure = document.createElement('figure');
    figure.className = 'iconography-item';
    figure.dataset.icon = name;
    const stage = document.createElement('div');
    stage.className = 'iconography-stage';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 14 14');
    svg.setAttribute('class', 'iconography-glyph');
    svg.setAttribute('aria-hidden', 'true');
    // These SVG fragments come from the app's local icon library.
    svg.innerHTML = markup;
    stage.append(svg);
    const caption = document.createElement('figcaption');
    caption.textContent = iconLabels[name] || name.replaceAll('-', ' ').replace(/^./, letter => letter.toUpperCase());
    figure.append(stage, caption);
    iconGrid.append(figure);
  }
  // At desktop widths the menu is the always-visible sidebar (the dropdown trigger is hidden).
  const sidebarMode = () => !viewTrigger.offsetParent;
  function closeMenu() { viewMenu.hidden = true; viewTrigger.setAttribute('aria-expanded', 'false'); }
  viewTrigger.addEventListener('click', () => {
    viewMenu.hidden = !viewMenu.hidden;
    viewTrigger.setAttribute('aria-expanded', String(!viewMenu.hidden));
  });
  viewTrigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); viewMenu.hidden = false; viewTrigger.setAttribute('aria-expanded', 'true'); viewMenu.querySelector('button').focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.view-picker')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !viewMenu.hidden) { closeMenu(); viewTrigger.focus(); }
    if (event.target.closest('#view-menu') && !sidebarMode() && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const items = [...viewMenu.querySelectorAll('button')];
      items[(items.indexOf(document.activeElement) + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
    }
  });
  function applyView(next) {
    if (next !== 'background') gradientOnly = false;
    view = next;
    const option = viewMenu.querySelector(`[data-view="${view}"]`);
    document.querySelector('#view-label').textContent = option.querySelector('.view-name').textContent;
    viewMenu.querySelectorAll('button').forEach(item => item.setAttribute('aria-checked', String(item === option)));
    document.querySelector('#title-view').hidden = view !== 'title';
    document.querySelector('#avatars-view').hidden = view !== 'avatars';
    document.querySelector('#app-view').hidden = view !== 'app';
    // The embedded prototype loads on first visit and then stays alive, keeping its scroll, drafts and route.
    const app = document.querySelector('#app-view iframe');
    if (view === 'app' && !app.src) app.src = app.dataset.src;
    document.querySelector('#typography-view').hidden = view !== 'typography';
    document.querySelector('#spacing-view').hidden = view !== 'spacing';
    document.querySelector('#color-view').hidden = view !== 'color';
    document.querySelector('#shapes-view').hidden = view !== 'shapes';
    document.querySelector('#iconography-view').hidden = view !== 'iconography';
    document.querySelector('#patterns-view').hidden = view !== 'patterns';
    document.querySelector('#specimens').hidden = view !== 'material';
    document.querySelector('#material-controls').hidden = view !== 'material';
    document.querySelector('.material-steps').hidden = view !== 'material';
    document.querySelector('#background-view').hidden = view !== 'background';
    document.querySelector('#background-controls').hidden = view !== 'background';
    renderStage();
  }
  viewMenu.querySelectorAll('button').forEach(option => option.addEventListener('click', () => { applyView(option.dataset.view); closeMenu(); (viewTrigger.offsetParent ? viewTrigger : option).focus(); }));
  const patternResult = document.querySelector('#pattern-result');
  const patternChoices = [...document.querySelectorAll('[data-pattern-group]')];
  let patternPulse;
  patternChoices.forEach(choice => choice.addEventListener('click', () => {
    if (choice.getAttribute('aria-pressed') === 'true') return;
    patternChoices.forEach(button => {
      const selected = button === choice;
      button.setAttribute('aria-pressed', String(selected));
      button.dataset.material = selected ? 'highlight' : 'neutral';
    });
    document.querySelector('#pattern-result-text').textContent = choice.textContent.trim();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    patternResult.querySelector('.pattern-update-sweep')?.remove();
    const light = document.createElement('span');
    light.className = 'pattern-update-sweep';
    light.setAttribute('aria-hidden', 'true');
    light.addEventListener('animationend', () => light.remove(), { once: true });
    patternResult.append(light);
    patternPulse?.cancel();
    patternPulse = patternResult.animate([
      { scale: '1', offset: 0 },
      { scale: '1.012', offset: .36 },
      { scale: '1', offset: 1 }
    ], { duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)' });
    patternPulse.onfinish = () => { patternPulse = null; };
  }));
  document.querySelectorAll('button[data-material-step]').forEach(button => button.addEventListener('click', () => { const track = button.closest('.steps'); const next = Number(button.dataset.materialStep); if (track.dataset.started && materialStep === next) { materialStep = 0; } else { track.dataset.started = 'true'; materialStep = next; } renderStage(); }));
  document.querySelectorAll('button[data-step]').forEach(button => button.addEventListener('click', event => {
    const track = button.closest('.steps');
    const next = Number(button.dataset.step);
    if ((event.metaKey || event.ctrlKey) && next === 3) {
      event.preventDefault();
      gradientOnly = step === 3 ? !gradientOnly : true;
      step = 3;
    } else {
      gradientOnly = false;
      step = track.dataset.started && step === next ? 0 : next;
    }
    track.dataset.started = 'true';
    renderStage();
  }));
  // Progressive blur (a Patterns demo): Content → Blur → Progressive → Fade → Scrim. Loads fully built; clicking the current step returns to Content.
  // Layer strengths and mask ranges mirror ProgressiveBlur('bottom') in codedProtoype/components/components.js.
  const blurScreen = document.querySelector('#blur-screen');
  const blurLayers = [[1, 0, 35], [3, 20, 60], [6, 45, 85], [12, 65, 100]];
  blurScreen.querySelectorAll('.blur-edge').forEach(edge => blurLayers.forEach(([blur, start, end]) => {
    const layer = document.createElement('span');
    layer.className = 'blur-layer';
    layer.style.setProperty('--blur', `${blur}px`);
    layer.style.setProperty('--start', `${start}%`);
    layer.style.setProperty('--end', `${end}%`);
    edge.append(layer);
  }));
  const catalog = window.pocketSagaData;
  const feedPosts = ['winden', 'silicon-demo', 'from-road', 'coherence-trust', 'messages'].map(id => catalog.posts.find(post => post.id === id)).filter(Boolean);
  const feedCard = post => {
    const card = document.createElement('article');
    card.className = 'blur-card';
    const art = document.createElement('img');
    art.src = catalog.media.find(item => item.id === post.mediaId)?.artwork || '';
    art.alt = '';
    const context = document.createElement('p'); context.className = 'blur-card-context';
    context.textContent = catalog.communities.find(item => item.id === post.communityId)?.name || '';
    const title = document.createElement('h3'); title.textContent = post.title;
    const body = document.createElement('p'); body.className = 'blur-card-body'; body.textContent = post.paragraphs?.[0] || '';
    card.append(art, context, title, body);
    return card;
  };
  // Two identical runs let the feed loop seamlessly beneath the edges.
  document.querySelector('#blur-feed-track').append(...[...feedPosts, ...feedPosts].map(feedCard));
  document.querySelector('#blur-device').append(...['signal', 'wifi', 'battery-full'].map(appIcon));
  let blurStep = 4;
  function renderBlur() {
    blurScreen.dataset.blurStep = String(blurStep);
    document.querySelectorAll('button[data-blur-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.blurStep) === blurStep)));
  }
  document.querySelectorAll('button[data-blur-step]').forEach(button => button.addEventListener('click', () => {
    const next = Number(button.dataset.blurStep);
    blurStep = blurStep === next ? 0 : next;
    renderBlur();
  }));
  renderBlur();
  // Like & save: the app's own PocketSagaMotion feedback (motion.js), on a local copy of its reaction row.
  function appIcon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 14 14');
    svg.setAttribute('class', `icon icon-${name}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = window.PocketSagaIcons[name] || '';
    if (name === 'heart') {
      const outline = svg.querySelector('path'), solid = outline.cloneNode(true);
      solid.setAttribute('d', outline.getAttribute('d').split(/z\s*m/i)[0] + 'z');
      outline.classList.add('heart-outline'); solid.classList.add('heart-solid');
      svg.append(solid);
    }
    return svg;
  }
  const reactionRow = document.querySelector('#reaction-row');
  const likeBase = 24;
  let liked = false, saved = false;
  const likeButton = document.createElement('button');
  likeButton.type = 'button'; likeButton.className = 'reaction like-action';
  const likeCount = document.createElement('span');
  const renderLike = () => { likeCount.textContent = String(likeBase + Number(liked)); likeButton.setAttribute('aria-pressed', String(liked)); likeButton.setAttribute('aria-label', `${liked ? 'Unlike' : 'Like'}, ${likeBase + Number(liked)} likes`); };
  likeButton.append(appIcon('heart'), likeCount);
  likeButton.addEventListener('click', () => { liked = !liked; renderLike(); window.PocketSagaMotion.animateLike(likeButton, liked); });
  const commentButton = document.createElement('span');
  commentButton.className = 'reaction';
  commentButton.append(appIcon('message-circle'), '6');
  const saveButton = document.createElement('button');
  saveButton.type = 'button'; saveButton.className = 'reaction save-post';
  const renderSave = () => { saveButton.setAttribute('aria-pressed', String(saved)); saveButton.setAttribute('aria-label', saved ? 'Unsave post' : 'Save post'); };
  saveButton.append(appIcon('bookmark'));
  saveButton.addEventListener('click', () => { saved = !saved; renderSave(); window.PocketSagaMotion.animateSave(saveButton, saved); });
  renderLike(); renderSave();
  reactionRow.append(likeButton, commentButton, saveButton);
  document.addEventListener('keydown', event => {
    if (event.target.matches('input, select')) return;
    if ((view === 'material' || view === 'background') && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  // Let the ribbon show through: the prototype's own page backdrop is cleared inside the frame.
  document.querySelector('#app-view iframe').addEventListener('load', event => {
    try { [event.target.contentDocument.documentElement, event.target.contentDocument.body].forEach(el => el.style.background = 'transparent'); } catch {}
  });
  function avatarSample(person, size, decorative = false) {
    const portrait = document.createElement('div');
    portrait.className = 'avatar-specimen';
    portrait.style.width = portrait.style.height = `${size}px`;
    if (decorative) portrait.setAttribute('aria-hidden', 'true');
    else {
      portrait.setAttribute('role', 'img');
      portrait.setAttribute('aria-label', `${person.name}'s avatar`);
    }
    portrait.innerHTML = window.PocketSagaAvatars.render(person);
    return portrait;
  }
  document.querySelector('#shape-composer-avatar').replaceWith(avatarSample(window.pocketSagaData.people[0], 28, true));
  document.querySelector('#shape-avatar').replaceWith(avatarSample(window.pocketSagaData.people[0], 44));
  document.querySelector('.shape-new-post').innerHTML = window.PocketSagaIcons['square-pen'];
  window.pocketSagaData.people.forEach(person => {
    const figure = document.createElement('figure');
    figure.append(avatarSample(person, 80));
    const caption = document.createElement('figcaption');
    caption.textContent = person.name;
    figure.append(caption);
    document.querySelector('#avatar-family').append(figure);
  });
  [[20, 'Navigation'], [24, 'Author'], [32, 'Composer'], [34, 'Notification']].forEach(([size, role]) => {
    const figure = document.createElement('figure');
    const stage = document.createElement('div'); stage.className = 'avatar-size-stage';
    stage.append(avatarSample(window.pocketSagaData.people[0], size));
    const caption = document.createElement('figcaption');
    caption.textContent = `${size}px · ${role}`;
    figure.append(stage, caption);
    document.querySelector('#avatar-sizes').append(figure);
  });
  document.querySelectorAll('.steps').forEach(track => track.dataset.started = 'true');
  document.querySelectorAll('.steps').forEach(track => {
    const buttons = [...track.querySelectorAll('button')];
    const layer = document.createElement('div');
    layer.className = 'step-goo-layer'; layer.setAttribute('aria-hidden', 'true');
    track.prepend(layer);
    function draw() {
      layer.replaceChildren();
      buttons.forEach((button, index) => {
        const blob = document.createElement('div');
        blob.className = 'step-blob' + (track.dataset.started && index <= buttons.findIndex(item => item.getAttribute('aria-pressed') === 'true') ? ' is-selected' : '');
        Object.assign(blob.style, {left: button.offsetLeft + 'px', top: button.offsetTop + 'px', width: button.offsetWidth + 'px', height: button.offsetHeight + 'px'});
        layer.append(blob);
        const next = buttons[index + 1];
        if (next) {
          const bridge = document.createElement('div'); bridge.className = 'step-bridge';
          Object.assign(bridge.style, {left: button.offsetLeft + button.offsetWidth - 8 + 'px', top: button.offsetTop + button.offsetHeight / 2 - 3.5 + 'px', width: next.offsetLeft - button.offsetLeft - button.offsetWidth + 16 + 'px'});
          bridge.style.setProperty('--bridge-order', String(index));
          layer.append(bridge);
        }
      });
    }
    function updateProgress() {
      const selected = track.dataset.started ? buttons.findIndex(item => item.getAttribute('aria-pressed') === 'true') : -1;
      buttons.forEach((button, index) => button.classList.toggle('is-complete', index <= selected));
      layer.querySelectorAll('.step-blob').forEach((blob, index) => blob.classList.toggle('is-selected', index <= selected));
      layer.querySelectorAll('.step-bridge').forEach((bridge, index) => {
        bridge.classList.toggle('is-selected', index < selected);
        bridge.classList.toggle('is-connected', index < selected);
      });
    }
    // Elastic press feedback: squash on press, overshoot and settle on release (pointer or keyboard).
    buttons.forEach((button, index) => {
      const targets = () => [button, layer.querySelectorAll('.step-blob')[index]].filter(Boolean);
      const bounce = () => targets().forEach(item => { item.classList.remove('is-pressed', 'is-bouncing'); void item.offsetWidth; item.classList.add('is-bouncing'); });
      button.addEventListener('pointerdown', () => targets().forEach(item => { item.classList.remove('is-bouncing'); item.classList.add('is-pressed'); }));
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => button.addEventListener(type, () => { if (button.classList.contains('is-pressed')) bounce(); }));
      button.addEventListener('click', event => { if (!event.detail) bounce(); });
      button.addEventListener('animationend', () => button.classList.remove('is-bouncing'));
      layer.addEventListener('animationend', event => event.target.classList.remove('is-bouncing'));
    });
    // Hover light: a sweep crosses the hovered pill, then travels outward across its bridges (visible only when
    // they are connected), so the goo shape reads as one lit surface. Pointer hover and keyboard focus both trigger it.
    buttons.forEach((button, index) => {
      const sweep = () => {
        const blobs = layer.querySelectorAll('.step-blob'), bridges = layer.querySelectorAll('.step-bridge');
        const run = (el, delay, reverse) => { if (!el) return; el.classList.remove('is-shining', 'is-shining-reverse'); void el.offsetWidth; el.style.setProperty('--shine-delay', `${delay}ms`); el.classList.add(reverse ? 'is-shining-reverse' : 'is-shining'); };
        run(blobs[index], 0, false);
        run(bridges[index], 260, false);
        run(bridges[index - 1], 120, true);
      };
      button.addEventListener('pointerenter', sweep);
      button.addEventListener('focus', () => { if (button.matches(':focus-visible')) sweep(); });
    });
    layer.addEventListener('animationend', event => { if (event.animationName === 'step-shine') event.target.classList.remove('is-shining', 'is-shining-reverse'); });
    new ResizeObserver(() => { draw(); updateProgress(); }).observe(track);
    new MutationObserver(updateProgress).observe(track, {subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'data-started']});
    draw();
  });
  // Scroll-connected tabs: keep scrolling past the end of a view's content and it slides up and fades out while
  // the next view slides in from below (scrolling up past the top goes back). The sidebar selection follows.
  const viewOrder = [...viewMenu.querySelectorAll('button')].map(option => option.dataset.view);
  const mainElement = document.querySelector('main'), footerElement = document.querySelector('footer');
  const EDGE_PUSH = 140, SETTLE_MS = 320, EASE = 'cubic-bezier(.6,0,.25,1)';
  let edgePush = 0, edgeDirection = 0, lastWheel = 0, lastDelta = 0, transitioning = false, cooldownUntil = 0;
  const scroller = () => /auto|scroll/.test(getComputedStyle(mainElement).overflowY) ? mainElement : document.scrollingElement;
  const atEdge = direction => { const el = scroller(); return direction > 0 ? el.scrollTop + el.clientHeight >= el.scrollHeight - 2 : el.scrollTop <= 1; };
  // Animate what is visible in the pane. The title view's stage is position:fixed, so it moves itself rather than
  // transforming its section (a transformed ancestor would re-anchor the fixed stage).
  const movingParts = () => [...mainElement.children, footerElement]
    .filter(el => !el.hidden && getComputedStyle(el).display !== 'none')
    .map(el => el.id === 'title-view' ? el.querySelector('.prism-stage') : el);
  // The whole right pane moves: its glass fill and rim (body::before / ::after on desktop) travel with the content.
  const paneLayers = [[document.body, '::before'], [document.body, '::after']];
  async function animateParts(parts, keyframes, duration) {
    const options = { duration, easing: EASE, fill: 'forwards' };
    const animations = [...parts.map(part => part.animate(keyframes, options)), ...paneLayers.map(([el, pseudoElement]) => el.animate(keyframes, { ...options, pseudoElement }))];
    await Promise.all(animations.map(animation => animation.finished));
    return animations;
  }
  async function stepView(direction) {
    const next = viewOrder[viewOrder.indexOf(view) + direction];
    if (!next || transitioning) return;
    transitioning = true;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const outgoing = movingParts();
    const out = reduce ? [] : await animateParts(outgoing, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: `translateY(${-48 * direction}px)` }], 260);
    applyView(next);
    if (viewMenu.contains(document.activeElement)) viewMenu.querySelector(`[data-view="${next}"]`).focus({ preventScroll: true });
    out.forEach(animation => animation.cancel());
    const el = scroller();
    el.scrollTop = direction > 0 ? 0 : el.scrollHeight;
    if (!reduce) {
      const inn = await animateParts(movingParts(), [{ opacity: 0, transform: `translateY(${56 * direction}px)` }, { opacity: 1, transform: 'translateY(0)' }], 380);
      inn.forEach(animation => animation.cancel());
    }
    transitioning = false;
    cooldownUntil = performance.now() + SETTLE_MS;
  }
  addEventListener('wheel', event => {
    if ((event.target.closest('#view-menu') && !sidebarMode()) || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    const now = performance.now(), direction = Math.sign(event.deltaY);
    const magnitude = Math.abs(event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY);
    // Trackpad momentum keeps firing after a switch; absorb it until the wheel goes quiet. Momentum only decays,
    // so a clear jump in delta means a fresh swipe has started and ends the cooldown straight away.
    const freshSwipe = !transitioning && magnitude > lastDelta * 1.5 + 4;
    if (transitioning || (now < cooldownUntil && !freshSwipe)) { cooldownUntil = Math.max(cooldownUntil, now + SETTLE_MS * .6); lastDelta = magnitude; return; }
    if (freshSwipe) cooldownUntil = 0;
    lastDelta = magnitude;
    if (!direction || !atEdge(direction)) { edgePush = 0; lastWheel = now; return; }
    if (direction !== edgeDirection || now - lastWheel > 260) edgePush = 0;
    edgeDirection = direction; lastWheel = now;
    edgePush += magnitude;
    if (edgePush >= EDGE_PUSH) { edgePush = 0; stepView(direction); }
  }, { passive: true });
  // Up/Down (and Page Up/Down) scroll the pane's content; at its edge they move to the previous/next view.
  document.addEventListener('keydown', event => {
    const keys = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
    const direction = keys[event.key];
    if (!direction || event.altKey || event.metaKey || event.ctrlKey || event.target.closest('input, select, textarea') || (event.target.closest('#view-menu') && !sidebarMode())) return;
    event.preventDefault();
    if (transitioning) return;
    if (atEdge(direction)) { stepView(direction); return; }
    const el = scroller();
    el.scrollBy({ top: direction * (event.key.startsWith('Page') ? el.clientHeight * .85 : 96), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  show(0);
  applyView('title');
  treatment.ready.then(() => show(current));
})();
