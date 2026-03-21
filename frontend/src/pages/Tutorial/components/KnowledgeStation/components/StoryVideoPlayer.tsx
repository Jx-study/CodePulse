import React from 'react';
import type { StoryVideo } from '@/types';
import Icon from '@/shared/components/Icon';
import styles from './StoryVideoPlayer.module.scss';

interface Props {
  video?: StoryVideo;
}

function toEmbedUrl(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!match) return url;
  return `https://www.youtube.com/embed/${match[1]}`;
}

const StoryVideoPlayer: React.FC<Props> = ({ video }) => {
  if (video) {
    const embedUrl = toEmbedUrl(video.url);
    return (
      <div className={styles.videoWrapper}>
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={styles.videoWrapper}>
      <div className={styles.placeholder}>
        <Icon name="play" size="2xl" />
        <span>影片即將上線</span>
      </div>
    </div>
  );
};

export default StoryVideoPlayer;
