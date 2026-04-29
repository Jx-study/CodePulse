import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import Button from '@/shared/components/Button';
import Icon from '@/shared/components/Icon';
import styles from './BinarySearchOutputRenderer.module.scss';

type GameStatus = 'idle' | 'playing' | 'ended';
type GameResult = 'player_wins' | 'tie' | 'ai_wins' | 'timeout' | null;

interface GameState {
  status: GameStatus;
  result: GameResult;
  playerLo: number;
  playerHi: number;
  playerGuesses: number[];
  aiLo: number;
  aiHi: number;
  aiGuesses: number[];
  currentAiGuess: number | null;
}

interface LeaderboardEntry {
  id: string;
  playerSteps: number;
  aiSteps: number;
  result: GameResult;
}

const MAX_STEPS = 7;
const RANGE_MIN = 1;
const RANGE_MAX = 100;

const SVG_W = 600;
const SVG_H = 180;
const PAD_L = 36;
const INNER_W = 528;

const AI_BAR_Y = 20;
const AI_BAR_H = 14;
const AI_CY = AI_BAR_Y + AI_BAR_H / 2;

const PLAYER_BAR_Y = 54;
const PLAYER_BAR_H = 60;
const PLAYER_CY = PLAYER_BAR_Y + PLAYER_BAR_H / 2;

const TICK_Y = PLAYER_BAR_Y + PLAYER_BAR_H + 14;

function xAt(n: number): number {
  return ((n - 1) / 99) * INNER_W + PAD_L;
}

function nFromClientX(svgEl: SVGSVGElement, clientX: number): number {
  const rect = svgEl.getBoundingClientRect();
  const scaleX = SVG_W / rect.width;
  const svgX = (clientX - rect.left) * scaleX;
  const raw = ((svgX - PAD_L) / INNER_W) * 99 + 1;
  return Math.max(RANGE_MIN, Math.min(RANGE_MAX, Math.round(raw)));
}

function buildInitialState(): GameState {
  return {
    status: 'idle',
    result: null,
    playerLo: RANGE_MIN,
    playerHi: RANGE_MAX,
    playerGuesses: [],
    aiLo: RANGE_MIN,
    aiHi: RANGE_MAX,
    aiGuesses: [],
    currentAiGuess: Math.floor((RANGE_MIN + RANGE_MAX) / 2),
  };
}

function computeAiGuess(lo: number, hi: number): number {
  return Math.floor((lo + hi) / 2);
}

function computeProbability(lo: number, hi: number): number {
  return Math.round((1 / (hi - lo + 1)) * 1000) / 10;
}

function ceilStepsToFind(lo: number, hi: number): number {
  const n = hi - lo + 1;
  if (n <= 1) return 0;
  return Math.ceil(Math.log2(n));
}

function processRound(
  playerGuess: number,
  state: GameState,
  secret: number,
): GameState {
  const aiGuess = state.currentAiGuess!;
  const newPlayerGuesses = [...state.playerGuesses, playerGuess];
  const newAiGuesses = [...state.aiGuesses, aiGuess];

  let newPlayerLo = state.playerLo;
  let newPlayerHi = state.playerHi;
  if (playerGuess < secret) newPlayerLo = playerGuess + 1;
  else if (playerGuess > secret) newPlayerHi = playerGuess - 1;

  let newAiLo = state.aiLo;
  let newAiHi = state.aiHi;
  if (aiGuess < secret) newAiLo = aiGuess + 1;
  else if (aiGuess > secret) newAiHi = aiGuess - 1;

  const playerFound = playerGuess === secret;
  const aiFound = aiGuess === secret;
  const timedOut = newPlayerGuesses.length >= MAX_STEPS && !playerFound;

  if (playerFound || aiFound || timedOut) {
    let result: GameResult;
    if (timedOut) result = 'timeout';
    else if (playerFound && aiFound) result = 'tie';
    else if (playerFound) result = 'player_wins';
    else result = 'ai_wins';

    return {
      ...state,
      status: 'ended',
      result,
      playerLo: newPlayerLo,
      playerHi: newPlayerHi,
      playerGuesses: newPlayerGuesses,
      aiLo: newAiLo,
      aiHi: newAiHi,
      aiGuesses: newAiGuesses,
      currentAiGuess: null,
    };
  }

  return {
    ...state,
    status: 'playing',
    result: null,
    playerLo: newPlayerLo,
    playerHi: newPlayerHi,
    playerGuesses: newPlayerGuesses,
    aiLo: newAiLo,
    aiHi: newAiHi,
    aiGuesses: newAiGuesses,
    currentAiGuess: computeAiGuess(newAiLo, newAiHi),
  };
}

const BinarySearchOutputRenderer: React.FC = () => {
  const [secret, setSecret] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [gameState, setGameState] = useState<GameState>(buildInitialState);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hoverN, setHoverN] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const leaderboardEndKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (gameState.status !== 'ended' || !gameState.result) return;
    const key = `${secret}|${gameState.playerGuesses.join(',')}|${gameState.result}`;
    if (leaderboardEndKeyRef.current === key) return;
    leaderboardEndKeyRef.current = key;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setLeaderboard((prev) => [
      ...prev,
      {
        id,
        playerSteps: gameState.playerGuesses.length,
        aiSteps: gameState.aiGuesses.length,
        result: gameState.result,
      },
    ]);
  }, [gameState, secret]);

  const handleNewGame = useCallback(() => {
    const nextSecret = Math.floor(Math.random() * 100) + 1;
    setSecret(nextSecret);
    leaderboardEndKeyRef.current = null;
    setGameState(buildInitialState());
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (gameState.status === 'ended') {
        setHoverN(null);
        return;
      }
      if (!svgRef.current) return;
      setHoverN(nFromClientX(svgRef.current, e.clientX));
    },
    [gameState.status],
  );

  const onPointerLeave = useCallback(() => setHoverN(null), []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (gameState.status === 'ended') return;
      if (!svgRef.current) return;
      const n = nFromClientX(svgRef.current, e.clientX);
      if (n < gameState.playerLo || n > gameState.playerHi) return;
      e.preventDefault();
      setGameState((prev) => processRound(n, prev, secret));
    },
    [gameState.status, gameState.playerLo, gameState.playerHi, secret],
  );

  const cellW = INNER_W / 99;
  const playerActiveLeft = xAt(gameState.playerLo) - cellW / 2;
  const playerActiveWidth = Math.max(0, xAt(gameState.playerHi) - xAt(gameState.playerLo) + cellW);

  const zoneEnded = gameState.status === 'ended';
  const playerZoneFill = zoneEnded ? '#4B5563' : '#3B82F6';

  const remaining = gameState.playerHi - gameState.playerLo + 1;
  const prob = computeProbability(gameState.playerLo, gameState.playerHi);
  const maxMore = ceilStepsToFind(gameState.playerLo, gameState.playerHi);

  const winRate = useMemo(() => {
    if (leaderboard.length === 0) return null;
    const wins = leaderboard.filter((e) => e.result === 'player_wins').length;
    return Math.round((wins / leaderboard.length) * 100);
  }, [leaderboard]);

  const resultContent = useMemo(() => {
    const ps = gameState.playerGuesses.length;
    const as = gameState.aiGuesses.length;
    switch (gameState.result) {
      case 'player_wins':
        return {
          cls: styles.resultPlayer,
          node: <><Icon name="trophy" /> 你贏了！你用 {ps} 步</>,
        };
      case 'tie':
        return {
          cls: styles.resultTie,
          node: <><Icon name="check-circle" /> 平手！你和 AI 都用了 {ps} 步</>,
        };
      case 'ai_wins':
        return {
          cls: styles.resultAi,
          node: <><Icon name="cog" /> AI 贏了（{as} 步），密碼是 {secret}</>,
        };
      case 'timeout':
        return {
          cls: styles.resultTimeout,
          node: <><Icon name="stopwatch" /> 超過 {MAX_STEPS} 步上限，密碼是 {secret}</>,
        };
      default:
        return null;
    }
  }, [gameState.result, gameState.playerGuesses.length, gameState.aiGuesses.length, secret]);

  const isInActiveZone = hoverN !== null && hoverN >= gameState.playerLo && hoverN <= gameState.playerHi;

  return (
    <div className={styles.wrapper}>
      {/* Purpose Section */}
      <div className={styles.purpose}>
        <div className={styles.purposeTitle}>Binary Search 對決：擊敗演算法</div>
        <div className={styles.purposeBody}>
          <p>
            在 1～100 中藏有一個密碼。點擊<strong>藍色搜尋區間</strong>猜測；每次決策縮小一半可能性。
          </p>
          <p>
            <span className={styles.badge} style={{ background: '#3B82F6' }} />
            藍區 = 你的搜尋範圍
            <span className={styles.badge} style={{ background: '#F97316' }} />
            橙點 = AI 的猜測紀錄（永遠取中點）　目標：<strong>步數少於 AI</strong>！
          </p>
        </div>
      </div>

      {/* Game Header */}
      <div className={styles.gameHeader}>
        <div className={styles.stepTrack}>
          <span className={styles.stepLabel}>你</span>
          {Array.from({ length: MAX_STEPS }, (_, i) => (
            <span
              key={i}
              className={classNames(styles.stepDot, {
                [styles.stepDotActive]: i < gameState.playerGuesses.length,
              })}
            />
          ))}
          <span className={styles.stepCount}>{gameState.playerGuesses.length}/{MAX_STEPS}</span>
        </div>
        <div className={styles.stepTrack}>
          <span className={styles.stepLabel}>AI</span>
          {Array.from({ length: MAX_STEPS }, (_, i) => (
            <span
              key={i}
              className={classNames(styles.stepDot, styles.stepDotAi, {
                [styles.stepDotActive]: i < gameState.aiGuesses.length,
              })}
            />
          ))}
          <span className={styles.stepCount}>{gameState.aiGuesses.length}/{MAX_STEPS}</span>
        </div>
        <div className={styles.secretDisplay}>
          密碼：
          {zoneEnded ? (
            <strong className={styles.secretRevealed}>{secret}</strong>
          ) : (
            <span className={styles.secretHidden}>???</span>
          )}
        </div>
        <Button
          variant="ghost"
          className={styles.newGameBtn}
          onClick={handleNewGame}
          disabled={gameState.status === 'playing'}
          title={gameState.status === 'playing' ? '遊戲進行中，請先完成' : '重新開始（新密碼）'}
        >
          New Game
        </Button>
      </div>

      {/* SVG Number Line */}
      <div className={styles.svgContainer}>
        <svg
          ref={svgRef}
          className={classNames(styles.svg, { [styles.svgEnded]: zoneEnded })}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
        >
          {/* AI Bar (background only, no active zone) */}
          <text
            x={PAD_L - 6}
            y={AI_CY + 4}
            textAnchor="end"
            fill="#F97316"
            fontSize={10}
            fontWeight={700}
          >
            AI
          </text>
          <rect x={PAD_L} y={AI_BAR_Y} width={INNER_W} height={AI_BAR_H} rx={3} fill="#1a0f00" />
          {gameState.aiGuesses.map((g, i) => (
            <circle
              key={`ai-h-${i}`}
              cx={xAt(g)}
              cy={AI_CY}
              r={4}
              fill="#F97316"
              fillOpacity={0.65}
            />
          ))}
          {gameState.currentAiGuess !== null && (
            <polygon
              transform={`translate(${xAt(gameState.currentAiGuess)}, ${AI_CY})`}
              points="0,-7 7,0 0,7 -7,0"
              fill="#F97316"
              stroke="#EA580C"
              strokeWidth={1}
            />
          )}

          {/* Player Bar */}
          <text
            x={PAD_L - 6}
            y={PLAYER_CY + 4}
            textAnchor="end"
            fill="#60A5FA"
            fontSize={10}
            fontWeight={700}
          >
            你
          </text>
          <rect
            x={PAD_L}
            y={PLAYER_BAR_Y}
            width={INNER_W}
            height={PLAYER_BAR_H}
            rx={6}
            fill="#111827"
          />
          <rect
            x={playerActiveLeft}
            y={PLAYER_BAR_Y}
            width={playerActiveWidth}
            height={PLAYER_BAR_H}
            rx={6}
            fill={playerZoneFill}
            fillOpacity={0.88}
          />
          {gameState.playerGuesses.map((g, i) => {
            const correct = g === secret && zoneEnded;
            return (
              <g key={`p-${i}`}>
                <circle
                  cx={xAt(g)}
                  cy={PLAYER_CY}
                  r={correct ? 11 : 9}
                  fill={correct ? '#10B981' : '#FBBF24'}
                  stroke={correct ? '#059669' : '#D97706'}
                  strokeWidth={1.5}
                />
                <text
                  x={xAt(g)}
                  y={PLAYER_CY + 4}
                  textAnchor="middle"
                  fill={correct ? '#fff' : '#1f2937'}
                  fontSize={9}
                  fontWeight={700}
                >
                  {g}
                </text>
              </g>
            );
          })}
          {zoneEnded && (
            <circle
              cx={xAt(secret)}
              cy={PLAYER_CY}
              r={15}
              fill="none"
              stroke="#10B981"
              strokeWidth={2.5}
              className={styles.secretPulse}
            />
          )}

          {/* Tick marks */}
          {[1, 10, 25, 50, 75, 90, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={xAt(tick)}
                y1={TICK_Y - 4}
                x2={xAt(tick)}
                y2={TICK_Y + 1}
                stroke="#374151"
                strokeWidth={1}
              />
              <text x={xAt(tick)} y={TICK_Y + 12} textAnchor="middle" fill="#6B7280" fontSize={9}>
                {tick}
              </text>
            </g>
          ))}

          {/* Hover preview */}
          {hoverN !== null && !zoneEnded && (
            <g>
              <line
                x1={xAt(hoverN)}
                y1={AI_BAR_Y - 2}
                x2={xAt(hoverN)}
                y2={PLAYER_BAR_Y + PLAYER_BAR_H + 6}
                stroke={isInActiveZone ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={1}
                strokeDasharray="3 2"
              />
              <rect
                x={xAt(hoverN) - 18}
                y={2}
                width={36}
                height={15}
                rx={3}
                fill="rgba(15,17,23,0.92)"
              />
              <text
                x={xAt(hoverN)}
                y={13}
                textAnchor="middle"
                fill={isInActiveZone ? '#fff' : '#6B7280'}
                fontSize={11}
                fontWeight={700}
              >
                {hoverN}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Stats Panel */}
      <div className={styles.statsPanel}>
        <div className={styles.statItem}>
          <div className={styles.statValue} style={{ color: '#3B82F6' }}>
            {prob}%
          </div>
          <div className={styles.statLabel}>現在機率</div>
          <div className={styles.probBar}>
            <div className={styles.probFill} style={{ width: `${Math.min(100, prob)}%` }} />
          </div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div className={styles.statValue}>{remaining}</div>
          <div className={styles.statLabel}>剩餘候選數字</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div
            className={styles.statValue}
            style={{ color: maxMore <= 2 ? '#10B981' : 'var(--text-primary)' }}
          >
            {maxMore === 0 ? '必中' : `≤ ${maxMore} 步`}
          </div>
          <div className={styles.statLabel}>理論上界（二分法）</div>
        </div>
      </div>

      {/* Result Banner */}
      {resultContent && (
        <div className={classNames(styles.resultBanner, resultContent.cls)}>
          {resultContent.node}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className={styles.leaderboard}>
          <div className={styles.leaderboardHeader}>
            <h4 className={styles.leaderboardTitle}><Icon name="chart-line" /> 對決記錄</h4>
            <span className={styles.winRate}>
              勝率 {winRate}%（{leaderboard.filter((e) => e.result === 'player_wins').length} / {leaderboard.length} 局）
            </span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>場次</th>
                <th>玩家步數</th>
                <th>AI 步數</th>
                <th>結果</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={row.id}>
                  <td>{i + 1}</td>
                  <td>{row.playerSteps}</td>
                  <td>{row.aiSteps}</td>
                  <td>
                    {row.result === 'player_wins'
                      ? '你贏'
                      : row.result === 'tie'
                        ? '平手'
                        : row.result === 'ai_wins'
                          ? 'AI 贏'
                          : '超時'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BinarySearchOutputRenderer;
