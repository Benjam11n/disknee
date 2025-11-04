// Pose landmark indices from MediaPipe
export const POSE_LANDMARKS = {
  // Face
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,

  // Shoulders
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,

  // Arms
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,

  // Hips
  LEFT_HIP: 23,
  RIGHT_HIP: 24,

  // Legs
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface AngleData {
  angle: number;
  visibility: number;
}

interface PoseMetrics {
  kneeAngle: AngleData;
  elbowAngle: AngleData;
  hipAngle: AngleData;
  shoulderAngle: AngleData;
  backAngle: AngleData;
  overallAccuracy: number;
}

// Calculate angle between three points
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

// Calculate visibility for three points
export function calculateVisibility(
  a: Landmark,
  b: Landmark,
  c: Landmark
): number {
  return (a.visibility + b.visibility + c.visibility) / 3;
}

// Calculate knee angle (hip-knee-ankle)
export function calculateKneeAngle(
  landmarks: Landmark[],
  side: "left" | "right"
): AngleData {
  const hip =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_HIP]
      : landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const knee =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_KNEE]
      : landmarks[POSE_LANDMARKS.RIGHT_KNEE];
  const ankle =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_ANKLE]
      : landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

  return {
    angle: calculateAngle(hip, knee, ankle),
    visibility: calculateVisibility(hip, knee, ankle),
  };
}

// Calculate elbow angle (shoulder-elbow-wrist)
export function calculateElbowAngle(
  landmarks: Landmark[],
  side: "left" | "right"
): AngleData {
  const shoulder =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_SHOULDER]
      : landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const elbow =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_ELBOW]
      : landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  const wrist =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_WRIST]
      : landmarks[POSE_LANDMARKS.RIGHT_WRIST];

  return {
    angle: calculateAngle(shoulder, elbow, wrist),
    visibility: calculateVisibility(shoulder, elbow, wrist),
  };
}

// Calculate hip angle (shoulder-hip-knee)
export function calculateHipAngle(
  landmarks: Landmark[],
  side: "left" | "right"
): AngleData {
  const shoulder =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_SHOULDER]
      : landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const hip =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_HIP]
      : landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const knee =
    side === "left"
      ? landmarks[POSE_LANDMARKS.LEFT_KNEE]
      : landmarks[POSE_LANDMARKS.RIGHT_KNEE];

  return {
    angle: calculateAngle(shoulder, hip, knee),
    visibility: calculateVisibility(shoulder, hip, knee),
  };
}

// Calculate back angle (shoulders to hips vertical)
export function calculateBackAngle(landmarks: Landmark[]): AngleData {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  // Midpoints
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2,
    visibility: (leftShoulder.visibility + rightShoulder.visibility) / 2,
  };

  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    z: (leftHip.z + rightHip.z) / 2,
    visibility: (leftHip.visibility + rightHip.visibility) / 2,
  };

  // Reference vertical point
  const verticalPoint = {
    x: shoulderMidpoint.x,
    y: shoulderMidpoint.y - 0.1,
    z: shoulderMidpoint.z,
    visibility: 1,
  };

  return {
    angle: calculateAngle(verticalPoint, shoulderMidpoint, hipMidpoint),
    visibility: (shoulderMidpoint.visibility + hipMidpoint.visibility) / 2,
  };
}

// Calculate overall accuracy based on reference angles
export function calculateOverallAccuracy(
  currentAngles: Partial<PoseMetrics>,
  referenceAngles: Partial<PoseMetrics>
): number {
  let totalScore = 0;
  let count = 0;

  // Compare knee angles
  if (
    currentAngles.kneeAngle &&
    referenceAngles.kneeAngle &&
    currentAngles.kneeAngle.visibility > 0.5
  ) {
    const diff = Math.abs(
      currentAngles.kneeAngle.angle - referenceAngles.kneeAngle.angle
    );
    const score = Math.max(0, 100 - diff * 2); // 2 points per degree deviation
    totalScore += score;
    count++;
  }

  // Compare elbow angles
  if (
    currentAngles.elbowAngle &&
    referenceAngles.elbowAngle &&
    currentAngles.elbowAngle.visibility > 0.5
  ) {
    const diff = Math.abs(
      currentAngles.elbowAngle.angle - referenceAngles.elbowAngle.angle
    );
    const score = Math.max(0, 100 - diff * 2);
    totalScore += score;
    count++;
  }

  // Compare back angle
  if (
    currentAngles.backAngle &&
    referenceAngles.backAngle &&
    currentAngles.backAngle.visibility > 0.5
  ) {
    const diff = Math.abs(
      currentAngles.backAngle.angle - referenceAngles.backAngle.angle
    );
    const score = Math.max(0, 100 - diff * 3); // Back angle is more important
    totalScore += score;
    count++;
  }

  return count > 0 ? Math.round(totalScore / count) : 0;
}

// Convert normalized coordinates to canvas coordinates
export function normalizedToCanvas(
  landmark: Landmark,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: Math.round(landmark.x * canvasWidth),
    y: Math.round(landmark.y * canvasHeight),
  };
}

// Pose connections for drawing skeleton
export const POSE_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16], // Arms
  [11, 23],
  [12, 24], // Torso
  [23, 24],
  [23, 25],
  [24, 26], // Hips and upper legs
  [25, 27],
  [26, 28],
  [27, 29],
  [28, 30],
  [29, 31],
  [30, 32], // Lower legs
];
