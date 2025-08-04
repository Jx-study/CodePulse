import React from 'react';
import styles from './Features.module.scss';
import { useTranslation } from 'react-i18next';

// Import feature images
import interactiveFlowchartImg from './assets/interactive-flowchart.png';
import memoryVisualizationImg from './assets/memory-visualization.png';
import smartSummaryImg from './assets/smart-summary.png';
import dynamicTrackingImg from './assets/dynamic-tracking.png';
import breakpointSystemImg from './assets/breakpoint-system.png';
import teachingInterfaceImg from './assets/teaching-interface.png';

function Features() {
  const {t} = useTranslation();

  return (
    <section className={styles.features} id="features">
      <div className='container'>
        <h2 className='section-title'>{t('features_section.title')}</h2>
        
        <div className={`${styles.featuresGrid} common-grid`}>
          <div className="common-card">
            <div className="featureIcon">
              <img src={interactiveFlowchartImg} alt="Interactive Flowchart" />
            </div>
            <h3>{t('features_section.interactive_flowchart.title')}</h3>
            <p>{t('features_section.interactive_flowchart.description')}</p>
          </div>
          
          <div className="common-card">
            <div className="featureIcon">
              <img src={memoryVisualizationImg} alt="Memory Visualization" />
            </div>
            <h3>{t('features_section.memory_visualization.title')}</h3>
            <p>{t('features_section.memory_visualization.description')}</p>
          </div>
          
          <div className="common-card">
            <div className="featureIcon">
              <img src={smartSummaryImg} alt="Smart Summary" />
            </div>
            <h3>{t('features_section.smart_summary.title')}</h3>
            <p>{t('features_section.smart_summary.description')}</p>
          </div>
          
          <div className="common-card">
            <div className="featureIcon">
              <img src={dynamicTrackingImg} alt="Dynamic Tracking" />
            </div>
            <h3>{t('features_section.dynamic_tracking.title')}</h3>
            <p>{t('features_section.dynamic_tracking.description')}</p>
          </div>
          
          <div className="common-card">
            <div className="featureIcon">
              <img src={breakpointSystemImg} alt="Breakpoint System" />
            </div>
            <h3>{t('features_section.breakpoint_system.title')}</h3>
            <p>{t('features_section.breakpoint_system.description')}</p>
          </div>
          
          <div className="common-card">
            <div className="featureIcon">
              <img src={teachingInterfaceImg} alt="Teaching Interface" />
            </div>
            <h3>{t('features_section.teaching_interface.title')}</h3>
            <p>{t('features_section.teaching_interface.description')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
