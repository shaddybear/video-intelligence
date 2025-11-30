from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import shutil
import os
import uuid
import subprocess
from analyzer import VideoAnalyzer

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# In-memory job store (replace with DB in production)
jobs = {}

class VideoURLRequest(BaseModel):
    url: str

def process_video(job_id: str, file_path: str):
    try:
        jobs[job_id]["status"] = "processing"
        analyzer = VideoAnalyzer(file_path, output_dir=os.path.join(RESULTS_DIR, job_id))
        results = analyzer.analyze()
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["results"] = results
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        print(f"Job {job_id} failed: {e}")

@app.post("/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    jobs[job_id] = {"status": "queued", "filename": file.filename}
    background_tasks.add_task(process_video, job_id, file_path)
    
    return {"job_id": job_id, "status": "queued"}

@app.post("/upload-url")
async def upload_video_from_url(background_tasks: BackgroundTasks, request: VideoURLRequest):
    job_id = str(uuid.uuid4())
    
    try:
        print(f"Received video URL: {request.url}")
        
        # Simple filename for now
        output_filename = f"{job_id}_video.mp4"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        # Get the path to yt-dlp in the venv
        venv_ytdlp = os.path.join(os.path.dirname(__file__), "venv", "bin", "yt-dlp")
        
        # Check if yt-dlp is installed in venv
        if os.path.exists(venv_ytdlp):
            downloader = venv_ytdlp
            print(f"Using yt-dlp from venv: {downloader}")
        else:
            # Try system yt-dlp or youtube-dl
            try:
                subprocess.run(["yt-dlp", "--version"], check=True, capture_output=True)
                downloader = "yt-dlp"
            except FileNotFoundError:
                try:
                    subprocess.run(["youtube-dl", "--version"], check=True, capture_output=True)
                    downloader = "youtube-dl"
                except FileNotFoundError:
                    raise HTTPException(
                        status_code=500, 
                        detail="Neither yt-dlp nor youtube-dl is installed. Please install yt-dlp."
                    )
        
        print(f"Using downloader: {downloader}")
        
        # Download the video
        cmd = [
            downloader,
            "-f", "best[ext=mp4]/best",  # Prefer mp4 format
            "-o", output_path,
            "--no-playlist",  # Don't download playlists
            request.url
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode != 0:
            print(f"Download failed with error: {result.stderr}")
            raise HTTPException(
                status_code=400, 
                detail=f"Failed to download video: {result.stderr[:200]}"
            )
        
        # Check if file was downloaded
        if not os.path.exists(output_path):
            # Try to find any file with the job_id in case yt-dlp changed the extension
            downloaded_files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(job_id)]
            if downloaded_files:
                output_path = os.path.join(UPLOAD_DIR, downloaded_files[0])
                output_filename = downloaded_files[0]
            else:
                raise HTTPException(status_code=400, detail="Video file not found after download")
        
        print(f"Video downloaded successfully: {output_filename}")
        
        jobs[job_id] = {"status": "queued", "filename": output_filename}
        background_tasks.add_task(process_video, job_id, output_path)
        
        return {"job_id": job_id, "status": "queued"}
    
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Video download timeout. Please try a shorter video.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in upload_video_from_url: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@app.get("/analyze/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/results/{job_id}")
async def get_results(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    if jobs[job_id]["status"] != "completed":
        raise HTTPException(status_code=400, detail="Analysis not complete")
    return jobs[job_id]["results"]
