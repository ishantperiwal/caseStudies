const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function load(localStorage) {
  const scope = { window: {}, structuredClone, localStorage };
  vm.createContext(scope);
  for (const file of ['app-data.js', 'data-store.js']) vm.runInContext(fs.readFileSync(path.join(root, 'components', file), 'utf8'), scope);
  return { store: scope.window.PocketSagaData, catalog: scope.window.pocketSagaData };
}
test('every post resolves its own author, community, media and comments', () => {
  const { store, catalog } = load();
  for (const records of [catalog.people, catalog.media, catalog.communities, catalog.posts]) assert.equal(new Set(records.map(r => r.id)).size, records.length);
  for (const record of catalog.posts) {
    const view = store.post(record.id);
    assert.equal(view.post.title, record.title);
    assert.equal(view.post.author.id, record.authorId);
    assert.equal(view.community.id, record.communityId);
    assert.equal(view.post.commentCount, view.comments.length);
    assert.equal(view.background, catalog.media.find(m => m.id === record.mediaId).artwork);
    assert(fs.existsSync(path.join(root, view.background)));
  }
  for (const group of catalog.communities) assert(store.community(group.id).posts.every(post => post.communityId === group.id));
  assert(store.discover().yourPosts.every(post => post.author.id === catalog.viewerId));
  assert.throws(() => store.post('missing'), /Unknown post/);
});
test('publishing feeds every relevant adapter without changing seed data', () => {
  const { store, catalog } = load();
  const post = store.publish({ id: 'new-post', group: 'earth', mediaId: 'interstellar', title: 'A new thought', body: 'First\n\nSecond', likes: 0, comments: 0 });
  assert.equal(store.post(post.id).post.paragraphs.length, 2);
  assert.equal(store.community('earth').posts[0].id, post.id);
  assert.equal(store.discover().posts[0].id, post.id);
  assert(store.discover().yourPosts.some(p => p.id === post.id));
  assert(!catalog.posts.some(p => p.id === post.id));
});
test('comments and reactions stay scoped to their post', () => {
  const { store } = load();
  const before = store.post('ishant-silicon').post.commentCount;
  store.addComment('ishant-silicon', { id: 'new-comment', body: 'A thought', likes: 0 });
  store.setLike('ishant-silicon', true, 19);
  assert.equal(store.post('ishant-silicon').post.commentCount, before + 1);
  assert.equal(store.post('ishant-silicon').post.likes, 19);
  assert(!store.post('from-road').comments.some(c => c.id === 'new-comment'));
});

test('every post keeps its media identifier and only clip attachments say Watch clip', () => {
  const { store, catalog } = load();
  for (const record of catalog.posts) {
    const attachment = store.post(record.id).post.attachment;
    const media = catalog.media.find(item => item.id === record.mediaId);
    assert.equal(attachment.title, media.title);
    assert.equal(attachment.subtitle, media.subtitle);
    assert.equal(attachment.action, record.clip ? 'Watch clip' : 'Watch');
  }
  assert(store.discover().posts.every(post => post.attachment));
  assert(store.community('earth').posts.every(post => post.attachment));
  const scene = { src: 'components/assets/scene-example.jpg', alt: 'A scene still' };
  const draft = { group: 'earth', mediaId: 'interstellar', title: 'A thought', body: 'A scene', likes: 0, comments: 0 };
  const imagePost = store.publish({ ...draft, id: 'scene-post', scene });
  assert.equal(store.post(imagePost.id).post.scene, scene);
  assert.equal(imagePost.attachment.action, 'Watch');
  const clip = { src: 'clip-example.mp4' };
  const clipPost = store.publish({ ...draft, id: 'clip-post', clip });
  assert.equal(clipPost.attachment.action, 'Watch clip');
  assert.equal(clipPost.attachment.clip, clip);
});

test('saved posts stay unique, can be removed, and survive reload', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const { store } = load(storage);
  assert.equal(store.savedPosts().length, 3);
  store.savedPosts().forEach(post => store.setSaved(post.id, false));
  store.setSaved('winden', true);
  store.setSaved('winden', true);
  store.setSaved('silicon-demo', true);
  assert.equal(store.savedPosts().length, 2);
  assert.equal(store.savedPosts()[0].id, 'silicon-demo');
  const reloaded = load(storage).store;
  assert.equal(reloaded.isSaved('winden'), true);
  reloaded.setSaved('winden', false);
  assert.equal(load(storage).store.isSaved('winden'), false);
  assert.throws(() => store.setSaved('missing', true), /Unknown post/);
});
