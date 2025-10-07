import React, { useState, useEffect } from 'react';
import styles from './DataStructureAlgorithm.module.scss';
import { useTranslation } from 'react-i18next';

// Import images
import bubbleSortImg from './assets/bubble-sort.png';
import quickSortImg from './assets/quick-sort.png';
import mergeSortImg from './assets/merge-sort.png';
import binarySearchImg from './assets/binary-search.png';
import linearSearchImg from './assets/linear-search.png';
import dfsImg from './assets/dfs.png';
import bfsImg from './assets/bfs.png';
import dijkstraImg from './assets/dijkstra.png';

function DataStructureAlgorithm() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const algorithms = [
    {
      id: 1,
      name: t('algorithms.bubble_sort.name'),
      description: t('algorithms.bubble_sort.description'),
      difficulty: 2,
      category: 'sorting',
      image: bubbleSortImg
    },
    {
      id: 2,
      name: t('algorithms.quick_sort.name'),
      description: t('algorithms.quick_sort.description'),
      difficulty: 4,
      category: 'sorting',
      image: quickSortImg
    },
    {
      id: 3,
      name: t('algorithms.merge_sort.name'),
      description: t('algorithms.merge_sort.description'),
      difficulty: 4,
      category: 'sorting',
      image: mergeSortImg
    },
    {
      id: 4,
      name: t('algorithms.binary_search.name'),
      description: t('algorithms.binary_search.description'),
      difficulty: 3,
      category: 'search',
      image: binarySearchImg
    },
    {
      id: 5,
      name: t('algorithms.linear_search.name'),
      description: t('algorithms.linear_search.description'),
      difficulty: 1,
      category: 'search',
      image: linearSearchImg
    },
    {
      id: 6,
      name: t('algorithms.dfs.name'),
      description: t('algorithms.dfs.description'),
      difficulty: 4,
      category: 'graph',
      image: dfsImg
    },
    {
      id: 7,
      name: t('algorithms.bfs.name'),
      description: t('algorithms.bfs.description'),
      difficulty: 3,
      category: 'graph',
      image: bfsImg
    },
    {
      id: 8,
      name: t('algorithms.dijkstra.name'),
      description: t('algorithms.dijkstra.description'),
      difficulty: 5,
      category: 'graph',
      image: dijkstraImg
    }
  ];

  const cardsPerSlide = 4;
  const totalSlides = Math.ceil(algorithms.length / cardsPerSlide);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 10000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleDotClick = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const getCurrentSlideAlgorithms = () => {
    const startIndex = currentSlide * cardsPerSlide;
    const endIndex = startIndex + cardsPerSlide;
    return algorithms.slice(startIndex, endIndex);
  };

  // 渲染星星难度
  const renderStars = (difficulty) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`${styles.star} ${i <= difficulty ? styles.filled : ''}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'sorting':
        return styles.sorting;
      case 'search':
        return styles.search;
      case 'graph':
        return styles.graph;
      default:
        return '';
    }
  };

  return (
    <section className={styles.dataStructureAlgorithm} id="algorithms">
      <div className="container">
        <h2 className="section-title">{t('algorithms_section.title')}</h2>
        
        <div className={styles.sliderContainer}>
          <div className={styles.algorithmGrid}>
            {getCurrentSlideAlgorithms().map((algorithm) => (
              <div 
                key={algorithm.id} 
                className={`common-card ${getCategoryColor(algorithm.category)}`}
              >
                <div className="algorithmImage">
                  <img src={algorithm.image} alt={algorithm.name} />
                </div>
                <div className={styles.cardHeader}>
                  <h3>{algorithm.name}</h3>
                  <div className={styles.difficulty}>
                    {renderStars(algorithm.difficulty)}
                  </div>
                </div>
                <p className={styles.description}>{algorithm.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.category}>{t(`algorithms.categories.${algorithm.category}`)}</span>
                  <button className={styles.learnMore}>
                    {t('algorithms_section.learn_more')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.dotsContainer}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
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