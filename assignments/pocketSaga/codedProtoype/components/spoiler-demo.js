/* Presentation-only inserts. Never register these records in PocketSagaData. */
(() => {
  const examples = Object.freeze({
    'winden-theories': { mediaId: 'dark', scope: 'Season 1', after: 1,
      title: 'The detail that changes how the whole season fits together',
      body: 'Looking back at the earlier episodes, the same small detail keeps appearing in different places. I think it tells us more than the characters realize.' },
    dark: { mediaId: 'dark', scope: 'S1 · Episode 4', after: 2,
      title: 'That final scene made me reconsider the earlier clues',
      body: 'The closing moment gives an ordinary conversation a different meaning. I went back to watch the earlier scene and noticed how carefully it was framed.' },
    earth: { mediaId: 'interstellar', scope: 'Movie', after: 2,
      title: 'The ending brings the smallest moments back into focus',
      body: 'What stayed with me was how the final stretch returns to the relationship at the heart of the story. Those small moments feel different on a second watch.' }
  });

  function insert(page, data) {
    const example = examples[data.community.id];
    const feed = page.querySelector('.post-list');
    if (!example || !feed || feed.querySelector('[data-spoiler-demo]')) return;
    const media = pocketSagaData.media.find(item => item.id === example.mediaId);
    const author = pocketSagaData.people.find(person => person.id === 'lm');
    if (!media || !author) return;
    const card = PocketSagaSpoiler.create({ ...example, media, author, group: data.community,
      variant: 'group', time: '12 min ago', type: 'Thought', likes: 18, comments: 7 });
    card.dataset.spoilerDemo = data.community.id;
    feed.insertBefore(card, feed.children[example.after] || null);
    page.addEventListener('preview-unmount', () => card.disposeSpoiler(), { once: true });
  }
  window.PocketSagaSpoilerDemo = { insert };
})();
