import os
import cv2
import json
import whisper
import torch
import numpy as np
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector
from ultralytics import YOLO

class VideoAnalyzer:
    def __init__(self, video_path, output_dir):
        self.video_path = video_path
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")

    def analyze(self):
        print("Starting analysis...")
        scenes = self.segment_scenes()
        print("Scenes segmented.")
        transcript = self.transcribe_audio()
        print("Audio transcribed.")
        objects = self.track_objects()
        print("Objects tracked.")
        # characters = self.identify_characters() # Can be slow, maybe optional or simplified
        # shots = self.classify_shots() # Basic implementation
        
        return {
            "scenes": scenes,
            "transcript": transcript,
            "objects": objects,
            # "characters": characters,
            # "shots": shots
        }

    def segment_scenes(self):
        video_manager = VideoManager([self.video_path])
        scene_manager = SceneManager()
        scene_manager.add_detector(ContentDetector())
        video_manager.set_downscale_factor()
        video_manager.start()
        scene_manager.detect_scenes(frame_source=video_manager)
        scene_list = scene_manager.get_scene_list()
        scenes = []
        for i, scene in enumerate(scene_list):
            scenes.append({
                "index": i,
                "start_time": scene[0].get_seconds(),
                "end_time": scene[1].get_seconds(),
                "start_frame": scene[0].get_frames(),
                "end_frame": scene[1].get_frames()
            })
        return scenes

    def transcribe_audio(self):
        model = whisper.load_model("base", device=self.device)
        result = model.transcribe(self.video_path)
        return result["segments"]

    def track_objects(self):
        # Using YOLOv8 for object detection on sampled frames to save time
        model = YOLO("yolov8n.pt") 
        cap = cv2.VideoCapture(self.video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = int(fps) # Analyze 1 frame per second
        
        objects_detected = {}
        
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % frame_interval == 0:
                results = model(frame, verbose=False)
                timestamp = frame_count / fps
                
                for r in results:
                    for box in r.boxes:
                        cls = int(box.cls[0])
                        conf = float(box.conf[0])
                        name = model.names[cls]
                        
                        if name not in objects_detected:
                            objects_detected[name] = []
                        
                        # Avoid duplicate entries for same second if possible, or just append
                        objects_detected[name].append({
                            "timestamp": timestamp,
                            "confidence": conf
                        })
            
            frame_count += 1
        
        cap.release()
        return objects_detected

    # Placeholder for more advanced features to keep initial implementation robust
    def identify_characters(self):
        pass

    def classify_shots(self):
        pass
