import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Snowflake, Zap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { FreezeInventory } from "./freeze-inventory";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: Date;
  frozenUntil?: Date;
  userId?: string;
  className?: string;
  compact?: boolean;
  onCheckInClick?: () => void;
  canCheckIn?: boolean;
  onFreezeActivated?: () => void;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastCheckIn,
  frozenUntil,
  userId,
  className,
  compact = false,
  onCheckInClick,
  canCheckIn = false,
  onFreezeActivated,
}: StreakDisplayProps) {
  const isFrozen = frozenUntil && frozenUntil > new Date();
  const hasStreak = currentStreak > 0;
  const isNewDay =
    lastCheckIn &&
    new Date(lastCheckIn).toDateString() !== new Date().toDateString();

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-600 bg-purple-50 border-purple-200";
    if (streak >= 14) return "text-red-600 bg-red-50 border-red-200";
    if (streak >= 7) return "text-orange-600 bg-orange-50 border-orange-200";
    if (streak >= 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return Zap;
    if (streak >= 7) return Flame;
    return Calendar;
  };

  const getStreakMilestone = (streak: number) => {
    if (streak === 1) return "First day!";
    if (streak === 3) return "3 days strong!";
    if (streak === 7) return "One week! 🔥";
    if (streak === 14) return "Two weeks!";
    if (streak === 21) return "Three weeks!";
    if (streak === 30) return "One month! ⭐";
    if (streak >= 30 && streak % 30 === 0)
      return `${Math.floor(streak / 30)} months!`;
    return `${streak} days`;
  };

  const streakColor = getStreakColor(currentStreak);
  const StreakIcon = getStreakIcon(currentStreak);
  const streakMilestone = getStreakMilestone(currentStreak);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-full border-2 transition-all duration-300",
            streakColor
          )}
        >
          <StreakIcon
            className={cn("h-4 w-4", currentStreak > 0 && "animate-pulse")}
          />
          <span className="font-bold text-sm">{currentStreak}</span>
        </div>
        {isFrozen && <Snowflake className="h-4 w-4 text-blue-400" />}
      </div>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300", className)}>
      {/* Streak indicator dot */}
      {isNewDay && !isFrozen && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="relative">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping" />
          </div>
        </div>
      )}

      <CardContent className="p-6 relative">
        {/* Main Streak Display */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Icon with animation */}
          <div
            className={cn(
              "relative mb-4 transition-all duration-500",
              currentStreak > 0 && "scale-110"
            )}
          >
            <div
              className={cn(
                "p-4 rounded-2xl transition-all duration-500",
                streakColor,
                currentStreak > 0 && "shadow-lg"
              )}
            >
              <StreakIcon
                className={cn(
                  "h-8 w-8 transition-all duration-300",
                  currentStreak > 0 && "animate-pulse drop-shadow-md"
                )}
              />
            </div>
            {/* Fire animation for high streaks */}
            {currentStreak >= 7 && (
              <span className="absolute -top-1 -right-1 text-2xl animate-bounce">
                🔥
              </span>
            )}
          </div>

          {/* Streak Count */}
          <div className="mb-2">
            <div className="text-4xl font-bold text-primary transition-all duration-300">
              {currentStreak}
            </div>
            <p className="text-lg font-medium text-foreground">
              {streakMilestone}
            </p>
          </div>

          {/* Frozen Badge */}
          {isFrozen && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200 text-sm px-3 py-1"
            >
              <Snowflake className="h-3 w-3 mr-1" />
              Frozen until {new Date(frozenUntil).toLocaleDateString()}
            </Badge>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold text-primary text-center">
              {currentStreak}
            </div>
            <div className="text-xs text-muted-foreground text-center">Current</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold text-muted-foreground text-center">
              {longestStreak}
            </div>
            <div className="text-xs text-muted-foreground text-center">Longest</div>
          </div>
        </div>

        {/* Message Cards */}
        {hasStreak && !isFrozen && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
            <p className="text-center text-sm font-medium text-primary">
              {currentStreak >= 30
                ? "🏆 Legendary status! You're an inspiration!"
                : currentStreak >= 14
                ? "💪 Two weeks! Amazing dedication!"
                : currentStreak >= 7
                ? "🔥 One week strong! Keep the fire burning!"
                : currentStreak >= 3
                ? "⚡ Great momentum! You're on a roll!"
                : "🌟 Great start! Keep it going!"}
            </p>
          </div>
        )}

        {isFrozen && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <p className="text-center text-sm text-blue-800">
              ❄️ Your streak is protected! Check in tomorrow to continue.
            </p>
          </div>
        )}

        {!hasStreak && !isFrozen && (
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <p className="text-center text-sm text-muted-foreground">
              Ready to start? Check in daily to build your streak! 🚀
            </p>
          </div>
        )}

        {/* Progress Ring for streak health */}
        {currentStreak > 0 && !isFrozen && (
          <div className="relative w-20 h-20 mx-auto mb-4">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - Math.min(currentStreak / 30, 1))}`}
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium">
                {Math.min(Math.round((currentStreak / 30) * 100), 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Freeze Inventory */}
        {userId && (
          <div className="mt-4">
            <FreezeInventory
              userId={userId}
              isFrozen={isFrozen}
              frozenUntil={frozenUntil}
              onFreezeActivated={onFreezeActivated}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
