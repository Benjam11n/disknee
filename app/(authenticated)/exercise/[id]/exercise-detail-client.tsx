"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Play, Clock, Target, Lock, Video } from "lucide-react";
import { ExerciseDifficulty, Exercise } from "@prisma/client";
import { ROUTES } from "@/lib/constants/routes";
import { getDifficultyBadgeVariant, getDifficultyColor } from "@/lib/utils";
import { canStartExercise } from "@/lib/utils/exercise-utils";
import { ModelVideo } from "@/components/shared/model-video";

interface ExerciseDetailClientProps {
  exercise: Exercise;
  planExercises: Exercise[];
}

export function ExerciseDetailClient({
  exercise,
  planExercises,
}: ExerciseDetailClientProps) {
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const canStart = canStartExercise(planExercises, exercise.id);
  const isLocked = !canStart && !exercise.done;

  const handleStartExercise = () => {
    router.push(ROUTES.CALL.detail(exercise.id));
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
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

        {/* Demo Video Section */}
        {exercise.videoUrl && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                <CardTitle className="text-xl">Demo Video</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <ModelVideo
                    isPlaying={isVideoPlaying}
                    exerciseType={exercise.title.toLowerCase()}
                    videoUrl={exercise.videoUrl}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Perfect Form Guide</h4>
                    <p className="text-sm text-muted-foreground">
                      Watch this demonstration to understand the correct form
                      and technique for this exercise. Follow along to ensure
                      you're performing the movements safely and effectively.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {isVideoPlaying ? "Pause Video" : "Play Video"}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      💡 Tip: Watch the video at least once before starting the
                      exercise.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              {isLocked ? (
                <Button
                  disabled={true}
                  size="lg"
                  className="w-full sm:w-auto"
                  variant="outline"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Locked
                </Button>
              ) : (
                <Button
                  onClick={handleStartExercise}
                  disabled={exercise.done}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {exercise.done ? "Already Completed" : "Start Exercise"}
                </Button>
              )}
              {exercise.done && (
                <p className="text-sm text-muted-foreground mt-2">
                  You have already completed this exercise. Check your dashboard
                  for progress.
                </p>
              )}
              {isLocked && (
                <p className="text-sm text-muted-foreground mt-2">
                  You need to complete the previous exercises in this plan
                  before starting this one.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
