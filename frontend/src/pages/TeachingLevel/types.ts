export type SlideType =
  | 'concept'
  | 'list'
  | 'comparison'
  | 'visual'
  | 'code'
  | 'table'
  | 'summary';

/** 封面由課程標題自動產生，不在 SlideSpec 裡 */
export type RenderedSlideType = SlideType | 'cover';

export type VisualType = 'big-o-chart' | 'ds-diagram';

export interface ComparisonStyle {
  icon: string;
  color: string;
}

/** 與語言無關的投影片結構；文字放在 locales/<lng>/lessons.json，依序對應 */
export interface SlideSpec {
  type: SlideType;
  visual?: VisualType;
  language?: string;
  comparisons?: ComparisonStyle[];
  /** summary：結尾導向的關卡 id（名稱取自 dashboard 的 levels.*.name） */
  nextLevelIds?: string[];
}

export interface LessonSpec {
  id: string;
  icon: string;
  color: string;
  estimatedMinutes: number;
  slides: SlideSpec[];
}

export interface SlideTable {
  headers: string[];
  rows: string[][];
  note?: string;
}

export interface SlideText {
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
  code?: string;
  comparisons?: { label: string; description: string }[];
  table?: SlideTable;
}

export interface ComparisonItem extends ComparisonStyle {
  label: string;
  description: string;
}

export interface Slide {
  type: RenderedSlideType;
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
  visual?: VisualType;
  code?: { language: string; content: string };
  comparisons?: ComparisonItem[];
  table?: SlideTable;
  nextLevelIds?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  estimatedMinutes: number;
  slides: Slide[];
}
