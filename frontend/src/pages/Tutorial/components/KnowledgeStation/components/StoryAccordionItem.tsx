import React, { useState } from 'react';
import classNames from 'classnames';
import type { RealWorldStory } from '@/types';
import Icon from '@/shared/components/Icon';
import Button from '@/shared/components/Button';
import StoryVideoPlayer from './StoryVideoPlayer';
import StoryResources from './StoryResources';
import PythonInteractiveDemo from './PythonInteractiveDemo';
import StackGameRenderer from './StackGameRenderer';
import KnapsackGameRenderer from './KnapsackGameRenderer/KnapsackGameRenderer';
import BinarySearchOutputRenderer from './BinarySearchOutputRenderer';
import styles from './StoryAccordionItem.module.scss';

interface Props {
  story: RealWorldStory;
}

const StoryAccordionItem: React.FC<Props> = ({ story }) => {
  const [isOpen, setIsOpen] = useState(false);
  // 若有互動遊戲且無視頻，內容預設收合（遊戲本身就是主體）
  const [isContentOpen, setIsContentOpen] = useState(false);

  const hasVideo = !!story.video;
  const hasStackGame = story.interactiveGame?.type === 'stack-popup-game';
  const hasKnapsackGame = story.interactiveGame?.type === 'knapsack-investment-game';
  const hasBinarySearchGame = story.interactiveGame?.type === 'binary-search-game';

  return (
    <div className={styles.accordionItem}>
      <Button
        type="button"
        variant="ghost"
        fullWidth
        className={styles.header}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <div className={styles.headerLeft}>
          {story.category && (
            <span className={styles.badge}>{story.category}</span>
          )}
          <span className={styles.title}>{story.title}</span>
          {story.tags?.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <Icon
          name="chevron-down"
          className={classNames(styles.chevron, { [styles.open]: isOpen })}
          ariaLabel={isOpen ? '收合' : '展開'}
        />
      </Button>

      {isOpen && (
        <div className={styles.body}>
          {hasVideo ? (
            <>
              <StoryVideoPlayer video={story.video} />
              <Button
                type="button"
                variant="ghost"
                className={styles.contentToggle}
                onClick={() => setIsContentOpen((v) => !v)}
              >
                <Icon name={isContentOpen ? 'chevron-up' : 'chevron-down'} />
                {isContentOpen ? '收起故事詳情' : '閱讀故事詳情'}
              </Button>
              {isContentOpen && (
                <p className={styles.content}>{story.content}</p>
              )}
              {story.pythonDemo && (
                <PythonInteractiveDemo demo={story.pythonDemo} />
              )}
              {hasStackGame && <StackGameRenderer />}
              {hasKnapsackGame && <KnapsackGameRenderer />}
              {hasBinarySearchGame && <BinarySearchOutputRenderer />}
            </>
          ) : (
            <>
              {story.pythonDemo && (
                <PythonInteractiveDemo demo={story.pythonDemo} />
              )}
              {hasStackGame && <StackGameRenderer />}
              {hasKnapsackGame && <KnapsackGameRenderer />}
              {hasBinarySearchGame && <BinarySearchOutputRenderer />}
              <Button
                type="button"
                variant="ghost"
                className={styles.contentToggle}
                onClick={() => setIsContentOpen((v) => !v)}
              >
                <Icon name={isContentOpen ? 'chevron-up' : 'chevron-down'} />
                {isContentOpen ? '收起故事詳情' : '閱讀故事詳情'}
              </Button>
              {isContentOpen && (
                <p className={styles.content}>{story.content}</p>
              )}
            </>
          )}
          {story.resources && story.resources.length > 0 && (
            <StoryResources resources={story.resources} />
          )}
        </div>
      )}
    </div>
  );
};

export default StoryAccordionItem;
