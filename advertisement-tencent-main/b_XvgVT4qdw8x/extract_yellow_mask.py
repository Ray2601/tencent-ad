"""
Extract yellow highlight frame positions from video and export as JSON
检测视频中的黄色高亮框，导出每一帧的JSON位置数据
"""

import cv2
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional

class YellowMaskExtractor:
    def __init__(self, video_path: str):
        """
        Initialize video extractor
        
        Args:
            video_path: Path to the video file
        """
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)
        
        if not self.cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")
        
        # Get video properties
        self.frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        print(f"Video Info:")
        print(f"  Frames: {self.frame_count}")
        print(f"  FPS: {self.fps}")
        print(f"  Resolution: {self.width}x{self.height}")
    
    def detect_yellow_mask(self, frame: np.ndarray) -> Optional[Dict]:
        """
        Detect yellow highlight mask in a frame
        
        Args:
            frame: Input frame (BGR format from OpenCV)
        
        Returns:
            Dictionary containing mask position data or None if not detected
        """
        # Convert BGR to HSV for better color detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Define yellow color range in HSV
        # Yellow: H=20-40, S=100-255, V=100-255
        lower_yellow = np.array([15, 100, 100])
        upper_yellow = np.array([45, 255, 255])
        
        # Create mask for yellow color
        mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
        
        # Apply morphological operations to reduce noise
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(contours) == 0:
            return None
        
        # Find the largest contour (most likely the yellow frame)
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Get bounding rectangle
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Get contour area and perimeter
        area = cv2.contourArea(largest_contour)
        perimeter = cv2.arcLength(largest_contour, True)
        
        # Try to fit ellipse if there are enough points
        ellipse = None
        if len(largest_contour) >= 5:
            try:
                ellipse_data = cv2.fitEllipse(largest_contour)
                center, (major_axis, minor_axis), angle = ellipse_data
                ellipse = {
                    "center": list(map(float, center)),
                    "major_axis": float(major_axis),
                    "minor_axis": float(minor_axis),
                    "angle": float(angle)
                }
            except:
                pass
        
        # Get contour points (simplified)
        epsilon = 0.02 * perimeter
        approx = cv2.approxPolyDP(largest_contour, epsilon, True)
        contour_points = approx.reshape(-1, 2).tolist()
        
        result = {
            "bounding_box": {
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h),
                "x_max": int(x + w),
                "y_max": int(y + h)
            },
            "contour_points": contour_points,
            "area": float(area),
            "perimeter": float(perimeter),
            "contour_vertices": int(len(contour_points))
        }
        
        if ellipse:
            result["ellipse"] = ellipse
        
        return result
    
    def extract_frames(self, progress_interval: int = 10) -> List[Dict]:
        """
        Extract yellow mask data from all frames
        
        Args:
            progress_interval: Print progress every N frames
        
        Returns:
            List of frame data dictionaries
        """
        frames_data = []
        frame_idx = 0
        
        while True:
            ret, frame = self.cap.read()
            
            if not ret:
                break
            
            # Detect yellow mask
            mask_data = self.detect_yellow_mask(frame)
            
            frame_info = {
                "frame_id": frame_idx,
                "timestamp_ms": (frame_idx / self.fps) * 1000,
                "timestamp_s": frame_idx / self.fps
            }
            
            if mask_data:
                frame_info["yellow_mask"] = mask_data
            else:
                frame_info["yellow_mask"] = None
            
            frames_data.append(frame_info)
            
            if (frame_idx + 1) % progress_interval == 0:
                print(f"Processed {frame_idx + 1}/{self.frame_count} frames")
            
            frame_idx += 1
        
        self.cap.release()
        return frames_data
    
    def save_json(self, frames_data: List[Dict], output_path: str):
        """
        Save extracted data to JSON file
        
        Args:
            frames_data: List of frame data
            output_path: Output JSON file path
        """
        output = {
            "video_info": {
                "frames": self.frame_count,
                "fps": self.fps,
                "width": self.width,
                "height": self.height,
                "duration_s": self.frame_count / self.fps
            },
            "frames": frames_data
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"Saved results to: {output_path}")


def main():
    """Main execution"""
    # Video path
    video_path = Path(__file__).parent / "public" / "mask.mp4"
    
    if not video_path.exists():
        print(f"Error: Video not found at {video_path}")
        return
    
    # Output path
    output_path = Path(__file__).parent / "mask_positions.json"
    
    try:
        # Extract yellow mask data
        extractor = YellowMaskExtractor(str(video_path))
        frames_data = extractor.extract_frames(progress_interval=10)
        
        # Save to JSON
        extractor.save_json(frames_data, str(output_path))
        
        # Print summary
        frames_with_mask = sum(1 for f in frames_data if f["yellow_mask"] is not None)
        print(f"\nSummary:")
        print(f"  Total frames: {len(frames_data)}")
        print(f"  Frames with yellow mask detected: {frames_with_mask}")
        print(f"  Detection rate: {frames_with_mask / len(frames_data) * 100:.1f}%")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
