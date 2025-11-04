"use client";

import { Coins, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ShopItem } from "@prisma/client";

interface PointsDisplayProps {
  points: number;
  equippedItems: ShopItem[];
}

export function PointsDisplay({ points, equippedItems }: PointsDisplayProps) {
  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-700">
                {points.toLocaleString()}
              </span>
              <span className="text-sm text-yellow-600">points</span>
            </div>
          </div>

          {equippedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-600" />
              <div className="flex gap-1">
                {equippedItems.map((item) => (
                  <span key={item.id} className="text-2xl" title={item.name}>
                    {item.icon}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {equippedItems.length === 0 && (
          <p className="text-xs text-yellow-600 mt-2">
            Visit the shop to customize your character!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
