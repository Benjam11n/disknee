"use client";

import { useEffect, useRef } from "react";
import { Landmark, POSE_CONNECTIONS } from "@/lib/pose-utils";

/**
 * PoseOverlay Component
 *
 * Renders a visual skeleton overlay on top of the video stream.
 * Features:
 * - Real-time pose visualization with green lines connecting joints
 * - Color-coded key joints (shoulders, hips, knees, elbows)
 * - Glowing effects for better visibility
 * - Efficient rendering with change detection
 *
 * @param landmarks - Array of pose landmarks from MediaPipe detection
 */
interface PoseOverlayProps {
  landmarks?: Landmark[];
}

export default function PoseOverlay({
  landmarks,
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastLandmarksRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get actual display dimensions from DOM
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    // Set canvas internal resolution to match display size
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    // Create a hash of landmarks to compare changes
    const landmarksHash = landmarks ?
      landmarks.map(l => `${Math.round(l.x * 100)}_${Math.round(l.y * 100)}_${Math.round(l.visibility * 100)}`).join('|') :
      'empty';

    // Skip redraw if landmarks haven't changed significantly
    if (lastLandmarksRef.current === landmarksHash) {
      return;
    }

    lastLandmarksRef.current = landmarksHash;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If landmarks exist, draw them
    if (landmarks && landmarks.length > 0) {
      // Convert normalized landmarks to canvas coordinates
      const canvasLandmarks = landmarks.map((landmark) => ({
        x: landmark.x * canvas.width,
        y: landmark.y * canvas.height,
        z: landmark.z,
        visibility: landmark.visibility,
      }));

      // Draw connections with smoother lines
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      POSE_CONNECTIONS.forEach(([start, end]) => {
        const startPoint = canvasLandmarks[start];
        const endPoint = canvasLandmarks[end];

        if (
          startPoint &&
          endPoint &&
          startPoint.visibility > 0.5 &&
          endPoint.visibility > 0.5
        ) {
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
          ctx.stroke();
        }
      });

      // Draw landmarks with smoother appearance
      canvasLandmarks.forEach((landmark) => {
        if (landmark.visibility > 0.5) {
          // Add subtle glow effect
          const gradient = ctx.createRadialGradient(
            landmark.x, landmark.y, 0,
            landmark.x, landmark.y, 8
          );
          gradient.addColorStop(0, "rgba(255, 0, 0, 0.8)");
          gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

          ctx.beginPath();
          ctx.arc(landmark.x, landmark.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Draw main point
          ctx.beginPath();
          ctx.arc(landmark.x, landmark.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = "#ff0000";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Highlight key joints with different colors
      const keyJoints = [
        { index: 11, color: "#ffff00" }, // Left shoulder
        { index: 12, color: "#ffff00" }, // Right shoulder
        { index: 23, color: "#ffff00" }, // Left hip
        { index: 24, color: "#ffff00" }, // Right hip
        { index: 25, color: "#00ffff" }, // Left knee
        { index: 26, color: "#00ffff" }, // Right knee
        { index: 13, color: "#ff00ff" }, // Left elbow
        { index: 14, color: "#ff00ff" }, // Right elbow
      ];

      keyJoints.forEach(({ index, color }) => {
        if (canvasLandmarks[index]) {
          const landmark = canvasLandmarks[index];

          // Add glow for key joints
          const gradient = ctx.createRadialGradient(
            landmark.x, landmark.y, 0,
            landmark.x, landmark.y, 12
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.5, color + "80");
          gradient.addColorStop(1, color + "00");

          ctx.beginPath();
          ctx.arc(landmark.x, landmark.y, 12, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Draw main joint
          ctx.beginPath();
          ctx.arc(landmark.x, landmark.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-75"
      style={{ willChange: 'transform' }}
    />
  );
}
