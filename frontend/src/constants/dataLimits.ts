export function clampNumberInput(
  value: string,
  min: number,
  max: number,
): string {
  const num = parseInt(value, 10);
  if (isNaN(num)) return value;
  return String(Math.min(Math.max(num, min), max));
}

export const DATA_LIMITS = {
  DEFAULT_RANDOM_COUNT: 5,
  MIN_RANDOM_COUNT: 1,
  MAX_NODE_VALUE: 9999,
  MIN_NODE_VALUE: -9999,
  MAX_GRID_SIZE: 20,
  MAX_GRAPH_NODE_ID: 999,
  MAX_GRAPH_NODE_COUNT: 50,
  MAX_N_QUEENS_SIZE: 8,
  MAX_FACTORIAL_N: 10,
  MAX_KNAPSACK_CAPACITY: 15,
};
