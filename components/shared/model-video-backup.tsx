"use client";

import { useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

interface ModelVideoProps {
  isPlaying: boolean;
  exerciseType?: string;
  videoUrl?: string; // URL to the demo video
  onTimeUpdate?: (currentTime: number) => void;
}

export function ModelVideo({
  isPlaying,
  exerciseType = "squat",
  videoUrl,
  onTimeUpdate,
}: ModelVideoProps) {
  console.log("🎬 ModelVideo component is rendering!", {
    isPlaying,
    exerciseType,
    videoUrl,
  });

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

    // Use provided videoUrl or fall back to placeholder based on exercise type
    const fallbackVideo = "/spanish-squat.mp4";
    video.src = fallbackVideo;

    return () => {
      video.removeEventListener("loadeddata", handleLoad);
      video.removeEventListener("error", handleError);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [exerciseType, onTimeUpdate, videoUrl]); // Removed isPlaying to prevent video reset

  console.log("🎬 ModelVideo state:", { isLoaded, error, isPlaying });

  // Always render something visible
  if (!isLoaded || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-900">
        <div className="text-center text-white p-4">
          <h3 className="text-xl font-bold mb-2">ModelVideo Component</h3>
          <p className="text-sm">
            {error ? `Error: ${error}` : "Loading video..."}
          </p>
          <p className="text-xs mt-2 text-yellow-300">
            Exercise: {exerciseType}
          </p>
          <p className="text-xs mt-1 text-green-300">
            Video URL: {videoUrl || "Using fallback"}
          </p>
          <div className="mt-4 p-2 bg-black/30 rounded">
            <p className="text-xs">DEBUG INFO:</p>
            <p className="text-xs">isLoaded: {isLoaded.toString()}</p>
            <p className="text-xs">hasError: {!!error}</p>
            <p className="text-xs">isPlaying: {isPlaying.toString()}</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback simple video element for testing
  return (
    <div className="w-full h-full bg-green-900 flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls
        loop
        playsInline
        muted
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black/70 text-white p-4 rounded">
          <p className="text-sm">Video should be playing here</p>
          <p className="text-xs mt-1">Exercise: {exerciseType}</p>
        </div>
      </div>
    </div>
  );
}
