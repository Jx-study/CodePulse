import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/contexts/ThemeContext';
import Button from '@/shared/components/Button';
import Dialog from '@/shared/components/Dialog';
import Icon from '@/shared/components/Icon';
import useGameOfLife from '@/modules/auth/hooks/useGameOfLife';
import styles from './GameOfLifePanel.module.scss';

function GameOfLifePanel() {
  const { t } = useTranslation('auth');
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
          {t('gameOfLife.slogan')}
        </span>
      </div>

      <div className={styles.controls}>
        <Button
          variant="gameCtrl"
          onClick={() => setIsInfoOpen(true)}
          aria-label={t('gameOfLife.ariaLabel')}
          title={t('gameOfLife.aboutTitle')}
          icon="question-circle"
          iconOnly
        />
        <Button
          variant="gameCtrl"
          onClick={randomize}
          aria-label="Randomize"
          title="Randomize"
          icon="shuffle"
          iconOnly
        />
        <Button
          variant="gameCtrl"
          onClick={clear}
          aria-label="Clear"
          title="Clear"
          icon="times"
          iconOnly
        />
        <Button
          variant="gameCtrl"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause" : "Play"}
          icon={isPlaying ? "pause" : "play"}
          iconOnly
        />
      </div>

      <Dialog
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={t('gameOfLife.title')}
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsInfoOpen(false)}
            >
              {t('gameOfLife.close')}
            </Button>
          </>
        }
      >
        <div className={styles.infoContent}>
          <p
            className={styles.infoDesc}
            dangerouslySetInnerHTML={{ __html: t('gameOfLife.description') }}
          />

          <div className={styles.rulesHeader}>
            <span className={styles.rulesLabel}>{t('gameOfLife.rulesHeader')}</span>
          </div>

          <div className={styles.rulesGrid}>
            {(['01', '02', '03', '04'] as const).map((num, i) => {
              const statusMap = ['die', 'live', 'die', 'born'] as const;
              return (
                <div key={num} className={styles.ruleCard}>
                  <span className={styles.ruleIndex}>{num}</span>
                  <div className={styles.ruleBody}>
                    <span className={styles.ruleStatus} data-status={statusMap[i]}>
                      {t(`gameOfLife.rules.${num}.label`)}
                    </span>
                    <p dangerouslySetInnerHTML={{ __html: t(`gameOfLife.rules.${num}.desc`) }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.hint}>
            <span className={styles.hintPrompt}>$&gt;</span>
            <span dangerouslySetInnerHTML={{ __html: t('gameOfLife.hint') }} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default GameOfLifePanel;
