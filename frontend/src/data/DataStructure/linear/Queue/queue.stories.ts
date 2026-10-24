import type { RealWorldStory } from '@/types/implementation';

export const queueRealWorldStories: RealWorldStory[] = [
  {
    id: 'queue-multidomain-applications',
    video: {
      url: 'https://youtu.be/S3wJi91kESg',
    },
    resources: [
      { type: 'article', url: 'https://www.geeksforgeeks.org/websites-apps/what-is-a-print-spooler/' },
      { type: 'article', url: 'https://unwiredlearning.com/blog/scheduling-queues-guide' },
      { type: 'article', url: 'https://www.interviewcake.com/concept/java/bfs' },
    ],
  },
  {
    id: 'queue-pet-matcher',
    pythonDemo: {
      outputType: 'queue-card',
      inputs: [
        {
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
