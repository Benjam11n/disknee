"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Landmark } from "@/lib/pose-utils";

const DETECTION_INTERVAL = 2; // Detect every 2 frames (~30fps)
const DETECTION_FPS = 1000 / 30; // 30fps interval

interface VideoStreamProps {
  onPoseResults?: (results: { poseLandmarks: Landmark[]; image: HTMLVideoElement }) => void;
  isVideoOn: boolean;
  isCallActive: boolean;
  flipped?: boolean; // mirror video
}

export default function VideoStream({
  onPoseResults,
  isVideoOn,
  isCallActive,
  flipped = true,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const frameCount = useRef(0);
  const lastLandmarks = useRef<Landmark[] | null>(null);
  const lastDetectionTime = useRef(0);
  const smoothedLandmarks = useRef<Landmark[] | null>(null);
  const smoothingFactor = 0.7;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize MediaPipe PoseLandmarker
  const initializePoseLandmarker = useCallback(async () => {
    try {
      setIsLoading(true);
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

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current || !poseLandmarkerRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        videoRef.current!.onloadedmetadata = () => resolve(true);
      });

      await videoRef.current.play();
    } catch (err) {
      console.error(err);
      setError("Failed to access camera. Grant permissions and reload.");
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (videoRef.current) videoRef.current.srcObject = null;

    lastLandmarks.current = null;
    smoothedLandmarks.current = null;
    frameCount.current = 0;
  }, []);

  // Draw landmarks and skeleton
  const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: Landmark[], flipped: boolean) => {
    if (!landmarks) return;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Connections for skeleton
    const connections = [
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 12], // Shoulders
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28], // Right leg
      [23, 24], [11, 23], [12, 24] // Torso
    ];

    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.fillStyle = "red";

    // Draw connections
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(flipped ? width - start.x * width : start.x * width, start.y * height);
        ctx.lineTo(flipped ? width - end.x * width : end.x * width, end.y * height);
        ctx.stroke();
      }
    });

    // Draw landmarks
    landmarks.forEach((lm) => {
      ctx.beginPath();
      const x = flipped ? width - lm.x * width : lm.x * width;
      const y = lm.y * height;
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Pose detection loop
  const detectPose = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !poseLandmarkerRef.current) {
      animationRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;



    // Draw mirrored video if flipped
    ctx.save();
    if (flipped) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    frameCount.current++;
    const now = performance.now();
    const shouldDetect = frameCount.current % DETECTION_INTERVAL === 0;
    const timeDiff = now - lastDetectionTime.current;

    if (shouldDetect && timeDiff >= DETECTION_FPS) {
      try {
        const results = poseLandmarkerRef.current.detectForVideo(video, now);
        if (results.landmarks?.length) {
          const landmarks: Landmark[] = results.landmarks[0].map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility || 0,
          }));

          // Apply smoothing
          let smoothed = landmarks;
          if (smoothedLandmarks.current) {
            smoothed = landmarks.map((lm, i) => {
              const prev = smoothedLandmarks.current![i];
              return {
                x: prev.x * smoothingFactor + lm.x * (1 - smoothingFactor),
                y: prev.y * smoothingFactor + lm.y * (1 - smoothingFactor),
                z: prev.z * smoothingFactor + lm.z * (1 - smoothingFactor),
                visibility: prev.visibility * smoothingFactor + lm.visibility * (1 - smoothingFactor),
              };
            });
          }

          lastLandmarks.current = smoothed;
          smoothedLandmarks.current = smoothed;
          lastDetectionTime.current = now;

          onPoseResults?.({ poseLandmarks: smoothed, image: video });
        }
      } catch (err) {
        console.error("Pose detection error:", err);
      }
    } else if (lastLandmarks.current) {
      onPoseResults?.({ poseLandmarks: lastLandmarks.current, image: video });
    }

    // Draw skeleton overlay
    if (ctx && lastLandmarks.current) drawLandmarks(ctx, lastLandmarks.current, flipped);

    animationRef.current = requestAnimationFrame(detectPose);
  }, [onPoseResults, flipped]);

  useEffect(() => {
    if (isCallActive && isVideoOn) {
      initializePoseLandmarker().then(startCamera);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCallActive, isVideoOn, initializePoseLandmarker, startCamera, stopCamera]);

  useEffect(() => {
    if (videoRef.current?.readyState === 4) detectPose();
  }, [detectPose]);

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          Initializing pose detection...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
