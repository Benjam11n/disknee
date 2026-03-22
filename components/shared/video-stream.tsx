"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { env } from "@/env";
import {
  DEFAULT_CROWN_SETTINGS,
  DEFAULT_GLASSES_SETTINGS,
  DEFAULT_VIDEO_STREAM_TRANSPORT,
} from "@/lib/config/video-stream";
import type {
  VideoAccessoryConfig,
  VideoStreamTransportConfig,
} from "@/lib/config/video-stream";
import { logger } from "@/lib/logger";
import { PoseSocketClient } from "@/lib/pose-socket-client";
import type { PoseResult } from "@/lib/types/exercise";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface VideoStreamProps {
  isVideoOn: boolean;
  isCallActive: boolean;
  flipped?: boolean;
  exerciseId?: string;
  onPoseUpdate?: (data: PoseResult) => void;
  onCameraDistanceWarning?: (tooClose: boolean) => void;
  crownSettings?: Partial<VideoAccessoryConfig>;
  glassesSettings?: Partial<VideoAccessoryConfig>;
  streamSettings?: Partial<VideoStreamTransportConfig>;
}

export function VideoStream({
  isVideoOn,
  isCallActive,
  flipped = true,
  exerciseId,
  onPoseUpdate,
  onCameraDistanceWarning,
  crownSettings,
  glassesSettings,
  streamSettings,
}: VideoStreamProps) {
  const crownConfig = { ...DEFAULT_CROWN_SETTINGS, ...crownSettings };
  const glassesConfig = { ...DEFAULT_GLASSES_SETTINGS, ...glassesSettings };
  const streamConfig = { ...DEFAULT_VIDEO_STREAM_TRANSPORT, ...streamSettings };
  const crownEmoji = crownConfig.emoji;
  const crownSize = crownConfig.size;
  const crownYOffset = crownConfig.yOffset;
  const glassesEmoji = glassesConfig.emoji;
  const glassesSize = glassesConfig.size;
  const glassesYOffset = glassesConfig.yOffset;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const poseClientRef = useRef<PoseSocketClient | null>(null);
  const lastLandmarks = useRef<Landmark[] | null>(null);
  const onPoseUpdateRef = useRef(onPoseUpdate);
  const onCameraDistanceWarningRef = useRef(onCameraDistanceWarning);
  const flippedRef = useRef(flipped);
  const exerciseIdRef = useRef(exerciseId);
  const accessoryConfigRef = useRef({
    crownEmoji,
    crownSize,
    crownYOffset,
    glassesEmoji,
    glassesSize,
    glassesYOffset,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onPoseUpdateRef.current = onPoseUpdate;
  }, [onPoseUpdate]);

  useEffect(() => {
    onCameraDistanceWarningRef.current = onCameraDistanceWarning;
  }, [onCameraDistanceWarning]);

  useEffect(() => {
    flippedRef.current = flipped;
  }, [flipped]);

  useEffect(() => {
    exerciseIdRef.current = exerciseId;
  }, [exerciseId]);

  useEffect(() => {
    accessoryConfigRef.current = {
      crownEmoji,
      crownSize,
      crownYOffset,
      glassesEmoji,
      glassesSize,
      glassesYOffset,
    };
  }, [
    crownEmoji,
    crownSize,
    crownYOffset,
    glassesEmoji,
    glassesSize,
    glassesYOffset,
  ]);

  const drawVideoFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement,
      flipped: boolean
    ) => {
      if (flipped) {
        ctx.drawImage(video, canvas.width, 0, -canvas.width, canvas.height);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    },
    []
  );

  const getBodyHeightPx = useCallback(
    (landmarks: Landmark[], canvasHeight: number) => {
      const minY = Math.min(...landmarks.map((landmark) => landmark.y));
      const maxY = Math.max(...landmarks.map((landmark) => landmark.y));

      return (maxY - minY) * canvasHeight;
    },
    []
  );

  // Draw skeleton from landmarks
  const drawSkeleton = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      landmarks: Landmark[],
      flipped: boolean
    ) => {
      if (!landmarks || landmarks.length === 0) {
        return;
      }

      const {
        crownEmoji,
        crownSize,
        crownYOffset,
        glassesEmoji,
        glassesSize,
        glassesYOffset,
      } = accessoryConfigRef.current;
      const { width } = ctx.canvas;
      const { height } = ctx.canvas;

      // Draw skeleton connections
      const connections = [
        [11, 13],
        [13, 15], // Right arm
        [12, 14],
        [14, 16], // Left arm
        [11, 12], // Shoulders
        [11, 23],
        [12, 24], // Torso
        [23, 25],
        [25, 27], // Right leg
        [24, 26],
        [26, 28], // Left leg
      ];

      ctx.strokeStyle = "#00ff00"; // Green color
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Draw connections
      connections.forEach(([startIdx, endIdx]) => {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
          ctx.beginPath();
          const startX = flipped ? width - start.x * width : start.x * width;
          const startY = start.y * height;
          const endX = flipped ? width - end.x * width : end.x * width;
          const endY = end.y * height;
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      });

      // Draw joints (excluding face landmarks)
      ctx.fillStyle = "#ff0000"; // Red color
      landmarks.forEach((lm, index) => {
        // Skip drawing dots on face landmarks (0-10 are face/upper body landmarks)
        const isFaceLandmark = index <= 10 || index === 23 || index === 24; // Also skip hips

        if (lm && lm.visibility > 0.5 && !isFaceLandmark) {
          const x = flipped ? width - lm.x * width : lm.x * width;
          const y = lm.y * height;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const nose = landmarks[0];
      if (nose && nose.visibility > 0.5) {
        const noseX = flipped ? width - nose.x * width : nose.x * width;
        const noseY = nose.y * height;

        ctx.font = `${crownSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        ctx.fillText(crownEmoji, noseX, noseY + crownYOffset);
      }

      // Draw glasses between the eyes
      const leftEye = landmarks[2]; // Left eye landmark
      const rightEye = landmarks[5]; // Right eye landmark

      if (
        leftEye &&
        leftEye.visibility > 0.5 &&
        rightEye &&
        rightEye.visibility > 0.5
      ) {
        const leftEyeX = flipped
          ? width - leftEye.x * width
          : leftEye.x * width;
        const leftEyeY = leftEye.y * height;
        const rightEyeX = flipped
          ? width - rightEye.x * width
          : rightEye.x * width;
        const rightEyeY = rightEye.y * height;

        // Calculate center position between eyes
        const glassesX = (leftEyeX + rightEyeX) / 2 + 5;
        const glassesY = (leftEyeY + rightEyeY) / 2 + glassesYOffset;

        // Calculate distance between eyes to scale glasses
        const eyeDistance = Math.abs(rightEyeX - leftEyeX);
        const scaleFactor = (eyeDistance / 60) * 1.5; // Base distance for scaling, 1.5x multiplier for better visibility

        ctx.font = `${glassesSize * scaleFactor}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Add shadow for better visibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(glassesEmoji, glassesX, glassesY);

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    },
    []
  );

  // Draw video frame and send to backend
  const drawFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx && video.readyState === 4) {
        // Set canvas dimensions
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const currentFlipped = flippedRef.current;

        drawVideoFrame(ctx, video, canvas, currentFlipped);

        // Check camera distance (person too close if they fill most of the frame)
        if (
          onCameraDistanceWarningRef.current &&
          video.videoHeight > 0 &&
          lastLandmarks.current &&
          lastLandmarks.current.length > 0
        ) {
          const bodyHeight = getBodyHeightPx(
            lastLandmarks.current,
            canvas.height
          );
          const frameHeight = canvas.height;

          // If body occupies more than 80% of frame height, person is too close
          const tooClose = bodyHeight > frameHeight * 0.8;
          onCameraDistanceWarningRef.current(tooClose);
        }

        // Draw skeleton if we have landmarks
        if (lastLandmarks.current) {
          drawSkeleton(ctx, lastLandmarks.current, currentFlipped);
        }

        // Send frame to backend if connected
        if (
          poseClientRef.current &&
          exerciseIdRef.current &&
          poseClientRef.current.connected()
        ) {
          poseClientRef.current.sendFrame(video);
        }
      }
    }

    animationRef.current = requestAnimationFrame(drawFrame);
  }, [drawSkeleton, drawVideoFrame, getBodyHeightPx]);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", height: 480, width: 640 },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        videoRef.current!.onloadedmetadata = () => {
          if (!animationRef.current) {
            animationRef.current = requestAnimationFrame(drawFrame);
          }
          resolve(true);
        };
      });

      await videoRef.current.play();

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(drawFrame);
      }
    } catch (error) {
      logger.error(error);
      setError("Failed to access camera. Grant permissions and reload.");
    }
  }, [drawFrame]);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
    lastLandmarks.current = null;
  }, []);

  useEffect(() => {
    if (isCallActive && isVideoOn) {
      startCamera();

      // Connect to backend WebSocket for pose detection
      if (exerciseId && !poseClientRef.current) {
        poseClientRef.current = new PoseSocketClient({
          baseUrl: env.NEXT_PUBLIC_BACKEND_URL,
          exerciseId: exerciseId,
          onPoseResult: (result: PoseResult) => {
            if (result.landmarks && result.landmarks.length > 0) {
              lastLandmarks.current = result.landmarks;
            }
            onPoseUpdateRef.current?.(result);
          },
          onError: (error) => {
            logger.error(error, "PoseSocketClient error:");
          },
          captureHeight: streamConfig.captureHeight,
          captureWidth: streamConfig.captureWidth,
          frameSkip: streamConfig.frameSkip,
          jpegQuality: streamConfig.jpegQuality,
          mirrorForBackend: streamConfig.mirrorForBackend,
        });

        poseClientRef.current
          .connect()
          .then(() => {
            // Reset exercise state after connecting to ensure fresh start
            poseClientRef.current?.resetExercise();
          })
          .catch((error) => {
            logger.error(error, "Failed to connect to pose backend:");
          });
      }
    } else {
      stopCamera();
      // Disconnect from backend
      if (poseClientRef.current) {
        poseClientRef.current.disconnect();
        poseClientRef.current = null;
        // Clear landmarks when disconnecting
        lastLandmarks.current = null;
      }
    }

    // Cleanup function
    return () => {
      stopCamera();
      if (poseClientRef.current) {
        poseClientRef.current.disconnect();
        poseClientRef.current = null;
        lastLandmarks.current = null;
      }
    };
  }, [
    isCallActive,
    isVideoOn,
    startCamera,
    exerciseId,
    streamConfig.captureHeight,
    streamConfig.captureWidth,
    streamConfig.frameSkip,
    streamConfig.jpegQuality,
    streamConfig.mirrorForBackend,
  ]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
        style={{ transform: flipped ? "scaleX(-1)" : "none" }}
      />
      <canvas ref={canvasRef} className="w-full h-full object-cover" />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
