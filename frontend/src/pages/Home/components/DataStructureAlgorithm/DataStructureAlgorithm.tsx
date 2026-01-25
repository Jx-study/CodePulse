import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DataStructureAlgorithm.module.scss";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Card from "@/shared/components/Card";
import { getHomePageAlgorithms } from "@/data/levels/levelAdapter";

// Import all algorithm images dynamically
import bubbleSortImg from "./assets/bubble-sort.png";
import quickSortImg from "./assets/quick-sort.png";
import selectionsortImg from "./assets/merge-sort.png";
import binarySearchImg from "./assets/binary-search.png";
import linearSearchImg from "./assets/linear-search.png";
import dfsImg from "./assets/dfs.png";
import bfsImg from "./assets/bfs.png";
import dijkstraImg from "./assets/dijkstra.png";
import linkedListImg from "./assets/linked-list.png";
import stackImg from "./assets/stack.png";
import queueImg from "./assets/queue.png";

export const algorithmImages: Record<string, string> = {
  "bubble-sort.png": bubbleSortImg,
  "quick-sort.png": quickSortImg,
  "merge-sort.png": mergeSortImg,
  "binary-search.png": binarySearchImg,
  "linear-search.png": linearSearchImg,
  "dfs.png": dfsImg,
  "bfs.png": bfsImg,
  "dijkstra.png": dijkstraImg,
  "linked-list.png": linkedListImg,
  "stack.png": stackImg,
  "queue.png": queueImg,
};

function DataStructureAlgorithm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get algorithms from centralized metadata
  const algorithms = useMemo(() => {
    return getHomePageAlgorithms().map(meta => ({
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
