import { getExercisesAction } from "@/lib/actions/exercises";

import { ExerciseList } from "@/components/dashboard/ExerciseList";
import { notFound } from "next/navigation";

export default async function ExercisePage() {
  const exercisesResponse = await getExercisesAction({ page: 1, limit: 50 });

  if (!exercisesResponse.success) {
    throw new Error(
      exercisesResponse.error?.message ?? `Failed to fetch exercises`
    );
  }

  if (!exercisesResponse.data) {
    return notFound();
  }

  // todo: For demo purposes, assume all exercises are for this week
  // In a real app, you'd filter based on plan dates
  const weeklyExercises = exercisesResponse.data;

  const completedCount = weeklyExercises.filter((ex) => ex.done).length;
  const totalCount = weeklyExercises.length;
  const pillPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const weeklyTotalMins = weeklyExercises.reduce((total, exercise) => {
    return total + (exercise.estimatedMins || 0);
  }, 0);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <ExerciseList
          exercises={weeklyExercises}
          pillPercent={pillPercent}
          weeklyTotalMins={weeklyTotalMins}
        />
      </div>
    </div>
  );
}
