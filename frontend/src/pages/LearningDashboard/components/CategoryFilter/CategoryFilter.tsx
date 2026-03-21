import styles from "./CategoryFilter.module.scss";
import CategoryButton from "../CategoryButton";
import type { Category, CategoryType } from "@/types";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation('dashboard');
  return (
    <div className={styles.categoryFilter}>
      {categories.map((category) => {
        const count = levelCounts[category.id];
        const subtitle = count !== undefined ? `${count} Modules` : undefined;
        const catKey = category.id.replace(/-/g, '_');
        const catName = t(`categories.${catKey}.name`);
        const catDesc = t(`categories.${catKey}.description`);

        return (
          <CategoryButton
            key={category.id}
            iconName={category.icon}
            title={catName}
            subtitle={subtitle}
            tooltipContent={catDesc}
            colorTheme={category.colorTheme}
            isActive={activeCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
            aria-label={catName}
            disabled={!category.isDeveloped}
          />
        );
      })}
    </div>
  );
}

export default CategoryFilter;
