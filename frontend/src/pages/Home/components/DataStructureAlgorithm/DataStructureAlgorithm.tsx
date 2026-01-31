import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DataStructureAlgorithm.module.scss";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Card from "@/shared/components/Card";
import { getHomePageLevels } from "@/services/LevelService";

// 動態導入所有 assets 資料夾中的圖片
// Vite 會在編譯時處理這個 glob 導入
const imageModules = import.meta.glob<{ default: string }>('./assets/*.png', { eager: true });

// 建立圖片映射表：檔名 -> 圖片路徑
export const algorithmImages: Record<string, string> = Object.keys(imageModules).reduce((acc, path) => {
  // 從路徑提取檔名，例如 './assets/bubble-sort.png' -> 'bubble-sort.png'
  const fileName = path.replace('./assets/', '');
  acc[fileName] = imageModules[path].default;
  return acc;
}, {} as Record<string, string>);

function DataStructureAlgorithm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get algorithms from centralized metadata
  const algorithms = useMemo(() => {
    return getHomePageLevels().map(meta => ({
      id: meta.id,
      levelId: meta.levelId,
      name: t(`algorithms.${meta.translationKey}.name`),
      description: t(`algorithms.${meta.translationKey}.description`),
      difficulty: meta.difficulty,
      category: meta.category,
      image: algorithmImages[meta.image],
    }));
  }, [t]);

  const cardsPerSlide = 4;
  const totalSlides = Math.ceil(algorithms.length / cardsPerSlide);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleDotClick = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const handleLearnMore = (levelId: string) => {
    // Navigate to LearningDashboard with levelId query parameter
    navigate(`/dashboard?levelId=${levelId}`);
  };

  const getCurrentSlideAlgorithms = () => {
    const startIndex = currentSlide * cardsPerSlide;
    const endIndex = startIndex + cardsPerSlide;
    return algorithms.slice(startIndex, endIndex);
  };

  const getCategoryVariant = (category: string): 'primary' | 'success' | 'warning' => {
    switch (category) {
      case "data-structures":
        return "primary";
      case "sorting":
        return "success";
      case "search":
        return "warning";
      case "graph":
        return "primary";
      default:
        return "primary";
    }
  };

  return (
    <section className={styles.dataStructureAlgorithm} id="algorithms">
      <div className="container">
        <h2 className="section-title">{t("algorithms_section.title")}</h2>

        <div className={styles.sliderContainer}>
          <div className={`${styles.algorithmGrid} common-grid`}>
            {getCurrentSlideAlgorithms().map((algorithm) => (
              <Card
                key={algorithm.id}
                variant="algorithm"
                image={algorithm.image}
                title={algorithm.name}
                description={algorithm.description}
                difficulty={algorithm.difficulty}
                category={{
                  label: t(`algorithms.categories.${algorithm.category}`),
                  variant: getCategoryVariant(algorithm.category)
                }}
                footer={
                  <Button
                    variant="primaryOutline"
                    size="sm"
                    onClick={() => handleLearnMore(algorithm.levelId)}
                    className={styles.learnMoreButton}
                  >
                    {t("algorithms_section.learn_more")}
                  </Button>
                }
                hoverable
              />
            ))}
          </div>

          <div className={styles.dotsContainer}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <Button
                key={index}
                variant="dot"
                size="md"
                className={index === currentSlide ? styles.active : ""}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DataStructureAlgorithm;
