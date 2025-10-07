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
  const { t } = useTranslation();

  // Feature data - 精選核心功能
  const features = [
    {
      id: 'interactive-flowchart',
      title: t('features_section.interactive_flowchart.title'),
      description: t('features_section.interactive_flowchart.description'),
      image: interactiveFlowchartImg,
      alt: 'Interactive Flowchart'
    },
    {
      id: 'memory-visualization',
      title: t('features_section.memory_visualization.title'),
      description: t('features_section.memory_visualization.description'),
      image: memoryVisualizationImg,
      alt: 'Memory Visualization'
    },
    {
      id: 'smart-summary',
      title: t('features_section.smart_summary.title'),
      description: t('features_section.smart_summary.description'),
      image: smartSummaryImg,
      alt: 'Smart Summary'
    },
    {
      id: 'teaching-interface',
      title: t('features_section.teaching_interface.title'),
      description: t('features_section.teaching_interface.description'),
      image: teachingInterfaceImg,
      alt: 'Teaching Interface'
    }
  ];

  // Image error handling
  const handleImageError = (event) => {
    event.target.src = '/assets/features/default-feature.png';
  };

  // 創建無限滾動的卡片陣列 (重複卡片以實現無縫循環)
  const infiniteFeatures = [...features, ...features];

  return (
    <section className={styles.features} id="features">
      <div className="container">
        <h2 className="section-title">{t("features_section.title")}</h2>

        {/* 無限滾動容器 - 最多同時顯示 4 個卡片 */}
        <div className={styles.scrollContainer}>
          <div className={styles.cardContainer}>
            {infiniteFeatures.map((feature, index) => (
              <div
                key={`${feature.id}-${index}`} className={`common-card ${styles.featureCard}`}>
                <div className="featureIcon">
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
