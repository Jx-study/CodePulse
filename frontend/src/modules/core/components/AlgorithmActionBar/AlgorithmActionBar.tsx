import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button";
import FormField from "@/shared/components/FormField";
import styles from "../DataActionBar/DataActionBar.module.scss";

interface AlgorithmActionBarProps {
  onLoadData: (data: string) => void;
  onRandomData: () => void;
  onResetData: () => void;
  onRun: (params?: { searchValue?: number; range?: [number, number] }) => void;
  disabled?: boolean;
  category?: string;
  algorithmId?: string;
}

export const AlgorithmActionBar: React.FC<AlgorithmActionBarProps> = ({
  onLoadData,
  onRandomData,
  onResetData,
  onRun,
  disabled = false,
  category = "sorting",
  algorithmId,
}) => {
  const [bulkInput, setBulkInput] = useState<string>("");
  const [dataSize, setDataSize] = useState<number>(10);
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
    if (isSorting) {
      setDataSize(10);
    } else if (isSearching && !isPrefixSum) {
      setDataSize(15);
    } else if (isPrefixSum) {
      setDataSize(8);
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
    <div className={styles.dataActionBarContainer}>
      {/* 第一行：資料生成 */}
      <div className={styles.actionGroup}>
        <FormField
          type="text"
          placeholder="3,5,8,10..."
          value={bulkInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkInput(e.target.value)}
          inputClassName={styles.input}
          className={styles.formFieldWrapper}
          disabled={disabled}
          aria-label="Bulk data input"
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
          <label className={styles.staticLabel}>筆數:</label>
          <FormField
            type="number"
            value={dataSize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataSize(Number(e.target.value))}
            inputClassName={styles.input}
            className={styles.formFieldWrapper}
            disabled={disabled}
            aria-label="Data size"
          />
        </div>
        <Button size="sm" onClick={() => onRandomData()} disabled={disabled}>
          隨機
        </Button>
      </div>

      {/* 第二行：執行控制 */}
      <div className={styles.actionGroup}>
        <div className={styles.staticLabel}>
          {getControlLabel()}
        </div>

        {/* 搜尋演算法的搜尋值輸入 */}
        {showSearchInput && (
          <FormField
            type="number"
            placeholder="搜尋值"
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
            inputClassName={styles.input}
            className={styles.formFieldWrapper}
            disabled={disabled}
            aria-label="Search value"
          />
        )}

        {/* Prefix Sum 的區間輸入 */}
        {showRangeInput && (
          <div className={styles.rangeInput}>
            <FormField
              type="number"
              placeholder="L"
              value={rangeStart}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRangeStart(e.target.value)}
              inputClassName={styles.input}
              className={styles.formFieldWrapper}
              disabled={disabled}
              aria-label="Range start"
            />
            <span className={styles.staticLabel}>-</span>
            <FormField
              type="number"
              placeholder="R"
              value={rangeEnd}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRangeEnd(e.target.value)}
              inputClassName={styles.input}
              className={styles.formFieldWrapper}
              disabled={disabled}
              aria-label="Range end"
            />
          </div>
        )}

        <Button
          size="sm"
          onClick={handleRun}
          disabled={disabled}
          style={{
            minWidth: "6.25rem", // 100px
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
