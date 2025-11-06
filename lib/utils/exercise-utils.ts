import { Exercise } from '@prisma/client';

/**
 * Get the next exercise that should be completed in a sequence
 * @param exercises - Array of exercises (should be filtered by planId and sorted by sequence)
 * @returns The next incomplete exercise or null if all are done
 */
export function getNextExercise(exercises: Exercise[]): Exercise | null {
  // Find the first exercise that is not done
  return exercises.find((exercise) => !exercise.done) || null;
}

/**
 * Check if a specific exercise is the next one to be completed
 * @param exercises - Array of exercises (should be filtered by planId and sorted by sequence)
 * @param exerciseId - ID of the exercise to check
 * @returns true if this exercise is the next one to be completed
 */
export function isNextExercise(exercises: Exercise[], exerciseId: string): boolean {
  const nextExercise = getNextExercise(exercises);
  return nextExercise?.id === exerciseId;
}

/**
 * Check if an exercise can be started (is next in sequence or already done)
 * @param exercises - Array of exercises (should be filtered by planId and sorted by sequence)
 * @param exerciseId - ID of the exercise to check
 * @returns true if exercise can be started
 */
export function canStartExercise(exercises: Exercise[], exerciseId: string): boolean {
  const exercise = exercises.find((ex) => ex.id === exerciseId);

  // Can't start if exercise doesn't exist
  if (!exercise) {
    return false;
  }

  // Can start if already done
  if (exercise.done) {
    return true;
  }

  // Can start if it's the next exercise in sequence
  return isNextExercise(exercises, exerciseId);
}

/**
 * Filter and sort exercises for a specific plan
 * @param exercises - Array of exercises
 * @param planId - Plan ID to filter by
 * @returns Filtered and sorted exercises
 */
export function getExercisesForPlan(exercises: Exercise[], planId: string): Exercise[] {
  return exercises
    .filter((exercise) => exercise.planId === planId)
    .sort((a, b) => a.sequence - b.sequence);
}

/**
 * Get exercise completion progress for a plan
 * @param exercises - Array of exercises (should be filtered by planId)
 * @returns Object with completion stats
 */
export function getExerciseProgress(exercises: Exercise[]) {
  const total = exercises.length;
  const completed = exercises.filter((ex) => ex.done).length;
  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    remaining,
    percentage,
  };
}
