import type { RealWorldStory } from '@/types/implementation';

export const binarySearchRealWorldStories: RealWorldStory[] = [
  {
    id: 'binary-search-beat-the-algorithm',
    title: '擊敗演算法：Binary Search 猜數字對決',
    category: '互動遊戲',
    tags: ['Binary Search', 'O(log n)', '猜數字'],
    content: `二分搜尋的核心是「每次決策消除約一半可能性」。在 1～100 的範圍內，理論上最多約 ⌈log₂(100)⌉ ≈ 7 次就能鎖定答案。

此互動遊戲讓你在數線上點選猜測，並與「永遠取中點」的 AI 影子同步對決。透過搜尋區間的視覺縮減與剩餘機率提示，你可以直觀感受 O(log n) 的收斂速度。`,
    interactiveGame: {
      type: 'binary-search-game',
    },
  },
  {
    id: 'algo-001',
    title: '隱藏在數位世界背後的超能力——二分搜尋',
    category: '基礎演算法 / 科技應用',
    tags: ['二分搜尋', 'GPU 平行運算', '網際網路路由', '分而治之'],
    content: `【化繁為簡的極致魔法】
二分搜尋的核心精神非常簡單：「每一步都砍掉一半不可能的選項」。這就像是在一本高達 100 萬頁的字典中找尋特定的字，如果使用傳統的線性搜尋一頁頁翻，可能耗費極大時間；但若使用二分搜尋，不到 20 次就能精準命中目標。這種 $O(\log n)$ 的指數級衰減威力，讓它成為處理巨量數據的首選。從工程師抓出程式錯誤的 Git Bisect 工具，到資料庫底層的索引查詢，這個直覺策略正是現代科技的基石。

【釋放 GPU 極限：3D 遊戲與平行運算】
當你在遊玩畫面逼真的 3A 遊戲大作時，GPU 必須在毫秒間判斷數百萬條光線與幾何模型的碰撞。根據 NVIDIA Research (2012) 的突破，他們利用「莫頓碼（Morton Code）」將複雜的 3D 空間座標壓縮扁平成可排序的一維線段。接著，GPU 的數千個運算核心可以同時開工，利用「二分搜尋」快速定位出各自負責區塊的分割點（Split Point）。這種大規模並行處理的技巧，讓系統能一次性建構出龐大的空間結構（如 BVH），徹底釋放了高階顯示卡的運算潛能，確保畫面極致流暢。

【網際網路的極速導航：IP 路由查找】
二分搜尋也是全球網際網路運作的「神經系統」。每個網路封包在傳遞時，路由器必須在極短時間內從數百萬條規則中決定路徑，這被稱為「最長前綴匹配（LPM）」。UCLA 團隊 (2001) 提出了一個大膽的想法：不對龐大的 IP 地址數量做搜尋，而是對「前綴長度」進行二分搜尋。這項突破將查找次數壓縮到對數等級（IPv4 僅需 5 次），使得全球路由器能以數百 Gb/s 的速度轉發資料，讓我們在任何流量壓力下依然能享有高速的網路體驗。`,
    video: {
      url: 'https://youtu.be/FQx3k92LzTI',
      title: '二分搜尋的秘密超能力',
      duration: '9:38',
    },
    resources: [
      {
        type: 'paper',
        url: 'https://research.nvidia.com/sites/default/files/pubs/2012-06_Maximizing-Parallelism-in/karras2012hpg_paper.pdf',
        title: 'Maximizing Parallelism in the Construction of BVHs, Octrees, and k-d Trees',
        source: 'High Performance Graphics (2012) / NVIDIA Research',
      },
      {
        type: 'paper',
        url: 'https://web.cs.ucla.edu/~varghese/research/scalableiplookupacmTOCS2001.pdf',
        title: 'Scalable High-Speed Prefix Matching',
        source: 'ACM Transactions on Computer Systems (2001) / UCLA',
      },
    ],
  },
];
