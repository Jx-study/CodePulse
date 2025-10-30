import styles from './Skeleton.module.scss';
import SkeletonCard from './SkeletonCard';
import SkeletonText from './SkeletonText';
import SkeletonImage from './SkeletonImage';
import SkeletonButton from './SkeletonButton';

interface DataStructureAlgorithmSkeletonProps {
  cardsPerSlide?: number;
}

function DataStructureAlgorithmSkeleton({
  cardsPerSlide = 4,
}: DataStructureAlgorithmSkeletonProps) {
  return (
    <section className={styles.algorithmSkeleton} id="algorithms-skeleton">
      <div className="container">
        {/* Title Skeleton */}
        <div className={styles.titleSkeleton}>
          <SkeletonText width="350px" height="2.5rem" />
        </div>

        <div className={styles.sliderContainer}>
          {/* Cards Grid Skeleton */}
          <div className={styles.algorithmGrid}>
            {Array.from({ length: cardsPerSlide }).map((_, index) => (
              <div key={index} className={styles.algorithmCardSkeleton}>
                {/* Algorithm Image Skeleton */}
                <SkeletonImage
                  width="100%"
                  height="70px"
                  variant="rounded"
                />

                {/* Card Header: Title + Stars */}
                <div className={styles.cardHeader}>
                  <SkeletonText width="70%" height="1.25rem" />
                  <SkeletonText width="100px" height="1rem" />
                </div>

                {/* Description Skeleton - 2 lines */}
                <SkeletonText
                  lines={2}
                  width={['100%', '90%']}
                  height="1rem"
                />

                {/* Card Footer: Category + Button */}
                <div className={styles.cardFooter}>
                  <SkeletonText width="80px" height="1.5rem" />
                  <SkeletonButton width="100px" height="36px" />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots Skeleton */}
          <div className={styles.dotsContainer}>
            {Array.from({ length: 2 }).map((_, index) => (
              <SkeletonCard
                key={index}
                width="12px"
                height="12px"
                variant="circular"
                animation="pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DataStructureAlgorithmSkeleton;
