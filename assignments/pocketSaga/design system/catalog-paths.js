// Resolve the shared catalog from this demonstration’s directory.
window.pocketSagaData.media.forEach(item => { item.artwork = new URL(`../codedProtoype/${item.artwork}`, location.href).href; });
