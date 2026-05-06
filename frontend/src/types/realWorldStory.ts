import type { PythonDemo } from './pythonDemo';

export interface StoryVideo {
  url: string;
  title: string;
  duration?: string;
}

export type StoryResourceType = 'article' | 'paper' | 'link';

export interface StoryResource {
  type: StoryResourceType;
  url: string;
  title: string;
  source?: string;
}

export type InteractiveGameType = 'stack-popup-game' | 'knapsack-investment-game' | 'binary-search-game' | 'whack-a-mole';

export interface InteractiveGame {
  type: InteractiveGameType;
}

export interface RealWorldStory {
  id: string | number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  video?: StoryVideo;
  resources?: StoryResource[];
  pythonDemo?: PythonDemo;
  interactiveGame?: InteractiveGame;
}
