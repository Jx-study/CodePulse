import styles from "./CategoryFilter.module.scss";
import CategoryButton from "../CategoryButton";
import type { Category, CategoryType } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  levelCounts?: Partial<Record<CategoryType, number>>;
}

function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  levelCounts = {},
}: CategoryFilterProps) {
  return (
    <div className={styles.categoryFilter}>
      {categories.map((category) => {
        const count = levelCounts[category.id];
        const subtitle = count !== undefined ? `${count} Modules` : undefined;

        return (
          <CategoryButton
            key={category.id}
            iconName={category.icon}
            title={category.name}
            subtitle={subtitle}
            tooltipContent={category.description}
            colorTheme={category.colorTheme}
            isActive={activeCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
            aria-label={category.name}
            disabled={!category.isDeveloped}
          />
        );
      })}
    </div>
  );
}

export default CategoryFilter;
