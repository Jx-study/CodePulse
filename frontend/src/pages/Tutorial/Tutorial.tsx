import { useParams, Navigate } from "react-router-dom";
import { Breadcrumb } from "../../shared/components";
import type { BreadcrumbItem } from "../../shared/components/Breadcrumb/Breadcrumb";
import CodeEditor from "../../modules/core/components/CodeEditor/CodeEditor";
import AlgorithmInfo from "../../modules/learning/components/AlgorithmInfo/AlgorithmInfo";
import AnimationArea from "../../modules/learning/components/AnimationArea/AnimationArea";
import ControlBar from "../../modules/learning/components/ControlBar/ControlBar";
import VariableStatus from "../../modules/learning/components/VariableStatus/VariableStatus";
import { getTutorialData } from "../../config/tutorialConfig";
import styles from "./Tutorial.module.scss";

function Tutorial() {
  const { category, algorithm } = useParams<{
    category: string;
    algorithm: string;
  }>();

  // 從配置獲取教學數據
  const tutorialData = getTutorialData(category || "", algorithm || "");

  // 如果找不到對應的教學內容，重定向到 dashboard
  if (!tutorialData) {
    return <Navigate to="/dashboard" replace />;
  }

  // 生成面包屑數據
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: tutorialData.categoryName,
      path: `/dashboard?category=${category}`,
    },
    {
      label: tutorialData.name,
      path: null, // 當前頁面，不可點擊
    },
  ];

  return (
    <div className={styles.tutorialPage}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} showBackButton={true} />
      </div>

      {/* Main Content */}
      <div className={styles.contentContainer}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          <CodeEditor />
          {/* <AlgorithmInfo /> */}
        </div>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          <ControlBar />
          {/* <VariableStatus /> */}
          <AnimationArea />
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
