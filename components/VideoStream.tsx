"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Landmark } from "@/lib/pose-utils";

const DETECTION_INTERVAL = 2;
const DETECTION_FPS = 1000 / 30;

interface Overlay {
  text: string;
  y: number;
}

interface VideoStreamProps {
  onPoseResults?: (results: { poseLandmarks: Landmark[]; image: HTMLVideoElement }) => void;
  isVideoOn: boolean;
  isCallActive: boolean;
  overlays?: Overlay[];
}

export default function VideoStream({
  onPoseResults,
  isVideoOn,
  isCallActive,
  overlays,
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
  const smoothingFactor = 0.7;

  const initializePoseLandmarker = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

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
      console.error(err);
      setError("Failed to initialize pose detection");
      setIsLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (!videoRef.current || !poseLandmarkerRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
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

    if (!ctx) return;

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

    frameCountRef.current++;
    const shouldDetect = frameCountRef.current % DETECTION_INTERVAL === 0;
    const timeSinceLastDetection = currentTime - lastDetectionTimeRef.current;

    if (shouldDetect && timeSinceLastDetection >= DETECTION_FPS) {
      try {
        const results = poseLandmarkerRef.current.detectForVideo(video, currentTime);

        if (results.landmarks && results.landmarks.length > 0) {
          let landmarks: Landmark[] = results.landmarks[0].map((l) => ({
            x: l.x,
            y: l.y,
            z: l.z || 0,
            visibility: l.visibility || 0,
          }));

          // Smooth landmarks
          if (smoothedLandmarksRef.current) {
            landmarks = landmarks.map((l, i) => {
              const prev = smoothedLandmarksRef.current![i];
              return {
                x: prev.x * smoothingFactor + l.x * (1 - smoothingFactor),
                y: prev.y * smoothingFactor + l.y * (1 - smoothingFactor),
                z: prev.z * smoothingFactor + l.z * (1 - smoothingFactor),
                visibility: prev.visibility * smoothingFactor + l.visibility * (1 - smoothingFactor),
              };
            });
          }

          smoothedLandmarksRef.current = landmarks;
          lastLandmarksRef.current = landmarks;
          lastDetectionTimeRef.current = currentTime;

          // Mirror landmarks horizontally for flipped video
          const mirroredLandmarks = landmarks.map((l) => ({ ...l, x: 1 - l.x }));

          if (onPoseResults) onPoseResults({ poseLandmarks: mirroredLandmarks, image: video });
        }
      } catch (err) {
        console.error("Pose detection error:", err);
      }
    } else if (lastLandmarksRef.current && onPoseResults) {
      const mirroredLandmarks = lastLandmarksRef.current.map((l) => ({ ...l, x: 1 - l.x }));
      onPoseResults({ poseLandmarks: mirroredLandmarks, image: video });
    }

    // Draw overlays if any
    if (overlays && ctx) {
      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "left";
      overlays.forEach((o) => ctx.fillText(o.text, 10, o.y));
      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  }, [onPoseResults, overlays]);

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
    lastLandmarksRef.current = null;
    smoothedLandmarksRef.current = null;
    frameCountRef.current = 0;
  }, []);

  useEffect(() => {
    if (isCallActive && isVideoOn) {
      initializePoseLandmarker().then(() => startCamera());
    } else stopCamera();
    return () => stopCamera();
  }, [isCallActive, isVideoOn, initializePoseLandmarker, startCamera, stopCamera]);

  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState === 4) detectPose();
  }, [detectPose]);

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing pose detection...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white text-center p-4">
            <p className="text-red-400">{error}</p>
            <p className="text-sm mt-2">Please ensure camera permissions are granted and try again</p>
          </div>
        </div>
      )}

      {!isVideoOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-gray-400 text-center">
            <svg className="h-16 w-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p>Camera is off</p>
          </div>
        </div>
      )}
    </div>
  );
}
