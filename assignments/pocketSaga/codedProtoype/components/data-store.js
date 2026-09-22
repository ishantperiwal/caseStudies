/* Synchronous catalog adapters: also works when opening the HTML files directly.
   Runtime edits live in memory. Replace these methods with an API later without
   putting fetching or record lookup into the screen components. */
(() => {
  const catalog = structuredClone(window.pocketSagaData);
  const index = records => new Map(records.map(record => [record.id, record]));
  const people = index(catalog.people), media = index(catalog.media);
  const communities = index(catalog.communities);
  const postIds = catalog.posts.map(post => post.id);
  const viewer = people.get(catalog.viewerId);
  const requireRecord = (map, id, type) => {
    if (!map.has(id)) throw new Error(`Unknown ${type}: ${id}`);
    return map.get(id);
  };
  const hydrateComment = comment => ({ ...comment, author: requireRecord(people, comment.authorId, 'person'), replies: (comment.replies || []).map(hydrateComment) });
  const comments = new Map(catalog.posts.map(post => [post.id, post.comments.map(hydrateComment)]));
  const groups = catalog.communities.map(group => {
    const item = requireRecord(media, group.mediaId, 'media');
    return Object.assign(group, { artwork: item.artwork, background: item.artwork, context: `${item.title} · ${item.subtitle}`, membership: `${group.members} members` });
  });
  function mediaIdentifier(item, record) {
    return { title: item.title, subtitle: item.subtitle, artwork: item.artwork,
      kind: record.clip ? 'clip' : 'title', clip: record.clip || null,
      action: record.clip ? 'Watch clip' : 'Watch' };
  }
  const previews = new Map(catalog.posts.map(record => {
    const item = requireRecord(media, record.mediaId, 'media');
    requireRecord(communities, record.communityId, 'community');
    return [record.id, { ...record, group: record.communityId, author: requireRecord(people, record.authorId, 'person'), context: item.context || item.title, artwork: item.artwork, body: record.paragraphs[0] || '', comments: record.comments.length, attachment: mediaIdentifier(item, record) }];
  }));
  const device = label => ({ ...catalog.device, label: `PocketSaga ${label} preview` });
  function post(id = 'from-road') {
    const item = requireRecord(previews, id, 'post');
    const group = requireRecord(communities, item.group, 'community');
    return { device: device('post'), viewer, background: item.artwork, community: group,
      post: { ...item, likes: item.likes + Number(Boolean(item.liked)), commentCount: item.comments }, comments: comments.get(id) };
  }
  function community(id = 'earth') {
    const group = requireRecord(communities, id, 'community');
    return { device: device('community'), theme: catalog.theme, viewer, community: group,
      posts: postIds.map(id => previews.get(id)).filter(item => item.group === id) };
  }
  function discover() {
    return { device: device('discovery'), viewer, groups,
      history: catalog.watchHistory.map(entry => ({ ...requireRecord(media, entry.mediaId, 'media'), watchedLabel: entry.label })),
      posts: catalog.discoverPostIds.map(id => requireRecord(previews, id, 'post')),
      yourPosts: [...previews.values()].filter(post => post.author.id === viewer.id) };
  }
  function editor() {
    return { device: device('create post'), viewer, media: [...media.values()].map(item => ({ ...item, selectionLabel: item.mediaType === 'movie' ? 'Movie' : item.episode != null ? `S${item.season} · E${item.episode}` : item.season != null ? `Season ${item.season}` : item.scope, watchedLabel: catalog.watchHistory.find(entry => entry.mediaId === item.id)?.label })), groups,
      recommendations: Object.fromEntries([...media.keys()].map(id => [id, groups.filter(group => group.mediaId === id).map(group => group.id)])) };
  }
  function publish(draft) {
    const group = requireRecord(communities, draft.group, 'community');
    const item = requireRecord(media, draft.mediaId || group.mediaId, 'media');
    const record = { ...draft, authorId: viewer.id, communityId: group.id, mediaId: item.id,
      author: viewer, paragraphs: draft.body ? draft.body.split(/\n\s*\n/) : [], artwork: item.artwork,
      attachment: mediaIdentifier(item, draft) };
    previews.set(record.id, record); comments.set(record.id, []);
    postIds.unshift(record.id); catalog.discoverPostIds.unshift(record.id);
    return record;
  }
  function addComment(postId, comment) {
    requireRecord(previews, postId, 'post').comments += 1;
    comments.get(postId).unshift(comment);
  }
  function setLike(postId, liked, count) {
    const post = requireRecord(previews, postId, 'post');
    post.liked = liked; post.likes = count - Number(liked);
  }
  window.PocketSagaData = { post, community, discover, editor, publish, addComment, setLike,
    hasPost: id => previews.has(id), hasCommunity: id => communities.has(id) };
})();
