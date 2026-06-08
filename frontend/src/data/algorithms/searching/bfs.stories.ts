import type { RealWorldStory } from "@/types/implementation";

export const bfsRealWorldStories: RealWorldStory[] = [
  {
    id: "bfs-flood-fill-paint",
    pythonDemo: {
      outputType: "flood-fill",
      inputs: [
        {
          variable: "pattern",
          type: "select",
          default: "ring",
          options: ["ring", "star", "heart", "concentric", "grid-rooms"],
        },
        {
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
