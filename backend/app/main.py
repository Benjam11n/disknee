from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import base64
from typing import Dict
import structlog

from .pose.exercises import ExerciseProcessor
from .models.session import ConnectionManager

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Initialize FastAPI app
app = FastAPI(
    title="DisKnee Pose Detection API",
    description="Real-time pose detection backend for DisKnee exercises",
    version="1.0.0",
    ws="/ws/{exercise_id}"
)

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://disknee.vercel.app", "https://disknee.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global connection manager
manager = ConnectionManager()

# Exercise processors cache
exercise_processors: Dict[str, ExerciseProcessor] = {}


@app.on_event("startup")
async def startup_event():
    """Initialize the pose detection system"""
    logger.info("Starting DisKnee Pose Detection Server")
    try:
        import mediapipe as mp
        logger.info("MediaPipe version", version=mp.__version__)
    except ImportError:
        logger.warning("MediaPipe not installed")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on server shutdown"""
    logger.info("Shutting down DisKnee Pose Detection Server")
    await manager.disconnect_all()


@app.get("/")
async def get():
    """Health check endpoint"""
    return {"status": "healthy", "service": "DisKnee Pose Detection API"}


@app.websocket("/ws/{exercise_id}")
async def websocket_endpoint(websocket: WebSocket, exercise_id: str):
    """Main WebSocket endpoint for pose detection"""
    await manager.connect(websocket, exercise_id)
    logger.info("New connection", exercise_id=exercise_id, client_id=websocket.client)

    # Initialize exercise processor if not exists
    if exercise_id not in exercise_processors:
        exercise_processors[exercise_id] = ExerciseProcessor(exercise_id)

    processor = exercise_processors[exercise_id]

    try:
        while True:
            # Receive frame data from client
            data = await websocket.receive_text()

            try:
                message = json.loads(data)

                if message["type"] == "frame":
                    # Process the frame
                    frame_data = message["data"]
                    timestamp = message.get("timestamp", 0)

                    # Decode base64 frame
                    frame_bytes = base64.b64decode(frame_data)

                    # Process frame and get pose data
                    result = await processor.process_frame(frame_bytes, timestamp)

                    # Send result back to client
                    await websocket.send_text(json.dumps({
                        "type": "pose_result",
                        "data": result.dict() if hasattr(result, 'dict') else result,
                        "timestamp": timestamp
                    }))

                elif message["type"] == "reset":
                    # Reset exercise state
                    processor.reset_state()
                    await websocket.send_text(json.dumps({
                        "type": "state_reset",
                        "timestamp": message.get("timestamp", 0)
                    }))

            except json.JSONDecodeError:
                logger.error("Invalid JSON received", client_id=websocket.client)
                continue
            except Exception as e:
                logger.error("Error processing frame", error=str(e), exercise_id=exercise_id)
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Processing error",
                    "timestamp": message.get("timestamp", 0)
                }))

    except WebSocketDisconnect:
        await manager.disconnect(websocket, exercise_id)
        logger.info("Client disconnected", exercise_id=exercise_id, client_id=websocket.client)
    except Exception as e:
        logger.error("WebSocket error", error=str(e), exercise_id=exercise_id)
        await manager.disconnect(websocket, exercise_id)


@app.get("/health/detailed")
async def health_check():
    """Detailed health check with system info"""
    try:
        import psutil
        import mediapipe as mp
        import cv2

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
            }
        }
    except ImportError as e:
        return {
            "status": "unhealthy",
            "error": f"Missing dependency: {str(e)}"
        }


if __name__ == "__main__":
    import uvicorn

    # Run with uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        ws_ping_interval=20,
        ws_ping_timeout=10,
    )