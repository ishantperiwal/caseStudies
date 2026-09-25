/* Optional mock inserts. No catalog/store writes or navigation handlers. */
(() => {
  const T = () => PocketSagaTranslation;
  function isolate(template) {
    // Clone native markup without its event listeners or route behavior.
    const card = template.cloneNode(true);
    card.dataset.translationDemo = 'true';
    for (const el of [card, ...card.querySelectorAll('[tabindex], [role], button, a')]) {
      el.removeAttribute('tabindex');
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
      el.removeAttribute('aria-haspopup');
      el.removeAttribute('data-post-id');
      if (el.matches('button')) { el.disabled = true; el.setAttribute('aria-disabled', 'true'); }
      if (el.matches('a')) el.removeAttribute('href');
    }
    card.querySelectorAll('[data-post-id]').forEach(el => el.removeAttribute('data-post-id'));
    return card;
  }
  function sample(mediaId = 'interstellar') {
    if (mediaId === 'dark') return {
      original: { title: 'Winden también cuenta la historia', body: 'La lluvia, el bosque y las calles vacías hacen que Winden parezca un personaje más. Incluso una conversación tranquila tiene algo inquietante.' },
      english: { title: 'Winden tells a story of its own', body: 'The rain, the forest and the empty streets make Winden feel like another character. Even a quiet conversation has something unsettling about it.' }
    };
    return T();
  }
  function insertDiscover(list, data, renderPost) {
    const reference = data.posts.find(post => post.context?.includes('Interstellar')) || data.posts[0];
    if (!reference || list.querySelector('[data-translation-demo]')) return;
    const card = isolate(renderPost({ ...reference, id: 'translation-demo-discover' }));
    const save = PocketSaga.node('span', 'translation-demo-save', PocketSaga.Icon('bookmark'));
    save.setAttribute('aria-label', 'Save (preview only)');
    card.querySelector('.reaction-bar').append(save);
    T().attach(card, T().original, T().english);
    list.insertBefore(card, list.children[3] || null);
  }
  function insertGroup(page, data) {
    if (!['winden-theories', 'dark', 'earth'].includes(data.community.id)) return;
    const feed = page.querySelector('.post-list');
    if (!feed || feed.querySelector('[data-translation-demo]')) return;
    const copy = sample(data.community.id === 'earth' ? 'interstellar' : 'dark');
    const post = { id: 'translation-demo-group', author: pocketSagaData.people.find(p => p.id === 'lm'), time: '16 min ago', type: 'Thought', ...copy.english, likes: 14, comments: 3 };
    const card = isolate(PocketSaga.PostCard(post, data.community.context, () => {}));
    const save = PocketSaga.node('span', 'translation-demo-save', PocketSaga.Icon('bookmark'));
    save.setAttribute('aria-label', 'Save (preview only)');
    card.querySelector('.reaction-bar').append(save);
    T().attach(card, copy.original, copy.english);
    const spoiler = feed.querySelector('[data-spoiler-demo]');
    if (spoiler) spoiler.after(card); else feed.append(card);
  }
  function insertComment(page, data) {
    const first = PocketSagaData.discover().posts[0];
    if (data.post.id !== first?.id || page.querySelector('[data-translation-demo]')) return;
    const comment = { id: 'translation-demo-comment', author: { id: 'translation-demo-mateo', name: 'Mateo R.', initials: 'MR', avatarId: 'amber', color: '#665A44' }, time: 'Just now', body: T().commentEnglish.body, likes: 3 };
    const card = isolate(PocketSagaPost.CommentCard(comment, () => {}));
    T().attach(card,
      { body: 'También me fijé en esos detalles. Ver los mismos lugares en épocas distintas hace que cada escena parezca esconder una pista.' },
      { body: 'I noticed those details too. Seeing the same places in different time periods makes every scene feel like it is hiding a clue.' }, true);
    page.querySelector('.comment-list').prepend(card);
    page.dataset.translationCommentCount = '1';
    page.querySelector('.comments-heading').textContent = `${data.post.commentCount + 1} Comments`;
  }
  window.PocketSagaTranslationDemo = { insertDiscover, insertGroup, insertComment };
})();
