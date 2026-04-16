import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';
import SkeletonImage from './SkeletonImage';

/**
 * ExplorerSkeleton - Explorer 頁面骨架
 * 模擬：左側圖形 canvas + 右側程式碼編輯器（左右分割）
 */
function ExplorerSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 頂部工具列 */}
      <div style={{ padding: '10px 24px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e0e0e0)' }}>
        <SkeletonText width="100px" height="18px" />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <SkeletonButton width="80px" height="32px" />
          <SkeletonButton width="80px" height="32px" />
          <SkeletonButton width="80px" height="32px" />
        </div>
      </div>

      {/* 主內容：左右分割 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左：視覺化圖形 */}
        <div style={{ flex: '0 0 55%', padding: '16px', borderRight: '1px solid var(--border-color, #e0e0e0)' }}>
          <SkeletonImage width="100%" height="100%" variant="rounded" />
        </div>

        {/* 右：程式碼編輯器 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 語言 tab 列 */}
          <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color, #e0e0e0)' }}>
            <SkeletonButton width="70px" height="28px" />
            <SkeletonButton width="70px" height="28px" />
            <SkeletonButton width="70px" height="28px" />
          </div>
          <SkeletonImage width="100%" height="100%" variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

export default ExplorerSkeleton;
