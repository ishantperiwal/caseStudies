/* Preview activity lives here; read state is retained while navigating. */
(() => {
  const { node, Action, Avatar, Icon, PhoneFrame } = PocketSaga;
  const items = [
    { id: 'n1', person: 'lm', type: 'comment', text: 'commented on your post', quote: 'The quiet moments are what make the huge ones matter.', post: 'ishant-interstellar', time: '2m ago', day: 'Today', unread: true },
    { id: 'n2', person: 'mr', type: 'like', text: 'and 12 others liked your post', post: 'ishant-silicon', time: '18m ago', day: 'Today', unread: true },
    { id: 'n3', person: 'ak', type: 'reply', text: 'replied to your comment', quote: 'Exactly. Jared notices what everyone else misses.', post: 'ishant-silicon', time: '42m ago', day: 'Today', unread: true },
    { id: 'n4', person: 'ns', type: 'like', text: 'and 5 others liked your comment', post: 'silicon-demo', time: '2h ago', day: 'Today' },
    { id: 'n5', person: 'mr', type: 'comment', text: 'commented on your post', quote: 'The docking scene. No question. I need to hear that score again.', post: 'ishant-earth', time: '1d ago', day: 'Yesterday' },
    { id: 'n6', person: 'ak', type: 'reply', text: 'replied to your comment', quote: 'A rewatch completely changes how that moment feels.', post: 'coordinates', time: '1d ago', day: 'Yesterday' },
    { id: 'n7', person: 'lm', type: 'like', text: 'and 8 others liked your post', post: 'ishant-interstellar', time: '1d ago', day: 'Yesterday' }
  ];
  const unreadCount = () => items.filter(item => item.unread).length;
  function updateBadge() {
    const count = unreadCount();
    document.querySelectorAll('.notification-count').forEach(badge => {
      badge.textContent = count ? String(count) : '';
      badge.hidden = count === 0;
      badge.parentElement.setAttribute('aria-label', count ? `Notifications, ${count} unread` : 'Notifications');
    });
  }
  function Card(item, onOpen) {
    const data = PocketSagaData.post(item.post);
    const person = pocketSagaData.people.find(person => person.id === item.person);
    const icon = item.type === 'like' ? 'heart' : item.type === 'reply' ? 'message-circle' : 'message-circle';
    return Action({ label: `${person.name} ${item.text}. ${item.time}. ${data.community.name}${item.unread ? '. Unread' : ''}`, className: `notification-item tap-feedback ${item.unread ? 'is-unread' : ''}`, children: [
      node('span', `notification-avatar notification-${item.type}`, [Avatar(person), node('span', 'notification-type', Icon(icon))]),
      node('span', 'notification-copy', [
        node('span', 'notification-summary', [node('strong', '', person.name), ` ${item.text}`]),
        node('span', 'notification-meta', [node('span', 'notification-group', [Icon('users'), data.community.name]), node('span', 'notification-time', item.time)])
      ])
    ], onClick: () => { item.unread = false; updateBadge(); onOpen(data.post); } });
  }
  function OpenUnread(screen, { onPost, onHistory }) {
    const existing = screen.querySelector('.notifications-overlay');
    if (existing) return () => {};
    const opener = document.activeElement;
    const overlay = node('div', 'notifications-overlay');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Unread notifications');
    const background = [...screen.children].map(element => [element, element.inert]);
    background.forEach(([element]) => { element.inert = true; });
    let closed = false, removed = false, exitAnimation = null;
    const settleAnimations = new Map();
    const previewScale = () => overlay.getBoundingClientRect().width / overlay.offsetWidth || 1;
    function remove(restoreFocus = true) {
      if (removed) return;
      removed = true;
      settleAnimations.forEach(animation => animation.cancel());
      settleAnimations.clear();
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      background.forEach(([element, inert]) => { element.inert = inert; });
      if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    }
    function close(restoreFocus = true, afterClose = () => {}) {
      if (closed || removed) return;
      closed = true;
      overlay.inert = true;
      settleAnimations.forEach(animation => animation.cancel());
      settleAnimations.clear();
      const finish = () => { remove(restoreFocus); afterClose(); };
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
      const cards = [...list.children].reverse();
      const controls = [panel.querySelector('.notifications-overlay-title'), panel.querySelector('.notifications-history')];
      // Preserve the current entrance frame when closing before it finishes.
      for (const element of [overlay, ...cards, ...controls]) {
        const style = getComputedStyle(element);
        const snapshot = { opacity: style.opacity, transform: style.transform, filter: style.filter };
        element.style.animation = 'none';
        gsap.set(element, snapshot);
      }
      exitAnimation = gsap.timeline({ onComplete: finish })
        .to(cards, { y: -20, opacity: 0, filter: 'blur(7px)', duration: .24, stagger: { each: .035, amount: Math.min(.14, Math.max(0, cards.length - 1) * .035) }, ease: 'power2.in' }, 0)
        .to(controls, { y: -10, opacity: 0, filter: 'blur(4px)', duration: .22, ease: 'power2.in' }, 0)
        .to(overlay, { opacity: 0, backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)', duration: .3, ease: 'power2.inOut' }, .08);
    }
    const list = node('div', 'notifications-unread-list');
    const unread = items.filter(item => item.unread);
    const title = node('h2', 'notifications-overlay-title');
    title.setAttribute('aria-live', 'polite');
    title.setAttribute('aria-atomic', 'true');
    function updateTitle() {
      const count = unreadCount();
      title.textContent = count ? `${count} notification${count === 1 ? '' : 's'}` : 'No notifications';
    }
    updateTitle();
    function enableSwipeDismiss(card, item) {
      let gesture = null, swipeGhost = null, restoring = false, suppressClickUntil = 0;
      card.setAttribute('aria-description', 'Swipe left or right to dismiss. Press Delete to dismiss.');
      card.setAttribute('aria-keyshortcuts', 'Delete Backspace');
      card.addEventListener('click', event => {
        if (!card.dataset.dismissing && performance.now() >= suppressClickUntil) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
      function makeSwipeGhost() {
        const cardRect = card.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();
        const scale = previewScale();
        swipeGhost = card.cloneNode(true);
        swipeGhost.classList.add('notification-swipe-ghost');
        swipeGhost.setAttribute('aria-hidden', 'true');
        swipeGhost.inert = true;
        swipeGhost.style.animation = 'none';
        swipeGhost.style.left = `${(cardRect.left - overlayRect.left) / scale}px`;
        swipeGhost.style.top = `${(cardRect.top - overlayRect.top) / scale}px`;
        swipeGhost.style.width = `${cardRect.width / scale}px`;
        swipeGhost.style.height = `${cardRect.height / scale}px`;
        overlay.append(swipeGhost);
        card.style.opacity = '0';
      }
      function restore() {
        if (!swipeGhost) return;
        restoring = true;
        const returning = swipeGhost;
        const revealCard = () => {
          returning.remove();
          if (swipeGhost === returning) swipeGhost = null;
          card.style.opacity = '';
          card.style.transition = '';
          card.classList.remove('is-swiping');
          restoring = false;
        };
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { revealCard(); return; }
        const start = getComputedStyle(returning);
        returning.animate([
          { transform: start.transform, opacity: start.opacity },
          { transform: 'translateX(0px)', opacity: 1 }
        ], { duration: 200, easing: 'ease-out' }).finished.then(revealCard, revealCard);
      }
      async function dismiss(direction) {
        if (card.dataset.dismissing || closed || removed) return;
        card.dataset.dismissing = 'true';
        card.classList.remove('is-swiping');
        card.style.animation = 'none';
        card.style.transition = 'none';
        item.unread = false;
        updateBadge();
        updateTitle();
        const movingCard = swipeGhost || card;
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          const start = getComputedStyle(movingCard);
          const flight = movingCard.animate([
            { transform: start.transform, opacity: start.opacity },
            { transform: `translateX(${direction * (overlay.clientWidth + movingCard.offsetWidth)}px)`, opacity: 0 }
          ], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
          await flight.finished.catch(() => {});
        }
        if (swipeGhost) { swipeGhost.remove(); swipeGhost = null; }
        if (!card.isConnected) return;
        const wasFocused = document.activeElement === card;
        const survivors = [...list.children].filter(element => element !== card);
        const movers = [...survivors, panel.querySelector('.notifications-history')];
        const scale = previewScale();
        // Read the current visual positions, including any interrupted settle.
        const canOverflow = list.scrollHeight <= list.clientHeight + 1;
        if (canOverflow) list.style.overflow = 'visible';
        const before = movers.map(element => element.getBoundingClientRect().top);
        movers.forEach(element => {
          settleAnimations.get(element)?.cancel();
          settleAnimations.delete(element);
          element.style.animation = 'none';
        });
        card.remove();
        if (!closed && !removed && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          movers.forEach((element, index) => {
            const dy = (before[index] - element.getBoundingClientRect().top) / scale;
            if (Math.abs(dy) < .5) return;
            const animation = element.animate([
              { transform: `translateY(${dy}px)` },
              { transform: 'translateY(0)' }
            ], { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' });
            settleAnimations.set(element, animation);
            animation.finished.then(() => {
              if (settleAnimations.get(element) === animation) settleAnimations.delete(element);
              if (!settleAnimations.size) list.style.removeProperty('overflow');
            }, () => {});
          });
        }
        if (!settleAnimations.size) list.style.removeProperty('overflow');
        if (wasFocused && !closed && !removed) {
          (list.querySelector('.notification-item:not([data-dismissing])') || panel.querySelector('.notifications-history')).focus({ preventScroll: true });
        }
      }
      card.addEventListener('pointerdown', event => {
        if (card.dataset.dismissing || restoring || (event.pointerType === 'mouse' && event.button !== 0)) return;
        gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), swiping: false };
      });
      card.addEventListener('pointermove', event => {
        if (!gesture || event.pointerId !== gesture.id) return;
        const dx = (event.clientX - gesture.x) / previewScale(), dy = (event.clientY - gesture.y) / previewScale();
        if (!gesture.swiping) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
          if (Math.abs(dy) >= Math.abs(dx)) { gesture = null; return; }
          gesture.swiping = true;
          card.setPointerCapture(event.pointerId);
          card.style.animation = 'none';
          card.style.transition = 'none';
          card.classList.add('is-swiping');
          makeSwipeGhost();
        }
        if (event.cancelable) event.preventDefault();
        swipeGhost.style.transform = `translateX(${dx}px)`;
        swipeGhost.style.opacity = String(Math.max(.35, 1 - Math.abs(dx) / card.offsetWidth));
      });
      card.addEventListener('pointerup', event => {
        if (!gesture || event.pointerId !== gesture.id) return;
        const dx = (event.clientX - gesture.x) / previewScale();
        const swiping = gesture.swiping;
        const speed = Math.abs(dx) / Math.max(1, performance.now() - gesture.time);
        gesture = null;
        if (!swiping) return;
        suppressClickUntil = performance.now() + 350;
        if (Math.abs(dx) > card.offsetWidth * .25 || (Math.abs(dx) > 28 && speed > .55)) dismiss(Math.sign(dx));
        else restore();
      });
      card.addEventListener('pointercancel', event => {
        if (!gesture || event.pointerId !== gesture.id) return;
        if (gesture.swiping) restore();
        gesture = null;
      });
      card.addEventListener('keydown', event => {
        if (event.key !== 'Delete' && event.key !== 'Backspace') return;
        event.preventDefault();
        dismiss(-1);
      });
    }
    unread.forEach((item, index) => {
      const card = Card(item, post => { close(false, () => onPost(post)); });
      card.style.setProperty('--notification-delay', `${40 + Math.min(index, 6) * 40}ms`);
      enableSwipeDismiss(card, item);
      list.append(card);
    });
    const panel = node('section', 'notifications-unread-panel', [
      title,
      list,
      Action({ label: 'Show notification history', className: 'detail-pill notifications-history tap-feedback', children: ['Show notification history', Icon('chevron-down')], onClick: () => { close(false, onHistory); } })
    ]);
    overlay.append(panel);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    function onKey(event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const buttons = [...overlay.querySelectorAll('button:not([disabled])')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    screen.append(overlay);
    panel.querySelector('.notifications-history').focus({ preventScroll: true });
    return () => { exitAnimation?.kill(); remove(false); };
  }
  function Page() {
    let page;
    const emit = (action, detail = {}) => page.dispatchEvent(new CustomEvent('notifications-action', { bubbles: true, detail: { action, ...detail } }));
    const list = node('div', 'notifications-list');
    function render() {
      list.replaceChildren();
      for (const day of ['Today', 'Yesterday']) {
        const records = items.filter(item => item.day === day);
        if (!records.length) continue;
        list.append(node('h2', 'notifications-day', day));
        records.forEach(item => list.append(Card(item, post => { render(); emit('open-post', { post }); })));
      }
      if (!list.children.length) list.append(node('div', 'notifications-empty', [Icon('check'), node('h2', '', 'All caught up'), node('p', '', 'New likes, comments and replies will appear here.')]));
      updateBadge();
    }
    const header = node('header', 'page-navigation', [Action({ label: 'Back', icon: 'arrow-left', className: 'round-action', children: '', onClick: () => emit('back') }), node('h1', 'screen-navigation-title notifications-heading', 'Notification History'), node('span', 'notifications-header-spacer')]);
    const content = node('div', 'notifications-scroll', [list]);
    page = PhoneFrame({ device: pocketSagaData.device, content });
    page.classList.add('notifications-page');
    page.querySelector('.phone-screen').append(header);
    render();
    return page;
  }
  window.PocketSagaNotifications = { Page, Card, OpenUnread, unreadCount };
})();
