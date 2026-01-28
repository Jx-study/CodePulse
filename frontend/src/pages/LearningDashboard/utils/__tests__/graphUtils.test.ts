import { describe, it, expect } from 'vitest';
import type { Level } from '@/types';
import {
  validateGraphAcyclic,
  getDependentLevels,
} from '../graphUtils';

describe('validateGraphAcyclic', () => {
  it('should return valid for acyclic graph', () => {
    const levels: Level[] = [
      {
        id: 'L1',
        name: 'Level 1',
        nameEn: 'Level 1',
        category: 'data-structures',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'NONE', levelIds: [] },
      },
      {
        id: 'L2',
        name: 'Level 2',
        nameEn: 'Level 2',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'AND', levelIds: ['L1'] },
      },
      {
        id: 'L3',
        name: 'Level 3',
        nameEn: 'Level 3',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'AND', levelIds: ['L2'] },
      },
    ];

    const result = validateGraphAcyclic(levels);
    expect(result.isValid).toBe(true);
    expect(result.cycle).toBeUndefined();
  });

  it('should detect simple cycle (A -> B -> A)', () => {
    const levels: Level[] = [
      {
        id: 'L1',
        name: 'Level 1',
        nameEn: 'Level 1',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'AND', levelIds: ['L2'] },
      },
      {
        id: 'L2',
        name: 'Level 2',
        nameEn: 'Level 2',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'AND', levelIds: ['L1'] },
      },
    ];

    const result = validateGraphAcyclic(levels);
    expect(result.isValid).toBe(false);
    expect(result.cycle).toBeDefined();
    expect(result.cycle?.length).toBeGreaterThan(0);
  });

  it('should detect complex cycle (A -> B -> C -> A)', () => {
    const levels: Level[] = [
      {
        id: 'L1',
        name: 'Level 1',
        nameEn: 'Level 1',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'AND', levelIds: ['L3'] },
      },
      {
        id: 'L2',
        name: 'Level 2',
        nameEn: 'Level 2',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'AND', levelIds: ['L1'] },
      },
      {
        id: 'L3',
        name: 'Level 3',
        nameEn: 'Level 3',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'AND', levelIds: ['L2'] },
      },
    ];

    const result = validateGraphAcyclic(levels);
    expect(result.isValid).toBe(false);
    expect(result.cycle).toBeDefined();
  });

  it('should handle OR prerequisites correctly', () => {
    const levels: Level[] = [
      {
        id: 'L1',
        name: 'Level 1',
        nameEn: 'Level 1',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'NONE', levelIds: [] },
      },
      {
        id: 'L2',
        name: 'Level 2',
        nameEn: 'Level 2',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'NONE', levelIds: [] },
      },
      {
        id: 'L3',
        name: 'Level 3',
        nameEn: 'Level 3',
        category: 'sorting',
        difficulty: 1,
        description: '',
        learningObjectives: [],
        isDeveloped: true,
        isUnlocked: true,
        prerequisites: { type: 'OR', levelIds: ['L1', 'L2'] },
      },
    ];

    const result = validateGraphAcyclic(levels);
    expect(result.isValid).toBe(true);
  });

  it('should handle empty level list', () => {
    const result = validateGraphAcyclic([]);
    expect(result.isValid).toBe(true);
  });
});

describe('getDependentLevels', () => {
  const levels: Level[] = [
    {
      id: "L1",
      name: "Level 1",
      nameEn: "Level 1",
      category: "sorting",
      difficulty: 1,
      description: "",
      learningObjectives: [],
      isDeveloped: true,
      isUnlocked: true,
      prerequisites: { type: "NONE", levelIds: [] },
    },
    {
      id: "L2",
      name: "Level 2",
      nameEn: "Level 2",
      category: "sorting",
      difficulty: 1,
      description: "",
      learningObjectives: [],
      isDeveloped: true,
      isUnlocked: true,
      prerequisites: { type: "AND", levelIds: ["L1"] },
    },
    {
      id: "L3",
      name: "Level 3",
      nameEn: "Level 3",
      category: "sorting",
      difficulty: 1,
      description: "",
      learningObjectives: [],
      isDeveloped: true,
      isUnlocked: true,
      prerequisites: { type: "AND", levelIds: ["L1", "L2"] },
    },
    {
      id: "L4",
      name: "Level 4",
      nameEn: "Level 4",
      category: "sorting",
      difficulty: 1,
      description: "",
      learningObjectives: [],
      isDeveloped: true,
      isUnlocked: true,
      prerequisites: { type: "OR", levelIds: ["L1"] },
    },
    {
      id: "L5",
      name: "Level 5",
      nameEn: "Level 5",
      category: "sorting",
      difficulty: 1,
      description: "",
      learningObjectives: [],
      isDeveloped: true,
      isUnlocked: true,
      prerequisites: { type: "AND", levelIds: ["L2"] },
    },
  ];

  it('should find all levels that depend on L1', () => {
    const dependents = getDependentLevels('L1', levels);
    expect(dependents).toContain('L2');
    expect(dependents).toContain('L3');
    expect(dependents).toContain('L4');
    expect(dependents.length).toBe(3);
  });

  it('should find all levels that depend on L2', () => {
    const dependents = getDependentLevels('L2', levels);
    expect(dependents).toContain('L3');
    expect(dependents).toContain('L5');
    expect(dependents.length).toBe(2);
  });

  it('should return empty array for level with no dependents', () => {
    const dependents = getDependentLevels('L5', levels);
    expect(dependents).toEqual([]);
  });

  it('should return empty array for non-existent level', () => {
    const dependents = getDependentLevels('L999', levels);
    expect(dependents).toEqual([]);
  });

  it('should handle OR prerequisites', () => {
    const dependents = getDependentLevels('L1', levels);
    expect(dependents).toContain('L4'); // L4 has OR prerequisite with L1
  });
});