"use client";

import { Coins, Crown, TrendingUp, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShopItem } from "@prisma/client";
import { cn } from "@/lib/utils";

interface PointsDisplayProps {
  points: number;
  equippedItems: ShopItem[];
  nextMilestone?: number;
}

export function PointsDisplay({
  points,
  equippedItems,
  nextMilestone = 1000,
}: PointsDisplayProps) {
  const progress = Math.min(
    ((points % nextMilestone) / nextMilestone) * 100,
    100
  );
  const pointsToNext = nextMilestone - (points % nextMilestone);
  const currentLevel = Math.floor(points / 100) + 1;

  const getRank = (points: number) => {
    if (points >= 1000)
      return {
        name: "Gold",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        icon: "🏆",
      };
    if (points >= 500)
      return {
        name: "Silver",
        color: "text-gray-600 bg-gray-50 border-gray-200",
        icon: "🥈",
      };
    if (points >= 200)
      return {
        name: "Bronze",
        color: "text-orange-600 bg-orange-50 border-orange-200",
        icon: "🥉",
      };
    return {
      name: "Rookie",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      icon: "⭐",
    };
  };

  const rank = getRank(points);

  return (
    <Card className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-yellow-200 shadow-lg overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />

      <CardContent className="p-6 relative">
        {/* Rank Badge */}
        <div className="flex justify-between items-start mb-4">
          <Badge className={cn("text-xs font-bold px-3 py-1", rank.color)}>
            <span className="mr-1">{rank.icon}</span>
            {rank.name} Rank
          </Badge>
          <div className="text-xs text-muted-foreground">
            Level {currentLevel}
          </div>
        </div>

        {/* Main Points Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Coins className="h-8 w-8 text-yellow-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-800">
                  {points.toLocaleString()}
                </div>
                <div className="text-sm text-yellow-600 font-medium">
                  points
                </div>
              </div>
            </div>

            {/* Equipped Items */}
            {equippedItems.length > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    Equipped ({equippedItems.length})
                  </span>
                </div>
                <div className="flex gap-1 justify-end">
                  {equippedItems.map((item) => (
                    <span
                      key={item.id}
                      className="text-2xl hover:scale-110 transition-transform cursor-pointer"
                      title={item.name}
                    >
                      {item.icon}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar to Next Milestone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>Next: {nextMilestone.toLocaleString()}</span>
              </div>
              <span className="font-medium text-yellow-700">
                {pointsToNext.toLocaleString()} points to go
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Call to Action */}
          {equippedItems.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-200/50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-yellow-700" />
              <p className="text-xs text-yellow-800 font-medium">
                Complete exercises to earn points and unlock items!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
