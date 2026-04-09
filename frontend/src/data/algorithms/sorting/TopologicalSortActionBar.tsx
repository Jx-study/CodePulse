import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import {
  ActionBarContainer,
  ActionBarGroup,
  GraphLoaderModal,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";
import type { AlgoActionBarProps } from "@/types/implementation";

export const TopologicalSortActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  disabled = false,
  onRun,
}) => {
  const [showLoader, setShowLoader] = useState(false);

  return (
    <ActionBarContainer>
      <GraphLoaderModal
        show={showLoader}
        onClose={() => setShowLoader(false)}
        onLoad={onLoadData}
        isWeighted={false} // 拓撲排序不需要權重
      />

      <ActionBarGroup>
        <Tooltip content="自定義有向無環圖 (DAG)">
          <Button
            size="sm"
            onClick={() => setShowLoader(true)}
            disabled={disabled}
            icon="download"
          >
            載入資料
          </Button>
        </Tooltip>
        <Tooltip content="清除所有資料，恢復預設">
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
        <Tooltip content="隨機生成有向無環圖 (DAG)">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRandomData()}
            disabled={disabled}
            icon="shuffle"
          >
            隨機圖形
          </Button>
        </Tooltip>
      </ActionBarGroup>

      <ActionBarGroup>
        <Tooltip content="執行 Kahn's Algorithm (拓撲排序)">
          <Button
            size="sm"
            onClick={() => onRun()}
            disabled={disabled}
            className={`${styles.runButton} ${styles.runButtonSearching} ${styles.btnRun}`}
            icon="play"
            variant="secondary"
          >
            開始拓撲排序
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
