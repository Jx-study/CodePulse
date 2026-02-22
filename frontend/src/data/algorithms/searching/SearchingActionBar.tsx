import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const SearchingActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onRun,
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleRun = () => {
    const val = parseInt(searchValue);
    if (!isNaN(val)) {
      onRun({ searchValue: val });
    } else {
      alert("請輸入有效的搜尋數值");
    }
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <DataRow
          onLoadData={onLoadData}
          onResetData={onResetData}
          onRandomData={onRandomData}
          onMaxNodesChange={onMaxNodesChange}
          onLimitExceeded={onLimitExceeded}
          disabled={disabled}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Searching Control</StaticLabel>
        <Input
          type="number"
          placeholder="搜尋值"
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          aria-label="Search value"
        />
        <Button
          size="sm"
          onClick={handleRun}
          disabled={disabled}
          className={`${styles.runButton} ${styles.runButtonSearching}`}
        >
          開始搜尋
        </Button>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
