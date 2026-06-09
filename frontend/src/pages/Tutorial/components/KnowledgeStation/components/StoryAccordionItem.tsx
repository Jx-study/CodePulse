import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import type { RealWorldStory } from '@/types';
import Icon from '@/shared/components/Icon';
import Button from '@/shared/components/Button';
import StoryVideoPlayer from './StoryVideoPlayer';
import StoryResources from './StoryResources';
import type { ResolvedStoryResource } from './StoryResources';
import PythonInteractiveDemo from './PythonInteractiveDemo';
import StackGameRenderer from './StackGameRenderer';
import KnapsackGameRenderer from './KnapsackGameRenderer/KnapsackGameRenderer';
import BinarySearchOutputRenderer from './BinarySearchOutputRenderer';
import WhackAMoleRenderer from './WhackAMoleRenderer';
import styles from './StoryAccordionItem.module.scss';

interface Props {
  story: RealWorldStory;
  i18nNamespace?: string;
}

interface StorySection {
  heading?: string;
  content: string;
}

interface StoryResourceText {
  title?: string;
  source?: string;
}

const StoryAccordionItem: React.FC<Props> = ({ story, i18nNamespace }) => {
  const { t } = useTranslation('tutorial');
  const [isOpen, setIsOpen] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(false);

  const hasVideo = !!story.video;
  const hasStackGame = story.interactiveGame?.type === 'stack-popup-game';
  const hasKnapsackGame = story.interactiveGame?.type === 'knapsack-investment-game';
  const hasBinarySearchGame = story.interactiveGame?.type === 'binary-search-game';
  const hasWhackAMoleGame = story.interactiveGame?.type === 'whack-a-mole';

  const ns = i18nNamespace;
  const prefix = `stories.${story.id}`;

  const title = ns
    ? t(`${prefix}.title`, { ns, defaultValue: String(story.id) })
    : String(story.id);
  const category = ns ? t(`${prefix}.category`, { ns, defaultValue: '' }) : '';
  const tags = ns
    ? (t(`${prefix}.tags`, { ns, returnObjects: true }) as string[])
    : [];
  const sections = ns
    ? (t(`${prefix}.content.sections`, { ns, returnObjects: true }) as StorySection[])
    : [];

  const videoTitle = ns ? t(`${prefix}.videoTitle`, { ns, defaultValue: '' }) : '';
  const pythonDemoTitle = ns ? t(`${prefix}.pythonDemoTitle`, { ns, defaultValue: '' }) : '';
  const rawInputLabels = ns
    ? (t(`${prefix}.inputs`, { ns, returnObjects: true }) as Record<string, string>)
    : {};
  const inputLabels =
    typeof rawInputLabels === 'object' && !Array.isArray(rawInputLabels)
      ? rawInputLabels
      : {};

  const rawResourceTexts = ns
    ? (t(`${prefix}.resources`, { ns, returnObjects: true }) as StoryResourceText[])
    : [];
  const resourceTexts = Array.isArray(rawResourceTexts) ? rawResourceTexts : [];
  const resolvedResources: ResolvedStoryResource[] = (story.resources ?? []).map((r, i) => ({
    ...r,
    title: resourceTexts[i]?.title,
    source: resourceTexts[i]?.source,
  }));

  const safeTags = Array.isArray(tags) ? tags : [];
  const safeSections = Array.isArray(sections) ? sections : [];

  const renderSections = () =>
    safeSections.map((section, i) => (
      <div key={i} className={styles.section}>
        {section.heading && <h4 className={styles.sectionHeading}>{section.heading}</h4>}
        <p>{section.content}</p>
      </div>
    ));

  const renderPythonDemo = () =>
    story.pythonDemo ? (
      <PythonInteractiveDemo
        demo={story.pythonDemo}
        title={pythonDemoTitle}
        inputLabels={inputLabels}
        ns={ns}
      />
    ) : null;

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
          {category && (
            <span className={styles.badge}>{category}</span>
          )}
          <span className={styles.title}>{title}</span>
          {safeTags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
        <Icon
          name="chevron-down"
          className={classNames(styles.chevron, { [styles.open]: isOpen })}
          ariaLabel={
            isOpen ? t('storyAccordion.collapseAriaLabel') : t('storyAccordion.expandAriaLabel')
          }
        />
      </Button>

      {isOpen && (
        <div className={styles.body}>
          {hasVideo ? (
            <>
              <StoryVideoPlayer video={story.video} title={videoTitle} />
              <Button
                type="button"
                variant="ghost"
                className={styles.contentToggle}
                onClick={() => setIsContentOpen((v) => !v)}
              >
                <Icon name={isContentOpen ? 'chevron-up' : 'chevron-down'} />
                {isContentOpen ? t('storyAccordion.collapseDetails') : t('storyAccordion.readDetails')}
              </Button>
              {isContentOpen && (
                <div className={styles.content}>{renderSections()}</div>
              )}
              {renderPythonDemo()}
              {hasStackGame && <StackGameRenderer ns={ns} />}
              {hasKnapsackGame && <KnapsackGameRenderer ns={ns} />}
              {hasBinarySearchGame && <BinarySearchOutputRenderer ns={ns} />}
              {hasWhackAMoleGame && <WhackAMoleRenderer ns={ns} />}
            </>
          ) : (
            <>
              {renderPythonDemo()}
              {hasStackGame && <StackGameRenderer ns={ns} />}
              {hasKnapsackGame && <KnapsackGameRenderer ns={ns} />}
              {hasBinarySearchGame && <BinarySearchOutputRenderer ns={ns} />}
              {hasWhackAMoleGame && <WhackAMoleRenderer ns={ns} />}
              <Button
                type="button"
                variant="ghost"
                className={styles.contentToggle}
                onClick={() => setIsContentOpen((v) => !v)}
              >
                <Icon name={isContentOpen ? 'chevron-up' : 'chevron-down'} />
                {isContentOpen ? t('storyAccordion.collapseDetails') : t('storyAccordion.readDetails')}
              </Button>
              {isContentOpen && (
                <div className={styles.content}>{renderSections()}</div>
              )}
            </>
          )}
          {resolvedResources.length > 0 && (
            <StoryResources resources={resolvedResources} />
          )}
        </div>
      )}
    </div>
  );
};

export default StoryAccordionItem;
