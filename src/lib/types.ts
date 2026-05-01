export interface Competency {
  name: string;
  score: number;
  explanation: string;
  tips: string;
}

export interface Evaluation {
  totalScore: number;
  competencies: Competency[];
  generalFeedback: string;
}
