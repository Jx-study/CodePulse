import styles from './Skeleton.module.scss';

interface SkeletonImageProps {
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  variant?: 'rectangular' | 'rounded' | 'circular';
  animation?: 'shimmer' | 'pulse' | 'none';
  className?: string;
}

function SkeletonImage({
  width = '100%',
  height,
  aspectRatio,
  variant = 'rounded',
  animation = 'shimmer',
  className = '',
}: SkeletonImageProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
  };

  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  if (aspectRatio) {
    style.aspectRatio = aspectRatio;
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className}`}
      style={style}
      aria-busy="true"
      aria-label="Loading image"
    />
  );
}

export default SkeletonImage;
