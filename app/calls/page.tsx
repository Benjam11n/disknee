"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  PlayCircle,
  PauseCircle,
  Activity,
  RotateCcw,
} from "lucide-react";

import VideoStream from "@/components/VideoStream";
import PoseOverlay from "@/components/PoseOverlay";
import ModelVideo from "@/components/ModelVideo";
import { ReflectionDialog } from "@/components/ReflectionDialog";
import { Landmark } from "@/lib/pose-utils";

export default function CallsPage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isModelPlaying, setIsModelPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
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
          Math.floor((Date.now() - (sessionStartTime.current || 0)) / 1000)
        );
      }, 1000);
    } else if (!isCallActive && sessionStartTime.current) {
      sessionStartTime.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setSessionTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCallActive]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle pose results from MediaPipe
  const handlePoseResults = (results: {
    poseLandmarks: Landmark[];
    image: HTMLVideoElement;
  }) => {
    if (results.poseLandmarks) {
      setPoseLandmarks(results.poseLandmarks);
    }
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    setIsRecording(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setIsRecording(false);
    setShowReflection(true);
  };

  const handleReflectionSubmit = () => {
    setShowReflection(false);
  };

  const handleReflectionSkip = () => {
    setShowReflection(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Physiotherapy Session</h1>
              <p className="text-sm text-muted-foreground">
                {isCallActive ? "Session in progress" : "Ready to start"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCallActive && (
              <>
                <Badge variant={isRecording ? "destructive" : "secondary"}>
                  {isRecording ? "● Recording" : "Paused"}
                </Badge>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side - User Feed */}
        <div className="flex-1 p-4 lg:border-r">
          <Card className="h-full flex flex-col relative overflow-hidden bg-black">
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="secondary" className="bg-black/50 text-white">
                You
              </Badge>
            </div>

            {/* Video Stream with Pose Tracking */}
            <div className="flex-1 relative">
              <VideoStream
                onPoseResults={handlePoseResults}
                isVideoOn={isVideoOn}
                isCallActive={isCallActive}
              />
              <PoseOverlay landmarks={poseLandmarks} width={640} height={480} />
            </div>

            {/* Video Controls */}
            <div className="p-4 bg-black/50 backdrop-blur-sm flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsVideoOn(!isVideoOn)}
                disabled={!isCallActive}
              >
                {isVideoOn ? (
                  <VideoOff className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Side - Model Demonstration */}
        <div className="flex-1 p-4">
          <Card className="h-full flex flex-col relative overflow-hidden bg-black">
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="secondary" className="bg-black/50 text-white">
                Perfect Form
              </Badge>
            </div>

            {/* Model Video */}
            <div className="flex-1">
              <ModelVideo isPlaying={isModelPlaying} exerciseType="squat" />
            </div>

            {/* Model Controls */}
            <div className="p-4 bg-black/50 backdrop-blur-sm flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsModelPlaying(!isModelPlaying)}
              >
                {isModelPlaying ? (
                  <PauseCircle className="h-4 w-4" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
              </Button>
              <Button variant="secondary" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Controls & Metrics */}
      <div className="border-t p-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              {/* Call Control Buttons */}
              <Button
                onClick={handleStartCall}
                disabled={isCallActive}
                size="lg"
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
              >
                <Phone className="h-4 w-4 mr-2" />
                Start Session
              </Button>
              <Button
                onClick={handleEndCall}
                disabled={!isCallActive}
                size="lg"
                variant="destructive"
                className="flex-1 sm:flex-none"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </div>
          </div>

          {/* Simple Metrics Display */}
          {isCallActive && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <div className="text-sm">Session Time</div>
                    <div className="font-bold">{formatTime(sessionTime)}</div>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <div className="text-sm">Status</div>
                    <div className="font-bold capitalize">
                      {isRecording ? "Recording" : "Paused"}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reflection Dialog */}
      <ReflectionDialog
        isOpen={showReflection}
        sessionData={{
          duration: sessionTime,
          repsCompleted: 0, // Not tracking reps for now
          accuracy: 0, // Not tracking accuracy for now
        }}
        onSubmit={handleReflectionSubmit}
        onSkip={handleReflectionSkip}
      />
    </div>
  );
}
