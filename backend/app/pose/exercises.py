import structlog
from typing import Dict, Any
import time
import math
import numpy as np
from .detector import PoseDetector

logger = structlog.get_logger()

class ExerciseState:
    """Base class for exercise state management"""

    def __init__(self):
        self.reps = 0
        self.timer_started = False
        self.start_time = None
        self.ready_for_next = True
        self.current_angle = None
        self.hold_time = 0
        self.last_rep_time = 0
        self.exercise_active = False
        self.last_valid_angle = None
        self.smoothed_angle = None
        self.angle_history = []  # For moving average
        self.max_history = 3

    def reset(self):
        """Reset exercise state"""
        self.reps = 0
        self.timer_started = False
        self.start_time = None
        self.ready_for_next = True
        self.current_angle = None
        self.hold_time = 0
        self.last_rep_time = 0
        self.exercise_active = False
        self.last_valid_angle = None
        self.smoothed_angle = None
        self.angle_history = []

    def to_dict(self) -> Dict[str, Any]:
        """Convert state to dictionary"""
        return {
            "reps": self.reps,
            "timer_started": self.timer_started,
            "ready_for_next": self.ready_for_next,
            "current_angle": self.smoothed_angle or self.current_angle,
            "hold_time": self.hold_time,
            "exercise_active": self.exercise_active
        }

    def smooth_angle(self, new_angle: float, smoothing_factor: float = 0.7) -> float:
        """
        Apply exponential smoothing to angle values

        Args:
            new_angle: New angle measurement
            smoothing_factor: Smoothing factor (0-1)

        Returns:
            Smoothed angle
        """
        if self.smoothed_angle is None:
            self.smoothed_angle = new_angle
            return new_angle

        # Apply exponential smoothing
        self.smoothed_angle = smoothing_factor * self.smoothed_angle + (1 - smoothing_factor) * new_angle
        return self.smoothed_angle

    def moving_average_angle(self, new_angle: float) -> float:
        """
        Apply moving average to angle values

        Args:
            new_angle: New angle measurement

        Returns:
            Moving averaged angle
        """
        self.angle_history.append(new_angle)
        if len(self.angle_history) > self.max_history:
            self.angle_history.pop(0)

        if len(self.angle_history) == 0:
            return new_angle

        return sum(self.angle_history) / len(self.angle_history)


class CalfRaiseState(ExerciseState):
    """State for calf raise exercise (ex5)"""

    def __init__(self):
        super().__init__()
        self.ankle_visible = False


class ExerciseProcessor:
    """
    Processes pose data for different exercises and tracks state
    """

    # MediaPipe landmark indices
    LANDMARKS = {
        "RIGHT_HIP": 24,
        "RIGHT_KNEE": 26,
        "RIGHT_ANKLE": 28,
        "RIGHT_TOE": 32,
        "LEFT_HIP": 23,
        "LEFT_KNEE": 25,
        "LEFT_ANKLE": 27,
        "LEFT_TOE": 31,
        "RIGHT_SHOULDER": 12,
        "LEFT_SHOULDER": 11
    }

    def __init__(self, exercise_id: str):
        """
        Initialize exercise processor

        Args:
            exercise_id: Identifier for the exercise type
        """
        self.exercise_id = exercise_id
        self.detector = PoseDetector()
        self.state = self._create_exercise_state(exercise_id)

        # Exercise-specific parameters
        self.exercise_params = self._get_exercise_params(exercise_id)

        # Frame processing control
        self.frame_count = 0
        self.process_every_n_frames = 1  # Process every frame for now
        self.last_processed_time = 0
        self.min_process_interval = 0.05  # Minimum 50ms between processing

        logger.info(
            "ExerciseProcessor initialized",
            exercise_id=exercise_id,
            params=self.exercise_params
        )

    def _create_exercise_state(self, exercise_id: str) -> ExerciseState:
        """Create appropriate state object for exercise"""
        if exercise_id == "ex5" or exercise_id == "calf-raises":
            return CalfRaiseState()
        return ExerciseState()

    def _get_exercise_params(self, exercise_id: str) -> Dict[str, Any]:
        """Get exercise-specific parameters"""
        params = {
            "ex5": {
                "name": "Seated Calf Raise",
                "hold_time_required": 3.0,
                "ankle_hold_threshold": 135,  # degrees
                "ankle_reset_threshold": 120,  # degrees
                "min_visibility": 0.5,
                "target_reps": 5
            },
            "knee-extension": {
                "name": "Knee Extension",
                "hold_time_required": 2.0,
                "knee_extend_threshold": 160,  # Nearly straight
                "knee_reset_threshold": 100,   # Bent position
                "min_visibility": 0.5,
                "target_reps": 5
            },
            "squat": {
                "name": "Spanish Squat",
                "hold_time_required": 1.0,     # Hold at bottom
                "hip_depth_threshold": 120,    # Hip angle for squat depth
                "hip_reset_threshold": 160,     # Hip angle when standing
                "knee_depth_threshold": 90,    # Optional: track knee angle too
                "min_visibility": 0.5,
                "target_reps": 5
            },
            "hip-abduction": {
                "name": "Hip Abduction",
                "hold_time_required": 1.0,     # Hold at top
                "hip_abduct_threshold": 45,    # Minimum abduction angle
                "hip_reset_threshold": 15,     # Reset position
                "min_visibility": 0.5,
                "target_reps": 15
            },
            "step-down": {
                "name": "Step-Down",
                "hold_time_required": 1.0,     # Hold at bottom
                "knee_flex_threshold": 85,     # Knee angle when stepping down
                "knee_extend_threshold": 165,  # Knee angle when standing
                "hip_flex_threshold": 100,     # Hip angle when stepping down
                "hip_extend_threshold": 170,   # Hip angle when standing
                "min_visibility": 0.5,
                "target_reps": 10
            }
        }
        return params.get(exercise_id, params["ex5"])

    async def process_frame(self, frame_bytes: bytes, timestamp: float) -> Dict[str, Any]:
        """
        Process a frame and update exercise state

        Args:
            frame_bytes: Raw image bytes
            timestamp: Frame timestamp

        Returns:
            Dictionary with pose data and exercise state
        """
        # Frame skipping logic
        self.frame_count += 1

        # Skip frames if we processed too recently
        if timestamp - self.last_processed_time < self.min_process_interval:
            # Still get pose for skeleton display but don't process exercise logic
            pose_result = await self.detector.process_frame_async(frame_bytes, timestamp)
            return {
                "pose_detected": pose_result.get("pose_detected", False) if pose_result else False,
                "landmarks": pose_result.get("landmarks") if pose_result else None,
                "exercise_state": self.state.to_dict(),
                "exercise_id": self.exercise_id,
                "feedback": "Processing...",
                "skipped": True
            }

        # Only process every Nth frame
        if self.frame_count % self.process_every_n_frames != 0:
            # Still get pose for skeleton display
            pose_result = await self.detector.process_frame_async(frame_bytes, timestamp)
            return {
                "pose_detected": pose_result.get("pose_detected", False) if pose_result else False,
                "landmarks": pose_result.get("landmarks") if pose_result else None,
                "exercise_state": self.state.to_dict(),
                "exercise_id": self.exercise_id,
                "feedback": "Tracking...",
                "skipped": True
            }

        # Get pose detection results
        pose_result = await self.detector.process_frame_async(frame_bytes, timestamp)

        if not pose_result:
            self.last_processed_time = timestamp
            return {
                "pose_detected": False,
                "exercise_state": self.state.to_dict(),
                "exercise_id": self.exercise_id,
                "feedback": "No pose detected"
            }

        # Check overall pose confidence
        visibility_scores = pose_result.get("visibility_scores", {})
        avg_visibility = 0
        key_landmarks = [self.LANDMARKS["RIGHT_HIP"], self.LANDMARKS["RIGHT_KNEE"], self.LANDMARKS["RIGHT_ANKLE"]]

        for landmark_idx in key_landmarks:
            avg_visibility += visibility_scores.get(landmark_idx, 0)

        avg_visibility /= len(key_landmarks)

        # Skip if visibility is too low
        if avg_visibility < 0.2:
            self.last_processed_time = timestamp
            return {
                "pose_detected": False,
                "exercise_state": self.state.to_dict(),
                "exercise_id": self.exercise_id,
                "feedback": "Position yourself better in camera",
                "avg_visibility": avg_visibility
            }

        # Process exercise-specific logic
        if self.exercise_id in ["ex5", "calf-raises"]:
            exercise_result = self._process_calf_raise(pose_result)
        elif self.exercise_id == "knee-extension":
            exercise_result = self._process_knee_extension(pose_result)
        elif self.exercise_id == "squat":
            exercise_result = self._process_squat(pose_result)
        elif self.exercise_id == "hip-abduction":
            exercise_result = self._process_hip_abduction(pose_result)
        elif self.exercise_id == "step-down":
            exercise_result = self._process_step_down(pose_result)
        else:
            exercise_result = {"feedback": f"Exercise type '{self.exercise_id}' not supported"}

        self.last_processed_time = timestamp

        # Combine results
        return {
            "pose_detected": pose_result["pose_detected"],
            "landmarks": pose_result.get("landmarks"),
            "fps": pose_result.get("fps"),
            "exercise_state": self.state.to_dict(),
            "exercise_id": self.exercise_id,
            "feedback": exercise_result.get("feedback"),
            "angles": exercise_result.get("angles", {}),
            "rep_completed": exercise_result.get("rep_completed", False),
            "avg_visibility": avg_visibility,
            "pose_stable": pose_result.get("pose_stable", True)
        }

    def _process_calf_raise(self, pose_result: Dict[str, Any]) -> Dict[str, Any]:
        """Process calf raise exercise logic"""
        landmarks = pose_result.get("landmarks")
        if not landmarks:
            return {"feedback": "No landmarks detected"}

        # Get right leg landmarks
        knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_KNEE"])
        ankle = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_ANKLE"])
        toe = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_TOE"])

        if not all([knee, ankle, toe]):
            # Try left leg if right leg not visible
            knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_KNEE"])
            ankle = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_ANKLE"])
            toe = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_TOE"])

        if not all([knee, ankle, toe]):
            return {"feedback": "Required landmarks not visible"}

        # Check ankle visibility
        ankle_idx = self.LANDMARKS["RIGHT_ANKLE"]
        ankle_visibility = pose_result.get("visibility_scores", {}).get(ankle_idx, 0)

        if ankle_visibility < self.exercise_params["min_visibility"]:
            self.state.ankle_visible = False
            self.state.timer_started = False
            self.state.hold_time = 0
            self.state.current_angle = None
            return {"feedback": "Ankle not clearly visible", "angles": {}}

        self.state.ankle_visible = True
        self.state.exercise_active = True

        # Calculate ankle angle
        ankle_angle = self.detector.calculate_angle(knee, ankle, toe)
        self.state.current_angle = round(ankle_angle, 1)

        # Exercise logic
        params = self.exercise_params
        rep_completed = False
        feedback = ""

        # Check if ankle is raised enough
        if ankle_angle >= params["ankle_hold_threshold"] and self.state.ready_for_next:
            if not self.state.timer_started:
                self.state.timer_started = True
                self.state.start_time = time.time()
                feedback = "Hold position..."
            else:
                self.state.hold_time = time.time() - (self.state.start_time or time.time())
                feedback = f"Hold: {self.state.hold_time:.1f}s"

                # Count rep if held long enough
                if self.state.hold_time >= params["hold_time_required"]:
                    self.state.reps += 1
                    self.state.timer_started = False
                    self.state.start_time = None
                    self.state.ready_for_next = False
                    self.state.hold_time = 0
                    self.state.last_rep_time = time.time()
                    rep_completed = True
                    feedback = f"Rep {self.state.reps} completed!"

        else:
            # Stop timer if angle drops
            if self.state.timer_started:
                self.state.timer_started = False
                self.state.start_time = None
                self.state.hold_time = 0
                feedback = "Lower your foot and try again"

            # Reset condition - ankle lowered enough
            if ankle_angle <= params["ankle_reset_threshold"]:
                self.state.ready_for_next = True
                if not self.state.exercise_active:
                    feedback = "Ready! Raise your heel"

        # Progress feedback
        if self.state.reps >= params["target_reps"]:
            feedback = f"Exercise complete! {self.state.reps} reps done!"
        elif not feedback:
            feedback = f"Ankle: {self.state.current_angle}° | Reps: {self.state.reps}/{params['target_reps']}"

        return {
            "feedback": feedback,
            "angles": {
                "ankle": self.state.current_angle
            },
            "rep_completed": rep_completed
        }

    def _process_knee_extension(self, pose_result: Dict[str, Any]) -> Dict[str, Any]:
        """Process knee extension exercise logic"""
        landmarks = pose_result.get("landmarks")
        if not landmarks:
            self.state.exercise_active = False
            return {"feedback": "No landmarks detected"}

        # Check if pose is stable
        pose_stable = pose_result.get("pose_stable", True)
        if not pose_stable:
            # Skip processing if pose is too unstable
            feedback = f"Knee: {self.state.smoothed_angle or 'N/A'}° | Reps: {self.state.reps}/{params['target_reps']}" if hasattr(self, 'params') else "Keep still..."
            return {
                "feedback": feedback,
                "angles": {"knee": self.state.smoothed_angle},
                "rep_completed": False
            }

        # Get right leg landmarks with visibility check
        min_visibility = 0.3
        hip = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_HIP"], min_visibility)
        knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_KNEE"], min_visibility)
        ankle = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_ANKLE"], min_visibility)

        use_left_leg = False
        if not all([hip, knee, ankle]):
            # Try left leg if right leg not visible
            hip = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_HIP"], min_visibility)
            knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_KNEE"], min_visibility)
            ankle = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_ANKLE"], min_visibility)
            use_left_leg = True

        if not all([hip, knee, ankle]):
            self.state.exercise_active = False
            self.state.current_angle = None
            leg_type = "left" if use_left_leg else "right"
            return {"feedback": f"Required {leg_type} leg landmarks not visible", "angles": {}}

        # Calculate knee angle
        knee_angle = self.detector.calculate_angle(hip, knee, ankle)

        # Validate angle (should be reasonable range for knee extension)
        if knee_angle < 30 or knee_angle > 180:
            logger.warning(f"Invalid knee angle detected: {knee_angle:.1f}°")
            return {
                "feedback": f"Invalid angle detected. Adjust position.",
                "angles": {"knee": self.state.smoothed_angle}
            }

        # Apply smoothing to angle
        smoothed_angle = self.state.smooth_angle(knee_angle, 0.7)
        self.state.current_angle = round(smoothed_angle, 1)
        self.state.exercise_active = True

        # Exercise logic (simplified version)
        params = self.exercise_params
        rep_completed = False
        feedback = ""

        # Check if knee is extended
        if knee_angle >= params["knee_extend_threshold"] and self.state.ready_for_next:
            if not self.state.timer_started:
                self.state.timer_started = True
                self.state.start_time = time.time()
                feedback = "Hold extension..."
            else:
                self.state.hold_time = time.time() - (self.state.start_time or time.time())
                feedback = f"Hold: {self.state.hold_time:.1f}s"

                # Count rep if held long enough
                if self.state.hold_time >= params["hold_time_required"]:
                    self.state.reps += 1
                    self.state.timer_started = False
                    self.state.start_time = None
                    self.state.ready_for_next = False
                    self.state.hold_time = 0
                    rep_completed = True
                    feedback = f"Rep {self.state.reps} completed!"
        else:
            # Stop timer if angle drops
            if self.state.timer_started:
                self.state.timer_started = False
                self.state.start_time = None
                self.state.hold_time = 0

            # Reset condition
            if knee_angle <= params["knee_reset_threshold"]:
                self.state.ready_for_next = True

        if not feedback:
            feedback = f"Knee: {self.state.current_angle}° | Reps: {self.state.reps}/{params['target_reps']}"

        return {
            "feedback": feedback,
            "angles": {
                "knee": self.state.current_angle
            },
            "rep_completed": rep_completed
        }

    def _process_squat(self, pose_result: Dict[str, Any]) -> Dict[str, Any]:
        """Process squat exercise logic"""
        landmarks = pose_result.get("landmarks")
        if not landmarks:
            self.state.exercise_active = False
            return {"feedback": "No landmarks detected"}

        # Check if pose is stable
        pose_stable = pose_result.get("pose_stable", True)
        if not pose_stable:
            feedback = f"Hip: {self.state.smoothed_angle or 'N/A'}° | Reps: {self.state.reps}/{params['target_reps']}" if hasattr(self, 'params') else "Keep still..."
            return {
                "feedback": feedback,
                "angles": {"hip": self.state.smoothed_angle},
                "rep_completed": False
            }

        # Get landmarks for squat tracking
        min_visibility = 0.3
        shoulder = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_SHOULDER"], min_visibility)
        hip = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_HIP"], min_visibility)
        knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_KNEE"], min_visibility)

        use_left_side = False
        if not all([shoulder, hip, knee]):
            # Try left side if right side not visible
            shoulder = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_SHOULDER"], min_visibility)
            hip = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_HIP"], min_visibility)
            knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_KNEE"], min_visibility)
            use_left_side = True

        if not all([shoulder, hip, knee]):
            self.state.exercise_active = False
            self.state.current_angle = None
            side = "left" if use_left_side else "right"
            return {"feedback": f"Required {side} side landmarks not visible", "angles": {}}

        # Calculate hip angle (shoulder-hip-knee)
        hip_angle = self.detector.calculate_angle(shoulder, hip, knee)

        # Validate angle
        if hip_angle < 40 or hip_angle > 180:
            logger.warning(f"Invalid hip angle detected: {hip_angle:.1f}°")
            return {
                "feedback": f"Invalid position detected. Adjust form.",
                "angles": {"hip": self.state.smoothed_angle}
            }

        # Apply smoothing to angle
        smoothed_angle = self.state.smooth_angle(hip_angle, 0.7)
        self.state.current_angle = round(smoothed_angle, 1)
        self.state.exercise_active = True

        # Exercise logic
        params = self.exercise_params
        rep_completed = False
        feedback = ""

        # Check if in squat position (hip angle below threshold)
        if hip_angle <= params["hip_depth_threshold"] and self.state.ready_for_next:
            if not self.state.timer_started:
                self.state.timer_started = True
                self.state.start_time = time.time()
                feedback = "Hold at bottom..."
            else:
                self.state.hold_time = time.time() - (self.state.start_time or time.time())
                feedback = f"Hold: {self.state.hold_time:.1f}s"

                # Count rep if held long enough
                if self.state.hold_time >= params["hold_time_required"]:
                    self.state.reps += 1
                    self.state.timer_started = False
                    self.state.start_time = None
                    self.state.ready_for_next = False
                    self.state.hold_time = 0
                    rep_completed = True
                    feedback = f"Rep {self.state.reps} completed!"
        else:
            # Stop timer if angle rises above threshold
            if self.state.timer_started:
                self.state.timer_started = False
                self.state.start_time = None
                self.state.hold_time = 0

            # Reset condition (standing up)
            if hip_angle >= params["hip_reset_threshold"]:
                self.state.ready_for_next = True

        if not feedback:
            feedback = f"Hip: {self.state.current_angle}° | Reps: {self.state.reps}/{params['target_reps']}"

        return {
            "feedback": feedback,
            "angles": {
                "hip": self.state.current_angle
            },
            "rep_completed": rep_completed
        }

    def _process_hip_abduction(self, pose_result: Dict[str, Any]) -> Dict[str, Any]:
        """Process hip abduction exercise logic"""
        landmarks = pose_result.get("landmarks")
        if not landmarks:
            self.state.exercise_active = False
            return {"feedback": "No landmarks detected"}

        # Check if pose is stable
        pose_stable = pose_result.get("pose_stable", True)
        if not pose_stable:
            feedback = f"Hip: {self.state.smoothed_angle or 'N/A'}° | Reps: {self.state.reps}/{params['target_reps']}" if hasattr(self, 'params') else "Keep still..."
            return {
                "feedback": feedback,
                "angles": {"hip": self.state.smoothed_angle},
                "rep_completed": False
            }

        # Get landmarks for hip abduction tracking
        min_visibility = 0.3
        hip = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_HIP"], min_visibility)
        knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_KNEE"], min_visibility)
        ankle = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_ANKLE"], min_visibility)

        use_left_leg = False
        if not all([hip, knee, ankle]):
            # Try left leg if right leg not visible
            hip = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_HIP"], min_visibility)
            knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_KNEE"], min_visibility)
            ankle = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_ANKLE"], min_visibility)
            use_left_leg = True

        if not all([hip, knee, ankle]):
            self.state.exercise_active = False
            self.state.current_angle = None
            leg_type = "left" if use_left_leg else "right"
            return {"feedback": f"Required {leg_type} leg landmarks not visible", "angles": {}}

        # Calculate hip abduction angle
        # This is the angle between vertical line through hip and line from hip to ankle
        # For simplicity, we'll use the horizontal displacement
        hip_x, hip_y = hip
        ankle_x, ankle_y = ankle

        # Calculate abduction angle
        horizontal_distance = abs(ankle_x - hip_x)
        vertical_distance = abs(hip_y - ankle_y) if hip_y > ankle_y else 0.1

        # Calculate angle in degrees (arctan of horizontal/vertical)
        abduction_angle = math.degrees(math.atan(horizontal_distance / (vertical_distance + 0.1)))

        # Scale to more reasonable values (0-90 degrees)
        abduction_angle = min(abduction_angle, 90)

        # Validate angle
        if abduction_angle < 0 or abduction_angle > 90:
            logger.warning(f"Invalid abduction angle detected: {abduction_angle:.1f}°")
            return {
                "feedback": f"Invalid position detected. Adjust form.",
                "angles": {"hip": self.state.smoothed_angle}
            }

        # Apply smoothing to angle
        smoothed_angle = self.state.smooth_angle(abduction_angle, 0.7)
        self.state.current_angle = round(smoothed_angle, 1)
        self.state.exercise_active = True

        # Exercise logic
        params = self.exercise_params
        rep_completed = False
        feedback = ""

        # Check if leg is lifted enough
        if abduction_angle >= params["hip_abduct_threshold"] and self.state.ready_for_next:
            if not self.state.timer_started:
                self.state.timer_started = True
                self.state.start_time = time.time()
                feedback = "Hold position..."
            else:
                self.state.hold_time = time.time() - (self.state.start_time or time.time())
                feedback = f"Hold: {self.state.hold_time:.1f}s"

                # Count rep if held long enough
                if self.state.hold_time >= params["hold_time_required"]:
                    self.state.reps += 1
                    self.state.timer_started = False
                    self.state.start_time = None
                    self.state.ready_for_next = False
                    self.state.hold_time = 0
                    rep_completed = True
                    feedback = f"Rep {self.state.reps} completed!"
        else:
            # Stop timer if angle drops
            if self.state.timer_started:
                self.state.timer_started = False
                self.state.start_time = None
                self.state.hold_time = 0

            # Reset condition (leg returned to center)
            if abduction_angle <= params["hip_reset_threshold"]:
                self.state.ready_for_next = True

        if not feedback:
            feedback = f"Hip: {self.state.current_angle}° | Reps: {self.state.reps}/{params['target_reps']}"

        return {
            "feedback": feedback,
            "angles": {
                "hip": self.state.current_angle
            },
            "rep_completed": rep_completed
        }

    def _process_step_down(self, pose_result: Dict[str, Any]) -> Dict[str, Any]:
        """Process step-down exercise tracking both knee and hip angles"""
        params = self.exercise_params
        rep_completed = False
        feedback = ""

        # Calculate knee angle
        knee_angle = self.detector.calculate_angle(
            pose_result["landmarks"],
            self.LANDMARKS["RIGHT_HIP"],
            self.LANDMARKS["RIGHT_KNEE"],
            self.LANDMARKS["RIGHT_ANKLE"]
        )

        # Calculate hip angle
        hip_angle = self.detector.calculate_angle(
            pose_result["landmarks"],
            self.LANDMARKS["RIGHT_SHOULDER"],
            self.LANDMARKS["RIGHT_HIP"],
            self.LANDMARKS["RIGHT_KNEE"]
        )

        if knee_angle is not None and hip_angle is not None:
            # Apply smoothing to both angles
            knee_angle = self.state.smooth_angle(knee_angle)
            hip_angle = self.state.smooth_angle(hip_angle)
            self.state.current_angle = knee_angle  # Primary angle for display

            # Check if in stepped-down position (both knee flexed and hip flexed)
            in_step_position = (knee_angle <= params["knee_flex_threshold"] and
                               hip_angle <= params["hip_flex_threshold"])

            # Check if in standing position (both extended)
            in_standing_position = (knee_angle >= params["knee_extend_threshold"] and
                                  hip_angle >= params["hip_extend_threshold"])

            # If in step position and ready for next rep
            if in_step_position and self.state.ready_for_next:
                if not self.state.timer_started:
                    self.state.timer_started = True
                    self.state.start_time = time.time()
                    self.state.exercise_active = True
                    feedback = f"Hold... ({self.state.hold_time:.1f}s)"
                else:
                    self.state.hold_time = time.time() - self.state.start_time
                    feedback = f"Hold... ({self.state.hold_time:.1f}s)"

                    # Check if hold time requirement met
                    if self.state.hold_time >= params["hold_time_required"]:
                        self.state.reps += 1
                        self.state.ready_for_next = False
                        self.state.timer_started = False
                        self.state.start_time = None
                        self.state.hold_time = 0
                        rep_completed = True
                        feedback = f"Rep {self.state.reps} completed!"

            # If in standing position and not ready, reset for next rep
            elif in_standing_position and not self.state.ready_for_next:
                self.state.ready_for_next = True
                feedback = "Good! Return to step position"

            # Stop timer if not in step position
            elif not in_step_position and self.state.timer_started:
                self.state.timer_started = False
                self.state.start_time = None
                self.state.hold_time = 0

            if not feedback:
                feedback = f"Knee: {knee_angle:.0f}° | Hip: {hip_angle:.0f}° | Reps: {self.state.reps}/{params['target_reps']}"
        else:
            feedback = "Position yourself better in camera"

        return {
            "feedback": feedback,
            "angles": {
                "knee": knee_angle,
                "hip": hip_angle
            },
            "rep_completed": rep_completed
        }

    def reset_state(self):
        """Reset exercise state"""
        self.state.reset()
        logger.info("Exercise state reset", exercise_id=self.exercise_id)

    def cleanup(self):
        """Cleanup resources"""
        if self.detector:
            self.detector.cleanup()
        logger.info("ExerciseProcessor cleanup completed", exercise_id=self.exercise_id)