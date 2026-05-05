/**
 * Component to display and visualize yellow mask data
 * 显示和可视化黄色高亮框数据的组件
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  MaskPositionsData,
  FrameData,
  getFramesWithMask,
  calculateBBoxStats,
} from "@/lib/mask-types";

interface MaskVisualizerProps {
  data: MaskPositionsData;
}

interface CanvasDrawOptions {
  showBoundingBox?: boolean;
  showContour?: boolean;
  showEllipse?: boolean;
  showCenterPoint?: boolean;
}

/**
 * Canvas-based visualizer for mask data
 * 基于Canvas的高亮框可视化器
 */
export const MaskVisualizer: React.FC<MaskVisualizerProps> = ({ data }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [drawOptions, setDrawOptions] = useState<CanvasDrawOptions>({
    showBoundingBox: true,
    showContour: true,
    showEllipse: false,
    showCenterPoint: true,
  });

  // Draw mask on canvas
  const drawMask = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frame = data.frames[frameIndex];
    if (!frame?.yellow_mask) {
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#999";
      ctx.font = "14px Arial";
      ctx.fillText("No mask detected in this frame", 10, 20);
      return;
    }

    const mask = frame.yellow_mask;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw bounding box
    if (drawOptions.showBoundingBox) {
      const bbox = mask.bounding_box;
      ctx.strokeStyle = "#ff6b00";
      ctx.lineWidth = 3;
      ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

      // Draw corner points
      ctx.fillStyle = "#ff6b00";
      const corners = [
        [bbox.x, bbox.y],
        [bbox.x_max, bbox.y],
        [bbox.x_max, bbox.y_max],
        [bbox.x, bbox.y_max],
      ];
      corners.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw contour
    if (drawOptions.showContour && mask.contour_points.length > 0) {
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mask.contour_points[0][0], mask.contour_points[0][1]);
      for (let i = 1; i < mask.contour_points.length; i++) {
        ctx.lineTo(mask.contour_points[i][0], mask.contour_points[i][1]);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw contour points
      ctx.fillStyle = "#ffff00";
      mask.contour_points.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw ellipse
    if (drawOptions.showEllipse && mask.ellipse) {
      const ellipse = mask.ellipse;
      ctx.save();
      ctx.translate(ellipse.center[0], ellipse.center[1]);
      ctx.rotate((ellipse.angle * Math.PI) / 180);

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        ellipse.major_axis / 2,
        ellipse.minor_axis / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();
    }

    // Draw center point
    if (drawOptions.showCenterPoint) {
      const centerX = mask.bounding_box.x + mask.bounding_box.width / 2;
      const centerY = mask.bounding_box.y + mask.bounding_box.height / 2;

      ctx.strokeStyle = "#0066ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#0066ff";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw frame info
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(
      `Frame: ${frameIndex} / ${data.frames.length - 1}`,
      10,
      20
    );
    ctx.fillText(
      `Time: ${frame.timestamp_s.toFixed(2)}s / ${(data.video_info.duration_s).toFixed(2)}s`,
      10,
      35
    );
    ctx.fillText(
      `Area: ${mask.area.toFixed(0)} px²`,
      10,
      50
    );
    ctx.fillText(
      `BBox: ${mask.bounding_box.width}x${mask.bounding_box.height} @ (${mask.bounding_box.x}, ${mask.bounding_box.y})`,
      10,
      65
    );
  };

  // Handle frame change
  useEffect(() => {
    drawMask(currentFrame);
  }, [currentFrame, data, drawOptions]);

  // Auto play animation
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= data.frames.length - 1) {
          return 0; // Loop
        }
        return prev + 1;
      });
    }, 1000 / data.video_info.fps);

    return () => clearInterval(interval);
  }, [autoPlay, data.video_info.fps, data.frames.length]);

  const framesWithMask = getFramesWithMask(data);
  const stats = calculateBBoxStats(data);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Yellow Mask Visualizer</h2>
        <p className="text-sm text-gray-600">
          Detection Rate: {framesWithMask.length}/{data.frames.length} (
          {((framesWithMask.length / data.frames.length) * 100).toFixed(1)}%)
        </p>
      </div>

      {/* Canvas */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={data.video_info.width}
          height={data.video_info.height}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Frame slider */}
        <div>
          <label className="text-sm font-medium">Frame: {currentFrame}</label>
          <input
            type="range"
            min="0"
            max={data.frames.length - 1}
            value={currentFrame}
            onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Playback controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            {autoPlay ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => setCurrentFrame(0)}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Reset
          </button>
        </div>

        {/* Draw options */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Display Options:</h3>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={drawOptions.showBoundingBox}
                onChange={(e) =>
                  setDrawOptions({
                    ...drawOptions,
                    showBoundingBox: e.target.checked,
                  })
                }
              />
              <span className="text-orange-500">■</span> Bounding Box
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={drawOptions.showContour}
                onChange={(e) =>
                  setDrawOptions({
                    ...drawOptions,
                    showContour: e.target.checked,
                  })
                }
              />
              <span className="text-yellow-400">■</span> Contour
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={drawOptions.showEllipse}
                onChange={(e) =>
                  setDrawOptions({
                    ...drawOptions,
                    showEllipse: e.target.checked,
                  })
                }
              />
              <span className="text-green-500">■</span> Ellipse
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={drawOptions.showCenterPoint}
                onChange={(e) =>
                  setDrawOptions({
                    ...drawOptions,
                    showCenterPoint: e.target.checked,
                  })
                }
              />
              <span className="text-blue-500">■</span> Center Point
            </label>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
          <h3 className="text-sm font-medium mb-2">Bounding Box Statistics</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              Avg Width: <span className="font-mono">{stats.avgWidth.toFixed(1)}</span>px
            </div>
            <div>
              Avg Height: <span className="font-mono">{stats.avgHeight.toFixed(1)}</span>px
            </div>
            <div>
              Width Range: <span className="font-mono">{stats.minWidth.toFixed(0)} - {stats.maxWidth.toFixed(0)}</span>px
            </div>
            <div>
              Height Range: <span className="font-mono">{stats.minHeight.toFixed(0)} - {stats.maxHeight.toFixed(0)}</span>px
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
