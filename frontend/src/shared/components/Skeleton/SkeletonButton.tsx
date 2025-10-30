import styles from './Skeleton.module.scss';

interface SkeletonButtonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'primary' | 'secondary' | 'outline';
  animation?: 'shimmer' | 'pulse' | 'none';
  className?: string;
}

function SkeletonButton({
  width = '100px',
  height = '36px',
  variant = 'primary',
  animation = 'shimmer',
  className = '',
}: SkeletonButtonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles.rounded} ${styles[animation]} ${styles.skeletonButton} ${className}`}
      style={style}
      aria-busy="true"
      aria-label="Loading button"
    />
  );
}

export default SkeletonButton;
