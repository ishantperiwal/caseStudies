// Screen adapter; content lives in app-data.js.
(() => {
  const id = new URLSearchParams(location.search).get('post');
  window.postPageData = PocketSagaData.post(PocketSagaData.hasPost(id) ? id : 'from-road');
})();
