import { getExercisesAction } from "@/lib/actions/exercises";
import { getPlans } from "@/lib/actions/plans";
import { ExerciseList } from "@/components/dashboard/ExerciseList";
import { Exercise } from "@prisma/client";

export default async function ExercisePage() {
  // Fetch exercises
  const exercisesData = await getExercisesAction({ page: 1, limit: 50 });

  const exercises: Exercise[] =
    exercisesData && !("error" in exercisesData)
      ? exercisesData
      : [];

  // For demo purposes, assume all exercises are for this week
  // In a real app, you'd filter based on plan dates
  const weeklyExercises = exercises;

  const completedCount = weeklyExercises.filter((ex) => ex.done).length;
  const totalCount = weeklyExercises.length;
  const pillPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const weeklyTotalMins = weeklyExercises.reduce((total, exercise) => {
    return total + (exercise.estimatedMins || 0);
  }, 0);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <ExerciseList
          exercises={exercises}
          pillPercent={pillPercent}
          weeklyTotalMins={weeklyTotalMins}
        />
      </div>
    </div>
  );
}