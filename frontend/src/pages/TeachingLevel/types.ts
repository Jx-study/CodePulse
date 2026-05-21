export type SlideType =
  | 'cover'
  | 'concept'
  | 'list'
  | 'comparison'
  | 'visual'
  | 'code'
  | 'summary';

export type VisualType = 'big-o-chart' | 'ds-diagram';

export interface ComparisonItem {
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface Slide {
  type: SlideType;
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
  visual?: VisualType;
  code?: {
    language: string;
    content: string;
  };
  comparisons?: ComparisonItem[];
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
