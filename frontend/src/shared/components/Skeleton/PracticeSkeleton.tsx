import SkeletonText from './SkeletonText';
import SkeletonButton from './SkeletonButton';
import SkeletonImage from './SkeletonImage';

/**
 * PracticeSkeleton - Practice 頁面骨架
 * 模擬：麵包屑 + 題目區 + 程式碼編輯器 + 底部按鈕列
 */
function PracticeSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0' }}>
      {/* 麵包屑列 */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e0e0e0)' }}>
        <SkeletonText width="60px" height="14px" />
        <SkeletonText width="8px" height="14px" />
        <SkeletonText width="140px" height="14px" />
      </div>

      {/* 主內容區：左右分割 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左：題目敘述 */}
        <div style={{ flex: '0 0 45%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid var(--border-color, #e0e0e0)' }}>
          <SkeletonText width="70%" height="24px" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <SkeletonButton width="60px" height="24px" />
            <SkeletonButton width="60px" height="24px" />
          </div>
          <SkeletonText lines={6} width={['100%', '95%', '100%', '88%', '92%', '70%']} height="14px" spacing="10px" />
          <SkeletonImage width="100%" height="160px" variant="rounded" />
          <SkeletonText lines={3} width={['100%', '90%', '80%']} height="14px" spacing="10px" />
        </div>

        {/* 右：程式碼編輯器 */}
        <div style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column' }}>
          {/* 語言選擇列 */}
          <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color, #e0e0e0)' }}>
            <SkeletonButton width="80px" height="28px" />
            <SkeletonButton width="80px" height="28px" />
          </div>
          {/* 編輯器本體 */}
          <SkeletonImage width="100%" height="100%" variant="rectangular" />
        </div>
      </div>

      {/* 底部按鈕列 */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color, #e0e0e0)' }}>
        <SkeletonButton width="100px" height="40px" />
        <SkeletonButton width="120px" height="40px" />
      </div>
    </div>
  );
}

export default PracticeSkeleton;
