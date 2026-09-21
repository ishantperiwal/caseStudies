PocketSagaMedia.ready.then(() => {
const postPreview = PocketSagaPost.mount(document.getElementById('app'), postPageData);
PocketSagaNavigation.attach(postPreview, postPageData, communityPageData);

});
