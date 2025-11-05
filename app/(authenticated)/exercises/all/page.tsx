import { getExercisesAction } from "@/lib/actions/exercises";
import { auth } from "@/lib/auth";
import { ExerciseItem } from "@/components/features/dashboard/exercise-item";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Video, Play, Clock, Target } from "lucide-react";
import { ExerciseDifficulty } from "@prisma/client";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ROUTES } from "@/lib/constants/routes";
import { getDifficultyBadgeVariant, getDifficultyColor } from "@/lib/utils";

async function getAllExercises(searchParams?: {
  search?: string;
  difficulty?: string;
  page?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return [];
  }

  const page = parseInt(searchParams?.page || "1");
  const limit = 50;

  const response = await getExercisesAction({
    page,
    limit,
    difficulty: searchParams?.difficulty as ExerciseDifficulty,
  });

  if (!response.success || !response.data) {
    return [];
  }

  // Filter by search term if provided
  let exercises = response.data;
  if (searchParams?.search) {
    const searchTerm = searchParams.search.toLowerCase();
    exercises = exercises.filter(exercise =>
      exercise.title.toLowerCase().includes(searchTerm)
    );
  }

  return exercises;
}

export default async function AllExercisesPage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    difficulty?: string;
    page?: string;
  };
}) {
  const exercises = await getAllExercises(searchParams);

  // Count exercises with videos
  const exercisesWithVideo = exercises.filter(ex => ex.videoUrl).length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">All Exercises</h1>
          <p className="text-muted-foreground mt-2">
            Browse through all available exercises. {exercisesWithVideo} of {exercises.length} exercises have demonstration videos.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search exercises..."
              className="pl-10"
              name="search"
              defaultValue={searchParams?.search}
            />
          </div>
          <Select name="difficulty" defaultValue={searchParams?.difficulty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              <SelectItem value={ExerciseDifficulty.EASY}>Easy</SelectItem>
              <SelectItem value={ExerciseDifficulty.MODERATE}>Moderate</SelectItem>
              <SelectItem value={ExerciseDifficulty.HARD}>Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={<div>Loading exercises...</div>}>
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{exercise.title}</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {exercise.estimatedMins} minutes
                        </span>
                      </div>
                    </div>

                    {/* Video indicator */}
                    {exercise.videoUrl && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Video className="h-5 w-5" />
                          <span className="text-sm font-medium">Demo Video Available</span>
                        </div>
                      </div>
                    )}

                    {/* Difficulty and Status */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={getDifficultyBadgeVariant(exercise.difficulty)}
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

                    {/* Start Button */}
                    <a
                      href={ROUTES.EXERCISE.detail(exercise.id)}
                      className="w-full"
                    >
                      <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2">
                        <Play className="h-4 w-4" />
                        {exercise.done ? "Review Exercise" : "Start Exercise"}
                      </button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Suspense>
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchParams?.search || searchParams?.difficulty
                ? "No exercises found matching your criteria."
                : "No exercises available yet."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}