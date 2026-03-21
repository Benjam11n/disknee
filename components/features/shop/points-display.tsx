'use client';

import { Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PointsDisplayProps {
  points: number;
}

export function PointsDisplay({ points }: PointsDisplayProps) {
  return (
          <Card className="px-4 py-2.5 border-border/40 shadow-xs flex items-center gap-3 bg-card hover:bg-card/80 transition-colors">
            <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold leading-none tracking-tight">{points}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                Points
              </div>
            </div>
          </Card>
  );
}
