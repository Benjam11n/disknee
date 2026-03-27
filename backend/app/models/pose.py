from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class Landmark(BaseModel):
    """Normalized MediaPipe landmark coordinates."""

    x: float = Field(..., ge=0, le=1, description="Normalized x coordinate")
    y: float = Field(..., ge=0, le=1, description="Normalized y coordinate")
    z: float = Field(default=0.0, description="Normalized z coordinate")
    visibility: float = Field(default=0.0, ge=0, le=1, description="Visibility score")


class PoseDetectionResult(BaseModel):
    """Detector output for a single processed frame."""

    timestamp_ms: float
    frame_width: int
    frame_height: int
    fps: float | None = None
    landmarks: list[Landmark] | None = None
    pose_detected: bool
    visibility_scores: dict[int, float] = Field(default_factory=dict)
    pose_stable: bool = True


class ExerciseStateSnapshot(BaseModel):
    """Serializable exercise state returned to the frontend."""

    reps: int = Field(default=0, ge=0)
    timer_started: bool = False
    ready_for_next: bool = True
    current_angle: float | None = None
    hold_time: float = Field(default=0.0, ge=0)
    exercise_active: bool = False
    target_reps: int = Field(default=0, ge=0)


class ExerciseFeedback(BaseModel):
    """Exercise-specific feedback emitted for each processed frame."""

    feedback: str
    angles: dict[str, float | None] = Field(default_factory=dict)
    rep_completed: bool = False


class PoseData(BaseModel):
    """Combined pose and exercise payload returned to websocket clients."""

    pose_detected: bool
    landmarks: list[Landmark] | None = None
    fps: float | None = None
    exercise_state: ExerciseStateSnapshot
    exercise_id: str
    feedback: str
    angles: dict[str, float | None] = Field(default_factory=dict)
    rep_completed: bool = False
    avg_visibility: float | None = None
    pose_stable: bool = True
    server_timestamp_ms: float
    skipped: bool | None = None


class WebSocketMessage(BaseModel):
    """Shared websocket envelope fields."""

    type: str
    timestamp: float | None = None


class FrameMessage(WebSocketMessage):
    """Frame payload received from the frontend."""

    type: Literal["frame"] = "frame"
    data: str


class ResetMessage(WebSocketMessage):
    """State reset request received from the frontend."""

    type: Literal["reset"] = "reset"


class PoseResultMessage(WebSocketMessage):
    """Pose processing result sent to the frontend."""

    type: Literal["pose_result"] = "pose_result"
    data: PoseData


class StateResetMessage(WebSocketMessage):
    """Acknowledgement sent after an exercise reset."""

    type: Literal["state_reset"] = "state_reset"


class ErrorMessage(WebSocketMessage):
    """Error payload sent when frame processing fails."""

    type: Literal["error"] = "error"
    message: str
