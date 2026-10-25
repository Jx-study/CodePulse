import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import levelsData from '@/data/levels/levels.json';
import { LESSON_SPECS } from './data/lessons';
import type { SlideText } from './types';

const LOCALES = ['zh-TW', 'en'];
const localesDir = resolve(process.cwd(), 'public/locales');

const readJson = (lng: string, ns: string) =>
  JSON.parse(readFileSync(resolve(localesDir, lng, `${ns}.json`), 'utf-8'));

const lessonLevels = levelsData.levels.filter((l) => (l as { isLesson?: boolean }).isLesson);
const levelIds = new Set(levelsData.levels.map((l) => l.id));

describe('lesson levels', () => {
  it('has one lesson spec per lesson level, in the same order', () => {
    expect(LESSON_SPECS.map((s) => s.id)).toEqual(lessonLevels.map((l) => l.id));
  });

  it('only links to levels that exist', () => {
    for (const spec of LESSON_SPECS) {
      for (const slide of spec.slides) {
        for (const id of slide.nextLevelIds ?? []) expect(levelIds.has(id), `${spec.id} → ${id}`).toBe(true);
      }
    }
  });

  it('never needs a question bank', () => {
    for (const level of lessonLevels) expect((level as { hasPractice?: boolean }).hasPractice).toBe(false);
  });
});

describe.each(LOCALES)('lessons text (%s)', (lng) => {
  const lessons = readJson(lng, 'lessons').lessons as Record<string, { title: string; subtitle: string; slides: SlideText[] }>;
  const dashboard = readJson(lng, 'dashboard');

  it.each(LESSON_SPECS.map((s) => s.id))('%s has text for every slide', (id) => {
    const spec = LESSON_SPECS.find((s) => s.id === id)!;
    const text = lessons[id];
    expect(text, `missing lesson ${id}`).toBeDefined();
    expect(text.title).toBeTruthy();
    expect(text.subtitle).toBeTruthy();
    expect(text.slides).toHaveLength(spec.slides.length);

    spec.slides.forEach((slide, i) => {
      const t = text.slides[i];
      const where = `${id} slide ${i + 1} (${slide.type})`;
      expect(t.title, where).toBeTruthy();
      if (slide.type === 'concept') expect(t.body, where).toBeTruthy();
      if (slide.type === 'list' || slide.type === 'summary') expect(t.items?.length, where).toBeGreaterThan(0);
      if (slide.type === 'code') {
        expect(slide.language, where).toBeTruthy();
        expect(t.code, where).toBeTruthy();
      }
      if (slide.type === 'comparison') {
        expect(t.comparisons, where).toHaveLength(slide.comparisons!.length);
        t.comparisons!.forEach((c) => {
          expect(c.label, where).toBeTruthy();
          expect(c.description, where).toBeTruthy();
        });
      }
      if (slide.type === 'table') {
        const table = t.table!;
        expect(table.headers.length, where).toBeGreaterThan(1);
        table.rows.forEach((row) => expect(row, where).toHaveLength(table.headers.length));
      }
    });
  });

  it('has a name, description and objectives on the dashboard for every lesson level', () => {
    for (const id of LESSON_SPECS.map((s) => s.id)) {
      const entry = dashboard.levels[id.replace(/-/g, '_')];
      expect(entry?.name, id).toBeTruthy();
      expect(entry?.description, id).toBeTruthy();
      expect(entry?.objectives?.length, id).toBeGreaterThan(0);
    }
    expect(dashboard.categories.foundations.name).toBeTruthy();
  });
});

const leafKeys = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([k, v]) => leafKeys(v, `${prefix}${k}.`))
    : [prefix];

describe('lessons text parity', () => {
  const zh = readJson('zh-TW', 'lessons');
  const en = readJson('en', 'lessons');

  it('has the same ui and visuals keys in every language', () => {
    expect(Object.keys(en.ui).sort()).toEqual(Object.keys(zh.ui).sort());
    expect(Object.keys(en.visuals.bigO).sort()).toEqual(Object.keys(zh.visuals.bigO).sort());
    for (const name of ['growthExplorer', 'stepCounter', 'searchCases']) {
      expect(leafKeys(en.visuals[name]), name).toEqual(leafKeys(zh.visuals[name]));
    }
    expect(en.visuals.dsDiagram.linearItems).toHaveLength(zh.visuals.dsDiagram.linearItems.length);
    expect(en.visuals.dsDiagram.nonLinearItems).toHaveLength(zh.visuals.dsDiagram.nonLinearItems.length);
  });

  it('keeps code samples the same length in both languages', () => {
    for (const id of Object.keys(zh.lessons)) {
      zh.lessons[id].slides.forEach((slide: SlideText, i: number) => {
        const other: SlideText = en.lessons[id].slides[i];
        if (slide.code) expect(other.code?.split('\n').length, `${id} slide ${i + 1}`).toBe(slide.code.split('\n').length);
        if (slide.table) expect(other.table?.rows.length, `${id} slide ${i + 1}`).toBe(slide.table.rows.length);
      });
    }
  });
});
