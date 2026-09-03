export interface ConcernOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

export interface ConcernQuestion {
  id: string;
  concernCategory: string;
  questionNumber: number;
  totalQuestions: number;
  question: string;
  subtitle?: string;
  options: ConcernOption[];
  isMultiSelect?: boolean;
}

export interface ConcernResultMapping {
  concernCategory: string;
  selectedOptionIds: string[];
  suggestedProcedureSlugs: string[];
  headline: string;
  description: string;
}
