import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, CheckCircle, Circle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise } from "@prisma/client";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";

interface ExerciseProgressProps {
  exercises: Exercise[];
  weeklyTarget: number;
  weeklyTotalMins: number;
  onStartExercise?: (exerciseId: string) => void;
}

export function ExerciseProgress({
  exercises,
  weeklyTarget,
  weeklyTotalMins,
  onStartExercise,
}: ExerciseProgressProps) {
  const completedCount = exercises.filter((ex) => ex.done).length;
  const totalCount = exercises.length;
  const completionPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const remainingTime =
    weeklyTotalMins -
    exercises.reduce((acc, ex) => acc + (ex.done ? ex.estimatedMins : 0), 0);

  // Group exercises by status
  const completedExercises = exercises.filter((ex) => ex.done);
  const upcomingExercises = exercises.filter((ex) => !ex.done);

  // todo: move these to constants or utils file
  const getMotivationalMessage = () => {
    if (completionPercentage === 100)
      return "🎉 Perfect week! All exercises completed!";
    if (completionPercentage >= 80)
      return "💪 Almost there! You're doing amazing!";
    if (completionPercentage >= 50)
      return "⚡ Great progress! Keep pushing forward!";
    if (completionPercentage >= 25) return "🌟 Good start! You've got this!";
    return "🚀 Ready to begin? Let's tackle today's exercises!";
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Exercises
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {getMotivationalMessage()}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-sm px-3 py-1",
              completionPercentage === 100
                ? "bg-green-100 text-green-800 border-green-200"
                : completionPercentage >= 50
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-muted text-muted-foreground"
            )}
          >
            {completedCount}/{totalCount} completed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Weekly Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(completionPercentage)}% complete
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {completedCount} of {totalCount} exercises
            </span>
            <span>
              {remainingTime > 0 ? `${remainingTime} mins left` : "All done!"}
            </span>
          </div>
        </div>

        {/* Time Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {weeklyTotalMins}
            </div>
            <div className="text-xs text-muted-foreground">Total Minutes</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(weeklyTarget * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Target Progress</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {completedExercises.reduce(
                (acc, ex) => acc + ex.estimatedMins,
                0
              )}
            </div>
            <div className="text-xs text-muted-foreground">Minutes Done</div>
          </div>
        </div>

        {/* Exercise Lists */}
        {exercises.length > 0 && (
          <div className="space-y-4">
            {/* Completed Exercises */}
            {completedExercises.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed ({completedExercises.length})
                </h4>
                <div className="space-y-2">
                  {completedExercises.slice(0, 3).map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm line-through text-muted-foreground">
                          {exercise.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {exercise.estimatedMins} min
                      </span>
                    </div>
                  ))}
                  {completedExercises.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{completedExercises.length - 3} more completed
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Exercises */}
            {upcomingExercises.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  Upcoming ({upcomingExercises.length})
                </h4>
                <div className="space-y-2">
                  {upcomingExercises.slice(0, 3).map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {exercise.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {exercise.estimatedMins} min
                        </div>
                        {onStartExercise && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onStartExercise(exercise.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {upcomingExercises.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{upcomingExercises.length - 3} more to do
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          {completionPercentage < 100 &&
            upcomingExercises.length > 0 &&
            onStartExercise && (
              <Button
                className="flex-1"
                onClick={() => onStartExercise(upcomingExercises[0].id)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Next Exercise
              </Button>
            )}
          {completionPercentage > 0 && (
            <Button variant="outline" className="flex-1">
              <Link href={ROUTES.EXERCISE.BASE}>View All Exercises</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
