from __future__ import annotations

import base64
import json
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from collections.abc import AsyncIterator
from typing import Any

import structlog
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

try:
    from .models.pose import ErrorMessage, FrameMessage, PoseResultMessage, ResetMessage, StateResetMessage
    from .models.session import ConnectionManager
    from .pose.exercises import ExerciseProcessor
except ImportError:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from app.models.pose import ErrorMessage, FrameMessage, PoseResultMessage, ResetMessage, StateResetMessage
    from app.models.session import ConnectionManager
    from app.pose.exercises import ExerciseProcessor


structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

manager = ConnectionManager()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    logger.info("Starting DisKnee Pose Detection Server")
    try:
        import mediapipe as mp

        logger.info("MediaPipe version", version=mp.__version__)
    except ImportError:
        logger.warning("MediaPipe not installed")

    try:
        yield
    finally:
        logger.info("Shutting down DisKnee Pose Detection Server")
        await manager.disconnect_all()


app = FastAPI(
    title="DisKnee Pose Detection API",
    description="Real-time pose detection backend for DisKnee exercises",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://disknee.vercel.app", "https://disknee.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def get() -> dict[str, str]:
    return {"status": "healthy", "service": "DisKnee Pose Detection API"}


def _parse_client_message(raw_text: str) -> FrameMessage | ResetMessage:
    payload = json.loads(raw_text)
    if not isinstance(payload, dict):
        raise ValueError("WebSocket payload must be a JSON object")

    message_type = payload.get("type")
    if message_type == "frame":
        return FrameMessage.model_validate(payload)
    if message_type == "reset":
        return ResetMessage.model_validate(payload)

    raise ValueError(f"Unsupported message type: {message_type}")


@app.websocket("/ws/{exercise_id}")
async def websocket_endpoint(websocket: WebSocket, exercise_id: str) -> None:
    await manager.connect(websocket, exercise_id)
    logger.info("New connection", exercise_id=exercise_id, client_id=websocket.client)
    processor = ExerciseProcessor(exercise_id)

    try:
        while True:
            raw_message = await websocket.receive_text()

            try:
                message = _parse_client_message(raw_message)
                if isinstance(message, FrameMessage):
                    frame_bytes = base64.b64decode(message.data)
                    result = await processor.process_frame(frame_bytes, message.timestamp or 0.0)
                    response = PoseResultMessage(timestamp=message.timestamp, data=result)
                    await websocket.send_text(response.model_dump_json())
                    continue

                processor.reset_state()
                await websocket.send_text(StateResetMessage(timestamp=message.timestamp).model_dump_json())
            except json.JSONDecodeError:
                logger.error("Invalid JSON received", client_id=websocket.client)
                continue
            except Exception as exc:
                logger.error("Error processing frame", error=str(exc), exercise_id=exercise_id)
                error_payload = ErrorMessage(
                    message="Processing error",
                    timestamp=(message.timestamp if "message" in locals() else None),
                )
                await websocket.send_text(error_payload.model_dump_json())
    except WebSocketDisconnect:
        await manager.disconnect(websocket, exercise_id)
        logger.info("Client disconnected", exercise_id=exercise_id, client_id=websocket.client)
    except Exception as exc:
        logger.error("WebSocket error", error=str(exc), exercise_id=exercise_id)
        await manager.disconnect(websocket, exercise_id)
    finally:
        processor.cleanup()


@app.get("/health/detailed")
async def health_check() -> dict[str, Any]:
    try:
        import cv2
        import mediapipe as mp
        import psutil

        return {
            "status": "healthy",
            "service": "DisKnee Pose Detection API",
            "version": "1.0.0",
            "system": {
                "cpu_percent": psutil.cpu_percent(),
                "memory_percent": psutil.virtual_memory().percent,
                "active_connections": len(manager.active_connections),
            },
            "dependencies": {
                "mediapipe": mp.__version__,
                "opencv": cv2.__version__,
            },
        }
    except ImportError as exc:
        return {
            "status": "unhealthy",
            "error": f"Missing dependency: {str(exc)}",
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        ws_ping_interval=20,
        ws_ping_timeout=10,
    )
