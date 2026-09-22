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
  function updateBadge() {
    const count = items.filter(item => item.unread).length;
    document.querySelectorAll('.notification-count').forEach(badge => { badge.textContent = String(count); badge.hidden = !count; badge.parentElement.setAttribute('aria-label', `Notifications, ${count} unread`); });
  }
  function Card(item, onOpen) {
    const data = PocketSagaData.post(item.post);
    const person = pocketSagaData.people.find(person => person.id === item.person);
    const icon = item.type === 'like' ? 'heart' : item.type === 'reply' ? 'message-circle' : 'message-circle';
    return Action({ label: `${person.name} ${item.text}. ${item.time}. ${data.community.name}${item.unread ? '. Unread' : ''}`, className: `notification-item ${item.unread ? 'is-unread' : ''}`, children: [
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
    function remove(restoreFocus = true) {
      if (removed) return;
      removed = true;
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      background.forEach(([element, inert]) => { element.inert = inert; });
      if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    }
    function close(restoreFocus = true, afterClose = () => {}) {
      if (closed || removed) return;
      closed = true;
      overlay.inert = true;
      const finish = () => { remove(restoreFocus); afterClose(); };
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
      const cards = [...list.children].reverse();
      const controls = [closeButton, panel.querySelector('.notifications-history')];
      // Preserve the current entrance frame when closing before it finishes.
      for (const element of [overlay, panel.querySelector('.notifications-unread-header'), ...cards, ...controls]) {
        const style = getComputedStyle(element);
        const snapshot = { opacity: style.opacity, transform: style.transform, filter: style.filter };
        element.style.animation = 'none';
        gsap.set(element, snapshot);
      }
      exitAnimation = gsap.timeline({ onComplete: finish })
        .to(cards, { y: 20, opacity: 0, filter: 'blur(7px)', duration: .24, stagger: { each: .035, amount: Math.min(.14, Math.max(0, cards.length - 1) * .035) }, ease: 'power2.in' }, 0)
        .to(controls, { y: 10, opacity: 0, filter: 'blur(4px)', duration: .22, ease: 'power2.in' }, 0)
        .to(overlay, { opacity: 0, backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)', duration: .3, ease: 'power2.inOut' }, .08);
    }
    const closeButton = Action({ label: 'Close notifications', icon: 'x', children: '', className: 'round-action', onClick: () => close() });
    const list = node('div', 'notifications-unread-list');
    const unread = items.filter(item => item.unread);
    unread.forEach((item, index) => {
      const card = Card(item, post => { close(false, () => onPost(post)); });
      card.style.setProperty('--notification-delay', `${60 + Math.min(index, 6) * 65}ms`);
      list.append(card);
    });
    if (!unread.length) list.append(node('div', 'notifications-empty', [Icon('check'), node('h2', '', 'All caught up'), node('p', '', 'No unread notifications.')]));
    const panel = node('section', 'notifications-unread-panel', [
      node('div', 'notifications-unread-header', closeButton),
      list,
      Action({ label: 'Show notification history', className: 'notifications-history', children: ['Show notification history', Icon('chevron-down')], onClick: () => { close(false, onHistory); } })
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
    closeButton.focus({ preventScroll: true });
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
    const header = node('header', 'page-navigation', [Action({ label: 'Back', icon: 'arrow-left', className: 'round-action', children: '', onClick: () => emit('back') }), node('h1', 'screen-navigation-title notifications-heading', 'Notifications'), node('span', 'notifications-header-spacer')]);
    const content = node('div', 'notifications-scroll', [list]);
    page = PhoneFrame({ device: pocketSagaData.device, content });
    page.classList.add('notifications-page');
    page.querySelector('.phone-screen').append(header);
    render();
    return page;
  }
  window.PocketSagaNotifications = { Page, Card, OpenUnread };
})();
