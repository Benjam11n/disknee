# DisKnee Pose Detection Backend

A high-performance Python backend for real-time pose detection using MediaPipe and FastAPI with WebSocket support.

## Features

- **Real-time pose detection** using MediaPipe Python (5-10x faster than JavaScript)
- **WebSocket communication** for low-latency video streaming
- **Exercise tracking** with customizable logic (calf raises, knee extensions, etc.)
- **Concurrent session support** for multiple users
- **Optimized performance** with frame skipping and compression
- **Structured logging** for monitoring and debugging

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application and WebSocket endpoints
│   ├── pose/
│   │   ├── detector.py      # MediaPipe pose detection wrapper
│   │   └── exercises.py     # Exercise-specific logic
│   └── models/
│       ├── pose.py          # Pydantic models for pose data
│       └── session.py       # WebSocket connection management
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
└── .env.example            # Environment variables template
```

## Quick Start

### Local Development

1. **Install dependencies:**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```

3. **Run the server:**
   ```bash
   python -m app.main
   # OR
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Using Docker

1. **Build the image:**

   ```bash
   docker build -t disknee-pose-backend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 disknee-pose-backend
   ```

## API Endpoints

### WebSocket: `/ws/{exercise_id}`

Main WebSocket endpoint for real-time pose detection.

**Message Types:**

#### From Client:

```json
{
  "type": "frame",
  "data": "base64-encoded-image",
  "timestamp": 1234567890
}
```

```json
{
  "type": "reset",
  "timestamp": 1234567890
}
```

#### To Client:

```json
{
  "type": "pose_result",
  "data": {
    "pose_detected": true,
    "landmarks": [...],
    "exercise_state": {
      "reps": 5,
      "timer_started": false,
      "ready_for_next": true,
      "current_angle": 145.2,
      "hold_time": 0,
      "exercise_active": true
    },
    "feedback": "Hold: 2.1s",
    "angles": {
      "ankle": 145.2
    },
    "rep_completed": false
  },
  "timestamp": 1234567890
}
```

### HTTP Endpoints

- `GET /` - Health check
- `GET /health/detailed` - Detailed health and system info

## Supported Exercises

### Calf Raises (ex5)

- **Exercise ID:** `ex5` or `calf-raises`
- **Metrics:** Ankle angle (knee-ankle-toe)
- **Thresholds:**
  - Hold threshold: 140°
  - Reset threshold: 120°
  - Hold time: 3 seconds

### Knee Extension

- **Exercise ID:** `knee-extension`
- **Metrics:** Knee angle (hip-knee-ankle)
- **Thresholds:**
  - Extend threshold: 170°
  - Reset threshold: 90°
  - Hold time: 3 seconds

## Performance Optimizations

1. **Frame Skipping:** Process every 2nd frame (configurable)
2. **Image Compression:** JPEG at 70% quality (configurable)
3. **Async Processing:** Using ThreadPoolExecutor for CPU-bound tasks
4. **Connection Pooling:** Efficient WebSocket connection management
5. **Model Selection:** Using MediaPipe Lite model for real-time performance

## Monitoring

The server provides structured JSON logs with:

- Connection events
- FPS metrics
- Error tracking
- Performance stats

Example log:

```json
{
  "event": "Pose detected",
  "level": "debug",
  "landmarks_count": 33,
  "avg_visibility": 0.85,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway link
railway up
```

### Render

1. Connect your GitHub repository
2. Use the Dockerfile
3. Set environment variables
4. Deploy

### AWS EC2

```bash
# With Docker
docker run -d \
  --name pose-backend \
  -p 8000:8000 \
  -e ENVIRONMENT=production \
  disknee-pose-backend
```

## Troubleshooting

### Common Issues

1. **High CPU Usage:**

   - Reduce frame skip rate
   - Use smaller image dimensions
   - Enable GPU acceleration if available

2. **Connection Drops:**

   - Check WebSocket ping/pong settings
   - Verify network stability
   - Monitor memory usage

3. **Slow Detection:**
   - Ensure MediaPipe GPU delegation is enabled
   - Check if model complexity is appropriate
   - Monitor system resources

### Performance Tuning

For production:

- Use `POSE_MODEL_COMPLEXITY=0` for best performance
- Set appropriate `MAX_CONNECTIONS_PER_EXERCISE`
- Monitor memory usage and set limits
- Consider horizontal scaling for high traffic

## Development

### Adding New Exercises

1. Update `ExerciseProcessor._get_exercise_params()` with new parameters
2. Add processing logic in `ExerciseProcessor._process_{exercise}()`
3. Create state class if needed
4. Update documentation

### Testing

Run tests:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=app tests/
```

## License

Part of the DisKnee physical therapy platform.
