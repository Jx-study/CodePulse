import React, { useEffect, useState } from "react";
import Button from "@/shared/components/Button";
import Dialog from "@/shared/components/Dialog";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Textarea from "@/shared/components/Textarea";
import { toast } from "@/shared/components/Toast";
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
  disabled?: boolean;
  maxNodes?: number;
  hideLoadButton?: boolean;
}

export const DataRow: React.FC<DataRowProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  maxNodes,
  hideLoadButton = false,
}) => {
  const [bulkInput, setBulkInput] = useState("");
  const [randomCount, setRandomCount] = useState(
    DATA_LIMITS.DEFAULT_RANDOM_COUNT,
  );
  const [randomCountInput, setRandomCountInput] = useState(
    String(DATA_LIMITS.DEFAULT_RANDOM_COUNT),
  );

  return (
    <>
      {!hideLoadButton && (
        <>
          <Input
            type="text"
            placeholder="10,40,30..."
            value={bulkInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBulkInput(e.target.value)
            }
            className={`${styles.input} ${styles.bulkDataInput}`}
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
        </>
      )}
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
        <Tooltip content={maxNodes !== undefined ? `設定隨機生成的資料筆數，上限為 ${maxNodes}` : "設定隨機生成的資料筆數"}>
        <Input
          type="number"
          value={randomCountInput}
          min={DATA_LIMITS.MIN_RANDOM_COUNT}
          max={maxNodes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRandomCountInput(e.target.value)
          }
          onBlur={() => {
            const num = Number(randomCountInput);
            if (isNaN(num) || randomCountInput.trim() === "") {
              setRandomCountInput(String(randomCount));
            } else if (num < 0) {
              setRandomCountInput(String(randomCount));
            } else {
              if (maxNodes !== undefined && num > maxNodes) {
                toast.warning(`隨機筆數上限為 ${maxNodes}`);
              }
              const v = Math.min(
                Math.max(num, DATA_LIMITS.MIN_RANDOM_COUNT),
                maxNodes ?? num,
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
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Random count"
        />
        </Tooltip>
      </div>
    </>
  );
};

// ─── GraphLoaderModal：Graph 資料載入的 modal ────────────────

export type EdgeValidator = (parts: string[], count: number) => string | null;

const unweightedEdgeValidator: EdgeValidator = (parts, _count) => {
  if (parts.length !== 2) {
    return `格式錯誤：每條邊需包含來源、目標兩個數字 (格式: 來源 目標)\n錯誤行：${parts.join(" ")}`;
  }
  if (isNaN(parseInt(parts[0], 10)) || isNaN(parseInt(parts[1], 10))) {
    return `來源與目標必須是整數\n錯誤行：${parts.join(" ")}`;
  }
  return null;
};

const weightedEdgeValidator: EdgeValidator = (parts, _count) => {
  if (parts.length !== 3) {
    return `格式錯誤：每條邊需包含來源、目標、權重三個數字 (格式: 來源 目標 權重)\n錯誤行：${parts.join(" ")}`;
  }
  const w = parseInt(parts[2], 10);
  if (isNaN(w)) {
    return `權重必須是整數，「${parts[2]}」不是有效數字\n錯誤行：${parts.join(" ")}`;
  }
  if (w < 0) {
    return "不支援負權重邊，請輸入大於或等於 0 的權重！";
  }
  return null;
};

const UNWEIGHTED_DEFAULTS = {
  edgeLabel: "邊 (格式: 來源 目標)\n節點編號 (0 ~ N-1)",
  defaultEdgeInput: "0 1\n0 2\n1 3\n2 4\n3 5\n4 5",
  edgePlaceholder: "0 1\n1 2\n2 0",
};

const WEIGHTED_DEFAULTS = {
  edgeLabel: "邊 (格式: 來源 目標 權重)\n節點編號 (0 ~ N-1)",
  defaultEdgeInput: "0 1 4\n0 2 2\n1 2 5\n1 3 10\n2 4 3\n4 3 4\n5 2 6",
  edgePlaceholder: "0 1 4\n1 2 5\n2 0 10",
};

export interface GraphLoaderModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (data: string) => void;
  isWeighted?: boolean;
  edgeValidator?: EdgeValidator;
}

export const GraphLoaderModal: React.FC<GraphLoaderModalProps> = ({
  show,
  onClose,
  onLoad,
  isWeighted = false,
  edgeValidator,
}) => {
  const defaults = isWeighted ? WEIGHTED_DEFAULTS : UNWEIGHTED_DEFAULTS;
  const resolvedValidator = edgeValidator ?? (isWeighted ? weightedEdgeValidator : unweightedEdgeValidator);

  const [committedNodeCount, setCommittedNodeCount] = useState("6");
  const [committedEdgeInput, setCommittedEdgeInput] = useState(defaults.defaultEdgeInput);
  const [draftNodeCount, setDraftNodeCount] = useState("6");
  const [draftEdgeInput, setDraftEdgeInput] = useState(defaults.defaultEdgeInput);

  useEffect(() => {
    if (show) {
      setDraftNodeCount(committedNodeCount);
      setDraftEdgeInput(committedEdgeInput);
    }
  }, [show]);

  const handleLoad = () => {
    const count = parseInt(draftNodeCount);
    if (isNaN(count) || count <= 0) {
      toast.warning("請輸入有效的節點數量");
      return;
    }

    const lines = draftEdgeInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const invalidLines: string[] = [];
    for (const line of lines) {
      const parts = line.split(/\s+/);

      if (resolvedValidator) {
        const error = resolvedValidator(parts, count);
        if (error) {
          toast.warning(error);
          return;
        }
      }

      const u = parseInt(parts[0], 10);
      const v = parseInt(parts[1], 10);
      const isValidIdx = (n: number) => !isNaN(n) && n >= 0 && n < count;
      if (!isValidIdx(u) || !isValidIdx(v)) {
        invalidLines.push(line);
      }
    }

    if (invalidLines.length > 0) {
      toast.warning(
        `以下邊的節點編號超出範圍 (合法範圍：0 ~ ${count - 1})，請修正後再載入：\n${invalidLines.join(", ")}`,
      );
      return;
    }

    const edges = lines.map((line) => line.replace(/\s+/g, " ")).join(",");
    setCommittedNodeCount(draftNodeCount);
    setCommittedEdgeInput(draftEdgeInput);
    onLoad(`GRAPH:${count}:${edges}`);
    onClose();
  };

  return (
    <Dialog
      isOpen={show}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className={styles.loaderDialog}
      headerClassName={styles.loaderDialogHeader}
      contentClassName={styles.loaderDialogContent}
      footerClassName={styles.loaderDialogFooter}
      title="自定義 Graph 資料"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLoad} className={styles.modalConfirmButton}>
            確認載入
          </Button>
        </>
      }
    >
      <div className={styles.modalFieldRow}>
        <label className={styles.modalLabel}>節點數量 N:</label>
        <Input
          type="number"
          value={draftNodeCount}
          fullWidth={false}
          onChange={(e) => setDraftNodeCount(e.target.value)}
          className={`${styles.input} ${styles.nodeCountInput}`}
          aria-label="Node count"
        />
      </div>
      <div className={styles.modalFieldColumn}>
        <label className={styles.modalLabel}>
          {defaults.edgeLabel}
        </label>
        <Textarea
          value={draftEdgeInput}
          onChange={(e) => setDraftEdgeInput(e.target.value)}
          rows={6}
          className={styles.modalGraphTextarea}
          placeholder={defaults.edgePlaceholder}
        />
      </div>
    </Dialog>
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
  const DEFAULT_GRID = "0 0 0 0 0\n0 1 1 1 0\n0 0 0 0 0";
  const [committedGridText, setCommittedGridText] = useState(DEFAULT_GRID);
  const [draftGridText, setDraftGridText] = useState(DEFAULT_GRID);

  useEffect(() => {
    if (show) {
      setDraftGridText(committedGridText);
    }
  }, [show]);

  const handleLoad = () => {
    const trimmed = draftGridText.trim();
    if (trimmed === "") {
      toast.warning("請輸入迷宮資料");
      return;
    }

    const rowsArr = trimmed.split("\n").map((r) => r.trim()).filter((r) => r !== "");
    const parsedRows: number[][] = [];
    let firstRowCols = -1;

    for (let i = 0; i < rowsArr.length; i++) {
      const cells = rowsArr[i].split(/[\s,]+/);
      for (const cell of cells) {
        if (cell !== "0" && cell !== "1") {
          toast.warning(`第 ${i + 1} 行包含非法值「${cell}」，每格只能是 0（路）或 1（牆）`);
          return;
        }
      }
      const nums = cells.map(Number);
      if (firstRowCols === -1) {
        firstRowCols = nums.length;
      } else if (nums.length !== firstRowCols) {
        toast.warning(`第 ${i + 1} 行有 ${nums.length} 格，與第 1 行的 ${firstRowCols} 格不一致，每行欄數必須相同`);
        return;
      }
      parsedRows.push(nums);
    }

    const rows = parsedRows.length;
    const cols = firstRowCols;

    if (rows < 1 || cols < 1) {
      toast.warning("迷宮至少需要 1 行 1 欄");
      return;
    }

    if (rows * cols > 400) {
      toast.warning(`迷宮大小 ${rows}×${cols} = ${rows * cols} 格，超過上限 400 格（建議最大 20×20）`);
      return;
    }

    const gridData = parsedRows.flat();
    setCommittedGridText(draftGridText);
    onLoad(`GRID:${cols}:${gridData.join(",")}`);
    onClose();
  };

  return (
    <Dialog
      isOpen={show}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className={styles.loaderDialog}
      headerClassName={styles.loaderDialogHeader}
      contentClassName={styles.loaderDialogContent}
      footerClassName={styles.loaderDialogFooter}
      title="輸入迷宮資料 (0=路, 1=牆)"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLoad} className={styles.modalConfirmButton}>
            確認載入
          </Button>
        </>
      }
    >
      <Textarea
        value={draftGridText}
        onChange={(e) => setDraftGridText(e.target.value)}
        rows={5}
        className={styles.modalTextarea}
        placeholder={"0 0 0\n0 1 0\n0 0 0"}
      />
    </Dialog>
  );
};

// ─── KnapsackLoaderModal：背包問題資料載入的 modal ──────────────

export interface KnapsackLoaderModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (itemsStr: string) => void;
}

export const KnapsackLoaderModal: React.FC<KnapsackLoaderModalProps> = ({
  show,
  onClose,
  onLoad,
}) => {
  const DEFAULT_ITEMS = "1 15\n3 20\n4 30";
  const [committedItemInput, setCommittedItemInput] = useState(DEFAULT_ITEMS);
  const [draftItemInput, setDraftItemInput] = useState(DEFAULT_ITEMS);

  useEffect(() => {
    if (show) {
      setDraftItemInput(committedItemInput);
    }
  }, [show]);

  const handleLoad = () => {
    const lines = draftItemInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (
        parts.length < 2 ||
        isNaN(Number(parts[0])) ||
        isNaN(Number(parts[1]))
      ) {
        toast.warning("格式錯誤！請確保每行都有重量與價值 (例如: 3 20)");
        return;
      }
      if (Number(parts[0]) <= 0 || Number(parts[1]) <= 0) {
        toast.warning("重量與價值必須大於 0");
        return;
      }
    }

    const items = lines.map((line) => line.replace(/\s+/g, " ")).join(",");
    setCommittedItemInput(draftItemInput);
    onLoad(items);
    onClose();
  };

  return (
    <Dialog
      isOpen={show}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className={styles.loaderDialog}
      headerClassName={styles.loaderDialogHeader}
      contentClassName={styles.loaderDialogContent}
      footerClassName={styles.loaderDialogFooter}
      title="自定義背包物品"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLoad} className={styles.modalConfirmButton}>
            確認載入
          </Button>
        </>
      }
    >
      <div className={styles.modalFieldColumn}>
        <label className={styles.modalLabel}>
          物品清單 (格式: 重量 價值，一行一個物品)
        </label>
        <Textarea
          value={draftItemInput}
          onChange={(e) => setDraftItemInput(e.target.value)}
          rows={6}
          className={styles.modalGraphTextarea}
          placeholder={"1 15\n3 20\n4 30"}
        />
      </div>
    </Dialog>
  );
};

// Re-export styles 供各 ActionBar 使用
export { styles };
