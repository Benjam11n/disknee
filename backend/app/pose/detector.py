from __future__ import annotations

import asyncio
import math
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Any, TypeAlias

import cv2
import mediapipe as mp
import numpy as np
import structlog

from app.models.pose import Landmark, PoseDetectionResult

logger = structlog.get_logger()

Point2D: TypeAlias = tuple[float, float]
LandmarkList: TypeAlias = list[Landmark]
VisibilityScores: TypeAlias = dict[int, float]


class PoseDetector:
    """Optimized MediaPipe pose detector for real-time processing."""

    def __init__(
        self,
        model_complexity: int = 0,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
        enable_segmentation: bool = False,
        smooth_landmarks: bool = True,
        static_image_mode: bool = False,
        smoothing_factor: float = 0.7,
    ) -> None:
        self.model_complexity = model_complexity
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        self.enable_segmentation = enable_segmentation
        self.smooth_landmarks = smooth_landmarks
        self.static_image_mode = static_image_mode
        self.smoothing_factor = smoothing_factor

        self.previous_landmarks: LandmarkList | None = None
        self.smoothed_landmarks: LandmarkList | None = None

        self.mp_pose = mp.solutions.pose
        self.executor = ThreadPoolExecutor(max_workers=2)
        self.pose: Any | None = None
        self._initialize_pose()

        self.fps_counter = 0
        self.fps_start_time_ms: float | None = None
        self.current_fps = 0.0

        logger.info(
            "PoseDetector initialized",
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    def _initialize_pose(self) -> None:
        """Initialize the MediaPipe pose solution."""
        try:
            self.pose = self.mp_pose.Pose(
                model_complexity=self.model_complexity,
                min_detection_confidence=self.min_detection_confidence,
                min_tracking_confidence=self.min_tracking_confidence,
                enable_segmentation=self.enable_segmentation,
                smooth_landmarks=self.smooth_landmarks,
                static_image_mode=self.static_image_mode,
            )
            logger.info("MediaPipe Pose initialized successfully")
        except Exception as exc:
            logger.error("Failed to initialize MediaPipe Pose", error=str(exc))
            raise

    async def process_frame_async(
        self,
        frame_bytes: bytes,
        timestamp_ms: float | None = None,
    ) -> PoseDetectionResult | None:
        """Process a frame without blocking the event loop."""
        loop = asyncio.get_running_loop()
        frame_timestamp_ms = timestamp_ms if timestamp_ms is not None else time.perf_counter() * 1000

        try:
            return await loop.run_in_executor(
                self.executor,
                self._process_frame_sync,
                frame_bytes,
                frame_timestamp_ms,
            )
        except Exception as exc:
            logger.error("Error in async frame processing", error=str(exc))
            return None

    def _process_frame_sync(self, frame_bytes: bytes, timestamp_ms: float) -> PoseDetectionResult | None:
        """Decode a frame, run MediaPipe, and package a typed detector response."""
        try:
            self._update_fps(timestamp_ms)

            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            original_height, original_width = frame.shape[:2]
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            if self.pose is None:
                logger.error("Pose detector is not initialized")
                return None

            results = self.pose.process(rgb_frame)
            response = PoseDetectionResult(
                timestamp_ms=timestamp_ms,
                frame_width=original_width,
                frame_height=original_height,
                fps=self.current_fps,
                pose_detected=False,
            )

            if not results.pose_landmarks:
                logger.debug("No pose detected in frame")
                return response

            landmarks: LandmarkList = []
            visibility_scores: VisibilityScores = {}

            tracked_indices = {
                self.mp_pose.PoseLandmark.LEFT_KNEE.value,
                self.mp_pose.PoseLandmark.RIGHT_KNEE.value,
                self.mp_pose.PoseLandmark.LEFT_ANKLE.value,
                self.mp_pose.PoseLandmark.RIGHT_ANKLE.value,
                self.mp_pose.PoseLandmark.LEFT_HIP.value,
                self.mp_pose.PoseLandmark.RIGHT_HIP.value,
            }

            for idx, landmark in enumerate(results.pose_landmarks.landmark):
                landmark_model = Landmark(
                    x=float(landmark.x),
                    y=float(landmark.y),
                    z=float(landmark.z),
                    visibility=float(landmark.visibility),
                )
                landmarks.append(landmark_model)

                if idx in tracked_indices:
                    visibility_scores[idx] = landmark_model.visibility

            is_stable = self._is_pose_stable(landmarks)
            smoothed_landmarks = self._smooth_landmarks(landmarks) if is_stable else (
                list(self.smoothed_landmarks) if self.smoothed_landmarks is not None else landmarks
            )

            logger.debug(
                "Pose detected",
                landmarks_count=len(landmarks),
                avg_visibility=sum(item.visibility for item in landmarks) / len(landmarks),
            )

            return PoseDetectionResult(
                timestamp_ms=timestamp_ms,
                frame_width=original_width,
                frame_height=original_height,
                fps=self.current_fps,
                landmarks=smoothed_landmarks,
                pose_detected=True,
                visibility_scores=visibility_scores,
                pose_stable=is_stable,
            )
        except Exception as exc:
            logger.error("Error processing frame", error=str(exc))
            return None

    def _update_fps(self, timestamp_ms: float) -> None:
        """Update FPS counter using millisecond timestamps."""
        if self.fps_start_time_ms is None or timestamp_ms < self.fps_start_time_ms:
            self.fps_start_time_ms = timestamp_ms
            self.fps_counter = 0
            self.current_fps = 0.0

        self.fps_counter += 1

        elapsed_ms = timestamp_ms - self.fps_start_time_ms
        if elapsed_ms >= 1000:
            elapsed_seconds = elapsed_ms / 1000
            self.current_fps = self.fps_counter / elapsed_seconds
            self.fps_counter = 0
            self.fps_start_time_ms = timestamp_ms

    def _smooth_landmarks(self, landmarks: LandmarkList) -> LandmarkList:
        """Apply exponential smoothing to reduce jitter between frames."""
        if self.smoothed_landmarks is None:
            self.smoothed_landmarks = [landmark.model_copy() for landmark in landmarks]
            return list(self.smoothed_landmarks)

        alpha = 1.0 - self.smoothing_factor
        smoothed: LandmarkList = []

        for index, landmark in enumerate(landmarks):
            if index < len(self.smoothed_landmarks):
                previous = self.smoothed_landmarks[index]
                smoothed.append(
                    Landmark(
                        x=alpha * landmark.x + (1 - alpha) * previous.x,
                        y=alpha * landmark.y + (1 - alpha) * previous.y,
                        z=alpha * landmark.z + (1 - alpha) * previous.z,
                        visibility=landmark.visibility,
                    )
                )
            else:
                smoothed.append(landmark.model_copy())

        self.smoothed_landmarks = smoothed
        return list(smoothed)

    def _is_pose_stable(self, landmarks: LandmarkList, threshold: float = 0.1) -> bool:
        """Check whether the pose is stable enough to update smoothed landmarks."""
        if self.previous_landmarks is None:
            self.previous_landmarks = [landmark.model_copy() for landmark in landmarks]
            return True

        total_movement = 0.0
        count = 0
        for index, landmark in enumerate(landmarks):
            if index >= len(self.previous_landmarks):
                continue

            previous = self.previous_landmarks[index]
            if landmark.visibility > 0.5 and previous.visibility > 0.5:
                dx = landmark.x - previous.x
                dy = landmark.y - previous.y
                total_movement += math.hypot(dx, dy)
                count += 1

        self.previous_landmarks = [landmark.model_copy() for landmark in landmarks]

        if count == 0:
            return False

        return (total_movement / count) < threshold

    def calculate_angle(self, a: Point2D, b: Point2D, c: Point2D) -> float:
        """Calculate the angle at point ``b`` for the triangle a-b-c."""
        try:
            ba_x = a[0] - b[0]
            ba_y = a[1] - b[1]
            bc_x = c[0] - b[0]
            bc_y = c[1] - b[1]

            numerator = (ba_x * bc_x) + (ba_y * bc_y)
            denominator = (math.hypot(ba_x, ba_y) * math.hypot(bc_x, bc_y)) + 1e-6
            cosine_angle = max(min(numerator / denominator, 1.0), -1.0)
            return math.degrees(math.acos(cosine_angle))
        except Exception as exc:
            logger.error("Error calculating angle", error=str(exc))
            return 0.0

    def get_landmark_point(
        self,
        landmarks: LandmarkList,
        landmark_index: int,
        min_visibility: float = 0.3,
    ) -> Point2D | None:
        """Extract an ``(x, y)`` point when a landmark is sufficiently visible."""
        try:
            if landmark_index >= len(landmarks):
                return None

            landmark = landmarks[landmark_index]
            if landmark.visibility >= min_visibility:
                return (landmark.x, landmark.y)

            logger.debug(
                "Landmark not visible enough",
                landmark_index=landmark_index,
                visibility=landmark.visibility,
                min_visibility=min_visibility,
            )
            return None
        except Exception as exc:
            logger.error("Error extracting landmark", landmark_index=landmark_index, error=str(exc))
            return None

    def cleanup(self) -> None:
        """Release MediaPipe and thread-pool resources."""
        if self.pose is not None:
            self.pose.close()
        self.executor.shutdown(wait=True)
        logger.info("PoseDetector cleanup completed")
