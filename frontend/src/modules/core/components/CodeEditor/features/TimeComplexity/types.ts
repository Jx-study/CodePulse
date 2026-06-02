export interface LineComplexity {
  lineNumber: number;
  complexity: string;
  context?: string;
}

export interface TimeComplexityConfig {
  enabled: boolean;
  externalData?: LineComplexity[];
}
