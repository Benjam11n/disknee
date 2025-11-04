"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Play, Clock, Target } from "lucide-react";
import { ExerciseDifficulty, Exercise } from "@prisma/client";
import { ROUTES } from "@/lib/constants/routes";
import { getDifficultyBadgeVariant, getDifficultyColor } from "@/lib/utils";

interface ExerciseDetailClientProps {
  exercise: Exercise;
}

export function ExerciseDetailClient({ exercise }: ExerciseDetailClientProps) {
  const router = useRouter();

  const handleStartExercise = () => {
    router.push(ROUTES.CALL.detail(exercise.id));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Exercises
        </Button>

        {/* Exercise Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{exercise.title}</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {exercise.estimatedMins} minutes
                    </span>
                  </div>
                  <Badge
                    variant={getDifficultyBadgeVariant(exercise.difficulty)}
                    className="uppercase"
                  >
                    {exercise.difficulty.toLowerCase()}
                  </Badge>
                  {exercise.done && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exercise Description Placeholder */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                About this exercise
              </h3>
              <p className="text-muted-foreground">
                This exercise is designed to improve your strength and mobility.
                Follow the perfect form demonstration on the right side of your
                screen while performing the movements.
              </p>
            </div>

            <Separator />

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Position yourself in front of the camera</li>
                <li>Follow the perfect form demonstration</li>
                <li>Maintain proper posture throughout the exercise</li>
                <li>Start the session when you&apos;re ready</li>
                <li>Complete all repetitions with good form</li>
              </ol>
            </div>

            <Separator />

            {/* Difficulty Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Difficulty Level</h3>
              <div
                className={`flex items-center gap-2 ${getDifficultyColor(
                  exercise.difficulty
                )}`}
              >
                <Target className="h-5 w-5" />
                <span className="font-medium capitalize">
                  {exercise.difficulty.toLowerCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {exercise.difficulty === ExerciseDifficulty.EASY &&
                    "- Great for beginners"}
                  {exercise.difficulty === ExerciseDifficulty.MODERATE &&
                    "- Some experience recommended"}
                  {exercise.difficulty === ExerciseDifficulty.HARD &&
                    "- Challenging workout"}
                </span>
              </div>
            </div>

            {/* Start Exercise Button */}
            <div className="pt-4">
              <Button
                onClick={handleStartExercise}
                disabled={exercise.done}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Play className="h-4 w-4 mr-2" />
                {exercise.done ? "Already Completed" : "Start Exercise"}
              </Button>
              {exercise.done && (
                <p className="text-sm text-muted-foreground mt-2">
                  You have already completed this exercise. Check your dashboard
                  for progress.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}