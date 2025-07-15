export type Difficulty = "easy" | "medium" | "hard" | "crazy";
export type Rule = "sequence" | "odd" | "even" | "prime";
export interface DifficultyConfig {
  size: number;
  max: number;
}

export interface GameCompletion {
  id: number;
  userId: string;
  completionTime: number;
  difficulty: Difficulty;
  rule: Rule;
  createdAt: Date;
}

export interface GameBoardProps {
  numbers: number[];
  handleClick: (number: number) => void;
  isPlaying: boolean;
  isGameOver: boolean;
  targetSequence: number[];
  nextExpectedIndex: number;
  wrongClick: number | null;
  size: number;
}