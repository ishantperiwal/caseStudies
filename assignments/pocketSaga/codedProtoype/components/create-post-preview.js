const selectedMedia = createPostData.media.find(item => item.id === new URLSearchParams(location.search).get('media')) || null;
PocketSagaCreatePost.mount(document.getElementById('app'), createPostData, selectedMedia, { back: () => location.assign('discover.html') });
