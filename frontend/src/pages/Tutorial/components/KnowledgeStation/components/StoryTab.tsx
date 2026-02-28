import React from 'react';
import type { RealWorldStory } from '@/types';
import styles from './StoryTab.module.scss';

interface StoryTabProps {
  stories?: RealWorldStory[];
}

const StoryTab: React.FC<StoryTabProps> = ({ stories }) => {
  if (!stories || stories.length === 0) {
    return (
      <div className={styles.storyTab}>
        <div className={styles.emptyState}>
          <p>目前尚未提供此主題的真實世界應用故事。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.storyTab}>
      {stories.map((story) => (
        <div key={story.id} className={styles.card}>
          <h3 className={styles.cardTitle}>{story.title}</h3>
          <p className={styles.cardContent}>{story.content}</p>
        </div>
      ))}
    </div>
  );
};

export default StoryTab;
