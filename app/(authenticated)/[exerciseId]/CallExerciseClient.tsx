"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  PlayCircle,
  PauseCircle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { Exercise } from "@prisma/client";

import VideoStream from "@/components/VideoStream";
import ModelVideo from "@/components/ModelVideo";
import { ReflectionDialog } from "@/components/ReflectionDialog";
import { Landmark } from "@/lib/pose-utils";
import {
  createExerciseSessionAction,
  updateExerciseSessionAction,
} from "@/lib/actions/exercise-sessions";
import { updateExerciseDoneAction } from "@/lib/actions/exercises";
import { ROUTES } from "@/lib/constants/routes";
import { formatTime } from "@/lib/utils/session-utils";
import { createReflectionAction } from "@/lib/actions/reflections";

interface Ex4State {
  reps: number;
  currentAngle: number | null;
  holdTime: number;
}

interface CallExerciseClientProps {
  exercise: Exercise;
}

export default function CallExerciseClient({
  exercise,
}: CallExerciseClientProps) {
  const router = useRouter();

  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isModelPlaying, setIsModelPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [exerciseSessionId, setExerciseSessionId] = useState<string | null>(
    null
  );
  const [poseLandmarks, setPoseLandmarks] = useState<Landmark[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [ex4State, setEx4State] = useState<Ex4State>({
    reps: 0,
    currentAngle: null,
    holdTime: 0,
  });

  const sessionStartTime = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Session timer
  useEffect(() => {
    if (isCallActive && !sessionStartTime.current) {
      sessionStartTime.current = Date.now();
      const interval = setInterval(() => {
        setSessionTime(
          Math.floor((Date.now() - sessionStartTime.current!) / 1000)
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCallActive]);

  // WebSocket connection
  useEffect(() => {
    if (!isCallActive) return;

    wsRef.current = new WebSocket("ws://localhost:8000");
    wsRef.current.onopen = () => console.log("WebSocket connected");
    wsRef.current.onclose = () => console.log("WebSocket closed");
    wsRef.current.onerror = (e) => console.error("WebSocket error", e);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Update landmarks and rep/angle/hold timer
      setPoseLandmarks(data.landmarks);
      setEx4State({
        reps: data.reps,
        currentAngle: data.kneeAngle,
        holdTime: data.holdTime,
      });
    };

    return () => {
      wsRef.current?.close();
    };
  }, [isCallActive]);

  const startCall = async () => {
    setIsCallActive(true);
    setIsRecording(true);
    try {
      const exerciseSession = await createExerciseSessionAction({
        exerciseId: exercise.id,
        startedAt: new Date().toISOString(),
        repsCompleted: 0,
        accuracy: 0,
      });
      if (exerciseSession.success && exerciseSession.data)
        setExerciseSessionId(exerciseSession.data.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session");
    }
  };

  const endCall = async () => {
    setIsCallActive(false);
    setIsRecording(false);
    if (exerciseSessionId) {
      try {
        await updateExerciseSessionAction(exerciseSessionId, {
          endedAt: new Date(),
          duration: sessionTime,
          accuracy: 85,
          maxAccuracy: 90,
        });
        await updateExerciseDoneAction({ id: exercise.id, done: true });
        toast.success("Session completed!");
        setShowReflection(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to end session");
      }
    }
  };

  const handleReflectionSubmit = async (reflection: {
    rating: number;
    fatigue: number;
    feedback?: string;
  }) => {
    try {
      await createReflectionAction({
        exerciseSessionId: exerciseSessionId!,
        rating: reflection.rating,
        fatigue: reflection.fatigue,
        feedback: reflection.feedback,
      });
      toast.success("Reflection saved!");
      setShowReflection(false);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      console.error(err);
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
            onPoseResults={({ poseLandmarks }) =>
              setPoseLandmarks(poseLandmarks)
            }
          />

          {/* Overlay for reps, angle, and hold timer */}
          <div className="absolute top-4 left-4 text-white text-lg font-bold bg-black/40 px-3 py-2 rounded-md space-y-1">
            <div>Knee Angle: {ex4State.currentAngle?.toFixed(0) ?? "N/A"}°</div>
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
            exerciseType="knee-extension"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-black/50 text-white">
              Perfect Form
            </Badge>
          </div>
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
              | {formatTime(sessionTime)}
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
          duration: sessionTime,
          repsCompleted: ex4State.reps,
          accuracy: 85,
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
