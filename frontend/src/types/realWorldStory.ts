import type { PythonDemo } from './pythonDemo';

export interface StoryVideo {
  url: string;
  duration?: string;
}

export type StoryResourceType = 'article' | 'paper' | 'link';

export interface StoryResource {
  type: StoryResourceType;
  url: string;
}

export type InteractiveGameType = 'stack-popup-game' | 'knapsack-investment-game' | 'binary-search-game' | 'whack-a-mole';

export interface InteractiveGame {
  type: InteractiveGameType;
}

export interface RealWorldStory {
  id: string | number;
  video?: StoryVideo;
  resources?: StoryResource[];
  pythonDemo?: PythonDemo;
  interactiveGame?: InteractiveGame;
}
