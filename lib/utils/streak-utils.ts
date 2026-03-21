import { Calendar, Flame, Zap } from "lucide-react";

export const getStreakColor = (streak: number) => {
  if (streak >= 30) {
    return "text-purple-600 bg-purple-50 border-purple-200";
  }
  if (streak >= 14) {
    return "text-red-600 bg-red-50 border-red-200";
  }
  if (streak >= 7) {
    return "text-orange-600 bg-orange-50 border-orange-200";
  }
  if (streak >= 3) {
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  }
  return "text-blue-600 bg-blue-50 border-blue-200";
};

export const getStreakIcon = (streak: number) => {
  if (streak >= 30) {
    return Zap;
  }
  if (streak >= 7) {
    return Flame;
  }
  return Calendar;
};

export const getStreakMilestone = (streak: number) => {
  if (streak === 1) {
    return "First day!";
  }
  if (streak === 3) {
    return "3 days strong!";
  }
  if (streak === 7) {
    return "One week! 🔥";
  }
  if (streak === 14) {
    return "Two weeks!";
  }
  if (streak === 21) {
    return "Three weeks!";
  }
  if (streak === 30) {
    return "One month! ⭐";
  }
  if (streak >= 30 && streak % 30 === 0) {
    return `${Math.floor(streak / 30)} months!`;
  }
  return `${streak} days`;
};
