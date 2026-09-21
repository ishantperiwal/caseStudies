/* Focused post and comment components, reusable standalone or inside the navigation shell. */
(() => {
  const { node, Action, Avatar, MediaAttachment, PhoneFrame, Composer, SeparatedMeta } = PocketSaga;
  const pageEmitters = new WeakMap();
  const pageSize = data => Math.max(1, Math.floor(data.commentPageSize || 10));
  function Attribution(post, community, emit) {
    return node('div', 'post-attribution', [Avatar(post.author), node('div', 'attribution-details', [
      node('div', 'attribution-line', [node('span', 'attribution-name', post.author.name), node('span', 'attribution-connector', 'posted in'), Action({ label: community.name, icon: 'users', className: 'community-link', onClick: () => emit('community', { community }) })]),
      SeparatedMeta([post.time, post.type], 'attribution-time', 'p')
    ])]);
  }
  function LikeButton(item, emit, className = '') {
    let liked = Boolean(item.liked);
    const button = Action({ label: `Like, ${item.likes} likes`, icon: 'heart', className: `detail-like ${className}`, children: node('span', 'like-count', String(item.likes)), onClick: () => {
      liked = !liked;
      const count = item.likes + Number(liked) - Number(Boolean(item.liked));
      button.setAttribute('aria-pressed', String(liked));
      button.setAttribute('aria-label', `${liked ? 'Unlike' : 'Like'}, ${count} likes`);
      button.querySelector('.like-count').textContent = count;
      emit('like', { item, liked, count });
    } });
    button.setAttribute('aria-pressed', String(liked));
    return button;
  }
  function PostActions(post, emit) {
    return node('div', 'post-detail-actions', [LikeButton(post, emit, 'detail-pill'), Action({ label: 'Share', icon: 'share-2', className: 'detail-pill', onClick: () => emit('share', { post }) })]);
  }
  function CommentCard(comment, emit) {
    const card = node('article', 'comment-card', [
      node('header', 'comment-author', [Avatar(comment.author), node('span', 'comment-name', comment.author.name), node('span', 'comment-time', comment.time), Action({ label: `Options for ${comment.author.name}’s comment`, icon: 'ellipsis', className: 'comment-options', children: '', onClick: () => emit('comment-options', { comment }) })]),
      node('p', 'comment-body', comment.body),
      comment.translation && Action({ label: comment.translation, children: SeparatedMeta(comment.translation), className: 'comment-translation', onClick: () => emit('translation', { comment }) }),
      node('footer', 'comment-actions', [LikeButton(comment, emit), Action({ label: `Reply to ${comment.author.name}`, children: 'Reply', className: 'comment-reply', onClick: () => emit('reply', { comment }) }), comment.replyCount && Action({ label: `${comment.replyCount} replies`, className: 'comment-reply-count', onClick: () => emit('replies', { comment }) })])
    ]);
    card.dataset.commentId = comment.id;
    card.tabIndex = 0;
    card.setAttribute('aria-label', `Comment by ${comment.author.name}. Open focus mode`);
    card.setAttribute('aria-haspopup', 'dialog');
    card.addEventListener('click', event => {
      if (event.target.closest('button, a, input, textarea') || window.getSelection()?.toString()) return;
      emit('focus-comment', { comment });
    });
    card.addEventListener('keydown', event => {
      if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      emit('focus-comment', { comment });
    });
    return card;
  }
  function CommentsSection(data, emit) {
    return node('section', 'comments-section', [
      node('div', 'comments-toolbar', [node('h2', 'comments-heading', `${data.post.commentCount} Comments`), Action({ label: 'Recent first', icon: 'list-filter', className: 'comment-sort', children: '', onClick: () => emit('sort', {}) })]),
      node('div', 'comment-list', data.comments.slice(0, pageSize(data)).map(comment => CommentCard(comment, emit))),
      node('div', 'comments-page-sentinel')
    ]);
  }
  function PostPage(data, handlers = {}) {
    let page;
    const emit = (action, detail) => {
      handlers[action]?.(detail);
      page.dispatchEvent(new CustomEvent('post-action', { bubbles: true, detail: { action, ...detail } }));
    };
    const post = data.post;
    const content = node('div', 'feed-scroll post-scroll', [
      node('article', 'post-detail', [Attribution(post, data.community, emit), node('h1', 'post-detail-title', post.title), node('div', 'post-detail-body', post.paragraphs.map(paragraph => node('p', '', paragraph))), post.attachment && MediaAttachment(post.attachment, post, emit), PostActions(post, emit)]),
      CommentsSection(data, emit)
    ]);
    content.tabIndex = 0;
    content.setAttribute('role', 'region');
    content.setAttribute('aria-label', 'Post and comments');
    page = PhoneFrame({ device: data.device, background: data.background, content });
    page.classList.add('post-page');
    const composer = PocketSaga.MessageComposer(data.viewer, 'Add a comment…');
    composer.addEventListener('submit', event => {
      event.preventDefault();
      const input = composer.querySelector('.message-input');
      const body = input.value.trim();
      if (!body) return;
      const comment = { id: `local-comment-${Date.now()}`, author: data.viewer, time: 'Just now', body, likes: 0 };
      page.querySelector('.comment-list').prepend(CommentCard(comment, emit));
      post.commentCount += 1;
      page.querySelector('.comments-heading').textContent = `${post.commentCount} Comments`;
      input.value = '';
      composer.querySelector('.message-send').disabled = true;
      emit('send-comment', { comment });
    });
    page.querySelector('.phone-screen').append(node('div', 'post-fixed-composer', composer));
    page.querySelector('.phone-screen').append(node('nav', 'page-navigation post-navigation', [
      Action({ label: 'Go back', icon: 'arrow-left', className: 'round-action', children: '', onClick: () => emit('back', {}) }),
      node('span', 'post-navigation-title', 'Post'),
      Action({ label: 'Post options', icon: 'ellipsis', className: 'round-action post-options', children: '', onClick: () => emit('options', { post }) })
    ]));
    pageEmitters.set(page, emit);
    return page;
  }
  function paginateComments(page, data, handlers = {}) {
    const scroller = page.querySelector('.post-scroll');
    const list = page.querySelector('.comment-list');
    const sentinel = page.querySelector('.comments-page-sentinel');
    const controller = new AbortController();
    let offset = Math.min(pageSize(data), data.comments.length);
    let cursor = data.nextCommentsCursor ?? null;
    let loading = false, stopped = false;
    const ids = new Set(data.comments.slice(0, offset).map(comment => comment.id));
    const hasMore = () => offset < data.comments.length || (cursor !== null && typeof handlers.loadComments === 'function');
    const observer = new IntersectionObserver(async entries => {
      if (!entries.some(entry => entry.isIntersecting) || loading || stopped || !hasMore()) return;
      loading = true;
      list.setAttribute('aria-busy', 'true');
      observer.unobserve(sentinel);
      let failed = false;
      try {
        let comments;
        if (offset < data.comments.length) {
          comments = data.comments.slice(offset, offset + pageSize(data));
          offset += comments.length;
        } else {
          const result = await handlers.loadComments({ cursor, limit: pageSize(data), signal: controller.signal });
          if (stopped) return;
          comments = result.comments;
          // A repeated cursor must not create an endless request loop.
          cursor = result.nextCursor == null || result.nextCursor === cursor ? null : result.nextCursor;
        }
        for (const comment of comments) {
          if (ids.has(comment.id)) continue;
          ids.add(comment.id);
          list.append(CommentCard(comment, pageEmitters.get(page)));
        }
      } catch (error) {
        failed = true;
        if (!stopped) pageEmitters.get(page)('comments-error', { error });
      } finally {
        loading = false;
        list.setAttribute('aria-busy', 'false');
        if (!stopped && hasMore() && !failed) observer.observe(sentinel);
      }
    }, { root: scroller, rootMargin: '0px 0px 160px 0px' });
    // After a failed request, retry only on a later user scroll.
    const retry = () => { if (!loading && hasMore()) observer.observe(sentinel); };
    scroller.addEventListener('scroll', retry, { passive: true });
    if (hasMore()) observer.observe(sentinel);
    return () => {
      stopped = true;
      controller.abort();
      observer.disconnect();
      scroller.removeEventListener('scroll', retry);
    };
  }
  function setup(page, data, handlers = {}) {
      const stopPagination = paginateComments(page, data, handlers);
      const stopThread = PocketSagaThread.attach(page, data, pageEmitters.get(page));
      return () => { stopPagination(); stopThread(); };
  }
  window.PocketSagaPost = { Attribution, PostActions, LikeButton, CommentCard, CommentsSection, PostPage, setup,
    mount(target, data, handlers) { return PocketSaga.mountPage(target, PostPage(data, handlers), page => setup(page, data, handlers)); }
  };
})();
