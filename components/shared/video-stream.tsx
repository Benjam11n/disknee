'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { PoseSocketClient } from '@/lib/pose-socket-client';

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
}

export function VideoStream({
  isVideoOn,
  isCallActive,
  flipped = true,
  exerciseId,
  onPoseUpdate,
}: VideoStreamProps) {
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

      // Draw joints
      ctx.fillStyle = '#ff0000'; // Red color
      landmarks.forEach((lm) => {
        if (lm && lm.visibility > 0.5) {
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

        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        ctx.fillText('👑', noseX, noseY - 60);
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
  }, [flipped, exerciseId, drawSkeleton]);

  useEffect(() => {
    if (isCallActive && isVideoOn) {
      startCamera();

      // Connect to backend WebSocket for pose detection
      if (exerciseId && !poseClientRef.current) {
        poseClientRef.current = new PoseSocketClient({
          baseUrl: 'http://localhost:8000',
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

        poseClientRef.current.connect().catch((err) => {
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
