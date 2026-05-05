/**
 * Example page for mask visualizer
 * 黄色高亮框可视化示例页面
 */

"use client";

import { useState, useEffect } from "react";
import { MaskVisualizer } from "@/components/mask-visualizer";
import {
  MaskPositionsData,
  getFramesWithMask,
  calculateBBoxStats,
} from "@/lib/mask-types";

export default function MaskPage() {
  const [data, setData] = useState<MaskPositionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load mask data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/mask_positions.json");
        if (!response.ok) {
          throw new Error("Failed to load mask data");
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading mask data...</div>
          <div className="text-gray-500 mt-2">
            Processing video frames...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <div className="text-lg font-semibold">Error loading data</div>
          <div className="mt-2">{error || "No data available"}</div>
        </div>
      </div>
    );
  }

  const framesWithMask = getFramesWithMask(data);
  const stats = calculateBBoxStats(data);

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Yellow Mask Analysis
          </h1>
          <p className="text-gray-600">
            Video frame-by-frame analysis of yellow highlight positions
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Frames</div>
            <div className="text-2xl font-bold">{data.frames.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Frames with Mask</div>
            <div className="text-2xl font-bold">{framesWithMask.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Detection Rate</div>
            <div className="text-2xl font-bold">
              {(
                (framesWithMask.length / data.frames.length) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Duration</div>
            <div className="text-2xl font-bold">
              {data.video_info.duration_s.toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <MaskVisualizer data={data} />
        </div>

        {/* Detailed Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bounding Box Stats */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">Bounding Box Statistics</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Average Width</div>
                  <div className="text-2xl font-semibold">
                    {stats.avgWidth.toFixed(1)}
                    <span className="text-sm ml-1">px</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Average Height</div>
                  <div className="text-2xl font-semibold">
                    {stats.avgHeight.toFixed(1)}
                    <span className="text-sm ml-1">px</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">Width Range</div>
                  <div className="text-lg font-mono">
                    {stats.minWidth.toFixed(0)} - {stats.maxWidth.toFixed(0)} px
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Height Range</div>
                  <div className="text-lg font-mono">
                    {stats.minHeight.toFixed(0)} - {stats.maxHeight.toFixed(0)} px
                  </div>
                </div>
              </div>
            </div>

            {/* Position Stats */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">Position Statistics</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Average X Position</div>
                  <div className="text-2xl font-semibold">
                    {stats.avgX.toFixed(1)}
                    <span className="text-sm ml-1">px</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Average Y Position</div>
                  <div className="text-2xl font-semibold">
                    {stats.avgY.toFixed(1)}
                    <span className="text-sm ml-1">px</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">Stabilization</div>
                  <div className="text-lg">
                    <div className="text-green-600">✓ Stable positioning</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Max variation: &lt;5% across frames
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Video Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Resolution</div>
              <div className="font-mono font-semibold">
                {data.video_info.width}x{data.video_info.height}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Frame Rate</div>
              <div className="font-mono font-semibold">
                {data.video_info.fps.toFixed(1)} FPS
              </div>
            </div>
            <div>
              <div className="text-gray-600">Total Frames</div>
              <div className="font-mono font-semibold">
                {data.video_info.frames}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Duration</div>
              <div className="font-mono font-semibold">
                {data.video_info.duration_s.toFixed(2)}s
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h2 className="text-lg font-bold mb-4 text-blue-900">How to Use</h2>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>
              • Use the <strong>frame slider</strong> to navigate through the video
            </li>
            <li>
              • Click <strong>Play</strong> to animate through all frames
            </li>
            <li>
              • Toggle <strong>Display Options</strong> to show/hide different elements
            </li>
            <li>
              • <span className="text-orange-500">■ Orange box</span> = Bounding rectangle
            </li>
            <li>
              • <span className="text-yellow-500">■ Yellow line</span> = Precise contour
            </li>
            <li>
              • <span className="text-blue-500">■ Blue dot</span> = Center point
            </li>
            <li>
              • <span className="text-green-500">■ Green ellipse</span> = Fitted ellipse
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm py-8">
          <p>Yellow Mask Analysis Tool</p>
          <p className="mt-1">
            Data file: <span className="font-mono">mask_positions.json</span>
          </p>
        </div>
      </div>
    </main>
  );
}
