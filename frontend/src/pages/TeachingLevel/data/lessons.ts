import type { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  {
    id: 'intro-algorithm',
    title: '演算法入門',
    subtitle: '理解程式設計的核心思維',
    icon: 'diagram-project',
    color: '#635bff',
    estimatedMinutes: 5,
    slides: [
      {
        type: 'cover',
        title: '演算法入門',
        subtitle: '理解程式設計的核心思維',
      },
      {
        type: 'concept',
        title: '什麼是演算法？',
        body: '演算法（Algorithm）是解決特定問題的有限步驟指令集。簡單來說，演算法就是一個明確的「解題方法」，告訴電腦應該如何一步一步地完成某個任務。\n\n就像烹飪食譜一樣，演算法定義了從輸入到輸出的完整過程。',
      },
      {
        type: 'list',
        title: '演算法的五大特性',
        items: [
          '輸入（Input）：有零個或多個明確的輸入資料',
          '輸出（Output）：至少有一個可觀察的輸出結果',
          '明確性（Definiteness）：每個步驟都清晰、無歧義',
          '有限性（Finiteness）：必須在有限步驟內終止',
          '有效性（Effectiveness）：每個步驟都可以被實際執行',
        ],
      },
      {
        type: 'comparison',
        title: '生活中的演算法',
        comparisons: [
          {
            label: '烹飪食譜',
            description:
              '食譜就是一個演算法：食材是「輸入」，每個烹飪步驟都必須明確（幾度、幾分鐘），最後端出料理是「輸出」。步驟順序不能錯，否則結果完全不同——這正是演算法明確性與有序性的體現。',
            icon: 'utensils',
            color: '#f59e0b',
          },
          {
            label: '導航路線規劃',
            description:
              '你輸入起點與終點，系統在地圖的數萬條道路中套用 Dijkstra 或 A* 演算法，在毫秒內找出最短或最快的路徑，再一步步指引你前進。不同的演算法會給出不同品質的路線，這就是演算法優劣的差距。',
            icon: 'map',
            color: '#10b981',
          },
          {
            label: '搜尋引擎排序',
            description:
              '你每次輸入關鍵字，搜尋引擎都在幾百毫秒內掃描數十億個網頁，依關聯度、權威性、點擊率、時效性等數十個指標為結果排序。這背後是複數個高度優化的演算法在同時協作——讓你總能在第一頁找到答案。',
            icon: 'magnifying-glass',
            color: '#3b82f6',
          },
        ],
      },
      {
        type: 'summary',
        title: '本節重點回顧',
        items: [
          '演算法是解決問題的有限步驟指令集',
          '良好的演算法需具備五大特性：輸入、輸出、明確性、有限性、有效性',
          '演算法存在於日常生活的每個角落',
          '學習演算法能讓你寫出更高效、更可靠的程式',
        ],
      },
    ],
  },
  {
    id: 'intro-data-structure',
    title: '資料結構入門',
    subtitle: '組織資料的藝術',
    icon: 'database',
    color: '#10b981',
    estimatedMinutes: 5,
    slides: [
      {
        type: 'cover',
        title: '資料結構入門',
        subtitle: '組織資料的藝術',
      },
      {
        type: 'concept',
        title: '什麼是資料結構？',
        body: '資料結構（Data Structure）是電腦儲存、組織資料的方式與格式。不同的資料結構在不同場景下各有優劣，選擇正確的資料結構是高效程式設計的關鍵。\n\n就像現實中的收納方式一樣——書架、抽屜、文件夾都是不同的「資料結構」，各有其用途。',
      },
      {
        type: 'list',
        title: '為什麼需要資料結構？',
        items: [
          '提升效率：適當的結構大幅加快資料存取速度',
          '節省記憶體：合理組織資料減少不必要的空間浪費',
          '簡化程式邏輯：良好的結構讓程式碼更清晰易讀',
          '解決特定問題：某些問題必須使用特定資料結構才能有效解決',
          '提升可維護性：結構化的資料讓程式更容易維護與擴展',
        ],
      },
      {
        type: 'visual',
        title: '資料結構分類總覽',
        visual: 'ds-diagram',
      },
      {
        type: 'summary',
        title: '本節重點回顧',
        items: [
          '資料結構是電腦組織與儲存資料的方式',
          '線性結構：Array、Linked List、Stack、Queue',
          '非線性結構：Tree、Graph、Hash Table',
          '不同結構有不同的時間與空間複雜度',
          '選擇適合的資料結構是高效程式設計的基礎',
        ],
      },
    ],
  },
  {
    id: 'intro-big-o',
    title: 'Big O 時間複雜度',
    subtitle: '量化演算法效率的語言',
    icon: 'chart-line',
    color: '#f59e0b',
    estimatedMinutes: 8,
    slides: [
      {
        type: 'cover',
        title: 'Big O 時間複雜度',
        subtitle: '量化演算法效率的語言',
      },
      {
        type: 'concept',
        title: '為什麼需要量化效率？',
        body: '當我們有多種解法時，如何判斷哪個更好？\n\n直覺上「跑得快」不夠精確，因為受到硬體、語言、資料量的影響。我們需要一種客觀的方式來描述：\n\n當輸入規模 n 增大時，演算法所需的步驟數量如何增長？',
      },
      {
        type: 'concept',
        title: '什麼是 Big O 符號？',
        body: 'Big O 符號（Big O Notation）描述演算法在最壞情況下，執行步驟數量相對於輸入規模 n 的增長關係。\n\n重要原則：\n• 忽略常數因子（3n → O(n)）\n• 忽略低階項（n² + n → O(n²)）\n• 關注「量級」，不是精確計算',
      },
      {
        type: 'visual',
        title: 'Big O 複雜度比較圖',
        visual: 'big-o-chart',
      },
      {
        type: 'list',
        title: '常見複雜度（由快到慢）',
        items: [
          'O(1) 常數時間 — 無論輸入多大，執行時間固定（陣列索引存取）',
          'O(log n) 對數時間 — 每次將問題規模減半（二分搜尋）',
          'O(n) 線性時間 — 步驟與輸入等比增加（線性搜尋）',
          'O(n log n) 線性對數 — 高效排序演算法（合併排序、快速排序）',
          'O(n²) 平方時間 — 巢狀迴圈，效率差（泡泡排序）',
          'O(2ⁿ) 指數時間 — 避免！輸入稍大就會爆炸（窮舉法）',
        ],
      },
      {
        type: 'code',
        title: '複雜度分析範例',
        code: {
          language: 'python',
          content: `# O(1) — 常數時間，一步完成
def get_first(arr):
    return arr[0]

# O(n) — 線性時間，走遍每個元素一次
def find_max(arr):
    max_val = arr[0]
    for x in arr:
        if x > max_val:
            max_val = x
    return max_val

# O(n²) — 平方時間，巢狀迴圈
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):        # 外層跑 n 次
        for j in range(n-1):  # 內層跑 n-1 次
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`,
        },
      },
      {
        type: 'summary',
        title: '本節重點回顧',
        items: [
          'Big O 描述演算法最壞情況下的時間成長速度',
          '複雜度排序：O(1) < O(log n) < O(n) < O(n log n) < O(n²)',
          '目標是找到最低複雜度的演算法來解決問題',
          '時間複雜度幫助預測程式在大規模資料下的表現',
          '寫程式時永遠思考：「這個解法的複雜度是多少？」',
        ],
      },
    ],
  },
];
