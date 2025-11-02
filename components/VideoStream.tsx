"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PoseSocketClient, PoseResult } from "@/lib/pose-socket-client";

const DETECTION_FPS = 1000 / 30;

interface Overlay {
  text: string;
  y: number;
}

interface VideoStreamProps {
  exerciseId: string;
  onPoseResult?: (result: PoseResult) => void;
  onRepComplete?: (count: number) => void;
  isVideoOn: boolean;
  isCallActive: boolean;
  overlays?: Overlay[];
  backendUrl?: string;
}

export default function VideoStream({
  exerciseId,
  onPoseResult,
  onRepComplete,
  isVideoOn,
  isCallActive,
  overlays,
  backendUrl = "http://localhost:8000",
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");

  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const poseClientRef = useRef<PoseSocketClient | null>(null);
  const connectionStartTimeRef = useRef<number>(0);
  const onPoseResultRef = useRef<typeof onPoseResult | undefined>(onPoseResult);
  const onRepCompleteRef = useRef<typeof onRepComplete | undefined>(
    onRepComplete
  );

  // Keep latest callbacks without causing reconnects
  useEffect(() => {
    onPoseResultRef.current = onPoseResult;
  }, [onPoseResult]);

  useEffect(() => {
    onRepCompleteRef.current = onRepComplete;
  }, [onRepComplete]);

  // Initialize pose socket client
  const initializePoseClient = () => {
    if (!poseClientRef.current) {
      poseClientRef.current = new PoseSocketClient({
        baseUrl: backendUrl,
        exerciseId: exerciseId,
        onPoseResult: (result: PoseResult) => {
          const cb = onPoseResultRef.current;
          if (cb && result.landmarks) {
            cb(result);
          }
          const repCb = onRepCompleteRef.current;
          if (repCb && result.rep_completed) {
            repCb(result.exercise_state.reps);
          }
        },
        onConnectionChange: (connected) => {
          setConnectionStatus(connected ? "connected" : "disconnected");
          if (connected) {
            connectionStartTimeRef.current = performance.now();
            setIsLoading(false);
            setError(null);
          }
        },
        onError: (error) => {
          console.error("Pose detection error:", error);
          setError(error.message);
        },
        frameSkip: 3,
        quality: 0.6,
      });
    }
  };

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
          // Optimize for performance
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve(true);
        }
      });

      await videoRef.current.play();
    } catch (err) {
      console.error(err);
      setError("Failed to access camera.");
    }
  }, []);

  // Connect to backend and start processing
  const connectAndStart = async () => {
    setIsLoading(true);
    setConnectionStatus("connecting");
    setError(null);

    initializePoseClient();

    if (poseClientRef.current) {
      try {
        await poseClientRef.current.connect();
        await startCamera();
        // Begin render loop immediately after camera starts
        renderVideo();
        setIsLoading(false);
      } catch (err) {
        setError("Failed to connect to pose detection server.");
        setIsLoading(false);
        setConnectionStatus("disconnected");
      }
    }
  };

  // Render video loop
  const renderVideo = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(renderVideo);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const currentTime = performance.now();

    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    // Draw mirrored video
    ctx.save();
    ctx.translate(displayWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, displayWidth, displayHeight);
    ctx.restore();

    // Send frame to pose detection server (with FPS limiting)
    // Wait 1 second after connection before sending frames
    const timeSinceConnection = currentTime - connectionStartTimeRef.current;
    if (currentTime - lastFrameTimeRef.current >= DETECTION_FPS) {
      if (
        poseClientRef.current?.connected() &&
        video.readyState === 4 &&
        timeSinceConnection > 1000
      ) {
        poseClientRef.current.sendFrame(video);
      }
      lastFrameTimeRef.current = currentTime;
    }

    // Draw overlays
    if (overlays) {
      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "left";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 4;
      ctx.lineWidth = 3;
      overlays.forEach((o) => {
        ctx.strokeText(o.text, 10, o.y);
        ctx.fillText(o.text, 10, o.y);
      });
      ctx.restore();
    }

    // Draw connection status
    if (!poseClientRef.current?.connected()) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, displayWidth, 40);
      ctx.fillStyle = connectionStatus === "connecting" ? "yellow" : "red";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        connectionStatus === "connecting"
          ? "Connecting to pose server..."
          : "Disconnected from pose server",
        displayWidth / 2,
        25
      );
      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(renderVideo);
  }, [overlays, connectionStatus]);

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (poseClientRef.current) {
      poseClientRef.current.disconnect();
    }
  }, []);

  // Handle exercise state changes
  useEffect(() => {
    if (onPoseResult) {
      // This effect can be used to handle additional pose result logic
    }
  }, [onPoseResult]);

  // Start when call and video are active
  useEffect(() => {
    if (isCallActive && isVideoOn) {
      void connectAndStart();
    }
  }, [isCallActive, isVideoOn, exerciseId, backendUrl]);

  // Stop when either toggles off
  useEffect(() => {
    if (!isCallActive || !isVideoOn) {
      stopCamera();
    }
  }, [isCallActive, isVideoOn]);

  // Start rendering once video is ready
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      renderVideo();
    }
  }, [renderVideo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        width={640}
        height={480}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p>
              {connectionStatus === "connecting"
                ? "Connecting to pose detection server..."
                : "Initializing camera..."}
            </p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white text-center p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={connectAndStart}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Camera off overlay */}
      {!isVideoOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-gray-400 text-center">
            <svg
              className="h-16 w-16 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p>Camera is off</p>
          </div>
        </div>
      )}
    </div>
  );
}
