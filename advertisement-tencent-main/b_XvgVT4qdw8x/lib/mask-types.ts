/**
 * Types for yellow mask data extracted from video
 * 黄色高亮框数据的类型定义
 */

export interface BoundingBox {
  /** Left coordinate */
  x: number;
  /** Top coordinate */
  y: number;
  /** Width */
  width: number;
  /** Height */
  height: number;
  /** Right coordinate (x + width) */
  x_max: number;
  /** Bottom coordinate (y + height) */
  y_max: number;
}

export interface Ellipse {
  /** Center point [cx, cy] */
  center: [number, number];
  /** Major axis length */
  major_axis: number;
  /** Minor axis length */
  minor_axis: number;
  /** Rotation angle in degrees */
  angle: number;
}

export interface YellowMask {
  /** Bounding box of the yellow mask */
  bounding_box: BoundingBox;
  /** Contour points as [x, y] coordinates */
  contour_points: Array<[number, number]>;
  /** Area of the yellow mask in pixels */
  area: number;
  /** Perimeter of the yellow mask */
  perimeter: number;
  /** Number of vertices in the contour */
  contour_vertices: number;
  /** Fitted ellipse data (optional) */
  ellipse?: Ellipse;
}

export interface FrameData {
  /** Frame index (0-based) */
  frame_id: number;
  /** Timestamp in milliseconds */
  timestamp_ms: number;
  /** Timestamp in seconds */
  timestamp_s: number;
  /** Yellow mask detection data (null if not detected in this frame) */
  yellow_mask: YellowMask | null;
}

export interface VideoInfo {
  /** Total number of frames */
  frames: number;
  /** Frames per second */
  fps: number;
  /** Video width in pixels */
  width: number;
  /** Video height in pixels */
  height: number;
  /** Total video duration in seconds */
  duration_s: number;
}

export interface MaskPositionsData {
  /** Video metadata */
  video_info: VideoInfo;
  /** Array of frame data */
  frames: FrameData[];
}

/**
 * Calculate the center point of a bounding box
 * 计算边界框的中心点
 */
export function getBoundingBoxCenter(bbox: BoundingBox): [number, number] {
  return [
    bbox.x + bbox.width / 2,
    bbox.y + bbox.height / 2
  ];
}

/**
 * Get contour points for a specific frame
 * 获取特定帧的轮廓点
 */
export function getFrameContourPoints(frame: FrameData): Array<[number, number]> | null {
  return frame.yellow_mask?.contour_points ?? null;
}

/**
 * Filter frames that have yellow mask detected
 * 筛选检测到黄色高亮框的帧
 */
export function getFramesWithMask(data: MaskPositionsData): FrameData[] {
  return data.frames.filter(frame => frame.yellow_mask !== null);
}

/**
 * Get frame data at a specific timestamp
 * 获取特定时间戳的帧数据
 */
export function getFrameAtTime(data: MaskPositionsData, timeSeconds: number): FrameData | null {
  const frameId = Math.floor(timeSeconds * data.video_info.fps);
  const frame = data.frames[frameId];
  return frame ?? null;
}

/**
 * Get frames within a time range
 * 获取时间范围内的帧
 */
export function getFramesInRange(
  data: MaskPositionsData,
  startSeconds: number,
  endSeconds: number
): FrameData[] {
  return data.frames.filter(
    frame => frame.timestamp_s >= startSeconds && frame.timestamp_s <= endSeconds
  );
}

/**
 * Calculate bounding box statistics
 * 计算边界框统计信息
 */
export function calculateBBoxStats(data: MaskPositionsData) {
  const framesWithMask = getFramesWithMask(data);
  
  if (framesWithMask.length === 0) {
    return null;
  }
  
  const bboxes = framesWithMask.map(f => f.yellow_mask!.bounding_box);
  
  return {
    count: framesWithMask.length,
    avgWidth: bboxes.reduce((sum, b) => sum + b.width, 0) / bboxes.length,
    avgHeight: bboxes.reduce((sum, b) => sum + b.height, 0) / bboxes.length,
    avgX: bboxes.reduce((sum, b) => sum + b.x, 0) / bboxes.length,
    avgY: bboxes.reduce((sum, b) => sum + b.y, 0) / bboxes.length,
    minWidth: Math.min(...bboxes.map(b => b.width)),
    maxWidth: Math.max(...bboxes.map(b => b.width)),
    minHeight: Math.min(...bboxes.map(b => b.height)),
    maxHeight: Math.max(...bboxes.map(b => b.height)),
  };
}
