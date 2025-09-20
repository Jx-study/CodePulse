import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, CodeEditor } from '@/components/UI';
import AlgorithmInfo from './components/AlgorithmInfo/AlgorithmInfo';
import AnimationArea from './components/AnimationArea/AnimationArea';
import ControlBar from './components/ControlBar/ControlBar';
import VariableStatus from './components/VariableStatus/VariableStatus';
import styles from './Tutorial.module.scss';

function Tutorial() {
  const { t } = useTranslation();
  const { category, algorithm } = useParams();

  // Mock data - 将来从后端获取
  const algorithmData = {
    name: '快速排序',
    category: '排序演算法'
  };

  // 生成面包屑数据
  const breadcrumbItems = [
    {
      label: algorithmData.category,
      path: `/dashboard?category=${category}`
    },
    {
      label: algorithmData.name,
      path: null // 当前页面，不可点击
    }
  ];

  return (
    <div className={styles.tutorialPage}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb 
          items={breadcrumbItems}
          showBackButton={true}
        />
      </div>

      {/* Main Content */}
      <div className={styles.contentContainer}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <CodeEditor />
          <AlgorithmInfo />
        </div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          <AnimationArea />
          <ControlBar />
          <VariableStatus />
        </div>
      </div>
    </div>
  );
}

export default Tutorial;