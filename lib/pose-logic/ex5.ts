import { calculateAngle } from "@/lib/pose-utils";
import { Landmark } from "@/lib/pose-utils";

export interface ExerciseState {
  reps: number;
  timerStarted: boolean;
  startTime: number | null;
  readyForNext: boolean;
  currentAngle: number | null; // null = not visible
  holdTime: number;
}

/**
 * Tiptoe (calf raise) logic with visibility check.
 * Must hold ankle angle ≥ 140° for 3 seconds before counting a rep.
 * Must lower (angle ≤ 120°) before next rep.
 */
export function handleEx5TiptoeLogic(
  landmarks: Landmark[],
  state: ExerciseState,
  onRepComplete: (newCount: number) => void
): ExerciseState {
  const RIGHT_KNEE = 26;
  const RIGHT_ANKLE = 28;
  const RIGHT_TOE = 32;

  let { reps, timerStarted, startTime, readyForNext, holdTime } = state;

  // Check if right ankle landmarks are visible and in frame
  const ankleVisible =
    landmarks[RIGHT_ANKLE]?.visibility != null &&
    landmarks[RIGHT_ANKLE].visibility >= 0.5 &&
    landmarks[RIGHT_ANKLE].y >= 0 &&
    landmarks[RIGHT_ANKLE].y <= 1;

  // If ankle not visible, reset timer and holdTime
  if (!ankleVisible) {
    return {
      reps,
      timerStarted: false,
      startTime: null,
      readyForNext,
      currentAngle: null, // indicate not visible
      holdTime: 0,
    };
  }

  // Calculate angle at ankle
  const knee = landmarks[RIGHT_KNEE];
  const ankle = landmarks[RIGHT_ANKLE];
  const toe = landmarks[RIGHT_TOE];

  const angle = calculateAngle(knee, ankle, toe);

  const ANKLE_HOLD_THRESHOLD = 140;
  const ANKLE_RESET_THRESHOLD = 120;
  const HOLD_TIME_REQUIRED = 3.0;

  let newHoldTime = 0;

  // Start counting hold time if above threshold and ready
  if (angle >= ANKLE_HOLD_THRESHOLD && readyForNext) {
    if (!timerStarted) {
      timerStarted = true;
      startTime = Date.now();
    } else if (startTime) {
      newHoldTime = (Date.now() - startTime) / 1000;
    }

    // Count rep if held long enough
    if (newHoldTime >= HOLD_TIME_REQUIRED) {
      reps += 1;
      timerStarted = false;
      startTime = null;
      readyForNext = false;
      holdTime = 0;
      onRepComplete(reps);
    } else {
      holdTime = newHoldTime;
    }
  } else {
    // Stop timer if angle drops below threshold
    if (timerStarted) {
      timerStarted = false;
      startTime = null;
      holdTime = 0;
    }
  }

  // Reset condition — must drop ankle low enough
  if (angle <= ANKLE_RESET_THRESHOLD) {
    readyForNext = true;
  }

  return {
    reps,
    timerStarted,
    startTime,
    readyForNext,
    currentAngle: angle,
    holdTime,
  };
}
