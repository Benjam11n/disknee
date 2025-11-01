"use client";

import { useEffect, useRef } from "react";
import { Landmark, POSE_CONNECTIONS } from "@/lib/pose-utils";

interface PoseOverlayProps {
  landmarks?: Landmark[];
  width: number;
  height: number;
}

export default function PoseOverlay({
  landmarks,
  width,
  height,
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

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

      // Draw connections
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;

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

      // Draw landmarks
      canvasLandmarks.forEach((landmark) => {
        if (landmark.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(
            landmark.x,
            landmark.y,
            landmark.visibility ? 5 : 2,
            0,
            2 * Math.PI
          );
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
          ctx.beginPath();
          ctx.arc(landmark.x, landmark.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ width, height }}
    />
  );
}
