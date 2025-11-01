"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Landmark } from "@/lib/pose-utils";

// Performance optimization constants
const DETECTION_INTERVAL = 2; // Detect pose every 2 frames (30 fps for smoother tracking)
const DETECTION_FPS = 1000 / 30; // 30 fps = 33ms between detections

interface VideoStreamProps {
  onPoseResults?: (results: {
    poseLandmarks: Landmark[];
    image: HTMLVideoElement;
  }) => void;
  isVideoOn: boolean;
  isCallActive: boolean;
}

export default function VideoStream({
  onPoseResults,
  isVideoOn,
  isCallActive,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastLandmarksRef = useRef<Landmark[] | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const smoothedLandmarksRef = useRef<Landmark[] | null>(null);
  const smoothingFactor = 0.7; // Higher = more smoothing (0.7 = 70% old, 30% new)

  const initializePoseLandmarker = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create the vision fileset resolver
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      // Create the pose landmarker
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU" as const,
        },
        runningMode: "VIDEO" as const,
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseLandmarkerRef.current = poseLandmarker;
      setIsLoading(false);
    } catch (err) {
      console.error("Error initializing PoseLandmarker:", err);
      setError("Failed to initialize pose detection");
      setIsLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (!videoRef.current || !poseLandmarkerRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve(true);
        }
      });

      await videoRef.current.play();
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Failed to access camera. Please ensure camera permissions are granted."
      );
    }
  }, []);

  const detectPose = useCallback(() => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !poseLandmarkerRef.current ||
      videoRef.current.readyState !== 4
    ) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const currentTime = performance.now();

    if (ctx) {
      // Get the actual display dimensions of the canvas element
      const rect = canvas.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;

      // Set canvas internal resolution to match display size
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      // Draw video frame to fill the canvas
      ctx.drawImage(video, 0, 0, displayWidth, displayHeight);

      frameCountRef.current++;

      // Only run pose detection every DETECTION_INTERVAL frames
      const shouldDetect = frameCountRef.current % DETECTION_INTERVAL === 0;
      const timeSinceLastDetection = currentTime - lastDetectionTimeRef.current;

      if (shouldDetect && timeSinceLastDetection >= DETECTION_FPS) {
        // Run AI pose detection (20fps instead of 60fps)
        try {
          const results = poseLandmarkerRef.current.detectForVideo(
            video,
            currentTime
          );

          if (results.landmarks && results.landmarks.length > 0) {
            // Convert MediaPipe landmarks to our format
            const landmarks: Landmark[] = results.landmarks[0].map(
              (landmark: {
                x: number;
                y: number;
                z?: number;
                visibility?: number;
              }) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z || 0,
                visibility: landmark.visibility || 0,
              })
            );

            // Apply smoothing if we have previous landmarks
            let smoothedLandmarks = landmarks;
            if (smoothedLandmarksRef.current) {
              smoothedLandmarks = landmarks.map((landmark, index) => {
                const prevLandmark = smoothedLandmarksRef.current![index];
                return {
                  x: prevLandmark.x * smoothingFactor + landmark.x * (1 - smoothingFactor),
                  y: prevLandmark.y * smoothingFactor + landmark.y * (1 - smoothingFactor),
                  z: prevLandmark.z * smoothingFactor + (landmark.z || 0) * (1 - smoothingFactor),
                  visibility: prevLandmark.visibility * smoothingFactor + landmark.visibility * (1 - smoothingFactor),
                };
              });
            }

            // Store landmarks for next frame
            lastLandmarksRef.current = smoothedLandmarks;
            smoothedLandmarksRef.current = smoothedLandmarks;
            lastDetectionTimeRef.current = currentTime;

            // Send smoothed landmarks to parent component
            if (onPoseResults) {
              onPoseResults({
                poseLandmarks: smoothedLandmarks,
                image: video,
              });
            }
          }
        } catch (error) {
          console.error("Pose detection error:", error);
        }
      } else if (lastLandmarksRef.current && onPoseResults) {
        // Send last known landmarks for smooth animation between detections
        onPoseResults({
          poseLandmarks: lastLandmarksRef.current,
          image: video,
        });
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  }, [onPoseResults]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Reset smoothed landmarks for next session
    lastLandmarksRef.current = null;
    smoothedLandmarksRef.current = null;
    frameCountRef.current = 0;
  }, []);

  useEffect(() => {
    if (isCallActive && isVideoOn) {
      initializePoseLandmarker().then(() => {
        startCamera();
      });
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [
    isCallActive,
    isVideoOn,
    initializePoseLandmarker,
    startCamera,
    stopCamera,
  ]);

  useEffect(() => {
    // Start pose detection loop when camera is ready
    if (videoRef.current && videoRef.current.readyState === 4) {
      detectPose();
    }
  }, [detectPose]);

  return (
    <div className="relative w-full h-full">
      {/* Video element for camera feed */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Canvas for video display and pose overlay */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        width={640}
        height={480}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing pose detection...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white text-center p-4">
            <p className="text-red-400">{error}</p>
            <p className="text-sm mt-2">
              Please ensure camera permissions are granted and try again
            </p>
          </div>
        </div>
      )}

      {/* Video off indicator */}
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
