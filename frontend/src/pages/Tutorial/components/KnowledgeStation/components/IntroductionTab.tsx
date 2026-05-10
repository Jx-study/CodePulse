import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@/shared/components/Icon';
import type { IconName } from '@/shared/lib/iconMap';
import type { IntroductionContent, IntroductionSection } from '@/types';
import styles from './IntroductionTab.module.scss';

interface IntroductionTabProps {
  introduction: IntroductionContent;
  i18nNamespace?: string;
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

function renderInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\[(primary|success|warning|danger|info|muted)\|[^\]]+\]\])/g);

  return parts.map((part, index) => {
    if (!part || ['primary', 'success', 'warning', 'danger', 'info', 'muted'].includes(part)) {
      return null;
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    const colorMatch = part.match(/^\[\[(primary|success|warning|danger|info|muted)\|(.+)\]\]$/);
    if (colorMatch) {
      const [, tone, value] = colorMatch;
      return (
        <span className={styles[`tone-${tone}`]} key={index}>
          {value}
        </span>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

const IntroductionTab: React.FC<IntroductionTabProps> = ({
  introduction,
  i18nNamespace,
}) => {
  const { t } = useTranslation(i18nNamespace ?? 'common');

  if (typeof introduction === 'string') {
    return (
      <div className={styles.introductionTab}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <span className={styles.cardTitleIcon}><Icon name="compass" decorative /></span>
            演算法簡介
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
            演算法簡介
          </h3>
          <p className={styles.cardContent}>尚未提供教學內容。</p>
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
