import { useRef, useState, useEffect } from 'react';
import { useTheme } from '@/shared/contexts/ThemeContext';
import Button from '@/shared/components/Button';
import Dialog from '@/shared/components/Dialog';
import Icon from '@/shared/components/Icon';
import useGameOfLife from '../../hooks/useGameOfLife';
import styles from './GameOfLifePanel.module.scss';

function GameOfLifePanel() {
  const { resolvedTheme } = useTheme();
  const {
    canvasRef,
    isPlaying,
    randomize,
    clear,
    togglePlay,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useGameOfLife(resolvedTheme);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.panel}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      <div className={styles.overlay}>
        <div className={styles.brand}>
          <img
            src="/images/favicon.png"
            alt="CodePulse icon"
            className={styles.brandIcon}
          />
          <span className={styles.brandName}>
            <span className={styles.brandCode}>Code</span>
            <span className={styles.brandPulse}>Pulse</span>
          </span>
        </div>
        <span className={styles.slogan}>
          Simulate the logic, visualize the pulse.
        </span>
      </div>

      <div className={styles.controls}>
        <Button variant="gameCtrl" onClick={() => setIsInfoOpen(true)} aria-label="關於 Conway's Game of Life" title="關於此動畫" icon="question-circle" iconOnly />
        <Button variant="gameCtrl" onClick={randomize} aria-label="Randomize" title="Randomize" icon="shuffle" iconOnly />
        <Button variant="gameCtrl" onClick={clear} aria-label="Clear" title="Clear" icon="times" iconOnly />
        <Button variant="gameCtrl" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} title={isPlaying ? 'Pause' : 'Play'} icon={isPlaying ? 'pause' : 'play'} iconOnly />
      </div>

      <Dialog
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Conway's Game of Life"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<Icon name="globe" />}
              onClick={() => window.open('https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', '_blank', 'noopener,noreferrer')}
            >
              Wikipedia
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsInfoOpen(false)}>關閉</Button>
          </>
        }
      >
        <div className={styles.infoContent}>
          <p className={styles.infoDesc}>
            由英國數學家 <strong>John Horton Conway</strong> 於 1970 年發明的細胞自動機。
            無需玩家操作，僅依靠初始狀態與四條規則無限演化。
          </p>

          <div className={styles.rulesHeader}>
            <span className={styles.rulesLabel}>// evolution rules</span>
          </div>

          <div className={styles.rulesGrid}>
            <div className={styles.ruleCard}>
              <span className={styles.ruleIndex}>01</span>
              <div className={styles.ruleBody}>
                <span className={styles.ruleStatus} data-status="die">孤立死亡</span>
                <p>活細胞鄰居 <strong>&lt; 2</strong> 個時死亡</p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <span className={styles.ruleIndex}>02</span>
              <div className={styles.ruleBody}>
                <span className={styles.ruleStatus} data-status="live">穩定存活</span>
                <p>活細胞鄰居 <strong>2 ~ 3</strong> 個時存活</p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <span className={styles.ruleIndex}>03</span>
              <div className={styles.ruleBody}>
                <span className={styles.ruleStatus} data-status="die">過擁擠死亡</span>
                <p>活細胞鄰居 <strong>&gt; 3</strong> 個時死亡</p>
              </div>
            </div>
            <div className={styles.ruleCard}>
              <span className={styles.ruleIndex}>04</span>
              <div className={styles.ruleBody}>
                <span className={styles.ruleStatus} data-status="born">復活誕生</span>
                <p>死細胞鄰居 <strong>= 3</strong> 個時復活</p>
              </div>
            </div>
          </div>

          <div className={styles.hint}>
            <span className={styles.hintPrompt}>$&gt;</span>
            點擊或拖曳畫布繪製細胞，按 <kbd>▶</kbd> 開始模擬
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default GameOfLifePanel;
