import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LESSON_SPECS } from '../data/lessons';
import type { Lesson, Slide, SlideText } from '../types';

/** 把與語言無關的結構（data/lessons.ts）和當前語言的文字（locales/<lng>/lessons.json）合成課程 */
export function useLessons(): Lesson[] {
  const { t } = useTranslation('lessons');

  return useMemo(
    () =>
      LESSON_SPECS.map((spec) => {
        const base = `lessons.${spec.id}`;
        const title = t(`${base}.title`);
        const subtitle = t(`${base}.subtitle`);
        const texts = t(`${base}.slides`, { returnObjects: true }) as SlideText[];

        const slides: Slide[] = [{ type: 'cover', title, subtitle }];
        spec.slides.forEach((slideSpec, i) => {
          const text: Partial<SlideText> = Array.isArray(texts) ? (texts[i] ?? {}) : {};
          slides.push({
            type: slideSpec.type,
            visual: slideSpec.visual,
            nextLevelIds: slideSpec.nextLevelIds,
            title: text.title ?? '',
            subtitle: text.subtitle,
            body: text.body,
            items: text.items,
            table: text.table,
            code:
              text.code && slideSpec.language
                ? { language: slideSpec.language, content: text.code }
                : undefined,
            comparisons: slideSpec.comparisons?.map((style, j) => ({
              ...style,
              label: text.comparisons?.[j]?.label ?? '',
              description: text.comparisons?.[j]?.description ?? '',
            })),
          });
        });

        return {
          id: spec.id,
          title,
          subtitle,
          icon: spec.icon,
          color: spec.color,
          estimatedMinutes: spec.estimatedMinutes,
          slides,
        };
      }),
    [t],
  );
}
