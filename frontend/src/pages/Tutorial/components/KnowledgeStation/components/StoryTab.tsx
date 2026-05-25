import React from 'react';
import { useTranslation } from 'react-i18next';
import type { RealWorldStory } from '@/types';
import StoryAccordionItem from './StoryAccordionItem';
import styles from './StoryTab.module.scss';

interface StoryTabProps {
  stories?: RealWorldStory[];
}

const StoryTab: React.FC<StoryTabProps> = ({ stories }) => {
  const { t } = useTranslation('tutorial');

  if (!stories || stories.length === 0) {
    return (
      <div className={styles.storyTab}>
        <div className={styles.emptyState}>
          <p>{t('storyTab.empty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.storyTab}>
      {stories.map((story) => (
        <StoryAccordionItem key={story.id} story={story} />
      ))}
    </div>
  );
};

export default StoryTab;
