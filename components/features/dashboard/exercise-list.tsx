"use client";

import { ExerciseItem } from "./exercise-item";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@prisma/client";
import { canStartExercise } from "@/lib/utils/exercise-utils";

interface ExerciseListProps {
  exercises: Exercise[];
  pillPercent: number;
  weeklyTotalMins: number;
}

export function ExerciseList({
  exercises,
  pillPercent,
  weeklyTotalMins,
}: ExerciseListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Exercises</h2>
        <div className="text-sm text-muted-foreground">
          {weeklyTotalMins} min this week
        </div>
      </div>

      {/* Progress with shadcn/ui Progress component */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Weekly Progress</span>
          <Badge variant={pillPercent === 100 ? "default" : "secondary"}>
            {pillPercent}% complete
          </Badge>
        </div>
        <Progress value={pillPercent} className="h-2 w-full max-w-md" />
      </div>

      {/* Exercise list */}
      <ul className="space-y-2">
        {exercises.map((exercise, index) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            isDisabled={!canStartExercise(exercises, exercise.id)}
          />
        ))}
      </ul>
    </div>
  );
}
