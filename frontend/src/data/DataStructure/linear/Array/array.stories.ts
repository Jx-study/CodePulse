import type { RealWorldStory } from '@/types/implementation';

export const arrayRealWorldStories: RealWorldStory[] = [
  {
    id: 'array-whack-a-mole',
    interactiveGame: { type: 'whack-a-mole' },
  },
  {
    id: 'tech-array-001',
    video: {
      url: 'https://youtu.be/KZjNU511xFo',
      duration: '7:11',
    },
    resources: [
      { type: 'article', url: 'https://www.masaischool.com/blog/applications-of-array-explained/' },
      { type: 'article', url: 'https://nareshit.com/blogs/arrays-in-c-programming-with-practical-examples' },
      { type: 'article', url: 'https://dev.to/shri50/n-d-arrays-understanding-with-real-life-examples-5b5l' },
    ],
  },
];
