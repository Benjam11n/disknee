"use client";

import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Difficulty, Exercise } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

interface ExerciseItemProps {
  exercise: Exercise;
  isDisabled?: boolean;
}

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

function difficultyStyles(difficulty?: Difficulty) {
  switch (difficulty) {
    case Difficulty.EASY:
      return {
        row: "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/50",
        toggle: "border-emerald-500 text-emerald-600 dark:text-emerald-50",
        toggleChecked:
          "bg-emerald-500 text-emerald-50 border-emerald-600 dark:border-emerald-700",
      };
    case Difficulty.MODERATE:
      return {
        row: "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/50",
        toggle: "border-amber-500 text-amber-600 dark:text-amber-50",
        toggleChecked:
          "bg-amber-500 text-amber-50 border-amber-600 dark:border-amber-700",
      };
    case Difficulty.HARD:
      return {
        row: "border-l-4 border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/50",
        toggle: "border-rose-500 text-rose-600 dark:text-rose-50",
        toggleChecked:
          "bg-rose-500 text-rose-50 border-rose-600 dark:border-rose-700",
      };
    default:
      return {
        row: "border-l-4 border-l-muted dark:border-l-muted-foreground",
        toggle: "border-muted text-muted-foreground dark:text-muted-foreground",
        toggleChecked:
          "bg-muted text-muted-foreground dark:bg-muted-foreground",
      };
  }
}

export function ExerciseItem({
  exercise,
  isDisabled = false,
}: ExerciseItemProps) {
  const router = useRouter();
  const styles = difficultyStyles(exercise.difficulty);

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
            className={`font-medium transition-colors ${
              exercise.done
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {exercise.title}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {typeof exercise.estimatedMins === "number" && (
              <span className="text-xs text-muted-foreground">
                {exercise.estimatedMins} min
              </span>
            )}
            {exercise.difficulty && (
              <Badge
                variant={difficultyBadgeVariant(exercise.difficulty)}
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
          onClick={() => router.push(ROUTES.CALLS)}
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
