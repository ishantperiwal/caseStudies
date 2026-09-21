PocketSagaMedia.ready.then(() => {
const communityPreview = PocketSaga.mount(document.getElementById('app'), communityPageData);
PocketSagaNavigation.attach(communityPreview, postPageData);

});
