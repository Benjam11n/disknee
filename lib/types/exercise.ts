import { Prisma } from '@prisma/client';

export type InventoryWithItem = Prisma.UserInventoryGetPayload<{
  include: { item: true };
}>;

export interface PoseResult {
  pose_detected: boolean;
  landmarks?: Landmark[];
  fps?: number;
  exercise_state?: {
    reps: number;
    timer_started: boolean;
    ready_for_next: boolean;
    current_angle?: number | null;
    hold_time: number;
    exercise_active: boolean;
  };
  exercise_id?: string;
  feedback?: string;
  angles?: {
    [key: string]: number | null;
  };
  rep_completed?: boolean;
  avg_visibility?: number;
  pose_stable?: boolean;
  skipped?: boolean;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}
