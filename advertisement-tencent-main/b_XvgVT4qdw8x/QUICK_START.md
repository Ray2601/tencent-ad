# 快速开始指南 - 黄色高亮框提取

## 5分钟快速上手

### 1️⃣ 查看已生成的数据

所有数据已经生成完毕！主要文件包括：

```
✅ mask_positions.json          - 完整的JSON数据 (300帧)
✅ mask_exports/mask_data.csv   - CSV格式数据表
✅ mask_exports/mask_data.xml   - XML格式数据
✅ mask_exports/svg_frames/     - 10个可视化SVG文件
```

### 2️⃣ 启动可视化界面

```bash
# 启动Next.js开发服务器
npm run dev

# 访问可视化页面
# http://localhost:3000/mask
```

**功能**：
- 🖱️ 拖动滑块查看任意帧
- ▶️ 点击Play自动播放视频
- ✓ 勾选显示选项显示/隐藏各种标记
- 📊 实时查看当前帧的统计数据

### 3️⃣ 在代码中使用数据

#### TypeScript中加载数据
```typescript
import { MaskPositionsData, getFrameAtTime } from '@/lib/mask-types';
import maskData from '@/public/mask_positions.json';

// 获取第5秒的帧
const frame = getFrameAtTime(maskData, 5.0);

if (frame?.yellow_mask) {
  console.log('边界框:', frame.yellow_mask.bounding_box);
  console.log('轮廓点:', frame.yellow_mask.contour_points);
  console.log('面积:', frame.yellow_mask.area);
}
```

#### 通过API查询数据
```typescript
// 获取第100帧
fetch('/api/frames/100')
  .then(r => r.json())
  .then(data => console.log(data.frame));

// 查询时间范围内的帧
fetch('/api/frames', {
  method: 'POST',
  body: JSON.stringify({
    timeStart: 2.0,
    timeEnd: 5.0,
    hasYellowMask: true
  })
})
  .then(r => r.json())
  .then(data => console.log(`找到 ${data.count} 帧`));
```

### 4️⃣ 导出数据

所有导出格式已生成！查看 `mask_exports/` 目录：

| 文件 | 用途 |
|------|------|
| `mask_data.csv` | 在Excel中打开，进行表格分析 |
| `mask_data.xml` | 用于系统集成，包含完整数据 |
| `mask_statistics.json` | 统计汇总数据 |
| `svg_frames/*.svg` | 在浏览器中查看可视化结果 |

## 关键数据一览

### 视频信息
- **总帧数**: 300
- **帧率**: 30 FPS
- **分辨率**: 1280×720
- **时长**: 10秒

### 检测结果
- **检测到框的帧**: 283/300 (94.3%)
- **平均边界框大小**: 382×467 像素
- **区域面积**: 10,420 ~ 144,599 px²

### 黄色边界框坐标
```
位置稳定性: ✅ 优秀
- 平均位置: (518, 213)
- 位置变化: < 5%
- 尺寸变化: < 8%
```

## 数据结构示例

### 一帧的完整数据
```json
{
  "frame_id": 0,
  "timestamp_s": 0.0,
  "yellow_mask": {
    "bounding_box": {
      "x": 632,
      "y": 144,
      "width": 354,
      "height": 456,
      "x_max": 986,
      "y_max": 600
    },
    "contour_points": [
      [746, 146],
      [766, 329],
      [688, 296],
      ...
    ],
    "area": 108240.0,
    "perimeter": 1841.39,
    "ellipse": {
      "center": [816.64, 414.55],
      "major_axis": 311.53,
      "minor_axis": 443.73,
      "angle": 5.82
    }
  }
}
```

## 常见操作

### 获取特定帧的高亮框位置
```typescript
const frame = maskData.frames[50];
const bbox = frame.yellow_mask?.bounding_box;

console.log(`第50帧的边界框: (${bbox.x}, ${bbox.y}) ${bbox.width}×${bbox.height}`);
```

### 获取所有检测到框的帧
```typescript
import { getFramesWithMask } from '@/lib/mask-types';

const framesWithMask = getFramesWithMask(maskData);
console.log(`共 ${framesWithMask.length} 帧检测到黄色框`);
```

### 获取统计信息
```typescript
import { calculateBBoxStats } from '@/lib/mask-types';

const stats = calculateBBoxStats(maskData);
console.log(`
  平均宽度: ${stats.avgWidth.toFixed(1)}px
  平均高度: ${stats.avgHeight.toFixed(1)}px
  宽度范围: ${stats.minWidth}-${stats.maxWidth}px
  高度范围: ${stats.minHeight}-${stats.maxHeight}px
`);
```

### 查找特定时间的帧
```typescript
import { getFrameAtTime, getFramesInRange } from '@/lib/mask-types';

// 获取第5秒的帧
const frameAt5s = getFrameAtTime(maskData, 5.0);

// 获取2-8秒之间的所有帧
const framesInRange = getFramesInRange(maskData, 2.0, 8.0);
console.log(`2-8秒之间共 ${framesInRange.length} 帧`);
```

## 文件位置速查

| 用途 | 文件 |
|------|------|
| 主数据文件 | `mask_positions.json` |
| 类型定义 | `lib/mask-types.ts` |
| 可视化组件 | `components/mask-visualizer.tsx` |
| 可视化页面 | `app/mask/page.tsx` |
| API路由 | `app/api/frames/[frameId]/route.ts` |
| 导出数据 | `mask_exports/` |
| 详细文档 | `YELLOW_MASK_README.md` |
| 完整方案 | `SOLUTION_SUMMARY.md` |

## 集成到你的应用

### 在现有页面中集成可视化

```typescript
// your-page.tsx
"use client";

import { MaskVisualizer } from "@/components/mask-visualizer";
import maskData from "@/public/mask_positions.json";

export default function YourPage() {
  return (
    <div>
      <h1>视频分析</h1>
      <MaskVisualizer data={maskData} />
    </div>
  );
}
```

### 实时同步视频播放

```typescript
import { getFrameAtTime } from '@/lib/mask-types';

function syncWithVideo(videoElement: HTMLVideoElement) {
  videoElement.addEventListener('timeupdate', () => {
    const frame = getFrameAtTime(maskData, videoElement.currentTime);
    
    if (frame?.yellow_mask) {
      const bbox = frame.yellow_mask.bounding_box;
      // 在canvas或overlay上绘制边界框
      drawBBox(bbox);
    }
  });
}
```

## 常见问题

**Q: 数据文件在哪里？**  
A: `mask_positions.json` 在项目根目录

**Q: 如何查看具体某一帧的数据？**  
A: 访问 `/mask` 页面使用滑块查看，或使用 API 查询

**Q: 可以修改检测参数吗？**  
A: 可以，编辑 `extract_yellow_mask.py` 中的HSV范围重新处理

**Q: 数据包含什么信息？**  
A: 每帧包含边界框坐标、轮廓点、面积、周长、椭圆拟合等数据

**Q: 可以用于其他视频吗？**  
A: 可以，调用 `extract_yellow_mask.py` 处理其他视频文件

## 下一步建议

1. 🎨 **集成到UI** - 将可视化组件集成到你的应用
2. 📊 **数据分析** - 使用导出的CSV数据进行高级分析
3. 🔄 **自动化** - 将脚本集成到CI/CD流程
4. 🚀 **性能优化** - 使用GPU加速处理更大的视频

## 获取帮助

- 详细文档: [YELLOW_MASK_README.md](YELLOW_MASK_README.md)
- 完整方案: [SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md)
- 类型参考: [lib/mask-types.ts](lib/mask-types.ts)

---

**准备好了吗？访问 `http://localhost:3000/mask` 查看可视化界面！** 🚀
