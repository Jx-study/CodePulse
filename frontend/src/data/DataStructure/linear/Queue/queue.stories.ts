import type { RealWorldStory } from '@/types/implementation';

export const queueRealWorldStories: RealWorldStory[] = [
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
