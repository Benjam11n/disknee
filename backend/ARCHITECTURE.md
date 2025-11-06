# DisKnee Pose Detection Architecture - Deep Dive

## Overview

The DisKnee pose detection system has been optimized to move all heavy processing from the client browser to a dedicated Python backend. This architecture provides significant performance improvements while maintaining real-time feedback.

## How It Works: The Complete Flow

### 1. **Initialization Flow**

```
User Clicks "Start Exercise"
     ↓
Frontend: Creates PoseSocketClient
     ↓
WebSocket Connection to Backend (ws://localhost:8000/ws/ex5)
     ↓
Backend: Accepts connection, creates ExerciseProcessor instance
     ↓
Backend: Initializes MediaPipe Pose (Python version)
     ↓
Frontend: Requests camera access
     ↓
Video stream begins
```

### 2. **Real-time Processing Loop**

```
Every 33ms (30fps):
┌─────────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                          │
│ ─────────────────────────────────────────────────────────  │
│ 1. Capture video frame from camera                         │
│ 2. Draw to canvas (mirrored for user comfort)              │
│ 3. Every 2nd frame (15fps):                               │
│    a. Convert canvas to JPEG (70% quality)                 │
│    b. Encode as base64                                     │
│    c. Send via WebSocket                                   │
│ 4. Continue rendering video at 30fps (smooth display)      │
└─────────────────────────────────────┬───────────────────────┘
                                          │ WebSocket
                                          │ (JSON message)
                                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend (Python Server)                                     │
│ ─────────────────────────────────────────────────────────  │
│ 1. Receive base64 JPEG frame                               │
│ 2. Decode to numpy array                                   │
│ 3. Color convert BGR→RGB                                   │
│ 4. MediaPipe Pose.detect()                                │
│ 5. Extract 33 landmarks (x, y, z, visibility)             │
│ 6. Calculate exercise-specific angles                      │
│ 7. Update exercise state machine                          │
│ 8. Send results back via WebSocket                         │
└─────────────────────────────────────┬───────────────────────┘
                                          │ WebSocket Response
                                          │ (pose_result message)
                                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                          │
│ ─────────────────────────────────────────────────────────  │
│ 1. Receive pose results                                     │
│ 2. Update exercise state (reps, angles, feedback)          │
│ 3. Render skeleton overlay on video                         │
│ 4. Update UI with real-time feedback                       │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Exercise State Machine (Calf Raises Example)**

```python
# Backend State Tracking
class CalfRaiseState:
    reps: int = 0              # Number of completed reps
    timer_started: bool = False    # Is user holding position?
    start_time: float = None       # When hold started
    ready_for_next: bool = True    # Ready to count next rep?
    current_angle: float = None    # Current ankle angle
    hold_time: float = 0          # Time held in seconds

# State Transitions:
ready_for_next=True
     ↓ (ankle_angle >= 140°)
timer_started=True, start_time=now
     ↓ (checking every frame)
hold_time += delta_time
     ↓ (hold_time >= 3s)
reps += 1, ready_for_next=False
     ↓ (ankle_angle <= 120°)
ready_for_next=True (ready for next rep)
```

## Performance Optimizations Explained

### 1. **Client-side Optimizations**

#### Frame Skipping

- **What**: Send every 2nd frame instead of every frame
- **Benefit**: 50% reduction in WebSocket bandwidth
- **Impact**: Negligible on exercise tracking (15fps is plenty)

```typescript
// In pose-socket-client.ts
frameSkip: 2,  // Send every 2nd frame
```

#### JPEG Compression

- **What**: Compress frames to JPEG at 70% quality
- **Benefit**: ~80% reduction in data size vs raw PNG
- **Impact**: Small quality loss, but pose detection still accurate

```typescript
canvas.toDataURL("image/jpeg", 0.7); // 70% quality JPEG
```

#### Decoupled Rendering

- **What**: Video renders at 30fps, pose processing at 15fps
- **Benefit**: Smooth video even if pose processing lags
- **Impact**: Better user experience

### 2. **Backend Optimizations**

#### Async Processing

- **What**: CPU-intensive pose detection in thread pool
- **Benefit**: Doesn't block WebSocket event loop
- **Impact**: Can handle multiple concurrent users

```python
# In pose/detector.py
result = await loop.run_in_executor(
    self.executor,
    self._process_frame_sync,
    frame_bytes,
    timestamp
)
```

#### Model Selection

- **What**: Using MediaPipe Lite model (complexity=0)
- **Benefit**: Fastest processing speed
- **Impact**: 33 landmarks vs 33 (same accuracy, faster)

#### Early Visibility Filtering

- **What**: Check landmark visibility before processing
- **Benefit**: Skip expensive angle calculations if not visible
- **Impact**: Faster when user partially out of frame

### 3. **Network Optimizations**

#### WebSocket Protocol

- **What**: Persistent bidirectional connection
- **Benefit**: No HTTP overhead per frame
- **Impact**: ~50ms latency reduction vs HTTP polling

#### Message Format

- **What**: JSON with minimal payload
- **Benefit**: Human-readable, easy to debug
- **Future**: Could switch to MessagePack for 30% size reduction

## Data Flow Details

### WebSocket Message Format

#### Client → Server:

```json
{
  "type": "frame",
  "data": "base64-encoded-jpeg-image",
  "timestamp": 1234567890.123
}
```

#### Server → Client:

```json
{
  "type": "pose_result",
  "data": {
    "pose_detected": true,
    "landmarks": [
      { "x": 0.5, "y": 0.5, "z": 0.1, "visibility": 0.9 }
      // ... 32 more landmarks
    ],
    "fps": 28.5,
    "exercise_state": {
      "reps": 2,
      "timer_started": false,
      "ready_for_next": true,
      "current_angle": 125.3,
      "hold_time": 0,
      "exercise_active": true
    },
    "feedback": "Ready! Raise your heel",
    "angles": { "ankle": 125.3 },
    "rep_completed": false
  },
  "timestamp": 1234567890.123
}
```

## Advanced Optimization Tips

### 1. **Tune Frame Parameters**

For slower networks:

```typescript
<PoseSocketClient
  frameSkip={3} // Send every 3rd frame (10fps)
  quality={0.6} // Lower quality for less bandwidth
/>
```

For faster networks:

```typescript
<PoseSocketClient
  frameSkip={1} // Send every frame (30fps)
  quality={0.8} // Higher quality
/>
```

### 2. **Backend Scaling**

#### Multi-Process Deployment:

```bash
# Use Gunicorn for multiple workers
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### GPU Acceleration (if available):

```python
# In pose/detector.py
self.pose = self.mp_pose.Pose(
    model_complexity=1,  # Can use higher complexity with GPU
    enable_segmentation=True,
    # GPU will be used automatically if available
)
```

### 3. **Client-side Enhancements**

#### Predictive Smoothing:

```typescript
// Add to pose-socket-client.ts
smoothResults(landmarks) {
  if (this.previousLandmarks) {
    // Simple linear interpolation
    return landmarks.map((lm, i) => ({
      ...lm,
      x: lm.x * 0.3 + this.previousLandmarks[i].x * 0.7,
      y: lm.y * 0.3 + this.previousLandmarks[i].y * 0.7
    }));
  }
  this.previousLandmarks = landmarks;
  return landmarks;
}
```

#### Adaptive Quality:

```typescript
// Adjust quality based on connection speed
adjustQuality(fps) {
  if (fps < 20) {
    this.quality = Math.max(0.5, this.quality - 0.1);
  } else if (fps > 25) {
    this.quality = Math.min(0.8, this.quality + 0.05);
  }
}
```

### 4. **Monitoring and Analytics**

#### Track Performance:

```python
# Add to backend/app/main.py
performance_metrics = {
    'avg_processing_time': [],
    'fps_history': [],
    'error_rate': 0
}

# Log every 100 frames
if frame_count % 100 == 0:
    avg_fps = sum(metrics['fps_history']) / len(metrics['fps_history'])
    logger.info("Performance metrics", avg_fps=avg_fps)
```

### 5. **Error Recovery**

#### Automatic Fallback:

```typescript
// If WebSocket fails, fall back to simplified mode
if (connectionAttempts > 3) {
  this.enableFallbackMode();
  // Show simplified UI without pose detection
}
```

#### Frame Buffering:

```typescript
// Buffer frames when disconnected
frameBuffer = [];
onFrame(frame) {
  if (!connected) {
    frameBuffer.push(frame);
    if (frameBuffer.length > 10) frameBuffer.shift();
  }
}

// Send buffered frames on reconnect
onReconnect() {
  frameBuffer.forEach(frame => this.send(frame));
  frameBuffer = [];
}
```

## Production Best Practices

### 1. **Deployment Architecture**

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Client    │◄──────│   Load      │◄──────│   Backend   │
│  (Browser)  │ WS     │  Balancer   │ HTTP   │  Servers    │
│             │       │ (Nginx/ALB) │       │  (Python)   │
└─────────────┘       └─────────────┘       └─────────────┘
```

### 2. **Health Checks**

```python
@app.get("/health/ready")
async def ready_check():
    # Check if MediaPipe is responsive
    test_frame = create_test_frame()
    result = await detector.process_frame(test_frame)
    return {"ready": result is not None}
```

### 3. **Rate Limiting**

```python
from slowapi import Limiter
limiter = Limiter(key_func=lambda: request.client.host)

@app.websocket("/ws/{exercise_id}")
@limiter.limit("30/second")  # Max 30 frames per second
async def websocket_endpoint(websocket: WebSocket, exercise_id: str):
```

### 4. **Resource Management**

```python
# Cleanup inactive sessions
async def cleanup_task():
    while True:
        await asyncio.sleep(60)  # Every minute
        for client in inactive_clients:
            await client.disconnect()
```

## Future Enhancements

1. **WebRTC Direct Connection**: P2P video streaming for lowest latency
2. **Model Fine-tuning**: Train custom pose model for specific exercises
3. **Edge Deployment**: Run backend on edge servers closer to users
4. **Predictive AI**: Predict next movement for better rep counting
5. **3D Pose Estimation**: Add depth perception for better accuracy

This architecture provides a solid foundation for real-time pose detection with excellent performance and room for future enhancements.
