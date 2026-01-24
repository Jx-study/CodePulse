import styles from './PortalNode.module.scss';
import type { PortalNodeProps } from '@/types/pages/dashboard';

function PortalNode({
  targetCategory,
  targetCategoryName,
  isUnlocked,
  position,
  onClick,
}: PortalNodeProps) {
  const handleClick = () => {
    if (isUnlocked) {
      onClick();
    }
  };

  const nodeClassName = [
    styles.portalNode,
    isUnlocked ? styles.unlocked : styles.locked,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={nodeClassName}
      style={{
        position: 'absolute',
        left: position.x,
        top: `${position.y}px`,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={isUnlocked ? 0 : -1}
      aria-label={`傳送門: 前往 ${targetCategoryName}`}
      aria-disabled={!isUnlocked}
      data-portal-target={targetCategory}
    >
      <div className={styles.portalContent}>
        {/* 傳送門圖示 */}
        <span className={styles.portalIcon}>🚪</span>

        {/* 鎖定圖示 (未解鎖時顯示) */}
        {!isUnlocked && <span className={styles.lockIcon}>🔒</span>}
      </div>

      {/* 懸浮標籤 */}
      <div className={styles.portalTooltip}>
        <span>
          {isUnlocked
            ? `前往 ${targetCategoryName}`
            : `🔒 完成 Boss Level 以解鎖`}
        </span>
      </div>
    </div>
  );
}

export default PortalNode;
