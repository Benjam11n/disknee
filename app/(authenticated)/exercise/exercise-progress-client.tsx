'use client';

import { useRouter } from 'next/navigation';
import { ExerciseProgress } from '@/components/features/dashboard/exercise-progress';
import type { Exercise } from '@prisma/client';
import { ROUTES } from '@/lib/constants/routes';

interface ExerciseProgressClientProps {
  exercises: Exercise[];
  weeklyTarget: number;
  weeklyTotalMins: number;
}

export function ExerciseProgressClient({
  exercises,
  weeklyTarget,
  weeklyTotalMins,
}: ExerciseProgressClientProps) {
  const router = useRouter();

  const handleStartExercise = (exerciseId: string) => {
    router.push(ROUTES.CALL_DETAIL(exerciseId));
  };

  return (
    <ExerciseProgress
      exercises={exercises}
      weeklyTarget={weeklyTarget}
      weeklyTotalMins={weeklyTotalMins}
      onStartExercise={handleStartExercise}
    />
  );
}
