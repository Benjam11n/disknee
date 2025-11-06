import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Trophy } from 'lucide-react';
import { formatTime } from '@/lib/utils/session-utils';

interface SessionData {
  duration: number;
  repsCompleted: number;
  accuracy: number;
}

interface SessionSummaryProps {
  sessionData: SessionData;
}

export function SessionSummary({ sessionData }: SessionSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Session Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <div>
              <div className="font-medium">{formatTime(sessionData.duration)}</div>
              <div className="text-xs">Duration</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <div>
              <div className="font-medium">{sessionData.repsCompleted} reps</div>
              <div className="text-xs">Completed</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <div>
              <div className="font-medium">{sessionData.accuracy}%</div>
              <div className="text-xs">Accuracy</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
