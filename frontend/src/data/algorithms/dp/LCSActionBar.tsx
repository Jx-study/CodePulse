import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import { DATA_LIMITS } from "@/constants/dataLimits";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

const DEFAULT_A = "ABCBDAB";
const DEFAULT_B = "BDCABA";
const RANDOM_ALPHABET = "ABCD";

const randomText = (length: number) =>
  Array.from(
    { length },
    () => RANDOM_ALPHABET[Math.floor(Math.random() * RANDOM_ALPHABET.length)],
  ).join("");

const normalize = (value: string) =>
  value.replace(/\s+/g, "").slice(0, DATA_LIMITS.MAX_LCS_LENGTH);

export const LCSActionBar: React.FC<AlgoActionBarProps> = ({
  onResetData,
  disabled = false,
  onRun,
}) => {
  const { t } = useTranslation("tutorials/lcs");
  const [textA, setTextA] = useState(DEFAULT_A);
  const [textB, setTextB] = useState(DEFAULT_B);

  const handleRun = () => {
    if (!textA || !textB) {
      toast.warning(t("ui.invalidInput"));
      return;
    }
    onRun({ type: "lcs", textA, textB });
  };

  const handleRandom = () => {
    const randomLength = () =>
      Math.floor(Math.random() * (DATA_LIMITS.MAX_LCS_LENGTH - 3)) + 4;
    const nextA = randomText(randomLength());
    const nextB = randomText(randomLength());
    setTextA(nextA);
    setTextB(nextB);
    onRun({ type: "lcs", textA: nextA, textB: nextB });
  };

  const handleReset = () => {
    setTextA(DEFAULT_A);
    setTextB(DEFAULT_B);
    onResetData();
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <Button size="sm" onClick={handleReset} disabled={disabled} icon="rotate-right">
          {t("ui.reset")}
        </Button>
        <Button size="sm" onClick={handleRandom} disabled={disabled} icon="shuffle">
          {t("ui.random")}
        </Button>
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{t("ui.controlLabel")}</StaticLabel>
        <Input
          placeholder={t("ui.placeholderA")}
          value={textA}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextA(normalize(e.target.value))
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          maxLength={DATA_LIMITS.MAX_LCS_LENGTH}
          aria-label={t("ui.ariaA")}
        />
        <Input
          placeholder={t("ui.placeholderB")}
          value={textB}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextB(normalize(e.target.value))
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          maxLength={DATA_LIMITS.MAX_LCS_LENGTH}
          aria-label={t("ui.ariaB")}
        />
        <Tooltip content={t("ui.runTooltip")}>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={disabled}
            className={styles.btnRun}
            icon="play"
            variant="secondary"
          >
            {t("ui.run")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
