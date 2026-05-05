"""
Export yellow mask data to various formats
将黄色高亮框数据导出为多种格式
"""

import json
import csv
from pathlib import Path
from typing import List, Dict
import xml.etree.ElementTree as ET


class MaskDataExporter:
    def __init__(self, json_file: str):
        """Load JSON mask data"""
        with open(json_file, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.video_info = self.data['video_info']
        self.frames = self.data['frames']
    
    def export_csv(self, output_path: str):
        """
        Export to CSV format
        导出为CSV格式
        
        CSV columns:
        - frame_id: Frame number
        - timestamp_s: Timestamp in seconds
        - has_mask: Whether yellow mask detected (1=Yes, 0=No)
        - bbox_x, bbox_y, bbox_width, bbox_height: Bounding box data
        - center_x, center_y: Center point
        - area: Mask area
        - perimeter: Mask perimeter
        """
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Write header
            writer.writerow([
                'frame_id',
                'timestamp_s',
                'has_mask',
                'bbox_x',
                'bbox_y',
                'bbox_width',
                'bbox_height',
                'bbox_center_x',
                'bbox_center_y',
                'area',
                'perimeter',
                'vertices_count'
            ])
            
            # Write data
            for frame in self.frames:
                frame_id = frame['frame_id']
                timestamp = frame['timestamp_s']
                has_mask = 1 if frame['yellow_mask'] else 0
                
                if frame['yellow_mask']:
                    mask = frame['yellow_mask']
                    bbox = mask['bounding_box']
                    center_x = bbox['x'] + bbox['width'] / 2
                    center_y = bbox['y'] + bbox['height'] / 2
                    
                    writer.writerow([
                        frame_id,
                        f"{timestamp:.4f}",
                        has_mask,
                        bbox['x'],
                        bbox['y'],
                        bbox['width'],
                        bbox['height'],
                        f"{center_x:.2f}",
                        f"{center_y:.2f}",
                        f"{mask['area']:.2f}",
                        f"{mask['perimeter']:.2f}",
                        mask['contour_vertices']
                    ])
                else:
                    writer.writerow([
                        frame_id,
                        f"{timestamp:.4f}",
                        has_mask,
                        '', '', '', '', '', '', '', '', ''
                    ])
        
        print(f"✓ Exported CSV: {output_path}")
    
    def export_xml(self, output_path: str):
        """
        Export to XML format
        导出为XML格式
        """
        root = ET.Element('mask_analysis')
        
        # Add video info
        video_elem = ET.SubElement(root, 'video_info')
        for key, value in self.video_info.items():
            elem = ET.SubElement(video_elem, key)
            elem.text = str(value)
        
        # Add frames
        frames_elem = ET.SubElement(root, 'frames')
        
        for frame in self.frames:
            frame_elem = ET.SubElement(frames_elem, 'frame', id=str(frame['frame_id']))
            
            # Frame metadata
            ET.SubElement(frame_elem, 'timestamp_s').text = f"{frame['timestamp_s']:.4f}"
            ET.SubElement(frame_elem, 'timestamp_ms').text = f"{frame['timestamp_ms']:.4f}"
            
            # Yellow mask data
            if frame['yellow_mask']:
                mask = frame['yellow_mask']
                mask_elem = ET.SubElement(frame_elem, 'yellow_mask')
                
                # Bounding box
                bbox = mask['bounding_box']
                bbox_elem = ET.SubElement(mask_elem, 'bounding_box')
                for key, value in bbox.items():
                    ET.SubElement(bbox_elem, key).text = str(value)
                
                # Statistics
                ET.SubElement(mask_elem, 'area').text = f"{mask['area']:.2f}"
                ET.SubElement(mask_elem, 'perimeter').text = f"{mask['perimeter']:.2f}"
                ET.SubElement(mask_elem, 'vertices').text = str(mask['contour_vertices'])
                
                # Contour points
                contour_elem = ET.SubElement(mask_elem, 'contour')
                for i, (x, y) in enumerate(mask['contour_points']):
                    point_elem = ET.SubElement(contour_elem, 'point', index=str(i))
                    point_elem.set('x', str(x))
                    point_elem.set('y', str(y))
                
                # Ellipse if available
                if 'ellipse' in mask and mask['ellipse']:
                    ellipse = mask['ellipse']
                    ellipse_elem = ET.SubElement(mask_elem, 'ellipse')
                    ET.SubElement(ellipse_elem, 'center_x').text = str(ellipse['center'][0])
                    ET.SubElement(ellipse_elem, 'center_y').text = str(ellipse['center'][1])
                    ET.SubElement(ellipse_elem, 'major_axis').text = str(ellipse['major_axis'])
                    ET.SubElement(ellipse_elem, 'minor_axis').text = str(ellipse['minor_axis'])
                    ET.SubElement(ellipse_elem, 'angle').text = str(ellipse['angle'])
            else:
                ET.SubElement(frame_elem, 'yellow_mask').text = "None"
        
        tree = ET.ElementTree(root)
        tree.write(output_path, encoding='utf-8', xml_declaration=True)
        print(f"✓ Exported XML: {output_path}")
    
    def export_svg_frames(self, output_dir: str, sample_frames: List[int] = None):
        """
        Export selected frames as SVG with mask overlay
        导出选定帧为SVG格式（带高亮框）
        
        Args:
            output_dir: Output directory for SVG files
            sample_frames: List of frame IDs to export (if None, export every 30th frame)
        """
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        if sample_frames is None:
            # Export every 30th frame
            sample_frames = list(range(0, len(self.frames), 30))
        
        for frame_id in sample_frames:
            if frame_id >= len(self.frames):
                continue
            
            frame = self.frames[frame_id]
            if not frame['yellow_mask']:
                continue
            
            svg_path = Path(output_dir) / f"frame_{frame_id:04d}.svg"
            
            mask = frame['yellow_mask']
            bbox = mask['bounding_box']
            
            # Create SVG
            svg_lines = [
                f'<svg width="{self.video_info["width"]}" '
                f'height="{self.video_info["height"]}" '
                f'xmlns="http://www.w3.org/2000/svg">',
                f'<rect width="100%" height="100%" fill="white"/>',
                f'<!-- Frame {frame_id} at {frame["timestamp_s"]:.2f}s -->',
            ]
            
            # Draw bounding box
            svg_lines.append(
                f'<rect x="{bbox["x"]}" y="{bbox["y"]}" '
                f'width="{bbox["width"]}" height="{bbox["height"]}" '
                f'stroke="orange" stroke-width="3" fill="none"/>'
            )
            
            # Draw contour
            if mask['contour_points']:
                points_str = ' '.join(
                    [f"{x},{y}" for x, y in mask['contour_points']]
                )
                svg_lines.append(
                    f'<polygon points="{points_str}" '
                    f'stroke="yellow" stroke-width="2" fill="none"/>'
                )
            
            # Draw center point
            center_x = bbox['x'] + bbox['width'] / 2
            center_y = bbox['y'] + bbox['height'] / 2
            svg_lines.append(
                f'<circle cx="{center_x}" cy="{center_y}" r="5" '
                f'fill="blue" opacity="0.7"/>'
            )
            
            # Add text info
            svg_lines.append(
                f'<text x="10" y="20" font-size="14" fill="black">'
                f'Frame: {frame_id} | Time: {frame["timestamp_s"]:.2f}s'
                f'</text>'
            )
            svg_lines.append('</svg>')
            
            with open(svg_path, 'w') as f:
                f.write('\n'.join(svg_lines))
        
        print(f"✓ Exported SVG frames: {output_dir} ({len(sample_frames)} files)")
    
    def export_statistics(self, output_path: str):
        """
        Export summary statistics to JSON
        导出统计信息为JSON格式
        """
        frames_with_mask = [f for f in self.frames if f['yellow_mask'] is not None]
        
        if not frames_with_mask:
            stats = {"error": "No frames with yellow mask detected"}
        else:
            masks = [f['yellow_mask'] for f in frames_with_mask]
            bboxes = [m['bounding_box'] for m in masks]
            areas = [m['area'] for m in masks]
            
            stats = {
                "total_frames": len(self.frames),
                "frames_with_mask": len(frames_with_mask),
                "detection_rate": f"{(len(frames_with_mask) / len(self.frames) * 100):.1f}%",
                "bounding_box": {
                    "avg_width": sum(b['width'] for b in bboxes) / len(bboxes),
                    "avg_height": sum(b['height'] for b in bboxes) / len(bboxes),
                    "min_width": min(b['width'] for b in bboxes),
                    "max_width": max(b['width'] for b in bboxes),
                    "min_height": min(b['height'] for b in bboxes),
                    "max_height": max(b['height'] for b in bboxes),
                    "avg_x": sum(b['x'] for b in bboxes) / len(bboxes),
                    "avg_y": sum(b['y'] for b in bboxes) / len(bboxes),
                },
                "area": {
                    "avg": sum(areas) / len(areas),
                    "min": min(areas),
                    "max": max(areas),
                },
                "time_range": {
                    "start_s": self.frames[0]['timestamp_s'],
                    "end_s": self.frames[-1]['timestamp_s'],
                    "duration_s": self.video_info['duration_s'],
                },
                "video_info": self.video_info,
            }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Exported statistics: {output_path}")
    
    def export_all(self, output_dir: str = "mask_exports"):
        """
        Export all formats
        导出所有格式
        """
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        self.export_csv(Path(output_dir) / "mask_data.csv")
        self.export_xml(Path(output_dir) / "mask_data.xml")
        self.export_statistics(Path(output_dir) / "mask_statistics.json")
        self.export_svg_frames(Path(output_dir) / "svg_frames")
        
        print(f"\n✓ All exports completed in: {output_dir}/")


def main():
    """Main execution"""
    from pathlib import Path
    
    # Find mask_positions.json
    json_file = Path(__file__).parent / "mask_positions.json"
    
    if not json_file.exists():
        print(f"Error: {json_file} not found")
        return
    
    # Export all formats
    exporter = MaskDataExporter(str(json_file))
    exporter.export_all()


if __name__ == "__main__":
    main()
