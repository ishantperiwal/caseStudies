// Change this object to reuse the page in another context.
window.communityPageData = {
  theme: { accent: '#BDE0CA', text: '#EEF2E9', muted: '#A3B4AD', body: '#AFBCB5', background: '#080A0B' },
  device: { width: '438px', time: '9:41', label: 'PocketSaga iPhone preview' },
  community: {
    name: 'Beyond Earth', context: 'Interstellar · Movie', membership: '86K members',
    artwork: 'components/assets/interstellar-1.jpg', background: 'components/assets/interstellar-1.jpg',
    description: 'For everyone still thinking about the journey home. Share the science, the scenes and the questions that stayed with you.',
    joined: true
  },
  viewer: { initials: 'AK', color: '#4D6654' },
  labels: { composer: 'Write in this community…', posts: 'Posts', sort: 'Recent first', joined: 'Joined', join: 'Join community', empty: 'No posts yet.' },
  posts: [
    {
      id: 'coordinates', title: 'Was Cooper always meant to send the coordinates?',
      body: 'The coordinates lead him to NASA, but he sends them from the tesseract later. Is this a closed loop, or did someone have to start it?',
      author: { name: 'Mina R.', initials: 'MR', color: '#5B5550' }, time: '8 min ago', type: 'Theory', likes: 24, comments: 12,
      attachment: { title: 'Interstellar', subtitle: 'The tesseract · Clip', artwork: 'components/assets/interstellar-1.jpg', action: 'Watch Clip' }
    },
    {
      id: 'messages', title: 'Cooper watching 23 years of messages broke me.',
      body: 'The messages are so ordinary, and that’s what makes them devastating. I wasn’t ready for that silence.',
      author: { name: 'Lucía M.', initials: 'LM', color: '#5B5550' }, time: '24 min ago', type: 'Discussion', likes: 16, comments: 7
    },
    {
      id: 'docking', title: 'The docking scene still makes me hold my breath.',
      body: 'The spinning ship, the organ and that impossible approach. Does any other scene make you feel the stakes this physically?',
      author: { name: 'Nao S.', initials: 'NS', color: '#5B5550' }, time: '1 hr ago', type: 'Discussion', likes: 9, comments: 3
    }
  ]
};
