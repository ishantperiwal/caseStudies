/* Isolated, editorial translation samples. No translation service or catalog writes. */
PocketSagaMedia.ready.then(() => {
  const { node, Action } = PocketSaga;
  const variant = new URLSearchParams(location.search).get('variant') || 'discover';
  const { attach, original, english, commentOriginal, commentEnglish } = PocketSagaTranslation;
  const nav = node('nav', 'translation-preview-nav');
  nav.setAttribute('aria-label', 'Translation examples');
  for (const [key, label] of [['discover', 'Discover post'], ['group', 'Group post'], ['comment', 'Comment']]) {
    const link = node('a', 'tap-feedback', label);
    link.href = `?variant=${key}`;
    if (variant === key) link.setAttribute('aria-current', 'page');
    nav.append(link);
  }
  document.body.prepend(node('aside', 'translation-preview-tools', [node('p', 'translation-preview-label', 'Translation · Exploration'), nav, node('p', 'translation-preview-note', 'Spanish → English · Sample translations')]));
  let page, cleanup;
  if (variant === 'group') {
    const data = structuredClone(PocketSagaData.community('earth'));
    page = PocketSaga.CommunityPage(data);
    attach(page.querySelector('.post-card'), original, english);
    cleanup = () => PocketSaga.setupCommunity(page);
  } else if (variant === 'comment') {
    const feed = PocketSagaData.discover();
    const post = feed.posts.find(p => p.context?.includes('Interstellar')) || feed.posts[0];
    const data = structuredClone(PocketSagaData.post(post.id));
    page = PocketSagaPost.PostPage(data);
    attach(page.querySelector('.comment-card'), commentOriginal, commentEnglish, true);
  } else {
    const data = structuredClone(PocketSagaData.discover());
    const target = data.posts.find(p => p.context?.includes('Interstellar')) || data.posts[0];
    data.posts = [target, ...data.posts.filter(p => p !== target)];
    const view = PocketSagaDiscover.DiscoverPage(data);
    page = view.element;
    const decorate = () => {
      const card = page.querySelector(`.discover-post[data-post-id="${target.id}"]`);
      if (card) attach(card, original, english);
    };
    decorate();
    const observer = new MutationObserver(decorate);
    observer.observe(page.querySelector('.discover-post-list'), { childList: true });
    cleanup = () => () => { observer.disconnect(); view.destroy(); };
  }
  PocketSaga.mountPage(document.getElementById('app'), page, cleanup);
  requestAnimationFrame(() => {
    const card = page.querySelector('.translation-control').closest('article');
    const scroll = page.querySelector('.feed-scroll');
    const scale = scroll.getBoundingClientRect().width / scroll.offsetWidth;
    scroll.scrollTop += (card.getBoundingClientRect().top - scroll.getBoundingClientRect().top) / scale - 155;
  });
});
