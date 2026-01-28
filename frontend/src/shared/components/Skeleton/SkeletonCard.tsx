import type { SkeletonCardProps } from '@/types';
import styles from './Skeleton.module.scss';

export function SkeletonCard({
  width = '100%',
  height = '200px',
  variant = 'rounded',
  animation = 'shimmer',
  className = '',
  children,
}: SkeletonCardProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  // If children provided, wrap them in a skeleton card container
  if (children) {
    return (
      <div
        className={`${styles.skeletonCardContainer} ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }

  // Otherwise, render a simple skeleton block
  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

export default SkeletonCard;
