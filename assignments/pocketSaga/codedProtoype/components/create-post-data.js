/* Small prototype catalog; the composer accepts the same shape with other data later. */
window.createPostData = {
  device: { ...discoverPageData.device, label: 'PocketSaga create post preview' },
  viewer: discoverPageData.viewer,
  media: discoverPageData.history.map(item => ({ ...item, scope: item.id === 'dark' ? 'Through S1 · E3' : 'Movie' })),
  groups: discoverPageData.groups,
  recommendations: { interstellar: ['earth'], whiplash: ['note'], prestige: ['reveal'], dark: ['dark'] }
};
