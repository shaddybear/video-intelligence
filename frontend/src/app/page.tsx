"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Upload, FileVideo, Loader2, Zap, Brain, Activity, Link2 } from "lucide-react";
import Background3D from "../components/Background3D";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVideoUrl(""); // Clear URL when file is selected
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    setFile(null); // Clear file when URL is entered
  };

  const handleUpload = async () => {
    if (!file && !videoUrl) return;

    setUploading(true);

    try {
      let response;

      if (file) {
        // Upload file
        const formData = new FormData();
        formData.append("file", file);
        response = await axios.post("http://localhost:8000/upload", formData);
      } else if (videoUrl) {
        // Upload from URL
        response = await axios.post("http://localhost:8000/upload-url", { url: videoUrl });
      }

      if (response) {
        const { job_id } = response.data;
        router.push(`/dashboard?job_id=${job_id}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please check your URL or file and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white p-6 relative overflow-hidden">
      <Background3D />

      <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Next-Gen Video Analysis</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-purple-500 to-amber-200">
              Video-to-Text
            </span>
            <br />
            <span className="text-white">Intelligence Engine</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Turn your videos into searchable data. Our AI analyzes every frame to detect scenes, transcribe dialogue, and identify actions—giving you a complete text understanding of your video content.
          </p>
        </div>

        {/* Upload Card */}
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === "upload"
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/25"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab("url")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === "url"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Link2 className="w-4 h-4" />
                  Video URL
                </button>
              </div>

              <div className="flex flex-col items-center gap-6">
                {activeTab === "upload" ? (
                  <label
                    htmlFor="video-upload"
                    className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-white/10 border-dashed rounded-xl cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all duration-300 group/upload"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {file ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                          <div className="p-4 rounded-full bg-orange-500/20 mb-3">
                            <FileVideo className="w-8 h-8 text-orange-400" />
                          </div>
                          <p className="text-sm font-medium text-white">{file.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center group-hover/upload:scale-105 transition-transform duration-300">
                          <div className="p-4 rounded-full bg-white/5 mb-3 group-hover/upload:bg-orange-500/20 transition-colors">
                            <Upload className="w-8 h-8 text-gray-400 group-hover/upload:text-orange-400 transition-colors" />
                          </div>
                          <p className="text-sm font-medium text-gray-300">Drop your video here</p>
                          <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="w-full h-48 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="p-4 rounded-full bg-purple-500/20">
                      <Link2 className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={handleUrlChange}
                        placeholder="https://youtube.com/watch?v=... or direct video URL"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Supports YouTube, Vimeo, and direct video links
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={(!file && !videoUrl) || uploading}
                  className="w-full group relative px-5 py-4 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 focus:ring-4 focus:outline-none focus:ring-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Video...
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
                        Start Analysis
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          {[
            { icon: Brain, title: "Deep Understanding", desc: "Our AI watches the video like a human, understanding context, actions, and emotions." },
            { icon: Activity, title: "Smart Segmentation", desc: "Automatically breaks down long videos into meaningful, searchable scenes." },
            { icon: Zap, title: "Instant Search", desc: "Find the exact moment a specific action or dialogue happened in seconds." },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
              <feature.icon className="w-8 h-8 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
