import type { ChangeEvent } from "react";
import Button from "@/shared/components/Button";
import Checkbox from "@/shared/components/Checkbox/Checkbox";
import Icon from "@/shared/components/Icon";
import Select from "@/shared/components/Select/Select";
import Slider from "@/shared/components/Slider";
import { LAB_TOPICS, TOPIC_OPTIONS } from "../../data/labTopics";
import { ALGORITHM_META } from "../../data/algorithmMeta";
import { useLabContext } from "../../context/LabContext";
import type { AlgorithmId, TopicId } from "../../types/lab";
import styles from "./LabSidebar.module.scss";

export function LabSidebar() {
  const {
    activeTopic,
    selectedIds,
    inputSize,
    sidebarCollapsed,
    dispatch,
  } = useLabContext();

  const topic = activeTopic ? LAB_TOPICS[activeTopic] : null;
  const algoList = topic?.algorithms ?? [];

  const onTopicChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as TopicId;
    dispatch({ type: "SET_TOPIC", topic: v });
  };

  const toggleAlgo = (id: AlgorithmId) => {
    dispatch({ type: "TOGGLE_ALGORITHM", id });
  };

  return (
    <aside
      className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""}`}
      aria-label="實驗室設定"
    >
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? "展開側邊欄" : "收合側邊欄"}
        >
          <Icon name={sidebarCollapsed ? "chevron-right" : "chevron-left"} decorative />
        </Button>
        {!sidebarCollapsed && <span className={styles.brand}>Lab</span>}
      </div>

      {sidebarCollapsed ? (
        <div className={styles.iconRail}>
          <Icon name="bars" size="sm" color="secondary" />
          <div className={styles.dotList}>
            {selectedIds.map((id) => (
              <span
                key={id}
                className={styles.colorDot}
                style={{ background: ALGORITHM_META[id].color }}
                title={ALGORITHM_META[id].label}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lab-topic">
              主題
            </label>
            <Select
              id="lab-topic"
              name="lab-topic"
              fullWidth
              size="sm"
              value={activeTopic ?? ""}
              options={TOPIC_OPTIONS}
              onChange={onTopicChange}
              aria-label="選擇主題"
            />
          </div>
          <div className={styles.checklist}>
            <span className={styles.label}>演算法</span>
            <ul className={styles.list}>
              {algoList.map((id) => (
                <li key={id}>
                  <Checkbox
                    name={`algo-${id}`}
                    label={ALGORITHM_META[id].label}
                    checked={selectedIds.includes(id)}
                    onChange={() => toggleAlgo(id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.field}>
            <div className={styles.sizeRow}>
              <span className={styles.label}>資料量</span>
              <span className={styles.sizeValue}>{inputSize} 筆</span>
            </div>
            <Slider
              min={20}
              max={100}
              step={10}
              value={inputSize}
              onChange={(v) => dispatch({ type: "SET_INPUT_SIZE", size: v })}
              ariaLabel="資料量"
            />
          </div>
        </div>
      )}
    </aside>
  );
}
