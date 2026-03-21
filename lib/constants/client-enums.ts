export const EXERCISE_DIFFICULTY = {
  EASY: 'EASY',
  MODERATE: 'MODERATE',
  HARD: 'HARD',
} as const;

export type ExerciseDifficultyValue =
  (typeof EXERCISE_DIFFICULTY)[keyof typeof EXERCISE_DIFFICULTY];

export const MOOD = {
  ENERGIZED: 'ENERGIZED',
  OKAY: 'OKAY',
  TIRED: 'TIRED',
  FRUSTRATED: 'FRUSTRATED',
} as const;

export type MoodValue = (typeof MOOD)[keyof typeof MOOD];
