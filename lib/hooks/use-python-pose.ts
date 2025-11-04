import { useState, useEffect } from "react";

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseData {
  kneeAngle: number;
  reps: number;
  holdTime: number;
  landmarks: Landmark[];
}

export function usePythonPose(wsUrl: string) {
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => console.log("WebSocket connected");
      ws.onclose = () => {
        console.log("WebSocket closed, reconnecting...");
        reconnectTimeout = setTimeout(connect, 2000);
      };
      ws.onerror = (err) => console.error("WebSocket error", err);

      ws.onmessage = (event) => {
        try {
          const data: PoseData = JSON.parse(event.data);
          setPoseData(data);
        } catch (err) {
          console.error("Failed to parse pose data", err);
        }
      };
    };

    connect();

    return () => {
      ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [wsUrl]);

  return { poseData, error };
}
