import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@/shared/components/Icon';
import type { IconName } from '@/shared/lib/iconMap';
import type { IntroductionContent, IntroductionSection } from '@/types';
import { renderInlineText } from '@/utils/renderInlineText';
import styles from './IntroductionTab.module.scss';

interface IntroductionTabProps {
  introduction: IntroductionContent;
  i18nNamespace?: string;
  isDataStructure?: boolean;
}

const DEFAULT_SECTION_ICONS: IconName[] = [
  'compass',
  'cog',
  'lightbulb',
  'location-crosshairs',
];

function isIntroductionSectionArray(value: unknown): value is IntroductionSection[] {
  return Array.isArray(value) && value.every((section) => {
    if (!section || typeof section !== 'object') return false;
    const maybeSection = section as IntroductionSection;
    return typeof maybeSection.heading === 'string';
  });
}

const IntroductionTab: React.FC<IntroductionTabProps> = ({
  introduction,
  i18nNamespace,
  isDataStructure = false,
}) => {
  const { t } = useTranslation(i18nNamespace ?? 'common');
  const { t: tUi } = useTranslation('tutorial');
  const titleKey = isDataStructure ? 'introductionTab.dataStructureTitle' : 'introductionTab.algorithmTitle';

  if (typeof introduction === 'string') {
    return (
      <div className={styles.introductionTab}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <span className={styles.cardTitleIcon}><Icon name="compass" decorative /></span>
            {tUi(titleKey)}
          </h3>
          <p className={styles.cardContent}>{introduction}</p>
        </div>
      </div>
    );
  }

  const sections = t(`${introduction.key}.sections`, {
    returnObjects: true,
    defaultValue: [],
  });

  if (!isIntroductionSectionArray(sections) || sections.length === 0) {
    return (
      <div className={styles.introductionTab}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <span className={styles.cardTitleIcon}><Icon name="compass" decorative /></span>
            {tUi(titleKey)}
          </h3>
          <p className={styles.cardContent}>{tUi('introductionTab.noContent')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.introductionTab}>
      {sections.map((section, index) => {
        const icon = section.icon ?? DEFAULT_SECTION_ICONS[index % DEFAULT_SECTION_ICONS.length] ?? 'compass';
        return (
          <section className={styles.sectionCard} key={`${section.heading}-${index}`}>
            <header className={styles.sectionHeader}>
              <span className={styles.iconBox}>
                <Icon name={icon} decorative />
              </span>
              <h4>{section.heading}</h4>
            </header>
            {section.content && (
              <p className={styles.sectionContent}>
                {renderInlineText(section.content)}
              </p>
            )}
            {section.items && section.items.length > 0 && (
              <ul className={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <li key={`${item}-${itemIndex}`}>
                    {renderInlineText(item)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default IntroductionTab;
