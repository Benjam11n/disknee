import { getExercisesAction } from '@/lib/actions/exercises';
import { getPlansAction } from '@/lib/actions/plans';
import { auth } from '@/lib/auth';
import { ExerciseProgressClient } from './exercise-progress-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { List } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

export default async function ExercisePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return notFound();
  }

  // Get plans for current month (same as dashboard)
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const plansResponse = await getPlansAction({
    limit: 100,
    offset: 0,
    include: { exercises: true },
  });

  if (!plansResponse.success || !plansResponse.data) {
    throw new Error(plansResponse.error?.message ?? `Failed to fetch plans`);
  }

  // Filter plans for current month (same as dashboard)
  const plans = plansResponse.data.filter((plan) => {
    const planDate = new Date(plan.date);
    return planDate >= startOfMonth && planDate <= endOfMonth;
  });

  // Fetch exercises for the filtered plans (same as dashboard)
  const exercisesPromises = plans.map((plan) =>
    getExercisesAction({ planId: plan.id, page: 1, limit: 100 })
  );

  const exercisesResponses = await Promise.all(exercisesPromises);

  // Combine all exercises from all plans (same as dashboard)
  const weeklyExercises = exercisesResponses
    .flatMap((response) => (response.success ? response.data || [] : []))
    .sort((a, b) => a.sequence - b.sequence);

  const weeklyTotalMins = weeklyExercises.reduce((total, exercise) => {
    return total + (exercise.estimatedMins || 0);
  }, 0);

  // Calculate weeklyTarget the same way as dashboard (from useDashboardCalculations hook)
  const list = Array.isArray(weeklyExercises) ? weeklyExercises : [];
  const total = list.length || 1;
  const done = list.filter((e) => e && e.done).length;
  const weeklyTarget = done / total;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monthly Exercises</h1>
            <p className="text-muted-foreground">Your exercises for this month</p>
          </div>
          <Link href={ROUTES.EXERCISES_ALL}>
            <Button variant="outline">
              <List className="h-4 w-4 mr-2" />
              View All Exercises
            </Button>
          </Link>
        </div>
        <ExerciseProgressClient
          exercises={weeklyExercises}
          weeklyTarget={weeklyTarget}
          weeklyTotalMins={weeklyTotalMins}
        />
      </div>
    </div>
  );
}
