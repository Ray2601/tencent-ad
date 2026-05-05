/**
 * API route to query frame mask data
 * 用于查询帧高亮框数据的API路由
 */

import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { MaskPositionsData, FrameData } from "@/lib/mask-types";

let maskData: MaskPositionsData | null = null;

// Load mask data on first request
function getMaskData(): MaskPositionsData {
  if (!maskData) {
    const dataPath = join(process.cwd(), "public", "mask_positions.json");
    const fileContent = readFileSync(dataPath, "utf-8");
    maskData = JSON.parse(fileContent);
  }
  return maskData;
}

/**
 * GET /api/frames/[frameId]
 * Get data for a specific frame
 * 获取特定帧的数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ frameId: string }> }
) {
  try {
    const { frameId } = await params;
    const data = getMaskData();
    const id = parseInt(frameId);

    if (isNaN(id) || id < 0 || id >= data.frames.length) {
      return NextResponse.json(
        { error: `Invalid frame ID: ${frameId}` },
        { status: 400 }
      );
    }

    const frame = data.frames[id];

    return NextResponse.json({
      success: true,
      frame: frame,
      video_info: data.video_info,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve frame data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/frames
 * Query frames with filters
 * 查询符合条件的帧
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = getMaskData();

    const {
      timeStart,
      timeEnd,
      hasYellowMask,
      minArea,
      maxArea,
      limit = 100,
    } = body;

    let frames: FrameData[] = data.frames;

    // Filter by time range
    if (typeof timeStart === "number" || typeof timeEnd === "number") {
      frames = frames.filter((f) => {
        if (timeStart && f.timestamp_s < timeStart) return false;
        if (timeEnd && f.timestamp_s > timeEnd) return false;
        return true;
      });
    }

    // Filter by yellow mask presence
    if (typeof hasYellowMask === "boolean") {
      frames = frames.filter((f) => {
        if (hasYellowMask) {
          return f.yellow_mask !== null;
        } else {
          return f.yellow_mask === null;
        }
      });
    }

    // Filter by area range
    if (typeof minArea === "number" || typeof maxArea === "number") {
      frames = frames.filter((f) => {
        if (!f.yellow_mask) return false;
        const area = f.yellow_mask.area;
        if (minArea && area < minArea) return false;
        if (maxArea && area > maxArea) return false;
        return true;
      });
    }

    // Limit results
    frames = frames.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: frames.length,
      frames: frames,
      video_info: data.video_info,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query frames" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS request for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
