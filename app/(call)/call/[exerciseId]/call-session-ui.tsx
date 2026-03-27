"use client";

import type { Exercise, ShopItem } from "@prisma/client";
import {
  Activity,
  AlertCircle,
  BicepsFlexed,
  CheckCircle2,
  PauseCircle,
  Phone,
  PhoneOff,
  PlayCircle,
  Timer,
  Video,
  VideoOff,
} from "lucide-react";

import { ModelVideo } from "@/components/shared/model-video";
import { VideoStream } from "@/components/shared/video-stream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PoseResult } from "@/lib/types/exercise";
import { formatTime } from "@/lib/utils/date-utils";

export interface ExerciseProgress {
  reps: number;
  currentAngle: number | null;
  holdTime: number;
  targetReps: number | null;
}

interface SessionViewportProps {
  angleLabel: string;
  cameraWarning: boolean;
  crownEmoji: string;
  exerciseComplete: boolean;
  exerciseId?: string;
  glassesEmoji: string;
  isCallActive: boolean;
  isVideoOn: boolean;
  progress: ExerciseProgress;
  repFeedbackText: string;
  showRepFeedback: boolean;
  onCameraDistanceWarning: (tooClose: boolean) => void;
  onPoseUpdate: (data: PoseResult) => void;
}

function ProgressDisplay({
  angleLabel,
  progress,
}: {
  angleLabel: string;
  progress: ExerciseProgress;
}) {
  const percentage = progress.targetReps
    ? (progress.reps / progress.targetReps) * 100
    : 0;

  return (
    <Card className="absolute top-6 left-6 w-64 overflow-hidden border-none bg-background/60 shadow-xl backdrop-blur-md">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Progression
          </span>
          <Badge variant="secondary" className="font-mono">
            {progress.reps} / {progress.targetReps ?? "--"}
          </Badge>
        </div>
        <Progress value={percentage} className="h-1.5" />
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground">
              {angleLabel}
            </span>
            <p className="text-xl font-bold">
              {progress.currentAngle?.toFixed(0) ?? "--"}°
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground">
              Stability
            </span>
            <p className="flex items-center gap-1 text-xl font-bold">
              {progress.holdTime > 0 ? (
                <>
                  <Timer className="h-4 w-4 animate-pulse text-primary" />
                  {progress.holdTime.toFixed(1)}s
                </>
              ) : (
                "--"
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionViewport({
  angleLabel,
  cameraWarning,
  crownEmoji,
  exerciseComplete,
  exerciseId,
  glassesEmoji,
  isCallActive,
  isVideoOn,
  progress,
  repFeedbackText,
  showRepFeedback,
  onCameraDistanceWarning,
  onPoseUpdate,
}: SessionViewportProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900 shadow-2xl">
      <VideoStream
        isVideoOn={isVideoOn}
        isCallActive={isCallActive}
        exerciseId={exerciseId}
        crownSettings={{ emoji: crownEmoji }}
        glassesSettings={{ emoji: glassesEmoji }}
        onCameraDistanceWarning={onCameraDistanceWarning}
        onPoseUpdate={onPoseUpdate}
      />

      {!isVideoOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
          <VideoOff className="mb-4 h-12 w-12 opacity-20" />
          <p className="text-sm font-medium">Camera focus paused</p>
        </div>
      )}

      {isCallActive && (
        <>
          <ProgressDisplay angleLabel={angleLabel} progress={progress} />
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 border-red-500/20 bg-red-500/10 px-2 py-1 text-red-500"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              LIVE ANALYSIS
            </Badge>
          </div>
        </>
      )}

      {showRepFeedback && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
          <Card className="animate-in zoom-in border-none bg-emerald-500/95 text-white shadow-2xl fade-in duration-300">
            <CardContent className="flex flex-col items-center px-10 py-6">
              <CheckCircle2 className="mb-2 h-10 w-10 opacity-80" />
              <span className="text-3xl font-black">{repFeedbackText}</span>
            </CardContent>
          </Card>
        </div>
      )}

      {cameraWarning && (
        <div className="pointer-events-none absolute right-0 bottom-10 left-0 z-50 flex justify-center">
          <Badge
            variant="destructive"
            className="animate-bounce px-6 py-2 text-sm shadow-xl"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Please step back for better tracking
          </Badge>
        </div>
      )}

      {exerciseComplete && (
        <div className="animate-in absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm fade-in duration-500">
          <Card className="w-80 border-emerald-500/20 bg-background/90 text-center shadow-2xl backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <BicepsFlexed className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="mb-1 text-2xl font-bold">Goal Achieved!</h3>
              <p className="text-sm text-muted-foreground">
                Target reps completed. Great work on your recovery journey.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export function ReferenceViewport({
  exerciseType,
  isModelPlaying,
  onTogglePlayback,
}: {
  exerciseType: string;
  isModelPlaying: boolean;
  onTogglePlayback: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900 shadow-2xl">
      <ModelVideo isPlaying={isModelPlaying} exerciseType={exerciseType} />
      <div className="pointer-events-none absolute right-6 bottom-6 left-6 flex items-center justify-between">
        <Badge
          variant="secondary"
          className="pointer-events-auto border-none bg-background/40 px-3 py-1.5 backdrop-blur-md"
        >
          Reference Guide
        </Badge>
        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/40 backdrop-blur-md hover:bg-background/60"
            onClick={onTogglePlayback}
          >
            {isModelPlaying ? <PauseCircle /> : <PlayCircle />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SessionControls({
  exercise,
  isCallActive,
  isVideoOn,
  onEnd,
  onStart,
  onToggleVideo,
  sessionTime,
}: {
  exercise: Exercise;
  isCallActive: boolean;
  isVideoOn: boolean;
  onEnd: () => void;
  onStart: () => void;
  onToggleVideo: () => void;
  sessionTime: number;
}) {
  return (
    <footer className="flex h-24 items-center border-t border-white/5 bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight">
              {exercise.title}
            </h2>
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <Badge variant="outline" className="h-4 px-1 text-[10px]">
                {exercise.difficulty}
              </Badge>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" /> {exercise.estimatedMins} MIN
              </div>
              <div className="flex items-center gap-1 font-mono text-primary/80">
                <Timer className="h-3 w-3" />
                {formatTime.duration?.(sessionTime) ?? sessionTime}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isCallActive ? (
            <Button
              onClick={onStart}
              className="h-12 rounded-full bg-primary px-8 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
            >
              <Phone className="mr-2 h-5 w-5 fill-current" />
              Begin Session
            </Button>
          ) : (
            <div className="flex items-center gap-3 rounded-full border border-white/5 bg-zinc-900/50 p-1.5">
              <Button
                onClick={onToggleVideo}
                variant="ghost"
                className={`h-11 w-11 rounded-full p-0 ${
                  !isVideoOn
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    : "hover:bg-white/10"
                }`}
              >
                {isVideoOn ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={onEnd}
                className="h-11 rounded-full bg-red-600 px-6 font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700"
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                Complete
              </Button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
