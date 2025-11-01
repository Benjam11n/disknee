"use client";

import { useEffect, useRef, useState } from "react";

interface VideoStreamProps {
  onPoseResults?: (results: any) => void;
  isVideoOn: boolean;
  isCallActive: boolean;
}

export default function VideoStreamSimple({
  onPoseResults,
  isVideoOn,
  isCallActive,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current || !isCallActive || !isVideoOn) return;

    let stream: MediaStream | null = null;
    let animationId: number | null = null;

    const initializeCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user media
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user",
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsLoading(false);

            // Start drawing video to canvas
            const drawVideo = () => {
              if (videoRef.current && canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                if (ctx) {
                  canvasRef.current.width = 640;
                  canvasRef.current.height = 480;
                  ctx.drawImage(videoRef.current, 0, 0, 640, 480);

                  // Simulate pose detection with random data for demo
                  if (onPoseResults && Math.random() > 0.95) {
                    const mockLandmarks = Array(33)
                      .fill(null)
                      .map((_, i) => ({
                        x: Math.random(),
                        y: Math.random(),
                        z: Math.random() * 0.1,
                        visibility: Math.random() * 0.5 + 0.5,
                      }));

                    onPoseResults({
                      poseLandmarks: mockLandmarks,
                      image: videoRef.current,
                    });
                  }

                  animationId = requestAnimationFrame(drawVideo);
                }
              }
            };
            drawVideo();
          };
        }
      } catch (err) {
        console.error("Error initializing camera:", err);
        setError("Failed to initialize camera");
        setIsLoading(false);
      }
    };

    initializeCamera();

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVideoOn, isCallActive, onPoseResults]);

  return (
    <div className="relative w-full h-full">
      {/* Hidden video element for camera feed */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Canvas for video display */}
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
            <p>Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white text-center p-4">
            <p className="text-red-400">{error}</p>
            <p className="text-sm mt-2">
              Please ensure camera permissions are granted
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
