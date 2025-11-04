import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getExerciseByIdAction } from "@/lib/actions/exercises";
import { ExerciseDetailClient } from "./ExerciseDetailClient";

export default async function ExerciseDetailPage({ params }: RouteParams) {
  const { id } = await params;

  const result = await getExerciseByIdAction({ id });

  if (!result || !result.success || !result.data) {
    notFound();
  }

  const exercise = result.data;

  return (
    <Suspense fallback={<div>Loading exercise details...</div>}>
      <ExerciseDetailClient exercise={exercise} />
    </Suspense>
  );
}
