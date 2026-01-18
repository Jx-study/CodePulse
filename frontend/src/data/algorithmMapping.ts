/**
 * Algorithm ID Mapping System
 *
 * This file provides unified mapping between different ID formats used across the application:
 * - Home page DataStructureAlgorithm component (numeric IDs)
 * - LearningDashboard component (kebab-case string IDs)
 * - AlgorithmConfig keys (category/algorithm format)
 */

import * as algorithmsData from './algorithms.json';

/**
 * Algorithm metadata interface
 */
export interface AlgorithmMetadata {
  id: number;
  levelId: string;
  category: 'sorting' | 'search' | 'graph';
  difficulty: number;
  image: string;
  translationKey: string;
}

/**
 * Get all algorithms metadata
 */
export function getAllAlgorithmsMetadata(): AlgorithmMetadata[] {
  return algorithmsData.algorithms as AlgorithmMetadata[];
}

/**
 * Get algorithm metadata by ID
 */
export function getAlgorithmMetadataById(id: number): AlgorithmMetadata | null {
  const algorithm = algorithmsData.algorithms.find(algo => algo.id === id);
  return algorithm ? (algorithm as AlgorithmMetadata) : null;
}

/**
 * Get algorithm metadata by level ID
 */
export function getAlgorithmMetadataByLevelId(levelId: string): AlgorithmMetadata | null {
  const algorithm = algorithmsData.algorithms.find(algo => algo.levelId === levelId);
  return algorithm ? (algorithm as AlgorithmMetadata) : null;
}

/**
 * Get Level ID from Home page algorithm numeric ID
 * @param homeAlgorithmId - Numeric ID used in Home page (1-8)
 * @returns Level ID string (kebab-case) or null if not found
 */
export function getLevelIdFromHomeAlgorithm(homeAlgorithmId: number): string | null {
  const algorithm = getAlgorithmMetadataById(homeAlgorithmId);
  return algorithm ? algorithm.levelId : null;
}

/**
 * Get AlgorithmConfig key from Level ID
 * @param levelId - Level ID (kebab-case)
 * @returns AlgorithmConfig key (category/algorithm) or null if not found
 */
export function getAlgorithmConfigKey(levelId: string): string | null {
  return algorithmsData.levelMapping[levelId as keyof typeof algorithmsData.levelMapping] || null;
}

/**
 * Check if a level has been developed (has AlgorithmConfig implementation)
 * @param levelId - Level ID (kebab-case)
 * @returns true if the algorithm config exists
 */
export function isAlgorithmDeveloped(levelId: string): boolean {
  return algorithmsData.developedAlgorithms.includes(levelId);
}

/**
 * Get category from Level ID
 * @param levelId - Level ID (kebab-case)
 * @returns Category string or 'general' if not found
 */
export function getCategoryFromLevelId(levelId: string): string {
  const configKey = getAlgorithmConfigKey(levelId);
  if (!configKey) return 'general';

  return configKey.split('/')[0]; // Extract category from 'category/algorithm'
}

/**
 * Get algorithms by category
 */
export function getAlgorithmsByCategory(category: 'sorting' | 'search' | 'graph'): AlgorithmMetadata[] {
  return algorithmsData.algorithms.filter(algo => algo.category === category) as AlgorithmMetadata[];
}
