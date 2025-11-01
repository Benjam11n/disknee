"use client";

import { ExerciseItem } from "./ExerciseItem";

type Difficulty = "easy" | "moderate" | "hard";

interface Exercise {
  id: number | string;
  title: string;
  done: boolean;
  estimatedMins?: number;
  difficulty?: Difficulty;
}

interface ExerciseListProps {
  loading: boolean;
  exercises: Exercise[];
  onToggle: (id: Exercise["id"]) => void;
  onOpen: (id: Exercise["id"]) => void;
  pillPercent: number;
  weeklyTotalMins: number;
}

export function ExerciseList({
  loading,
  exercises,
  onToggle,
  onOpen,
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

      {/* Progress pill */}
      <div className="space-y-2">
        <div className="relative h-8 w-full max-w-md overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${pillPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
            {pillPercent}% complete
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <ul className="space-y-2">
        {loading && (
          <li className="animate-pulse">
            <div className="h-16 rounded-lg bg-muted"></div>
          </li>
        )}
        {exercises.map((exercise) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            onToggle={onToggle}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </div>
  );
}