/* Shared, JSON-compatible prototype catalog. Edit content here; screens resolve records by ID. */
window.pocketSagaData = {
  "schemaVersion": 1,
  "device": {
    "width": "438px",
    "time": "9:41",
    "label": "PocketSaga discovery preview"
  },
  "theme": {
    "accent": "#BDE0CA",
    "text": "#EEF2E9",
    "muted": "#A3B4AD",
    "body": "#AFBCB5",
    "background": "#080A0B"
  },
  "viewerId": "ishant",
  "people": [
    {
      "id": "ishant",
      "avatarId": "mint",
      "name": "Ishant",
      "initials": "IP",
      "color": "#4D6654"
    },
    {
      "id": "mr",
      "avatarId": "rose",
      "name": "Mina R.",
      "initials": "MR",
      "color": "#5B5550"
    },
    {
      "id": "lm",
      "avatarId": "blue",
      "name": "Lucía M.",
      "initials": "LM",
      "color": "#455666"
    },
    {
      "id": "ns",
      "avatarId": "amber",
      "name": "Nao S.",
      "initials": "NS",
      "color": "#665A44"
    },
    {
      "id": "ak",
      "avatarId": "lilac",
      "name": "Arjun K.",
      "initials": "AK",
      "color": "#4D6654"
    }
  ],
  "media": [
    {
      "id": "interstellar",
      "title": "Interstellar",
      "subtitle": "Movie · 2014",
      "artwork": "components/assets/interstellar-1.jpg",
      "scope": "Movie",
      "mediaType": "movie"
    },
    {
      "id": "silicon-valley",
      "title": "Silicon Valley",
      "subtitle": "Season 1",
      "artwork": "components/assets/silicon-valley-color.jpg",
      "scope": "Season 1",
      "mediaType": "series",
      "context": "Silicon Valley · S1",
      "season": 1
    },
    {
      "id": "from",
      "title": "From",
      "subtitle": "Season 1",
      "context": "From · S1",
      "artwork": "components/assets/from-season-1.jpg",
      "scope": "Season 1",
      "mediaType": "series",
      "season": 1
    },
    {
      "id": "coherence",
      "title": "Coherence",
      "subtitle": "Movie · 2013",
      "artwork": "components/assets/coherence.jpg",
      "scope": "Movie",
      "mediaType": "movie"
    },
    {
      "id": "dark",
      "title": "Dark",
      "subtitle": "Season 1 · Episode 3",
      "context": "Dark · S1 E3",
      "artwork": "components/assets/dark-artwork.png",
      "scope": "Through S1 · E3",
      "mediaType": "series",
      "season": 1,
      "episode": 3
    }
  ],
  "watchHistory": [
    {
      "mediaId": "dark",
      "label": "Watched yesterday"
    },
    {
      "mediaId": "silicon-valley",
      "label": "Finished yesterday"
    },
    {
      "mediaId": "interstellar",
      "label": "Watched yesterday"
    },
    {
      "mediaId": "from",
      "label": "Finished 1 week ago"
    },
    {
      "mediaId": "coherence",
      "label": "Watched 1 week ago"
    }
  ],
  "communities": [
    {
      "id": "from-town",
      "name": "The Town After Dark",
      "members": "243K",
      "joined": false,
      "mediaId": "from",
      "description": "One road in, no way out. Share your Season 1 theories about the town, the talismans, and what waits beyond the trees."
    },
    {
      "id": "earth",
      "name": "Beyond Earth",
      "activeMemberCount": 128,
      "members": "86K",
      "joined": true,
      "mediaId": "interstellar",
      "description": "For everyone still thinking about the journey home. Share the science, the scenes and the questions that stayed with you."
    },
    {
      "id": "pied-piper",
      "name": "Pied Piper Garage",
      "activeMemberCount": 46,
      "members": "34K",
      "joined": true,
      "mediaId": "silicon-valley",
      "description": "Big ideas, terrible pitches, and one very crowded house. Talk Silicon Valley, starting with the first season."
    },
    {
      "id": "cosmic-questions",
      "name": "Cosmic Questions",
      "members": "28K",
      "activeMemberCount": 67,
      "joined": false,
      "mediaId": "interstellar",
      "description": "For the questions that follow you out of the cinema. Explore time, distance, and the human side of Interstellar."
    },
    {
      "id": "startup-chaos",
      "name": "Startup Chaos",
      "members": "19K",
      "activeMemberCount": 42,
      "joined": false,
      "mediaId": "silicon-valley",
      "description": "Great ideas, questionable decisions. Share your favourite Season 1 moments and the startup chaos that feels a little too familiar."
    },
    {
      "id": "coherence-dinner",
      "name": "The Other Dinner Party",
      "members": "17K",
      "activeMemberCount": 38,
      "joined": false,
      "mediaId": "coherence",
      "description": "One dinner, too many possibilities. Compare clues, question every return to the house, and untangle Coherence together."
    },
    {
      "id": "dark",
      "name": "Dark community",
      "members": "243K",
      "activeMemberCount": 112,
      "joined": false,
      "mediaId": "dark",
      "description": "Untangle Winden’s mysteries, timelines, and family connections together. Discussions here follow Season 1 through Episode 3."
    }
  ],
  "posts": [
    {
      "id": "from-road",
      "title": "Why does every road lead back to the town?",
      "time": "8 min ago",
      "type": "Theory",
      "likes": 24,
      "comments": [
        {
          "id": "lucia",
          "time": "3 min ago",
          "body": "I would start by comparing everyone’s arrival stories. The fallen tree feels like the one detail they all share.",
          "likes": 5,
          "authorId": "lm"
        },
        {
          "id": "nao",
          "time": "6 min ago",
          "body": "The talismans make me wonder whether the town has rules we have only seen a tiny part of.",
          "likes": 9,
          "liked": true,
          "replyCount": 3,
          "authorId": "ns",
          "replies": [
            {
              "id": "nao-mina",
              "isAuthor": true,
              "time": "2 min ago",
              "body": "Exactly. Finding a rule would make the place feel less random, even if it does not explain who made it.",
              "likes": 4,
              "authorId": "mr"
            },
            {
              "id": "nao-lucia",
              "time": "1 min ago",
              "body": "And everyone has a different idea of what is safe. The town and Colony House make that tension really interesting.",
              "likes": 2,
              "authorId": "lm"
            },
            {
              "id": "nao-arjun",
              "time": "Just now",
              "body": "I would be writing everything down. Every arrival, every sound, every detail that changes.",
              "likes": 1,
              "authorId": "ak"
            }
          ]
        }
      ],
      "tint": "#376b7420",
      "recommend": true,
      "authorId": "mr",
      "communityId": "from-town",
      "mediaId": "from",
      "paragraphs": [
        "The road looping back is scarier to me than the creatures. You can keep moving and still get absolutely nowhere. What would you try first?",
        "Season 1 makes the town feel like a set of rules nobody has finished learning. The talismans offer some safety, but knowing how to survive is not the same as knowing how to leave."
      ]
    },
    {
      "id": "messages",
      "title": "Cooper watching 23 years of messages broke me.",
      "time": "24 min ago",
      "type": "Thought",
      "likes": 137,
      "comments": [
        {
          "id": "messages-comment",
          "authorId": "ns",
          "time": "Just now",
          "body": "The birthday message is the part that always gets me.",
          "likes": 2,
          "replies": []
        }
      ],
      "tint": "#385b6720",
      "showGroup": true,
      "authorId": "lm",
      "communityId": "earth",
      "mediaId": "interstellar",
      "paragraphs": [
        "The messages are so ordinary, and that’s what makes them devastating. I wasn’t ready for that silence."
      ]
    },
    {
      "id": "silicon-demo",
      "title": "The TechCrunch demo is a perfect panic spiral.",
      "time": "1 hr ago",
      "type": "Discussion",
      "likes": 63,
      "comments": [
        {
          "id": "silicon-demo-comment",
          "authorId": "lm",
          "time": "Just now",
          "body": "The contrast between the team’s chaos and Jared trying to keep things organised is what makes it work for me.",
          "likes": 2,
          "replies": []
        }
      ],
      "tint": "#b64d4720",
      "showGroup": true,
      "authorId": "ns",
      "communityId": "pied-piper",
      "mediaId": "silicon-valley",
      "paragraphs": [
        "Every time Pied Piper gets close to a clean pitch, something else goes wrong. I spent the finale laughing and holding my breath at the same time.",
        "Richard finding a new approach under that pressure is so satisfying. Which Season 1 disaster was your favourite?"
      ]
    },
    {
      "id": "ishant-interstellar",
      "title": "The quiet moments stayed with me the longest.",
      "time": "2 hr ago",
      "type": "Thought",
      "likes": 32,
      "comments": [
        {
          "id": "ishant-interstellar-comment",
          "authorId": "lm",
          "time": "Just now",
          "body": "Those quiet scenes make the distance feel more real than any of the space shots.",
          "likes": 2,
          "replies": []
        }
      ],
      "authorId": "ishant",
      "communityId": "earth",
      "mediaId": "interstellar",
      "paragraphs": [
        "Everyone talks about the scale of this film. I keep thinking about Cooper sitting in front of a screen, trying to catch up on a life he missed."
      ]
    },
    {
      "id": "ishant-silicon",
      "title": "Jared quietly holds the whole team together.",
      "time": "Yesterday",
      "type": "Discussion",
      "likes": 18,
      "comments": [
        {
          "id": "ishant-silicon-comment",
          "authorId": "lm",
          "time": "Just now",
          "body": "He treats the tiniest bit of progress like a huge organisational victory. I love that about him.",
          "likes": 2,
          "replies": []
        }
      ],
      "authorId": "ishant",
      "communityId": "pied-piper",
      "mediaId": "silicon-valley",
      "paragraphs": [
        "Richard has the algorithm, but Jared keeps trying to turn a house full of arguments into an actual company. His completely sincere delivery makes every scene funnier."
      ],
      "tint": "#b64d4720"
    },
    {
      "id": "ishant-earth",
      "title": "Which scene would you watch on a big screen again?",
      "time": "2 weeks ago",
      "type": "Discussion",
      "likes": 24,
      "comments": [
        {
          "id": "ishant-earth-comment",
          "authorId": "lm",
          "time": "Just now",
          "body": "The wave sequence. I would love to feel that sound in a cinema again.",
          "likes": 2,
          "replies": []
        }
      ],
      "authorId": "ishant",
      "communityId": "earth",
      "mediaId": "interstellar",
      "paragraphs": [
        "For me, it’s the docking sequence. The music, the rotation, and that tiny moment of hesitation before everything lines up."
      ]
    },
    {
      "id": "coordinates",
      "title": "Was Cooper always meant to send the coordinates?",
      "time": "8 min ago",
      "type": "Theory",
      "likes": 24,
      "comments": [
        {
          "id": "coordinates-comment",
          "authorId": "lm",
          "time": "Just now",
          "body": "I read it as a closed loop. The coordinates were always part of his past.",
          "likes": 2,
          "replies": []
        }
      ],
      "authorId": "mr",
      "communityId": "earth",
      "mediaId": "interstellar",
      "paragraphs": [
        "The coordinates lead him to NASA, but he sends them from the tesseract later. Is this a closed loop, or did someone have to start it?"
      ],
      "clip": { "title": "The tesseract" }
    },
    {
      "id": "docking",
      "title": "The docking scene still makes me hold my breath.",
      "time": "1 hr ago",
      "type": "Discussion",
      "likes": 9,
      "comments": [
        {
          "id": "docking-comment",
          "authorId": "lm",
          "time": "Just now",
          "body": "The way the music keeps building makes that scene feel almost impossible to breathe through.",
          "likes": 2,
          "replies": []
        }
      ],
      "authorId": "ns",
      "communityId": "earth",
      "mediaId": "interstellar",
      "paragraphs": [
        "The spinning ship, the organ and that impossible approach. Does any other scene make you feel the stakes this physically?"
      ]
    },
    {
      "id": "cosmic-time",
      "title": "Time is the scariest part of Interstellar.",
      "time": "12 min ago",
      "type": "Thought",
      "likes": 38,
      "recommend": false,
      "authorId": "lm",
      "communityId": "earth",
      "mediaId": "interstellar",
      "paragraphs": [
        "The distance is huge, but it is the time passing at home that makes every decision feel impossible. A few minutes can cost someone an entire chapter of their life.",
        "Which moment made that cost feel real to you? For me, it was coming back from the water planet."
      ],
      "comments": [
        {
          "id": "cosmic-time-comment",
          "authorId": "ns",
          "time": "Just now",
          "body": "Romilly waiting all those years is the part I keep thinking about.",
          "likes": 3,
          "replies": []
        }
      ]
    },
    {
      "id": "startup-house",
      "title": "Would Pied Piper survive a normal office?",
      "time": "19 min ago",
      "type": "Discussion",
      "likes": 27,
      "recommend": false,
      "authorId": "ak",
      "communityId": "pied-piper",
      "mediaId": "silicon-valley",
      "paragraphs": [
        "Half the comedy comes from everyone living on top of each other. The house turns tiny disagreements into full company emergencies.",
        "I cannot imagine Season 1 working as well if they could just go home after a bad meeting."
      ],
      "comments": [
        {
          "id": "startup-house-comment",
          "authorId": "ns",
          "time": "Just now",
          "body": "Erlich would still find a way to make every meeting about himself.",
          "likes": 4,
          "replies": []
        }
      ]
    },
    {
      "id": "cosmic-silence",
      "title": "Which quiet scene deserves more attention?",
      "time": "33 min ago",
      "type": "Discussion",
      "likes": 19,
      "recommend": true,
      "authorId": "mr",
      "communityId": "cosmic-questions",
      "mediaId": "interstellar",
      "paragraphs": [
        "The huge sequences get the spotlight, but the pauses between them give the film its weight. Sometimes a face and a long silence are enough.",
        "I would love a thread of the smaller moments people remember most."
      ],
      "comments": [
        {
          "id": "cosmic-silence-comment",
          "authorId": "ns",
          "time": "Just now",
          "body": "Cooper looking at the messages. There is so much happening before he can say anything.",
          "likes": 6,
          "replies": []
        }
      ]
    },
    {
      "id": "startup-jared",
      "title": "Who would you actually want as your co-founder?",
      "time": "40 min ago",
      "type": "Discussion",
      "likes": 43,
      "recommend": true,
      "authorId": "lm",
      "communityId": "startup-chaos",
      "mediaId": "silicon-valley",
      "paragraphs": [
        "Richard has the idea, Jared brings structure, and the rest of the house brings an unpredictable amount of chaos. You can pick one person from Season 1.",
        "I am picking Jared. Somebody needs to remember that a company has to function tomorrow too."
      ],
      "comments": [
        {
          "id": "startup-jared-comment",
          "authorId": "ns",
          "time": "Just now",
          "body": "Jared, easily. I need someone who will make a plan when everyone else starts arguing.",
          "likes": 7,
          "replies": []
        }
      ]
    },
    {
      "id": "coherence-trust",
      "title": "When did you stop trusting everyone at the table?",
      "time": "35 min ago",
      "type": "Discussion",
      "likes": 42,
      "recommend": true,
      "authorId": "ak",
      "communityId": "coherence-dinner",
      "mediaId": "coherence",
      "paragraphs": [
        "The familiar faces are what make this so unsettling. Once I started questioning who had come back, even the smallest reaction felt suspicious.",
        "Was there one moment that changed how you watched the rest of the dinner?"
      ],
      "comments": [
        {
          "id": "coherence-trust-comment",
          "authorId": "mr",
          "time": "12 min ago",
          "body": "The conversations after they return feel just slightly off. I kept wondering whether I had missed something earlier.",
          "likes": 4,
          "replies": []
        }
      ]
    },
    {
      "id": "coherence-rewatch",
      "title": "This is a film I want to rewatch with a notebook.",
      "time": "35 min ago",
      "type": "Thought",
      "likes": 29,
      "recommend": true,
      "authorId": "lm",
      "communityId": "coherence-dinner",
      "mediaId": "coherence",
      "paragraphs": [
        "I spent the first viewing trying to keep up. Now I want to follow the little objects and choices that help everyone make sense of the night.",
        "The best part is how much tension comes from people talking in a room. It does not need a huge spectacle to feel completely out of control."
      ],
      "comments": [
        {
          "id": "coherence-rewatch-comment",
          "authorId": "mr",
          "time": "12 min ago",
          "body": "I tried tracking who left the house together. It made the next viewing even more interesting.",
          "likes": 4,
          "replies": []
        }
      ]
    },
    {
      "id": "winden",
      "title": "Is Winden repeating its own history?",
      "time": "18 min ago",
      "type": "Theory",
      "likes": 24,
      "recommend": true,
      "authorId": "mr",
      "communityId": "dark",
      "mediaId": "dark",
      "paragraphs": [
        "Seeing 1986 beside 2019 makes every familiar face feel like a clue. Are these echoes, or is something repeating?"
      ],
      "comments": [
        {
          "id": "winden-comment",
          "authorId": "lm",
          "time": "5 min ago",
          "body": "Maybe the parallels show how families repeat the same mistakes. I keep noticing the places that barely seem to change.",
          "likes": 5,
          "replies": []
        }
      ]
    },
    {
      "id": "dark-town",
      "title": "Winden feels like a character of its own.",
      "time": "18 min ago",
      "type": "Discussion",
      "likes": 17,
      "recommend": true,
      "authorId": "ns",
      "communityId": "dark",
      "mediaId": "dark",
      "paragraphs": [
        "The forest, the school, those quiet streets. By Episode 3, even familiar places feel different when you see who was there before. Which location stands out to you?"
      ],
      "comments": [
        {
          "id": "dark-town-comment",
          "authorId": "lm",
          "time": "5 min ago",
          "body": "The school. Seeing it in another decade makes the town feel trapped in its own memories.",
          "likes": 5,
          "replies": []
        }
      ]
    }
  ],
  "savedPostIds": ["silicon-demo", "messages", "winden"],
  "discoverPostIds": [
    "winden",
    "from-road",
    "startup-house",
    "coherence-trust",
    "cosmic-time",
    "messages",
    "startup-jared",
    "silicon-demo",
    "cosmic-silence",
    "coherence-rewatch",
    "dark-town"
  ]
};
