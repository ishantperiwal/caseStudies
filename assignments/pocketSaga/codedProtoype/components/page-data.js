// Screen adapter; content lives in app-data.js.
(() => {
  const id = new URLSearchParams(location.search).get('community');
  window.communityPageData = PocketSagaData.community(PocketSagaData.hasCommunity(id) ? id : 'earth');
})();
