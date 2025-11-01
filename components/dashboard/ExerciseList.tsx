"use client";

import { ExerciseItem } from "./ExerciseItem";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@prisma/client";

interface ExerciseListProps {
  loading: boolean;
  exercises: Exercise[];
  pillPercent: number;
  weeklyTotalMins: number;
}

export function ExerciseList({
  loading,
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
        {loading && (
          <li className="animate-pulse">
            <div className="h-16 rounded-lg bg-muted"></div>
          </li>
        )}
        {exercises.map((exercise) => (
          <ExerciseItem key={exercise.id} exercise={exercise} />
        ))}
      </ul>
    </div>
  );
}
