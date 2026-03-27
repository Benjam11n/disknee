import base64
import json
import sys
from pathlib import Path
from typing import cast

from fastapi.testclient import TestClient
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import main
from app.models.pose import ExerciseStateSnapshot, Landmark, PoseData, PoseDetectionResult
from app.pose import detector as detector_module
from app.pose import exercises as exercises_module


def _build_landmarks() -> list[Landmark]:
    return [
        Landmark(x=0.5, y=0.5, z=0.0, visibility=0.95)
        for _ in range(33)
    ]


class FakePoseDetector:
    def __init__(self) -> None:
        self.calls = 0
        self.cleaned_up = False

    async def process_frame_async(
        self,
        frame_bytes: bytes,
        timestamp_ms: float | None = None,
    ) -> PoseDetectionResult:
        self.calls += 1
        return PoseDetectionResult(
            timestamp_ms=timestamp_ms or 0.0,
            frame_width=640,
            frame_height=480,
            fps=30.0,
            landmarks=_build_landmarks(),
            pose_detected=True,
            pose_stable=True,
            visibility_scores={24: 0.95, 26: 0.95, 28: 0.95},
        )

    def get_landmark_point(
        self,
        landmarks: list[Landmark],
        landmark_index: int,
        min_visibility: float = 0.3,
    ) -> tuple[float, float] | None:
        landmark = landmarks[landmark_index]
        if landmark.visibility < min_visibility:
            return None
        return (landmark.x, landmark.y)

    def calculate_angle(self, a: tuple[float, float], b: tuple[float, float], c: tuple[float, float]) -> float:
        return 170.0

    def cleanup(self) -> None:
        self.cleaned_up = True


def test_exercise_processor_instances_do_not_share_state(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(exercises_module, "PoseDetector", FakePoseDetector)

    first = exercises_module.ExerciseProcessor("simple-squat")
    second = exercises_module.ExerciseProcessor("simple-squat")

    first.state.reps = 4
    first.state.exercise_in_squat = True

    assert second.state.reps == 0
    assert second.state.exercise_in_squat is False


@pytest.mark.asyncio
async def test_process_frame_uses_millisecond_thresholds_and_single_detection(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(exercises_module, "PoseDetector", FakePoseDetector)

    processor = exercises_module.ExerciseProcessor("knee-extension")

    first = await processor.process_frame(b"frame", 1000)
    second = await processor.process_frame(b"frame", 1025)
    third = await processor.process_frame(b"frame", 1100)

    assert first.skipped is None
    assert second.skipped is True
    assert third.skipped is None
    detector = cast(FakePoseDetector, processor.detector)
    assert detector.calls == 3
    assert first.exercise_state.target_reps == processor.exercise_params.target_reps
    assert third.server_timestamp_ms >= 0


def test_detector_fps_uses_millisecond_clock() -> None:
    pose_detector = detector_module.PoseDetector.__new__(detector_module.PoseDetector)
    pose_detector.fps_counter = 0
    pose_detector.fps_start_time_ms = 0
    pose_detector.current_fps = 0

    detector_module.PoseDetector._update_fps(pose_detector, 500)
    detector_module.PoseDetector._update_fps(pose_detector, 1000)

    assert pose_detector.current_fps == 2
    assert pose_detector.fps_counter == 0
    assert pose_detector.fps_start_time_ms == 1000


def test_websocket_connections_keep_processor_state_isolated(monkeypatch: pytest.MonkeyPatch) -> None:
    class DummyProcessor:
        def __init__(self, exercise_id: str) -> None:
            self.exercise_id = exercise_id
            self.reps = 0
            self.cleaned = False

        async def process_frame(self, frame_bytes: bytes, timestamp_ms: float) -> PoseData:
            self.reps += 1
            return PoseData(
                pose_detected=True,
                landmarks=[],
                fps=30.0,
                exercise_state=ExerciseStateSnapshot(
                    reps=self.reps,
                    timer_started=False,
                    ready_for_next=True,
                    current_angle=None,
                    hold_time=0.0,
                    exercise_active=True,
                    target_reps=10,
                ),
                exercise_id=self.exercise_id,
                feedback="ok",
                angles={},
                rep_completed=False,
                server_timestamp_ms=timestamp_ms,
            )

        def reset_state(self) -> None:
            self.reps = 0

        def cleanup(self) -> None:
            self.cleaned = True

    monkeypatch.setattr(main, "ExerciseProcessor", DummyProcessor)

    frame_payload = base64.b64encode(b"frame").decode("utf-8")
    app_client = TestClient(main.app)

    with (
        app_client.websocket_connect("/ws/simple-squat") as websocket_one,
        app_client.websocket_connect("/ws/simple-squat") as websocket_two,
    ):
        websocket_one.send_text(
            json.dumps({"type": "frame", "data": frame_payload, "timestamp": 1000})
        )
        response_one = json.loads(websocket_one.receive_text())
        assert response_one["data"]["exercise_state"]["reps"] == 1

        websocket_two.send_text(
            json.dumps({"type": "frame", "data": frame_payload, "timestamp": 1000})
        )
        response_two = json.loads(websocket_two.receive_text())
        assert response_two["data"]["exercise_state"]["reps"] == 1

        websocket_one.send_text(
            json.dumps({"type": "frame", "data": frame_payload, "timestamp": 1100})
        )
        response_one = json.loads(websocket_one.receive_text())
        assert response_one["data"]["exercise_state"]["reps"] == 2

        websocket_one.send_text(json.dumps({"type": "reset", "timestamp": 1200}))
        reset_response = json.loads(websocket_one.receive_text())
        assert reset_response["type"] == "state_reset"

        websocket_two.send_text(
            json.dumps({"type": "frame", "data": frame_payload, "timestamp": 1200})
        )
        response_two = json.loads(websocket_two.receive_text())
        assert response_two["data"]["exercise_state"]["reps"] == 2

        websocket_one.send_text(
            json.dumps({"type": "frame", "data": frame_payload, "timestamp": 1300})
        )
        response_one = json.loads(websocket_one.receive_text())
        assert response_one["data"]["exercise_state"]["reps"] == 1
