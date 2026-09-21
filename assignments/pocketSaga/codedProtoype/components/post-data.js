// Screen 03 · Dark / Post and comments, from the pen.dev design.
window.postPageData = {
  device: { width: '438px', time: '9:41', label: 'PocketSaga post preview' },
  background: 'components/assets/dark-artwork.png',
  viewer: { name: 'You', initials: 'AK', color: '#4D6654' },
  community: { name: 'Dark community' },
  post: {
    id: 'winden-history', author: { name: 'Mina R.', initials: 'MR', color: '#5B5550' },
    time: '8 min ago', type: 'Theory', title: 'Is Winden repeating its own history?',
    paragraphs: [
      'Seeing 1986 beside 2019 makes every familiar face feel like a clue. Are these echoes, or is something repeating?',
      'The same streets feel completely different once you know who was there before. I keep pausing to look at the backgrounds. What did you notice in this episode?'
    ],
    likes: 24, commentCount: 12,
    attachment: { title: 'Dark', subtitle: 'S1 · Episode 3', artwork: 'components/assets/dark-artwork.png', action: 'Watch Clip' }
  },
  comments: [
    { id: 'lucia', author: { name: 'Lucía M.', initials: 'LM', color: '#455666' }, time: '3 min ago',
      body: 'I read it differently: maybe the parallels show how families repeat the same mistakes.',
      translation: 'Translated from Spanish · See original', likes: 5 },
    { id: 'nao', author: { name: 'Nao S.', initials: 'NS', color: '#665A44' }, time: '6 min ago',
      body: 'Yes! Seeing the same places in another decade makes Winden feel trapped in its own memories.',
      likes: 9, liked: true, replyCount: 3, replies: [
        { id: 'nao-mina', author: { name: 'Mina R.', initials: 'MR', color: '#5B5550' }, isAuthor: true, time: '2 min ago', body: 'Exactly. The town feels like a character itself.', likes: 4 },
        { id: 'nao-lucia', author: { name: 'Lucía M.', initials: 'LM', color: '#455666' }, time: '1 min ago', body: 'The school stood out to me. Same place, but the people bring a completely different feeling.', likes: 2 },
        { id: 'nao-arjun', author: { name: 'Arjun K.', initials: 'AK', color: '#4D6654' }, time: 'Just now', body: 'I noticed that too. Even the familiar streets feel uneasy once you see them in 1986.', likes: 1 }
      ] }
  ]
};
