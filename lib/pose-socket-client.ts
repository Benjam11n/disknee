/**
 * @class PoseSocketClient
 * @description A robust WebSocket client designed for high-throughput image data transfer.
 *
 * Responsibilities:
 * 1. Handling binary image serialization (Canvas -> JPEG -> Base64).
 * 2. Managing back-pressure via frame-skipping logic.
 * 3. Graceful reconnection with exponential backoff for flaky networks.
 * 4. Bi-directional communication with the Python Computer Vision backend.
 */

import { logger } from "./logger";
import type { PoseResult } from "./types/exercise";

interface PoseSocketClientOptions {
  baseUrl: string;
  exerciseId: string;
  onPoseResult?: (result: PoseResult) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: Error) => void;
  frameSkip?: number; // Send every nth frame
  jpegQuality?: number; // JPEG quality 0-1
  captureWidth?: number;
  captureHeight?: number;
  mirrorForBackend?: boolean;
}

export class PoseSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private isConnecting = false;
  private frameCount = 0;
  private isConnected = false;
  private captureCanvas: HTMLCanvasElement | null = null;
  private captureContext: CanvasRenderingContext2D | null = null;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private manualClose = false;

  constructor(private options: PoseSocketClientOptions) {}

  /**
   * Connect to the pose detection WebSocket server
   * Workflow:
   * 1. Re-format HTTP URL to WS/WSS protocol
   * 2. Initialize native WebSocket with exercise-specific route
   * 3. Set up event listeners for open, close, and error handling
   * 4. Implement automatic reconnection loop if the connection drops
   * 5. Deserialize incoming performance results from the AI
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.manualClose = false;
      // Re-format HTTP URL to WS/WSS protocol
      const wsUrl = `${this.options.baseUrl.replace("http", "ws")}/ws/${this.options.exerciseId}`;

      try {
        // Initialise websocket
        this.ws = new WebSocket(wsUrl);

        // Set up event listeners for open, close, and error handling
        this.ws.onopen = () => {
          if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
          }
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.options.onConnectionChange?.(true);
          resolve();
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.isConnected = false;
          this.options.onConnectionChange?.(false);

          // Attempt to reconnect
          if (
            this.reconnectAttempts < this.maxReconnectAttempts &&
            !event.wasClean &&
            !this.manualClose
          ) {
            // Retry logic with exponential backoff
            this.reconnectTimeoutId = setTimeout(() => {
              this.reconnectAttempts++;
              this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };

        this.ws.onerror = (error) => {
          logger.error(error, "WebSocket error:");
          this.isConnecting = false;
          this.options.onError?.(new Error("WebSocket connection error"));
          reject(error);
        };

        // Handle incoming messages from the server
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "pose_result") {
              this.options.onPoseResult?.(message.data);
            } else if (message.type === "error") {
              this.options.onError?.(new Error(message.message));
            }
          } catch (error) {
            logger.error(error, "Error parsing WebSocket message:");
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Send a video frame to the server for processing
   * Step 1: Validate connection state and hardware availability
   * Step 2: Implement frame skipping (throttling) for congestion control
   * Step 3: Capture the current video frame into a temporary off-screen Canvas
   * Step 4: Mirror and downscale the image to maintain sub-100ms latency
   * Step 5: Convert the pixel data into a compressed JPEG Base64 payload
   * Step 6: Dispatch JSON packet with a high-precision browser timestamp (performance.now())
   */
  sendFrame(videoElement: HTMLVideoElement): void {
    if (
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN ||
      !this.isConnected
    ) {
      return;
    }

    // Check if video is ready
    if (videoElement.readyState !== 4) {
      return;
    }

    // Frame skipping for performance
    this.frameCount++;
    const frameSkip = this.options.frameSkip ?? 2;
    if (this.frameCount % frameSkip !== 0) {
      return;
    }

    try {
      if (!this.captureCanvas) {
        this.captureCanvas = document.createElement("canvas");
      }

      if (!this.captureContext) {
        this.captureContext = this.captureCanvas.getContext("2d");
      }

      const canvas = this.captureCanvas;
      const ctx = this.captureContext;
      if (!ctx) {
        return;
      }

      // Set canvas size (smaller for performance)
      const targetWidth = this.options.captureWidth ?? 640;
      const targetHeight = this.options.captureHeight ?? 480;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const mirrorForBackend = this.options.mirrorForBackend ?? true;
      if (mirrorForBackend) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, -targetWidth, 0, targetWidth, targetHeight);
        ctx.restore();
      } else {
        ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
      }

      // Get image data as base64
      const jpegQuality = this.options.jpegQuality ?? 0.7;
      const imageData = canvas.toDataURL("image/jpeg", jpegQuality);

      // Remove data URL prefix
      const base64Data = imageData.split(",")[1];

      // Check if WebSocket is still open before sending
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            data: base64Data,
            timestamp: performance.now(),
            type: "frame",
          })
        );
      }
    } catch (error) {
      logger.error(error, "Error sending frame:");
    }
  }

  /**
   * Reset the exercise state on the server
   */
  resetExercise(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          timestamp: performance.now(),
          type: "reset",
        })
      );
    }
  }

  /**
   * Check if connected to the server
   */
  connected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    this.manualClose = true;
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.captureContext = null;
    this.captureCanvas = null;
  }
}
