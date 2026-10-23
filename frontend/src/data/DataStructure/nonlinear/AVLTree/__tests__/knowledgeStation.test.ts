import { describe, expect, it } from "vitest";
import zhTW from "../../../../../../public/locales/zh-TW/tutorials/avl-tree.json";
import en from "../../../../../../public/locales/en/tutorials/avl-tree.json";
import { avlTreeConfig } from "../AVLTree";

const locales = { "zh-TW": zhTW, en } as const;

describe("AVL knowledge station content", () => {
  const problems = avlTreeConfig.relatedProblems ?? [];
  const stories = avlTreeConfig.realWorldStories ?? [];

  it("lists LeetCode problems that match what the level teaches", () => {
    expect(problems.map((p) => p.id)).toEqual([110, 108, 450, 1382]);
    problems.forEach((p) => {
      expect(p.url).toMatch(/^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/);
      expect(["Easy", "Medium", "Hard"]).toContain(p.difficulty);
    });
  });

  it.each(Object.entries(locales))("%s has a description for every problem", (_, locale) => {
    const texts = locale.relatedProblems as Record<string, string>;

    problems.forEach((p) => {
      const key = String(p.concept).replace("relatedProblems.", "");
      expect(texts[key]).toBeTruthy();
    });
  });

  it.each(Object.entries(locales))("%s tells every real-world story with matching resources", (_, locale) => {
    const texts = locale.stories as Record<
      string,
      {
        title: string;
        category: string;
        tags: string[];
        content: { sections: { heading: string; content: string }[] };
        resources: { title: string; source: string }[];
      }
    >;

    expect(stories.length).toBeGreaterThan(0);
    stories.forEach((story) => {
      const text = texts[String(story.id)];

      expect(text.title).toBeTruthy();
      expect(text.tags.length).toBeGreaterThan(0);
      expect(text.content.sections.length).toBeGreaterThanOrEqual(2);
      text.content.sections.forEach((s) => {
        expect(s.heading).toBeTruthy();
        expect(s.content).toBeTruthy();
      });
      expect(text.resources).toHaveLength(story.resources?.length ?? 0);
      story.resources?.forEach((r) => expect(r.url).toMatch(/^https:\/\//));
    });
  });
});
