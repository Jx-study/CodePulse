import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import { DATA_LIMITS } from "@/constants/dataLimits";
import styles from "./ActionBar.module.scss";

// ─── Layout 元件 ─────────────────────────────────────────────

export const ActionBarContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={styles.dataActionBarContainer}>{children}</div>;

export const ActionBarGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={styles.actionGroup}>{children}</div>;

export const StaticLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={styles.staticLabel}>{children}</div>;

// ─── DataRow：共用的第一行（載入/重設/隨機 + 隨機筆數） ──────

export interface DataRowProps {
  onLoadData: (data: string) => void;
  onResetData: () => void;
  onRandomData: (params?: any) => void;
  onMaxNodesChange?: (count: number) => void;
  onLimitExceeded?: () => void;
  disabled?: boolean;
}

export const DataRow: React.FC<DataRowProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
}) => {
  const [bulkInput, setBulkInput] = useState("");
  const [randomCount, setRandomCount] = useState(
    DATA_LIMITS.DEFAULT_RANDOM_COUNT
  );
  const [randomCountInput, setRandomCountInput] = useState(
    String(DATA_LIMITS.DEFAULT_RANDOM_COUNT)
  );

  return (
    <>
      <Input
        type="text"
        placeholder="10,40,30..."
        value={bulkInput}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setBulkInput(e.target.value)
        }
        className={styles.input}
        disabled={disabled}
        fullWidth={false}
        aria-label="Bulk data input"
      />
      <Tooltip content="輸入逗號分隔的數字，點擊載入">
        <Button
          size="sm"
          onClick={() => onLoadData(bulkInput)}
          disabled={disabled}
          icon="download"
        >
          載入資料
        </Button>
      </Tooltip>
      <Tooltip content="清除所有資料，恢復初始狀態">
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetData}
          disabled={disabled}
          icon="rotate-right"
        >
          重設
        </Button>
      </Tooltip>
      <Tooltip content="隨機生成一組資料">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onRandomData()}
          disabled={disabled}
          icon="shuffle"
        >
          隨機
        </Button>
      </Tooltip>

      <div className={styles.settingItem}>
        <label className={styles.smallLabel}>隨機筆數:</label>
        <Input
          type="number"
          value={randomCountInput}
          min={DATA_LIMITS.MIN_RANDOM_COUNT}
          max={DATA_LIMITS.MAX_NODES}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRandomCountInput(e.target.value)
          }
          onBlur={() => {
            const num = Number(randomCountInput);
            if (isNaN(num) || randomCountInput.trim() === "") {
              setRandomCountInput(String(randomCount));
            } else {
              if (num > DATA_LIMITS.MAX_NODES) {
                onLimitExceeded?.();
              }
              const v = Math.min(
                Math.max(num, DATA_LIMITS.MIN_RANDOM_COUNT),
                DATA_LIMITS.MAX_NODES
              );
              setRandomCount(v);
              setRandomCountInput(String(v));
              onMaxNodesChange?.(v);
            }
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          aria-label="Random count"
        />
      </div>
    </>
  );
};

// ─── GraphLoaderModal：Graph 資料載入的 modal ────────────────

export interface GraphLoaderModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (data: string) => void;
}

export const GraphLoaderModal: React.FC<GraphLoaderModalProps> = ({
  show,
  onClose,
  onLoad,
}) => {
  const [nodeCount, setNodeCount] = useState("6");
  const [edgeInput, setEdgeInput] = useState("0 1\n0 2\n1 3\n2 4\n3 5\n4 5");

  if (!show) return null;

  const handleLoad = () => {
    const count = parseInt(nodeCount);
    if (isNaN(count) || count <= 0) {
      alert("請輸入有效的節點數量");
      return;
    }
    const edges = edgeInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .join(",");
    onLoad(`GRAPH:${count}:${edges}`);
    onClose();
  };

  return (
    <>
      <div className={styles.modalContainer}>
        <h4 className={styles.modalTitle}>自定義 Graph 資料</h4>
        <div className={styles.modalFieldRow}>
          <label className={styles.modalLabel}>節點數量 (0 ~ N-1):</label>
          <input
            type="number"
            value={nodeCount}
            onChange={(e) => setNodeCount(e.target.value)}
            className={`${styles.input} ${styles.nodeCountInput}`}
          />
        </div>
        <div className={styles.modalFieldColumn}>
          <label className={styles.modalLabel}>邊 (格式: 來源 目標)</label>
          <textarea
            value={edgeInput}
            onChange={(e) => setEdgeInput(e.target.value)}
            rows={6}
            className={styles.modalGraphTextarea}
            placeholder={"0 1\n1 2\n2 0"}
          />
        </div>
        <div className={styles.modalButtonGroup}>
          <Button
            size="sm"
            onClick={onClose}
            className={styles.modalCancelButton}
          >
            取消
          </Button>
          <Button
            size="sm"
            onClick={handleLoad}
            className={styles.modalConfirmButton}
          >
            確認載入
          </Button>
        </div>
      </div>
      <div className={styles.modalOverlay} onClick={onClose} />
    </>
  );
};

// ─── GridLoaderModal：Grid 迷宮資料載入的 modal ──────────────

export interface GridLoaderModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (data: string) => void;
}

export const GridLoaderModal: React.FC<GridLoaderModalProps> = ({
  show,
  onClose,
  onLoad,
}) => {
  const [gridInputText, setGridInputText] = useState(
    "0 0 0 0 0\n0 1 1 1 0\n0 0 0 0 0"
  );

  if (!show) return null;

  const handleLoad = () => {
    const rowsArr = gridInputText.trim().split("\n");
    const gridData: number[] = [];
    let cols = 0;

    rowsArr.forEach((rowStr) => {
      const cells = rowStr
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (cells.length > 0) {
        gridData.push(...cells);
        cols = Math.max(cols, cells.length);
      }
    });

    onLoad(`GRID:${cols}:${gridData.join(",")}`);
    onClose();
  };

  return (
    <>
      <div className={styles.modalContainer}>
        <h4 className={styles.modalTitle}>輸入迷宮資料 (0=路, 1=牆)</h4>
        <textarea
          value={gridInputText}
          onChange={(e) => setGridInputText(e.target.value)}
          rows={5}
          className={styles.modalTextarea}
          placeholder={"0 0 0\n0 1 0\n0 0 0"}
        />
        <div className={styles.modalButtonGroup}>
          <Button
            size="sm"
            onClick={onClose}
            className={styles.modalCancelButton}
          >
            取消
          </Button>
          <Button
            size="sm"
            onClick={handleLoad}
            className={styles.modalConfirmButton}
          >
            確認載入
          </Button>
        </div>
      </div>
      <div className={styles.modalOverlay} onClick={onClose} />
    </>
  );
};

// Re-export styles 供各 ActionBar 使用
export { styles };
