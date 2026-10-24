import type { RealWorldStory } from '@/types/implementation';

export const binarySearchRealWorldStories: RealWorldStory[] = [
  {
    id: 'binary-search-beat-the-algorithm',
    interactiveGame: {
      type: 'binary-search-game',
    },
  },
  {
    id: 'algo-001',
    video: {
      url: 'https://youtu.be/FQx3k92LzTI',
      duration: '9:38',
    },
    resources: [
      {
        type: 'paper',
        url: 'https://research.nvidia.com/sites/default/files/pubs/2012-06_Maximizing-Parallelism-in/karras2012hpg_paper.pdf',
      },
      {
        type: 'paper',
        url: 'https://web.cs.ucla.edu/~varghese/research/scalableiplookupacmTOCS2001.pdf',
      },
    ],
  },
];
