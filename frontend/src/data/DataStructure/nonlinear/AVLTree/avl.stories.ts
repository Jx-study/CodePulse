import type { RealWorldStory } from '@/types/implementation';

export const avlRealWorldStories: RealWorldStory[] = [
  {
    id: 'avl-when-to-use',
    resources: [
      { type: 'article', url: 'https://en.wikipedia.org/wiki/AVL_tree' },
      { type: 'article', url: 'https://www.boost.org/latest/doc/html/intrusive/avl_set_multiset.html' },
      { type: 'article', url: 'https://www.educative.io/answers/how-to-optimize-the-database-indexing-using-avl-trees' },
    ],
  },
  {
    id: 'avl-linux-vma-tree',
    resources: [
      { type: 'article', url: 'https://lkml.iu.edu/hypermail/linux/kernel/9809.0/0562.html' },
      { type: 'article', url: 'https://lkml.iu.edu/hypermail/linux/kernel/9911.3/0578.html' },
      { type: 'article', url: 'https://cdn.kernel.org/pub/linux/kernel/people/andrea/patches/v2.4/2.4.9/mmap-rb-1' },
      { type: 'article', url: 'https://lwn.net/Articles/845507' },
    ],
  },
];
