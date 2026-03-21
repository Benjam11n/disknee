import { Trophy, Target, Calendar, TrendingUp, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressJourneyProps {
  overallTarget: number;
  weeksCompleted: number;
  programWeeks: number;
  patientRank: number;
  userPoints?: number;
}

export function ProgressJourney({
  overallTarget,
  weeksCompleted,
  programWeeks,
  patientRank,
  userPoints = 0,
}: ProgressJourneyProps) {
  const progressPercentage = overallTarget * 100;
  const weeksProgressPercentage = (weeksCompleted / programWeeks) * 100;

  // Calculate milestones
  const milestones = [
    { icon: "🌱", label: "Started", week: 1 },
    { icon: "📈", label: "Gaining", week: Math.floor(programWeeks * 0.25) },
    { icon: "⚡", label: "Halfway", week: Math.floor(programWeeks * 0.5) },
    { icon: "🔥", label: "Almost", week: Math.floor(programWeeks * 0.75) },
    { icon: "🏆", label: "Complete", week: programWeeks },
  ];

  const getProgressMessage = () => {
    if (weeksCompleted >= programWeeks) {
      return "🎉 Program Complete! You're a champion!";
    }
    if (weeksProgressPercentage >= 75) {
      return "🔥 Almost there! Final stretch!";
    }
    if (weeksProgressPercentage >= 50) {
      return "💪 Halfway through! Amazing progress!";
    }
    if (weeksProgressPercentage >= 25) {
      return "📈 Building momentum! Keep going!";
    }
    if (weeksCompleted >= 1) {
      return "🌱 Great start! You're on your way!";
    }
    return "🚀 Ready to begin your journey?";
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) {
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
    if (rank <= 10) {
      return "text-primary bg-primary/10 border-primary/30";
    }
    if (rank <= 25) {
      return "text-secondary bg-secondary/10 border-secondary/30";
    }
    return "text-muted-foreground bg-muted/30 border-muted-foreground/30";
  };

  const getPointsTier = (points: number) => {
    if (points >= 5000) {
      return {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        tier: "Platinum",
      };
    }
    if (points >= 2500) {
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        tier: "Gold",
      };
    }
    if (points >= 1000) {
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        tier: "Silver",
      };
    }
    if (points >= 500) {
      return {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        tier: "Bronze",
      };
    }
    return {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      tier: "Rising",
    };
  };

  const pointsTier = getPointsTier(userPoints);

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="h-5 w-5 text-primary" />
          Your Journey
        </CardTitle>
        <p className="text-sm text-muted-foreground">{getProgressMessage()}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Journey Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Program Progress</span>
            <span className="text-sm text-muted-foreground">
              Week {weeksCompleted} of {programWeeks}
            </span>
          </div>

          {/* Milestone Path */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full" />
            <div
              className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(weeksProgressPercentage, 100)}%` }}
            />

            {/* Milestones */}
            <div className="relative flex justify-between">
              {milestones.map((milestone, index) => {
                const isCompleted = weeksCompleted >= milestone.week;
                const isCurrent =
                  weeksCompleted >= milestone.week - 1 &&
                  weeksCompleted < milestone.week;

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300",
                        isCompleted
                          ? "bg-primary text-white shadow-md"
                          : isCurrent
                            ? "bg-secondary text-secondary-foreground shadow-md animate-pulse"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? "✓" : milestone.icon}
                    </div>
                    <span className="text-xs mt-2 text-center">
                      <div className="font-medium">{milestone.label}</div>
                      <div className="text-muted-foreground">
                        W{milestone.week}
                      </div>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Completion Progress */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(progressPercentage)}%
            </div>
            <Progress value={progressPercentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </div>

          {/* Rank */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Leaderboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">#{patientRank}</span>
              {patientRank <= 10 && (
                <Star className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <Badge
              variant="outline"
              className={cn("mt-1", getRankColor(patientRank))}
            >
              {patientRank <= 3
                ? "Top 3"
                : patientRank <= 10
                  ? "Top 10"
                  : "Keep Climbing"}
            </Badge>
          </div>
        </div>

        {/* Points Tier */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Points Earned</p>
              <p className="text-2xl font-bold text-primary">
                {userPoints.toLocaleString()}
              </p>
            </div>
            <Badge className={pointsTier.color}>{pointsTier.tier} Tier</Badge>
          </div>
          <div className="mt-2">
            <div className="text-xs text-muted-foreground">
              {userPoints < 500 && `${500 - userPoints} points to Bronze`}
              {userPoints >= 500 &&
                userPoints < 1000 &&
                `${1000 - userPoints} points to Silver`}
              {userPoints >= 1000 &&
                userPoints < 2500 &&
                `${2500 - userPoints} points to Gold`}
              {userPoints >= 2500 &&
                userPoints < 5000 &&
                `${5000 - userPoints} points to Platinum`}
              {userPoints >= 5000 && "Maximum tier achieved!"}
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        {weeksCompleted < programWeeks && (
          <div className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg">
            <Calendar className="h-4 w-4 text-accent-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {programWeeks - weeksCompleted} week
                {programWeeks - weeksCompleted !== 1 ? "s" : ""} remaining
              </p>
              <p className="text-xs text-muted-foreground">
                Keep up the great work!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
