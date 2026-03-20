import React, { useState, useCallback } from "react";
import classNames from "classnames";
import type {
  InvestmentItem,
  GameState,
  DPResult,
  SelectionStat,
} from "@/types/games/knapsackGameTypes";
import {
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_DEFAULT,
  ITEMS,
  MAX_ITEM_VALUE,
} from "./gameConfig";
import styles from "./KnapsackGameRenderer.module.scss";
import Button from "@/shared/components/Button";
import Slider from "@/shared/components/Slider";

// ─── Pure Functions ────────────────────────────────────────────────────────

function computeDP(items: InvestmentItem[], budget: number): DPResult {
  const n = items.length;
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(budget + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= budget; w++) {
      if (weight > w) {
        dp[i][w] = dp[i - 1][w];
      } else {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weight] + value
        );
      }
    }
  }

  // Backtrack to get selected item ids
  const selectedIds: number[] = [];
  let w = budget;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedIds.push(items[i - 1].id);
      w -= items[i - 1].weight;
    }
  }

  return {
    maxValue: dp[n][budget],
    selectedIds,
  };
}

function computeGreedy(items: InvestmentItem[], budget: number): number[] {
  const sorted = [...items].sort((a, b) => b.value / b.weight - a.value / a.weight);
  const selectedIds: number[] = [];
  let remaining = budget;
  for (const item of sorted) {
    if (item.weight <= remaining) {
      selectedIds.push(item.id);
      remaining -= item.weight;
    }
  }
  return selectedIds;
}

function computeSelection(
  items: InvestmentItem[],
  selectedIds: Set<number>
): SelectionStat {
  let totalWeight = 0;
  let totalValue = 0;
  for (const item of items) {
    if (selectedIds.has(item.id)) {
      totalWeight += item.weight;
      totalValue += item.value;
    }
  }
  return { totalWeight, totalValue };
}

function canSelect(
  item: InvestmentItem,
  selectedIds: Set<number>,
  items: InvestmentItem[],
  budget: number
): boolean {
  if (selectedIds.has(item.id)) return true;
  const { totalWeight } = computeSelection(items, selectedIds);
  return totalWeight + item.weight <= budget;
}

// ─── State Helpers ──────────────────────────────────────────────────────────

function buildInitialState(budget: number): GameState {
  return {
    status: "idle",
    selectedIds: new Set(),
    budget,
    showOptimal: false,
  };
}

function toggleItem(
  state: GameState,
  itemId: number,
  items: InvestmentItem[]
): GameState {
  const next = new Set(state.selectedIds);
  if (next.has(itemId)) {
    next.delete(itemId);
  } else {
    next.add(itemId);
  }
  const { totalValue } = computeSelection(items, next);
  const { maxValue } = computeDP(items, state.budget);
  const won = totalValue === maxValue && next.size > 0;
  return {
    ...state,
    selectedIds: next,
    status: won ? "won" : next.size === 0 ? "idle" : "playing",
    showOptimal: won ? state.showOptimal : false,
  };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function KnapsackGameRenderer() {
  const [gameState, setGameState] = useState<GameState>(() =>
    buildInitialState(BUDGET_DEFAULT)
  );

  const stat = computeSelection(ITEMS, gameState.selectedIds);
  const dpResult = computeDP(ITEMS, gameState.budget);
  const greedyIds = computeGreedy(ITEMS, gameState.budget);

  const handleBudgetChange = useCallback((newBudget: number) => {
    setGameState(buildInitialState(newBudget));
  }, []);

  const handleToggleItem = useCallback(
    (itemId: number) => {
      if (!canSelect(ITEMS.find((i) => i.id === itemId)!, gameState.selectedIds, ITEMS, gameState.budget)) {
        return;
      }
      setGameState((s) => toggleItem(s, itemId, ITEMS));
    },
    [gameState.selectedIds]
  );

  const handleReset = useCallback(() => {
    setGameState(buildInitialState(gameState.budget));
  }, [gameState.budget]);

  const handleToggleShowOptimal = useCallback(() => {
    setGameState((s) => ({ ...s, showOptimal: !s.showOptimal }));
  }, []);

  const budgetPercent = Math.min(100, (stat.totalWeight / gameState.budget) * 100);
  const isBudgetTight = budgetPercent > 90 && gameState.status === "playing";

  return (
    <div className={styles.container}>
      <div className={styles.sliderRow}>
        <label className={styles.sliderLabel}>
          Budget Slider
        </label>
        <Slider
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={1}
          value={gameState.budget}
          onChange={handleBudgetChange}
          className={styles.slider}
          ariaLabel="Budget"
        />
        <span className={styles.budgetValue}>{gameState.budget} 百萬</span>
      </div>

      <div className={styles.panels}>
        <div className={styles.itemMarket}>
          <h4 className={styles.panelTitle}>項目市場</h4>
          <div className={styles.itemGrid}>
            {ITEMS.map((item) => {
              const selected = gameState.selectedIds.has(item.id);
              const selectable = canSelect(item, gameState.selectedIds, ITEMS, gameState.budget);
              const isOptimal = gameState.showOptimal && dpResult.selectedIds.includes(item.id);
              const vwRatio = (item.value / item.weight).toFixed(1);
              const fundsBarWidth = Math.min(100, (item.weight / gameState.budget) * 100);
              const rewardBarWidth = Math.min(100, (item.value / MAX_ITEM_VALUE) * 100);

              return (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  className={classNames(styles.itemCard, {
                    [styles.selected]: selected,
                    [styles.locked]: !selectable,
                    [styles.optimal]: isOptimal,
                  })}
                  onClick={() => selectable && handleToggleItem(item.id)}
                  disabled={!selectable}
                >
                  {selected && <span className={styles.badge}>✓</span>}
                  {isOptimal && <span className={styles.optimalBadge}>⭐</span>}
                  {!selectable && <span className={styles.lockBadge}>🔒</span>}
                  <span className={styles.itemEmoji}>{item.emoji}</span>
                  <span className={styles.itemName}>{item.name}</span>
                  <div className={styles.itemBars}>
                    <div className={styles.itemBarRow}>
                      <span className={styles.itemBarLabel}>💰 資金</span>
                      <div className={styles.itemBarTrack}>
                        <div
                          className={styles.itemBarFill}
                          style={{ width: `${fundsBarWidth}%` }}
                        />
                      </div>
                      <span className={styles.itemBarValue}>{item.weight} 百萬</span>
                    </div>
                    <div className={styles.itemBarRow}>
                      <span className={styles.itemBarLabel}>📈 報酬</span>
                      <div className={styles.itemBarTrack}>
                        <div
                          className={classNames(styles.itemBarFill, styles.rewardFill)}
                          style={{ width: `${rewardBarWidth}%` }}
                        />
                      </div>
                      <span className={styles.itemBarValue}>{item.value} 百萬</span>
                    </div>
                  </div>
                  <span className={styles.efficiencyBadge}>⚡ 效益 {vwRatio}x</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className={styles.portfolio}>
          <h4 className={styles.panelTitle}>我的投資組合</h4>
          <div
            className={classNames(styles.fundsBar, {
              [styles.idle]: gameState.status === "idle",
              [styles.playing]: gameState.status === "playing",
              [styles.tight]: isBudgetTight,
              [styles.won]: gameState.status === "won",
            })}
          >
            <div className={styles.fundsLabel}>
              已用資金 {stat.totalWeight}/{gameState.budget} 百萬
            </div>
            <div
              className={styles.fundsFill}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <div className={styles.currentValue}>
            當前總收益：{stat.totalValue} 百萬
          </div>

          <div className={styles.greedySection}>
            <div className={styles.greedyTitle}>[AI貪婪策略]</div>
            <div className={styles.greedyContent}>
              {ITEMS.filter((i) => greedyIds.includes(i.id))
                .map((i) => `${i.name}✓`)
                .join(" ")}{" "}
              → 收益
              {computeSelection(
                ITEMS,
                new Set(greedyIds)
              ).totalValue}
            </div>
          </div>

          <div className={styles.buttons}>
            <Button
              type="button"
              variant="ghost"
              className={styles.btn}
              onClick={handleToggleShowOptimal}
            >
              大師配置
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={styles.btn}
              onClick={handleReset}
            >
              重置
            </Button>
          </div>

          {gameState.status === "idle" && (
            <p className={styles.hint}>從左側選擇投資項目</p>
          )}
          {gameState.status === "playing" && !isBudgetTight && (
            <p className={styles.hint}>當前收益 {stat.totalValue} 百萬</p>
          )}
          {gameState.status === "playing" && isBudgetTight && (
            <p className={styles.hintTight}>資金緊張</p>
          )}
          {gameState.status === "won" && (
            <p className={styles.wonMessage}>
              ✨ 已達最優解！收益 {dpResult.maxValue} 百萬
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
