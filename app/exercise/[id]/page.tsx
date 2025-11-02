"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Play, Clock, Target } from "lucide-react";
import { Difficulty, Exercise } from "@prisma/client";
import { ROUTES } from "@/lib/constants/routes";
import { getExerciseByIdAction } from "@/lib/actions/exercises";
import { Skeleton } from "@/components/ui/skeleton";

function difficultyBadgeVariant(difficulty?: Difficulty) {
  switch (difficulty) {
    case Difficulty.EASY:
      return "default";
    case Difficulty.MODERATE:
      return "secondary";
    case Difficulty.HARD:
      return "destructive";
    default:
      return "outline";
  }
}

function getDifficultyColor(difficulty?: Difficulty) {
  switch (difficulty) {
    case Difficulty.EASY:
      return "text-emerald-600 dark:text-emerald-400";
    case Difficulty.MODERATE:
      return "text-amber-600 dark:text-amber-400";
    case Difficulty.HARD:
      return "text-rose-600 dark:text-rose-400";
    default:
      return "text-muted-foreground";
  }
}

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
        const result = await getExerciseByIdAction({ id: exerciseId });

        if (result && !("error" in result)) {
          setExercise(result as Exercise);
        } else {
          setError("Exercise not found");
        }
      } catch (err) {
        setError("Failed to load exercise");
        console.error("Error fetching exercise:", err);
      } finally {
        setLoading(false);
      }
    };

    if (exerciseId) {
      fetchExercise();
    }
  }, [exerciseId]);

  const handleStartExercise = () => {
    router.push(ROUTES.CALL.detail(exerciseId));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-muted-foreground mb-4">
            {error || "Exercise not found"}
          </h1>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
                    variant={difficultyBadgeVariant(exercise.difficulty)}
                    className="uppercase"
                  >
                    {exercise.difficulty.toLowerCase()}
                  </Badge>
                  {exercise.done && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
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
              <h3 className="text-lg font-semibold mb-2">About this exercise</h3>
              <p className="text-muted-foreground">
                This exercise is designed to improve your strength and mobility.
                Follow the perfect form demonstration on the right side of your screen
                while performing the movements.
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
              <div className={`flex items-center gap-2 ${getDifficultyColor(exercise.difficulty)}`}>
                <Target className="h-5 w-5" />
                <span className="font-medium capitalize">{exercise.difficulty.toLowerCase()}</span>
                <span className="text-sm text-muted-foreground">
                  {exercise.difficulty === Difficulty.EASY && "- Great for beginners"}
                  {exercise.difficulty === Difficulty.MODERATE && "- Some experience recommended"}
                  {exercise.difficulty === Difficulty.HARD && "- Challenging workout"}
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
                  You have already completed this exercise. Check your dashboard for progress.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}