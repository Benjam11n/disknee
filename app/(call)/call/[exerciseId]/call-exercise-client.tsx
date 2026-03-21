"use client";

import type { Exercise, ShopItem } from "@prisma/client";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  PlayCircle,
  PauseCircle,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

import { ModelVideo } from "@/components/shared/model-video";
import { ReflectionDialog } from "@/components/shared/reflection-dialog";
import { VideoStream } from "@/components/shared/video-stream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createExerciseSessionAction,
  updateExerciseSessionAction,
} from "@/lib/actions/exercise-sessions";
import { updateExerciseDoneAction } from "@/lib/actions/exercises";
import { createReflectionAction } from "@/lib/actions/reflections";
import { ROUTES } from "@/lib/constants/routes";
import { logger } from "@/lib/logger";
import type { PoseResult } from "@/lib/types/exercise";
import { formatTime } from "@/lib/utils/date-utils";

interface Ex4State {
  reps: number;
  currentAngle: number | null;
  holdTime: number;
}

interface CallExerciseClientProps {
  exercise: Exercise;
  equippedItems?: ShopItem[];
}

export function CallExerciseClient({
  exercise,
  equippedItems = [],
}: CallExerciseClientProps) {
  const router = useRouter();

  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const equippedHat = equippedItems.find(
    (item) =>
      item.type === "HAT" ||
      item.name.toLowerCase().includes("crown") ||
      item.name.toLowerCase().includes("hat")
  );

  // Find equipped glasses/accessory item
  const equippedGlasses = equippedItems.find(
    (item) =>
      item.type === "ACCESSORY" ||
      item.name.toLowerCase().includes("glasses") ||
      item.name.toLowerCase().includes("shades") ||
      item.name.toLowerCase().includes("monocle") ||
      item.name.toLowerCase().includes("eye")
  );
  const [isModelPlaying, setIsModelPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [exerciseSessionId, setExerciseSessionId] = useState<string | null>(
    null
  );
  const [sessionTime, setSessionTime] = useState(0);
  const [ex4State, setEx4State] = useState<Ex4State>({
    currentAngle: null,
    holdTime: 0,
    reps: 0,
  });

  // Feedback states
  const [repFeedback, setRepFeedback] = useState<{
    show: boolean;
    text: string;
  }>({
    show: false,
    text: "",
  });
  const [cameraWarning, setCameraWarning] = useState<boolean>(false);
  const [exerciseComplete, setExerciseComplete] = useState<boolean>(false);
  const [targetReps] = useState<number>(10);

  const sessionStartTime = useRef<number | null>(null);
  const prevRepsRef = useRef<number>(0);

  // Get angle label based on exercise type
  const getAngleLabel = (exerciseType: string | undefined | null) => {
    switch (exerciseType) {
      case "knee-extension": {
        return "Knee Angle";
      }
      case "calf-raises": {
        return "Ankle Angle";
      }
      case "squat": {
        return "Hip/Knee Angle";
      }
      case "simple-squat": {
        return "Hip Angle";
      }
      case "hip-abduction": {
        return "Hip Angle";
      }
      case "step-down": {
        return "Knee/Hip Angle";
      }
      default: {
        return "Angle";
      }
    }
  };

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCallActive) {
      // Start timer if not already started
      if (!sessionStartTime.current) {
        sessionStartTime.current = Date.now();
      }
      interval = setInterval(() => {
        setSessionTime(
          Math.floor((Date.now() - sessionStartTime.current!) / 1000)
        );
      }, 1000);
    } else {
      // Reset start time when call ends
      sessionStartTime.current = null;
      setSessionTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCallActive]);

  // Handle rep completion feedback auto-hide
  useEffect(() => {
    if (repFeedback.show) {
      const timer = setTimeout(() => {
        setRepFeedback({ show: false, text: "" });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [repFeedback.show]);

  // Handle camera warning auto-hide
  useEffect(() => {
    if (cameraWarning) {
      const timer = setTimeout(() => {
        setCameraWarning(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cameraWarning]);

  const startCall = async () => {
    // Check if exercise type is set
    if (!exercise.type) {
      toast.error(
        `Exercise type not configured for "${exercise.title}". Please contact support.`
      );
      return;
    }

    // Reset all exercise state
    setEx4State({
      currentAngle: null,
      holdTime: 0,
      reps: 0,
    });
    setRepFeedback({ show: false, text: "" });
    setCameraWarning(false);
    setExerciseComplete(false);
    prevRepsRef.current = 0;

    setIsCallActive(true);
    setIsRecording(true);
    try {
      const exerciseSession = await createExerciseSessionAction({
        accuracy: 0,
        exerciseId: exercise.id,
        repsCompleted: 0,
        startedAt: new Date().toISOString(),
      });
      if (exerciseSession.success && exerciseSession.data) {
        setExerciseSessionId(exerciseSession.data.id);
      }
    } catch (error) {
      logger.error(error);
      toast.error("Failed to start session");
    }
  };

  const endCall = async () => {
    setIsCallActive(false);
    setIsRecording(false);
    if (exerciseSessionId) {
      try {
        await updateExerciseSessionAction(exerciseSessionId, {
          accuracy: 85,
          duration: sessionTime,
          endedAt: new Date(),
          maxAccuracy: 90,
        });
        await updateExerciseDoneAction({ done: true, id: exercise.id });
        toast.success("Session completed!");
        setShowReflection(true);
      } catch (error) {
        logger.error(error);
        toast.error("Failed to end session");
      }
    }
  };

  const handleCameraDistanceWarning = useCallback((tooClose: boolean) => {
    setCameraWarning(tooClose);
  }, []);

  const handlePoseUpdate = useCallback(
    (result: PoseResult) => {
      const newReps = result.exercise_state?.reps || 0;
      const currentAngle =
        result.angles?.hip ||
        result.angles?.knee ||
        result.angles?.ankle ||
        result.exercise_state?.current_angle ||
        null;
      const holdTime = result.exercise_state?.hold_time || 0;

      // Check if a new rep was completed
      if (newReps > prevRepsRef.current) {
        setRepFeedback({
          show: true,
          text: `Rep ${newReps}! 🎉`,
        });

        // Check if exercise is complete
        if (newReps >= targetReps && !exerciseComplete) {
          setExerciseComplete(true);
        }
      }

      setEx4State({
        currentAngle,
        holdTime,
        reps: newReps,
      });

      prevRepsRef.current = newReps;
    },
    [targetReps, exerciseComplete]
  );

  const handleReflectionSubmit = async (reflection: {
    rating: number;
    fatigue: number;
    feedback?: string;
  }) => {
    try {
      await createReflectionAction({
        exerciseSessionId: exerciseSessionId!,
        fatigue: reflection.fatigue,
        feedback: reflection.feedback,
        rating: reflection.rating,
      });
      toast.success("Reflection saved!");
      setShowReflection(false);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      logger.error(error);
      toast.error("Failed to save reflection");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
        {/* User Video */}
        <Card className="relative bg-black overflow-hidden">
          <VideoStream
            isVideoOn={isVideoOn}
            isCallActive={isCallActive}
            exerciseId={exercise.type || undefined}
            crownSettings={{
              emoji: equippedHat?.icon || "👑",
              size: equippedHat ? 60 : 60, // Can be customized per item in future
              yOffset: equippedHat ? -70 : -70, // Can be customized per item in future
            }}
            glassesSettings={{
              emoji: equippedGlasses?.icon || "🕶️",
              size: equippedGlasses ? 100 : 100, // Can be customized per item in future
              yOffset: equippedGlasses ? 10 : 10, // Slightly lower on face
            }}
            onCameraDistanceWarning={handleCameraDistanceWarning}
            onPoseUpdate={handlePoseUpdate}
          />

          {/* Rep completion feedback overlay */}
          {repFeedback.show && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-green-500/90 text-white px-8 py-6 rounded-2xl shadow-2xl transform scale-110 animate-pulse">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {repFeedback.text}
                  </div>
                  <div className="text-lg opacity-90">Great job!</div>
                </div>
              </div>
            </div>
          )}

          {/* Camera distance warning overlay */}
          {cameraWarning && (
            <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none">
              <div className="bg-yellow-500/90 text-black px-6 py-3 rounded-xl shadow-lg animate-pulse">
                <div className="text-center">
                  <div className="text-lg font-bold">
                    Move back from camera!
                  </div>
                  <div className="text-sm opacity-90">You're too close</div>
                </div>
              </div>
            </div>
          )}

          {/* Exercise completion success overlay */}
          {exerciseComplete && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-green-500/95 text-white px-12 py-8 rounded-2xl shadow-2xl transform scale-125 animate-bounce">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-3">🎉 Complete! 🎉</div>
                  <div className="text-2xl mb-2">Target Reached!</div>
                  <div className="text-lg opacity-90">
                    {ex4State.reps} reps done
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overlay for reps, angle, and hold timer */}
          <div className="absolute top-4 left-4 text-white text-lg font-bold bg-black/40 px-3 py-2 rounded-md space-y-1">
            <div>
              {getAngleLabel(exercise.type)}:{" "}
              {ex4State.currentAngle?.toFixed(0) ?? "N/A"}°
            </div>
            <div>Reps: {ex4State.reps}</div>
            <div>Hold Time: {ex4State.holdTime.toFixed(1)}s</div>
          </div>

          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Camera is off</p>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium bg-red-500/20 px-2 py-1 rounded">
                REC
              </span>
            </div>
          )}
        </Card>

        {/* Model Video */}
        <Card className="relative bg-black overflow-hidden">
          <ModelVideo
            isPlaying={isModelPlaying}
            exerciseType={exercise.type || "knee-extension"}
          />
        </Card>
      </div>

      {/* Controls */}
      <div className="border-t bg-background p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{exercise.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <Activity className="h-4 w-4" />{" "}
              {exercise.difficulty.toLowerCase()} | {exercise.estimatedMins} min
              | {formatTime["duration"](sessionTime)}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-3 gap-3">
              {!isCallActive ? (
                <Button
                  onClick={startCall}
                  className="col-span-3 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Phone className="h-5 w-5 mr-2" /> Start Session
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setIsVideoOn((prev) => !prev)}
                    variant={isVideoOn ? "default" : "secondary"}
                    size="lg"
                  >
                    {isVideoOn ? (
                      <VideoOff className="h-5 w-5" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsModelPlaying((prev) => !prev)}
                    variant={isModelPlaying ? "default" : "secondary"}
                    size="lg"
                  >
                    {isModelPlaying ? (
                      <PauseCircle className="h-5 w-5" />
                    ) : (
                      <PlayCircle className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    onClick={endCall}
                    className="bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reflection Dialog */}
      <ReflectionDialog
        isOpen={showReflection}
        sessionData={{
          accuracy: 85,
          duration: sessionTime,
          repsCompleted: ex4State.reps,
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
