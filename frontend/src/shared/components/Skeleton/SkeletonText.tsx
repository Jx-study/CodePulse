import styles from './Skeleton.module.scss';

interface SkeletonTextProps {
  lines?: number;
  width?: string | number | Array<string | number>;
  height?: string | number;
  spacing?: string | number;
  animation?: 'shimmer' | 'pulse' | 'none';
}

function SkeletonText({
  lines = 1,
  width = '100%',
  height = '1em',
  spacing = '0.5em',
  animation = 'shimmer',
}: SkeletonTextProps) {
  const widths = Array.isArray(width) ? width : Array(lines).fill(width);
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  const spacingValue = typeof spacing === 'number' ? `${spacing}px` : spacing;

  return (
    <div className={styles.skeletonTextContainer} style={{ gap: spacingValue }}>
      {widths.map((w, index) => (
        <div
          key={index}
          className={`${styles.skeleton} ${styles.rectangular} ${styles[animation]}`}
          style={{
            width: typeof w === 'number' ? `${w}px` : w,
            height: heightValue,
          }}
          aria-busy="true"
        />
      ))}
    </div>
  );
}

export default SkeletonText;
