import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllLevels } from "@/services/LevelService";
import type { StructureType } from "@/types";
import styles from "./DSDiagram.module.scss";

const GROUPS: { type: StructureType; titleKey: string; color: string }[] = [
  { type: "linear", titleKey: "visuals.dsDiagram.linear", color: "#3b82f6" },
  { type: "non-linear", titleKey: "visuals.dsDiagram.nonLinear", color: "#10b981" },
];

const levelNameKey = (id: string) => `levels.${id.replace(/-/g, "_")}.name`;

export default function DSDiagram() {
  const { t } = useTranslation("lessons");
  const { t: tDashboard } = useTranslation("dashboard");
  const navigate = useNavigate();

  // 資料來自關卡資料（levels.json），新增資料結構關卡時圖會自動更新
  const levels = getAllLevels().filter((level) => level.category === "data-structures");

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.root}>{t("visuals.dsDiagram.root")}</h3>
      <div className={styles.groups}>
        {GROUPS.map(({ type, titleKey, color }) => (
          <section key={type} className={styles.group} style={{ borderTopColor: color }}>
            <h4 className={styles.groupTitle} style={{ color }}>
              {t(titleKey)}
            </h4>
            <ul className={styles.items}>
              {levels
                .filter((level) => level.structureType === type)
                .map((level) => (
                  <li key={level.id}>
                    <button
                      type="button"
                      className={styles.item}
                      onClick={() => navigate(`/tutorial/${level.category}/${level.id}`)}
                    >
                      {tDashboard(levelNameKey(level.id))}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
