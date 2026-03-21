import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EXERCISE_DIFFICULTY, type ExerciseDifficultyValue } from '@/lib/constants/client-enums';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format rank display (e.g., 1500 -> 1.5k)
 */
export function getRankDisplay(rank: number): string {
  if (rank >= 1000) {
    return `${(rank / 1000).toFixed(1)}k`;
  }
  return rank.toString();
}

export function getDifficultyBadgeVariant(difficulty?: ExerciseDifficultyValue) {
  switch (difficulty) {
    case EXERCISE_DIFFICULTY.EASY:
      return 'default';
    case EXERCISE_DIFFICULTY.MODERATE:
      return 'secondary';
    case EXERCISE_DIFFICULTY.HARD:
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getDifficultyColor(difficulty?: ExerciseDifficultyValue) {
  switch (difficulty) {
    case EXERCISE_DIFFICULTY.EASY:
      return 'text-emerald-600 dark:text-emerald-400';
    case EXERCISE_DIFFICULTY.MODERATE:
      return 'text-amber-600 dark:text-amber-400';
    case EXERCISE_DIFFICULTY.HARD:
      return 'text-rose-600 dark:text-rose-400';
    default:
      return 'text-muted-foreground';
  }
}

export function getDifficultyStyles(difficulty?: ExerciseDifficultyValue) {
  switch (difficulty) {
    case EXERCISE_DIFFICULTY.EASY:
      return {
        row: 'border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/50',
        toggle: 'border-emerald-500 text-emerald-600 dark:text-emerald-50',
        toggleChecked: 'bg-emerald-500 text-emerald-50 border-emerald-600 dark:border-emerald-700',
      };
    case EXERCISE_DIFFICULTY.MODERATE:
      return {
        row: 'border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/50',
        toggle: 'border-amber-500 text-amber-600 dark:text-amber-50',
        toggleChecked: 'bg-amber-500 text-amber-50 border-amber-600 dark:border-amber-700',
      };
    case EXERCISE_DIFFICULTY.HARD:
      return {
        row: 'border-l-4 border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/50',
        toggle: 'border-rose-500 text-rose-600 dark:text-rose-50',
        toggleChecked: 'bg-rose-500 text-rose-50 border-rose-600 dark:border-rose-700',
      };
    default:
      return {
        row: 'border-l-4 border-l-muted dark:border-l-muted-foreground',
        toggle: 'border-muted text-muted-foreground dark:text-muted-foreground',
        toggleChecked: 'bg-muted text-muted-foreground dark:bg-muted-foreground',
      };
  }
}
