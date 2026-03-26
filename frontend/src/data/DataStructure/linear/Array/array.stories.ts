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
  {
    id: 'tech-array-001',
    title: '陣列的實戰應用：從生活到螢幕 — 支撐數位世界的隱形骨架',
    category: '數位科技 / 演算法科普',
    tags: ['陣列', '資料結構', '多維陣列'],
    content: `陣列（Array）是我們整個數位世界的骨架，無所不在地藏在我們的手機與電腦中。你可以把陣列想像成一整排超整齊的置物櫃，每個櫃子裡放的都是同一種類型的東西，並且連續沒有空隙地排列在一起。這種結構能將混亂化為秩序，例如比起為 60 個學生宣告 60 個獨立的變數，使用一個具有 60 個格子的陣列會乾淨俐落許多。

【一維陣列：生活的線性清單】
一維陣列就是一條線性的清單。生活中的雞蛋盒、電影院的座位，或是你手機裡的 Spotify 播放清單、聯絡人名單與氣象局的一週溫度紀錄，全都是一維陣列的應用場景。陣列最強大之處在於它的「索引」（Index），就像置物櫃的門牌號碼，讓電腦能瞬間找到特定資料，效率極高。需要特別留意的是，在電腦程式的世界裡，索引通常是從 0 開始計算的。

【二維陣列：表格與數位影像】
將幾條線疊在一起變成平面網格，就形成了二維陣列。除了你每天使用的 Excel 表格和西洋棋盤外，你手機裡的每一張數位照片，骨子裡也是一個二維陣列。如果將照片放到最大，你會看到由「像素」（Pixel）組成的網格；以黑白照片為例，每個像素裡儲存了一個代表亮度的數字（例如 0 代表最黑，255 代表最白）。在電腦中，這種矩陣有時也被稱為「通道」（Channel）。

【三維與四維陣列：色彩與動態影片】
陣列的維度可以繼續往上疊加。如果把代表紅色（R）、綠色（G）、藍色（B）三個顏色的二維陣列疊起來，就變成了一張彩色的三維陣列照片。醫療上的 MRI 斷層掃描（MRI scans）和電腦圖學中的 3D 模型也是三維陣列的應用。

而當我們把一連串的三維陣列（彩色照片）隨著「時間」這條維度串聯起來，就成了「四維陣列」，這也就是我們平常觀看的影片。你正在螢幕上看的 YouTube 影片，本質上就是龐大的四維陣列資料在快速播放。影片遊戲（Video games）和虛擬實境（VR）同樣依賴四維陣列來儲存並渲染出玩家可以互動的虛擬世界。

【更高維度的應用：未來的科學運算】
五維陣列（由多個四維陣列疊加而成）目前多被應用在物理學與化學領域中，用來執行分子動力學或量子力學的科學模擬，藉此呈現粒子的位置與速度等複雜變化。

總結來說，陣列是所有追求高效能運算的基礎。因為其單純且連續排列在記憶體空間的結構，讓電腦能像「跳格子」一樣迅速抓取任何位置的資料，這也是為什麼從遊戲地圖座標、資料庫系統，到現在最熱門的 AI 機器學習模型，背後全都仰賴陣列在支撐運作。`,
    video: {
      url: 'https://youtu.be/F4UF4JKVHak',
      title: '陣列的實戰應用：從生活到螢幕.mp4',
      duration: '7:11',
    },
    resources: [
      {
        type: 'article',
        url: 'https://www.masaischool.com/blog/applications-of-array-explained/',
        title: 'Applications of Array Explained',
        source: 'Masai School',
      },
      {
        type: 'article',
        url: 'https://nareshit.com/blogs/arrays-in-c-programming-with-practical-examples',
        title: 'Arrays in C Programming with Practical Examples Guide',
        source: 'Naresh IT',
      },
      {
        type: 'article',
        url: 'https://dev.to/shri50/n-d-arrays-understanding-with-real-life-examples-5b5l',
        title: 'n-D arrays understanding with real life examples',
        source: 'DEV Community',
      },
    ],
  },
];
