/* A comment expands into a modal reply thread inside its phone preview. */
(() => {
  gsap.registerPlugin(CustomEase);
  const focusEase = CustomEase.create('commentFocus', '0.6,0,0.25,1');
  const { node, Action, Avatar } = PocketSaga;
  function ReplyItem(reply, emit) {
    return node('article', 'thread-reply', [
      node('header', 'thread-reply-author', [Avatar(reply.author), node('span', 'comment-name', reply.author.name), reply.isAuthor && node('span', 'thread-author-badge', 'AUTHOR'), node('span', 'comment-time', reply.time)]),
      node('p', 'thread-reply-body', reply.body),
      PocketSagaPost.LikeButton(reply, emit, 'thread-like')
    ]);
  }
  function attach(page, data, emit) {
    const screen = page.querySelector('.phone-screen');
    const feed = page.querySelector('.post-scroll');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const threads = new Map();
    const drafts = new Map();
    let active = null, pendingPress = null;
    const bounds = element => {
      const outer = screen.getBoundingClientRect(), rect = element.getBoundingClientRect();
      const scale = outer.width / screen.clientWidth;
      return { left: (rect.left - outer.left) / scale, top: (rect.top - outer.top) / scale, width: rect.width / scale, height: rect.height / scale };
    };
    function open(comment, focusComposer = false, pressedBounds = null) {
      if (active) { if (focusComposer) active.input.focus({ preventScroll: true }); return; }
      const source = [...feed.querySelectorAll('.comment-card')].find(card => card.dataset.commentId === comment.id);
      if (!source) return;
      const sourceBounds = bounds(source);
      const origin = pressedBounds || sourceBounds;
      const opener = document.activeElement;
      const keyboardOpened = opener?.matches(':focus-visible');
      const replies = threads.get(comment.id) || [...(comment.replies || [])];
      threads.set(comment.id, replies);
      const overlay = node('div', 'reply-thread-overlay');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', `Focus mode: comment by ${comment.author.name}`);
      overlay.tabIndex = -1;
      const scrim = node('div', 'reply-thread-scrim');
      const panel = node('section', 'reply-thread-panel');
      const surface = node('div', 'thread-panel-surface');
      surface.setAttribute('aria-hidden', 'true');
      const ghost = source.cloneNode(true);
      ghost.classList.add('thread-origin');
      ghost.removeAttribute('data-comment-id');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.inert = true;
      const handle = Action({ label: 'Drag down to close replies', className: 'thread-drag-handle', children: node('span', '') });
      const heading = node('h2', 'thread-heading');
      const parent = PocketSagaPost.CommentCard(comment, (action, detail) => {
        if (action === 'reply' || action === 'replies' || action === 'focus-comment') input.focus({ preventScroll: true });
        else emit(action, detail);
      });
      parent.classList.add('thread-parent');
      parent.removeAttribute('tabindex');
      parent.removeAttribute('aria-haspopup');
      parent.setAttribute('aria-label', `Comment by ${comment.author.name}`);
      parent.querySelector('.comment-reply')?.remove();
      parent.querySelector('.comment-reply-count')?.remove();
      const replyList = node('div', 'thread-replies', replies.map(reply => ReplyItem(reply, emit)));
      const empty = node('p', 'thread-empty', 'No replies yet.');
      const content = node('div', 'thread-scroll', [parent, replyList, empty]);
      content.tabIndex = 0;
      content.setAttribute('aria-label', 'Reply thread');
      content.addEventListener('scroll', () => panel.classList.toggle('thread-has-scroll', content.scrollTop > 1), { passive: true });
      const viewport = node('div', 'thread-scroll-viewport', [content, node('div', 'thread-scroll-blur thread-scroll-blur-top', PocketSaga.ProgressiveBlur('top')), node('div', 'thread-scroll-blur thread-scroll-blur-bottom', PocketSaga.ProgressiveBlur('bottom'))]);
      const inner = node('div', 'thread-panel-inner', [handle, node('header', 'thread-header', [heading]), viewport]);
      panel.append(surface); panel.append(inner);
      const composer = PocketSaga.MessageComposer(data.viewer, `Reply to ${comment.author.name.split(' ')[0]}…`, 'thread-composer');
      const input = composer.querySelector('.message-input');
      const send = composer.querySelector('.message-send');
      send.setAttribute('aria-label', 'Send reply');
      input.value = drafts.get(comment.id) || '';
      send.disabled = !input.value.trim();
      const announcement = node('span', 'thread-announcement');
      announcement.setAttribute('role', 'status');
      overlay.append(scrim); overlay.append(panel); overlay.append(ghost); overlay.append(composer); overlay.append(announcement);
      const background = [...screen.children].map(element => [element, element.inert]);
      const previousOverflow = feed.style.overflowY;
      const updateCount = () => {
        const count = Math.max(comment.replyCount || 0, replies.length);
        heading.textContent = `${count} ${count === 1 ? 'reply' : 'replies'}`;
        empty.hidden = replies.length > 0;
        content.classList.toggle('thread-is-empty', replies.length === 0);
      };
      updateCount();
      screen.append(overlay);
      // Lock the existing view without changing its scroll position.
      background.forEach(([element]) => { element.inert = true; });
      feed.style.overflowY = 'hidden';
      source.style.visibility = 'hidden';
      const width = screen.clientWidth - 32;
      const panelBottom = 32 + 64 + 12; // Composer bottom + height + gap.
      panel.style.width = `${width}px`;
      const measureHeight = () => {
        const chrome = 12 + handle.offsetHeight + inner.querySelector('.thread-header').offsetHeight;
        const body = parent.offsetHeight + (replies.length ? replyList.scrollHeight : 96);
        return Math.min(628, screen.clientHeight - panelBottom - 76, chrome + 16 + body + 44);
      };
      const height = measureHeight();
      const target = { left: 16, top: screen.clientHeight - panelBottom - height, width, height };
      // Only the glass surface morphs; text stays at its own unscaled position.
      gsap.set(panel, target);
      gsap.set(ghost, { left: sourceBounds.left, top: sourceBounds.top, width: sourceBounds.width, opacity: 1, filter: 'blur(0px)' });
      gsap.set(surface, { transformOrigin: '0 0', x: origin.left - target.left, y: origin.top - target.top, scaleX: origin.width / target.width, scaleY: origin.height / target.height });
      gsap.set(inner, { opacity: 0, filter: 'blur(6px)' });
      gsap.set(composer, { opacity: 0, y: 16 });
      gsap.set(scrim, { opacity: 0 });
      const state = { overlay, source, opener, panel, surface, inner, ghost, scrim, composer, input, target, background, previousOverflow, comment, animation: null, closing: false };
      active = state;
      const resizePanel = () => {
        if (active !== state || state.closing || state.dragging || state.animation?.isActive()) return;
        const nextHeight = measureHeight();
        if (Math.abs(nextHeight - state.target.height) < 1) return;
        state.target.height = nextHeight;
        state.target.top = screen.clientHeight - panelBottom - nextHeight;
        state.layoutTween?.kill();
        state.layoutTween = gsap.to(panel, { height: nextHeight, top: state.target.top, duration: reduced.matches ? 0 : .28, ease: focusEase, onComplete: () => {
          if (state.scrollAfterResize) { content.scrollTop = content.scrollHeight; state.scrollAfterResize = false; }
        } });
      };
      state.resize = new ResizeObserver(resizePanel);
      state.resize.observe(parent);
      state.resize.observe(replyList);
      overlay.focus({ preventScroll: true });
      const duration = reduced.matches ? 0 : .58;
      if (reduced.matches) {
        gsap.set(surface, { x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: 24 });
        gsap.set([scrim, inner], { opacity: 1 });
        gsap.set(inner, { filter: 'blur(0px)' });
        gsap.set(composer, { opacity: 1, y: 0 });
        ghost.style.visibility = 'hidden';
        resizePanel();
        (focusComposer ? input : keyboardOpened ? handle : overlay).focus({ preventScroll: true });
      } else state.animation = gsap.timeline({ onComplete: () => {
        if (active !== state || state.closing) return;
        ghost.style.visibility = 'hidden';
        resizePanel();
        (focusComposer ? input : keyboardOpened ? handle : overlay).focus({ preventScroll: true });
      } })
        .to(scrim, { opacity: 1, duration: reduced.matches ? 0 : .3 }, 0)
        .to(surface, { x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: 24, duration, ease: focusEase, force3D: true }, 0)
        .to(ghost, { opacity: 0, filter: 'blur(6px)', duration: .22, ease: focusEase }, 0)
        .to(inner, { opacity: 1, filter: 'blur(0px)', duration: .32, ease: focusEase }, duration * .42)
        .to(composer, { opacity: 1, y: 0, duration: reduced.matches ? 0 : .34, ease: 'power3.out' }, duration * .42);
      input.addEventListener('input', () => { drafts.set(comment.id, input.value); send.disabled = !input.value.trim(); });
      composer.addEventListener('submit', event => {
        event.preventDefault();
        const body = input.value.trim();
        if (!body || state.closing) return;
        const reply = { id: `local-${Date.now()}-${replies.length}`, author: data.viewer, time: 'Just now', body, likes: 0 };
        replies.push(reply);
        const item = ReplyItem(reply, emit);
        replyList.append(item);
        comment.replyCount = Math.max(comment.replyCount || 0, replies.length - 1) + 1;
        let countButton = source.querySelector('.comment-reply-count');
        if (!countButton) {
          countButton = Action({ label: '', className: 'comment-reply-count', onClick: () => emit('replies', { comment }) });
          source.querySelector('.comment-actions').append(countButton);
        }
        countButton.textContent = `${comment.replyCount} replies`;
        countButton.setAttribute('aria-label', `${comment.replyCount} replies`);
        input.value = ''; drafts.delete(comment.id); send.disabled = true;
        updateCount();
        state.scrollAfterResize = true;
        resizePanel();
        announcement.textContent = 'Reply added to this preview.';
        content.scrollTo({ top: content.scrollHeight, behavior: reduced.matches ? 'instant' : 'smooth' });
        if (!reduced.matches) gsap.from(item, { opacity: 0, y: 8, duration: .22 });
        emit('send-reply', { comment, reply });
      });
      scrim.addEventListener('click', () => close());
      overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
        if (event.key !== 'Tab') return;
        const focusable = [...overlay.querySelectorAll('button:not(:disabled), textarea, [tabindex="0"]')].filter(element => !element.closest('[inert]'));
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === overlay)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
      let dragStart = null, dragDistance = 0, dragHeight = 0, dragTop = 0, dragPointer = null;
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.isPrimary === false || state.closing || state.animation?.isActive()) return;
        state.layoutTween?.kill();
        state.dragging = true;
        dragStart = event.clientY;
        dragDistance = 0;
        dragHeight = parseFloat(panel.style.height);
        dragTop = parseFloat(panel.style.top);
        dragPointer = event.pointerId;
        handle.setPointerCapture(event.pointerId);
      });
      handle.addEventListener('pointermove', event => {
        if (dragStart === null || event.pointerId !== dragPointer) return;
        const scale = screen.getBoundingClientRect().width / screen.clientWidth;
        dragDistance = Math.max(0, (event.clientY - dragStart) / scale);
        const minimum = Math.max(160, dragHeight * .5);
        const height = Math.max(minimum, dragHeight - dragDistance);
        // Anchor the bottom edge while the handle lowers the top edge.
        gsap.set(panel, { top: dragTop + dragHeight - height, height });
      });
      const endDrag = event => {
        if (dragStart === null || event.pointerId !== dragPointer) return;
        dragStart = null;
        state.dragging = false;
        const threshold = Math.max(64, Math.min(100, dragHeight * .22));
        if (event.type === 'pointerup' && dragDistance >= threshold) close();
        else state.layoutTween = gsap.to(panel, {
          top: state.target.top, height: state.target.height, duration: reduced.matches ? 0 : .32, ease: focusEase
        });
        if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
        dragPointer = null;
      };
      handle.addEventListener('pointerup', endDrag);
      handle.addEventListener('pointercancel', endDrag);
      handle.addEventListener('lostpointercapture', endDrag);
    }
    function restore(state, focus = true) {
      state.resize?.disconnect();
      state.layoutTween?.kill();
      state.overlay.remove();
      state.source.style.visibility = '';
      state.background.forEach(([element, inert]) => { element.inert = inert; });
      feed.style.overflowY = state.previousOverflow;
      if (active === state) active = null;
      if (focus && state.opener?.isConnected) state.opener.focus({ preventScroll: true });
    }
    function close() {
      const state = active;
      if (!state || state.closing) return;
      state.closing = true;
      drafts.set(state.comment.id, state.input.value);
      state.animation?.kill();
      state.layoutTween?.kill();
      state.target = { ...state.target, top: parseFloat(state.panel.style.top), height: parseFloat(state.panel.style.height) };
      state.input.blur();
      if (reduced.matches) { restore(state); return; }
      const destination = bounds(state.source);
      state.ghost.style.visibility = 'visible';
      gsap.set(state.ghost, { left: destination.left, top: destination.top, width: state.source.offsetWidth, opacity: 0, filter: 'blur(6px)' });
      const dragY = Number(gsap.getProperty(state.panel, 'y')) || 0;
      gsap.set(state.surface, { y: Number(gsap.getProperty(state.surface, 'y')) + dragY });
      gsap.set(state.panel, { y: 0 });
      const duration = reduced.matches ? 0 : .46;
      state.animation = gsap.timeline({ onComplete: () => restore(state) })
        .to(state.composer, { opacity: 0, y: 10, duration: reduced.matches ? 0 : .14 }, 0)
        .to(state.inner, { opacity: 0, filter: 'blur(6px)', duration: .2, ease: focusEase }, 0)
        .to(state.surface, { x: destination.left - state.target.left, y: destination.top - state.target.top, scaleX: destination.width / state.target.width, scaleY: destination.height / state.target.height, borderRadius: 20, duration, ease: focusEase, force3D: true }, 0)
        .to(state.ghost, { opacity: 1, filter: 'blur(0px)', duration: .24, ease: focusEase }, duration * .48)
        // Hold background separation until the card is mostly collapsed.
        .to(state.scrim, {
          opacity: 0,
          backdropFilter: 'blur(0px)',
          webkitBackdropFilter: 'blur(0px)',
          duration: duration * .45,
          ease: 'power2.inOut'
        }, duration * .55);
    }
    let releaseTimer, suppressedClick = false;
    const cancelPress = () => {
      clearTimeout(releaseTimer);
      if (!pendingPress) return;
      pendingPress.animation?.kill();
      pendingPress.restore();
      pendingPress = null;
    };
    const onPointerDown = event => {
      if (active || event.button !== 0 || event.isPrimary === false) return;
      const source = event.target.closest('.comment-list > .comment-card');
      if (!source) return;
      const control = event.target.closest('button, a, input, textarea');
      if (control && !control.matches('.comment-reply, .comment-reply-count')) return;
      cancelPress();
      suppressedClick = false;
      const originalStyle = source.getAttribute('style');
      source.classList.add('comment-is-pressed');
      pendingPress = {
        source, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
        restore: () => {
          source.classList.remove('comment-is-pressed');
          if (originalStyle === null) source.removeAttribute('style');
          else source.setAttribute('style', originalStyle);
        },
        animation: gsap.to(source, {
          scale: reduced.matches ? 1 : .985, transformOrigin: '50% 50%',
          '--press-highlight': 1,
          duration: reduced.matches ? 0 : .085, ease: 'power2.out'
        })
      };
    };
    const onPointerMove = event => {
      if (!pendingPress || event.pointerId !== pendingPress.pointerId) return;
      if (Math.hypot(event.clientX - pendingPress.x, event.clientY - pendingPress.y) > 10) {
        suppressedClick = true; cancelPress();
      }
    };
    const onPointerUp = event => {
      if (!pendingPress || event.pointerId !== pendingPress.pointerId) return;
      // Click consumes the held state in the same gesture; otherwise release it.
      releaseTimer = setTimeout(cancelPress, 0);
    };
    const onCancel = () => { if (pendingPress) { suppressedClick = true; cancelPress(); } };
    const onAction = event => {
      if (!['replies', 'reply', 'focus-comment'].includes(event.detail.action)) return;
      if (suppressedClick) { suppressedClick = false; return; }
      const origin = pendingPress ? bounds(pendingPress.source) : null;
      cancelPress();
      open(event.detail.comment, event.detail.action === 'reply', origin);
    };
    const onKeyDown = () => { suppressedClick = false; };
    feed.addEventListener('keydown', onKeyDown);
    feed.addEventListener('pointerdown', onPointerDown, { passive: true });
    feed.addEventListener('scroll', onCancel, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('blur', onCancel);
    page.addEventListener('post-action', onAction);
    return () => {
      page.removeEventListener('post-action', onAction);
      cancelPress();
      feed.removeEventListener('keydown', onKeyDown);
      feed.removeEventListener('pointerdown', onPointerDown);
      feed.removeEventListener('scroll', onCancel);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('blur', onCancel);
      if (active) {
        const state = active;
        state.animation?.kill();
        gsap.killTweensOf([state.panel, state.surface, state.inner, state.ghost, state.composer, state.scrim]);
        restore(state, false);
      }
    };
  }
  window.PocketSagaThread = { ReplyItem, attach };
})();
