import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';
import SkeletonImage from './SkeletonImage';

/**
 * TutorialSkeleton - Tutorial 頁面骨架
 * 模擬：麵包屑 + 上方工具列 + 三欄 Panel 佈局
 */
function TutorialSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0', overflow: 'hidden' }}>
      {/* 麵包屑列 */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e0e0e0)' }}>
        <SkeletonText width="60px" height="14px" />
        <SkeletonText width="8px" height="14px" />
        <SkeletonText width="100px" height="14px" />
        <SkeletonText width="8px" height="14px" />
        <SkeletonText width="120px" height="14px" />
      </div>

      {/* 控制列 */}
      <div style={{ padding: '8px 24px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e0e0e0)' }}>
        <SkeletonButton width="80px" height="32px" />
        <SkeletonButton width="80px" height="32px" />
        <SkeletonButton width="80px" height="32px" />
        <div style={{ marginLeft: 'auto' }}>
          <SkeletonButton width="100px" height="32px" />
        </div>
      </div>

      {/* 三欄 Panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '2px' }}>
        {/* 左欄：知識站 */}
        <div style={{ flex: '0 0 30%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SkeletonText width="40%" height="20px" />
          <SkeletonText lines={4} width={['100%', '95%', '90%', '80%']} height="14px" spacing="8px" />
          <SkeletonImage width="100%" height="180px" variant="rounded" />
          <SkeletonText lines={3} width={['100%', '90%', '75%']} height="14px" spacing="8px" />
        </div>

        {/* 中欄：視覺化 */}
        <div style={{ flex: '0 0 40%', padding: '16px' }}>
          <SkeletonImage width="100%" height="100%" variant="rounded" />
        </div>

        {/* 右欄：程式碼 */}
        <div style={{ flex: '0 0 30%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonText width="60%" height="20px" />
          <SkeletonImage width="100%" height="calc(100% - 40px)" variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

export default TutorialSkeleton;
