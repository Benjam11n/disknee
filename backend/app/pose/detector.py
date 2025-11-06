import cv2
import numpy as np
import mediapipe as mp
import structlog
from typing import Tuple, Optional, List, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

logger = structlog.get_logger()

class PoseDetector:
    """
    Optimized MediaPipe pose detector for real-time processing
    """

    def __init__(
        self,
        model_complexity: int = 0,  # 0: lite, 1: full, 2: heavy
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
        enable_segmentation: bool = False,
        smooth_landmarks: bool = True,
        static_image_mode: bool = False,
        smoothing_factor: float = 0.7  # Exponential smoothing factor
    ):
        """
        Initialize the MediaPipe pose detector with optimized settings

        Args:
            model_complexity: Complexity of pose landmark model (0=lite, 1=full, 2=heavy)
            min_detection_confidence: Minimum detection confidence threshold
            min_tracking_confidence: Minimum tracking confidence threshold
            enable_segmentation: Whether to enable segmentation mask
            smooth_landmarks: Whether to smooth landmarks across frames
            static_image_mode: Whether to treat input as static images
            smoothing_factor: Exponential smoothing factor (0-1, higher = more smoothing)
        """
        self.model_complexity = model_complexity
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        self.enable_segmentation = enable_segmentation
        self.smooth_landmarks = smooth_landmarks
        self.static_image_mode = static_image_mode
        self.smoothing_factor = smoothing_factor

        # For temporal smoothing
        self.previous_landmarks = None
        self.smoothed_landmarks = None

        # MediaPipe pose solution
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles

        # Thread pool for async processing
        self.executor = ThreadPoolExecutor(max_workers=2)

        # Initialize pose detector
        self.pose = None
        self._initialize_pose()

        # Performance metrics
        self.last_frame_time = 0
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0

        logger.info(
            "PoseDetector initialized",
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

    def _initialize_pose(self):
        """Initialize MediaPipe pose solution"""
        try:
            self.pose = self.mp_pose.Pose(
                model_complexity=self.model_complexity,
                min_detection_confidence=self.min_detection_confidence,
                min_tracking_confidence=self.min_tracking_confidence,
                enable_segmentation=self.enable_segmentation,
                smooth_landmarks=self.smooth_landmarks,
                static_image_mode=self.static_image_mode
            )
            logger.info("MediaPipe Pose initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize MediaPipe Pose", error=str(e))
            raise

    async def process_frame_async(self, frame_bytes: bytes, timestamp: float = None) -> Optional[Dict[str, Any]]:
        """
        Asynchronously process a frame for pose detection

        Args:
            frame_bytes: Raw image bytes
            timestamp: Frame timestamp for FPS calculation

        Returns:
            Dictionary containing pose landmarks and metadata
        """
        loop = asyncio.get_event_loop()

        # Run CPU-intensive processing in thread pool
        try:
            result = await loop.run_in_executor(
                self.executor,
                self._process_frame_sync,
                frame_bytes,
                timestamp or time.time()
            )
            return result
        except Exception as e:
            logger.error("Error in async frame processing", error=str(e))
            return None

    def _process_frame_sync(self, frame_bytes: bytes, timestamp: float) -> Optional[Dict[str, Any]]:
        """
        Synchronously process a frame for pose detection

        Args:
            frame_bytes: Raw image bytes
            timestamp: Frame timestamp for FPS calculation

        Returns:
            Dictionary containing pose landmarks and metadata
        """
        try:
            # Calculate FPS
            self._update_fps(timestamp)

            # Decode image from bytes
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                logger.warning("Failed to decode frame")
                return None

            # Store original dimensions
            original_height, original_width = frame.shape[:2]

            # Convert color space (OpenCV uses BGR, MediaPipe expects RGB)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Process frame
            results = self.pose.process(rgb_frame)

            # Prepare response
            response = {
                "timestamp": timestamp,
                "frame_width": original_width,
                "frame_height": original_height,
                "fps": self.current_fps,
                "landmarks": None,
                "pose_detected": False,
                "visibility_scores": {}
            }

            if results.pose_landmarks:
                # Extract landmarks
                landmarks = []
                visibility_scores = {}

                for idx, landmark in enumerate(results.pose_landmarks.landmark):
                    # Normalize coordinates (0-1 range)
                    landmark_data = {
                        "x": float(landmark.x),
                        "y": float(landmark.y),
                        "z": float(landmark.z),
                        "visibility": float(landmark.visibility)
                    }
                    landmarks.append(landmark_data)

                    # Track visibility for key joints
                    if idx in [
                        self.mp_pose.PoseLandmark.LEFT_KNEE.value,
                        self.mp_pose.PoseLandmark.RIGHT_KNEE.value,
                        self.mp_pose.PoseLandmark.LEFT_ANKLE.value,
                        self.mp_pose.PoseLandmark.RIGHT_ANKLE.value,
                        self.mp_pose.PoseLandmark.LEFT_HIP.value,
                        self.mp_pose.PoseLandmark.RIGHT_HIP.value
                    ]:
                        visibility_scores[idx] = float(landmark.visibility)

                # Check if pose is stable and apply smoothing
                is_stable = self._is_pose_stable(landmarks)

                # Only update if pose is stable or this is the first detection
                if is_stable or self.smoothed_landmarks is None:
                    # Apply temporal smoothing
                    smoothed_landmarks = self._smooth_landmarks(landmarks)
                else:
                    # Use previous smoothed landmarks if pose is too unstable
                    smoothed_landmarks = self.smoothed_landmarks or landmarks

                response.update({
                    "landmarks": smoothed_landmarks,
                    "pose_detected": True,
                    "visibility_scores": visibility_scores,
                    "pose_stable": is_stable
                })

                logger.debug(
                    "Pose detected",
                    landmarks_count=len(landmarks),
                    avg_visibility=np.mean([l["visibility"] for l in landmarks])
                )
            else:
                logger.debug("No pose detected in frame")

            return response

        except Exception as e:
            logger.error("Error processing frame", error=str(e))
            return None

    def _update_fps(self, timestamp: float):
        """Update FPS counter"""
        self.fps_counter += 1

        # Calculate FPS every second
        if timestamp - self.fps_start_time >= 1.0:
            self.current_fps = self.fps_counter / (timestamp - self.fps_start_time)
            self.fps_counter = 0
            self.fps_start_time = timestamp

    def _smooth_landmarks(self, landmarks: List[Dict]) -> List[Dict]:
        """
        Apply exponential smoothing to landmarks to reduce jitter

        Args:
            landmarks: Current frame landmarks

        Returns:
            Smoothed landmarks
        """
        if self.smoothed_landmarks is None:
            # First frame, use as is
            self.smoothed_landmarks = landmarks.copy()
            return self.smoothed_landmarks

        # Apply exponential smoothing
        alpha = 1.0 - self.smoothing_factor  # Invert so higher smoothing_factor = more smoothing

        smoothed = []
        for i, landmark in enumerate(landmarks):
            if i < len(self.smoothed_landmarks):
                prev_landmark = self.smoothed_landmarks[i]
                smoothed_landmark = {
                    "x": alpha * landmark["x"] + (1 - alpha) * prev_landmark["x"],
                    "y": alpha * landmark["y"] + (1 - alpha) * prev_landmark["y"],
                    "z": alpha * landmark["z"] + (1 - alpha) * prev_landmark["z"],
                    "visibility": landmark["visibility"]  # Don't smooth visibility
                }
            else:
                smoothed_landmark = landmark.copy()
            smoothed.append(smoothed_landmark)

        self.smoothed_landmarks = smoothed
        return smoothed

    def _is_pose_stable(self, landmarks: List[Dict], threshold: float = 0.1) -> bool:
        """
        Check if pose is stable (not too much movement from previous frame)

        Args:
            landmarks: Current landmarks
            threshold: Movement threshold

        Returns:
            True if pose is stable
        """
        if self.previous_landmarks is None:
            self.previous_landmarks = landmarks.copy()
            return True

        # Calculate average movement
        total_movement = 0
        count = 0
        for i, landmark in enumerate(landmarks):
            if i < len(self.previous_landmarks):
                prev = self.previous_landmarks[i]
                # Check if both landmarks are visible
                if landmark["visibility"] > 0.5 and prev["visibility"] > 0.5:
                    dx = landmark["x"] - prev["x"]
                    dy = landmark["y"] - prev["y"]
                    movement = (dx ** 2 + dy ** 2) ** 0.5
                    total_movement += movement
                    count += 1

        self.previous_landmarks = landmarks.copy()

        if count == 0:
            return False

        avg_movement = total_movement / count
        return avg_movement < threshold

    def calculate_angle(self, a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
        """
        Calculate angle at point b given three points a-b-c

        Args:
            a, b, c: Points as (x, y) tuples

        Returns:
            Angle in degrees
        """
        try:
            a = np.array(a)
            b = np.array(b)
            c = np.array(c)

            # Calculate vectors
            ba = a - b
            bc = c - b

            # Calculate cosine of angle
            cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
            cosine_angle = np.clip(cosine_angle, -1.0, 1.0)

            # Calculate angle in degrees
            angle = np.degrees(np.arccos(cosine_angle))

            return angle

        except Exception as e:
            logger.error("Error calculating angle", error=str(e))
            return 0.0

    def get_landmark_point(self, landmarks: List[Dict], landmark_index: int, min_visibility: float = 0.3) -> Optional[Tuple[float, float]]:
        """
        Extract (x, y) coordinates for a specific landmark

        Args:
            landmarks: List of landmark dictionaries
            landmark_index: MediaPipe landmark index
            min_visibility: Minimum visibility threshold for landmark

        Returns:
            (x, y) coordinates or None if not found or not visible enough
        """
        try:
            if landmarks and landmark_index < len(landmarks):
                landmark = landmarks[landmark_index]
                # Check visibility threshold
                if landmark.get("visibility", 0) >= min_visibility:
                    return (landmark["x"], landmark["y"])
                else:
                    logger.debug(
                        "Landmark not visible enough",
                        landmark_index=landmark_index,
                        visibility=landmark.get("visibility", 0),
                        min_visibility=min_visibility
                    )
            return None
        except Exception as e:
            logger.error("Error extracting landmark", landmark_index=landmark_index, error=str(e))
            return None

    def cleanup(self):
        """Cleanup resources"""
        if self.pose:
            self.pose.close()
        if self.executor:
            self.executor.shutdown(wait=True)
        logger.info("PoseDetector cleanup completed")