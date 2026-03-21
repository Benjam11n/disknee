export const EXERCISE_DIFFICULTY = {
  EASY: "EASY",
  HARD: "HARD",
  MODERATE: "MODERATE",
} as const;

export type ExerciseDifficultyValue =
  (typeof EXERCISE_DIFFICULTY)[keyof typeof EXERCISE_DIFFICULTY];

export const MOOD = {
  ENERGIZED: "ENERGIZED",
  FRUSTRATED: "FRUSTRATED",
  OKAY: "OKAY",
  TIRED: "TIRED",
} as const;

export type MoodValue = (typeof MOOD)[keyof typeof MOOD];
