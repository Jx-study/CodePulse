import React, { useState } from "react";
import Button from "../../../../shared/components/Button/Button";
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

  const isSearching = category === "searching";
  const isPrefixSum = algorithmId === "prefixsum";

  const handleRun = () => {
    if (isSearching) {
      const val = parseInt(searchValue);
      if (!isNaN(val)) {
        onRun({ searchValue: val });
      } else {
        alert("請輸入有效的搜尋數值");
      }
    } else if (isPrefixSum) {
      // 處理區間查詢
      const start = parseInt(rangeStart);
      const end = parseInt(rangeEnd);

      // 如果沒輸入，就跑預設演示
      if (isNaN(start) && isNaN(end)) {
        onRun({}); // 空物件代表建構
      } else if (!isNaN(start) && !isNaN(end)) {
        onRun({ range: [start, end] });
      } else {
        alert("請輸入完整的區間 (Start, End)");
      }
    } else {
      onRun();
    }
  };

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
          <label style={{ color: "#ccc", fontSize: "12px" }}>筆數:</label>
          <input
            type="number"
            value={dataSize}
            onChange={(e) => setDataSize(Number(e.target.value))}
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
          {isSearching
            ? "Searching Control"
            : category === "technique"
            ? "Technique Control"
            : "Sorting Control"}
        </div>

        {isSearching && (
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

        {isPrefixSum && (
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
          style={{ width: "100px", background: "#2e7d32" }}
        >
          {isSearching
            ? "開始搜尋"
            : category === "technique"
            ? "開始演示"
            : "開始排序"}
        </Button>
      </div>
    </div>
  );
};
