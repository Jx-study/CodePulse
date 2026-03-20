import React from 'react';
import type { StoryResource, StoryResourceType } from '@/types';
import Icon from '@/shared/components/Icon';
import type { IconName } from '@/shared/lib/iconMap';
import styles from './StoryResources.module.scss';

const ICON_MAP: Record<StoryResourceType, IconName> = {
  article: 'file-lines',
  paper: 'flask',
  link: 'link',
};

interface Props {
  resources: StoryResource[];
}

const StoryResources: React.FC<Props> = ({ resources }) => {
  return (
    <div className={styles.resources}>
      <h4 className={styles.resourcesTitle}>延伸資源</h4>
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
              <span className={styles.resourceText}>{r.title}</span>
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
