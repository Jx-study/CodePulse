import styles from './Skeleton.module.scss';
import SkeletonCard from './SkeletonCard';
import SkeletonText from './SkeletonText';
import SkeletonImage from './SkeletonImage';

interface FeaturesSkeletonProps {
  count?: number;
}

function FeaturesSkeleton({ count = 4 }: FeaturesSkeletonProps) {
  return (
    <section className={styles.featuresSkeleton} id="features-skeleton">
      <div className="container">
        {/* Title Skeleton */}
        <div className={styles.titleSkeleton}>
          <SkeletonText width="300px" height="2.5rem" />
        </div>

        {/* Scrolling Cards Container */}
        <div className={styles.scrollContainer}>
          <div className={styles.cardContainer}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className={styles.featureCardSkeleton}>
                {/* Icon Skeleton */}
                <SkeletonImage
                  width="60px"
                  height="60px"
                  variant="rounded"
                />

                {/* Title Skeleton */}
                <SkeletonText width="80%" height="1.5rem" />

                {/* Description Skeleton - 3 lines with varying widths */}
                <SkeletonText
                  lines={3}
                  width={['100%', '95%', '85%']}
                  height="1rem"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSkeleton;
