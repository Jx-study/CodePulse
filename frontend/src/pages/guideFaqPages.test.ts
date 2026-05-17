import { describe, expect, it } from "vitest";
import FAQ from "./FAQ";
import Guide from "./Guide";
import faqEn from "../../public/locales/en/faq.json";
import faqZh from "../../public/locales/zh-TW/faq.json";
import guideEn from "../../public/locales/en/guide.json";
import guideZh from "../../public/locales/zh-TW/guide.json";
import { iconMap } from "@/shared/lib/iconMap";

describe("guide and FAQ public pages", () => {
  it("exports both page components", () => {
    expect(Guide).toBeTypeOf("function");
    expect(FAQ).toBeTypeOf("function");
  });

  it("ships matching bilingual Guide and FAQ content", () => {
    expect(guideZh.cards).toHaveLength(6);
    expect(guideEn.cards).toHaveLength(6);
    expect(faqZh.items).toHaveLength(8);
    expect(faqEn.items).toHaveLength(8);
    expect(guideZh.cards.map((item) => item.id)).toEqual(guideEn.cards.map((item) => item.id));
    expect(faqZh.items.map((item) => item.id)).toEqual(faqEn.items.map((item) => item.id));
  });

  it("registers every new icon used by the pages", () => {
    expect(iconMap).toHaveProperty("circle-question");
    expect(iconMap).toHaveProperty("comments");
    expect(iconMap).toHaveProperty("paper-plane");
    expect(iconMap).toHaveProperty("rocket");
  });

  it("keeps zh-TW guide card titles consistently localized", () => {
    expect(guideZh.cards.map((item) => item.title)).toEqual([
      "開始學習與登入",
      "學習儀表板",
      "教學導覽",
      "互動練習",
      "演算法實驗室",
      "視覺化遊樂場",
    ]);
  });
});
