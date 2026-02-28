import type React from "react";
import styles from "./CategoryFilter.module.scss";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";
import type { Category, CategoryType } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className={styles.categoryFilter}>
      {categories.map((category) => {
        const isActive = activeCategory === category.id;

        return (
          <div key={category.id}>
            <Button
              variant="ghost"
              className={`${styles.categoryButton} ${
                isActive ? styles.active : ""
              }`}
              onClick={() => onCategoryChange(category.id)}
              aria-label={category.name}
              style={isActive ? ({ "--category-color": category.colorTheme } as unknown as React.CSSProperties) : undefined}
            >
              {/* 圖示 */}
              {category.icon && (
                <Icon
                  name={category.icon}
                  className={styles.categoryIcon}
                  aria-hidden="true"
                />
              )}

              {/* 分類名稱 */}
              <span className={styles.categoryName}>{category.name}</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
