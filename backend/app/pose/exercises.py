from __future__ import annotations

import math
import time
from dataclasses import asdict, dataclass, field
from typing import TypeAlias, cast

import structlog

from app.models.pose import ExerciseFeedback, ExerciseStateSnapshot, Landmark, PoseData, PoseDetectionResult
from app.pose.detector import PoseDetector

logger = structlog.get_logger()

Point2D: TypeAlias = tuple[float, float]
AngleMap: TypeAlias = dict[str, float | None]


@dataclass(slots=True)
class ExerciseParams:
    name: str
    hold_time_required: float
    min_visibility: float
    target_reps: int
    ankle_hold_threshold: float | None = None
    ankle_reset_threshold: float | None = None
    knee_extend_threshold: float | None = None
    knee_reset_threshold: float | None = None
    hip_depth_threshold: float | None = None
    hip_reset_threshold: float | None = None
    knee_depth_threshold: float | None = None
    hip_abduct_threshold: float | None = None
    knee_flex_threshold: float | None = None
    hip_flex_threshold: float | None = None
    hip_extend_threshold: float | None = None


@dataclass(slots=True)
class ExerciseState:
    reps: int = 0
    timer_started: bool = False
    start_time: float | None = None
    ready_for_next: bool = True
    current_angle: float | None = None
    hold_time: float = 0.0
    last_rep_time: float = 0.0
    exercise_active: bool = False
    last_valid_angle: float | None = None
    smoothed_angle: float | None = None
    angle_history: list[float] = field(default_factory=list)
    max_history: int = 3
    exercise_in_squat: bool = False

    def reset(self) -> None:
        self.reps = 0
        self.timer_started = False
        self.start_time = None
        self.ready_for_next = True
        self.current_angle = None
        self.hold_time = 0.0
        self.last_rep_time = 0.0
        self.exercise_active = False
        self.last_valid_angle = None
        self.smoothed_angle = None
        self.angle_history.clear()
        self.exercise_in_squat = False

    def to_snapshot(self, target_reps: int) -> ExerciseStateSnapshot:
        return ExerciseStateSnapshot(
            reps=self.reps,
            timer_started=self.timer_started,
            ready_for_next=self.ready_for_next,
            current_angle=self.smoothed_angle if self.smoothed_angle is not None else self.current_angle,
            hold_time=self.hold_time,
            exercise_active=self.exercise_active,
            target_reps=target_reps,
        )

    def smooth_angle(self, new_angle: float, smoothing_factor: float = 0.7) -> float:
        if self.smoothed_angle is None:
            self.smoothed_angle = new_angle
            return new_angle

        self.smoothed_angle = (smoothing_factor * self.smoothed_angle) + ((1 - smoothing_factor) * new_angle)
        return self.smoothed_angle

    def moving_average_angle(self, new_angle: float) -> float:
        self.angle_history.append(new_angle)
        if len(self.angle_history) > self.max_history:
            self.angle_history.pop(0)
        return sum(self.angle_history) / len(self.angle_history)


@dataclass(slots=True)
class CalfRaiseState(ExerciseState):
    ankle_visible: bool = False

    def reset(self) -> None:
        super().reset()
        self.ankle_visible = False


class ExerciseProcessor:
    """Translate pose landmarks into exercise-specific feedback and state."""

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
        "LEFT_SHOULDER": 11,
    }

    def __init__(self, exercise_id: str) -> None:
        self.exercise_id = exercise_id
        self.detector = PoseDetector()
        self.state = self._create_exercise_state(exercise_id)
        self.exercise_params = self._get_exercise_params(exercise_id)
        self.frame_count = 0
        self.process_every_n_frames = 2
        self.last_processed_time = 0.0
        self.min_process_interval_ms = 50.0

        logger.info(
            "ExerciseProcessor initialized",
            exercise_id=exercise_id,
            params=asdict(self.exercise_params),
        )

    def _create_exercise_state(self, exercise_id: str) -> ExerciseState:
        if exercise_id in {"ex5", "calf-raises"}:
            return CalfRaiseState()
        return ExerciseState()

    def _get_exercise_params(self, exercise_id: str) -> ExerciseParams:
        params = {
            "ex5": ExerciseParams(
                name="Seated Calf Raise",
                hold_time_required=3.0,
                ankle_hold_threshold=135.0,
                ankle_reset_threshold=120.0,
                min_visibility=0.5,
                target_reps=5,
            ),
            "calf-raises": ExerciseParams(
                name="Calf Raise",
                hold_time_required=3.0,
                ankle_hold_threshold=135.0,
                ankle_reset_threshold=120.0,
                min_visibility=0.5,
                target_reps=5,
            ),
            "knee-extension": ExerciseParams(
                name="Knee Extension",
                hold_time_required=2.0,
                knee_extend_threshold=160.0,
                knee_reset_threshold=100.0,
                min_visibility=0.5,
                target_reps=5,
            ),
            "squat": ExerciseParams(
                name="Spanish Squat",
                hold_time_required=1.0,
                hip_depth_threshold=120.0,
                hip_reset_threshold=160.0,
                knee_depth_threshold=90.0,
                min_visibility=0.5,
                target_reps=5,
            ),
            "simple-squat": ExerciseParams(
                name="Simple Squat",
                hold_time_required=0.0,
                hip_depth_threshold=120.0,
                hip_reset_threshold=160.0,
                knee_depth_threshold=90.0,
                min_visibility=0.5,
                target_reps=10,
            ),
            "hip-abduction": ExerciseParams(
                name="Hip Abduction",
                hold_time_required=1.0,
                hip_abduct_threshold=45.0,
                hip_reset_threshold=15.0,
                min_visibility=0.5,
                target_reps=15,
            ),
            "step-down": ExerciseParams(
                name="Step-Down",
                hold_time_required=1.0,
                knee_flex_threshold=85.0,
                knee_extend_threshold=165.0,
                hip_flex_threshold=100.0,
                hip_extend_threshold=170.0,
                min_visibility=0.5,
                target_reps=10,
            ),
        }
        return params.get(exercise_id, params["ex5"])

    async def process_frame(self, frame_bytes: bytes, timestamp_ms: float) -> PoseData:
        self.frame_count += 1
        pose_result = await self.detector.process_frame_async(frame_bytes, timestamp_ms)
        target_reps = self.exercise_params.target_reps

        if pose_result is None:
            self.last_processed_time = timestamp_ms
            return self._build_pose_data(
                pose_result=None,
                feedback=ExerciseFeedback(feedback="No pose detected"),
                target_reps=target_reps,
            )

        should_skip_processing = (
            self.frame_count > 1
            and (
                timestamp_ms - self.last_processed_time < self.min_process_interval_ms
                or (self.frame_count - 1) % self.process_every_n_frames != 0
            )
        )
        if should_skip_processing:
            return self._build_pose_data(
                pose_result=pose_result,
                feedback=ExerciseFeedback(feedback="Tracking..."),
                target_reps=target_reps,
                skipped=True,
            )

        avg_visibility = self._calculate_avg_visibility(pose_result)
        if avg_visibility < 0.2:
            self.last_processed_time = timestamp_ms
            return self._build_pose_data(
                pose_result=pose_result,
                feedback=ExerciseFeedback(feedback="Position yourself better in camera"),
                target_reps=target_reps,
                avg_visibility=avg_visibility,
                pose_detected=False,
            )

        exercise_result = self._run_exercise_handler(pose_result)
        self.last_processed_time = timestamp_ms

        return self._build_pose_data(
            pose_result=pose_result,
            feedback=exercise_result,
            target_reps=target_reps,
            avg_visibility=avg_visibility,
        )

    def _run_exercise_handler(self, pose_result: PoseDetectionResult) -> ExerciseFeedback:
        if self.exercise_id in {"ex5", "calf-raises"}:
            return self._process_calf_raise(pose_result)
        if self.exercise_id == "knee-extension":
            return self._process_knee_extension(pose_result)
        if self.exercise_id == "squat":
            return self._process_squat(pose_result)
        if self.exercise_id == "simple-squat":
            return self._process_simple_squat(pose_result)
        if self.exercise_id == "hip-abduction":
            return self._process_hip_abduction(pose_result)
        if self.exercise_id == "step-down":
            return self._process_step_down(pose_result)
        return ExerciseFeedback(feedback=f"Exercise type '{self.exercise_id}' not supported")

    def _build_pose_data(
        self,
        pose_result: PoseDetectionResult | None,
        feedback: ExerciseFeedback,
        target_reps: int,
        *,
        avg_visibility: float | None = None,
        skipped: bool | None = None,
        pose_detected: bool | None = None,
    ) -> PoseData:
        resolved_pose_detected = pose_detected if pose_detected is not None else (
            pose_result.pose_detected if pose_result is not None else False
        )
        return PoseData(
            pose_detected=resolved_pose_detected,
            landmarks=pose_result.landmarks if pose_result is not None else None,
            fps=pose_result.fps if pose_result is not None else None,
            exercise_state=self.state.to_snapshot(target_reps),
            exercise_id=self.exercise_id,
            feedback=feedback.feedback,
            angles=feedback.angles,
            rep_completed=feedback.rep_completed,
            avg_visibility=avg_visibility,
            pose_stable=pose_result.pose_stable if pose_result is not None else True,
            server_timestamp_ms=time.time() * 1000,
            skipped=skipped,
        )

    def _calculate_avg_visibility(self, pose_result: PoseDetectionResult) -> float:
        key_landmarks = [
            self.LANDMARKS["RIGHT_HIP"],
            self.LANDMARKS["RIGHT_KNEE"],
            self.LANDMARKS["RIGHT_ANKLE"],
        ]
        total_visibility = sum(pose_result.visibility_scores.get(index, 0.0) for index in key_landmarks)
        return total_visibility / len(key_landmarks)

    def _get_calf_raise_state(self) -> CalfRaiseState:
        if not isinstance(self.state, CalfRaiseState):
            raise RuntimeError("Calf raise exercises require CalfRaiseState")
        return self.state

    def _right_or_left_leg_triplet(
        self,
        landmarks: list[Landmark],
        names: tuple[str, str, str],
        min_visibility: float,
    ) -> tuple[tuple[Point2D, Point2D, Point2D], str] | None:
        right_keys = cast(tuple[str, str, str], tuple(f"RIGHT_{name}" for name in names))
        right_points = self._fetch_triplet(landmarks, right_keys, min_visibility)
        if right_points is not None:
            return right_points, "right"

        left_keys = cast(tuple[str, str, str], tuple(f"LEFT_{name}" for name in names))
        left_points = self._fetch_triplet(landmarks, left_keys, min_visibility)
        if left_points is not None:
            return left_points, "left"

        return None

    def _right_or_left_side_triplet(
        self,
        landmarks: list[Landmark],
        names: tuple[str, str, str],
        min_visibility: float,
    ) -> tuple[tuple[Point2D, Point2D, Point2D], str] | None:
        return self._right_or_left_leg_triplet(landmarks, names, min_visibility)

    def _right_or_left_side_quad(
        self,
        landmarks: list[Landmark],
        names: tuple[str, str, str, str],
        min_visibility: float,
    ) -> tuple[tuple[Point2D, Point2D, Point2D, Point2D], str] | None:
        right_keys = cast(tuple[str, str, str, str], tuple(f"RIGHT_{name}" for name in names))
        right_points = self._fetch_quad(landmarks, right_keys, min_visibility)
        if right_points is not None:
            shoulder, hip, knee, ankle = right_points
            return (shoulder, hip, knee, ankle), "right"

        left_keys = cast(tuple[str, str, str, str], tuple(f"LEFT_{name}" for name in names))
        left_points = self._fetch_quad(landmarks, left_keys, min_visibility)
        if left_points is not None:
            shoulder, hip, knee, ankle = left_points
            return (shoulder, hip, knee, ankle), "left"

        return None

    def _fetch_triplet(
        self,
        landmarks: list[Landmark],
        point_keys: tuple[str, str, str],
        min_visibility: float,
    ) -> tuple[Point2D, Point2D, Point2D] | None:
        points = self._fetch_points(landmarks, point_keys, min_visibility)
        if points is None:
            return None
        first, second, third = points
        return first, second, third

    def _fetch_quad(
        self,
        landmarks: list[Landmark],
        point_keys: tuple[str, str, str, str],
        min_visibility: float,
    ) -> tuple[Point2D, Point2D, Point2D, Point2D] | None:
        points = self._fetch_points(landmarks, point_keys, min_visibility)
        if points is None:
            return None
        first, second, third, fourth = points
        return first, second, third, fourth

    def _fetch_points(
        self,
        landmarks: list[Landmark],
        point_keys: tuple[str, ...],
        min_visibility: float,
    ) -> tuple[Point2D, ...] | None:
        points: list[Point2D] = []
        for key in point_keys:
            point = self.detector.get_landmark_point(
                landmarks,
                self.LANDMARKS[key],
                min_visibility,
            )
            if point is None:
                return None
            points.append(point)
        return tuple(points)

    def _invalid_pose_feedback(self, label: str, angle: float | None = None) -> ExerciseFeedback:
        if angle is None:
            return ExerciseFeedback(feedback="Invalid position detected. Adjust form.")
        return ExerciseFeedback(
            feedback="Invalid position detected. Adjust form.",
            angles={label: angle},
        )

    def _unstable_pose_feedback(self, label: str) -> ExerciseFeedback:
        current_angle = self.state.smoothed_angle if self.state.smoothed_angle is not None else self.state.current_angle
        display_angle = "N/A" if current_angle is None else f"{current_angle:.1f}"
        return ExerciseFeedback(
            feedback=f"{label}: {display_angle}° | Reps: {self.state.reps}/{self.exercise_params.target_reps}",
            angles={label.lower(): current_angle},
        )

    def _format_progress_feedback(self, label: str, current_angle: float | None) -> str:
        angle_text = "N/A" if current_angle is None else f"{current_angle:.1f}"
        return f"{label}: {angle_text}° | Reps: {self.state.reps}/{self.exercise_params.target_reps}"

    def _current_hold_time(self) -> float:
        return time.time() - (self.state.start_time if self.state.start_time is not None else time.time())

    def _process_calf_raise(self, pose_result: PoseDetectionResult) -> ExerciseFeedback:
        landmarks = pose_result.landmarks
        if landmarks is None:
            return ExerciseFeedback(feedback="No landmarks detected")

        triplet = self._right_or_left_leg_triplet(landmarks, ("KNEE", "ANKLE", "TOE"), 0.3)
        if triplet is None:
            return ExerciseFeedback(feedback="Required landmarks not visible")

        (knee, ankle, toe), side = triplet
        calf_state = self._get_calf_raise_state()
        ankle_index = self.LANDMARKS[f"{side.upper()}_ANKLE"]
        ankle_visibility = pose_result.visibility_scores.get(ankle_index, 0.0)

        params = self.exercise_params
        assert params.ankle_hold_threshold is not None
        assert params.ankle_reset_threshold is not None

        if ankle_visibility < params.min_visibility:
            calf_state.ankle_visible = False
            calf_state.timer_started = False
            calf_state.hold_time = 0.0
            calf_state.current_angle = None
            return ExerciseFeedback(feedback="Ankle not clearly visible")

        calf_state.ankle_visible = True
        calf_state.exercise_active = True

        ankle_angle = self.detector.calculate_angle(knee, ankle, toe)
        calf_state.current_angle = round(ankle_angle, 1)

        rep_completed = False
        feedback = ""

        if ankle_angle >= params.ankle_hold_threshold and calf_state.ready_for_next:
            if not calf_state.timer_started:
                calf_state.timer_started = True
                calf_state.start_time = time.time()
                feedback = "Hold position..."
            else:
                calf_state.hold_time = self._current_hold_time()
                feedback = f"Hold: {calf_state.hold_time:.1f}s"
                if calf_state.hold_time >= params.hold_time_required:
                    calf_state.reps += 1
                    calf_state.timer_started = False
                    calf_state.start_time = None
                    calf_state.ready_for_next = False
                    calf_state.hold_time = 0.0
                    calf_state.last_rep_time = time.time()
                    rep_completed = True
                    feedback = f"Rep {calf_state.reps} completed!"
        else:
            if calf_state.timer_started:
                calf_state.timer_started = False
                calf_state.start_time = None
                calf_state.hold_time = 0.0
                feedback = "Lower your foot and try again"

            if ankle_angle <= params.ankle_reset_threshold:
                calf_state.ready_for_next = True
                if not calf_state.exercise_active:
                    feedback = "Ready! Raise your heel"

        if calf_state.reps >= params.target_reps:
            feedback = f"Exercise complete! {calf_state.reps} reps done!"
        elif not feedback:
            feedback = self._format_progress_feedback("Ankle", calf_state.current_angle)

        return ExerciseFeedback(
            feedback=feedback,
            angles={"ankle": calf_state.current_angle},
            rep_completed=rep_completed,
        )

    def _process_knee_extension(self, pose_result: PoseDetectionResult) -> ExerciseFeedback:
        landmarks = pose_result.landmarks
        if landmarks is None:
            self.state.exercise_active = False
            return ExerciseFeedback(feedback="No landmarks detected")

        if not pose_result.pose_stable:
            return self._unstable_pose_feedback("Knee")

        params = self.exercise_params
        assert params.knee_extend_threshold is not None
        assert params.knee_reset_threshold is not None

        triplet = self._right_or_left_leg_triplet(landmarks, ("HIP", "KNEE", "ANKLE"), 0.3)
        if triplet is None:
            self.state.exercise_active = False
            self.state.current_angle = None
            return ExerciseFeedback(feedback="Required leg landmarks not visible")

        (hip, knee, ankle), _ = triplet
        knee_angle = self.detector.calculate_angle(hip, knee, ankle)
        if knee_angle < 30 or knee_angle > 180:
            logger.warning("Invalid knee angle detected", angle=knee_angle)
            return self._invalid_pose_feedback("knee", self.state.smoothed_angle)

        smoothed_angle = self.state.smooth_angle(knee_angle, 0.7)
        self.state.current_angle = round(smoothed_angle, 1)
        self.state.exercise_active = True

        rep_completed = False
        feedback = ""

        if knee_angle >= params.knee_extend_threshold and self.state.ready_for_next:
            if not self.state.timer_started:
                self.state.timer_started = True
                self.state.start_time = time.time()
                feedback = "Hold extension..."
            else:
                self.state.hold_time = self._current_hold_time()
                feedback = f"Hold: {self.state.hold_time:.1f}s"
                if self.state.hold_time >= params.hold_time_required:
                    self.state.reps += 1
                    self.state.timer_started = False
                    self.state.start_time = None
                    self.state.ready_for_next = False
                    self.state.hold_time = 0.0
                    rep_completed = True
                    feedback = f"Rep {self.state.reps} completed!"
        else:
            if self.state.timer_started:
                self.state.timer_started = False
                self.state.start_time = None
                self.state.hold_time = 0.0
            if knee_angle <= params.knee_reset_threshold:
                self.state.ready_for_next = True

        if not feedback:
            feedback = self._format_progress_feedback("Knee", self.state.current_angle)

        return ExerciseFeedback(
            feedback=feedback,
            angles={"knee": self.state.current_angle},
            rep_completed=rep_completed,
        )

    def _process_squat(self, pose_result: PoseDetectionResult) -> ExerciseFeedback:
        landmarks = pose_result.landmarks
        if landmarks is None:
            self.state.exercise_active = False
            return ExerciseFeedback(feedback="No landmarks detected")

        if not pose_result.pose_stable:
            return self._unstable_pose_feedback("Hip")

        params = self.exercise_params
        assert params.hip_depth_threshold is not None
        assert params.hip_reset_threshold is not None

        triplet = self._right_or_left_side_triplet(landmarks, ("SHOULDER", "HIP", "KNEE"), 0.3)
        if triplet is None:
            self.state.exercise_active = False
            self.state.current_angle = None
            return ExerciseFeedback(feedback="Required side landmarks not visible")

        (shoulder, hip, knee), _ = triplet
        hip_angle = self.detector.calculate_angle(shoulder, hip, knee)
        if hip_angle < 40 or hip_angle > 180:
            logger.warning("Invalid hip angle detected", angle=hip_angle)
            return self._invalid_pose_feedback("hip", self.state.current_angle)

        smoothed_angle = self.state.smooth_angle(hip_angle, 0.7)
        self.state.current_angle = round(smoothed_angle, 1)
        self.state.exercise_active = True

        rep_completed = False
        feedback = ""

        if hip_angle <= params.hip_depth_threshold and self.state.ready_for_next:
            if not self.state.timer_started:
                self.state.timer_started = True
                self.state.start_time = time.time()
                feedback = "Hold at bottom..."
            else:
                self.state.hold_time = self._current_hold_time()
                feedback = f"Hold: {self.state.hold_time:.1f}s"
                if self.state.hold_time >= params.hold_time_required:
                    self.state.reps += 1
                    self.state.timer_started = False
                    self.state.start_time = None
                    self.state.ready_for_next = False
                    self.state.hold_time = 0.0
                    rep_completed = True
                    feedback = f"Rep {self.state.reps} completed!"
        else:
            if self.state.timer_started:
                self.state.timer_started = False
                self.state.start_time = None
                self.state.hold_time = 0.0
            if hip_angle >= params.hip_reset_threshold:
                self.state.ready_for_next = True

        if not feedback:
            feedback = self._format_progress_feedback("Hip", self.state.current_angle)

        return ExerciseFeedback(
            feedback=feedback,
            angles={"hip": self.state.current_angle},
            rep_completed=rep_completed,
        )

    def _process_simple_squat(self, pose_result: PoseDetectionResult) -> ExerciseFeedback:
        landmarks = pose_result.landmarks
        if landmarks is None:
            self.state.exercise_active = False
            return ExerciseFeedback(feedback="No landmarks detected")

        if not pose_result.pose_stable:
            return self._unstable_pose_feedback("Hip")

        params = self.exercise_params
        assert params.hip_depth_threshold is not None
        assert params.hip_reset_threshold is not None

        triplet = self._right_or_left_side_triplet(landmarks, ("SHOULDER", "HIP", "KNEE"), 0.3)
        if triplet is None:
            self.state.exercise_active = False
            self.state.current_angle = None
            return ExerciseFeedback(feedback="Required side landmarks not visible")

        (shoulder, hip, knee), _ = triplet
        hip_angle = self.detector.calculate_angle(shoulder, hip, knee)
        if hip_angle < 40 or hip_angle > 180:
            logger.warning("Invalid hip angle detected", angle=hip_angle)
            return self._invalid_pose_feedback("hip", self.state.current_angle)

        smoothed_angle = self.state.smooth_angle(hip_angle, 0.7)
        self.state.current_angle = round(smoothed_angle, 1)
        self.state.exercise_active = True

        rep_completed = False
        feedback = ""

        if hip_angle <= params.hip_depth_threshold and self.state.ready_for_next:
            self.state.exercise_in_squat = True
            feedback = "Good! Now stand up"
        else:
            if self.state.exercise_in_squat and hip_angle >= params.hip_reset_threshold:
                self.state.reps += 1
                self.state.exercise_in_squat = False
                self.state.ready_for_next = False
                rep_completed = True
                feedback = f"Rep {self.state.reps} completed!"
            elif hip_angle >= params.hip_reset_threshold:
                self.state.ready_for_next = True
                self.state.exercise_in_squat = False

        if self.state.reps >= params.target_reps:
            feedback = f"Exercise complete! {self.state.reps} reps done!"
        elif not feedback:
            feedback = self._format_progress_feedback("Hip", self.state.current_angle)

        return ExerciseFeedback(
            feedback=feedback,
            angles={"hip": self.state.current_angle},
            rep_completed=rep_completed,
        )

    def _process_hip_abduction(self, pose_result: PoseDetectionResult) -> ExerciseFeedback:
        landmarks = pose_result.landmarks
        if landmarks is None:
            self.state.exercise_active = False
            return ExerciseFeedback(feedback="No landmarks detected")

        if not pose_result.pose_stable:
            return self._unstable_pose_feedback("Hip")

        params = self.exercise_params
        assert params.hip_abduct_threshold is not None
        assert params.hip_reset_threshold is not None

        triplet = self._right_or_left_leg_triplet(landmarks, ("HIP", "KNEE", "ANKLE"), 0.3)
        if triplet is None:
            self.state.exercise_active = False
            self.state.current_angle = None
            return ExerciseFeedback(feedback="Required leg landmarks not visible")

        (hip, _, ankle), _ = triplet
        hip_x, hip_y = hip
        ankle_x, ankle_y = ankle
        horizontal_distance = abs(ankle_x - hip_x)
        vertical_distance = abs(hip_y - ankle_y) if hip_y > ankle_y else 0.1
        abduction_angle = math.degrees(math.atan(horizontal_distance / (vertical_distance + 0.1)))
        abduction_angle = min(abduction_angle, 90.0)

        if abduction_angle < 0 or abduction_angle > 90:
            logger.warning("Invalid abduction angle detected", angle=abduction_angle)
            return self._invalid_pose_feedback("hip", self.state.smoothed_angle)

        smoothed_angle = self.state.smooth_angle(abduction_angle, 0.7)
        self.state.current_angle = round(smoothed_angle, 1)
        self.state.exercise_active = True

        rep_completed = False
        feedback = ""

        if abduction_angle >= params.hip_abduct_threshold and self.state.ready_for_next:
            if not self.state.timer_started:
                self.state.timer_started = True
                self.state.start_time = time.time()
                feedback = "Hold position..."
            else:
                self.state.hold_time = self._current_hold_time()
                feedback = f"Hold: {self.state.hold_time:.1f}s"
                if self.state.hold_time >= params.hold_time_required:
                    self.state.reps += 1
                    self.state.timer_started = False
                    self.state.start_time = None
                    self.state.ready_for_next = False
                    self.state.hold_time = 0.0
                    rep_completed = True
                    feedback = f"Rep {self.state.reps} completed!"
        else:
            if self.state.timer_started:
                self.state.timer_started = False
                self.state.start_time = None
                self.state.hold_time = 0.0
            if abduction_angle <= params.hip_reset_threshold:
                self.state.ready_for_next = True

        if not feedback:
            feedback = self._format_progress_feedback("Hip", self.state.current_angle)

        return ExerciseFeedback(
            feedback=feedback,
            angles={"hip": self.state.current_angle},
            rep_completed=rep_completed,
        )

    def _process_step_down(self, pose_result: PoseDetectionResult) -> ExerciseFeedback:
        landmarks = pose_result.landmarks
        if landmarks is None:
            self.state.exercise_active = False
            return ExerciseFeedback(feedback="No landmarks detected")

        params = self.exercise_params
        assert params.knee_flex_threshold is not None
        assert params.knee_extend_threshold is not None
        assert params.hip_flex_threshold is not None
        assert params.hip_extend_threshold is not None

        quad = self._right_or_left_side_quad(landmarks, ("SHOULDER", "HIP", "KNEE", "ANKLE"), 0.3)
        if quad is None:
            self.state.exercise_active = False
            self.state.current_angle = None
            return ExerciseFeedback(feedback="Position yourself better in camera")

        (shoulder, hip, knee, ankle), _ = quad
        knee_angle = round(self.detector.calculate_angle(hip, knee, ankle), 1)
        hip_angle = round(self.detector.calculate_angle(shoulder, hip, knee), 1)

        self.state.current_angle = knee_angle
        self.state.exercise_active = True

        in_step_position = knee_angle <= params.knee_flex_threshold and hip_angle <= params.hip_flex_threshold
        in_standing_position = knee_angle >= params.knee_extend_threshold and hip_angle >= params.hip_extend_threshold

        rep_completed = False
        feedback = ""

        if in_step_position and self.state.ready_for_next:
            if not self.state.timer_started:
                self.state.timer_started = True
                self.state.start_time = time.time()
                feedback = f"Hold... ({self.state.hold_time:.1f}s)"
            else:
                self.state.hold_time = self._current_hold_time()
                feedback = f"Hold... ({self.state.hold_time:.1f}s)"
                if self.state.hold_time >= params.hold_time_required:
                    self.state.reps += 1
                    self.state.ready_for_next = False
                    self.state.timer_started = False
                    self.state.start_time = None
                    self.state.hold_time = 0.0
                    rep_completed = True
                    feedback = f"Rep {self.state.reps} completed!"
        elif in_standing_position and not self.state.ready_for_next:
            self.state.ready_for_next = True
            feedback = "Good! Return to step position"
        elif not in_step_position and self.state.timer_started:
            self.state.timer_started = False
            self.state.start_time = None
            self.state.hold_time = 0.0

        if not feedback:
            feedback = (
                f"Knee: {knee_angle:.0f}° | Hip: {hip_angle:.0f}° | "
                f"Reps: {self.state.reps}/{params.target_reps}"
            )

        return ExerciseFeedback(
            feedback=feedback,
            angles={"knee": knee_angle, "hip": hip_angle},
            rep_completed=rep_completed,
        )

    def reset_state(self) -> None:
        self.state.reset()
        logger.info("Exercise state reset", exercise_id=self.exercise_id)

    def cleanup(self) -> None:
        self.detector.cleanup()
        logger.info("ExerciseProcessor cleanup completed", exercise_id=self.exercise_id)
