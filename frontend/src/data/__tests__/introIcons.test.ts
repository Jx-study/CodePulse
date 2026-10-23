import { describe, expect, it } from "vitest";
import { iconMap } from "@/shared/lib/iconMap";

interface IntroSection {
  heading?: string;
  icon?: string;
}

interface TutorialLocale {
  introduction?: { sections?: IntroSection[] };
}

const locales = import.meta.glob<TutorialLocale>(
  "../../../public/locales/*/tutorials/*.json",
  { eager: true, import: "default" },
);

const known = new Set(Object.keys(iconMap));

describe("tutorial introduction icons", () => {
  it("finds the tutorial files to check", () => {
    expect(Object.keys(locales).length).toBeGreaterThan(20);
  });

  it.each(Object.entries(locales))(
    "%s only uses icons from the icon map",
    (_path, locale) => {
      const unknown = (locale.introduction?.sections ?? [])
        .filter((section) => section.icon !== undefined)
        .filter((section) => !known.has(section.icon!))
        .map((section) => `${section.heading}: ${section.icon}`);

      expect(unknown).toEqual([]);
    },
  );
});
