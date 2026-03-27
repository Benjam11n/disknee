import type { MutableRefObject } from "react";

import type { VideoAccessoryConfig } from "@/lib/config/video-stream";

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export function drawVideoFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  flipped: boolean
): void {
  if (flipped) {
    ctx.drawImage(video, canvas.width, 0, -canvas.width, canvas.height);
    return;
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

export function getBodyHeightPx(
  landmarks: Landmark[],
  canvasHeight: number
): number {
  const minY = Math.min(...landmarks.map((landmark) => landmark.y));
  const maxY = Math.max(...landmarks.map((landmark) => landmark.y));

  return (maxY - minY) * canvasHeight;
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  flipped: boolean,
  accessoryConfigRef: MutableRefObject<{
    crownEmoji: VideoAccessoryConfig["emoji"];
    crownSize: VideoAccessoryConfig["size"];
    crownYOffset: VideoAccessoryConfig["yOffset"];
    glassesEmoji: VideoAccessoryConfig["emoji"];
    glassesSize: VideoAccessoryConfig["size"];
    glassesYOffset: VideoAccessoryConfig["yOffset"];
  }>
): void {
  if (landmarks.length === 0) {
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

  const connections = [
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 12],
    [11, 23],
    [12, 24],
    [23, 25],
    [25, 27],
    [24, 26],
    [26, 28],
  ];

  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  connections.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (!start || !end || start.visibility <= 0.5 || end.visibility <= 0.5) {
      return;
    }

    ctx.beginPath();
    const startX = flipped ? width - start.x * width : start.x * width;
    const startY = start.y * height;
    const endX = flipped ? width - end.x * width : end.x * width;
    const endY = end.y * height;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });

  ctx.fillStyle = "#ff0000";
  landmarks.forEach((landmark, index) => {
    const isFaceLandmark = index <= 10 || index === 23 || index === 24;
    if (landmark.visibility <= 0.5 || isFaceLandmark) {
      return;
    }

    const x = flipped ? width - landmark.x * width : landmark.x * width;
    const y = landmark.y * height;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
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

  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  if (
    !leftEye ||
    leftEye.visibility <= 0.5 ||
    !rightEye ||
    rightEye.visibility <= 0.5
  ) {
    return;
  }

  const leftEyeX = flipped ? width - leftEye.x * width : leftEye.x * width;
  const leftEyeY = leftEye.y * height;
  const rightEyeX = flipped ? width - rightEye.x * width : rightEye.x * width;
  const rightEyeY = rightEye.y * height;

  const glassesX = (leftEyeX + rightEyeX) / 2 + 5;
  const glassesY = (leftEyeY + rightEyeY) / 2 + glassesYOffset;
  const eyeDistance = Math.abs(rightEyeX - leftEyeX);
  const scaleFactor = (eyeDistance / 60) * 1.5;

  ctx.font = `${glassesSize * scaleFactor}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(glassesEmoji, glassesX, glassesY);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
