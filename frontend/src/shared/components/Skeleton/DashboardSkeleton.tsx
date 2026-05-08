import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';
import SkeletonImage from './SkeletonImage';

/**
 * DashboardSkeleton - LearningDashboard 頁面骨架
 * 模擬：頂部 filter bar + 中央大型圖形 canvas
 */
function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 頂部 filter bar */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e0e0e0)' }}>
        <SkeletonText width="120px" height="20px" />
        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonButton key={i} width="80px" height="32px" />
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <SkeletonButton width="36px" height="36px" />
          <SkeletonButton width="36px" height="36px" />
        </div>
      </div>

      {/* 圖形 canvas 主區域 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '24px' }}>
        <SkeletonImage width="100%" height="100%" variant="rounded" />
        {/* 模擬幾個節點佔位 */}
        {[
          { top: '20%', left: '50%' },
          { top: '45%', left: '25%' },
          { top: '45%', left: '75%' },
          { top: '70%', left: '40%' },
          { top: '70%', left: '60%' },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, -50%)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--skeleton-bg, #e0e0e0)',
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
