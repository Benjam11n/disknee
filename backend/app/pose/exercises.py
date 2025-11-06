import structlog
from typing import Dict, Any
import time
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

    def to_dict(self) -> Dict[str, Any]:
        """Convert state to dictionary"""
        return {
            "reps": self.reps,
            "timer_started": self.timer_started,
            "ready_for_next": self.ready_for_next,
            "current_angle": self.current_angle,
            "hold_time": self.hold_time,
            "exercise_active": self.exercise_active
        }


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
        "LEFT_TOE": 31
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
                "ankle_hold_threshold": 140,  # degrees
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
        # Get pose detection results
        pose_result = await self.detector.process_frame_async(frame_bytes, timestamp)

        if not pose_result:
            return {
                "pose_detected": False,
                "exercise_state": self.state.to_dict(),
                "exercise_id": self.exercise_id,
                "feedback": "No pose detected"
            }

        # Process exercise-specific logic
        if self.exercise_id in ["ex5", "calf-raises"]:
            exercise_result = self._process_calf_raise(pose_result)
        elif self.exercise_id == "knee-extension":
            exercise_result = self._process_knee_extension(pose_result)
        else:
            exercise_result = {"feedback": "Unknown exercise type"}

        # Combine results
        return {
            "pose_detected": pose_result["pose_detected"],
            "landmarks": pose_result.get("landmarks"),
            "fps": pose_result.get("fps"),
            "exercise_state": self.state.to_dict(),
            "exercise_id": self.exercise_id,
            "feedback": exercise_result.get("feedback"),
            "angles": exercise_result.get("angles", {}),
            "rep_completed": exercise_result.get("rep_completed", False)
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
            return {"feedback": "No landmarks detected"}

        # Get right leg landmarks
        hip = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_HIP"])
        knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_KNEE"])
        ankle = self.detector.get_landmark_point(landmarks, self.LANDMARKS["RIGHT_ANKLE"])

        if not all([hip, knee, ankle]):
            # Try left leg if right leg not visible
            hip = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_HIP"])
            knee = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_KNEE"])
            ankle = self.detector.get_landmark_point(landmarks, self.LANDMARKS["LEFT_ANKLE"])

        if not all([hip, knee, ankle]):
            return {"feedback": "Required landmarks not visible"}

        # Calculate knee angle
        knee_angle = self.detector.calculate_angle(hip, knee, ankle)
        self.state.current_angle = round(knee_angle, 1)

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

    def reset_state(self):
        """Reset exercise state"""
        self.state.reset()
        logger.info("Exercise state reset", exercise_id=self.exercise_id)

    def cleanup(self):
        """Cleanup resources"""
        if self.detector:
            self.detector.cleanup()
        logger.info("ExerciseProcessor cleanup completed", exercise_id=self.exercise_id)