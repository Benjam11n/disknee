import { getExercisesAction } from "@/lib/actions/exercises";
import { getPlansAction } from "@/lib/actions/plans";
import { auth } from "@/lib/auth";
import { ExerciseList } from "@/components/features/dashboard/exercise-list";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export default async function ExercisePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return notFound();
  }

  // Calculate the start and end of the current week (Monday to Sunday)
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Sunday = 0, Monday = 1

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const plansResponse = await getPlansAction({
    startDate: startOfWeek.toISOString(),
    endDate: endOfWeek.toISOString(),
    limit: 100,
    offset: 0,
  });

  if (!plansResponse.success || !plansResponse.data) {
    throw new Error(plansResponse.error?.message ?? `Failed to fetch plans`);
  }

  const weeklyPlanIds = plansResponse.data.map((plan) => plan.id);
  const weeklyPlanIdSet = new Set(weeklyPlanIds);

  const exercisesResponse = await getExercisesAction({ page: 1, limit: 50 });

  if (!exercisesResponse.success) {
    throw new Error(
      exercisesResponse.error?.message ?? `Failed to fetch exercises`
    );
  }

  if (!exercisesResponse.data) {
    return notFound();
  }

  const weeklyExercises = exercisesResponse.data.filter((exercise) =>
    weeklyPlanIdSet.has(exercise.planId)
  );

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
