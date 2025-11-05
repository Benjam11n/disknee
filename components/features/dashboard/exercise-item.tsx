"use client";

import { Play, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Exercise } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { getDifficultyBadgeVariant, getDifficultyStyles } from "@/lib/utils";

interface ExerciseItemProps {
  exercise: Exercise;
  isDisabled?: boolean;
}

export function ExerciseItem({
  exercise,
  isDisabled = false,
}: ExerciseItemProps) {
  const router = useRouter();
  const styles = getDifficultyStyles(exercise.difficulty);

  return (
    <li
      className={`group flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:shadow-sm ${styles.row}`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Checkbox - display only, not interactive */}
        <Checkbox
          checked={exercise.done}
          disabled={true}
          className="pointer-events-none opacity-100"
        />

        {/* Exercise details */}
        <div className="flex flex-col leading-tight flex-1">
          <span
            className={`font-medium transition-colors cursor-pointer hover:text-primary ${
              exercise.done
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
            onClick={() => router.push(ROUTES.EXERCISE.detail(exercise.id))}
          >
            {exercise.title}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {typeof exercise.estimatedMins === "number" && (
              <span className="text-xs text-muted-foreground">
                {exercise.estimatedMins} min
              </span>
            )}
            {exercise.videoUrl && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Video className="h-3 w-3" />
                <span>Video</span>
              </div>
            )}
            {exercise.difficulty && (
              <Badge
                variant={getDifficultyBadgeVariant(exercise.difficulty)}
                className="text-[10px] uppercase tracking-wider px-2 py-0.5"
              >
                {exercise.difficulty.toLowerCase()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Open button */}
      {isDisabled && !exercise.done ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="group-hover:bg-accent pointer-events-none"
                aria-label={`Open ${exercise.title}`}
                disabled={exercise.done || isDisabled}
              >
                <div className="flex items-center gap-1 text-xs">
                  <Play className="h-3 w-3" />
                  <span>Start</span>
                </div>
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Only the next exercise in sequence can be started</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="group-hover:bg-accent"
          aria-label={`Open ${exercise.title}`}
          onClick={() => router.push(ROUTES.EXERCISE.detail(exercise.id))}
          disabled={exercise.done || isDisabled}
        >
          <div className="flex items-center gap-1 text-xs">
            <Play className="h-3 w-3" />
            <span>Start</span>
          </div>
        </Button>
      )}
    </li>
  );
}
