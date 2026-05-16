import { useState, useEffect } from "react";
import Dialog from "@/shared/components/Dialog";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";
import type { PlaygroundHistoryRecord } from "@/types/playgroundHistory";
import { listHistory, deleteHistory } from "@/services/playgroundHistoryService";
import styles from "./PlaygroundHistoryDialog.module.scss";

interface PlaygroundHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReplay: (record: PlaygroundHistoryRecord) => void;
  quotaRecords?: PlaygroundHistoryRecord[] | null;
  onQuotaResolved?: (decision: "proceed" | "skip") => void;
}

export function PlaygroundHistoryDialog({
  isOpen,
  onClose,
  onReplay,
  quotaRecords,
  onQuotaResolved,
}: PlaygroundHistoryDialogProps) {
  const [records, setRecords] = useState<PlaygroundHistoryRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isQuotaMode = !!quotaRecords;
  const displayRecords = isQuotaMode ? quotaRecords! : records;
  const selectedRecord = displayRecords.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    if (!isOpen || isQuotaMode) return;
    listHistory().then(setRecords).catch(() => {});
  }, [isOpen, isQuotaMode]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setRemoveTargetId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (quotaRecords && quotaRecords.length > 0) {
      setRemoveTargetId(quotaRecords[0].id);
    }
  }, [quotaRecords]);

  async function handleDelete(id: number) {
    setIsDeleting(true);
    try {
      await deleteHistory(id);
      if (isQuotaMode) {
        onQuotaResolved?.("proceed");
        onClose();
      } else {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (selectedId === id) setSelectedId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function handleReplay() {
    if (!selectedRecord) return;
    onReplay(selectedRecord);
    onClose();
  }

  if (isQuotaMode) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        title={
          <div className={styles.quotaTitle}>
            <Icon name="triangle-exclamation" />
            History Full
          </div>
        }
        footer={
          <div className={styles.quotaFooter}>
            <Button
              variant="ghost"
              onClick={() => {
                onQuotaResolved?.("skip");
                onClose();
              }}
            >
              Don't Save This Run
            </Button>
            <Button
              variant="danger"
              disabled={removeTargetId === null || isDeleting}
              onClick={() => removeTargetId !== null && handleDelete(removeTargetId)}
            >
              Remove Selected &amp; Save
            </Button>
          </div>
        }
      >
        <div className={styles.quotaBody}>
          <p className={styles.quotaDesc}>
            You've reached the <strong>5-record limit</strong>. Remove one existing record to save
            this run, or continue without saving.
          </p>
          <div className={styles.quotaList}>
            {displayRecords.map((r) => (
              <button
                key={r.id}
                className={`${styles.quotaItem} ${removeTargetId === r.id ? styles.quotaItemSelected : ""}`}
                onClick={() => setRemoveTargetId(r.id)}
              >
                <div className={styles.quotaRadio}>
                  {removeTargetId === r.id && <div className={styles.quotaRadioDot} />}
                </div>
                <div className={styles.quotaItemInfo}>
                  <div className={styles.quotaItemTop}>
                    {r.detected_algorithm && (
                      <span className={styles.algoBadge}>
                        {r.detected_algorithm.replace(/_/g, " ")}
                      </span>
                    )}
                    {r.time_complexity && (
                      <span className={styles.complexityTag}>{r.time_complexity}</span>
                    )}
                  </div>
                  <div className={styles.quotaItemCode}>{r.code_preview}</div>
                  <div className={styles.quotaItemDate}>{formatDate(r.created_at)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className={styles.dialogTitle}>
          <Icon name="clock-rotate-left" />
          Execution History
          <span className={styles.quotaHint}>{records.length} / 5</span>
        </div>
      }
    >
      <div className={styles.historyBody}>
        {/* Left: list */}
        <div className={styles.historyList}>
          {records.length === 0 && (
            <div className={styles.emptyList}>No saved runs yet</div>
          )}
          {records.map((r) => (
            <div
              key={r.id}
              className={`${styles.historyItem} ${selectedId === r.id ? styles.historyItemSelected : ""}`}
              onClick={() => setSelectedId(r.id)}
            >
              <div className={styles.historyItemTop}>
                {r.detected_algorithm ? (
                  <span className={styles.algoBadge}>
                    {r.detected_algorithm.replace(/_/g, " ")}
                  </span>
                ) : (
                  <span className={`${styles.algoBadge} ${styles.algoBadgeNone}`}>Unknown</span>
                )}
                <div className={styles.historyItemActions}>
                  {r.time_complexity && (
                    <span className={styles.complexityTag}>{r.time_complexity}</span>
                  )}
                  <Button
                    variant="unstyled"
                    iconOnly
                    icon="trash"
                    className={styles.deleteBtn}
                    title="Delete"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDelete(r.id);
                    }}
                  />
                </div>
              </div>
              <div className={styles.historyItemCode}>{r.code_preview}</div>
              <div className={styles.historyItemDate}>{formatDate(r.created_at)}</div>
            </div>
          ))}
        </div>

        {/* Right: preview */}
        <div className={styles.previewPane}>
          {selectedRecord ? (
            <>
              <div className={styles.previewHeader}>
                {selectedRecord.detected_algorithm && (
                  <span className={styles.algoBadge}>
                    {selectedRecord.detected_algorithm.replace(/_/g, " ")}
                  </span>
                )}
                {selectedRecord.time_complexity && (
                  <span className={styles.complexityTag}>{selectedRecord.time_complexity}</span>
                )}
                {selectedRecord.analysis_source && (
                  <span className={styles.sourceTag}>{selectedRecord.analysis_source}</span>
                )}
              </div>
              <div className={styles.previewCode}>
                <pre className={styles.codeBlock}>{selectedRecord.user_code}</pre>
              </div>
              <div className={styles.previewFooter}>
                <span className={styles.previewDate}>{formatDate(selectedRecord.created_at)}</span>
                <div className={styles.previewActions}>
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button variant="primary" onClick={handleReplay}>
                    {selectedRecord.execution_trace?.length ? "Replay" : "Load into Editor"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyPreview}>
              <Icon name="arrow-left" />
              <p>Select a record to preview</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default PlaygroundHistoryDialog;
