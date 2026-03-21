/**
 * Utility functions for generating motivational messages
 */

const MOTIVATIONAL_QUOTES = [
  "Every step forward is progress, no matter how small.",
  "You're stronger than you think. Keep going!",
  "Consistency is the key to success.",
  "Your body thanks you for taking care of it.",
  "Today's effort is tomorrow's strength.",
  "Trust the process and celebrate small wins.",
  "You're building a healthier future, one day at a time.",
  "Progress, not perfection, is the goal.",
] as const;

/**
 * Get time-based greeting message
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

/**
 * Get daily motivational quote based on current date
 */
export function getDailyQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

/**
 * Get motivational message based on exercise completion percentage
 */
export function getExerciseMotivation(completionPercentage: number): string {
  if (completionPercentage === 100) {
    return "Perfect week! All exercises completed!";
  }
  if (completionPercentage >= 80) {
    return "Almost there! You're doing amazing!";
  }
  if (completionPercentage >= 50) {
    return "Great progress! Keep pushing forward!";
  }
  if (completionPercentage >= 25) {
    return "Good start! You've got this!";
  }
  return "Ready to begin? Let's tackle today's exercises!";
}

/**
 * Get motivational message based on streak count
 */
export function getStreakMotivation(streakCount: number): string {
  if (streakCount >= 30) {
    return "Incredible consistency! You're a champion!";
  }
  if (streakCount >= 14) {
    return "Amazing dedication! Keep it up!";
  }
  if (streakCount >= 7) {
    return "One week strong! You're on fire!";
  }
  if (streakCount >= 3) {
    return "Great start! You're building momentum!";
  }
  if (streakCount >= 1) {
    return "Welcome back! Let's make today count!";
  }
  return "Ready to start your journey? Let's go!";
}
