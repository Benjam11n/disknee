"use client";

import type { Exercise, ShopItem } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ReflectionDialog } from "@/components/shared/reflection-dialog";
import {
  createExerciseSessionAction,
  updateExerciseSessionAction,
} from "@/lib/actions/exercise-sessions";
import { updateExerciseDoneAction } from "@/lib/actions/exercises";
import { createReflectionAction } from "@/lib/actions/reflections";
import { ROUTES } from "@/lib/constants/routes";
import { logger } from "@/lib/logger";
import type { PoseResult } from "@/lib/types/exercise";

import {
  ReferenceViewport,
  SessionControls,
  SessionViewport,
} from "./call-session-ui";
import type { ExerciseProgress } from "./call-session-ui";

interface CallExerciseClientProps {
  exercise: Exercise;
  equippedItems?: ShopItem[];
}

const EMPTY_ITEMS: ShopItem[] = [];
const INITIAL_PROGRESS: ExerciseProgress = {
  currentAngle: null,
  holdTime: 0,
  reps: 0,
  targetReps: null,
};

function getAngleLabel(exerciseType: string | null): string {
  if (exerciseType === "knee-extension") {
    return "Knee Flexion";
  }
  if (exerciseType === "calf-raises") {
    return "Ankle Angle";
  }
  if (exerciseType === "squat" || exerciseType === "simple-squat") {
    return "Hip Angle";
  }
  if (exerciseType === "hip-abduction") {
    return "Abduction";
  }
  if (exerciseType === "step-down") {
    return "Knee Angle";
  }
  return "Angle";
}

export function CallExerciseClient({
  exercise,
  equippedItems = EMPTY_ITEMS,
}: CallExerciseClientProps) {
  const router = useRouter();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isModelPlaying, setIsModelPlaying] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const [exerciseSessionId, setExerciseSessionId] = useState<string | null>(
    null
  );
  const [progress, setProgress] = useState<ExerciseProgress>(INITIAL_PROGRESS);
  const [repFeedback, setRepFeedback] = useState({ show: false, text: "" });
  const [cameraWarning, setCameraWarning] = useState(false);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [sessionTick, setSessionTick] = useState(0);

  const sessionStartTime = useRef<number | null>(null);
  const prevRepsRef = useRef(0);

  const cosmetics = useMemo(
    () => ({
      glasses: equippedItems.find(
        (item) =>
          item.type === "ACCESSORY" ||
          item.name.toLowerCase().includes("glasses") ||
          item.name.toLowerCase().includes("shades")
      ),
      hat: equippedItems.find(
        (item) =>
          item.type === "HAT" ||
          item.name.toLowerCase().includes("hat") ||
          item.name.toLowerCase().includes("crown")
      ),
    }),
    [equippedItems]
  );

  const angleLabel = useMemo(
    () => getAngleLabel(exercise.type),
    [exercise.type]
  );
  const sessionTime = useMemo(() => {
    if (!isCallActive || sessionStartTime.current === null) {
      return 0;
    }
    return Math.floor((Date.now() - sessionStartTime.current) / 1000);
  }, [isCallActive, sessionTick]);

  useEffect(() => {
    if (!isCallActive) {
      sessionStartTime.current = null;
      setSessionTick(0);
      return;
    }

    if (sessionStartTime.current === null) {
      sessionStartTime.current = Date.now();
    }

    const interval = setInterval(() => {
      setSessionTick((tick) => tick + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  useEffect(() => {
    if (!repFeedback.show) {
      return;
    }

    const timer = setTimeout(() => {
      setRepFeedback({ show: false, text: "" });
    }, 1500);

    return () => clearTimeout(timer);
  }, [repFeedback.show]);

  const startCall = async () => {
    if (!exercise.type) {
      toast.error("Exercise type not configured.");
      return;
    }

    setProgress(INITIAL_PROGRESS);
    setExerciseComplete(false);
    prevRepsRef.current = 0;
    setIsCallActive(true);

    try {
      const response = await createExerciseSessionAction({
        accuracy: 0,
        exerciseId: exercise.id,
        repsCompleted: 0,
        startedAt: new Date().toISOString(),
      });

      if (response.success && response.data) {
        setExerciseSessionId(response.data.id);
      }
    } catch (error) {
      logger.error(error);
      toast.error("Failed to start session");
    }
  };

  const endCall = async () => {
    setIsCallActive(false);
    if (!exerciseSessionId) {
      return;
    }

    try {
      await updateExerciseSessionAction(exerciseSessionId, {
        accuracy: 85,
        duration: sessionTime,
        endedAt: new Date(),
        maxAccuracy: 90,
        repsCompleted: progress.reps,
      });
      await updateExerciseDoneAction({ done: true, id: exercise.id });
      toast.success("Great session!");
      setShowReflection(true);
    } catch (error) {
      logger.error(error);
    }
  };

  const handlePoseUpdate = useCallback(
    (result: PoseResult) => {
      const newReps = result.exercise_state?.reps ?? 0;
      const target = result.exercise_state?.target_reps ?? null;
      const primaryAngleKey = result.angles
        ? Object.keys(result.angles)[0]
        : null;
      const angle =
        (primaryAngleKey ? result.angles?.[primaryAngleKey] : null) ??
        result.exercise_state?.current_angle ??
        null;
      const hold = result.exercise_state?.hold_time ?? 0;

      if (newReps > prevRepsRef.current) {
        setRepFeedback({ show: true, text: `Rep ${newReps}!` });
        if (target && newReps >= target && !exerciseComplete) {
          setExerciseComplete(true);
          toast.info(
            "Target reached! Finish the session whenever you're ready."
          );
        }
      }

      setProgress({
        currentAngle: angle,
        holdTime: hold,
        reps: newReps,
        targetReps: target,
      });
      prevRepsRef.current = newReps;
    },
    [exerciseComplete]
  );

  const handleReflectionSubmit = async (reflection: {
    rating: number;
    fatigue: number;
    feedback?: string;
  }) => {
    if (!exerciseSessionId) {
      toast.error("Session not found.");
      return;
    }

    try {
      await createReflectionAction({
        exerciseSessionId,
        fatigue: reflection.fatigue,
        feedback: reflection.feedback,
        rating: reflection.rating,
      });
      toast.success("Progress saved!");
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      logger.error(error);
      toast.error("Failed to save reflection");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-zinc-950">
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2 lg:p-6">
        <SessionViewport
          angleLabel={angleLabel}
          cameraWarning={cameraWarning}
          crownEmoji={cosmetics.hat?.icon || "👑"}
          exerciseComplete={exerciseComplete}
          exerciseId={exercise.type || undefined}
          glassesEmoji={cosmetics.glasses?.icon || "🕶️"}
          isCallActive={isCallActive}
          isVideoOn={isVideoOn}
          progress={progress}
          repFeedbackText={repFeedback.text}
          showRepFeedback={repFeedback.show}
          onCameraDistanceWarning={setCameraWarning}
          onPoseUpdate={handlePoseUpdate}
        />

        <ReferenceViewport
          exerciseType={exercise.type || "knee-extension"}
          isModelPlaying={isModelPlaying}
          onTogglePlayback={() => setIsModelPlaying((playing) => !playing)}
        />
      </div>

      <SessionControls
        exercise={exercise}
        isCallActive={isCallActive}
        isVideoOn={isVideoOn}
        onEnd={endCall}
        onStart={startCall}
        onToggleVideo={() => setIsVideoOn((enabled) => !enabled)}
        sessionTime={sessionTime}
      />

      <ReflectionDialog
        isOpen={showReflection}
        sessionData={{
          accuracy: 85,
          duration: sessionTime,
          repsCompleted: progress.reps,
        }}
        onSubmit={handleReflectionSubmit}
        onSkip={() => {
          setShowReflection(false);
          router.push(ROUTES.DASHBOARD);
        }}
      />
    </div>
  );
}
