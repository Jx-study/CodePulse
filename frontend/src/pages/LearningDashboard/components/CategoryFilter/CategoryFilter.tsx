import styles from "./CategoryFilter.module.scss";
import Button from "@/shared/components/Button";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryLabels: Record<string, string> = {
  all: "全部",
  sorting: "排序演算法",
  searching: "搜尋演算法",
  graph: "圖論",
  "dynamic-programming": "動態規劃",
  "data-structures": "資料結構",
};

function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className={styles.categoryFilter}>
      {categories.map((category) => (
        <Button
          key={category}
          variant="ghost"
          className={`${styles.categoryButton} ${
            activeCategory === category ? styles.active : ""
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {categoryLabels[category] || category}
        </Button>
      ))}
    </div>
  );
}

export default CategoryFilter;
