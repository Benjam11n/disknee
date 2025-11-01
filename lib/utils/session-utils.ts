/**
 * Format duration in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Get fatigue level label from numeric value
 */
export const getFatigueLabel = (value: number): string => {
  switch (value) {
    case 1:
      return "Very Low";
    case 2:
      return "Low";
    case 3:
      return "Moderate";
    case 4:
      return "High";
    case 5:
      return "Very High";
    default:
      return "Moderate";
  }
};