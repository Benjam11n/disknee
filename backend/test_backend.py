#!/usr/bin/env python3
"""
Simple test script to verify the pose detection backend
"""

import asyncio
import base64
import json
import websockets
import cv2
import numpy as np
import time

# Test configuration
WEBSOCKET_URL = "ws://localhost:8000/ws/ex5"
TEST_IMAGE_PATH = None  # Set to a path if you want to test with a specific image

def create_test_frame():
    """Create a simple test frame with a stick figure"""
    # Create a blank image
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    img.fill(255)  # White background

    # Draw a simple stick figure
    # Head
    cv2.circle(img, (320, 80), 30, (0, 0, 0), 2)

    # Body
    cv2.line(img, (320, 110), (320, 250), (0, 0, 0), 3)

    # Arms
    cv2.line(img, (320, 150), (250, 200), (0, 0, 0), 2)
    cv2.line(img, (320, 150), (390, 200), (0, 0, 0), 2)

    # Legs (seated position)
    cv2.line(img, (320, 250), (280, 350), (0, 0, 0), 3)
    cv2.line(img, (320, 250), (360, 350), (0, 0, 0), 3)

    # Lower legs (raised for calf raise)
    cv2.line(img, (280, 350), (260, 340), (0, 0, 0), 3)
    cv2.line(img, (360, 350), (380, 340), (0, 0, 0), 3)

    # Add text
    cv2.putText(img, "Test Frame", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)

    return img

def encode_image_to_base64(image):
    """Encode numpy image to base64 JPEG"""
    _, buffer = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, 70])
    return base64.b64encode(buffer).decode('utf-8')

async def test_websocket_connection():
    """Test WebSocket connection and pose detection"""
    print(f"Testing WebSocket connection to {WEBSOCKET_URL}")

    try:
        async with websockets.connect(WEBSOCKET_URL) as websocket:
            print("✓ Connected to WebSocket server")

            # Send a test frame
            test_frame = create_test_frame()
            frame_data = encode_image_to_base64(test_frame)

            message = {
                "type": "frame",
                "data": frame_data,
                "timestamp": time.time()
            }

            print("Sending test frame...")
            await websocket.send(json.dumps(message))

            # Wait for response
            response = await websocket.recv()
            result = json.loads(response)

            print("\n--- Response from Server ---")
            print(f"Type: {result.get('type')}")

            if result.get('type') == 'pose_result':
                data = result.get('data', {})
                print(f"Pose Detected: {data.get('pose_detected')}")
                print(f"Exercise: {data.get('exercise_id')}")
                print(f"FPS: {data.get('fps')}")
                print(f"Feedback: {data.get('feedback')}")

                if data.get('landmarks'):
                    print(f"Landmarks count: {len(data['landmarks'])}")

                if data.get('exercise_state'):
                    state = data['exercise_state']
                    print(f"Reps: {state.get('reps')}")
                    print(f"Current Angle: {state.get('current_angle')}")
                    print(f"Exercise Active: {state.get('exercise_active')}")

            print("\n✓ Test completed successfully!")

    except websockets.ConnectionClosed:
        print("✗ Connection closed by server")
    except websockets.WebSocketException as e:
        print(f"✗ WebSocket error: {e}")
    except Exception as e:
        print(f"✗ Test failed: {e}")

async def test_http_endpoints():
    """Test HTTP endpoints"""
    import httpx

    base_url = "http://localhost:8000"

    async with httpx.AsyncClient() as client:
        try:
            # Test health endpoint
            response = await client.get(f"{base_url}/")
            print(f"✓ Health check: {response.status_code} - {response.json()}")

            # Test detailed health endpoint
            response = await client.get(f"{base_url}/health/detailed")
            print(f"✓ Detailed health: {response.status_code}")
            data = response.json()
            print(f"  - Status: {data.get('status')}")
            print(f"  - CPU: {data.get('system', {}).get('cpu_percent')}%")
            print(f"  - Memory: {data.get('system', {}).get('memory_percent')}%")
            print(f"  - Active Connections: {data.get('system', {}).get('active_connections')}")

        except httpx.ConnectError:
            print("✗ Could not connect to HTTP server")
        except Exception as e:
            print(f"✗ HTTP test failed: {e}")

async def main():
    """Run all tests"""
    print("=== DisKnee Pose Detection Backend Test ===\n")

    # Test HTTP endpoints first
    print("1. Testing HTTP endpoints...")
    await test_http_endpoints()
    print()

    # Test WebSocket
    print("2. Testing WebSocket connection...")
    await test_websocket_connection()
    print()

    print("=== Test Complete ===")

if __name__ == "__main__":
    print("Make sure the backend server is running on http://localhost:8000")
    print("Run with: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000\n")

    asyncio.run(main())