import type { RealWorldStory } from '@/types/implementation';

export const arrayRealWorldStories: RealWorldStory[] = [
  {
    id: 'array-whack-a-mole',
    title: 'Array 索引打地鼠：O(1) 直接存取為何這麼快',
    category: '遊戲開發',
    tags: ['Array', '索引', 'Random Access', 'O(1)'],
    content: `【為什麼 Array 查找這麼快？】

第一層：Array 在記憶體中佔用連續位置。每個元素的地址 = 起始地址 + index × 元素大小。這個公式只需一次乘法加法，不管陣列多長，時間永遠是 O(1)。

【打地鼠就是直接存取的縮影】

第二層：在下方的打地鼠遊戲裡，每個洞都有明確的 index 標籤。當地鼠從 index 5 冒出，你的眼睛直接定位第 5 格——不用從頭數，不用遍歷。這正是 array[5] 的本質：給我 index，我立刻給你答案。

【1D vs 2D：同樣的道理，不同的維度】

第三層：一維陣列用單一 index，二維陣列用 [row][col] 兩個座標。但原理相同：address = base + (row × cols + col) × size。不論地圖多大，知道座標就能瞬間抵達——就像你在九宮格裡知道 [2][1] 就能直接找到那個洞。`,
    interactiveGame: { type: 'whack-a-mole' },
  },
];
