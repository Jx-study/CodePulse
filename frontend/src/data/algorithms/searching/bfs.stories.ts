import type { RealWorldStory } from "@/types/implementation";

export const bfsRealWorldStories: RealWorldStory[] = [
  {
    id: "bfs-flood-fill-paint",
    title: "油漆桶工具：Photoshop 背後的 BFS Flood Fill",
    category: "圖形處理",
    tags: ["BFS", "Flood Fill", "像素藝術", "圖像處理"],
    content: `【你每次點油漆桶，BFS 就跑一次】
在影像編輯軟體裡，油漆桶（Fill）是最直覺的工具之一：點一個像素，同色連通區域會被新顏色取代。這背後通常不是遞迴爆棧，而是用佇列實作的 Flood Fill，本質就是 BFS：從起點開始，依序把四連通、且顏色符合條件的鄰居加入佇列，一層一層向外擴展，直到沒有可填的格子為止。

【為什麼是 BFS 而不是「隨便塗」】
若用深度優先（DFS）也能填滿，但 BFS 的擴展順序是「由近到遠」的同心波前，視覺上就像水波紋，也較容易平行化與除錯。多個起點同時填色時，可視為 **多源 BFS**：每個顏色各自維持一條波前，全域時間軸上同步推進——這與本互動畫布中「多種顏色同時展開」的模型一致。

【從工具到考題】
Flood Fill 是經典面試與競賽題的原型（例如「島嶼數量」「顏色填充」）。理解「連通性 + 佇列」後，也能連結到掃描線、GPU 填充等實務主題。下方小程式會用 Python 輸出圖案與尺寸等元資料，瀏覽器以 Canvas 2D 將邊線光柵為 80×80 的像素格；你在網頁上選色、點擊，實際的填色順序則由 TypeScript 端的 BFS 計算，並可用控制列播放、暫停與拖曳步驟，觀察演算法如何一格格覆寫畫面。`,
    pythonDemo: {
      title: "BFS Flood Fill — 像素藝術上色遊戲",
      outputType: "flood-fill",
      inputs: [
        {
          label: "圖案",
          variable: "pattern",
          type: "select",
          default: "ring",
          options: ["ring", "star", "heart", "concentric", "grid-rooms"],
        },
        {
          label: "邊線寬度",
          variable: "border_width",
          type: "slider",
          default: 2,
          min: 1,
          max: 4,
          step: 1,
        },
      ],
      code: `
import json

W, H = 80, 80
pattern = globals().get('pattern', 'ring')
border_width = int(globals().get('border_width', 2))

json.dumps({"width": W, "height": H, "pattern": pattern, "border_width": border_width})
      `,
    },
  },
];
