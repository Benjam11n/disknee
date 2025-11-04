"use client";

import { useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

interface ModelVideoProps {
  isPlaying: boolean;
  exerciseType?: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export function ModelVideo({
  isPlaying,
  exerciseType = "squat",
  onTimeUpdate,
}: ModelVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Handle play/pause
    if (isPlaying && isLoaded) {
      video.play().catch((err) => {
        logger.error("Error playing video:", err);
        setError("Could not play demonstration video");
      });
    } else if (!isPlaying) {
      video.pause();
    }
  }, [isPlaying, isLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoad = () => {
      setIsLoaded(true);
      setError(null);
    };

    const handleError = () => {
      setError("Failed to load demonstration video");
      setIsLoaded(false);
    };

    const handleTimeUpdate = () => {
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    video.addEventListener("loadeddata", handleLoad);
    video.addEventListener("error", handleError);
    video.addEventListener("timeupdate", handleTimeUpdate);

    // For demo purposes, we'll use a placeholder video source
    // In production, you'd have actual demonstration videos
    video.src = "spanish-squat.mp4"; // Empty base64 for demo

    return () => {
      video.removeEventListener("loadeddata", handleLoad);
      video.removeEventListener("error", handleError);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [exerciseType, onTimeUpdate, isPlaying]);

  // If no video is available, show a placeholder
  if (!isLoaded && !error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-32 h-32 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg
                className="h-16 w-16 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-400">Loading demonstration video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <svg
            className="h-16 w-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-400">Demonstration video not available</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Actual video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted
      />

      {/* Exercise type overlay */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-sm capitalize">{exerciseType}</span>
        </div>
      </div>

      {/* Pose guide indicators */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Perfect Form</span>
            </div>
            <div className="text-xs text-gray-300">
              Follow this demonstration
            </div>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg
                className="h-10 w-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </div>
            <p className="text-white mt-2">Paused</p>
          </div>
        </div>
      )}
    </div>
  );
}
