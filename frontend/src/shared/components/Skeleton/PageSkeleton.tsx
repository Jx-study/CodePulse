import styles from './Skeleton.module.scss';
import SkeletonCard from './SkeletonCard';
import SkeletonText from './SkeletonText';
import SkeletonImage from './SkeletonImage';
import SkeletonButton from './SkeletonButton';

/**
 * PageSkeleton - 完整頁面載入骨架屏
 * 用於頂層 Suspense fallback，模擬整個頁面的載入狀態
 */
function PageSkeleton() {
  return (
    <div className={styles.pageSkeleton}>
      {/* Header Skeleton */}
      <header className={styles.headerSkeleton}>
        <div className="container">
          <div className={styles.headerContent}>
            {/* Logo */}
            <SkeletonText width="150px" height="2rem" />

            {/* Navigation */}
            <div className={styles.navSkeleton}>
              <SkeletonText width="80px" height="1rem" />
              <SkeletonText width="80px" height="1rem" />
              <SkeletonText width="80px" height="1rem" />
              <SkeletonText width="80px" height="1rem" />
            </div>

            {/* Auth Buttons */}
            <div className={styles.authButtonsSkeleton}>
              <SkeletonButton width="80px" height="36px" />
              <SkeletonButton width="80px" height="36px" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <section className={styles.heroSkeleton}>
        <div className="container">
          <div className={styles.heroContent}>
            {/* Title */}
            <SkeletonText width="80%" height="3.5rem" />
            <SkeletonText width="60%" height="3.5rem" />

            {/* Subtitle */}
            <div className={styles.heroSubtitle}>
              <SkeletonText width="70%" height="1.5rem" />
              <SkeletonText width="65%" height="1.5rem" />
            </div>

            {/* CTA Buttons */}
            <div className={styles.heroButtons}>
              <SkeletonButton width="150px" height="48px" />
              <SkeletonButton width="150px" height="48px" />
            </div>

            {/* Hero Image */}
            <div className={styles.heroImage}>
              <SkeletonImage width="100%" height="400px" variant="rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections Skeleton */}
      <section className={styles.contentSkeleton}>
        <div className="container">
          {/* Section Title */}
          <div className={styles.sectionTitle}>
            <SkeletonText width="350px" height="2.5rem" />
          </div>

          {/* Cards Grid */}
          <div className={styles.cardsGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={styles.cardSkeleton}>
                <SkeletonImage width="100%" height="180px" variant="rounded" />
                <SkeletonText width="80%" height="1.5rem" />
                <SkeletonText lines={3} width={['100%', '95%', '85%']} height="1rem" />
                <div className={styles.cardFooter}>
                  <SkeletonText width="80px" height="1.5rem" />
                  <SkeletonButton width="100px" height="36px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Skeleton */}
      <footer className={styles.footerSkeleton}>
        <div className="container">
          <div className={styles.footerContent}>
            <SkeletonText width="200px" height="1rem" />
            <div className={styles.footerLinks}>
              <SkeletonText width="60px" height="1rem" />
              <SkeletonText width="60px" height="1rem" />
              <SkeletonText width="60px" height="1rem" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PageSkeleton;
