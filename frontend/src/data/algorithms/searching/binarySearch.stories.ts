import type { RealWorldStory } from '@/types/implementation';

export const binarySearchRealWorldStories: RealWorldStory[] = [
  {
    id: 'binary-search-beat-the-algorithm',
    title: '擊敗演算法：Binary Search 猜數字對決',
    category: '互動遊戲',
    tags: ['Binary Search', 'O(log n)', '猜數字'],
    content: `二分搜尋的核心是「每次決策消除約一半可能性」。在 1～100 的範圍內，理論上最多約 ⌈log₂(100)⌉ 次就能鎖定答案。

此互動遊戲讓你在數線上點選猜測，並與「永遠取中點」的 AI 影子同步對決。透過搜尋區間的視覺縮減與剩餘機率提示，你可以直觀感受 O(log n) 的收斂速度。`,
    interactiveGame: {
      type: 'binary-search-game',
    },
  },
];
