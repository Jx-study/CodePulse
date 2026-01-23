import React, { useState } from "react";
import Button from "../../../../shared/components/Button/Button";
import styles from "../DataActionBar/DataActionBar.module.scss";

interface AlgorithmActionBarProps {
  onLoadData: (data: string) => void;
  onRandomData: () => void;
  onResetData: () => void;
  onRun: () => void;
  disabled?: boolean;
}

export const AlgorithmActionBar: React.FC<AlgorithmActionBarProps> = ({
  onLoadData,
  onRandomData,
  onResetData,
  onRun,
  disabled = false,
}) => {
  const [bulkInput, setBulkInput] = useState<string>("");
  const [dataSize, setDataSize] = useState<number>(10);

  return (
    <div
      className={styles.dataActionBarContainer}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* 第一行：資料生成 */}
      <div className={styles.actionGroup}>
        <input
          type="text"
          placeholder="10,5,8,3..."
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
          Sorting Control
        </div>
        <Button
          size="sm"
          onClick={onRun}
          disabled={disabled}
          style={{ width: "100px", background: "#2e7d32" }}
        >
          開始排序
        </Button>
      </div>
    </div>
  );
};
