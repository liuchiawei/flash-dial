export type Difficulty = "easy" | "medium" | "hard" | "crazy";
export type Rule = "sequence" | "odd" | "even" | "prime";

export interface DifficultyConfig {
  size: number;
  max: number;
}