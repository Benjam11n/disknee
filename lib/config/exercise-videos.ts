/**
 * Mapping of exercise types to their demo video files
 */

export const EXERCISE_VIDEOS = {
  'knee-extension': '/knee-extension-demo.mp4',
  'calf-raises': '/calf-raises-demo.mp4',
  'ex5': '/calf-raises-demo.mp4', // Alias for calf-raises
  'squat': '/spanish-squat.mp4',
  'hip-abduction': '/hip-abduction-demo.mp4',
  'step-down': '/step-down-demo.mp4',
} as const;

export type ExerciseType = keyof typeof EXERCISE_VIDEOS;

/**
 * Get the demo video URL for an exercise type
 * @param exerciseType - The exercise type
 * @returns The video URL or a default video if not found
 */
export function getExerciseVideo(exerciseType?: string | null): string {
  if (!exerciseType) {
    return EXERCISE_VIDEOS.squat; // Default video
  }

  return EXERCISE_VIDEOS[exerciseType as ExerciseType] || EXERCISE_VIDEOS.squat;
}

/**
 * Get the display name for an exercise type
 * @param exerciseType - The exercise type
 * @returns The display name
 */
export function getExerciseDisplayName(exerciseType?: string | null): string {
  const displayNames: Record<string, string> = {
    'knee-extension': 'Knee Extension',
    'calf-raises': 'Calf Raises',
    'ex5': 'Calf Raises',
    'squat': 'Spanish Squat',
    'hip-abduction': 'Hip Abduction',
    'step-down': 'Step-Down',
  };

  if (!exerciseType) {
    return 'Exercise';
  }

  return displayNames[exerciseType] || 'Exercise';
}