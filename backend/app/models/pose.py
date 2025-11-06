from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class Landmark(BaseModel):
    """MediaPipe landmark data model"""
    x: float = Field(..., ge=0, le=1, description="Normalized x coordinate")
    y: float = Field(..., ge=0, le=1, description="Normalized y coordinate")
    z: float = Field(default=0.0, description="Normalized z coordinate")
    visibility: float = Field(default=0.0, ge=0, le=1, description="Visibility score")

class PoseDetectionResult(BaseModel):
    """Result of pose detection on a frame"""
    timestamp: float
    frame_width: int
    frame_height: int
    fps: Optional[float] = None
    landmarks: Optional[List[Landmark]] = None
    pose_detected: bool
    visibility_scores: Dict[str, float] = Field(default_factory=dict)

class ExerciseState(BaseModel):
    """Exercise state information"""
    reps: int = Field(default=0, ge=0)
    timer_started: bool = False
    ready_for_next: bool = True
    current_angle: Optional[float] = None
    hold_time: float = Field(default=0.0, ge=0)
    exercise_active: bool = False

class PoseData(BaseModel):
    """Combined pose and exercise data response"""
    pose_detected: bool
    landmarks: Optional[List[Landmark]] = None
    fps: Optional[float] = None
    exercise_state: ExerciseState
    exercise_id: str
    feedback: str
    angles: Dict[str, float] = Field(default_factory=dict)
    rep_completed: bool = False

class WebSocketMessage(BaseModel):
    """WebSocket message base model"""
    type: str
    timestamp: Optional[float] = None
    data: Optional[Dict[str, Any]] = None

class FrameMessage(WebSocketMessage):
    """WebSocket frame message from client"""
    type: str = Field(default="frame")
    data: str  # Base64 encoded image

class PoseResultMessage(WebSocketMessage):
    """WebSocket pose result message to client"""
    type: str = Field(default="pose_result")
    data: PoseData

class ErrorMessage(WebSocketMessage):
    """WebSocket error message"""
    type: str = Field(default="error")
    message: str