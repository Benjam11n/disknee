import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

export function FirstWeekGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Your First Week
        </CardTitle>
        <CardDescription>Start your recovery journey with these simple steps</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Set Your Schedule</h4>
                <p className="text-sm text-muted-foreground">
                  Schedule your exercise sessions according to your doctor's plan. Mark them in your
                  calendar like important appointments with yourself.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Create Your Space</h4>
                <p className="text-sm text-muted-foreground">
                  Find a comfortable spot with enough room to move. Keep your phone or tablet nearby
                  for guidance.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Start Gentle</h4>
                <p className="text-sm text-muted-foreground">
                  Begin with shorter sessions (10-15 minutes). It's okay to start slow - you're
                  building a habit!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Track Everything</h4>
                <p className="text-sm text-muted-foreground">
                  Note how you feel after each session. Even small observations help you see
                  progress.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                5
              </div>
              <div>
                <h4 className="font-semibold">Stay Hydrated</h4>
                <p className="text-sm text-muted-foreground">
                  Drink water before and after exercises. Your muscles work better when you're
                  hydrated!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                6
              </div>
              <div>
                <h4 className="font-semibold">Celebrate!</h4>
                <p className="text-sm text-muted-foreground">
                  You did it! Acknowledge your effort. Every completed session is a victory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
