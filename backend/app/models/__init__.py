"""
Data models for pose detection and WebSocket communication
"""

from .pose import (
    Landmark,
    PoseDetectionResult,
    ExerciseStateSnapshot,
    ExerciseFeedback,
    PoseData,
    WebSocketMessage,
    FrameMessage,
    ResetMessage,
    PoseResultMessage,
    StateResetMessage,
    ErrorMessage
)
from .session import ConnectionManager

__all__ = [
    "Landmark",
    "PoseDetectionResult",
    "ExerciseStateSnapshot",
    "ExerciseFeedback",
    "PoseData",
    "WebSocketMessage",
    "FrameMessage",
    "ResetMessage",
    "PoseResultMessage",
    "StateResetMessage",
    "ErrorMessage",
    "ConnectionManager"
]
