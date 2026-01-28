import styles from './Features.module.scss';
import { useTranslation } from 'react-i18next';
import Card from '../Card';

function Features() {
  const { t } = useTranslation();

  // Feature data - 精選核心功能
  const features = [
    {
      id: 'interactive-flowchart',
      title: t('features_section.interactive_flowchart.title'),
      description: t('features_section.interactive_flowchart.description'),
      alt: 'Interactive Flowchart'
    },
    {
      id: 'memory-visualization',
      title: t('features_section.memory_visualization.title'),
      description: t('features_section.memory_visualization.description'),
      alt: 'Memory Visualization'
    },
    {
      id: 'smart-summary',
      title: t('features_section.smart_summary.title'),
      description: t('features_section.smart_summary.description'),
      alt: 'Smart Summary'
    },
    {
      id: 'teaching-interface',
      title: t('features_section.teaching_interface.title'),
      description: t('features_section.teaching_interface.description'),
      alt: 'Teaching Interface'
    }
  ];

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
              <Card
                key={`${feature.id}-${index}`}
                title={feature.title}
                layout='horizontal'
                description={feature.description}
                className={styles.featureCard}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
