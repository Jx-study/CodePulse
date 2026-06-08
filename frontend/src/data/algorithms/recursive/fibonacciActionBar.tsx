import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const FibonacciActionBar: React.FC<AlgoActionBarProps> = ({
  disabled = false,
  onRun,
}) => {
  const { t } = useTranslation("tutorials/fibonacci-recursive");
  const [nValue, setNValue] = useState("4");

  const handleRun = () => {
    if (disabled || !onRun) return;
    const n = parseInt(nValue, 10);
    // fib(6) 有 25 個節點
    if (!isNaN(n) && n >= 1 && n <= 6) {
      onRun({ type: "fibonacciRecursive", n });
    } else {
      toast.warning(t("ui.validation"));
    }
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <StaticLabel>{t("ui.label")}</StaticLabel>
        <Input
          type="number"
          placeholder={t("ui.placeholder")}
          value={nValue}
          min={1}
          max={6}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNValue(e.target.value)
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label={t("ui.ariaLabel")}
        />
        <Button
          size="sm"
          variant="primary"
          onClick={handleRun}
          disabled={disabled}
          icon="play"
        >
          {t("ui.button")}
        </Button>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
