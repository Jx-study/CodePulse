import type { RealWorldStory } from '@/types/implementation';

export const queueRealWorldStories: RealWorldStory[] = [
  {
    id: "queue-multidomain-applications",
    title: "佇列 (Queue) 無所不在：從演算法到大型系統架構的底層核心",
    category: "電腦科學與系統設計",
    tags: ["Queue", "系統設計", "作業系統", "演算法", "資料結構"],
    content: `【演算法的基礎：廣度優先搜尋 (BFS)】
在圖形或樹狀結構中，廣度優先搜尋 (BFS) 是一種逐層探索的演算法，對於尋找無權重圖的最短路徑非常有用。BFS 的核心依賴於「先進先出 (FIFO)」特性的佇列 (Queue) 資料結構。當我們造訪一個節點時，會將其尚未造訪的相鄰節點加入佇列的後端，並從前端取出下一個節點來處理，以此確保同一層級的節點都會被優先探索完畢，才會進入下一層。

【系統設計的利器：訊息佇列 (Message Queues)】
在大型分散式系統（例如電商平台）中，瞬間的尖峰流量可能會嚴重拖慢系統效能。訊息佇列 (Message Queue) 提供了一種支援「非同步通訊」的緩衝機制。它將發布訊息的「生產者」與處理任務的「消費者（伺服器）」解耦。這不僅提升了系統的擴展性 (Scalability)，也保障了高度的可靠性——因為佇列通常會將資料儲存在持久性的磁碟中，即使伺服器或系統崩潰，等待處理的資料也不會遺失，待系統恢復後即可繼續消化佇列中的任務。

【作業系統的排程樞紐：排程佇列 (Scheduling Queues)】
作業系統必須管理多個同時競爭 CPU 資源的程式，它是透過建立多個不同的排程佇列來實現這個複雜的任務。當任何程式剛啟動時，會先進入包含所有進程的工作佇列 (Job Queue)。接著，準備好執行並等待 CPU 資源的進程會被放入就緒佇列 (Ready Queue)；而如果進程正在等待外部設備（如硬碟讀取、網路資料），則會被暫停並移入裝置佇列 (Device Queues) 中等待。作業系統的排程器會不斷在這些佇列間調度進程，以維持電腦的高效運行。

【日常設備的隱形幫手：列印多工緩衝處理器 (Print Spooler)】
佇列的概念也存在於我們日常的硬體操作中。由於印表機的處理速度較慢且記憶體有限，無法瞬間處理大量要求，Windows 作業系統內建了「列印多工緩衝處理器 (Print Spooler)」。它會將所有的列印任務暫存到緩衝區（即佇列）中，並自動排程將任務逐一傳送給印表機。這個機制讓使用者在送出列印任務後可以繼續操作電腦，而不需要枯等印表機完成工作。`,
    video: {
      url: "https://youtu.be/S3wJi91kESg",
      title: "Message Queues in System Design",
    },
    resources: [
      {
        type: "article",
        url: "https://www.geeksforgeeks.org/websites-apps/what-is-a-print-spooler/",
        title: "What is a Print Spooler?",
        source: "GeeksforGeeks",
      },
      {
        type: "article",
        url: "https://unwiredlearning.com/blog/scheduling-queues-guide",
        title: "Scheduling Queues and Schedulers Explained (OS Guide)",
        source: "Unwired Learning",
      },
      {
        type: "article",
        url: "https://www.interviewcake.com/concept/java/bfs",
        title: "Breadth-First Search (BFS) - Shortest Paths in Unweighted Graphs",
        source: "Interview Cake",
      },
    ],
  },
  {
    id: 'queue-pet-matcher',
    title: 'Pet Matcher: Queue Chaos',
    category: '互動遊戲',
    tags: ['Producer', 'Consumer', 'Queue 溢出'],
    content: `Queue 的核心概念「Producer/Consumer 速率平衡」難以用靜態圖示傳達。當 Consumer 速度跟不上 Producer，Queue 就會堆積並溢出。

在此互動遊戲中，你扮演 Consumer，以左/右滑動方式處理貓貓/狗狗照片卡。系統會自動產生新卡片（Producer）。目標是在倒數計時結束前不讓 Queue 溢出、HP 不歸零。`,
    pythonDemo: {
      title: 'Pet Matcher: Queue Chaos',
      outputType: 'queue-card',
      inputs: [
        {
          label: '生成速率（毫秒）',
          variable: 'spawn_rate_ms',
          type: 'slider',
          default: 3000,
          min: 1000,
          max: 5000,
          step: 500,
        },
      ],
      code: `import json, random

def generate_cards(n: int, seed: int = 42) -> list:
    random.seed(seed)
    cards = []
    for i in range(n):
        animal = random.choice(['cat', 'dog'])
        lock_id = random.randint(1, 9999)
        cards.append({
            "id": i + 1,
            "type": animal,
            "url": f"https://loremflickr.com/400/400/{animal}?lock={lock_id}"
        })
    return cards

result = {
    "initial_cards": generate_cards(5),
    "config": {
        "spawn_rate_ms": spawn_rate_ms,
        "max_queue_size": 8,
        "survive_seconds": 30
    }
}
json.dumps(result)
`,
    },
  },
];
