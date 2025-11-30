# 🎬 Video Scene Analyzer - Complete Usage Guide

## What This App Does

The **Video Scene Analyzer** is an AI-powered video analysis tool that provides comprehensive temporal analysis of your videos using state-of-the-art machine learning models.

### Core Features:

1. **🎬 Scene Segmentation**
   - Automatically detects scene changes in your video
   - Uses content-based detection to identify cuts and transitions
   - Each scene shows start/end timestamps and frame numbers

2. **🎤 Audio Transcription**
   - Transcribes all speech/dialogue in the video
   - Uses OpenAI's Whisper model for accurate transcription
   - Provides word-level timestamps synced with video

3. **📦 Object Detection & Tracking**
   - Detects objects in every second of video
   - Uses YOLOv8 for real-time object recognition
   - Tracks people, vehicles, animals, and 80+ object classes
   - Shows confidence scores for each detection

4. **📊 Interactive Dashboard**
   - Click on scenes to jump to that moment in the video
   - Synchronized highlighting of active scenes and transcript
   - Visual progress bars showing scene progression
   - Beautiful 3D animated background

## How to Use

### Option 1: Upload a Video File

1. Open http://localhost:3000 in your browser
2. Click the **"Upload File"** tab (blue)
3. Either:
   - **Drag and drop** a video file into the upload area
   - **Click** the upload area to browse your files
4. Click **"Start Analysis"**
5. Wait while the video is analyzed (this may take several minutes)
6. View results in the interactive dashboard

### Option 2: Analyze from URL (for direct video links)

1. Open http://localhost:3000
2. Click the **"Video URL"** tab (purple)
3. Paste a direct video link (e.g., `.mp4` file URL)
4. Click **"Start Analysis"**
5. The video will be downloaded and analyzed

**Note:** YouTube URLs require `yt-dlp` to be properly configured. For best results, use **file uploads**.

## Understanding the Results

### 📹 Video Player
- Located at the top of the dashboard
- Standard HTML5 controls (play, pause, seek, volume)
- Shows the original uploaded video

### 🎬 Detected Scenes
- Grid of scene cards below the video
- **Active scene** is highlighted in blue with a glow effect
- Click any scene to jump to that timestamp
- Each card shows:
  - Scene number
  - Start and end times
  - Progress bar for current playback position

### 🎤 Transcript
- On the right side of the dashboard
- Scrollable list of all transcribed segments
- **Active segment** highlights as video plays
- Click any segment to jump to that timestamp
- Each segment shows:
  - Transcribed text
  - Start timestamp

### 📦 Detected Objects
- Bottom right panel
- Shows all unique objects detected throughout the video
- Examples: person, car, dog, chair, etc.
- Colored tags for easy viewing

## Technical Details

### Backend (FastAPI + Python)
- **Scene Detection**: PySceneDetect with ContentDetector
- **Transcription**: OpenAI Whisper (base model)
- **Object Detection**: YOLOv8 (nano model for speed)
- **Processing**: Analyzes 1 frame per second for objects
- **API**: REST API with endpoints for upload, status checking, results

### Frontend (Next.js + React + Three.js)
- **Framework**: Next.js 16 with App Router
- **UI**: Modern glassmorphism with gradient effects
- **3D Background**: Three.js with react-three-fiber
- **Real-time Updates**: Polls backend every 2 seconds during analysis

## Performance Notes

Analysis time depends on:
- **Video length**: Longer videos take more time
- **Video resolution**: Higher resolution = slower processing
- **Hardware**: GPU acceleration used if available (CUDA/MPS)

Typical processing time: **~1-3 minutes** for a 1-minute video

## Requirements

### Backend Requirements
```
- Python 3.8+
- ffmpeg (for video processing)
- Sufficient RAM (2GB+ recommended)
- Optional: CUDA GPU for faster processing
```

### Supported Video Formats
- MP4, AVI, MOV, MKV, WebM
- Most common codecs (H.264, H.265, VP9)

## Troubleshooting

### Upload Fails with 500 Error
- Check that backend is running on http://localhost:8000
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check console logs for specific error messages

### Analysis Takes Too Long
- Try a shorter video first (< 30 seconds)
- Reduce video resolution before uploading
- Check CPU/RAM usage - may need to close other apps

### No Transcript Generated
- Ensure video has audio
- Whisper works best with clear speech
- Background music may affect accuracy

### Poor Object Detection
- Higher quality video = better detection
- Some objects work better than others (people, cars work well)
- Objects must be clearly visible (not too small, blurry, or occluded)

## Example Use Cases

1. **Content Analysis**: Analyze YouTube videos or movies for scenes and dialogue
2. **Surveillance Footage**: Detect people and vehicles in security camera footage
3. **Sports Analysis**: Track players and objects in sports videos
4. **Education**: Transcribe lecture videos with timestamps
5. **Accessibility**: Generate transcripts for videos to improve accessibility

## API Endpoints

If you want to use the API directly:

### Upload Video
```bash
POST http://localhost:8000/upload
Content-Type: multipart/form-data
Body: file=<video_file>

Response: {"job_id": "uuid", "status": "queued"}
```

### Check Status
```bash
GET http://localhost:8000/analyze/{job_id}

Response: {
  "status": "processing" | "completed" | "failed",
  "results": {...}  // only if completed
}
```

### Get Results
```bash
GET http://localhost:8000/results/{job_id}

Response: {
  "scenes": [...],
  "transcript": [...],
  "objects": {...}
}
```

## Credits

Built with:
- **FastAPI** - Modern Python web framework
- **Whisper** - OpenAI's speech recognition
- **YOLOv8** - Ultralytics object detection
- **PySceneDetect** - Scene detection library
- **Next.js** - React framework
- **Three.js** - 3D graphics library

---

**Happy Analyzing!** 🎉
