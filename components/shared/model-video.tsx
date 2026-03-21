"use client";

import { useEffect, useRef } from "react";

import { getExerciseVideo } from "@/lib/config/exercise-videos";
import { logger } from "@/lib/logger";

interface ModelVideoProps {
  isPlaying: boolean;
  exerciseType?: string;
  videoUrl?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onTogglePlay?: () => void;
}

export function ModelVideo({
  isPlaying,
  exerciseType,
  videoUrl,
  onTogglePlay,
}: ModelVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSource = videoUrl || getExerciseVideo(exerciseType);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isPlaying) {
      video.play().catch(() => logger.error("Error playing video"));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (onTogglePlay) {
      onTogglePlay();
    }
  };

  return (
    <div className="w-full h-full relative bg-black">
      <video
        ref={videoRef}
        src={videoSource}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted
        autoPlay
        onClick={handleVideoClick}
      />

      {/* Exercise type label */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/70 px-3 py-1 rounded-full">
          <span className="text-white text-sm capitalize">
            {exerciseType} Demo
          </span>
        </div>
      </div>

      {/* Play/pause overlay - shown when paused */}
      {!isPlaying && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
          onClick={handleVideoClick}
        >
          <div className="text-center text-white">
            <svg
              className="h-20 w-20 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" /> {/* Play icon */}
            </svg>
            <p className="text-lg">Click to play</p>
          </div>
        </div>
      )}

      {/* Subtle hint when playing */}
      {isPlaying && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/50 px-3 py-1 rounded">
            <span className="text-white text-xs">Click video to pause</span>
          </div>
        </div>
      )}
    </div>
  );
}
