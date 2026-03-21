import { Card } from '@/components/ui/card';
import { Target, Sparkles, TrendingUp } from 'lucide-react';
import { getGreeting, getDailyQuote } from '@/lib/utils/motivation-utils';

interface HeroSectionProps {
  patientName: string;
  streakCount?: number;
  userPoints?: number;
  completionRate?: number;
}

export function HeroSection({
  patientName,
  streakCount = 0,
  userPoints = 0,
  completionRate = 0,
}: HeroSectionProps) {
  return (
    <div className="w-full mb-8 mt-2 flex flex-col gap-6">
      {/* Sleek Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {getGreeting()}, <span className="text-primary">{patientName}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">{getDailyQuote()}</p>
        </div>

        {/* KPI Pills */}
        <div className="flex items-center gap-3">
          {streakCount > 0 && (
            <Card className="px-4 py-2.5 border-border/40 shadow-xs flex items-center gap-3 bg-card hover:bg-card/80 transition-colors">
              <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold leading-none tracking-tight">{streakCount}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                  Streak
                </div>
              </div>
            </Card>
          )}
          <Card className="px-4 py-2.5 border-border/40 shadow-xs flex items-center gap-3 bg-card hover:bg-card/80 transition-colors">
            <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold leading-none tracking-tight">{userPoints}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                Points
              </div>
            </div>
          </Card>
          {completionRate > 0 && (
            <Card className="px-4 py-2.5 border-border/40 shadow-xs flex items-center gap-3 bg-card hover:bg-card/80 transition-colors">
              <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold leading-none tracking-tight">
                  {Math.round(completionRate * 100)}%
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                  Progress
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
