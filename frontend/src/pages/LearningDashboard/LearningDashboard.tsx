import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './LearningDashboard.module.scss';

function LearningDashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="container">
        <h1>{t('dashboard.title')}</h1>
        
        {/* 临时 Tutorial 入口 */}
        <div className={styles.tempTutorialSection}>
          <h2>演算法教學</h2>
          <div className={styles.algorithmGrid}>
            <Link to="/tutorial/sorting/quicksort" className="common-card">
              <h3>快速排序</h3>
              <p>分治法排序演算法</p>
              <span className={styles.difficulty}>⭐⭐⭐</span>
            </Link>
            
            <Link to="/tutorial/sorting/mergesort" className="common-card">
              <h3>合併排序</h3>
              <p>穩定的分治排序</p>
              <span className={styles.difficulty}>⭐⭐⭐</span>
            </Link>
            
            <Link to="/tutorial/searching/binarysearch" className="common-card">
              <h3>二分搜尋</h3>
              <p>高效搜尋演算法</p>
              <span className={styles.difficulty}>⭐⭐</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningDashboard;