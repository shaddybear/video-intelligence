"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Play, Pause, Clock, User, Box, MessageSquare, ChevronRight, Activity, AlertCircle } from "lucide-react";
import Background3D from "../../components/Background3D";

interface Scene {
    index: number;
    start_time: number;
    end_time: number;
}

interface TranscriptSegment {
    id: number;
    start: number;
    end: number;
    text: string;
}

interface ObjectDetection {
    timestamp: number;
    confidence: number;
}

interface AnalysisResults {
    scenes: Scene[];
    transcript: TranscriptSegment[];
    objects: Record<string, ObjectDetection[]>;
}

export default function Dashboard() {
    const searchParams = useSearchParams();
    const jobId = searchParams.get("job_id");
    const [status, setStatus] = useState("loading");
    const [results, setResults] = useState<AnalysisResults | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [currentTime, setCurrentTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!jobId) return;

        const checkStatus = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/analyze/${jobId}`);
                const data = response.data;

                if (data.status === "completed") {
                    setStatus("completed");
                    setResults(data.results);
                    setVideoUrl(`http://localhost:8000/uploads/${data.filename}`);
                } else if (data.status === "failed") {
                    setStatus("failed");
                } else {
                    // Keep polling
                    setTimeout(checkStatus, 2000);
                }
            } catch (error) {
                console.error("Error fetching status:", error);
                setStatus("error");
            }
        };

        checkStatus();
    }, [jobId]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const jumpToTime = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            videoRef.current.play();
        }
    };

    if (status === "loading" || status === "queued" || status === "processing") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden">
                <Background3D />
                <div className="z-10 text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                        <div className="relative animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                        Analyzing Video...
                    </h2>
                    <p className="text-gray-400">Extracting scenes, dialogue, and objects.</p>
                </div>
            </div>
        );
    }

    if (status === "failed" || status === "error") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden">
                <Background3D />
                <div className="z-10 text-center p-8 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Analysis Failed</h2>
                    <p className="text-gray-400">Something went wrong. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
            <Background3D />

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                <header className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                            Analysis Results
                        </h1>
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                        JOB ID: {jobId?.slice(0, 8)}...
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                    {/* Left Column: Video & Scenes */}
                    <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                        <div className="relative aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                            {videoUrl && (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="w-full h-full object-contain"
                                    controls
                                    onTimeUpdate={handleTimeUpdate}
                                />
                            )}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 overflow-y-auto backdrop-blur-xl">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-300">
                                <Clock className="w-5 h-5" /> Detected Scenes
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {results?.scenes.map((scene) => (
                                    <button
                                        key={scene.index}
                                        onClick={() => jumpToTime(scene.start_time)}
                                        className={`group relative p-4 rounded-xl text-left text-sm transition-all duration-300 border ${currentTime >= scene.start_time && currentTime < scene.end_time
                                            ? "bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`font-medium ${currentTime >= scene.start_time && currentTime < scene.end_time
                                                ? "text-blue-300"
                                                : "text-gray-300 group-hover:text-white"
                                                }`}>
                                                Scene {scene.index + 1}
                                            </span>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${currentTime >= scene.start_time && currentTime < scene.end_time
                                                ? "text-blue-400 rotate-90"
                                                : "text-gray-600 group-hover:text-gray-400"
                                                }`} />
                                        </div>
                                        <div className="w-full bg-gray-700/50 h-1 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-300"
                                                style={{
                                                    width: currentTime >= scene.start_time && currentTime < scene.end_time
                                                        ? `${Math.min(100, ((currentTime - scene.start_time) / (scene.end_time - scene.start_time)) * 100)}%`
                                                        : '0%'
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2 block font-mono">
                                            {scene.start_time.toFixed(1)}s - {scene.end_time.toFixed(1)}s
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Transcript & Objects */}
                    <div className="flex flex-col gap-6 h-full overflow-hidden">
                        {/* Transcript */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col overflow-hidden backdrop-blur-xl">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-300">
                                <MessageSquare className="w-5 h-5" /> Transcript
                            </h3>
                            <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {results?.transcript.map((segment) => (
                                    <div
                                        key={segment.id}
                                        onClick={() => jumpToTime(segment.start)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${currentTime >= segment.start && currentTime < segment.end
                                            ? "bg-green-500/10 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                                            : "bg-transparent border-transparent hover:bg-white/5"
                                            }`}
                                    >
                                        <p className={`text-sm leading-relaxed ${currentTime >= segment.start && currentTime < segment.end
                                            ? "text-green-100"
                                            : "text-gray-300"
                                            }`}>{segment.text}</p>
                                        <span className="text-xs text-gray-600 mt-2 block font-mono">
                                            {segment.start.toFixed(1)}s
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Objects */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-1/3 overflow-y-auto backdrop-blur-xl">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-300">
                                <Box className="w-5 h-5" /> Detected Objects
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {results?.objects && Object.keys(results.objects).map((objName) => (
                                    <span
                                        key={objName}
                                        className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-sm hover:bg-purple-500/20 transition-colors cursor-default"
                                    >
                                        {objName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
