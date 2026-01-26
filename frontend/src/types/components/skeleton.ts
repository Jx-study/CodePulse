/**
 * Skeleton Component Types
 * 骨架屏組件的類型定義
 */

// ==================== SkeletonCard Component ====================
export interface SkeletonCardProps {
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'rounded' | 'circular';
  animation?: 'shimmer' | 'pulse' | 'none';
  className?: string;
  children?: React.ReactNode;
}

// ==================== SkeletonText Component ====================
export interface SkeletonTextProps {
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'shimmer' | 'pulse' | 'none';
  className?: string;
}

// ==================== SkeletonButton Component ====================
export interface SkeletonButtonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'rounded' | 'circular';
  animation?: 'shimmer' | 'pulse' | 'none';
  className?: string;
}

// ==================== SkeletonImage Component ====================
export interface SkeletonImageProps {
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'rounded' | 'circular';
  animation?: 'shimmer' | 'pulse' | 'none';
  className?: string;
}

// ==================== Features Skeleton Component ====================
export interface FeaturesSkeletonProps {
  count?: number;
  className?: string;
}

// ==================== DataStructureAlgorithm Skeleton Component ====================
export interface DataStructureAlgorithmSkeletonProps {
  count?: number;
  className?: string;
}
