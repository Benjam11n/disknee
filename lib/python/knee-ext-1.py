# knee_ext_ws.py
import cv2
import mediapipe as mp
import numpy as np
import asyncio
import json
from fastapi import FastAPI, WebSocket
import uvicorn
import time

app = FastAPI()
mp_pose = mp.solutions.pose

# Angle function
def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba, bc = a - b, c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    return np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))

# Knee Exercise Logic
class KneeExercise:
    def __init__(self):
        self.reps = 0
        self.ready_for_next = True
        self.timer_started = False
        self.start_time = 0

    def update(self, angle):
        HOLD_TIME = 3.0
        KNEE_TARGET = 35
        RESET_ANGLE = 90

        now = time.time()

        if angle <= KNEE_TARGET and self.ready_for_next:
            if not self.timer_started:
                self.timer_started = True
                self.start_time = now
            elapsed = now - self.start_time
            if elapsed >= HOLD_TIME:
                self.reps += 1
                self.ready_for_next = False
                self.timer_started = False
        else:
            self.timer_started = False

        if angle >= RESET_ANGLE:
            self.ready_for_next = True

        return self.reps

exercise = KneeExercise()

@app.websocket("/ws/pose")
async def websocket_pose(ws: WebSocket):
    await ws.accept()
    cap = cv2.VideoCapture(0)
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)
            
            knee_angle = None
            landmarks_out = []

            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark
                hip = [lm[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                       lm[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                knee = [lm[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                        lm[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
                ankle = [lm[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                         lm[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]
                
                knee_angle = calculate_angle(hip, knee, ankle)
                reps = exercise.update(knee_angle)
                landmarks_out = [{"x": l.x, "y": l.y, "z": l.z, "visibility": l.visibility} for l in lm]

                await ws.send_text(json.dumps({
                    "kneeAngle": knee_angle,
                    "reps": reps,
                    "landmarks": landmarks_out
                }))
            await asyncio.sleep(0.016)  # ~60 FPS
    finally:
        cap.release()
