import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Checkbox from "@/shared/components/Checkbox/Checkbox";
import Icon from "@/shared/components/Icon";
import Select from "@/shared/components/Select/Select";
import Slider from "@/shared/components/Slider";
import { LAB_TOPICS } from "../../data/labTopics";
import { ALGORITHM_META } from "../../data/algorithmMeta";
import { useLabContext } from "../../context/LabContext";
import type { AlgorithmId, CaseType, TopicId } from "../../types/lab";
import styles from "./LabSidebar.module.scss";

const CASE_TYPE_ORDER: CaseType[] = ["random", "sorted", "reversed"];

export function LabSidebar() {
  const { t } = useTranslation("lab");
  const {
    activeTopic,
    selectedIds,
    inputSize,
    sidebarCollapsed,
    showComplexityChart,
    complexityChartMode,
    visibleCaseTypes,
    unifiedYAxis,
    manualSortEnabled,
    maxChartItems,
    dispatch,
  } = useLabContext();

  const topic = activeTopic ? LAB_TOPICS[activeTopic] : null;
  const algoList = topic?.algorithms ?? [];

  const topicOptions = Object.keys(LAB_TOPICS).map((id) => ({
    value: id as TopicId,
    label: t(`topics.${id}`),
  }));

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
      aria-label={t("sidebar.ariaLabel")}
    >
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
        >
          <Icon name={sidebarCollapsed ? "chevron-right" : "chevron-left"} decorative />
        </Button>
        {!sidebarCollapsed && <span className={styles.brand}>Lab</span>}
      </div>

      {sidebarCollapsed ? (
        <div className={styles.iconRail}>
          <Icon
            name={showComplexityChart ? "chart-line" : "play"}
            size="sm"
            color="secondary"
            decorative
            title={showComplexityChart ? t("sidebar.modeTitleComplexity") : t("sidebar.modeTitleAnimation")}
          />
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
              {t("sidebar.topic")}
            </label>
            <Select
              id="lab-topic"
              name="lab-topic"
              fullWidth
              size="sm"
              value={activeTopic ?? ""}
              options={topicOptions}
              onChange={onTopicChange}
              aria-label={t("sidebar.selectTopic")}
            />
          </div>
          <div className={styles.checklist}>
            <span className={styles.label}>{t("sidebar.algorithms")}</span>
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

          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.modeTab} ${!showComplexityChart ? styles.modeTabActive : ""}`}
              onClick={() =>
                showComplexityChart && dispatch({ type: "TOGGLE_COMPLEXITY_CHART" })}
            >
              {t("sidebar.modeAnimation")}
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${showComplexityChart ? styles.modeTabActive : ""}`}
              onClick={() =>
                !showComplexityChart && dispatch({ type: "TOGGLE_COMPLEXITY_CHART" })}
            >
              {t("sidebar.modeComplexity")}
            </button>
          </div>

          {!showComplexityChart ? (
            <div className={styles.field}>
              <Checkbox
                name="manual-sort"
                label={t("sidebar.manualSort")}
                checked={manualSortEnabled}
                onChange={() => dispatch({ type: "TOGGLE_MANUAL_SORT" })}
              />
              <div className={styles.sizeRow}>
                <span className={styles.label}>{t("sidebar.dataSize")}</span>
                <span className={styles.sizeValue}>
                  {inputSize}{t("sidebar.dataSizeUnit")}{manualSortEnabled ? t("sidebar.dataSizeLocked") : ""}
                </span>
              </div>
              <Slider
                min={20}
                max={Math.min(100, maxChartItems)}
                step={10}
                value={inputSize}
                disabled={manualSortEnabled}
                onChange={(v) => dispatch({ type: "SET_INPUT_SIZE", size: v })}
                ariaLabel={t("sidebar.dataSize")}
              />
            </div>
          ) : (
            <div className={styles.complexityControls}>
              <div className={styles.subTabs}>
                <button
                  type="button"
                  className={`${styles.subTab} ${complexityChartMode === "curve" ? styles.subTabActive : ""}`}
                  onClick={() =>
                    dispatch({ type: "SET_COMPLEXITY_CHART_MODE", mode: "curve" })}
                >
                  {t("sidebar.timeComplexity")}
                </button>
                <button
                  type="button"
                  className={`${styles.subTab} ${complexityChartMode === "space" ? styles.subTabActive : ""}`}
                  onClick={() =>
                    dispatch({ type: "SET_COMPLEXITY_CHART_MODE", mode: "space" })}
                >
                  {t("sidebar.spaceComplexity")}
                </button>
              </div>

              {complexityChartMode === "curve" && (
                <div className={styles.caseFilter}>
                  <span className={styles.label}>{t("sidebar.showCases")}</span>
                  {CASE_TYPE_ORDER.map((ct) => {
                    const isOnly =
                      visibleCaseTypes.length === 1 && visibleCaseTypes[0] === ct;
                    return (
                      <Checkbox
                        key={ct}
                        name={`case-${ct}`}
                        label={t(`cases.${ct}`)}
                        checked={visibleCaseTypes.includes(ct)}
                        disabled={isOnly}
                        onChange={() =>
                          dispatch({ type: "TOGGLE_CASE_TYPE", caseType: ct })}
                      />
                    );
                  })}
                  <Button
                    variant={unifiedYAxis ? "primary" : "secondary"}
                    size="sm"
                    fullWidth
                    onClick={() => dispatch({ type: "TOGGLE_UNIFIED_Y_AXIS" })}
                    aria-pressed={unifiedYAxis}
                  >
                    <Icon name="lock" decorative />
                    {t("sidebar.unifyYAxis")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => dispatch({ type: "RESET_BENCHMARK" })}
                  >
                    <Icon name="rotate" decorative />
                    {t("sidebar.reset")}
                  </Button>
                </div>
              )}

              {complexityChartMode === "space" && (
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() =>
                    dispatch({
                      type: "SET_INPUT_DATA",
                      data: Array.from({ length: inputSize }, () =>
                        Math.floor(Math.random() * 990) + 10,
                      ),
                    })
                  }
                >
                  <Icon name="rotate" decorative />
                  {t("sidebar.reset")}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
