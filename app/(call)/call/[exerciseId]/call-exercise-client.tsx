"use client";

/**
 * @file call-exercise-client.tsx
 * @description The core interactive component for real-time rehabilitation sessions.
 * Manages the WebRTC video stream, WebSocket connection for AI pose analysis, 
 * and provides live visual feedback to the patient.
 */

import type { Exercise, ShopItem } from "@prisma/client";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  PlayCircle,
  PauseCircle,
  Activity,
  CheckCircle2,
  AlertCircle,
  Timer,
  BicepsFlexed,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { ModelVideo } from "@/components/shared/model-video";
import { ReflectionDialog } from "@/components/shared/reflection-dialog";
import { VideoStream } from "@/components/shared/video-stream";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  createExerciseSessionAction,
  updateExerciseSessionAction,
} from "@/lib/actions/exercise-sessions";
import { updateExerciseDoneAction } from "@/lib/actions/exercises";
import { createReflectionAction } from "@/lib/actions/reflections";
import { ROUTES } from "@/lib/constants/routes";
import { logger } from "@/lib/logger";
import { formatTime } from "@/lib/utils/date-utils";
import type { PoseResult } from "@/lib/types/exercise";

/**
 * Internal state for the current exercise session
 */
interface ExerciseProgress {
  reps: number;
  currentAngle: number | null;
  holdTime: number;
  targetReps: number | null;
}

interface CallExerciseClientProps {
  exercise: Exercise;
  equippedItems?: ShopItem[];
}

const EMPTY_ITEMS: ShopItem[] = [];

/**
 * CallExerciseClient Component
 * 
 * Provides the main "Session" interface where patients perform exercises.
 * It integrates camera capture with server-side AI for form correction.
 */
export function CallExerciseClient({
  exercise,
  equippedItems = EMPTY_ITEMS,
}: CallExerciseClientProps) {
  const router = useRouter();

  // --- UI & Lifecycle State ---
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isModelPlaying, setIsModelPlaying] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const [exerciseSessionId, setExerciseSessionId] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);

  // --- Exercise Tracking State ---
  const [progress, setProgress] = useState<ExerciseProgress>({
    currentAngle: null,
    holdTime: 0,
    reps: 0,
    targetReps: null,
  });

  // --- Feedback & Overlay State ---
  const [repFeedback, setRepFeedback] = useState<{ show: boolean; text: string }>({
    show: false,
    text: "",
  });
  const [cameraWarning, setCameraWarning] = useState<boolean>(false);
  const [exerciseComplete, setExerciseComplete] = useState<boolean>(false);

  // --- Refs for continuous tracking ---
  const sessionStartTime = useRef<number | null>(null);
  const prevRepsRef = useRef<number>(0);

  /**
   * Identifies cosmetics equipped by the user to apply AR overlays
   */
  const cosmetics = useMemo(() => ({
    hat: equippedItems.find(i => i.type === "HAT" || i.name.toLowerCase().includes("hat") || i.name.toLowerCase().includes("crown")),
    glasses: equippedItems.find(i => i.type === "ACCESSORY" || i.name.toLowerCase().includes("glasses") || i.name.toLowerCase().includes("shades"))
  }), [equippedItems]);

  /**
   * Dynamic labeling for the joint angle being tracked
   */
  const angleLabel = useMemo(() => {
    const type = exercise.type;
    if (type === "knee-extension") return "Knee Flexion";
    if (type === "calf-raises") return "Ankle Angle";
    if (type === "squat" || type === "simple-squat") return "Hip Angle";
    if (type === "hip-abduction") return "Abduction";
    if (type === "step-down") return "Knee Angle";
    return "Angle";
  }, [exercise.type]);

  /**
   * Tracks the session duration
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCallActive) {
      if (!sessionStartTime.current) sessionStartTime.current = Date.now();
      interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - sessionStartTime.current!) / 1000));
      }, 1000);
    } else {
      sessionStartTime.current = null;
      setSessionTime(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isCallActive]);

  /**
   * Auto-hides temporary UI notifications
   */
  useEffect(() => {
    if (repFeedback.show) {
      const timer = setTimeout(() => setRepFeedback({ show: false, text: "" }), 1500);
      return () => clearTimeout(timer);
    }
  }, [repFeedback.show]);

  /**
   * Starts the rehabilitation session:
   * 1. Check for exercise configuration (defensive programming)
   * 2. Initialize fresh state (reps, angles, timers) to clear previous attempts
   * 3. Invoke Server Action to create a Session Record in PostgreSQL (via Prisma)
   * 4. Retrieve and store the session UUID for subsequent progress updates
   * 5. Activate local hardware (camera) and establish WS connection to AI worker
   */
  const startCall = async () => {
    if (!exercise.type) {
      toast.error("Exercise type not configured.");
      return;
    }

    setProgress({ currentAngle: null, holdTime: 0, reps: 0, targetReps: null });
    setExerciseComplete(false);
    prevRepsRef.current = 0;
    setIsCallActive(true);

    try {
      const res = await createExerciseSessionAction({
        accuracy: 0,
        exerciseId: exercise.id,
        repsCompleted: 0,
        startedAt: new Date().toISOString(),
      });
      if (res.success && res.data) setExerciseSessionId(res.data.id);
    } catch (error) {
      logger.error(error);
      toast.error("Failed to start session");
    }
  };

  /**
   * Finalizes the session and triggers the reflection flow
   */
  const endCall = async () => {
    setIsCallActive(false);
    if (!exerciseSessionId) return;

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

  /**
   * Callback from VideoStream when new AI results arrive via WebSocket
   * Step 1: Extract movement metrics (reps, target, angle, hold time) from packet
   * Step 2: Compare current reps with previous state for milestone detection
   * Step 3: Trigger visual feedback/toast notifications on state changes
   * Step 4: Validate against clinical targets to identify session completion
   * Step 5: Update React state to trigger UI re-renders for live feedback cards
   */
  const handlePoseUpdate = useCallback((result: PoseResult) => {
    const newReps = result.exercise_state?.reps || 0;
    const target = result.exercise_state?.target_reps ?? null;
    const angle = result.angles?.[Object.keys(result.angles)[0]] ?? result.exercise_state?.current_angle ?? null;
    const hold = result.exercise_state?.hold_time || 0;

    // Detect rep completion for haptic/visual feedback
    if (newReps > prevRepsRef.current) {
      setRepFeedback({ show: true, text: `Rep ${newReps}!` });
      if (target && newReps >= target && !exerciseComplete) {
        setExerciseComplete(true);
        toast.info("Target reached! Finish the session whenever you're ready.");
      }
    }

    setProgress({ reps: newReps, targetReps: target, currentAngle: angle, holdTime: hold });
    prevRepsRef.current = newReps;
  }, [exerciseComplete]);

  const handleReflectionSubmit = async (reflection: { rating: number; fatigue: number; feedback?: string }) => {
    try {
      await createReflectionAction({
        exerciseSessionId: exerciseSessionId!,
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

  // --- UI Components ---

  const ProgressDisplay = () => {
    const percentage = progress.targetReps ? (progress.reps / progress.targetReps) * 100 : 0;
    return (
      <Card className="absolute top-6 left-6 bg-background/60 backdrop-blur-md border-none shadow-xl w-64 overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progression</span>
            <Badge variant="secondary" className="font-mono">{progress.reps} / {progress.targetReps ?? '--'}</Badge>
          </div>
          <Progress value={percentage} className="h-1.5" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">{angleLabel}</span>
              <p className="text-xl font-bold">{progress.currentAngle?.toFixed(0) ?? '--'}°</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Stability</span>
              <p className="text-xl font-bold flex items-center gap-1">
                {progress.holdTime > 0 ? (
                  <><Timer className="h-4 w-4 text-primary animate-pulse" /> {progress.holdTime.toFixed(1)}s</>
                ) : '--'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-6 overflow-hidden">
        
        {/* Patient Perspective */}
        <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl group">
          <VideoStream
            isVideoOn={isVideoOn}
            isCallActive={isCallActive}
            exerciseId={exercise.type || undefined}
            crownSettings={{ emoji: cosmetics.hat?.icon || "👑" }}
            glassesSettings={{ emoji: cosmetics.glasses?.icon || "🕶️" }}
            onCameraDistanceWarning={setCameraWarning}
            onPoseUpdate={handlePoseUpdate}
          />

          {!isVideoOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
              <VideoOff className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">Camera focus paused</p>
            </div>
          )}

          {isCallActive && <ProgressDisplay />}

          {/* Recording / Active Status */}
          {isCallActive && (
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-500 flex items-center gap-1.5 px-2 py-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE ANALYSIS
              </Badge>
            </div>
          )}

          {/* Minimalist Feedback Overlays */}
          {repFeedback.show && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
              <Card className="bg-emerald-500/95 text-white border-none shadow-2xl transform scale-110 animate-in fade-in zoom-in duration-300">
                <CardContent className="px-10 py-6 flex flex-col items-center">
                  <CheckCircle2 className="h-10 w-10 mb-2 opacity-80" />
                  <span className="text-3xl font-black">{repFeedback.text}</span>
                </CardContent>
              </Card>
            </div>
          )}

          {cameraWarning && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none z-50">
              <Badge variant="destructive" className="px-6 py-2 text-sm shadow-xl animate-bounce">
                <AlertCircle className="h-4 w-4 mr-2" />
                Please step back for better tracking
              </Badge>
            </div>
          )}

          {exerciseComplete && (
            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-500">
              <Card className="bg-background/90 backdrop-blur-xl border-emerald-500/20 w-80 text-center shadow-2xl">
                <CardContent className="p-8">
                  <div className="bg-emerald-500/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BicepsFlexed className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Goal Achieved!</h3>
                  <p className="text-muted-foreground text-sm">Target reps completed. Great work on your recovery journey.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Reference Guide */}
        <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl">
          <ModelVideo isPlaying={isModelPlaying} exerciseType={exercise.type || "knee-extension"} />
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
            <Badge variant="secondary" className="bg-background/40 backdrop-blur-md border-none px-3 py-1.5 pointer-events-auto">
              Reference Guide
            </Badge>
            <div className="pointer-events-auto">
               <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-background/40 backdrop-blur-md hover:bg-background/60"
                onClick={() => setIsModelPlaying(!isModelPlaying)}
               >
                {isModelPlaying ? <PauseCircle /> : <PlayCircle />}
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Surface */}
      <footer className="h-24 border-t border-white/5 bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold tracking-tight">{exercise.title}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                <Badge variant="outline" className="text-[10px] h-4 px-1">{exercise.difficulty}</Badge>
                <div className="flex items-center gap-1"><Activity className="h-3 w-3" /> {exercise.estimatedMins} MIN</div>
                <div className="text-primary/80 flex items-center gap-1 font-mono">
                  <Timer className="h-3 w-3" /> {formatTime["duration"]?.(sessionTime) ?? sessionTime}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {!isCallActive ? (
                <Button 
                  onClick={startCall} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
                >
                  <Phone className="h-5 w-5 mr-2 fill-current" />
                  Begin Session
                </Button>
              ) : (
                <div className="flex items-center gap-3 bg-zinc-900/50 p-1.5 rounded-full border border-white/5">
                  <Button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    variant="ghost"
                    className={`rounded-full h-11 w-11 p-0 ${!isVideoOn ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'hover:bg-white/10'}`}
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    onClick={endCall}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full h-11 px-6 font-bold shadow-lg shadow-red-500/20"
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    Complete
                  </Button>
                </div>
              )}
          </div>
        </div>
      </footer>

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
