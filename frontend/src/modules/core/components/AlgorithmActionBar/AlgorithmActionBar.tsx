import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button/Button";
import { DATA_LIMITS } from "@/constants/dataLimits";
import styles from "../DataActionBar/DataActionBar.module.scss";

interface AlgorithmActionBarProps {
  onLoadData: (data: string) => void;
  onRandomData: () => void;
  onResetData: () => void;
  onRun: (params?: { searchValue?: number; range?: [number, number] }) => void;
  onRandomCountChange?: (count: number) => void;
  onLimitExceeded?: () => void;
  disabled?: boolean;
  category?: string;
  algorithmId?: string;
}

export const AlgorithmActionBar: React.FC<AlgorithmActionBarProps> = ({
  onLoadData,
  onRandomData,
  onResetData,
  onRun,
  onRandomCountChange,
  onLimitExceeded,
  disabled = false,
  category = "sorting",
  algorithmId,
}) => {
  const [bulkInput, setBulkInput] = useState<string>("");
  const [randomCount, setRandomCount] = useState<number>(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
  const [randomCountInput, setRandomCountInput] = useState<string>(String(DATA_LIMITS.DEFAULT_RANDOM_COUNT));
  const [searchValue, setSearchValue] = useState<string>("");
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");

  // 判斷演算法類型
  const isSearching = category === "searching";
  const isSorting = category === "sorting";
  const isTechnique = category === "technique";
  const isPrefixSum = algorithmId === "prefixsum";

  // 根據演算法類型設定預設資料筆數
  useEffect(() => {
    // TODO: check
    if (isSorting) {
      setRandomCount(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
    } else if (isSearching && !isPrefixSum) {
      setRandomCount(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
    } else if (isPrefixSum) {
      setRandomCount(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
    }
  }, [category, algorithmId, isSorting, isSearching, isPrefixSum]);

  const handleRun = () => {
    if (isSearching && !isPrefixSum) {
      const val = parseInt(searchValue);
      if (!isNaN(val)) {
        onRun({ searchValue: val });
      } else {
        alert("請輸入有效的搜尋數值");
      }
    } else if (isPrefixSum) {
      const start = parseInt(rangeStart);
      const end = parseInt(rangeEnd);

      if (isNaN(start) && isNaN(end)) {
        onRun({});
      } else if (!isNaN(start) && !isNaN(end)) {
        onRun({ range: [start, end] });
      } else {
        alert("請輸入完整的區間 (Start, End)");
      }
    } else {
      onRun();
    }
  };

  // 根據演算法類型動態生成控制區域標籤
  const getControlLabel = () => {
    if (isSorting) return "Sorting Control";
    if (isSearching && !isPrefixSum) return "Searching Control";
    if (isPrefixSum) return "Prefix Sum Control";
    if (isTechnique) return "Technique Control";
    return "Algorithm Control";
  };

  // 根據演算法類型動態生成按鈕文字
  const getRunButtonText = () => {
    if (isSorting) return "開始排序";
    if (isSearching && !isPrefixSum) return "開始搜尋";
    if (isPrefixSum) return "開始演示";
    if (isTechnique) return "開始演示";
    return "開始執行";
  };

  // 判斷是否顯示特定輸入欄位
  const showSearchInput = isSearching && !isPrefixSum;
  const showRangeInput = isPrefixSum;

  return (
    <div
      className={styles.dataActionBarContainer}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* 第一行：資料生成 */}
      <div className={styles.actionGroup}>
        <input
          type="text"
          placeholder="3,5,8,10..."
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          className={styles.input}
          style={{ width: "150px" }}
          disabled={disabled}
        />
        <Button
          size="sm"
          onClick={() => onLoadData(bulkInput)}
          disabled={disabled}
        >
          載入資料
        </Button>
        <Button size="sm" onClick={onResetData} disabled={disabled}>
          重設
        </Button>

        <div className={styles.settingItem}>
          <label style={{ color: "#ccc", fontSize: "12px" }}>隨機筆數:</label>
          <input
            type="number"
            value={randomCountInput}
            min={DATA_LIMITS.MIN_RANDOM_COUNT}
            max={DATA_LIMITS.MAX_NODES}
            onChange={(e) => setRandomCountInput(e.target.value)}
            onBlur={() => {
              const num = Number(randomCountInput);
              if (isNaN(num) || randomCountInput.trim() === "") {
                setRandomCountInput(String(randomCount));
              } else {
                // 超過上限時顯示提示
                if (num > DATA_LIMITS.MAX_NODES) {
                  onLimitExceeded?.();
                }
                const v = Math.min(Math.max(num, DATA_LIMITS.MIN_RANDOM_COUNT), DATA_LIMITS.MAX_NODES);
                setRandomCount(v);
                setRandomCountInput(String(v));
                onRandomCountChange?.(v);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            style={{
              width: "50px",
              background: "#222",
              color: "#fff",
              border: "1px solid #555",
            }}
            disabled={disabled}
          />
        </div>
        <Button size="sm" onClick={() => onRandomData()} disabled={disabled}>
          隨機
        </Button>
      </div>

      {/* 第二行：執行控制 */}
      <div className={styles.actionGroup}>
        <div
          className={styles.staticLabel}
          style={{ color: "#ccc", padding: "0 8px" }}
        >
          {getControlLabel()}
        </div>

        {/* 搜尋演算法的搜尋值輸入 */}
        {showSearchInput && (
          <input
            type="number"
            placeholder="搜尋值"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={styles.input}
            style={{ width: "80px", marginRight: "8px" }}
            disabled={disabled}
          />
        )}

        {/* Prefix Sum 的區間輸入 */}
        {showRangeInput && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
              marginRight: "8px",
            }}
          >
            <input
              type="number"
              placeholder="L"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className={styles.input}
              style={{ width: "50px" }}
              disabled={disabled}
            />
            <span style={{ color: "#ccc" }}>-</span>
            <input
              type="number"
              placeholder="R"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className={styles.input}
              style={{ width: "50px" }}
              disabled={disabled}
            />
          </div>
        )}

        <Button
          size="sm"
          onClick={handleRun}
          disabled={disabled}
          style={{
            width: "100px",
            background: isSorting
              ? "#2e7d32"
              : isSearching
              ? "#1976d2"
              : "#f57c00",
          }}
        >
          {getRunButtonText()}
        </Button>
      </div>
    </div>
  );
};
