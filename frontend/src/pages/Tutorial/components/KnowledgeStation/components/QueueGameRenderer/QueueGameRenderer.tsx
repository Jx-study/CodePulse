import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid, faCat, faDog, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import type {
  CardItem,
  GameState,
  GameConfig,
  SwipeDir,
} from '@/types/games/queueGameTypes';
import type { QueueCardOutputData } from '@/types/implementation';
import {
  SWIPE_THRESHOLD,
  STACK_DEPTH,
  INITIAL_HP,
  STACK_OFFSETS,
} from './gameConfig';
import styles from './QueueGameRenderer.module.scss';
import Button from '@/shared/components/Button';

// ─── Pure Functions ────────────────────────────────────────────────────────

function buildInitialState(data: QueueCardOutputData): GameState {
  const config = data.config;
  return {
    status: 'idle',
    queue: [...data.initial_cards],
    hp: INITIAL_HP,
    score: 0,
    timeLeft: config.survive_seconds,
    feedback: null,
  };
}

function isCorrectSwipe(card: CardItem, dir: SwipeDir): boolean {
  if (dir === 'right') return card.type === 'dog';
  return card.type === 'cat';
}

function applySwipe(
  state: GameState,
  dir: SwipeDir,
  maxQueueSize: number
): GameState {
  if (state.queue.length === 0) return state;
  const card = state.queue[0];
  const correct = isCorrectSwipe(card, dir);
  const nextQueue = state.queue.slice(1);
  let nextHp = state.hp;
  let nextScore = state.score;
  let feedback: GameState['feedback'] = correct ? 'correct' : 'wrong';

  if (correct) {
    nextScore += 100;
  } else {
    nextHp -= 1;
  }

  const next: GameState = {
    ...state,
    queue: nextQueue,
    hp: nextHp,
    score: nextScore,
    feedback,
  };
  return checkOverflow(next, maxQueueSize);
}

function checkOverflow(state: GameState, max: number): GameState {
  if (state.queue.length <= max) return state;
  const nextQueue = [...state.queue];
  nextQueue.shift();
  return {
    ...state,
    queue: nextQueue,
    hp: state.hp - 1,
    feedback: 'overflow',
  };
}

function generateCard(nextIdRef: React.RefObject<number>): CardItem {
  const type = Math.random() < 0.5 ? 'cat' : 'dog';
  const lockId = Math.floor(Math.random() * 9999) + 1;
  const id = nextIdRef.current++;
  return {
    id,
    type,
    url: `https://loremflickr.com/400/400/${type}?lock=${lockId}`,
  };
}

// ─── Main Component ────────────────────────────────────────────────────────

interface Props {
  data: QueueCardOutputData;
}

export default function QueueGameRenderer({ data }: Props) {
  const config: GameConfig = {
    spawnRateMs: data.config.spawn_rate_ms,
    maxQueueSize: data.config.max_queue_size,
    surviveSeconds: data.config.survive_seconds,
  };

  const maxInitialId = Math.max(0, ...data.initial_cards.map((c) => c.id));
  const nextCardIdRef = useRef(maxInitialId + 1);

  const [gameState, setGameState] = useState<GameState>(() =>
    buildInitialState(data)
  );

  // Effect 1: Producer timer
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    const timer = setInterval(() => {
      const newCard = generateCard(nextCardIdRef);
      setGameState((prev) => {
        const next = { ...prev, queue: [...prev.queue, newCard] };
        return checkOverflow(next, config.maxQueueSize);
      });
    }, config.spawnRateMs);
    return () => clearInterval(timer);
  }, [gameState.status, config.spawnRateMs, config.maxQueueSize]);

  // Effect 2: Countdown timer
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    const tick = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, status: 'survived' };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [gameState.status]);

  // Effect 3: Queue 清空時立即補一張
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    if (gameState.queue.length > 0) return;
    const newCard = generateCard(nextCardIdRef);
    setGameState((prev) => ({ ...prev, queue: [newCard] }));
  }, [gameState.queue.length, gameState.status]);

  // Effect 4: HP 歸零偵測
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.hp <= 0) {
      setGameState((prev) => ({ ...prev, status: 'gameover' }));
    }
  }, [gameState.hp, gameState.status]);

  // Effect 4: feedback 短暫顯示後清除
  useEffect(() => {
    if (!gameState.feedback) return;
    const t = setTimeout(() => {
      setGameState((prev) => ({ ...prev, feedback: null }));
    }, 500);
    return () => clearTimeout(t);
  }, [gameState.feedback]);

  const handleStart = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: 'playing',
      timeLeft: config.surviveSeconds,
    }));
  }, [config.surviveSeconds]);

  const handleSwipe = useCallback(
    (dir: SwipeDir) => {
      if (gameState.status !== 'playing') return;
      if (gameState.queue.length === 0) return;
      setGameState((prev) => applySwipe(prev, dir, config.maxQueueSize));
    },
    [gameState.status, gameState.queue.length, config.maxQueueSize]
  );

  const handleNewGame = useCallback(() => {
    setGameState(buildInitialState(data));
  }, [data]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      const dragX = info.offset.x;
      if (dragX > SWIPE_THRESHOLD) {
        handleSwipe('right');
      } else if (dragX < -SWIPE_THRESHOLD) {
        handleSwipe('left');
      }
    },
    [handleSwipe]
  );

  const visibleCards = gameState.queue.slice(0, STACK_DEPTH);
  const queuePercent = Math.min(
    100,
    (gameState.queue.length / config.maxQueueSize) * 100
  );

  return (
    <div
      className={classNames(styles.container, {
        [styles.feedbackCorrect]: gameState.feedback === 'correct',
        [styles.feedbackWrong]: gameState.feedback === 'wrong',
        [styles.feedbackOverflow]: gameState.feedback === 'overflow',
      })}
    >
      <div className={styles.hud}>
        <div className={styles.hpRow}>
          {Array.from({ length: INITIAL_HP }).map((_, i) => (
            <span
              key={i}
              className={classNames(styles.heart, {
                [styles.heartLost]: i >= gameState.hp,
              })}
            >
              <FontAwesomeIcon icon={i < gameState.hp ? faHeartSolid : faHeartRegular} />
            </span>
          ))}
        </div>
        <div className={styles.score}>Score: {gameState.score}</div>
        <div className={styles.timer}>
          {gameState.status === 'playing' || gameState.status === 'survived'
            ? gameState.timeLeft
            : config.surviveSeconds}
          s
        </div>
        <div className={styles.queueBar}>
          <div
            className={styles.queueBarFill}
            style={{ width: `${queuePercent}%` }}
          />
          <span className={styles.queueBarLabel}>
            Queue {gameState.queue.length}/{config.maxQueueSize}
          </span>
        </div>
      </div>

      {(gameState.status === 'idle' || gameState.status === 'playing') && (
        <div className={styles.swipeHints}>
          <span>← <FontAwesomeIcon icon={faCat} size="3x" /></span>
          <span><FontAwesomeIcon icon={faDog} size="3x" /> →</span>
        </div>
      )}

      <div className={styles.stackArea}>
        <AnimatePresence mode="popLayout">
          {visibleCards.map((card, i) => {
            const offset = STACK_OFFSETS[i];
            const isFront = i === 0;
            return (
              <motion.div
                key={card.id}
                className={styles.card}
                drag={isFront ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={false}
                animate={{
                  scale: offset.scale,
                  rotate: offset.rotate,
                  y: offset.y,
                  opacity: offset.opacity,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.3 },
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  zIndex: STACK_DEPTH - i,
                }}
              >
                <img src={card.url} alt={card.type} className={styles.cardImg} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {gameState.feedback === 'overflow' && (
        <div className={styles.overflowText}>Queue 溢出！</div>
      )}

      <AnimatePresence>
        {gameState.status === 'survived' && (
          <motion.div
            className={styles.resultOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.resultCard}>
              <h3><FontAwesomeIcon icon={faTrophy} /> Queue Cleared!</h3>
              <p>Score: {gameState.score}</p>
              <Button
                type="button"
                variant="ghost"
                className={styles.newGameBtn}
                onClick={handleNewGame}
              >
                New Game
              </Button>
            </div>
          </motion.div>
        )}
        {gameState.status === 'gameover' && (
          <motion.div
            className={styles.resultOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={classNames(styles.resultCard, styles.gameoverCard)}>
              <h3>Game Over</h3>
              <p>Score: {gameState.score}</p>
              <Button
                type="button"
                variant="ghost"
                className={styles.newGameBtn}
                onClick={handleNewGame}
              >
                New Game
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {gameState.status === 'idle' && (
        <Button
          type="button"
          variant="primary"
          className={styles.startBtn}
          onClick={handleStart}
        >
          Start
        </Button>
      )}
    </div>
  );
}
