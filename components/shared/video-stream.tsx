'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { PoseSocketClient } from '@/lib/pose-socket-client';
import { env } from '@/env';

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
  onPoseUpdate?: (data: any) => void;
  onCameraDistanceWarning?: (tooClose: boolean) => void;
  crownSettings?: {
    emoji?: string; // Crown emoji (default: 👑)
    size?: number; // Font size in pixels (default: 60)
    yOffset?: number; // Vertical offset from nose (default: -60)
  };
  glassesSettings?: {
    emoji?: string; // Glasses emoji (default: 🕶️)
    size?: number; // Font size in pixels (default: 50)
    yOffset?: number; // Vertical offset from eyes (default: 0)
  };
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
}: VideoStreamProps) {
  // Set default crown settings
  const crownConfig = {
    emoji: crownSettings?.emoji || '👑',
    size: crownSettings?.size || 60,
    yOffset: crownSettings?.yOffset || -60,
  };

  // Set default glasses settings
  const glassesConfig = {
    emoji: glassesSettings?.emoji || '🕶️',
    size: glassesSettings?.size || 80,
    yOffset: glassesSettings?.yOffset || 0,
  };
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const poseClientRef = useRef<PoseSocketClient | null>(null);
  const lastLandmarks = useRef<Landmark[] | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Draw skeleton from landmarks
  const drawSkeleton = useCallback(
    (ctx: CanvasRenderingContext2D, landmarks: Landmark[], flipped: boolean) => {
      if (!landmarks || landmarks.length === 0) {
        return;
      }

      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

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

      ctx.strokeStyle = '#00ff00'; // Green color
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

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
      ctx.fillStyle = '#ff0000'; // Red color
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

        ctx.font = `${crownConfig.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        ctx.fillText(crownConfig.emoji, noseX, noseY + crownConfig.yOffset);
      }

      // Draw glasses between the eyes
      const leftEye = landmarks[2]; // Left eye landmark
      const rightEye = landmarks[5]; // Right eye landmark

      if (leftEye && leftEye.visibility > 0.5 && rightEye && rightEye.visibility > 0.5) {
        const leftEyeX = flipped ? width - leftEye.x * width : leftEye.x * width;
        const leftEyeY = leftEye.y * height;
        const rightEyeX = flipped ? width - rightEye.x * width : rightEye.x * width;
        const rightEyeY = rightEye.y * height;

        // Calculate center position between eyes
        const glassesX = (leftEyeX + rightEyeX) / 2 + 5; // Move 15px to the left
        const glassesY = (leftEyeY + rightEyeY) / 2 + glassesConfig.yOffset;

        // Calculate distance between eyes to scale glasses
        const eyeDistance = Math.abs(rightEyeX - leftEyeX);
        const scaleFactor = (eyeDistance / 60) * 1.5; // Base distance for scaling, 1.5x multiplier for better visibility

        ctx.font = `${glassesConfig.size * scaleFactor}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(glassesConfig.emoji, glassesX, glassesY);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    },
    []
  );

  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        videoRef.current!.onloadedmetadata = () => {
          // Start animation loop when video metadata is loaded
          if (!animationRef.current) {
            animationRef.current = requestAnimationFrame(drawFrame);
          }
          resolve(true);
        };
      });

      await videoRef.current.play();

      // Also start animation loop after play begins
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(drawFrame);
      }
    } catch (err) {
      logger.error(err);
      setError('Failed to access camera. Grant permissions and reload.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Clear landmarks when stopping
    lastLandmarks.current = null;
  }, []);

  // Draw video frame and send to backend
  const drawFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.readyState === 4) {
        // Set canvas dimensions
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw video frame
        ctx.save();
        if (flipped) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Check camera distance (person too close if they fill most of the frame)
        if (onCameraDistanceWarning && video.videoHeight > 0) {
          if (lastLandmarks.current && lastLandmarks.current.length > 0) {
            const minY = Math.min(...lastLandmarks.current.map((l) => l.y)) * canvas.height;
            const maxY = Math.max(...lastLandmarks.current.map((l) => l.y)) * canvas.height;
            const bodyHeight = maxY - minY;
            const frameHeight = canvas.height;

            // If body occupies more than 80% of frame height, person is too close
            const tooClose = bodyHeight > frameHeight * 0.8;
            onCameraDistanceWarning(tooClose);
          }
        }

        // Draw skeleton if we have landmarks
        if (lastLandmarks.current) {
          drawSkeleton(ctx, lastLandmarks.current, flipped);
        }

        ctx.restore();

        // Send frame to backend if connected
        if (poseClientRef.current && exerciseId && poseClientRef.current.connected()) {
          poseClientRef.current.sendFrame(video);
        }
      }
    }

    animationRef.current = requestAnimationFrame(drawFrame);
  }, [flipped, exerciseId, drawSkeleton, onCameraDistanceWarning]);

  useEffect(() => {
    if (isCallActive && isVideoOn) {
      startCamera();

      // Connect to backend WebSocket for pose detection
      if (exerciseId && !poseClientRef.current) {
        poseClientRef.current = new PoseSocketClient({
          baseUrl: env.NEXT_PUBLIC_BACKEND_URL,
          exerciseId: exerciseId,
          onPoseResult: (result) => {
            // Handle pose results from backend
            logger.info(result, 'Pose result from backend:');
            // Store landmarks for skeleton drawing
            if (result.landmarks && result.landmarks.length > 0) {
              lastLandmarks.current = result.landmarks;
            }
            // Call parent component callback with pose data
            if (onPoseUpdate) {
              onPoseUpdate(result);
            }
          },
          onConnectionChange: (connected) => {
            logger.info(connected, 'Backend connection status:');
          },
          onError: (error) => {
            logger.error(error, 'PoseSocketClient error:');
          },
          frameSkip: 2, // Send every 2nd frame (15fps)
          quality: 0.7, // JPEG quality
        });

        poseClientRef.current
          .connect()
          .then(() => {
            // Reset exercise state after connecting to ensure fresh start
            poseClientRef.current?.resetExercise();
          })
          .catch((err) => {
            logger.error(err, 'Failed to connect to pose backend:');
          });
      }
    } else {
      stopCamera();
      // Disconnect from backend
      if (poseClientRef.current) {
        poseClientRef.current.disconnect();
        poseClientRef.current = null;
      }
    }
    return () => {
      stopCamera();
      if (poseClientRef.current) {
        poseClientRef.current.disconnect();
        poseClientRef.current = null;
      }
    };
  }, [isCallActive, isVideoOn, startCamera, exerciseId]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
        style={{ transform: flipped ? 'scaleX(-1)' : 'none' }}
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
