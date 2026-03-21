/**
 * Mapping of exercise types to their demo video files
 */

export const EXERCISE_VIDEOS = {
  "knee-extension": "/knee-extension.mp4",
  "calf-raises": "/simple-squat.mp4", // TODO: replace with actual video
  squat: "/spanish-squat.mp4",
  "simple-squat": "/simple-squat.mp4",
  "hip-abduction": "/simple-squat.mp4", // TODO: replace with actual video
  "step-down": "/simple-squat.mp4", // TODO: replace with actual video
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
    "calf-raises": "Calf Raises",
    "hip-abduction": "Hip Abduction",
    "knee-extension": "Knee Extension",
    "simple-squat": "Simple Squat",
    squat: "Spanish Squat",
    "step-down": "Step-Down",
  };

  if (!exerciseType) {
    return "Exercise";
  }

  return displayNames[exerciseType] || "Exercise";
}
