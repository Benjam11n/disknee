import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getExerciseByIdAction,
  getExercisesAction,
} from "@/lib/actions/exercises";
import { ExerciseDetailClient } from "./exercise-detail-client";

export default async function ExerciseDetailPage({ params }: RouteParams) {
  const { id } = await params;

  const [result, exercisesResult] = await Promise.all([
    getExerciseByIdAction({ id }),
    getExerciseByIdAction({ id }).then((exerciseResult) => {
      if (exerciseResult.success && exerciseResult.data) {
        return getExercisesAction({
          planId: exerciseResult.data.planId,
          page: 1,
          limit: 100,
        });
      }
      return { success: false, data: [] };
    }),
  ]);

  if (!result || !result.success || !result.data) {
    notFound();
  }

  const exercise = result.data;
  const planExercises = exercisesResult.success
    ? exercisesResult.data || []
    : [];

  return (
    <Suspense fallback={<div>Loading exercise details...</div>}>
      <ExerciseDetailClient exercise={exercise} planExercises={planExercises} />
    </Suspense>
  );
}
