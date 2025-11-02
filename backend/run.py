#!/usr/bin/env python3
"""
Run script for the DisKnee Pose Detection Backend
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    # Configure uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT", "development") == "development",
        log_level=os.getenv("LOG_LEVEL", "info"),
        ws_ping_interval=20,
        ws_ping_timeout=10,
        access_log=True,
    )