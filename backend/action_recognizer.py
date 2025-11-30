"""
Action Recognition Module using simple heuristics
(Lightweight alternative to SlowFast for faster processing)
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple

class ActionRecognizer:
    def __init__(self):
        self.actions = []
        
    def recognize_actions(self, video_path: str, object_detections: Dict) -> List[Dict]:
        """
        Recognize actions using lightweight heuristics based on object positions
        
        Args:
            video_path: Path to video file
            object_detections: Dictionary of detected objects per frame
            
        Returns:
            List of detected actions with timestamps
        """
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = 0
        actions_detected = []
        
        # Track person positions over time
        person_positions = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            timestamp = frame_count / fps
            
            # Check for people in this frame
            # (This will be integrated with YOLO detections)
            
            frame_count += 1
        
        cap.release()
        
        # Analyze movement patterns
        actions_detected = self._analyze_movement_patterns(person_positions, fps)
        
        return actions_detected
    
    def _analyze_movement_patterns(self, positions: List, fps: float) -> List[Dict]:
        """
        Analyze person position changes to infer actions
        
        Simple heuristics:
        - Large position changes = walking/running
        - Minimal movement = sitting/standing
        - Rapid up-down = jumping/playing
        """
        actions = []
        
        # Simple template for now - will enhance with actual logic
        actions.append({
            "action": "walking",
            "confidence": 0.8,
            "timestamp": 0,
            "duration": 5.0
        })
        
        return actions

def detect_environment(objects: List[str]) -> str:
    """
    Detect environment type based on objects present
    
    Args:
        objects: List of detected object names
        
    Returns:
        Environment type: "outdoor", "indoor", "urban", etc.
    """
    outdoor_objects = {'tree', 'grass', 'sky', 'car', 'road', 'building'}
    indoor_objects = {'couch', 'bed', 'table', 'chair', 'tv', 'door'}
    
    outdoor_count = sum(1 for obj in objects if obj in outdoor_objects)
    indoor_count = sum(1 for obj in objects if obj in indoor_objects)
    
    if outdoor_count > indoor_count:
        return "outdoor"
    elif indoor_count > outdoor_count:
        return "indoor"
    else:
        return "unknown"

def count_people_in_scene(object_detections: Dict, start_frame: int, end_frame: int) -> int:
    """
    Count average number of people in a scene
    
    Args:
        object_detections: Dictionary with 'person' detections
        start_frame: Scene start frame
        end_frame: Scene end frame
        
    Returns:
        Average people count (rounded)
    """
    if 'person' not in object_detections:
        return 0
    
    person_detections = object_detections['person']
    scene_detections = [
        d for d in person_detections 
        if start_frame <= d.get('frame', 0) <= end_frame
    ]
    
    if not scene_detections:
        return 0
    
    # Count unique people per frame and average
    # For now, simple count
    return len(scene_detections) // max(1, (end_frame - start_frame))
