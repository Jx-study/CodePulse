import React, { useState } from 'react';
import Dialog from '@/shared/components/Dialog';
import Tabs from '@/shared/components/Tabs';
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

const KnowledgeStation: React.FC<KnowledgeStationProps> = ({
  isOpen,
  onClose,
  topicTypeConfig,
}) => {
  const tabs = [
    {
      key: 'introduction',
      label: '演算法簡介',
      content: <IntroductionTab introduction={topicTypeConfig.introduction} />,
    },
    {
      key: 'complexity',
      label: '複雜度分析',
      content: <ComplexityTab complexity={topicTypeConfig.complexity} />,
    },
    {
      key: 'problems',
      label: '相關題目',
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
      title="知識補充站"
      className={styles.knowledgeStationDialog}
    >
      <div className={styles.knowledgeStation}>
        <div className={styles.content}>
          <Tabs tabs={tabs} variant="default" size="md" />
        </div>
      </div>
    </Dialog>
  );
};

export default KnowledgeStation;
