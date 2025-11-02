"use client";

import { useState, useEffect, useRef } from "react";
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
import PoseOverlay from "@/components/PoseOverlay";
import ModelVideo from "@/components/ModelVideo";
import { ReflectionDialog } from "@/components/ReflectionDialog";
import { Landmark } from "@/lib/pose-utils";
import {
  createSessionAction,
  updateSessionAction,
} from "@/lib/actions/sessions";
import { updateExerciseDoneAction } from "@/lib/actions/exercises";
import { ROUTES } from "@/lib/constants/routes";
import { formatTime } from "@/lib/utils/session-utils";
import { createReflectionAction } from "@/lib/actions/reflections";

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [poseLandmarks, setPoseLandmarks] = useState<Landmark[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const sessionStartTime = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for session
  useEffect(() => {
    if (isCallActive && !sessionStartTime.current) {
      sessionStartTime.current = Date.now();
      intervalRef.current = setInterval(() => {
        setSessionTime(
          Math.floor((Date.now() - sessionStartTime.current!) / 1000)
        );
      }, 1000);
    } else if (!isCallActive && sessionStartTime.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      sessionStartTime.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCallActive]);

  // Update pose landmarks
  const handlePoseResults = (results: {
    poseLandmarks: Landmark[];
    image: HTMLVideoElement;
  }) => {
    if (results.poseLandmarks) {
      setPoseLandmarks(results.poseLandmarks);
    }
  };

  // Start the call
  const startCall = async () => {
    try {
      setIsCallActive(true);
      setIsRecording(true);

      const session = await createSessionAction({
        exerciseId: exercise.id,
        startedAt: new Date().toISOString(),
        repsCompleted: 0,
        accuracy: 0,
      });

      if (session.success && session.data) {
        setSessionId(session.data.id);
        toast.success("Session started successfully!");
      } else {
        toast.error("Failed to start session");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start session");
      setIsCallActive(false);
      setIsRecording(false);
    }
  };

  // End the call
  const endCall = async () => {
    try {
      setIsCallActive(false);
      setIsRecording(false);

      if (sessionId) {
        await updateSessionAction(sessionId, {
          endedAt: new Date(),
          duration: sessionTime,
          accuracy: 85, // Placeholder accuracy
          maxAccuracy: 90,
        });

        await updateExerciseDoneAction({
          id: exercise.id,
          done: true,
        });

        toast.success("Session completed successfully!");
        setShowReflection(true);
      }
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end session");
    }
  };

  // Toggle video
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  // Toggle model video
  const toggleModelVideo = () => {
    setIsModelPlaying(!isModelPlaying);
  };

  // Handle reflection submission
  const handleReflectionSubmit = async (reflection: {
    rating: number;
    fatigue: number;
    feedback?: string;
  }) => {
    try {
      await createReflectionAction({
        sessionId: sessionId!,
        rating: reflection.rating,
        fatigue: reflection.fatigue,
        feedback: reflection.feedback,
      });

      toast.success("Reflection saved successfully!");
      setShowReflection(false);
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error("Error saving reflection:", error);
      toast.error("Failed to save reflection");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Video Streams - Taking full width at top */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
        {/* User Video Stream */}
        <Card className="relative bg-black overflow-hidden">
          <VideoStream
            onPoseResults={handlePoseResults}
            isVideoOn={isVideoOn}
            isCallActive={isCallActive}
          />
          <PoseOverlay landmarks={poseLandmarks} />
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Camera is off</p>
              </div>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium bg-red-500/20 px-2 py-1 rounded">
                REC
              </span>
            </div>
          )}
        </Card>

        {/* Model Video Stream */}
        <Card className="relative bg-black overflow-hidden">
          <ModelVideo
            isPlaying={isModelPlaying}
            exerciseType="squat"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-black/50 text-white">
              Perfect Form
            </Badge>
          </div>
        </Card>
      </div>

      {/* Bottom Section - Exercise Info, Instructions & Controls */}
      <div className="border-t bg-background p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise Info */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{exercise.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                {exercise.difficulty.toLowerCase()}
              </span>
              <span>{exercise.estimatedMins} min</span>
              <span className="text-lg font-mono">
                {formatTime(sessionTime)}
              </span>
            </div>
            {/* Pose Detection Status */}
            {poseLandmarks.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-5 w-5 text-green-500" />
                <span className="font-medium">Pose Detection Active</span>
                <span className="text-muted-foreground">
                  ({poseLandmarks.length} points tracked)
                </span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-medium mb-2">Instructions</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Position yourself in view of the camera</li>
              <li>• Follow the perfect form demonstration</li>
              <li>• Maintain proper posture throughout</li>
              <li>• End the session when completed</li>
            </ul>
          </div>

          {/* Call Controls */}
          <div>
            <div className="grid grid-cols-3 gap-3">
              {!isCallActive ? (
                <Button
                  onClick={startCall}
                  className="col-span-3 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Start Session
                </Button>
              ) : (
                <>
                  <Button
                    onClick={toggleVideo}
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
                    onClick={toggleModelVideo}
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
          repsCompleted: 0, // Not tracking reps for now
          accuracy: 85, // Placeholder accuracy
        }}
        onSubmit={handleReflectionSubmit}
        onSkip={() => {
          setShowReflection(false);
          router.push(ROUTES.HOME);
        }}
      />
    </div>
  );
}
