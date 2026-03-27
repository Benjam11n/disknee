"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

import {
  drawSkeleton,
  drawVideoFrame,
  getBodyHeightPx,
} from "./video-stream-canvas";
import type { Landmark } from "./video-stream-canvas";

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
    crownEmoji: crownConfig.emoji,
    crownSize: crownConfig.size,
    crownYOffset: crownConfig.yOffset,
    glassesEmoji: glassesConfig.emoji,
    glassesSize: glassesConfig.size,
    glassesYOffset: glassesConfig.yOffset,
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
      crownEmoji: crownConfig.emoji,
      crownSize: crownConfig.size,
      crownYOffset: crownConfig.yOffset,
      glassesEmoji: glassesConfig.emoji,
      glassesSize: glassesConfig.size,
      glassesYOffset: glassesConfig.yOffset,
    };
  }, [crownConfig, glassesConfig]);

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      animationRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (ctx && video.readyState === 4) {
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const currentFlipped = flippedRef.current;
      drawVideoFrame(ctx, video, canvas, currentFlipped);

      if (
        onCameraDistanceWarningRef.current &&
        video.videoHeight > 0 &&
        lastLandmarks.current?.length
      ) {
        const bodyHeight = getBodyHeightPx(
          lastLandmarks.current,
          canvas.height
        );
        onCameraDistanceWarningRef.current(bodyHeight > canvas.height * 0.8);
      }

      if (lastLandmarks.current) {
        drawSkeleton(
          ctx,
          lastLandmarks.current,
          currentFlipped,
          accessoryConfigRef
        );
      }

      if (
        poseClientRef.current &&
        exerciseIdRef.current &&
        poseClientRef.current.connected()
      ) {
        poseClientRef.current.sendFrame(video);
      }
    }

    animationRef.current = requestAnimationFrame(drawFrame);
  }, []);

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

  const startCamera = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", height: 480, width: 640 },
      });

      streamRef.current = stream;
      video.srcObject = stream;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          if (!animationRef.current) {
            animationRef.current = requestAnimationFrame(drawFrame);
          }
          resolve();
        };
      });

      await video.play();

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(drawFrame);
      }
    } catch (cameraError) {
      logger.error(cameraError);
      setError("Failed to access camera. Grant permissions and reload.");
    }
  }, [drawFrame]);

  const disconnectPoseClient = useCallback(() => {
    if (!poseClientRef.current) {
      return;
    }

    poseClientRef.current.disconnect();
    poseClientRef.current = null;
    lastLandmarks.current = null;
  }, []);

  useEffect(() => {
    if (isCallActive && isVideoOn) {
      startCamera();

      if (exerciseId && !poseClientRef.current) {
        poseClientRef.current = new PoseSocketClient({
          baseUrl: env.NEXT_PUBLIC_BACKEND_URL,
          exerciseId,
          onPoseResult: (result: PoseResult) => {
            if (result.landmarks?.length) {
              lastLandmarks.current = result.landmarks;
            }
            onPoseUpdateRef.current?.(result);
          },
          onError: (socketError) => {
            logger.error(socketError, "PoseSocketClient error:");
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
            poseClientRef.current?.resetExercise();
          })
          .catch((socketError) => {
            logger.error(socketError, "Failed to connect to pose backend:");
          });
      }
    } else {
      stopCamera();
      disconnectPoseClient();
    }

    return () => {
      stopCamera();
      disconnectPoseClient();
    };
  }, [
    disconnectPoseClient,
    exerciseId,
    isCallActive,
    isVideoOn,
    startCamera,
    stopCamera,
    streamConfig.captureHeight,
    streamConfig.captureWidth,
    streamConfig.frameSkip,
    streamConfig.jpegQuality,
    streamConfig.mirrorForBackend,
  ]);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
        style={{ transform: flipped ? "scaleX(-1)" : "none" }}
      />
      <canvas ref={canvasRef} className="h-full w-full object-cover" />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
