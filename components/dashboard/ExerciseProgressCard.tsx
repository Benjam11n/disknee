import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseList } from "./ExerciseList";
import { Exercise } from "@prisma/client";

interface ExerciseProgressCardProps {
  exercises: Exercise[];
  weeklyTarget: number;
  weeklyTotalMins: number;
}

export function ExerciseProgressCard({
  exercises,
  weeklyTarget,
  weeklyTotalMins,
}: ExerciseProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Exercises</CardTitle>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {Math.round(weeklyTarget * 100)}% complete
          </div>
          <div className="text-xs text-muted-foreground">
            Estimated time: {weeklyTotalMins} minutes
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ExerciseList
          exercises={Array.isArray(exercises) ? exercises : []}
          pillPercent={Math.round(weeklyTarget * 100)}
          weeklyTotalMins={weeklyTotalMins}
        />
      </CardContent>
    </Card>
  );
}