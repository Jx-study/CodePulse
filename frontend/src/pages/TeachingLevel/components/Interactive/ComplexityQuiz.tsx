import ChoiceQuiz from './ChoiceQuiz';

export const QUIZ_OPTIONS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'] as const;

export default function ComplexityQuiz() {
  return <ChoiceQuiz namespace="complexityQuiz" options={QUIZ_OPTIONS} />;
}
