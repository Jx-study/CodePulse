import React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@/shared/components/Dialog';
import Tabs from '@/shared/components/Tabs';
import Icon from '@/shared/components/Icon';
import type { LevelImplementationConfig } from '@/types';
import IntroductionTab from './components/IntroductionTab';
import ComplexityTab from './components/ComplexityTab';
import ProblemsTab from './components/ProblemsTab';
import StoryTab from './components/StoryTab';
import styles from './KnowledgeStation.module.scss';

interface KnowledgeStationProps {
  isOpen: boolean;
  onClose: () => void;
  topicTypeConfig: LevelImplementationConfig;
}

const KnowledgeStation: React.FC<KnowledgeStationProps> = ({
  isOpen,
  onClose,
  topicTypeConfig,
}) => {
  const { t } = useTranslation('tutorial');

  const dialogTitle = (
    <div className={styles.titleWithIcon}>
      <span className={styles.titleIcon}>
        <Icon name="book-open" decorative />
      </span>
      <h2>{t('knowledgeStation.title')}</h2>
    </div>
  );

  const isDataStructure = topicTypeConfig.type === 'dataStructure';
  const introTabLabelKey = isDataStructure
    ? 'knowledgeStation.tabs.dataStructureIntroduction'
    : 'knowledgeStation.tabs.algorithmIntroduction';

  const tabs = [
    {
      key: 'introduction',
      label: t(introTabLabelKey),
      content: (
        <IntroductionTab
          introduction={topicTypeConfig.introduction}
          i18nNamespace={topicTypeConfig.i18nNamespace}
          isDataStructure={isDataStructure}
        />
      ),
    },
    {
      key: 'complexity',
      label: t('knowledgeStation.tabs.complexity'),
      content: <ComplexityTab complexity={topicTypeConfig.complexity} />,
    },
    {
      key: 'problems',
      label: t('knowledgeStation.tabs.problems'),
      content: <ProblemsTab relatedProblems={topicTypeConfig.relatedProblems} />,
    },
    {
      key: 'story',
      label: t('knowledgeStation.tabs.story'),
      content: <StoryTab stories={topicTypeConfig.realWorldStories} />,
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={true}
      closeOnEscape={true}
      closeOnOverlayClick={false}
      title={dialogTitle}
      className={styles.knowledgeStationDialog}
      contentClassName={styles.dialogContent}
    >
      <div className={styles.knowledgeStation}>
        <div className={styles.content}>
          <Tabs
            tabs={tabs}
            variant="default"
            size="md"
            contentClassName={styles.tabContent}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default KnowledgeStation;
