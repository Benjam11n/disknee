import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Calendar, Sparkles } from 'lucide-react';
import { getGreeting, getDailyQuote, getStreakMotivation } from '@/lib/utils/motivation-utils';

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
    <div className="space-y-4 max-w-[1400px] mx-auto px-4 pt-8">
      {/* Welcome Card */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            {/* Left Side - Greeting */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  {getGreeting()}, {patientName}!
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-4">{getDailyQuote()}</p>
              <Badge
                variant="secondary"
                className="text-base px-4 py-2 bg-secondary text-secondary-foreground"
              >
                {getStreakMotivation(streakCount)}
              </Badge>
            </div>

            {/* Right Side - Quick Stats */}
            <div className="hidden md:flex gap-6 ml-8">
              {streakCount > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{streakCount}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>Day Streak</span>
                    {streakCount >= 3 && <span>🔥</span>}
                  </div>
                </div>
              )}
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{userPoints}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
              {completionRate > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {Math.round(completionRate * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Quick Stats */}
      <div className="grid grid-cols-3 gap-4 md:hidden">
        {streakCount > 0 && (
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{streakCount}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        )}
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userPoints}</div>
            <div className="text-xs text-muted-foreground">Points</div>
          </CardContent>
        </Card>
        {completionRate > 0 && (
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(completionRate * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Today's Focus Card */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Today's Focus</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Stay Consistent</p>
                <p className="text-sm text-muted-foreground">
                  {streakCount > 0 ? 'Keep your streak alive!' : 'Start your journey today'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium">Complete Exercises</p>
                <p className="text-sm text-muted-foreground">Stick to your plan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium">Track Progress</p>
                <p className="text-sm text-muted-foreground">Every check-in counts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
