/**
 * WebSocket client for pose detection backend communication
 */

import { logger } from "./logger";

interface PoseResult {
  pose_detected: boolean;
  landmarks?: {
    x: number;
    y: number;
    z: number;
    visibility: number;
  }[];
  fps?: number;
  exercise_state: {
    reps: number;
    timer_started: boolean;
    ready_for_next: boolean;
    current_angle: number | null;
    hold_time: number;
    exercise_active: boolean;
  };
  exercise_id: string;
  feedback: string;
  angles: Record<string, number>;
  rep_completed: boolean;
}

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

  constructor(private options: PoseSocketClientOptions) {}

  /**
   * Connect to the pose detection WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      this.isConnecting = true;
      const wsUrl = `${this.options.baseUrl.replace("http", "ws")}/ws/${this.options.exerciseId}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          // console.log('Connected to pose detection server'); // Commented out for production
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.options.onConnectionChange?.(true);
          resolve();
        };

        this.ws.onclose = (event) => {
          // console.log('Disconnected from pose detection server', {
          //   code: event.code,
          //   reason: event.reason || 'No reason provided',
          //   wasClean: event.wasClean
          // });
          this.isConnecting = false;
          this.isConnected = false;
          this.options.onConnectionChange?.(false);

          // Attempt to reconnect
          if (
            this.reconnectAttempts < this.maxReconnectAttempts &&
            !event.wasClean
          ) {
            setTimeout(() => {
              this.reconnectAttempts++;
              // console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
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
   * @param videoElement - HTML video element to capture frame from
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
      // Create canvas to capture frame
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }
}
