# Yellow Mask Extraction Guide
# 黄色高亮框提取指南

## 概述

本项目通过Python脚本从`mask.mp4`视频中提取黄色高亮框的位置信息，生成JSON数据文件，并提供TypeScript/React组件进行可视化。

## 文件说明

### 1. `extract_yellow_mask.py` - 视频处理脚本

**功能**：
- 读取视频文件的每一帧
- 使用HSV色彩空间检测黄色像素
- 识别黄色高亮框的轮廓
- 提取边界框、轮廓点、椭圆拟合等数据
- 导出为JSON文件

**使用方法**：
```bash
# 安装依赖
pip install opencv-python numpy

# 运行脚本
python extract_yellow_mask.py
```

**输出**：
- `mask_positions.json` - 包含所有帧的黄色高亮位置数据

### 2. `mask_positions.json` - 数据文件

**结构**：
```json
{
  "video_info": {
    "frames": 300,              // 总帧数
    "fps": 30.0,                // 帧率
    "width": 1280,              // 视频宽度
    "height": 720,              // 视频高度
    "duration_s": 10.0          // 总时长（秒）
  },
  "frames": [
    {
      "frame_id": 0,            // 帧序号（0开始）
      "timestamp_ms": 0.0,      // 时间戳（毫秒）
      "timestamp_s": 0.0,       // 时间戳（秒）
      "yellow_mask": {
        "bounding_box": {
          "x": 632,             // 左上角X坐标
          "y": 144,             // 左上角Y坐标
          "width": 354,         // 宽度
          "height": 456,        // 高度
          "x_max": 986,         // 右下角X坐标
          "y_max": 600          // 右下角Y坐标
        },
        "contour_points": [     // 轮廓顶点数组 [x, y]
          [746, 146],
          [766, 329],
          ...
        ],
        "area": 108240.0,       // 区域面积（像素²）
        "perimeter": 1841.39,   // 周长
        "contour_vertices": 13, // 顶点数
        "ellipse": {            // 椭圆拟合数据
          "center": [816.64, 414.55],
          "major_axis": 311.53,
          "minor_axis": 443.73,
          "angle": 5.82
        }
      }
    },
    ...
  ]
}
```

**关键统计数据**：
- 总帧数：300
- 检测到黄色高亮框的帧：283
- 检测率：94.3%

### 3. `lib/mask-types.ts` - TypeScript类型定义

**提供的类型**：
- `MaskPositionsData` - 完整数据结构
- `FrameData` - 单帧数据
- `YellowMask` - 黄色高亮框数据
- `BoundingBox` - 边界框
- `Ellipse` - 椭圆数据

**提供的工具函数**：
```typescript
// 获取边界框中心点
getBoundingBoxCenter(bbox: BoundingBox): [number, number]

// 获取特定帧的轮廓点
getFrameContourPoints(frame: FrameData): Array<[number, number]> | null

// 筛选检测到高亮框的所有帧
getFramesWithMask(data: MaskPositionsData): FrameData[]

// 获取特定时间戳的帧
getFrameAtTime(data: MaskPositionsData, timeSeconds: number): FrameData | null

// 获取时间范围内的帧
getFramesInRange(data: MaskPositionsData, startSeconds: number, endSeconds: number): FrameData[]

// 计算边界框统计信息
calculateBBoxStats(data: MaskPositionsData)
```

### 4. `components/mask-visualizer.tsx` - React可视化组件

**功能**：
- Canvas绘制黄色高亮框的可视化
- 逐帧播放和拖动查看
- 支持显示/隐藏不同元素
- 显示统计信息

**使用示例**：
```typescript
import { MaskVisualizer } from '@/components/mask-visualizer';
import maskData from '@/public/mask_positions.json';

export default function Page() {
  return <MaskVisualizer data={maskData} />;
}
```

## 黄色颜色检测参数

脚本使用HSV色彩空间进行颜色检测：

```python
# HSV颜色范围
lower_yellow = np.array([15, 100, 100])   # H, S, V最小值
upper_yellow = np.array([45, 255, 255])   # H, S, V最大值
```

**调整参数**（如果需要优化检测）：
- **H (色相)**: 15-45
  - 黄色范围约为20-40
  - 调大范围可检测更多橙黄色
- **S (饱和度)**: 100-255
  - 值越高越纯正
  - 降低可检测淡黄色
- **V (亮度)**: 100-255
  - 值越高越亮
  - 降低可检测暗黄色

## 数据使用示例

### 1. 在React中加载和使用数据

```typescript
import { getFramesWithMask, calculateBBoxStats } from '@/lib/mask-types';
import maskData from '@/public/mask_positions.json';

// 获取有检测结果的帧
const framesWithMask = getFramesWithMask(maskData);

// 获取统计信息
const stats = calculateBBoxStats(maskData);
console.log(`Average box size: ${stats?.avgWidth}x${stats?.avgHeight}`);

// 获取特定时间的帧
const frameAt5s = getFrameAtTime(maskData, 5.0);
if (frameAt5s?.yellow_mask) {
  console.log('Bounding box:', frameAt5s.yellow_mask.bounding_box);
}
```

### 2. 导出特定帧的坐标

```typescript
function exportFrameCoordinates(frameId: number) {
  const frame = maskData.frames[frameId];
  if (!frame?.yellow_mask) return null;
  
  return {
    frameId: frame.frame_id,
    timestamp: frame.timestamp_s,
    bbox: frame.yellow_mask.bounding_box,
    contourPoints: frame.yellow_mask.contour_points
  };
}
```

### 3. 检测高亮框是否在特定区域

```typescript
function isBoxInRegion(
  frame: FrameData,
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number
): boolean {
  if (!frame.yellow_mask) return false;
  
  const bbox = frame.yellow_mask.bounding_box;
  return (
    bbox.x >= regionX &&
    bbox.y >= regionY &&
    bbox.x_max <= regionX + regionW &&
    bbox.y_max <= regionY + regionH
  );
}
```

## 性能指标

- **处理速度**：约30 FPS （取决于硬件）
- **检测精度**：94.3% (283/300帧)
- **输出文件大小**：约500-600KB
- **边界框变化**：稳定，最大宽度变化 < 5%

## 常见问题

### Q: 如何调整检测敏感度？

**A**: 修改 `extract_yellow_mask.py` 中的HSV范围：
```python
# 更灵敏（检测更多像素）
lower_yellow = np.array([10, 80, 80])
upper_yellow = np.array([50, 255, 255])

# 更严格（只检测纯黄色）
lower_yellow = np.array([20, 150, 150])
upper_yellow = np.array([40, 255, 255])
```

### Q: 如何处理某些帧未检测到高亮框的情况？

**A**: 检查 `yellow_mask` 是否为 `null`：
```typescript
if (frame.yellow_mask !== null) {
  // 处理检测到的帧
  console.log(frame.yellow_mask.bounding_box);
} else {
  // 处理未检测的帧
  console.log(`Frame ${frame.frame_id} has no yellow mask`);
}
```

### Q: 如何在实时视频中应用这些数据？

**A**: 使用时间戳同步：
```typescript
function syncWithVideo(videoCurrentTime: number) {
  const frame = getFrameAtTime(maskData, videoCurrentTime);
  if (frame?.yellow_mask) {
    // 绘制或显示高亮框
    drawBoundingBox(frame.yellow_mask.bounding_box);
  }
}
```

## 技术细节

### 颜色检测流程

1. **读取帧** → BGR图像 (OpenCV格式)
2. **转换色彩空间** → BGR → HSV
3. **颜色范围过滤** → HSV inRange()
4. **降噪处理** → Morphological operations (Close + Open)
5. **轮廓检测** → findContours()
6. **提取数据** → 边界框、轮廓点、椭圆拟合

### 输出数据精度

- **坐标精度**：1像素
- **面积精度**：浮点数
- **角度精度**：小数点后2位

## 扩展可能性

1. **实时处理**：处理直播视频流
2. **多颜色检测**：同时检测多种颜色
3. **运动追踪**：跟踪高亮框的运动轨迹
4. **3D重建**：如果有立体视频输入
5. **性能优化**：GPU加速处理

## 许可和使用

该工具仅供内部项目使用。任何修改或改进都应记录在此文档中。
