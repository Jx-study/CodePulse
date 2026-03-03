import React from 'react';
import Dialog from '@/shared/components/Dialog';
import Tabs from '@/shared/components/Tabs';
import Icon from '@/shared/components/Icon';
import type { LevelImplementationConfig } from '@/types';
import IntroductionTab from './components/IntroductionTab';
import ComplexityTab from './components/ComplexityTab';
import ProblemsTab from './components/ProblemsTab';
import styles from './KnowledgeStation.module.scss';

interface KnowledgeStationProps {
  isOpen: boolean;
  onClose: () => void;
  topicTypeConfig: LevelImplementationConfig;
}

const dialogTitle = (
  <div className={styles.titleWithIcon}>
    <span className={styles.titleIcon}>
      <Icon name="book-open" decorative />
    </span>
    <h2>知識補充站</h2>
  </div>
);

const KnowledgeStation: React.FC<KnowledgeStationProps> = ({
  isOpen,
  onClose,
  topicTypeConfig,
}) => {
  const tabs = [
    {
      key: 'introduction',
      label: '演算法説明',
      content: <IntroductionTab introduction={topicTypeConfig.introduction} />,
    },
    {
      key: 'complexity',
      label: '複雜度分析',
      content: <ComplexityTab complexity={topicTypeConfig.complexity} />,
    },
    {
      key: 'problems',
      label: '經典題型',
      content: <ProblemsTab relatedProblems={topicTypeConfig.relatedProblems} />,
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
