import React from 'react';
import { useTranslation } from 'react-i18next';
import type { StoryResourceType } from '@/types';
import Icon from '@/shared/components/Icon';
import type { IconName } from '@/shared/lib/iconMap';
import styles from './StoryResources.module.scss';

const ICON_MAP: Record<StoryResourceType, IconName> = {
  article: 'file-lines',
  paper: 'flask',
  link: 'link',
};

export interface ResolvedStoryResource {
  type: StoryResourceType;
  url: string;
  title?: string;
  source?: string;
}

interface Props {
  resources: ResolvedStoryResource[];
}

const StoryResources: React.FC<Props> = ({ resources }) => {
  const { t } = useTranslation('tutorial');

  return (
    <div className={styles.resources}>
      <h4 className={styles.resourcesTitle}>{t('storyResources.title')}</h4>
      <ul className={styles.resourcesList}>
        {resources.map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceLink}
            >
              <span className={styles.resourceIcon}>
                <Icon name={ICON_MAP[r.type]} decorative />
              </span>
              <span className={styles.resourceText}>{r.title ?? r.url}</span>
              {r.source && (
                <span className={styles.resourceSource}>({r.source})</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StoryResources;
