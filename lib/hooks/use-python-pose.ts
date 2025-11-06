import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

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

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => logger.info('WebSocket connected');
      ws.onclose = () => {
        logger.info('WebSocket closed, reconnecting...');
        reconnectTimeout = setTimeout(connect, 2000);
      };
      ws.onerror = (err) => logger.error(err, 'WebSocket error:');

      ws.onmessage = (event) => {
        try {
          const data: PoseData = JSON.parse(event.data);
          setPoseData(data);
        } catch (err) {
          logger.error(err, 'Failed to parse pose data:');
        }
      };
    };

    connect();

    return () => {
      ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [wsUrl]);

  return { poseData };
}
