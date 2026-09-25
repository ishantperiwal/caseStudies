PocketSagaMedia.ready.then(() => {
  const { node, PhoneFrame, PostCard, SaveButton, AmbientArtwork, SeparatedMeta, Icon } = PocketSaga;
  const groupVariant = new URLSearchParams(location.search).get('variant') === 'group';
  const catalog = pocketSagaData;
  const feedData = PocketSagaData.discover();
  const media = catalog.media.find(item => item.id === 'dark');
  const author = catalog.people.find(person => person.id === 'lm');
  const spoilerGroup = feedData.groups.find(group => group.id === 'winden-theories');
  const spoilerCard = PocketSagaSpoiler.create({
    media,
    variant: groupVariant ? 'group' : 'discover',
    group: spoilerGroup,
    scope: 'Season 1',
    watchedThrough: 'Season 1 · Episode 3',
    author,
    time: '12 min ago',
    type: 'Theory',
    title: 'The detail that changes how the whole season fits together',
    body: 'Looking back at the earlier episodes, the same small detail keeps appearing in different places. I think it tells us more than the characters realize.',
    likes: 18,
    comments: 7
  });

  if (groupVariant) {
    const data = PocketSagaData.community(spoilerGroup.id);
    const page = PocketSaga.CommunityPage(data);
    const posts = page.querySelector('.post-list');
    posts.insertBefore(spoilerCard, posts.children[1] || null);
    if (data.posts.length < 2) {
      posts.append(PostCard({
        id: 'spoiler-preview-dark-atmosphere', author, time: '35 min ago', type: 'Thought',
        title: 'The atmosphere makes Winden feel like a character',
        body: 'The rain, the forest, and those quiet streets do so much of the storytelling. Even an ordinary conversation feels uneasy here.',
        likes: 12, comments: 3
      }, data.community.context, () => {}));
    }
    PocketSaga.mountPage(document.getElementById('app'), page, PocketSaga.setupCommunity);
    return;
  }

  function discoverCard(post) {
    const group = feedData.groups.find(item => item.id === post.group);
    const card = PostCard(post, post.context, () => {});
    card.classList.add('discover-post', 'spoiler-preview-normal-card');

    const artwork = post.artwork || group?.artwork;
    if (artwork) {
      PocketSagaMedia.apply(card, artwork);
      const atmosphere = node('div', 'discover-post-atmosphere', [
        AmbientArtwork(artwork, 'discover-post-artwork'),
        node('div', 'discover-post-veil')
      ]);
      atmosphere.setAttribute('aria-hidden', 'true');
      card.prepend(atmosphere);
    }

    card.querySelector('.post-copy').after(card.querySelector('.author-meta'));
    const groupLabel = node('span', 'spoiler-preview-community-link', [
      Icon('users'),
      node('span', 'discover-community-label', group?.name || 'Group')
    ]);
    const context = SeparatedMeta([
      groupLabel,
      group?.context || post.context
    ], 'discover-post-context', 'div');
    card.querySelector('.post-copy').prepend(context);
    return card;
  }

  const joinedPosts = feedData.posts.filter(post => feedData.groups.find(group => group.id === post.group)?.joined);
  const normalPosts = [joinedPosts[0], joinedPosts[1]].map(discoverCard);

  const feed = node('section', 'post-list spoiler-component-feed', [
    normalPosts[0],
    spoilerCard,
    normalPosts[1]
  ]);
  const scroll = node('div', 'feed-scroll spoiler-preview-scroll', [
    node('h1', 'spoiler-preview-heading', 'For you'),
    node('p', 'spoiler-preview-intro', 'You’ve watched Dark through Season 1 · Episode 3.'),
    feed
  ]);
  const page = PhoneFrame({ device: catalog.device, content: scroll });
  page.classList.add('spoiler-preview-page');
  PocketSaga.mountPage(document.getElementById('app'), page);
});
