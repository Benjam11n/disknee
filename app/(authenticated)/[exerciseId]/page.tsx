import { notFound } from "next/navigation";
import CallExerciseClient from "./CallExerciseClient";
import { getExerciseByIdAction } from "@/lib/actions/exercises";

export default async function CallExercisePage({ params }: RouteParams) {
  const { exerciseId } = await params;

  const exerciseResponse = await getExerciseByIdAction({ id: exerciseId });

  if (!exerciseResponse.success || !exerciseResponse.data) {
    notFound();
  }

  return <CallExerciseClient exercise={exerciseResponse.data} />;
}
