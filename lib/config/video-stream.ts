export interface VideoStreamTransportConfig {
  frameSkip: number;
  jpegQuality: number;
  captureWidth: number;
  captureHeight: number;
  mirrorForBackend: boolean;
}

export interface VideoAccessoryConfig {
  emoji: string;
  size: number;
  yOffset: number;
}

export const DEFAULT_VIDEO_STREAM_TRANSPORT: VideoStreamTransportConfig = {
  frameSkip: 2,
  jpegQuality: 0.7,
  captureWidth: 640,
  captureHeight: 480,
  mirrorForBackend: true,
};

export const DEFAULT_CROWN_SETTINGS: VideoAccessoryConfig = {
  emoji: "👑",
  size: 60,
  yOffset: -55,
};

export const DEFAULT_GLASSES_SETTINGS: VideoAccessoryConfig = {
  emoji: "🕶️",
  size: 80,
  yOffset: 0,
};
